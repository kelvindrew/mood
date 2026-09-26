// Server Game Engine for "FAKE NEWS : QUI A DIT VRAI ?" (Fibbage / Bluff Party Game)
// Invent convincing lies, spot the truth, and earn points when friends fall for your fake answers!

export const FAKE_NEWS_QUESTIONS = [
  {
    id: 'fn_1',
    prompt: 'En 1923, le jockey Frank Hayes a remporté une course de chevaux à New York alors qu’il était...',
    answer: 'Mort',
    aiLies: ['Ivre', 'Aveugle', 'Endormi', 'Menotté'],
  },
  {
    id: 'fn_2',
    prompt: 'En Suisse, il est illégal par la loi de ne posséder qu’un seul cochon d’Inde parce qu’ils se sentent...',
    answer: 'Seuls',
    aiLies: ['Moches', 'Supérieurs', 'Enfermés', 'Stressés'],
  },
  {
    id: 'fn_3',
    prompt: 'Les flamants roses ne peuvent avaler leur nourriture que lorsque leur tête est...',
    answer: 'À l’envers',
    aiLies: ['Dans l’eau', 'Au soleil', 'Pliée', 'Mouillée'],
  },
  {
    id: 'fn_4',
    prompt: 'Avant l’invention du dentifrice en pâte, les Romains se brossaient les dents avec de la poudre de...',
    answer: 'Cerveau de souris',
    aiLies: ['Charbon de bois', 'Coquillage', 'Craie', 'Sable'],
  },
  {
    id: 'fn_5',
    prompt: 'Le cœur d’une crevette se situe dans son ou sa...',
    answer: 'Tête',
    aiLies: ['Pince', 'Queue', 'Carapace', 'Œil'],
  },
  {
    id: 'fn_6',
    prompt: 'Pour empêcher les vaches de déprimer en hiver, des éleveurs russes leur ont fait porter des...',
    answer: 'Casques VR',
    aiLies: ['Lunettes de soleil', 'Chaussettes en laine', 'Manteaux rouges', 'Casques audio'],
  },
  {
    id: 'fn_7',
    prompt: 'À l’origine en 1957, le papier bulle a été inventé pour servir de...',
    answer: 'Papier peint',
    aiLies: ['Gilet de sauvetage', 'Semelle de chaussure', 'Matelas gonflable', 'Isolant phonique'],
  },
  {
    id: 'fn_8',
    prompt: 'En Écosse, il existe plus de 400 mots différents pour désigner...',
    answer: 'La neige',
    aiLies: ['La pluie', 'Le whisky', 'Le brouillard', 'Les moutons'],
  },
  {
    id: 'fn_9',
    prompt: 'Un crocodile est biologiquement incapable de tirer sa...',
    answer: 'Langue',
    aiLies: ['Queue', 'Griffe', 'Paupière', 'Mâchoire'],
  },
  {
    id: 'fn_10',
    prompt: 'Le fondateur de la marque Pringles a demandé à être enterré dans...',
    answer: 'Une boîte de Pringles',
    aiLies: ['Un camion de livraison', 'Un champ de pommes de terre', 'Un sac plastique', 'Un distributeur'],
  },
  {
    id: 'fn_11',
    prompt: 'En 1386, un tribunal français a officiellement condamné à mort par pendaison un...',
    answer: 'Cochon',
    aiLies: ['Fantôme', 'Arbre', 'Chien', 'Pigeon'],
  },
  {
    id: 'fn_12',
    prompt: 'À Venise, toutes les gondoles doivent obligatoirement être peintes en...',
    answer: 'Noir',
    aiLies: ['Rouge', 'Bleu marine', 'Or', 'Blanc'],
  },
  {
    id: 'fn_13',
    prompt: 'Les castors ont les dents orange vif parce qu’elles contiennent du...',
    answer: 'Fer',
    aiLies: ['Venin', 'Sucre', 'Carotène', 'Soufre'],
  },
  {
    id: 'fn_14',
    prompt: 'La reine Elizabeth II n’avait pas besoin pour voyager ou conduire de...',
    answer: 'Permis de conduire',
    aiLies: ['Passeport', 'Garde du corps', 'Voiture blindée', 'Billet d’avion'],
  },
  {
    id: 'fn_15',
    prompt: 'En 2008, la police japonaise a découvert une femme qui vivait secrètement depuis 1 an dans...',
    answer: 'Un placard',
    aiLies: ['Une cave à vin', 'Un faux plafond', 'Un conduit d’aération', 'Un coffre de voiture'],
  }
];

