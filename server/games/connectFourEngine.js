// Puissance 4 Deluxe (Connect Four) Server Engine
// 7 columns x 6 rows tactical grid with gravity chip drop, win detection & smart AI bot

const COLS = 7;
const ROWS = 6;

export class ConnectFourEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.rawPlayers = players || [];
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Minimum 2 players: add virtual bot if solo
    const safePlayers = [...this.rawPlayers];
    if (safePlayers.length === 1) {
      safePlayers.push({
        id: 'bot_connect4',
        name: '🤖 Robo-Connect',
        avatar: '🤖',
        color: 'yellow',
        isBot: true,
      });
    } else if (safePlayers.length >= 2) {
      // If player 0 is bot and player 1 is human, swap them so human is p1 and starts first
      if (safePlayers[0].isBot && !safePlayers[1].isBot) {
        const temp = safePlayers[0];
        safePlayers[0] = safePlayers[1];
        safePlayers[1] = temp;
      }
    }

    this.p1 = {
      id: safePlayers[0].id,
      name: safePlayers[0].name || 'Joueur 1',
      avatar: safePlayers[0].avatar || '🔴',
      color: 'red',
      chipColor: 'red',
      isBot: Boolean(safePlayers[0].isBot),
      score: 0,
      roundsWon: 0,
    };

    this.p2 = {
      id: safePlayers[1].id,
      name: safePlayers[1].name || 'Joueur 2',
      avatar: safePlayers[1].avatar || '🟡',
      color: 'yellow',
      chipColor: 'yellow',
      isBot: Boolean(safePlayers[1].isBot),
      score: 0,
      roundsWon: 0,
    };

    this.targetWins = Math.max(1, Math.min(3, Number(settings.targetWins) || 2)); // Best of 3 (first to 2)
    this.roundNumber = 1;
    this.currentTurnPlayerId = this.p1.id;
    this.phase = 'playing'; // 'playing' | 'round_over' | 'gameover'
    this.board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null)); // board[row][col], row 0 is top, row 5 is bottom
    this.winningCells = null; // [[r, c], ...]
    this.lastDrop = null; // { col, row, playerChip }
    this.isGameOver = false;
    this.finalPodium = null;
    this.botTimer = null;
    this.roundResetTimer = null;

    this.emitState();

    if (this.p1.isBot) {
      this.scheduleBotMove();
    }
  }

  getActivePlayer() {
    return this.currentTurnPlayerId === this.p1.id ? this.p1 : this.p2;
  }

  getOpponent(player) {
    return player.id === this.p1.id ? this.p2 : this.p1;
  }

  dropChip(playerId, colIndex) {
    if (this.phase !== 'playing' || this.isGameOver) {
      return { success: false, error: 'Ce n’est pas le moment de jouer !' };
    }

    if (this.currentTurnPlayerId !== playerId) {
      return { success: false, error: 'Ce n’est pas ton tour !' };
    }

    const col = parseInt(colIndex, 10);
    if (isNaN(col) || col < 0 || col >= COLS) {
      return { success: false, error: 'Colonne invalide !' };
    }

    // Find lowest available row in column (from bottom row 5 up to row 0)
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!this.board[r][col]) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, error: 'Cette colonne est déjà pleine !' };
    }

    const activePlayer = this.getActivePlayer();
    const chipColor = activePlayer.chipColor;
    this.board[targetRow][col] = chipColor;

    this.lastDrop = {
      col,
      row: targetRow,
      playerChip: chipColor,
      playerName: activePlayer.name,
    };

    // Check for win
    const winningLine = this.checkWin(targetRow, col, chipColor);
    if (winningLine) {
      this.winningCells = winningLine;
      activePlayer.roundsWon += 1;
      activePlayer.score += 300;

      if (activePlayer.roundsWon >= this.targetWins) {
        this.endGame(activePlayer.id);
        return { success: true, isWin: true, isGameOver: true };
      }

      this.phase = 'round_over';
      this.emitState();

      // Pause 3 seconds, then start next round
      this.roundResetTimer = setTimeout(() => {
        if (this.isGameOver) return;
        this.startNextRound();
      }, 3000);

      return { success: true, isWin: true, isGameOver: false };
    }

    // Check for draw (full board)
    const isFull = this.board.every((row) => row.every((cell) => cell !== null));
    if (isFull) {
      this.phase = 'round_over';
      this.emitState();

      this.roundResetTimer = setTimeout(() => {
        if (this.isGameOver) return;
        this.startNextRound();
      }, 3000);

      return { success: true, isDraw: true };
    }

    // Switch turn
    this.currentTurnPlayerId = this.getOpponent(activePlayer).id;
    this.emitState();

    // Check if next is bot
    const nextPlayer = this.getActivePlayer();
    if (nextPlayer.isBot && !this.isGameOver) {
      this.scheduleBotMove();
    }

    return { success: true, row: targetRow, col };
  }

  checkWin(lastRow, lastCol, chip) {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal \
      [1, -1],  // diagonal /
    ];

    for (const [dr, dc] of directions) {
      const line = [[lastRow, lastCol]];

      // Check positive direction
      let r = lastRow + dr;
      let c = lastCol + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && this.board[r][c] === chip) {
        line.push([r, c]);
        r += dr;
        c += dc;
      }

      // Check negative direction
      r = lastRow - dr;
      c = lastCol - dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && this.board[r][c] === chip) {
        line.push([r, c]);
        r -= dr;
        c -= dc;
      }

      if (line.length >= 4) {
        return line;
      }
    }

    return null;
  }

  scheduleBotMove() {
    if (this.botTimer) clearTimeout(this.botTimer);

    this.botTimer = setTimeout(() => {
      if (this.phase !== 'playing' || !this.getActivePlayer().isBot || this.isGameOver) return;

      const activePlayer = this.getActivePlayer();
      const bestCol = this.findSmartBotCol(activePlayer.chipColor);

      if (bestCol !== null) {
        this.dropChip(activePlayer.id, bestCol);
      }
    }, 600 + Math.random() * 400);
  }

  findSmartBotCol(myChip) {
    const oppChip = myChip === 'red' ? 'yellow' : 'red';
    const validCols = [];

    for (let c = 0; c < COLS; c++) {
      if (!this.board[0][c]) {
        validCols.push(c);
      }
    }

    if (validCols.length === 0) return null;

    // 1. Check if bot can win immediately in 1 move
    for (const col of validCols) {
      const row = this.getLowestRow(col);
      this.board[row][col] = myChip;
      const win = this.checkWin(row, col, myChip);
      this.board[row][col] = null;
      if (win) return col;
    }

    // 2. Check if opponent can win next turn and block them!
    for (const col of validCols) {
      const row = this.getLowestRow(col);
      this.board[row][col] = oppChip;
      const block = this.checkWin(row, col, oppChip);
      this.board[row][col] = null;
      if (block) return col;
    }

    // 3. Prefer central columns (col 3, then 2 or 4) for strategic dominance
    const preference = [3, 2, 4, 1, 5, 0, 6];
    for (const p of preference) {
      if (validCols.includes(p)) {
        return p;
      }
    }

    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  getLowestRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!this.board[r][col]) return r;
    }
    return -1;
  }

  startNextRound() {
    this.roundNumber += 1;
    this.board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    this.winningCells = null;
    this.lastDrop = null;
    this.phase = 'playing';

    // Alternate starting player each round
    this.currentTurnPlayerId = this.roundNumber % 2 === 1 ? this.p1.id : this.p2.id;
    this.emitState();

    if (this.getActivePlayer().isBot) {
      this.scheduleBotMove();
    }
  }

  endGame(winnerId) {
    this.clearAllTimers();
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
      case 'c4_drop_chip':
        return this.dropChip(effectivePlayerId, payload.col);
      default:
        return { success: false, error: `Action inconnue: ${action}` };
    }
  }

  clearAllTimers() {
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }
    if (this.roundResetTimer) {
      clearTimeout(this.roundResetTimer);
      this.roundResetTimer = null;
    }
  }

  destroy() {
    this.clearAllTimers();
  }

  getState(targetPlayerId = null) {
    const isP1 = targetPlayerId === this.p1.id;
    const isP2 = targetPlayerId === this.p2.id;

    return {
      gameId: 'connect_four',
      phase: this.phase,
      roundNumber: this.roundNumber,
      targetWins: this.targetWins,
      currentTurnPlayerId: this.currentTurnPlayerId,
      currentTurnPlayerName: this.getActivePlayer().name,
      currentTurnColor: this.getActivePlayer().chipColor,
      board: this.board,
      winningCells: this.winningCells,
      lastDrop: this.lastDrop,
      p1: {
        id: this.p1.id,
        name: this.p1.name,
        avatar: this.p1.avatar,
        color: this.p1.color,
        chipColor: this.p1.chipColor,
        score: this.p1.score,
        roundsWon: this.p1.roundsWon,
      },
      p2: {
        id: this.p2.id,
        name: this.p2.name,
        avatar: this.p2.avatar,
        color: this.p2.color,
        chipColor: this.p2.chipColor,
        score: this.p2.score,
        roundsWon: this.p2.roundsWon,
      },
      isGameOver: this.isGameOver,
      finalPodium: this.finalPodium,
      // Private controller convenience
      myRole: isP1 ? 'p1' : isP2 ? 'p2' : 'spectator',
      myChipColor: isP1 ? 'red' : isP2 ? 'yellow' : null,
      isMyTurn: (isP1 && this.currentTurnPlayerId === this.p1.id) || (isP2 && this.currentTurnPlayerId === this.p2.id),
    };
  }

  emitState() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}
