// Quick Games Micro-Party Pack Engine for PLAYFLIX
// Rapid-fire 15-match mini-game tournament: Reflex, Color Match, Math Flash, Tap Rush, Even/Odd, Arrow Flash, True/False, High Number

const TRUE_FALSE_STATEMENTS = [
  { text: 'La Terre tourne autour du Soleil', ans: 'VRAI' },
  { text: 'Un octogone possède 8 côtés', ans: 'VRAI' },
  { text: 'Les requins sont des mammifères', ans: 'FAUX' },
  { text: 'L’eau bout à 100°C au niveau de la mer', ans: 'VRAI' },
  { text: 'Le cœur humain possède 6 cavités', ans: 'FAUX' },
  { text: 'Le mont Blanc est situé en Europe', ans: 'VRAI' },
  { text: 'La Lune est plus grande que la Terre', ans: 'FAUX' },
  { text: 'Le diamant est le minéral naturel le plus dur', ans: 'VRAI' },
  { text: 'Une année bissextile compte 366 jours', ans: 'VRAI' },
  { text: 'Les araignées ont 6 pattes', ans: 'FAUX' },
  { text: 'L’Australie est plus grande que la Lune en largeur', ans: 'VRAI' },
  { text: 'Le zéro absolu est à 0°C', ans: 'FAUX' },
  { text: 'Tokyo est la capitale du Japon', ans: 'VRAI' },
  { text: 'Un triangle équilatéral a 3 angles de 60°', ans: 'VRAI' },
  { text: 'L’or a pour symbole chimique Fe', ans: 'FAUX' },
];

