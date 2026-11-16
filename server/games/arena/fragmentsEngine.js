// Server Game Engine for ARENA: FRAGMENTS OF MEMORY
// Visual observation & high-precision interrogation

export const ARENA_SCENES = [
  {
    id: 'council_chamber',
    title: 'La Salle du Conseil Mystique',
    theme: 'Société Secrète',
    description: 'Une réunion clandestine au cœur de l’Arène sous un lustre de cristal.',
    visualData: {
      clockTime: '03:45',
      characterCount: 6,
      briefcaseColor: 'Cuir Rouge',
      candleCount: 7,
      guardsOnPost: 2,
      wineGlasses: 4,
      bannerEmblem: 'Faucon Doré',
    },
    questions: [
      {
        id: 'q1',
        text: 'Quelle heure indiquait la grande horloge murale en bronze ?',
        options: ['02:30', '03:45', '04:15', '01:00'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        text: 'De quelle couleur était la mallette tenue par le conseiller à gauche ?',
        options: ['Noir Obsidienne', 'Bleu Nuit', 'Cuir Rouge', 'Vert Émeraude'],
        correctIndex: 2,
      },
      {
        id: 'q3',
        text: 'Combien de bougies étaient allumées sur la table centrale ?',
        options: ['5', '7', '8', '10'],
        correctIndex: 1,
      },
      {
        id: 'q4',
        text: 'Quel était l’animal représenté sur l’étendard royal au fond ?',
        options: ['Loup d’Argent', 'Faucon Doré', 'Serpent d’Ombre', 'Lion Couronné'],
        correctIndex: 1,
      },
    ]
  },
  {
    id: 'vault_infiltration',
    title: 'Le Sanctuaire du Trésor',
    theme: 'Banque Impériale',
    description: 'Une salle des coffres haute sécurité avec lasers et lingots d’or.',
    visualData: {
      laserCount: 5,
      goldStacks: 12,
      keypadDigits: '7492',
      guardStatus: 'Endormi',
      cameraLight: 'Clignotant Rouge',
    },
    questions: [
      {
        id: 'v1',
        text: 'Combien de faisceaux laser traversaient le couloir principal ?',
        options: ['3', '5', '7', '9'],
        correctIndex: 1,
      },
      {
        id: 'v2',
        text: 'Quel était le code à 4 chiffres entré sur le digicode du coffre ?',
        options: ['1234', '7492', '9812', '4580'],
        correctIndex: 1,
      },
      {
        id: 'v3',
        text: 'Dans quel état se trouvait le garde assis devant les écrans ?',
        options: ['Au téléphone', 'En patrouille', 'Endormi', 'Menotté'],
        correctIndex: 2,
      },
      {
        id: 'v4',
        text: 'De quelle couleur clignotait le voyant de la caméra de surveillance ?',
        options: ['Vert fixe', 'Bleu azur', 'Clignotant Rouge', 'Éteint'],
        correctIndex: 2,
      },
    ]
  }
];

export class FragmentsEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_siwon',
        name: '🤖 Si-won (IA)',
        color: 'cyan',
        avatar: '🦊',
        isBot: true,
        score: 0,
      });
    }

    const sceneIdx = Math.floor(Math.random() * ARENA_SCENES.length);
    this.scene = ARENA_SCENES[sceneIdx];

    this.phase = 'observe'; // 'observe' | 'question' | 'scoring' | 'ended'
    this.observeTimeLeft = 20;
    this.currentQuestionIndex = 0;
    this.questionTimeLeft = 12;
    this.timerInterval = null;

    this.answers = {}; // qIndex -> { playerId: { optionIndex, timeMs } }
    this.questionStartTime = 0;
    this.scores = {};
    for (const p of this.players) {
      this.scores[p.id] = 0;
    }

    this.winnerId = null;
    this.startObserveCountdown();
    this.broadcast();
  }

  startObserveCountdown() {
    this.phase = 'observe';
    this.observeTimeLeft = 20;
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.observeTimeLeft--;
      if (this.observeTimeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.startNextQuestion();
      } else {
        this.broadcast();
      }
    }, 1000);
  }

  startNextQuestion() {
    if (this.currentQuestionIndex >= this.scene.questions.length) {
      this.endGame();
      return;
    }

    this.phase = 'question';
    this.questionTimeLeft = 12;
    this.questionStartTime = Date.now();
    this.answers[this.currentQuestionIndex] = {};
    this.broadcast();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.questionTimeLeft--;
      if (this.questionTimeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.resolveQuestion();
      } else {
        this.broadcast();
      }
    }, 1000);

    // Bots IA
    for (const p of this.players) {
      if (p.isBot) {
        const currentQ = this.scene.questions[this.currentQuestionIndex];
        const isCorrect = Math.random() < 0.8;
        const answer = isCorrect ? currentQ.correctIndex : (currentQ.correctIndex + 1) % 4;
        setTimeout(() => {
          this.handleAction(p, 'submit_answer', { optionIndex: answer });
        }, 2000 + Math.random() * 3000);
      }
    }
  }

  handleAction(player, action, payload = {}) {
    if (this.phase !== 'question') return;

    if (action === 'submit_answer') {
      const qMap = this.answers[this.currentQuestionIndex] || {};
      if (qMap[player.id]) return; // Déjà répondu

      const optIdx = Number(payload.optionIndex);
      const elapsed = Date.now() - this.questionStartTime;
      qMap[player.id] = {
        optionIndex: optIdx,
        timeMs: elapsed,
      };
      this.answers[this.currentQuestionIndex] = qMap;
      this.broadcast();

      // Si tous les joueurs ont répondu
      const allAnswered = this.players.every(p => qMap[p.id] !== undefined);
      if (allAnswered) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.resolveQuestion();
      }
    }
  }

  resolveQuestion() {
    this.phase = 'scoring';
    const currentQ = this.scene.questions[this.currentQuestionIndex];
    const qMap = this.answers[this.currentQuestionIndex] || {};

    for (const p of this.players) {
      const ans = qMap[p.id];
      if (ans && ans.optionIndex === currentQ.correctIndex) {
        const speedBonus = Math.max(0, Math.floor((12000 - ans.timeMs) / 100));
        this.scores[p.id] = (this.scores[p.id] || 0) + 100 + speedBonus;
      }
    }

    this.broadcast();

    setTimeout(() => {
      this.currentQuestionIndex++;
      this.startNextQuestion();
    }, 3500);
  }

  endGame() {
    this.phase = 'ended';
    let best = -1;
    let winner = null;
    for (const p of this.players) {
      const sc = this.scores[p.id] || 0;
      p.score = sc;
      if (sc > best) {
        best = sc;
        winner = p.id;
      }
    }
    this.winnerId = winner;
    this.broadcast();

    if (typeof this.onGameOver === 'function') {
      this.onGameOver(this.winnerId);
    }
  }

  getState() {
    const currentQ = this.scene.questions[this.currentQuestionIndex];
    return {
      scene: this.scene,
      phase: this.phase,
      observeTimeLeft: this.observeTimeLeft,
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: this.scene.questions.length,
      currentQuestion: currentQ ? {
        id: currentQ.id,
        text: currentQ.text,
        options: currentQ.options,
        correctIndex: this.phase === 'scoring' ? currentQ.correctIndex : undefined,
      } : null,
      questionTimeLeft: this.questionTimeLeft,
      playerAnswers: this.answers[this.currentQuestionIndex] || {},
      scores: this.scores,
      winnerId: this.winnerId,
    };
  }

  getPublicState() {
    return {
      arenaGameId: 'fragments_of_memory',
      ...this.getState(),
    };
  }

  getPrivateState(playerId) {
    const qMap = this.answers[this.currentQuestionIndex] || {};
    return {
      myAnswer: qMap[playerId]?.optionIndex ?? null,
    };
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
