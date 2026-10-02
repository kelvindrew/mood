// Naval Battle (Bataille Navale Live) Server Engine
// 8x8 tactical naval warfare with secret fleet placement, missile radar strikes, hits, misses and sunk detection

const GRID_SIZE = 8; // 8x8 grid (A-H, 1-8)

export const DEFAULT_SHIPS = [
  { id: 'carrier', name: 'Porte-avions', size: 4, icon: '🚢' },
  { id: 'cruiser', name: 'Croiseur', size: 3, icon: '🛥️' },
  { id: 'destroyer', name: 'Torpilleur', size: 2, icon: '🚤' },
  { id: 'submarine', name: 'Sous-marin', size: 2, icon: '⚓' },
];

export class NavalBattleEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.rawPlayers = players || [];
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Minimum 2 admirals: add bot commander if solo
    const safePlayers = [...this.rawPlayers];
    if (safePlayers.length === 1) {
      safePlayers.push({
        id: 'bot_admiral',
        name: '🤖 Amiral Jarvis',
        avatar: '⚓',
        color: 'red',
        isBot: true,
      });
    }

    // Keep primary 2 admirals (duel)
    this.p1 = {
      id: safePlayers[0].id,
      name: safePlayers[0].name || 'Amiral 1',
      color: safePlayers[0].color || 'blue',
      avatar: safePlayers[0].avatar || '🚢',
      isBot: Boolean(safePlayers[0].isBot),
      ships: [], // [{ id, name, size, coordinates: ['A1', 'A2', ...], hits: [] }]
      ready: false,
      shotsReceived: {}, // 'A1': 'hit' | 'miss'
      score: 0,
    };

    this.p2 = {
      id: safePlayers[1].id,
      name: safePlayers[1].name || 'Amiral 2',
      color: safePlayers[1].color || 'red',
      avatar: safePlayers[1].avatar || '⚓',
      isBot: Boolean(safePlayers[1].isBot),
      ships: [],
      ready: false,
      shotsReceived: {},
      score: 0,
    };

    this.phase = 'placement'; // 'placement' | 'battle' | 'gameover'
    this.turnPlayerId = this.p1.id;
    this.lastShot = null; // { attackerId, coord, result: 'hit' | 'miss' | 'sunk', shipName?: string }
    this.isGameOver = false;
    this.finalPodium = null;
    this.botTimer = null;

    // Auto-place bot fleet immediately if p2 is bot
    if (this.p2.isBot) {
      this.p2.ships = this.generateRandomFleet();
      this.p2.ready = true;
    }
    if (this.p1.isBot) {
      this.p1.ships = this.generateRandomFleet();
      this.p1.ready = true;
    }

    this.emitState();
  }

  generateRandomFleet() {
    const fleet = [];
    const occupied = new Set();

    for (const shipDef of DEFAULT_SHIPS) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 200) {
        attempts++;
        const isHorizontal = Math.random() > 0.5;
        const maxRow = isHorizontal ? GRID_SIZE : GRID_SIZE - shipDef.size + 1;
        const maxCol = isHorizontal ? GRID_SIZE - shipDef.size + 1 : GRID_SIZE;

        const row = Math.floor(Math.random() * maxRow);
        const col = Math.floor(Math.random() * maxCol);

        const coords = [];
        let collision = false;

        for (let i = 0; i < shipDef.size; i++) {
          const r = isHorizontal ? row : row + i;
          const c = isHorizontal ? col + i : col;
          const coord = `${String.fromCharCode(65 + r)}${c + 1}`;

          if (occupied.has(coord)) {
            collision = true;
            break;
          }
          coords.push(coord);
        }

        if (!collision) {
          coords.forEach((c) => occupied.add(c));
          fleet.push({
            id: shipDef.id,
            name: shipDef.name,
            size: shipDef.size,
            coordinates: coords,
            hits: [],
          });
          placed = true;
        }
      }
    }

    return fleet;
  }

  handleFleetPlacement(playerId, ships) {
    if (this.phase !== 'placement') return { success: false, error: 'Placement déjà terminé !' };

    const player = this.p1.id === playerId ? this.p1 : this.p2.id === playerId ? this.p2 : null;
    if (!player) return { success: false, error: 'Joueur non trouvé !' };

    // Validate ships
    if (!Array.isArray(ships) || ships.length !== DEFAULT_SHIPS.length) {
      return { success: false, error: 'Flotte incomplète !' };
    }

    player.ships = ships.map((s) => ({
      id: s.id,
      name: s.name,
      size: s.size,
      coordinates: s.coordinates,
      hits: [],
    }));
    player.ready = true;

    // If both ready, start battle
    if (this.p1.ready && this.p2.ready) {
      this.phase = 'battle';
      this.turnPlayerId = this.p1.id;
    }

    this.emitState();
    return { success: true };
  }

  handleAutoPlacement(playerId) {
    const player = this.p1.id === playerId ? this.p1 : this.p2.id === playerId ? this.p2 : null;
    if (!player) return { success: false, error: 'Joueur non trouvé !' };

    const fleet = this.generateRandomFleet();
    return this.handleFleetPlacement(playerId, fleet);
  }

  fireShot(attackerId, coordinate) {
    if (this.phase !== 'battle' || this.isGameOver) {
      return { success: false, error: 'Ce n’est pas le moment de tirer !' };
    }

    if (this.turnPlayerId !== attackerId) {
      return { success: false, error: 'Ce n’est pas ton tour de tir !' };
    }

    const defender = attackerId === this.p1.id ? this.p2 : this.p1;
    const attacker = attackerId === this.p1.id ? this.p1 : this.p2;

    const coord = coordinate.toUpperCase().trim();
    if (!/^[A-H][1-8]$/.test(coord)) {
      return { success: false, error: 'Coordonnées invalides !' };
    }

    if (defender.shotsReceived[coord]) {
      return { success: false, error: 'Tu as déjà tiré sur cette case !' };
    }

    // Check hit
    let hitShip = null;
    for (const ship of defender.ships) {
      if (ship.coordinates.includes(coord)) {
        hitShip = ship;
        break;
      }
    }

    let result;
    let sunkShipName = null;

    if (hitShip) {
      hitShip.hits.push(coord);
      defender.shotsReceived[coord] = 'hit';
      attacker.score += 150;

      // Check if sunk
      if (hitShip.hits.length === hitShip.size) {
        result = 'sunk';
        sunkShipName = hitShip.name;
        attacker.score += 300;
      } else {
        result = 'hit';
      }
    } else {
      defender.shotsReceived[coord] = 'miss';
      result = 'miss';
    }

    this.lastShot = {
      attackerId,
      attackerName: attacker.name,
      coord,
      result,
      sunkShipName,
    };

    // Check game over
    const allSunk = defender.ships.every((s) => s.hits.length === s.size);
    if (allSunk) {
      this.endGame(attacker.id);
      return { success: true, result, sunkShipName };
    }

    // Change turn if miss or keep turn if hit (classic rule gives flow)
    // In party mode: pass turn on every shot so both players alternate quickly
    this.turnPlayerId = defender.id;

    this.emitState();

    // Trigger bot shot if it's bot's turn
    if (defender.isBot && !this.isGameOver) {
      this.scheduleBotShot(defender);
    }

    return { success: true, result, sunkShipName };
  }

  scheduleBotShot(botPlayer) {
    if (this.botTimer) clearTimeout(this.botTimer);

    this.botTimer = setTimeout(() => {
      if (this.phase !== 'battle' || this.turnPlayerId !== botPlayer.id || this.isGameOver) return;

      const defender = botPlayer.id === this.p1.id ? this.p2 : this.p1;
      const targetCoord = this.pickSmartBotShot(defender);

      if (targetCoord) {
        this.fireShot(botPlayer.id, targetCoord);
      }
    }, 2200);
  }

  pickSmartBotShot(defender) {
    // 1. Look for uncompleted hit ships (hunting mode)
    const hitsWithoutSunk = [];
    for (const ship of defender.ships) {
      if (ship.hits.length > 0 && ship.hits.length < ship.size) {
        hitsWithoutSunk.push(...ship.hits);
      }
    }

    // If hits exist, check adjacent cells
    if (hitsWithoutSunk.length > 0) {
      for (const hit of hitsWithoutSunk) {
        const row = hit.charCodeAt(0) - 65;
        const col = parseInt(hit[1], 10) - 1;

        const deltas = [
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (const [dr, dc] of deltas) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            const candidate = `${String.fromCharCode(65 + nr)}${nc + 1}`;
            if (!defender.shotsReceived[candidate]) {
              return candidate;
            }
          }
        }
      }
    }

    // 2. Parity / random hunt
    const available = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const coord = `${String.fromCharCode(65 + r)}${c + 1}`;
        if (!defender.shotsReceived[coord]) {
          available.push(coord);
        }
      }
    }

    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  endGame(winnerId) {
    if (this.botTimer) clearTimeout(this.botTimer);
    this.isGameOver = true;
    this.phase = 'gameover';

    const winner = this.p1.id === winnerId ? this.p1 : this.p2;
    const loser = this.p1.id === winnerId ? this.p2 : this.p1;

    this.finalPodium = [
      {
        id: winner.id,
        name: winner.name,
        avatar: winner.avatar,
        color: winner.color,
        score: winner.score + 500,
        rank: 1,
        isWinner: true,
      },
      {
        id: loser.id,
        name: loser.name,
        avatar: loser.avatar,
        color: loser.color,
        score: loser.score,
        rank: 2,
        isWinner: false,
      },
    ];

    this.emitState();

    if (this.onGameOver) {
      this.onGameOver(this.finalPodium);
    }
  }

  handleAction(action, payload = {}, socketId = null, playerId = null) {
    const effectivePlayerId = playerId || socketId;

    switch (action) {
      case 'nb_place_fleet':
        return this.handleFleetPlacement(effectivePlayerId, payload.ships);
      case 'nb_auto_place':
        return this.handleAutoPlacement(effectivePlayerId);
      case 'nb_fire':
        return this.fireShot(effectivePlayerId, payload.coord || '');
      default:
        return { success: false, error: `Action inconnue: ${action}` };
    }
  }

  destroy() {
    if (this.botTimer) clearTimeout(this.botTimer);
  }

  // Sanitized view: opponent ships are NEVER revealed in public state (C1 privacy protection)
  getState(targetPlayerId = null) {
    const isP1 = targetPlayerId === this.p1.id;
    const isP2 = targetPlayerId === this.p2.id;

    // Public view: hits and misses on both grids, but no secret ship coordinates!
    return {
      gameId: 'naval_battle',
      phase: this.phase,
      turnPlayerId: this.turnPlayerId,
      turnPlayerName: this.turnPlayerId === this.p1.id ? this.p1.name : this.p2.name,
      lastShot: this.lastShot,
      isGameOver: this.isGameOver,
      finalPodium: this.finalPodium,
      p1: {
        id: this.p1.id,
        name: this.p1.name,
        avatar: this.p1.avatar,
        color: this.p1.color,
        ready: this.p1.ready,
        score: this.p1.score,
        shotsReceived: this.p1.shotsReceived,
        sunkShips: this.p1.ships.filter((s) => s.hits.length === s.size).map((s) => s.name),
        // Reveal private ships ONLY to p1
        ships: isP1 || this.isGameOver ? this.p1.ships : undefined,
      },
      p2: {
        id: this.p2.id,
        name: this.p2.name,
        avatar: this.p2.avatar,
        color: this.p2.color,
        ready: this.p2.ready,
        score: this.p2.score,
        shotsReceived: this.p2.shotsReceived,
        sunkShips: this.p2.ships.filter((s) => s.hits.length === s.size).map((s) => s.name),
        // Reveal private ships ONLY to p2
        ships: isP2 || this.isGameOver ? this.p2.ships : undefined,
      },
      // Controller convenience
      myRole: isP1 ? 'p1' : isP2 ? 'p2' : 'spectator',
      isMyTurn: (isP1 && this.turnPlayerId === this.p1.id) || (isP2 && this.turnPlayerId === this.p2.id),
    };
  }

  // C1 — État PUBLIC : aucun placement de navire secret n'est diffusé publiquement
  getPublicState() {
    return this.getState(null);
  }

  // C1 — Fragment PRIVÉ : chaque joueur ne reçoit que l'état détaillé avec ses propres navires
  getPrivateState(playerId) {
    const isP1 = playerId === this.p1.id;
    const isP2 = playerId === this.p2.id;
    if (!isP1 && !isP2) return null;
    return {
      p1: {
        ...this.p1,
        ships: isP1 || this.isGameOver ? this.p1.ships : undefined,
      },
      p2: {
        ...this.p2,
        ships: isP2 || this.isGameOver ? this.p2.ships : undefined,
      },
      myRole: isP1 ? 'p1' : 'p2',
      isMyTurn: (isP1 && this.turnPlayerId === this.p1.id) || (isP2 && this.turnPlayerId === this.p2.id),
    };
  }

  emitState() {
    if (this.onStateChange) {
      this.onStateChange(this.getPublicState());
    }
  }
}
