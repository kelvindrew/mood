// Server Game Engine for "LE PETIT BAC MULTIJOUEUR" (Scattergories)
// Fast-paced word association, rapid writing, and communal validation voting

export const PETIT_BAC_CATEGORIES = [
  { id: 'prenom', label: 'Prénom', icon: '👤' },
  { id: 'pays_ville', label: 'Pays ou Ville', icon: '🌍' },
  { id: 'animal', label: 'Animal', icon: '🐾' },
  { id: 'metier', label: 'Métier', icon: '💼' },
  { id: 'aliment', label: 'Aliment / Plat', icon: '🍕' },
  { id: 'objet', label: 'Objet du quotidien', icon: '📦' },
  { id: 'marque', label: 'Marque', icon: '🏷️' },
  { id: 'celebrite', label: 'Célébrité / Artiste', icon: '⭐' },
  { id: 'vegetal', label: 'Fruit / Légume / Fleur', icon: '🌿' },
  { id: 'sport', label: 'Sport ou Loisir', icon: '⚽' },
];

export const PLAYABLE_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'V'
];

export class PetitBacEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map((p, idx) =>
      typeof p === 'string'
        ? { id: p, name: p, color: 'blue', isBot: false }
        : { ...p }
    );

    // If fewer than 2 players, add friendly bot companions
    const botNames = ['🤖 Professeur Dico', '🤖 Lexi Bot'];
    let botIdx = 0;
    while (this.players.length < 2) {
      this.players.push({
        id: `bot_bac_${Date.now()}_${botIdx}`,
        name: botNames[botIdx] || `Bot ${botIdx + 1}`,
        color: ['purple', 'orange'][botIdx] || 'purple',
        avatar: '🎓',
        isBot: true,
      });
      botIdx++;
    }

    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    this.totalRounds = Number(settings?.totalRounds || 3);
    this.currentRound = 1;
    this.phase = 'wheel'; // 'wheel' | 'writing' | 'voting' | 'round_recap' | 'gameover'
    this.timer = 6;
    this.timerInterval = null;

    this.currentLetter = 'A';
    this.currentCategories = []; // Array of 5 category objects

    this.answers = {}; // playerId -> { [categoryId]: string }
    this.finishedPlayers = new Set();
    this.hasStopBeenTriggered = false;

    // Voting state: iterates category by category
    this.votingCategoryIndex = 0;
    this.validationVotes = {}; // `${targetPlayerId}_${categoryId}` -> { voterId: boolean }

    this.scores = {};
    for (const p of this.players) {
      this.scores[p.id] = 0;
    }

    this.finalPodium = null;
    this.startRound();
  }

  startRound() {
    this.clearTimer();
    this.phase = 'wheel';
    this.timer = 5;
    this.hasStopBeenTriggered = false;
    this.finishedPlayers.clear();
    this.answers = {};
    for (const p of this.players) {
      this.answers[p.id] = {};
    }

    // Pick random letter
    this.currentLetter = PLAYABLE_LETTERS[Math.floor(Math.random() * PLAYABLE_LETTERS.length)];

    // Pick 5 distinct categories
    const shuffledCategories = [...PETIT_BAC_CATEGORIES].sort(() => Math.random() - 0.5);
    this.currentCategories = shuffledCategories.slice(0, 5);

    this.startTimer(() => {
      this.startWritingPhase();
    });
    this.notify();
  }

  startWritingPhase() {
    this.clearTimer();
    this.phase = 'writing';
    this.timer = 60; // 60 seconds base writing time

    this.startTimer(() => {
      this.finishWritingPhase();
    });
    this.notify();

    // Trigger Bot Answers simulation
    this.triggerBotAnswers();
  }

  triggerBotAnswers() {
    if (this.phase !== 'writing') return;
    const letter = this.currentLetter;

    for (const bot of this.players.filter((p) => p.isBot)) {
      setTimeout(() => {
        if (this.phase !== 'writing') return;
        const botAnswers = {};
        for (const cat of this.currentCategories) {
          botAnswers[cat.id] = `${letter}${cat.label.slice(0, 4)}e`;
        }
        this.submitAnswers(bot.id, botAnswers, false);
      }, 15000 + Math.random() * 20000);
    }
  }

  submitAnswers(playerId, answersMap, triggerStop = false) {
    if (this.phase !== 'writing') return { success: false, error: 'Phase d’écriture terminée' };

    this.answers[playerId] = { ...(this.answers[playerId] || {}), ...answersMap };
    this.finishedPlayers.add(playerId);

    // If player explicitly triggered STOP
    if (triggerStop && !this.hasStopBeenTriggered) {
      this.hasStopBeenTriggered = true;
      // Rush timer: reduce to 10 seconds if greater
      if (this.timer > 10) {
        this.timer = 10;
      }
    }

    // If all alive human players finished, end early
    if (this.finishedPlayers.size >= this.players.length) {
      this.finishWritingPhase();
    } else {
      this.notify();
    }

    return { success: true };
  }

  finishWritingPhase() {
    this.clearTimer();
    this.phase = 'voting';
    this.votingCategoryIndex = 0;
    this.validationVotes = {};
    this.timer = 20;

    this.startTimer(() => {
      this.advanceVotingCategory();
    });
    this.notify();

    this.triggerBotVotes();
  }

  triggerBotVotes() {
    if (this.phase !== 'voting') return;
    const cat = this.currentCategories[this.votingCategoryIndex];
    if (!cat) return;

    for (const bot of this.players.filter((p) => p.isBot)) {
      for (const target of this.players) {
        if (target.id === bot.id) continue;
        const answer = (this.answers[target.id]?.[cat.id] || '').trim();
        // Bot approves if starts with correct letter and has length >= 2
        const isValid = answer.toUpperCase().startsWith(this.currentLetter) && answer.length >= 2;
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

    if (this.votingCategoryIndex >= this.currentCategories.length) {
      // All categories voted on! Compute round scores
      this.computeRoundScores();
    } else {
      this.timer = 20;
      this.startTimer(() => {
        this.advanceVotingCategory();
      });
      this.notify();
      this.triggerBotVotes();
    }
  }

  computeRoundScores() {
    this.clearTimer();

    // Score rules:
    // +10 pts: Valid & Unique answer
    // +5 pts: Valid but Duplicate answer (another player wrote the exact same word)
    // 0 pt: Empty, wrong initial letter, or rejected by majority vote

    for (const cat of this.currentCategories) {
      const catId = cat.id;

      // Group answers to find duplicates
      const answerCounts = {};
      for (const p of this.players) {
        const rawAns = (this.answers[p.id]?.[catId] || '').trim().toLowerCase();
        if (rawAns) {
          answerCounts[rawAns] = (answerCounts[rawAns] || 0) + 1;
        }
      }

      for (const p of this.players) {
        const rawAns = (this.answers[p.id]?.[catId] || '').trim().toLowerCase();
        if (!rawAns || !rawAns.toUpperCase().startsWith(this.currentLetter)) {
          continue; // 0 point
        }

        // Check communal votes
        const key = `${p.id}_${catId}`;
        const votesObj = this.validationVotes[key] || {};
        const votesArr = Object.values(votesObj);
        const rejects = votesArr.filter((v) => v === false).length;
        const accepts = votesArr.filter((v) => v === true).length;

        // If explicitly rejected by more than half the voters, 0 pts
        if (rejects > accepts && rejects >= 2) {
          continue;
        }

        // Check if duplicate
        if (answerCounts[rawAns] > 1) {
          this.scores[p.id] = (this.scores[p.id] || 0) + 5;
        } else {
          this.scores[p.id] = (this.scores[p.id] || 0) + 10;
        }
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
      case 'bac_submit_answers':
        return this.submitAnswers(playerId, data.answers || {}, data.triggerStop || false);
      case 'bac_cast_vote':
        return this.castValidationVote(playerId, data.targetPlayerId, data.categoryId, data.isValid);
      case 'bac_restart':
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
    const currentCategory = this.currentCategories[this.votingCategoryIndex] || null;

    return {
      gameId: 'petit_bac',
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timer: this.timer,
      currentLetter: this.currentLetter,
      currentCategories: this.currentCategories,
      votingCategory: currentCategory,
      votingCategoryIndex: this.votingCategoryIndex,
      hasStopBeenTriggered: this.hasStopBeenTriggered,
      finishedPlayerIds: Array.from(this.finishedPlayers),
      answers: this.phase === 'writing' ? {} : this.answers, // Hide answers until voting phase
      validationVotes: this.validationVotes,
      scores: this.scores,
      finalPodium: this.finalPodium,
      isGameOver: this.phase === 'gameover',
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        avatar: p.avatar,
        isBot: p.isBot,
        hasFinished: this.finishedPlayers.has(p.id),
      })),
    };
  }

  getPrivateState(playerId) {
    return {
      myAnswers: this.answers[playerId] || {},
      hasFinished: this.finishedPlayers.has(playerId),
      myVotes: Object.entries(this.validationVotes)
        .filter(([, v]) => v[playerId] !== undefined)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v[playerId] }), {}),
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getPublicState());
    }
  }
}
