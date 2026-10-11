import { COUNTRIES_DATABASE, CATEGORIES_LEXICON } from './jeuDePaysData.js';

export const JEU_DE_PAYS_CATEGORIES = [
  { id: 'pays', label: 'Pays', icon: '🌍', example: 'Maroc' },
  { id: 'animal', label: 'Animal', icon: '🐾', example: 'Mouton' },
  { id: 'marque_voiture', label: 'Marque de voiture', icon: '🚗', example: 'Mercedes' },
  { id: 'prenom', label: 'Prénom', icon: '👤', example: 'Marie' },
  { id: 'aliment', label: 'Aliment ou plat', icon: '🍕', example: 'Mangue' },
  { id: 'metier', label: 'Métier', icon: '💼', example: 'Médecin' },
  { id: 'ville', label: 'Ville', icon: '🏙️', example: 'Marseille' },
  { id: 'objet', label: 'Objet du quotidien', icon: '📦', example: 'Miroir' },
  { id: 'sport', label: 'Sport ou équipe', icon: '⚽', example: 'Marathon' },
  { id: 'celebrite', label: 'Célébrité ou personnage', icon: '⭐', example: 'Messi' },
];

export const PLAYABLE_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'V'
];

/**
 * Vérifie si le mot correspond à un pays réel de la base officielle
 */
export function isValidCountry(raw) {
  if (!raw || typeof raw !== 'string') return false;
  const norm = normalizeAnswer(raw);
  if (!norm) return false;
  return COUNTRIES_DATABASE.some((c) => normalizeAnswer(c) === norm);
}

/**
 * Normalise une réponse :
 * - Minuscules, trim
 * - Suppression des accents (NFD)
 * - Suppression des articles initiaux (Le, La, Les, L', Un, Une, Des)
 */
