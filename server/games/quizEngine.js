// Quiz Mega Show Engine for PLAYFLIX
// Dynamic TV game show with real-time buzzer responses, streaks, and speed bonus

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    category: 'Culture Générale',
    question: 'Quel est le plus grand océan de la Terre ?',
    options: ['Océan Atlantique', 'Océan Pacifique', 'Océan Indien', 'Océan Arctique'],
    correctIndex: 1,
    explanation: "L'océan Pacifique couvre plus de 165 millions de km², soit environ un tiers de la surface terrestre !",
  },
  {
    id: 'q2',
    category: 'Cinéma & Séries',
    question: 'Dans la saga Harry Potter, quelle maison a pour emblème un lion d’or ?',
    options: ['Serpentard', 'Poufsouffle', 'Gryffondor', 'Serdaigle'],
    correctIndex: 2,
    explanation: 'Gryffondor a pour couleurs le rouge et l’or, et pour animal emblématique le lion.',
  },
  {
    id: 'q3',
    category: 'Jeux Vidéo & Geek',
    question: 'Quel est le nom du monde champignon dirigé par la Princesse Peach ?',
    options: ['Hyrule', 'Royaume Champignon', 'Kanto', 'Azeroth'],
    correctIndex: 1,
    explanation: 'Le Royaume Champignon (Mushroom Kingdom) est le théâtre principal des aventures de Mario.',
  },
  {
    id: 'q4',
    category: 'Sciences & Espace',
    question: 'Quelle est la planète la plus proche du Soleil dans notre système solaire ?',
    options: ['Vénus', 'Mars', 'Mercure', 'Terre'],
    correctIndex: 2,
    explanation: 'Mercure est la planète la plus proche du Soleil, orbitant à environ 58 millions de km.',
  },
  {
    id: 'q5',
    category: 'Musique & Pop Culture',
    question: 'Quel groupe britannique a chanté le tube planétaire "Bohemian Rhapsody" ?',
    options: ['The Beatles', 'Queen', 'The Rolling Stones', 'Pink Floyd'],
    correctIndex: 1,
    explanation: 'Composé par Freddie Mercury, ce chef-d’œuvre de Queen est sorti en 1975 sur l’album A Night at the Opera.',
  },
  {
    id: 'q6',
    category: 'Sport',
    question: 'Combien de joueurs composent une équipe de basket-ball sur le terrain ?',
    options: ['4 joueurs', '5 joueurs', '6 joueurs', '7 joueurs'],
    correctIndex: 1,
    explanation: 'Une équipe de basket-ball compte 5 joueurs actifs sur le terrain (meneur, arrière, ailier, ailier fort, pivot).',
  },
  {
    id: 'q7',
    category: 'Tech & Smart TV',
    question: 'Quel système d’exploitation propulse principalement les téléviseurs connectés Hisense ?',
    options: ['VIDAA OS', 'Tizen OS', 'webOS', 'tvOS'],
    correctIndex: 0,
    explanation: 'VIDAA OS est le système d’exploitation phare développé par Hisense pour ses Smart TV rapides et intuitives !',
  },
  {
    id: 'q8',
    category: 'Histoire & Géographie',
    question: 'Dans quelle ville se trouve le célèbre Colisée antique ?',
    options: ['Athènes', 'Rome', 'Madrid', 'Alexandrie'],
    correctIndex: 1,
    explanation: 'Le Colisée de Rome a été construit sous le règne des empereurs flaviens au Ier siècle.',
  }
];

export class QuizEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players; // Array of { id, name, avatar, color }
    this.questions = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    this.currentQuestionIndex = 0;
    this.state = 'question'; // 'question' | 'reveal' | 'round_summary' | 'game_over'
    this.timeRemaining = 15;
    this.answers = {}; // playerId -> { optionIndex, timeSpentMs, pointsAwarded }
    this.scores = {}; // playerId -> number
    this.streaks = {}; // playerId -> number
    this.questionStartTime = Date.now();
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    for (const player of this.players) {
      this.scores[player.id] = 0;
      this.streaks[player.id] = 0;
    }

    this.timer = null;
    this.startQuestionTimer();
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex] || null;
  }

  startQuestionTimer() {
    if (this.timer) clearInterval(this.timer);
    this.state = 'question';
    this.answers = {};
    this.timeRemaining = 15;
    this.questionStartTime = Date.now();

    this.timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.revealAnswers();
      }
      this.notify();
    }, 1000);

    this.notify();
  }

  submitAnswer(playerId, optionIndex) {
    if (this.state !== 'question') return false;
    if (this.answers[playerId]) return false; // already answered

    const timeSpentMs = Date.now() - this.questionStartTime;
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return false;

    const isCorrect = optionIndex === currentQ.correctIndex;
    let points = 0;

    if (isCorrect) {
      // Speed multiplier: 1000 max down to 500
      const speedFactor = Math.max(0, (15000 - timeSpentMs) / 15000);
      const basePoints = 500;
      const speedBonus = Math.round(speedFactor * 500);
      const streak = (this.streaks[playerId] || 0) + 1;
      const streakBonus = Math.min(streak * 50, 250);

      points = basePoints + speedBonus + streakBonus;
      this.streaks[playerId] = streak;
    } else {
      this.streaks[playerId] = 0;
    }

    this.answers[playerId] = {
      optionIndex,
      timeSpentMs,
      pointsAwarded: points,
    };

    // If all active players have answered, reveal immediately
    const totalAnswered = Object.keys(this.answers).length;
    if (totalAnswered >= this.players.length) {
      this.revealAnswers();
    } else {
      this.notify();
    }

    return true;
  }

  revealAnswers() {
    if (this.timer) clearInterval(this.timer);
    this.state = 'reveal';

    // Apply scores
    for (const [pId, ans] of Object.entries(this.answers)) {
      if (ans.pointsAwarded > 0) {
        this.scores[pId] = (this.scores[pId] || 0) + ans.pointsAwarded;
      }
    }

    this.notify();

    // After 5s show next question or end
    setTimeout(() => {
      if (this.currentQuestionIndex + 1 < Math.min(5, this.questions.length)) {
        this.currentQuestionIndex++;
        this.startQuestionTimer();
      } else {
        this.endGame();
      }
    }, 5000);
  }

  endGame() {
    if (this.timer) clearInterval(this.timer);
    this.state = 'game_over';

    const sortedLeaderboard = this.getLeaderboard();
    const winnerId = sortedLeaderboard[0]?.playerId || null;

    this.notify();
    if (this.onGameOver) this.onGameOver(winnerId);
  }

  getLeaderboard() {
    return this.players.map(p => ({
      playerId: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      score: this.scores[p.id] || 0,
      streak: this.streaks[p.id] || 0,
    })).sort((a, b) => b.score - a.score);
  }

  getState() {
    return {
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: Math.min(5, this.questions.length),
      currentQuestion: this.getCurrentQuestion(),
      state: this.state,
      timeRemaining: this.timeRemaining,
      answers: this.answers,
      streaks: this.streaks,
      leaderboard: this.getLeaderboard(),
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
