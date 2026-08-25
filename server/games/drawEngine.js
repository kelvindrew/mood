// Draw & Guess (Pictionary) Game Engine for PLAYFLIX
// Real-time vector stroke streaming with touch drawing & secret words

const WORDS_DATABASE = [
  { word: 'PIZZA', category: 'Nourriture' },
  { word: 'TOUR EIFFEL', category: 'Monuments' },
  { word: 'VOITURE', category: 'Véhicules' },
  { word: 'GUITARE', category: 'Musique' },
  { word: 'PÉLICAN', category: 'Animaux' },
  { word: 'FUSÉE', category: 'Espace' },
  { word: 'CHÂTEAU', category: 'Bâtiments' },
  { word: 'ROBOT', category: 'Tech' },
  { word: 'SOLEIL', category: 'Nature' },
  { word: 'SMART TV', category: 'High-Tech' },
];

export class DrawEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players; // array of { id, name, socketId }
    this.currentDrawerIndex = 0;
    this.roundIndex = 0;
    this.totalRounds = Math.min(this.players.length * 2, 6);
    this.strokes = [];
    this.guesses = [];
    this.scores = {};
    this.winner = null;
    this.state = 'drawing'; // 'drawing' | 'word_revealed' | 'game_over'
    this.timeRemaining = 60;
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    for (const p of this.players) {
      this.scores[p.id] = 0;
    }

    this.timer = null;
    this.pickNewWord();
    this.startRoundTimer();
  }

  getCurrentDrawer() {
    return this.players[this.currentDrawerIndex] || this.players[0];
  }

  pickNewWord() {
    const item = WORDS_DATABASE[Math.floor(Math.random() * WORDS_DATABASE.length)];
    this.secretWord = item.word;
    this.category = item.category;
    this.maskedWord = this.secretWord.replace(/[A-ZÀ-ÿ]/g, '_ ');
    this.strokes = [];
    this.guesses = [];
  }

  startRoundTimer() {
    if (this.timer) clearInterval(this.timer);
    this.state = 'drawing';
    this.timeRemaining = 60;

    this.timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.revealWordAndAdvance(false);
      }
      this.notify();
    }, 1000);

    this.notify();
  }

  addStroke(drawerId, stroke) {
    if (this.state !== 'drawing') return;
    if (this.getCurrentDrawer()?.id !== drawerId) return;

    this.strokes.push(stroke);
    this.notify();
  }

  clearCanvas(drawerId) {
    if (this.state !== 'drawing') return;
    if (this.getCurrentDrawer()?.id !== drawerId) return;

    this.strokes = [];
    this.notify();
  }

  submitGuess(playerId, guessText) {
    if (this.state !== 'drawing') return false;
    const drawer = this.getCurrentDrawer();
    if (drawer?.id === playerId) return false; // Drawer cannot guess

    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;

    const normalizedGuess = guessText.trim().toUpperCase();
    const isCorrect = normalizedGuess === this.secretWord.toUpperCase();

    const guessMessage = {
      id: Math.random().toString(36).substring(2, 9),
      playerId,
      playerName: player.name,
      guess: guessText,
      isCorrect,
      timestamp: Date.now(),
    };

    this.guesses.push(guessMessage);

    if (isCorrect) {
      // Speed bonus: 500 max down to 200
      const points = 200 + Math.round((this.timeRemaining / 60) * 300);
      this.scores[playerId] = (this.scores[playerId] || 0) + points;
      // Drawer also earns 250 bonus points when someone guesses!
      this.scores[drawer.id] = (this.scores[drawer.id] || 0) + 250;

      this.revealWordAndAdvance(true);
      return true;
    }

    this.notify();
    return false;
  }

  revealWordAndAdvance(found) {
    if (this.timer) clearInterval(this.timer);
    this.state = 'word_revealed';
    this.maskedWord = this.secretWord;
    this.notify();

    // E2 — timer suivi : annulé par destroy(), garde anti-zombie
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      if (this._destroyed) return;
      this.roundIndex++;
      if (this.roundIndex >= this.totalRounds) {
        this.endGame();
      } else {
        this.currentDrawerIndex = (this.currentDrawerIndex + 1) % this.players.length;
        this.pickNewWord();
        this.startRoundTimer();
      }
    }, 4500);
  }

  endGame() {
    if (this.timer) clearInterval(this.timer);
    this.state = 'game_over';

    let maxScore = -1;
    let winnerId = null;
    for (const [pId, sc] of Object.entries(this.scores)) {
      if (sc > maxScore) {
        maxScore = sc;
        winnerId = pId;
      }
    }
    this.winner = winnerId;
    this.notify();
    if (this.onGameOver) this.onGameOver(winnerId);
  }

  getState() {
    const drawer = this.getCurrentDrawer();
    return {
      currentDrawerId: drawer?.id || '',
      drawerName: drawer?.name || 'Dessinateur',
      secretWord: this.secretWord,
      maskedWord: this.maskedWord,
      category: this.category,
      strokes: this.strokes,
      timeRemaining: this.timeRemaining,
      guesses: this.guesses.slice(-10),
      roundIndex: this.roundIndex,
      totalRounds: this.totalRounds,
      scores: this.scores,
      state: this.state,
      winner: this.winner,
    };
  }

  /**
   * C1 — État PUBLIC : le mot secret est retiré pendant la phase 'drawing'
   * (seul maskedWord circule). Il est inclus aux phases de révélation.
   */
  getPublicState() {
    const state = this.getState();
    if (this.state === 'drawing') {
      delete state.secretWord;
    }
    return state;
  }

  /**
   * C1 — Fragment PRIVÉ : le mot complet est envoyé uniquement au dessinateur
   * en cours de manche.
   */
  getPrivateState(playerId) {
    if (this.state === 'drawing' && this.getCurrentDrawer()?.id === playerId) {
      return { secretWord: this.secretWord };
    }
    return null;
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    this._destroyed = true; // E2
    if (this.timer) clearInterval(this.timer);
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
  }
}
