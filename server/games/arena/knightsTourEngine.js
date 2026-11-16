// Server Game Engine for ARENA: KNIGHT'S TOUR
// Chess knight traversal, Warnsdorff's heuristic & duel survival

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

export function getValidKnightMoves(row, col, boardSize, visited) {
  const valid = [];
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
      if (!visited[nr][nc]) {
        valid.push({ row: nr, col: nc });
      }
    }
  }
  return valid;
}

export class KnightsTourEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_chess_seokjin',
        name: '🤖 Seok-jin (IA)',
        color: 'purple',
        avatar: '🎭',
        isBot: true,
        score: 0,
      });
    }

    this.boardSize = settings.boardSize || 5; // 5x5
    this.visited = Array.from({ length: this.boardSize }, () =>
      Array(this.boardSize).fill(false)
    );

    // Position initiale du Cavalier
    this.currentPosition = { row: 0, col: 0 };
    this.visited[0][0] = true;

    this.moveHistory = [
      { row: 0, col: 0, stepNumber: 1, playerId: 'init' }
    ];

    this.turnIndex = 0;
    this.phase = 'playing'; // 'playing' | 'ended'
    this.winnerId = null;

    this.broadcast();
    this.checkBotTurn();
  }

  get activePlayer() {
    return this.players[this.turnIndex % this.players.length];
  }

  get validMoves() {
    if (!this.currentPosition) return [];
    return getValidKnightMoves(
      this.currentPosition.row,
      this.currentPosition.col,
      this.boardSize,
      this.visited
    );
  }

  handleAction(player, action, payload = {}) {
    if (this.phase !== 'playing') return;
    if (player.id !== this.activePlayer.id) return;

    if (action === 'move_knight') {
      const { row, col } = payload;
      const r = Number(row);
      const c = Number(col);

      const isValid = this.validMoves.some(m => m.row === r && m.col === c);
      if (!isValid) return;

      this.visited[r][c] = true;
      this.currentPosition = { row: r, col: c };
      this.moveHistory.push({
        row: r,
        col: c,
        stepNumber: this.moveHistory.length + 1,
        playerId: player.id,
      });
      player.score += 10;

      // Vérifier si le prochain joueur est bloqué
      this.turnIndex++;
      const nextMoves = this.validMoves;
      if (nextMoves.length === 0) {
        // Le prochain joueur est piégé ! Le joueur actuel l'emporte
        this.winnerId = player.id;
        player.score += 150;
        this.phase = 'ended';
        this.broadcast();
        if (typeof this.onGameOver === 'function') {
          this.onGameOver(this.winnerId);
        }
        return;
      }

      this.broadcast();
      this.checkBotTurn();
    }
  }

  checkBotTurn() {
    if (this.phase !== 'playing') return;
    const current = this.activePlayer;
    if (current && current.isBot) {
      setTimeout(() => {
        const moves = this.validMoves;
        if (moves.length === 0) return;

        // Règle de Warnsdorff : choisir le coup ayant le minimum d'issues futures
        let bestMove = moves[0];
        let minExits = Infinity;

        for (const m of moves) {
          // Créer copie temporaire
          const exits = getValidKnightMoves(m.row, m.col, this.boardSize, this.visited).length;
          if (exits < minExits) {
            minExits = exits;
            bestMove = m;
          }
        }

        this.handleAction(current, 'move_knight', { row: bestMove.row, col: bestMove.col });
      }, 1500);
    }
  }

  getState() {
    return {
      boardSize: this.boardSize,
      visited: this.visited,
      currentPosition: this.currentPosition,
      moveHistory: this.moveHistory,
      turnPlayerId: this.activePlayer?.id,
      turnPlayerName: this.activePlayer?.name,
      validMoves: this.validMoves,
      phase: this.phase,
      winnerId: this.winnerId,
    };
  }

  getPublicState() {
    return {
      arenaGameId: 'knights_tour',
      ...this.getState(),
    };
  }

  getPrivateState() {
    return {};
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {}
}
