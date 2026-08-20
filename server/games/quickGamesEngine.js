// Quick Games Micro-Party Pack Engine for PLAYFLIX
// Rapid-fire 30s-2min mini-game tournament: Reflex, Color Match, Math Flash, Tap Rush

export class QuickGamesEngine {
  constructor(players, onStateChange, onGameOver) {
    this.playersList = players.map(p => (typeof p === 'string' ? { id: p, name: p, color: 'red' } : { ...p }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.roundNumber = 1;
    this.totalRounds = 4;
    this.scores = {};
    for (const p of this.playersList) {
      this.scores[p.id] = 0;
    }

    this.currentMiniGame = null;
    this.miniGameState = {};
    this.roundStatus = 'intro'; // 'intro' | 'active' | 'reveal' | 'finished'
    this.timer = null;
    this.timeRemaining = 10;
    this.winner = null;

    this.startRound();
  }

  startRound() {
    if (this.timer) clearInterval(this.timer);

    const miniGames = ['reaction_speed', 'color_match', 'math_flash', 'tap_rush'];
    const selectedGame = miniGames[(this.roundNumber - 1) % miniGames.length];
    this.currentMiniGame = selectedGame;
    this.roundStatus = 'intro';
    this.timeRemaining = 3;

    if (selectedGame === 'reaction_speed') {
      this.miniGameState = {
        title: 'Réaction Éclair ⚡',
        instructions: 'Touchez votre écran DÈS QUE la TV passe au VERT !',
        isGreen: false,
        tappedPlayers: [],
        greenTimestamp: null,
      };
    } else if (selectedGame === 'color_match') {
      const colors = [
        { name: 'ROUGE', hex: '#EF4444' },
        { name: 'BLEU', hex: '#3B82F6' },
        { name: 'VERT', hex: '#10B981' },
        { name: 'JAUNE', hex: '#F59E0B' },
      ];
      const targetColor = colors[Math.floor(Math.random() * colors.length)];
      const displayedWord = colors[Math.floor(Math.random() * colors.length)];
      this.miniGameState = {
        title: 'Couleur Piège 🎨',
        instructions: 'Touchez la VRAIE COULEUR du texte (pas ce qui est écrit) !',
        targetWord: displayedWord.name,
        targetHex: targetColor.hex, // color to match
        correctColorName: targetColor.name,
        options: ['ROUGE', 'BLEU', 'VERT', 'JAUNE'],
        answers: {},
      };
    } else if (selectedGame === 'math_flash') {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 20) + 5;
      const ans = a + b;
      const wrong = [ans - 2, ans + 3, ans - 5].filter(v => v !== ans);
      const options = [ans, ...wrong].slice(0, 4).sort(() => Math.random() - 0.5);

      this.miniGameState = {
        title: 'Calcul Flash 🧮',
        instructions: 'Calculez le résultat le plus vite possible !',
        equation: `${a} + ${b} = ?`,
        correctAnswer: ans,
        options,
        answers: {},
      };
    } else {
      // Tap Rush
      this.miniGameState = {
        title: 'Tap Rush Frenzy 👆',
        instructions: 'Touchez votre écran 20 fois le plus rapidement possible !',
        targetTaps: 20,
        taps: {},
      };
      for (const p of this.playersList) {
        this.miniGameState.taps[p.id] = 0;
      }
    }

    // 3s Intro countdown
    this.timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(this.timer);
        this.activateMiniGame();
      }
      this.notify();
    }, 1000);

    this.notify();
  }

  activateMiniGame() {
    this.roundStatus = 'active';

    if (this.currentMiniGame === 'reaction_speed') {
      // Random delay 1.5s to 4s before turning green
      const greenDelay = 1500 + Math.random() * 2500;
      setTimeout(() => {
        if (this.roundStatus === 'active') {
          this.miniGameState.isGreen = true;
          this.miniGameState.greenTimestamp = Date.now();
          this.notify();

          // End round after 3.5s of green
          setTimeout(() => {
            if (this.roundStatus === 'active') this.finishRound();
          }, 3500);
        }
      }, greenDelay);
    } else {
      this.timeRemaining = 8;
      this.timer = setInterval(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          clearInterval(this.timer);
          this.finishRound();
        }
        this.notify();
      }, 1000);
    }

    this.notify();
  }

  handlePlayerAction(playerId, action, payload = {}) {
    if (this.roundStatus !== 'active') return;

    if (this.currentMiniGame === 'reaction_speed') {
      if (!this.miniGameState.isGreen) {
        // False start penalty
        this.scores[playerId] = Math.max(0, (this.scores[playerId] || 0) - 50);
        return;
      }
      if (!this.miniGameState.tappedPlayers.some(p => p.playerId === playerId)) {
        const ms = Date.now() - (this.miniGameState.greenTimestamp || Date.now());
        const points = Math.max(10, 500 - Math.round(ms / 2));
        this.scores[playerId] = (this.scores[playerId] || 0) + points;
        this.miniGameState.tappedPlayers.push({ playerId, ms, points });
        this.notify();

        if (this.miniGameState.tappedPlayers.length === this.playersList.length) {
          this.finishRound();
        }
      }
    } else if (this.currentMiniGame === 'color_match') {
      if (!this.miniGameState.answers[playerId]) {
        const isCorrect = payload.choice === this.miniGameState.correctColorName;
        const pts = isCorrect ? 250 : 0;
        this.scores[playerId] = (this.scores[playerId] || 0) + pts;
        this.miniGameState.answers[playerId] = { choice: payload.choice, isCorrect, points: pts };
        this.notify();

        if (Object.keys(this.miniGameState.answers).length === this.playersList.length) {
          this.finishRound();
        }
      }
    } else if (this.currentMiniGame === 'math_flash') {
      if (!this.miniGameState.answers[playerId]) {
        const isCorrect = Number(payload.choice) === this.miniGameState.correctAnswer;
        const pts = isCorrect ? 300 : 0;
        this.scores[playerId] = (this.scores[playerId] || 0) + pts;
        this.miniGameState.answers[playerId] = { choice: payload.choice, isCorrect, points: pts };
        this.notify();

        if (Object.keys(this.miniGameState.answers).length === this.playersList.length) {
          this.finishRound();
        }
      }
    } else if (this.currentMiniGame === 'tap_rush') {
      this.miniGameState.taps[playerId] = (this.miniGameState.taps[playerId] || 0) + 1;
      this.notify();

      if (this.miniGameState.taps[playerId] >= this.miniGameState.targetTaps) {
        this.scores[playerId] = (this.scores[playerId] || 0) + 400;
        this.finishRound();
      }
    }
  }

  finishRound() {
    if (this.timer) clearInterval(this.timer);
    this.roundStatus = 'reveal';
    this.notify();

    // 3.5s pause to see scores then next round or game over
    setTimeout(() => {
      if (this.roundNumber < this.totalRounds) {
        this.roundNumber++;
        this.startRound();
      } else {
        this.roundStatus = 'finished';
        const sorted = [...this.playersList].sort((a, b) => (this.scores[b.id] || 0) - (this.scores[a.id] || 0));
        this.winner = sorted[0]?.name || 'Champion';
        this.notify();
        if (this.onGameOver) this.onGameOver(this.winner);
      }
    }, 3500);
  }

  getState() {
    return {
      roundNumber: this.roundNumber,
      totalRounds: this.totalRounds,
      currentMiniGame: this.currentMiniGame,
      miniGameState: this.miniGameState,
      roundStatus: this.roundStatus,
      timeRemaining: this.timeRemaining,
      scores: this.scores,
      winner: this.winner,
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
