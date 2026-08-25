// Blind Test Musical & Melody Arena Engine for PLAYFLIX
// Real-time audio melody playback & reflex buzzers on smartphones

const SONGS_DATABASE = [
  {
    id: 's1',
    title: 'Super Mario Bros Theme',
    artist: 'Nintendo / Koji Kondo',
    category: 'Jeux Vidéo',
    melodyNotes: [659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0, 783.99, 0, 0, 0, 392.00],
    options: ['Super Mario Bros', 'The Legend of Zelda', 'Sonic the Hedgehog', 'Tetris Theme'],
    correctIndex: 0,
  },
  {
    id: 's2',
    title: 'Star Wars : Marche Impériale',
    artist: 'John Williams',
    category: 'Cinéma',
    melodyNotes: [440, 440, 440, 349.23, 523.25, 440, 349.23, 523.25, 440],
    options: ['Harry Potter', 'Star Wars', 'Indiana Jones', 'Le Seigneur des Anneaux'],
    correctIndex: 1,
  },
  {
    id: 's3',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    category: 'Pop & Électro',
    melodyNotes: [493.88, 493.88, 440, 392, 440, 493.88, 440, 392],
    options: ['One More Time', 'Get Lucky', 'Around the World', 'Harder Better Faster'],
    correctIndex: 1,
  },
  {
    id: 's4',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    category: 'Rétro 80s',
    melodyNotes: [370, 370, 440, 370, 330, 370, 293.66],
    options: ['Thriller', 'Beat It', 'Smooth Criminal', 'Billie Jean'],
    correctIndex: 3,
  },
  {
    id: 's5',
    title: 'Tetris Korobeiniki',
    artist: 'Traditionnel / Game Boy',
    category: 'Jeux Vidéo & Rétro',
    melodyNotes: [659.25, 493.88, 523.25, 587.33, 523.25, 493.88, 440, 440, 523.25, 659.25, 587.33, 523.25, 493.88],
    options: ['Pac-Man', 'Tetris', 'Space Invaders', 'Pokemon Theme'],
    correctIndex: 1,
  }
];

export class BlindTestEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players;
    this.songs = [...SONGS_DATABASE].sort(() => Math.random() - 0.5);
    this.currentSongIndex = 0;
    this.timeRemaining = 20;
    this.state = 'playing'; // 'playing' | 'buzzed' | 'reveal' | 'game_over'
    this.buzzedPlayerId = null;
    this.scores = {};
    this.winner = null;
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    for (const p of this.players) {
      this.scores[p.id] = 0;
    }

    this.timer = null;
    this.startSongTimer();
  }

  getCurrentSong() {
    return this.songs[this.currentSongIndex] || this.songs[0];
  }

  startSongTimer() {
    if (this.timer) clearInterval(this.timer);
    this.state = 'playing';
    this.buzzedPlayerId = null;
    this.timeRemaining = 20;

    this.timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.revealSong();
      }
      this.notify();
    }, 1000);

    this.notify();
  }

  handleBuzz(playerId) {
    if (this.state !== 'playing') return false;

    this.buzzedPlayerId = playerId;
    this.state = 'buzzed';
    this.timeRemaining = 8; // 8s to pick an answer
    this.notify();
    return true;
  }

  submitAnswer(playerId, optionIndex) {
    if (this.state !== 'buzzed' || this.buzzedPlayerId !== playerId) return false;

    const song = this.getCurrentSong();
    const isCorrect = optionIndex === song.correctIndex;

    if (isCorrect) {
      this.scores[playerId] = (this.scores[playerId] || 0) + 500;
    } else {
      this.scores[playerId] = Math.max(0, (this.scores[playerId] || 0) - 150);
    }

    this.revealSong();
    return isCorrect;
  }

  revealSong() {
    if (this.timer) clearInterval(this.timer);
    this.state = 'reveal';
    this.notify();

    // E2 — timer suivi : annulé par destroy(), garde anti-zombie
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      if (this._destroyed) return;
      if (this.currentSongIndex + 1 < this.songs.length) {
        this.currentSongIndex++;
        this.startSongTimer();
      } else {
        this.endGame();
      }
    }, 4000);
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
    return {
      currentSongIndex: this.currentSongIndex,
      totalSongs: this.songs.length,
      currentSong: this.getCurrentSong(),
      timeRemaining: this.timeRemaining,
      state: this.state,
      buzzedPlayerId: this.buzzedPlayerId,
      scores: this.scores,
      winner: this.winner,
    };
  }

  /**
   * C1 — État PUBLIC : pendant 'playing' et 'buzzed', le titre, l'artiste
   * (ce SONT les réponses) et correctIndex sont retirés. Seuls la catégorie,
   * les options, la mélodie (jouée à voix haute sur la TV) circulent.
   * Tout est révélé aux phases 'reveal' / 'game_over'.
   */
  getPublicState() {
    const state = this.getState();
    if (state.currentSong && this.state !== 'reveal' && this.state !== 'game_over') {
      const { correctIndex, title, artist, ...safeSong } = state.currentSong;
      state.currentSong = safeSong;
    }
    return state;
  }

  /**
   * C1 — Aucune donnée privée par joueur dans ce jeu.
   */
  getPrivateState() {
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
