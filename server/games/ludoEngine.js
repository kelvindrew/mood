// Ludo Game Engine for PLAYFLIX - Autonomous AI Bots & Enhanced Gameplay Edition
// Standard 4-player Ludo with 52 common path cells + 6 home stretch cells per color

const START_POSITIONS = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47]; // Star cells

const ALL_4_COLORS = ['red', 'green', 'yellow', 'blue'];

const BOT_NAMES = {
  red: 'Sophia (Rouge)',
  green: 'Cyber Bot (Vert)',
  yellow: 'Alpha Neo (Jaune)',
  blue: 'Jarvis (Bleu)',
};

export class LudoEngine {
  constructor(players, onStateChange, onGameOver) {
    // players can be array of colors or array of Player objects with isBot
    this.playersList = players.map(p => (typeof p === 'string' ? { color: p, isBot: false, name: p } : { ...p }));

    // In standard Ludo, ensure all 4 board colors (Red, Blue, Green, Yellow) are populated
    // Auto-assign AI Bots to any unfilled board colors so the game is always a rich 4-player match
    for (const col of ALL_4_COLORS) {
      if (!this.playersList.some(p => p.color === col)) {
        this.playersList.push({
          id: `bot_ludo_${col}`,
          name: BOT_NAMES[col] || `🤖 Bot ${col.toUpperCase()}`,
          avatar: '🤖',
          color: col,
          isBot: true,
          botDifficulty: 'medium',
        });
      }
    }

    // Keep strict 4-color order
    this.playerColors = ALL_4_COLORS;

    this.currentTurnIndex = 0;
    this.diceValue = null;
    this.canRollDice = true;
    this.movablePawns = [];
    this.movableOptions = [];
    this.winner = null;
    this.turnTimeLeft = 25;
    this.lastActionLog = 'La partie de Ludo commence ! À vos dés !';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    // Initialize 4 pawns for each color
    this.pawns = {};
    for (const color of this.playerColors) {
      this.pawns[color] = [
        { id: 0, color, position: -1, isHome: true, isFinished: false },
        { id: 1, color, position: -1, isHome: true, isFinished: false },
        { id: 2, color, position: -1, isHome: true, isFinished: false },
        { id: 3, color, position: -1, isHome: true, isFinished: false },
      ];
    }

    this.timer = null;
    this.botTimer = null;
    this.startTurnTimer();

    // Trigger initial bot turn if starting player is a bot
    this.checkBotTurn();
  }

  getCurrentColor() {
    return this.playerColors[this.currentTurnIndex];
  }

  isCurrentPlayerBot() {
    const color = this.getCurrentColor();
    const player = this.playersList.find(p => p.color === color);
    return player ? !!player.isBot : false;
  }

  startTurnTimer() {
    if (this.timer) clearInterval(this.timer);
    this.turnTimeLeft = 25;
    this.timer = setInterval(() => {
      this.turnTimeLeft--;
      if (this.turnTimeLeft <= 0) {
        this.handleTurnTimeout();
      }
      this.notify();
    }, 1000);
  }

  checkBotTurn() {
    if (this.winner) return;
    if (this.botTimer) clearTimeout(this.botTimer);

    if (this.isCurrentPlayerBot()) {
      this.botTimer = setTimeout(() => {
        if (this.canRollDice && this.isCurrentPlayerBot() && !this.winner) {
          this.rollDice(this.getCurrentColor(), false);
        }
      }, 1000);
    }
  }

  handleTurnTimeout() {
    if (this.canRollDice) {
      this.rollDice(this.getCurrentColor(), true);
    } else if (this.movablePawns.length > 0) {
      this.movePawn(this.getCurrentColor(), this.movablePawns[0]);
    } else {
      this.nextTurn();
    }
  }

