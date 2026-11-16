// Server Game Engine for ARENA: NINE MEN'S MORRIS (JEU DU MOULIN)
// Classic strategy, 24 intersections, 16 mills, placement, movement, and flying

export const MORRIS_ADJACENCY = {
  0: [1, 7],
  1: [0, 2, 9],
  2: [1, 3],
  3: [2, 4, 11],
  4: [3, 5],
  5: [4, 6, 13],
  6: [5, 7],
  7: [6, 0, 15],

  8: [9, 15],
  9: [8, 10, 1, 17],
  10: [9, 11],
  11: [10, 12, 3, 19],
  12: [11, 13],
  13: [12, 14, 5, 21],
  14: [13, 15],
  15: [14, 8, 7, 23],

  16: [17, 23],
  17: [16, 18, 9],
  18: [17, 19],
  19: [18, 20, 11],
  20: [19, 21],
  21: [20, 22, 13],
  22: [21, 23],
  23: [22, 16, 15],
};

export const MORRIS_MILLS = [
  // Carré extérieur
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Carré intermédiaire
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Carré intérieur
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Lignes transversales
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

export function isPartOfMill(pointIndex, board, color) {
  if (!board[pointIndex] || board[pointIndex] !== color) return false;
  return MORRIS_MILLS.some(mill =>
    mill.includes(pointIndex) && mill.every(p => board[p] === color)
  );
}

export class NineMensMorrisEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_morris_master',
        name: '🤖 Guillaume (IA)',
        color: 'cyan',
        avatar: '👑',
        isBot: true,
        score: 0,
      });
    }

    this.board = Array(24).fill(null); // 24 intersections (null | 'white' | 'black')
    this.colors = {
      [this.players[0].id]: 'white',
      [this.players[1].id]: 'black',
    };

    this.piecesToPlace = { white: 9, black: 9 };
    this.piecesOnBoard = { white: 0, black: 0 };
    this.turnColor = 'white'; // Les Blancs commencent
    this.phase = 'placement'; // 'placement' | 'movement' | 'flying' | 'ended'
    this.mustRemovePiece = false;
    this.winnerColor = null;
    this.winnerId = null;

    this.broadcast();
    this.checkBotTurn();
  }

  get activePlayer() {
    const activeId = Object.keys(this.colors).find(id => this.colors[id] === this.turnColor);
    return this.players.find(p => p.id === activeId) || this.players[0];
  }

  get opponentColor() {
    return this.turnColor === 'white' ? 'black' : 'white';
  }

  handleAction(player, action, payload = {}) {
    if (this.phase === 'ended') return;
    if (this.colors[player.id] !== this.turnColor) return;

    if (this.mustRemovePiece) {
      if (action === 'remove_piece') {
        const point = Number(payload.pointIndex);
        if (isNaN(point) || point < 0 || point >= 24) return;
        if (this.board[point] !== this.opponentColor) return;

        // Règle : impossible de retirer un pion dans un moulin sauf si TOUS les pions adverses sont en moulin
        const inMill = isPartOfMill(point, this.board, this.opponentColor);
        const allInMills = this.board.every((color, idx) =>
          color !== this.opponentColor || isPartOfMill(idx, this.board, this.opponentColor)
        );

        if (inMill && !allInMills) return;

        // Retrait validé
        this.board[point] = null;
        this.piecesOnBoard[this.opponentColor]--;
        this.mustRemovePiece = false;
        player.score += 30;

        // Vérification de défaite adverse
        if (this.piecesToPlace[this.opponentColor] === 0 && this.piecesOnBoard[this.opponentColor] < 3) {
          this.endGame(this.turnColor);
          return;
        }

        this.passTurn();
      }
      return;
    }

    if (action === 'place_piece') {
      if (this.piecesToPlace[this.turnColor] <= 0) return;
      const point = Number(payload.pointIndex);
      if (isNaN(point) || point < 0 || point >= 24 || this.board[point] !== null) return;

      this.board[point] = this.turnColor;
      this.piecesToPlace[this.turnColor]--;
      this.piecesOnBoard[this.turnColor]++;

      // Vérifier si un nouveau moulin est formé
      if (isPartOfMill(point, this.board, this.turnColor)) {
        this.mustRemovePiece = true;
        this.broadcast();
        this.checkBotTurn();
        return;
      }

      this.passTurn();
    } else if (action === 'move_piece') {
      const { fromIndex, toIndex } = payload;
      const from = Number(fromIndex);
      const to = Number(toIndex);

      if (this.piecesToPlace[this.turnColor] > 0) return; // Encore en phase de placement
      if (this.board[from] !== this.turnColor || this.board[to] !== null) return;

      // Vol libre (Flying) si le joueur n'a plus que 3 pions
      const isFlying = this.piecesOnBoard[this.turnColor] === 3;
      if (!isFlying && !MORRIS_ADJACENCY[from].includes(to)) {
        return; // Mouvement non adjacent interdit
      }

      this.board[from] = null;
      this.board[to] = this.turnColor;

      // Vérifier moulin
      if (isPartOfMill(to, this.board, this.turnColor)) {
        this.mustRemovePiece = true;
        this.broadcast();
        this.checkBotTurn();
        return;
      }

      this.passTurn();
    }
  }

  passTurn() {
    this.turnColor = this.opponentColor;

    // Mise à jour de la phase
    const totalToPlace = this.piecesToPlace.white + this.piecesToPlace.black;
    if (totalToPlace === 0) {
      this.phase = this.piecesOnBoard[this.turnColor] === 3 ? 'flying' : 'movement';
    }

    // Vérifier si le joueur actif est bloqué sans aucun coup possible
    if (totalToPlace === 0 && !this.hasLegalMoves(this.turnColor)) {
      this.endGame(this.opponentColor);
      return;
    }

    this.broadcast();
    this.checkBotTurn();
  }

  hasLegalMoves(color) {
    if (this.piecesOnBoard[color] === 3) return true; // Vol libre = n'importe quel point vide
    for (let i = 0; i < 24; i++) {
      if (this.board[i] === color) {
        if (MORRIS_ADJACENCY[i].some(adj => this.board[adj] === null)) {
          return true;
        }
      }
    }
    return false;
  }

  checkBotTurn() {
    if (this.phase === 'ended') return;
    const current = this.activePlayer;
    if (current && current.isBot) {
      setTimeout(() => {
        if (this.mustRemovePiece) {
          // Choix d'un pion adverse à éliminer
          const targetPoints = [];
          for (let i = 0; i < 24; i++) {
            if (this.board[i] === this.opponentColor) {
              const inMill = isPartOfMill(i, this.board, this.opponentColor);
              if (!inMill) targetPoints.push(i);
            }
          }
          const chosen = targetPoints.length > 0 ? targetPoints[0] : this.board.indexOf(this.opponentColor);
          if (chosen !== -1) {
            this.handleAction(current, 'remove_piece', { pointIndex: chosen });
          }
          return;
        }

        if (this.piecesToPlace[this.turnColor] > 0) {
          // Phase de pose : chercher un point libre qui crée un moulin ou empêche un moulin adverse
          const empty = [];
          for (let i = 0; i < 24; i++) if (this.board[i] === null) empty.push(i);

          let bestPoint = empty[0];
          for (const p of empty) {
            this.board[p] = this.turnColor;
            if (isPartOfMill(p, this.board, this.turnColor)) {
              bestPoint = p;
              this.board[p] = null;
              break;
            }
            this.board[p] = null;
          }

          this.handleAction(current, 'place_piece', { pointIndex: bestPoint });
        } else {
          // Phase de mouvement
          const myPieces = [];
          for (let i = 0; i < 24; i++) if (this.board[i] === this.turnColor) myPieces.push(i);

          for (const from of myPieces) {
            const dests = this.piecesOnBoard[this.turnColor] === 3
              ? this.board.map((v, i) => v === null ? i : -1).filter(i => i !== -1)
              : MORRIS_ADJACENCY[from].filter(adj => this.board[adj] === null);

            if (dests.length > 0) {
              this.handleAction(current, 'move_piece', { fromIndex: from, toIndex: dests[0] });
              return;
            }
          }
        }
      }, 1500);
    }
  }

  endGame(winningColor) {
    this.phase = 'ended';
    this.winnerColor = winningColor;
    const winnerPlayerId = Object.keys(this.colors).find(id => this.colors[id] === winningColor);
    this.winnerId = winnerPlayerId;

    const winner = this.players.find(p => p.id === winnerPlayerId);
    if (winner) winner.score += 250;

    this.broadcast();
    if (typeof this.onGameOver === 'function') {
      this.onGameOver(this.winnerId);
    }
  }

  getState() {
    return {
      board: this.board,
      turnColor: this.turnColor,
      turnPlayerId: this.activePlayer?.id,
      turnPlayerName: this.activePlayer?.name,
      piecesToPlace: this.piecesToPlace,
      piecesOnBoard: this.piecesOnBoard,
      phase: this.phase,
      mustRemovePiece: this.mustRemovePiece,
      winnerColor: this.winnerColor,
      winnerId: this.winnerId,
    };
  }

  getPublicState() {
    return {
      arenaGameId: 'nine_mens_morris',
      ...this.getState(),
    };
  }

  getPrivateState(playerId) {
    return {
      myMorrisColor: this.colors[playerId],
    };
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {}
}