export class QuickGamesEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.playersList = players.map(p => (typeof p === 'string' ? { id: p, name: p, color: 'red' } : { ...p }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.roundNumber = 1;
    // Minimum 15 matches garantis par partie
    const requested = Number(settings?.totalRounds || settings?.roundsCount || settings?.matchesCount || 15);
    this.totalRounds = Math.max(15, requested);

    this.scores = {};
    for (const p of this.playersList) {
      this.scores[p.id] = 0;
    }

    this.currentMiniGame = null;
    this.miniGameState = {};
    this.roundStatus = 'intro'; // 'intro' | 'active' | 'reveal' | 'finished'
    this.timer = null;
    this.greenTimer = null;
    this.transitionTimer = null;
    this.timeRemaining = 10;
    this.winner = null;

    this.startRound();
  }

  startRound() {
    if (this.timer) clearInterval(this.timer);

    const miniGames = [
      'reaction_speed',
      'color_match',
      'math_flash',
      'tap_rush',
      'even_odd',
      'direction_swipe',
      'true_false',
      'highest_number',
    ];

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
        targetHex: targetColor.hex,
        correctColorName: targetColor.name,
        correctAnswer: targetColor.name,
        options: ['ROUGE', 'BLEU', 'VERT', 'JAUNE'],
        points: 250,
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
        points: 300,
        answers: {},
      };
    } else if (selectedGame === 'even_odd') {
      const num = Math.floor(Math.random() * 90) + 10;
      const ans = num % 2 === 0 ? 'PAIR' : 'IMPAIR';

      this.miniGameState = {
        title: 'Pair ou Impair 🔢',
        instructions: 'Ce nombre est-il PAIR ou IMPAIR ?',
        displayNumber: num,
        correctAnswer: ans,
        options: ['PAIR', 'IMPAIR'],
        points: 250,
        answers: {},
      };
    } else if (selectedGame === 'direction_swipe') {
      const directions = [
        { label: '⬆️ HAUT', code: 'HAUT' },
        { label: '⬇️ BAS', code: 'BAS' },
        { label: '⬅️ GAUCHE', code: 'GAUCHE' },
        { label: '➡️ DROITE', code: 'DROITE' },
      ];
      const target = directions[Math.floor(Math.random() * directions.length)];

      this.miniGameState = {
        title: 'Flèche Réflexe 🧭',
        instructions: 'Quelle direction pointe la flèche sur la TV ?',
        arrowLabel: target.label,
        correctAnswer: target.code,
        options: ['HAUT', 'BAS', 'GAUCHE', 'DROITE'],
        points: 250,
        answers: {},
      };
    } else if (selectedGame === 'true_false') {
      const item = TRUE_FALSE_STATEMENTS[Math.floor(Math.random() * TRUE_FALSE_STATEMENTS.length)];

      this.miniGameState = {
        title: 'Vrai ou Faux Flash ⚡',
        instructions: 'Cette affirmation est-elle VRAIE ou FAUSSE ?',
        statement: item.text,
        correctAnswer: item.ans,
        options: ['VRAI', 'FAUX'],
        points: 250,
        answers: {},
      };
    } else if (selectedGame === 'highest_number') {
      const nums = Array.from(new Set([
        Math.floor(Math.random() * 80) + 15,
        Math.floor(Math.random() * 80) + 15,
        Math.floor(Math.random() * 80) + 15,
        Math.floor(Math.random() * 80) + 15,
      ]));
      while (nums.length < 4) {
        nums.push(Math.floor(Math.random() * 90) + 10);
      }
      const maxVal = Math.max(...nums);
      const options = [...nums].sort(() => Math.random() - 0.5);

      this.miniGameState = {
        title: 'Le Plus Grand Nombre 🔝',
        instructions: 'Touchez le plus grand nombre parmi les 4 !',
        correctAnswer: maxVal,
        options,
        points: 250,
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
      const greenDelay = 1500 + Math.random() * 2500;
      if (this.greenTimer) clearTimeout(this.greenTimer);
      this.greenTimer = setTimeout(() => {
        if (this._destroyed) return;
        if (this.roundStatus === 'active') {
          this.miniGameState.isGreen = true;
          this.miniGameState.greenTimestamp = Date.now();
          this.notify();

          if (this.transitionTimer) clearTimeout(this.transitionTimer);
          this.transitionTimer = setTimeout(() => {
            if (this._destroyed) return;
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
    } else if (this.currentMiniGame === 'tap_rush') {
      this.miniGameState.taps[playerId] = (this.miniGameState.taps[playerId] || 0) + 1;
      this.notify();

      if (this.miniGameState.taps[playerId] >= this.miniGameState.targetTaps) {
        this.scores[playerId] = (this.scores[playerId] || 0) + 400;
        this.finishRound();
      }
    } else {
      // Épreuves à choix (color_match, math_flash, even_odd, direction_swipe, true_false, highest_number)
      if (!this.miniGameState.answers[playerId]) {
        const target = this.miniGameState.correctAnswer ?? this.miniGameState.correctColorName;
        const isCorrect = String(payload.choice).trim().toUpperCase() === String(target).trim().toUpperCase();
        const pts = isCorrect ? (this.miniGameState.points || 250) : 0;
        this.scores[playerId] = (this.scores[playerId] || 0) + pts;
        this.miniGameState.answers[playerId] = { choice: payload.choice, isCorrect, points: pts };
        this.notify();

        if (Object.keys(this.miniGameState.answers).length === this.playersList.length) {
          this.finishRound();
        }
      }
    }
  }

  finishRound() {
    if (this.timer) clearInterval(this.timer);
    this.roundStatus = 'reveal';
    this.notify();

    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      if (this._destroyed) return;
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

  getPublicState() {
    const state = this.getState();
    if (state.miniGameState) {
      const { correctColorName, correctAnswer, greenTimestamp, ...safeMini } = state.miniGameState;
      state.miniGameState = safeMini;
    }
    return state;
  }

  getPrivateState() {
    return null;
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    this._destroyed = true;
    if (this.timer) clearInterval(this.timer);
    if (this.greenTimer) clearTimeout(this.greenTimer);
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
  }
}