export class FakeNewsEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map((p, idx) =>
      typeof p === 'string'
        ? { id: p, name: p, color: 'blue', isBot: false }
        : { ...p }
    );

    // If fewer than 2 players, add friendly bot companions
    const botNames = ['🤖 Cyber Menteur', '🤖 Pinocchio AI'];
    let botIdx = 0;
    while (this.players.length < 2) {
      this.players.push({
        id: `bot_fn_${Date.now()}_${botIdx}`,
        name: botNames[botIdx] || `Bot ${botIdx + 1}`,
        color: ['purple', 'orange'][botIdx] || 'purple',
        avatar: '🤥',
        isBot: true,
      });
      botIdx++;
    }

    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    this.totalRounds = Number(settings?.totalRounds || 3);
    this.currentRound = 1;
    this.phase = 'writing'; // 'writing' | 'voting' | 'reveal' | 'round_recap' | 'gameover'
    this.timer = 35;
    this.timerInterval = null;

    this.usedQuestionIds = new Set();
    this.currentQuestion = null;

    this.submittedLies = {}; // playerId -> string
    this.votingChoices = []; // Array<{ id: string, text: string, authorPlayerId?: string, isCorrect: boolean }>
    this.playerVotes = {}; // playerId -> choiceId

    this.scores = {};
    for (const p of this.players) {
      this.scores[p.id] = 0;
    }

    this.lastRoundStats = [];
    this.finalPodium = null;

    this.startRound();
  }

  startRound() {
    this.clearTimer();
    this.phase = 'writing';
    this.timer = 35;
    this.submittedLies = {};
    this.playerVotes = {};
    this.votingChoices = [];
    this.lastRoundStats = [];

    // Pick unused question
    const available = FAKE_NEWS_QUESTIONS.filter((q) => !this.usedQuestionIds.has(q.id));
    const pool = available.length > 0 ? available : FAKE_NEWS_QUESTIONS;
    this.currentQuestion = pool[Math.floor(Math.random() * pool.length)];
    this.usedQuestionIds.add(this.currentQuestion.id);

    this.startTimer(() => {
      this.startVotingPhase();
    });
    this.notify();

    // Trigger Bot Lies
    this.triggerBotLies();
  }

  triggerBotLies() {
    if (this.phase !== 'writing') return;
    const aiPool = [...this.currentQuestion.aiLies];

    for (const bot of this.players.filter((p) => p.isBot)) {
      setTimeout(() => {
        if (this.phase !== 'writing') return;
        const lie = aiPool.pop() || 'Une invention secrète';
        this.submitLie(bot.id, lie);
      }, 5000 + Math.random() * 8000);
    }
  }

  submitLie(playerId, lieText) {
    if (this.phase !== 'writing') return { success: false, error: 'Phase d’écriture expirée' };

    const clean = (lieText || '').trim();
    if (!clean) return { success: false, error: 'Texte vide' };

    // Check if player accidentally guessed the truth
    if (clean.toLowerCase() === this.currentQuestion.answer.toLowerCase()) {
      return { success: false, isTruth: true, error: 'Vous avez trouvé la vraie réponse ! Inventez un mensonge.' };
    }

    this.submittedLies[playerId] = clean;

    // Check if all players submitted
    if (Object.keys(this.submittedLies).length >= this.players.length) {
      this.startVotingPhase();
    } else {
      this.notify();
    }

    return { success: true };
  }

  startVotingPhase() {
    this.clearTimer();
    this.phase = 'voting';
    this.timer = 25;
    this.playerVotes = {};

    // Assemble voting choices:
    // 1. Correct Answer
    // 2. Player Lies
    // 3. Extra AI lies if needed
    const choices = [];

    // Correct Answer
    choices.push({
      id: 'choice_truth',
      text: this.currentQuestion.answer,
      isCorrect: true,
    });

    // Player lies
    for (const [playerId, lie] of Object.entries(this.submittedLies)) {
      choices.push({
        id: `choice_${playerId}`,
        text: lie,
        authorPlayerId: playerId,
        isCorrect: false,
      });
    }

    // If fewer than 4 choices, supplement with AI lies
    const aiLies = [...this.currentQuestion.aiLies];
    while (choices.length < 4 && aiLies.length > 0) {
      const extraLie = aiLies.pop();
      choices.push({
        id: `choice_ai_${choices.length}`,
        text: extraLie,
        isCorrect: false,
      });
    }

    // Shuffle choices
    this.votingChoices = choices.sort(() => Math.random() - 0.5);

    this.startTimer(() => {
      this.resolveReveal();
    });
    this.notify();

    // Trigger Bot Votes
    this.triggerBotVotes();
  }

  triggerBotVotes() {
    if (this.phase !== 'voting') return;

    for (const bot of this.players.filter((p) => p.isBot)) {
      setTimeout(() => {
        if (this.phase !== 'voting') return;
        // Bot votes for a choice that isn't their own
        const validChoices = this.votingChoices.filter((c) => c.authorPlayerId !== bot.id);
        if (validChoices.length > 0) {
          const chosen = validChoices[Math.floor(Math.random() * validChoices.length)];
          this.castVote(bot.id, chosen.id);
        }
      }, 4000 + Math.random() * 8000);
    }
  }

  castVote(voterId, choiceId) {
    if (this.phase !== 'voting') return { success: false, error: 'Phase de vote expirée' };

    const choice = this.votingChoices.find((c) => c.id === choiceId);
    if (!choice) return { success: false, error: 'Choix introuvable' };

    // Cannot vote for your own lie
    if (choice.authorPlayerId === voterId) {
      return { success: false, error: 'Vous ne pouvez pas voter pour votre propre mensonge !' };
    }

    this.playerVotes[voterId] = choiceId;

    if (Object.keys(this.playerVotes).length >= this.players.length) {
      this.resolveReveal();
    } else {
      this.notify();
    }

    return { success: true };
  }

  resolveReveal() {
    this.clearTimer();
    this.phase = 'reveal';
    this.timer = 12;

    // Calculate Scores:
    // +200 pts: Guessed Truth
    // +100 pts per player fooled: Author of fake answer
    const roundGains = {};
    for (const p of this.players) roundGains[p.id] = 0;

    for (const [voterId, choiceId] of Object.entries(this.playerVotes)) {
      const choice = this.votingChoices.find((c) => c.id === choiceId);
      if (choice) {
        if (choice.isCorrect) {
          // Found truth!
          roundGains[voterId] = (roundGains[voterId] || 0) + 200;
          this.scores[voterId] = (this.scores[voterId] || 0) + 200;
        } else if (choice.authorPlayerId) {
          // Fooled by player lie!
          const authorId = choice.authorPlayerId;
          roundGains[authorId] = (roundGains[authorId] || 0) + 100;
          this.scores[authorId] = (this.scores[authorId] || 0) + 100;
        }
      }
    }

    this.lastRoundStats = this.votingChoices.map((choice) => {
      const voters = Object.entries(this.playerVotes)
        .filter(([, cId]) => cId === choice.id)
        .map(([vId]) => this.players.find((p) => p.id === vId)?.name || 'Inconnu');

      return {
        id: choice.id,
        text: choice.text,
        isCorrect: choice.isCorrect,
        authorName: choice.authorPlayerId
          ? this.players.find((p) => p.id === choice.authorPlayerId)?.name
          : undefined,
        voters,
      };
    });

    this.startTimer(() => {
      if (this.currentRound >= this.totalRounds) {
        this.endGame();
      } else {
        this.phase = 'round_recap';
        this.timer = 8;
        this.startTimer(() => {
          this.currentRound++;
          this.startRound();
        });
        this.notify();
      }
    });

    this.notify();
  }

  endGame() {
    this.clearTimer();
    this.phase = 'gameover';

    const sortedPlayers = [...this.players].sort(
      (a, b) => (this.scores[b.id] || 0) - (this.scores[a.id] || 0)
    );

    const winnerId = sortedPlayers[0]?.id;
    this.finalPodium = sortedPlayers.map((p, idx) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      score: this.scores[p.id] || 0,
      rank: idx + 1,
      isWinner: p.id === winnerId,
    }));

    this.notify();
    if (this.onGameOver) {
      this.onGameOver(winnerId);
    }
  }

  startTimer(onComplete) {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.clearTimer();
        if (onComplete) onComplete();
      } else {
        this.notify();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  destroy() {
    this.clearTimer();
  }

  handleAction(playerId, action, data = {}) {
    switch (action) {
      case 'fn_submit_lie':
        return this.submitLie(playerId, data.lie);
      case 'fn_cast_vote':
        return this.castVote(playerId, data.choiceId);
      case 'fn_restart':
        this.currentRound = 1;
        for (const p of this.players) this.scores[p.id] = 0;
        this.usedQuestionIds.clear();
        this.startRound();
        return { success: true };
      default:
        return { success: false, error: `Action inconnue : ${action}` };
    }
  }

  getState() {
    return this.getPublicState();
  }

  getPublicState() {
    return {
      gameId: 'fake_news',
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timer: this.timer,
      prompt: this.currentQuestion?.prompt || '',
      // Only show full answer in reveal/gameover
      truth: this.phase === 'reveal' || this.phase === 'gameover' ? this.currentQuestion?.answer : undefined,
      votingChoices: this.phase === 'writing' ? [] : this.votingChoices.map((c) => ({
        id: c.id,
        text: c.text,
        // Hide author and correctness during voting!
        authorPlayerId: this.phase === 'reveal' || this.phase === 'gameover' ? c.authorPlayerId : undefined,
        isCorrect: this.phase === 'reveal' || this.phase === 'gameover' ? c.isCorrect : undefined,
      })),
      playerVotes: this.phase === 'reveal' || this.phase === 'gameover' ? this.playerVotes : {},
      lastRoundStats: this.lastRoundStats,
      scores: this.scores,
      finalPodium: this.finalPodium,
      isGameOver: this.phase === 'gameover',
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        avatar: p.avatar,
        isBot: p.isBot,
        hasSubmittedLie: !!this.submittedLies[p.id],
        hasVoted: !!this.playerVotes[p.id],
      })),
    };
  }

  getPrivateState(playerId) {
    return {
      myLie: this.submittedLies[playerId] || '',
      myVote: this.playerVotes[playerId] || null,
      myOwnChoiceId: this.votingChoices.find((c) => c.authorPlayerId === playerId)?.id || null,
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getPublicState());
    }
  }
}
