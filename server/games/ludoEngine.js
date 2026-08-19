// Official Ludo Game Engine for PLAYFLIX
// Standard 4-player rules: 52 circuit cells, 5 home stretch cells, 6 to exit, exact roll to finish, captures & extra turns.

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
    this.playersList = players.map(p => (typeof p === 'string' ? { color: p, isBot: false, name: p } : { ...p }));

    // Ensure all 4 colors are filled with humans or bots
    for (const col of ALL_4_COLORS) {
      if (!this.playersList.some(p => p.color === col)) {
        this.playersList.push({
          id: `bot_ludo_${col}`,
          name: BOT_NAMES[col] || `Bot ${col.toUpperCase()}`,
          avatar: '🤖',
          color: col,
          isBot: true,
          botDifficulty: 'medium',
        });
      }
    }

    this.playerColors = ALL_4_COLORS;
    this.currentTurnIndex = 0;
    this.diceValue = null;
    this.canRollDice = true;
    this.movablePawns = [];
    this.movableOptions = [];
    this.winner = null;
    this.turnTimeLeft = 30;
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

    // Trigger bot if starting player is bot
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
    this.turnTimeLeft = 30;
    this.timer = setInterval(() => {
      if (this.winner) return;

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
      }, 1200);
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
    this.lastActionLog = `${playerColor.toUpperCase()} a obtenu un ${this.diceValue} ${isAuto ? '(auto)' : ''}`;

    // Calculate valid moves
    const { movableIds, options } = this.calculateMovableOptions(playerColor, this.diceValue);
    this.movablePawns = movableIds;
    this.movableOptions = options;

    if (this.movablePawns.length === 0) {
      // No moves possible -> automatic pass after 1.5s
      this.lastActionLog = `${playerColor.toUpperCase()} : Aucun coup possible avec un ${this.diceValue}.`;
      if (this.botTimer) clearTimeout(this.botTimer);
      this.botTimer = setTimeout(() => {
        if (!this.winner) {
          this.nextTurn();
        }
      }, 1500);
    } else if (this.isCurrentPlayerBot()) {
      // Bot chooses best move after 1s
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
      }, 1000);
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

    // 4. Exit base with a 6
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
        // Must roll a 6 to exit home
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
        // Already on home stretch (100, 101, 102, 103, 104)
        const currentStep = pawn.position - 100; // 0 to 4
        const targetStep = currentStep + roll;

        // Step 5 is the central finish!
        if (targetStep === 5) {
          movableIds.push(pawn.id);
          options.push({
            pawnId: pawn.id,
            fromPosition: pawn.position,
            targetPosition: 200,
            isExitingHome: false,
            isEnteringHomeStretch: false,
            isWinning: true,
            willCapture: false,
          });
        } else if (targetStep < 5) {
          movableIds.push(pawn.id);
          options.push({
            pawnId: pawn.id,
            fromPosition: pawn.position,
            targetPosition: 100 + targetStep,
            isExitingHome: false,
            isEnteringHomeStretch: false,
            isWinning: false,
            willCapture: false,
          });
        }
        // If targetStep > 5, cannot move (requires exact roll)
      } else {
        // On main 52 circuit
        const start = START_POSITIONS[color];
        const relativeCurrent = (pawn.position - start + 52) % 52;
        const relativeNew = relativeCurrent + roll;

        if (relativeNew > 50) {
          // Entering home stretch
          const stretchSteps = relativeNew - 51; // 0 = first home cell, 5 = finish
          if (stretchSteps === 5) {
            movableIds.push(pawn.id);
            options.push({
              pawnId: pawn.id,
              fromPosition: pawn.position,
              targetPosition: 200,
              isExitingHome: false,
              isEnteringHomeStretch: true,
              isWinning: true,
              willCapture: false,
            });
          } else if (stretchSteps < 5) {
            movableIds.push(pawn.id);
            options.push({
              pawnId: pawn.id,
              fromPosition: pawn.position,
              targetPosition: 100 + stretchSteps,
              isExitingHome: false,
              isEnteringHomeStretch: true,
              isWinning: false,
              willCapture: false,
            });
          }
          // If stretchSteps > 5, cannot move
        } else {
          // Standard track move
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
    let extraTurn = roll === 6; // 6 gives a re-roll

    if (pawn.isHome) {
      pawn.isHome = false;
      pawn.position = START_POSITIONS[playerColor];
      this.lastActionLog = `${playerColor.toUpperCase()} sort son pion #${pawn.id + 1} de la base !`;
    } else if (pawn.position >= 100) {
      const currentStep = pawn.position - 100;
      const targetStep = currentStep + roll;
      if (targetStep === 5) {
        pawn.position = 200;
        pawn.isFinished = true;
        this.lastActionLog = `🎉 Le pion #${pawn.id + 1} de ${playerColor.toUpperCase()} atteint la maison centrale !`;
        extraTurn = true;
      } else if (targetStep < 5) {
        pawn.position = 100 + targetStep;
        this.lastActionLog = `${playerColor.toUpperCase()} avance dans l'allée centrale.`;
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
          this.lastActionLog = `🎉 Le pion #${pawn.id + 1} de ${playerColor.toUpperCase()} atteint la maison centrale !`;
          extraTurn = true;
        } else if (stretchSteps < 5) {
          pawn.position = 100 + stretchSteps;
          this.lastActionLog = `${playerColor.toUpperCase()} entre dans l'allée centrale.`;
        }
      } else {
        const newTrackPos = (pawn.position + roll) % 52;
        pawn.position = newTrackPos;
        this.lastActionLog = `${playerColor.toUpperCase()} avance son pion #${pawn.id + 1} en case ${newTrackPos}.`;

        // Check capture on non-safe cells
        if (!SAFE_POSITIONS.includes(newTrackPos)) {
          for (const otherColor of this.playerColors) {
            if (otherColor === playerColor) continue;
            for (const otherPawn of this.pawns[otherColor]) {
              if (!otherPawn.isHome && !otherPawn.isFinished && otherPawn.position === newTrackPos) {
                otherPawn.isHome = true;
                otherPawn.position = -1;
                this.lastActionLog = `💥 ${playerColor.toUpperCase()} a capturé le pion ${otherColor.toUpperCase()} ! Rejouez !`;
                extraTurn = true;
              }
            }
          }
        }
      }
    }

    // Check victory: all 4 pawns finished
    const allFinished = this.pawns[playerColor].every(p => p.isFinished);
    if (allFinished) {
      this.winner = playerColor;
      this.lastActionLog = `🏆 Victoire éclatante de ${playerColor.toUpperCase()} qui a rentré ses 4 pions !`;
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
      this.diceValue = null;
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