export function normalizeAnswer(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^l['’]/i, '')
    .replace(/^(le|la|les|un|une|des|d['’]|de)\s+/i, '')
    .trim();
}

/**
 * Vérifie si la réponse commence bien par la lettre tirée
 */
export function answerStartsWithLetter(rawAnswer, targetLetter) {
  if (!rawAnswer || !targetLetter) return false;
  const target = targetLetter.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const norm = normalizeAnswer(rawAnswer);
  if (!norm) return false;
  return norm.toUpperCase().startsWith(target);
}

export class JeuDePaysEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map((p) =>
      typeof p === 'string'
        ? { id: p, name: p, color: 'blue', isBot: false }
        : { ...p }
    );

    // If fewer than 2 players, add friendly bot companions
    const botNames = ['🤖 Globe-Trotteur', '🤖 Atlas Bot'];
    let botIdx = 0;
    while (this.players.length < 2) {
      this.players.push({
        id: `bot_jdp_${Date.now()}_${botIdx}`,
        name: botNames[botIdx] || `Bot ${botIdx + 1}`,
        color: ['cyan', 'orange'][botIdx] || 'cyan',
        avatar: '🧭',
        isBot: true,
      });
      botIdx++;
    }

    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    this.totalRounds = Number(settings?.totalRounds || 3);
    this.currentRound = 1;
    this.categoryDuration = Number(settings?.turnDuration || 12); // seconds per category (10-15s recommended)
    
    // Phases: 'wheel' | 'category_running' | 'category_intermission' | 'voting' | 'round_recap' | 'gameover'
    this.phase = 'wheel';
    this.timer = 5;
    this.timerInterval = null;

    this.currentLetter = 'M';
    this.roundCategories = []; // Categories to play in this round
    this.currentCategoryIndex = 0; // Index of the currently active category

    // answers: playerId -> { [categoryId]: { text: string, submittedAtTimeLeft: number } }
    this.answers = {};
    // answeredPlayersForCurrentCat: Set of playerIds
    this.answeredPlayersForCurrentCat = new Set();

    // Voting state: iterates category by category
    this.votingCategoryIndex = 0;
    // validationVotes: `${targetPlayerId}_${categoryId}` -> { voterId: boolean }
    this.validationVotes = {};

    this.scores = {};
    this.roundBreakdowns = {}; // playerId -> [ { categoryId, text, basePoints, speedBonus, totalPoints, rejected, isDuplicate } ]
    for (const p of this.players) {
      this.scores[p.id] = 0;
      this.answers[p.id] = {};
    }

    this.finalPodium = null;
    this.startRound();
  }

  startRound() {
    this.clearTimer();
    this.phase = 'wheel';
    this.timer = 5;
    this.currentCategoryIndex = 0;
    this.answeredPlayersForCurrentCat.clear();
    this.validationVotes = {};

    for (const p of this.players) {
      this.answers[p.id] = {};
    }

    // Pick random letter
    this.currentLetter = PLAYABLE_LETTERS[Math.floor(Math.random() * PLAYABLE_LETTERS.length)];

    // Build categories for this round:
    // Always include 'pays' as the flagship category first, then 4 other distinct random categories
    const paysCategory = JEU_DE_PAYS_CATEGORIES.find((c) => c.id === 'pays') || JEU_DE_PAYS_CATEGORIES[0];
    const otherCategories = JEU_DE_PAYS_CATEGORIES.filter((c) => c.id !== 'pays').sort(() => Math.random() - 0.5);
    this.roundCategories = [paysCategory, ...otherCategories.slice(0, 4)];

    this.startTimer(() => {
      this.startCategory(0);
    });
    this.notify();
  }

  startCategory(index) {
    this.clearTimer();
    this.currentCategoryIndex = index;
    this.phase = 'category_running';
    this.timer = this.categoryDuration;
    this.answeredPlayersForCurrentCat.clear();

    this.startTimer(() => {
      this.finishCurrentCategory();
    });
    this.notify();

    // Trigger Bot responses
    this.triggerBotAnswersForCurrentCategory();
  }

  triggerBotAnswersForCurrentCategory() {
    if (this.phase !== 'category_running') return;
    const cat = this.roundCategories[this.currentCategoryIndex];
    if (!cat) return;
    const letter = this.currentLetter;

    for (const bot of this.players.filter((p) => p.isBot)) {
      // Delay bot answer by 3 to 7 seconds
      const delay = 3000 + Math.random() * 4000;
      setTimeout(() => {
        if (this.phase !== 'category_running') return;
        if (this.currentCategoryIndex !== this.roundCategories.indexOf(cat)) return;

        // Choose a real existing word from the category lexicon starting with this letter
        const pool = (CATEGORIES_LEXICON[cat.id] || []).filter((item) =>
          answerStartsWithLetter(item, letter)
        );

        let chosenText = '';
        if (pool.length > 0) {
          chosenText = pool[Math.floor(Math.random() * pool.length)];
        } else {
          chosenText = '';
        }

        if (chosenText) {
          this.submitAnswer(bot.id, chosenText);
        }
      }, delay);
    }
  }

  submitAnswer(playerId, text) {
    if (this.phase !== 'category_running') {
      return { success: false, error: 'La phase de réponse pour cette catégorie est terminée' };
    }

    const currentCat = this.roundCategories[this.currentCategoryIndex];
    if (!currentCat) {
      return { success: false, error: 'Catégorie introuvable' };
    }

    // Ignore if already submitted for this category
    if (this.answers[playerId]?.[currentCat.id]) {
      return { success: false, error: 'Réponse déjà enregistrée pour cette catégorie' };
    }

    const cleanText = (text || '').trim();
    if (!this.answers[playerId]) {
      this.answers[playerId] = {};
    }

    this.answers[playerId][currentCat.id] = {
      text: cleanText,
      submittedAtTimeLeft: this.timer,
    };

    this.answeredPlayersForCurrentCat.add(playerId);

    // If all human players have answered, advance early or notify
    const humanPlayers = this.players.filter((p) => !p.isBot);
    const allHumansAnswered = humanPlayers.every((p) => this.answeredPlayersForCurrentCat.has(p.id));

    if (allHumansAnswered && this.answeredPlayersForCurrentCat.size >= this.players.length) {
      this.finishCurrentCategory();
    } else {
      this.notify();
    }

    return { success: true };
  }

  finishCurrentCategory() {
    this.clearTimer();

    // Next category or voting phase?
    if (this.currentCategoryIndex + 1 < this.roundCategories.length) {
      // Intermission before next category
      this.phase = 'category_intermission';
      this.timer = 2; // 2 seconds pulse transition
      this.startTimer(() => {
        this.startCategory(this.currentCategoryIndex + 1);
      });
      this.notify();
    } else {
      // All categories answered! Move to voting / validation
      this.startVotingPhase();
    }
  }

  startVotingPhase() {
    this.clearTimer();
    this.phase = 'voting';
    this.votingCategoryIndex = 0;
    this.validationVotes = {};
    this.timer = 15; // 15s to validate each category

    this.startTimer(() => {
      this.advanceVotingCategory();
    });
    this.notify();

    this.triggerBotVotes();
  }

  triggerBotVotes() {
    if (this.phase !== 'voting') return;
    const cat = this.roundCategories[this.votingCategoryIndex];
    if (!cat) return;

    for (const bot of this.players.filter((p) => p.isBot)) {
      for (const target of this.players) {
        if (target.id === bot.id) continue;
        const entry = this.answers[target.id]?.[cat.id];
        const rawText = (entry?.text || '').trim();

        let isValid = false;
        if (answerStartsWithLetter(rawText, this.currentLetter)) {
          if (cat.id === 'pays') {
            // Un faux pays (comme 'Paroc') est immédiatement rejeté par les bots !
            isValid = isValidCountry(rawText);
          } else {
            const lexicon = CATEGORIES_LEXICON[cat.id] || [];
            const norm = normalizeAnswer(rawText);
            const inLexicon = lexicon.some((w) => normalizeAnswer(w) === norm);
            isValid = inLexicon || rawText.length >= 3;
          }
        }
        this.castValidationVote(bot.id, target.id, cat.id, isValid);
      }
    }
  }

  castValidationVote(voterId, targetPlayerId, categoryId, isValid) {
    if (this.phase !== 'voting') return { success: false, error: 'Vote non actif' };
    const key = `${targetPlayerId}_${categoryId}`;
    if (!this.validationVotes[key]) {
      this.validationVotes[key] = {};
    }
    this.validationVotes[key][voterId] = isValid;
    this.notify();
    return { success: true };
  }

  advanceVotingCategory() {
    this.clearTimer();
    this.votingCategoryIndex++;

    if (this.votingCategoryIndex >= this.roundCategories.length) {
      // All categories reviewed! Calculate scores
      this.computeRoundScores();
    } else {
      this.timer = 15;
      this.startTimer(() => {
        this.advanceVotingCategory();
      });
      this.notify();
      this.triggerBotVotes();
    }
  }

  computeRoundScores() {
    this.clearTimer();

    // Scoring system:
    // - Valid and unique: 10 points
    // - Valid but duplicate (same normalized answer as another player): 5 points
    // - Speed bonus:
    //   * Answered with > 65% time remaining: +3 points
    //   * Answered with 35% - 65% time remaining: +2 points
    //   * Answered with < 35% time remaining: +1 point
    // - 0 point: Empty, wrong initial letter, or rejected by majority vote

    const roundPointsEarned = {};
    for (const p of this.players) {
      roundPointsEarned[p.id] = 0;
      this.roundBreakdowns[p.id] = [];
    }

    for (const cat of this.roundCategories) {
      const catId = cat.id;

      // Group normalized answers to detect duplicates
      const normalizedMap = {};
      for (const p of this.players) {
        const raw = this.answers[p.id]?.[catId]?.text || '';
        const norm = normalizeAnswer(raw);
        if (norm && answerStartsWithLetter(raw, this.currentLetter)) {
          normalizedMap[norm] = (normalizedMap[norm] || 0) + 1;
        }
      }

      for (const p of this.players) {
        const entry = this.answers[p.id]?.[catId];
        const raw = entry?.text || '';
        const norm = normalizeAnswer(raw);

        // Check if starts with the letter
        const startsWithCorrectLetter = answerStartsWithLetter(raw, this.currentLetter);

        // Check communal votes
        const key = `${p.id}_${catId}`;
        const votesObj = this.validationVotes[key] || {};
        const votesArr = Object.values(votesObj);
        const rejects = votesArr.filter((v) => v === false).length;
        const accepts = votesArr.filter((v) => v === true).length;
        const rejectedByVote = rejects > accepts && rejects >= 2;

        // Pour la catégorie 'pays', le pays doit être un vrai pays officiel (pas un mot inventé comme 'Paroc')
        const isOfficialCountry = catId === 'pays' ? isValidCountry(raw) : true;

        let basePoints = 0;
        let speedBonus = 0;
        let isDuplicate = false;

        if (!raw || !startsWithCorrectLetter || rejectedByVote || !isOfficialCountry) {
          basePoints = 0;
          speedBonus = 0;
        } else {
          // Check duplication
          if (normalizedMap[norm] > 1) {
            basePoints = 5;
            isDuplicate = true;
          } else {
            basePoints = 10;
          }

          // Calculate speed bonus based on timeLeft
          const timeLeft = entry?.submittedAtTimeLeft ?? 0;
          const ratio = timeLeft / this.categoryDuration;
          if (ratio >= 0.65) {
            speedBonus = 3;
          } else if (ratio >= 0.35) {
            speedBonus = 2;
          } else {
            speedBonus = 1;
          }
        }

        const totalCategoryPoints = basePoints + speedBonus;
        roundPointsEarned[p.id] += totalCategoryPoints;
        this.scores[p.id] = (this.scores[p.id] || 0) + totalCategoryPoints;

        this.roundBreakdowns[p.id].push({
          categoryId: catId,
          categoryLabel: cat.label,
          categoryIcon: cat.icon,
          rawText: raw,
          basePoints,
          speedBonus,
          totalPoints: totalCategoryPoints,
          isDuplicate,
          rejected: rejectedByVote || (!startsWithCorrectLetter && Boolean(raw)) || (!isOfficialCountry && Boolean(raw)),
        });
      }
    }

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
      case 'jdp_submit_answer':
        return this.submitAnswer(playerId, data.text);
      case 'jdp_cast_vote':
        return this.castValidationVote(playerId, data.targetPlayerId, data.categoryId, data.isValid);
      case 'jdp_restart':
        this.currentRound = 1;
        for (const p of this.players) this.scores[p.id] = 0;
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
    const currentCategory = this.roundCategories[this.currentCategoryIndex] || null;
    const votingCategory = this.roundCategories[this.votingCategoryIndex] || null;

    // During category_running, hide raw texts from opponents, only expose who has answered
    let publicAnswers = {};
    if (this.phase === 'voting' || this.phase === 'round_recap' || this.phase === 'gameover') {
      for (const p of this.players) {
        publicAnswers[p.id] = {};
        for (const cat of this.roundCategories) {
          publicAnswers[p.id][cat.id] = this.answers[p.id]?.[cat.id]?.text || '';
        }
      }
    }

    return {
      gameId: 'jeu_de_pays',
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timer: this.timer,
      categoryDuration: this.categoryDuration,
      currentLetter: this.currentLetter,
      roundCategories: this.roundCategories,
      currentCategory,
      currentCategoryIndex: this.currentCategoryIndex,
      votingCategory,
      votingCategoryIndex: this.votingCategoryIndex,
      answeredPlayerIds: Array.from(this.answeredPlayersForCurrentCat),
      answers: publicAnswers,
      validationVotes: this.validationVotes,
      scores: this.scores,
      roundBreakdowns: this.roundBreakdowns,
      finalPodium: this.finalPodium,
      isGameOver: this.phase === 'gameover',
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        avatar: p.avatar,
        isBot: p.isBot,
        hasAnsweredCurrentCategory: this.answeredPlayersForCurrentCat.has(p.id),
      })),
    };
  }

  getPrivateState(playerId) {
    const currentCat = this.roundCategories[this.currentCategoryIndex];
    return {
      myAnswerForCurrentCategory: currentCat ? this.answers[playerId]?.[currentCat.id]?.text || '' : '',
      hasAnsweredCurrentCategory: this.answeredPlayersForCurrentCat.has(playerId),
      myAllAnswers: this.answers[playerId] || {},
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getPublicState());
    }
  }
}