  rollDice(playerColor, isAuto = false) {
    if (this.winner) return;
    if (playerColor !== this.getCurrentColor()) return;
    if (!this.canRollDice) return;

    this.diceValue = Math.floor(Math.random() * 6) + 1;
    this.canRollDice = false;
    this.lastActionLog = `${playerColor.toUpperCase()} a fait un ${this.diceValue} ${isAuto ? '(auto)' : ''}`;

    // Calculate detailed movable options
    const { movableIds, options } = this.calculateMovableOptions(playerColor, this.diceValue);
    this.movablePawns = movableIds;
    this.movableOptions = options;

    if (this.movablePawns.length === 0) {
      // No pawns can move, automatically pass to next player after a short pause
      if (this.botTimer) clearTimeout(this.botTimer);
      this.botTimer = setTimeout(() => {
        if (!this.winner) {
          this.nextTurn();
        }
      }, 1100);
    } else if (this.isCurrentPlayerBot()) {
      // AI Bot evaluates the best strategic pawn to move
      if (this.botTimer) clearTimeout(this.botTimer);
      this.botTimer = setTimeout(() => {
        if (!this.canRollDice && this.isCurrentPlayerBot() && !this.winner) {
          const bestPawnId = this.chooseBestBotPawn(options);
          if (bestPawnId !== null && this.movablePawns.includes(bestPawnId)) {
            this.movePawn(playerColor, bestPawnId);
          } else if (this.movablePawns.length > 0) {
            this.movePawn(playerColor, this.movablePawns[0]);
          }
        }
      }, 900);
    } else if (this.movablePawns.length === 1) {
      // Auto move single option for human after 800ms
      const singlePawnId = this.movablePawns[0];
      if (this.botTimer) clearTimeout(this.botTimer);
      this.botTimer = setTimeout(() => {
        if (!this.canRollDice && this.movablePawns.includes(singlePawnId) && !this.isCurrentPlayerBot() && !this.winner) {
          this.movePawn(playerColor, singlePawnId);
        }
      }, 800);
    }

    this.notify();
  }

  chooseBestBotPawn(options) {
    if (!options || options.length === 0) return null;

    // 1. Move to finish center
    const winningOpt = options.find(o => o.isWinning);
    if (winningOpt) return winningOpt.pawnId;

    // 2. Capture an opponent
    const captureOpt = options.find(o => o.willCapture);
    if (captureOpt) return captureOpt.pawnId;

    // 3. Move onto a safe star cell
    const safeOpt = options.find(o => SAFE_POSITIONS.includes(o.targetPosition));
    if (safeOpt) return safeOpt.pawnId;

    // 4. Exit home with a 6
    const exitHomeOpt = options.find(o => o.isExitingHome);
    if (exitHomeOpt) return exitHomeOpt.pawnId;

    // 5. Advance furthest pawn on track
    const sorted = [...options].sort((a, b) => b.targetPosition - a.targetPosition);
    return sorted[0].pawnId;
  }

  calculateMovableOptions(color, roll) {
    const pawns = this.pawns[color];
    const movableIds = [];
    const options = [];

    for (const pawn of pawns) {
      if (pawn.isFinished) continue;

      if (pawn.isHome) {
        if (roll === 6) {
          movableIds.push(pawn.id);
          options.push({
            pawnId: pawn.id,
            fromPosition: -1,
            targetPosition: START_POSITIONS[color],
            isExitingHome: true,
            isEnteringHomeStretch: false,
            isWinning: false,
            willCapture: this.checkWillCapture(START_POSITIONS[color], color),
          });
        }
      } else if (pawn.position >= 100) {
        const currentStretchPos = pawn.position - 100;
        const newStretch = currentStretchPos + roll;
        if (newStretch <= 5) {
          movableIds.push(pawn.id);
          options.push({
            pawnId: pawn.id,
            fromPosition: pawn.position,
            targetPosition: newStretch === 5 ? 200 : 100 + newStretch,
            isExitingHome: false,
            isEnteringHomeStretch: false,
            isWinning: newStretch === 5,
            willCapture: false,
          });
        }
      } else {
        const start = START_POSITIONS[color];
        const relativeCurrent = (pawn.position - start + 52) % 52;
        const relativeNew = relativeCurrent + roll;

        if (relativeNew > 50) {
          const stretchSteps = relativeNew - 51;
          if (stretchSteps <= 5) {
            movableIds.push(pawn.id);
            options.push({
              pawnId: pawn.id,
              fromPosition: pawn.position,
              targetPosition: stretchSteps === 5 ? 200 : 100 + stretchSteps,
              isExitingHome: false,
              isEnteringHomeStretch: true,
              isWinning: stretchSteps === 5,
              willCapture: false,
            });
          }
        } else {
          const newTrackPos = (pawn.position + roll) % 52;
          movableIds.push(pawn.id);
          options.push({
            pawnId: pawn.id,
            fromPosition: pawn.position,
            targetPosition: newTrackPos,
            isExitingHome: false,
            isEnteringHomeStretch: false,
            isWinning: false,
            willCapture: this.checkWillCapture(newTrackPos, color),
          });
        }
      }
    }

    return { movableIds, options };
  }

  checkWillCapture(targetPos, myColor) {
    if (SAFE_POSITIONS.includes(targetPos)) return false;
    for (const otherColor of this.playerColors) {
      if (otherColor === myColor) continue;
      for (const otherPawn of this.pawns[otherColor] || []) {
        if (!otherPawn.isHome && !otherPawn.isFinished && otherPawn.position === targetPos) {
          return true;
        }
      }
    }
    return false;
  }

  movePawn(playerColor, pawnId) {
    if (this.winner) return;
    if (playerColor !== this.getCurrentColor()) return;
    if (this.canRollDice || !this.movablePawns.includes(pawnId)) return;

    const pawn = this.pawns[playerColor].find(p => p.id === pawnId);
    if (!pawn) return;

    const roll = this.diceValue;
    let extraTurn = roll === 6;

    if (pawn.isHome) {
      pawn.isHome = false;
      pawn.position = START_POSITIONS[playerColor];
      this.lastActionLog = `${playerColor.toUpperCase()} sort un pion de sa base !`;
    } else if (pawn.position >= 100) {
      const newStretch = (pawn.position - 100) + roll;
      if (newStretch === 5) {
        pawn.position = 200;
        pawn.isFinished = true;
        this.lastActionLog = `🎉 Un pion de ${playerColor.toUpperCase()} atteint la maison !`;
        extraTurn = true;
      } else if (newStretch < 5) {
        pawn.position = 100 + newStretch;
      }
    } else {
      const start = START_POSITIONS[playerColor];
      const relativeCurrent = (pawn.position - start + 52) % 52;
      const relativeNew = relativeCurrent + roll;

      if (relativeNew > 50) {
        const stretchSteps = relativeNew - 51;
        if (stretchSteps === 5) {
          pawn.position = 200;
          pawn.isFinished = true;
          this.lastActionLog = `🎉 Un pion de ${playerColor.toUpperCase()} atteint la maison !`;
          extraTurn = true;
        } else if (stretchSteps < 5) {
          pawn.position = 100 + stretchSteps;
        } else {
          return;
        }
      } else {
        const newTrackPos = (pawn.position + roll) % 52;
        pawn.position = newTrackPos;

        if (!SAFE_POSITIONS.includes(newTrackPos)) {
          for (const otherColor of this.playerColors) {
            if (otherColor === playerColor) continue;
            for (const otherPawn of this.pawns[otherColor]) {
              if (!otherPawn.isHome && !otherPawn.isFinished && otherPawn.position === newTrackPos) {
                otherPawn.isHome = true;
                otherPawn.position = -1;
                this.lastActionLog = `💥 ${playerColor.toUpperCase()} a capturé un pion ${otherColor.toUpperCase()} !`;
                extraTurn = true;
              }
            }
          }
        }
      }
    }

    // Check win condition
    const allFinished = this.pawns[playerColor].every(p => p.isFinished);
    if (allFinished) {
      this.winner = playerColor;
      this.lastActionLog = `🏆 Victoire éclatante de ${playerColor.toUpperCase()} !`;
      if (this.timer) clearInterval(this.timer);
      if (this.botTimer) clearTimeout(this.botTimer);
      this.notify();
      if (this.onGameOver) this.onGameOver(playerColor);
      return;
    }

    this.movablePawns = [];
    this.movableOptions = [];
    if (extraTurn) {
      this.canRollDice = true;
      this.startTurnTimer();
      this.checkBotTurn();
    } else {
      this.nextTurn();
    }

    this.notify();
  }

  nextTurn() {
    if (this.botTimer) clearTimeout(this.botTimer);
    this.diceValue = null;
    this.canRollDice = true;
    this.movablePawns = [];
    this.movableOptions = [];
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.playerColors.length;
    this.lastActionLog = `Tour de ${this.getCurrentColor().toUpperCase()}`;
    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();
  }

  getState() {
    return {
      players: this.playerColors,
      pawns: this.pawns,
      currentTurnColor: this.getCurrentColor(),
      diceValue: this.diceValue,
      canRollDice: this.canRollDice,
      movablePawns: this.movablePawns,
      movableOptions: this.movableOptions,
      winner: this.winner,
      turnTimeLeft: this.turnTimeLeft,
      lastActionLog: this.lastActionLog,
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);
  }
}
