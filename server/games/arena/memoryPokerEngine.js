// Server Game Engine for ARENA: MEMORY POKER
// Features: 16-card 4x4 grid + 3 Community Cards, Memorization phase, 2-Card Selection, 10-tier Hand Evaluation

const SUITS = ['spade', 'heart', 'diamond', 'club'];
const SUIT_SYMBOLS = { spade: '♠', heart: '♥', diamond: '♦', club: '♣' };
const RANK_LABELS = {
  14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: '10',
  9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2',
};

const DIFFICULTY_SETTINGS = {
  easy: { memoSeconds: 30, decisionSeconds: 90, multiplier: 1.0 },
  normal: { memoSeconds: 20, decisionSeconds: 60, multiplier: 1.5 },
  hard: { memoSeconds: 12, decisionSeconds: 35, multiplier: 2.2 },
  practice: { memoSeconds: 45, decisionSeconds: 180, multiplier: 0 },
};

const TIER_POINTS = {
  10: 2500, // Royal Flush
  9: 1500,  // Straight Flush
  8: 1000,  // Four of a Kind
  7: 750,   // Full House
  6: 500,   // Flush
  5: 400,   // Straight
  4: 250,   // Three of a Kind
  3: 150,   // Two Pair
  2: 75,    // One Pair
  1: 25,    // High Card
};

function checkStraight(ranksDescending) {
  if (ranksDescending.length !== 5) return { isStraight: false, highestRank: 0 };
  const isNormal =
    ranksDescending[0] - ranksDescending[1] === 1 &&
    ranksDescending[1] - ranksDescending[2] === 1 &&
    ranksDescending[2] - ranksDescending[3] === 1 &&
    ranksDescending[3] - ranksDescending[4] === 1;

  if (isNormal) return { isStraight: true, highestRank: ranksDescending[0] };

  if (
    ranksDescending[0] === 14 &&
    ranksDescending[1] === 5 &&
    ranksDescending[2] === 4 &&
    ranksDescending[3] === 3 &&
    ranksDescending[4] === 2
  ) {
    return { isStraight: true, highestRank: 5 }; // Ace-low wheel
  }

  return { isStraight: false, highestRank: 0 };
}

function encodeKickers(kickers) {
  let val = 0;
  for (const k of kickers) val = val * 15 + k;
  return val;
}

export function evaluatePokerHand(cards) {
  if (!cards || cards.length !== 5) {
    return { tier: 0, scoreValue: 0, rankScore: 0, name: 'Main incomplète', frenchName: 'Incomplète' };
  }

  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const ranks = sorted.map(c => c.rank);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const straight = checkStraight(ranks);
  const isStraight = straight.isStraight;
  const straightHighRank = straight.highestRank;

  const countMap = {};
  for (const r of ranks) countMap[r] = (countMap[r] || 0) + 1;
  const rankCounts = Object.entries(countMap)
    .map(([r, c]) => ({ rank: Number(r), count: c }))
    .sort((a, b) => b.count !== a.count ? b.count - a.count : b.rank - a.rank);

  const suitSym = SUIT_SYMBOLS[suits[0]] || '';

  // 10. Royal Flush
  if (isFlush && isStraight && straightHighRank === 14) {
    return {
      tier: 10,
      scoreValue: 100000000,
      rankScore: 9000,
      name: `Quinte Flush Royale (${suitSym})`,
      frenchName: `Quinte Flush Royale (${suitSym})`,
      primaryRank: 14,
      kickers: [],
      cards: sorted,
    };
  }

  // 9. Straight Flush
  if (isFlush && isStraight) {
    return {
      tier: 9,
      scoreValue: 90000000 + straightHighRank * 100000,
      rankScore: 8000 + straightHighRank,
      name: `Quinte Flush ${RANK_LABELS[straightHighRank]} (${suitSym})`,
      frenchName: `Quinte Flush ${RANK_LABELS[straightHighRank]} (${suitSym})`,
      primaryRank: straightHighRank,
      kickers: [],
      cards: sorted,
    };
  }

  // 8. Four of a Kind
  if (rankCounts[0].count === 4) {
    const quad = rankCounts[0].rank;
    const kicker = rankCounts[1].rank;
    return {
      tier: 8,
      scoreValue: 80000000 + quad * 100000 + kicker,
      rankScore: 7000 + quad * 10 + kicker,
      name: `Carré de ${RANK_LABELS[quad]}`,
      frenchName: `Carré de ${RANK_LABELS[quad]}`,
      primaryRank: quad,
      kickers: [kicker],
      cards: sorted.filter(c => c.rank === quad).concat(sorted.filter(c => c.rank !== quad)),
    };
  }

  // 7. Full House
  if (rankCounts[0].count === 3 && rankCounts[1].count === 2) {
    const trips = rankCounts[0].rank;
    const pair = rankCounts[1].rank;
    return {
      tier: 7,
      scoreValue: 70000000 + trips * 100000 + pair * 1000,
      rankScore: 6000 + trips * 10 + pair,
      name: `Full House aux ${RANK_LABELS[trips]} par les ${RANK_LABELS[pair]}`,
      frenchName: `Full House aux ${RANK_LABELS[trips]} par les ${RANK_LABELS[pair]}`,
      primaryRank: trips,
      secondaryRank: pair,
      kickers: [],
      cards: sorted.filter(c => c.rank === trips).concat(sorted.filter(c => c.rank !== pair)),
    };
  }

  // 6. Flush
  if (isFlush) {
    return {
      tier: 6,
      scoreValue: 60000000 + encodeKickers(ranks),
      rankScore: 5000 + ranks[0],
      name: `Couleur ${suitSym} (Hauteur ${RANK_LABELS[ranks[0]]})`,
      frenchName: `Couleur ${suitSym} (Hauteur ${RANK_LABELS[ranks[0]]})`,
      primaryRank: ranks[0],
      kickers: ranks.slice(1),
      cards: sorted,
    };
  }

  // 5. Straight
  if (isStraight) {
    return {
      tier: 5,
      scoreValue: 50000000 + straightHighRank * 100000,
      rankScore: 4000 + straightHighRank,
      name: `Quinte à hauteur ${RANK_LABELS[straightHighRank]}`,
      frenchName: `Quinte à hauteur ${RANK_LABELS[straightHighRank]}`,
      primaryRank: straightHighRank,
      kickers: [],
      cards: sorted,
    };
  }

  // 4. Three of a Kind
  if (rankCounts[0].count === 3) {
    const trips = rankCounts[0].rank;
    const kickers = [rankCounts[1].rank, rankCounts[2].rank];
    return {
      tier: 4,
      scoreValue: 40000000 + trips * 100000 + encodeKickers(kickers),
      rankScore: 3000 + trips,
      name: `Brelan de ${RANK_LABELS[trips]}`,
      frenchName: `Brelan de ${RANK_LABELS[trips]}`,
      primaryRank: trips,
      kickers,
      cards: sorted.filter(c => c.rank === trips).concat(sorted.filter(c => c.rank !== trips)),
    };
  }

  // 3. Two Pair
  if (rankCounts[0].count === 2 && rankCounts[1].count === 2) {
    const highPair = Math.max(rankCounts[0].rank, rankCounts[1].rank);
    const lowPair = Math.min(rankCounts[0].rank, rankCounts[1].rank);
    const kicker = rankCounts[2].rank;
    return {
      tier: 3,
      scoreValue: 30000000 + highPair * 100000 + lowPair * 1000 + kicker,
      rankScore: 2000 + highPair * 10 + lowPair,
      name: `Deux Paires (${RANK_LABELS[highPair]} et ${RANK_LABELS[lowPair]})`,
      frenchName: `Deux Paires (${RANK_LABELS[highPair]} et ${RANK_LABELS[lowPair]})`,
      primaryRank: highPair,
      secondaryRank: lowPair,
      kickers: [kicker],
      cards: sorted
        .filter(c => c.rank === highPair)
        .concat(sorted.filter(c => c.rank === lowPair))
        .concat(sorted.filter(c => c.rank !== highPair && c.rank !== lowPair)),
    };
  }

  // 2. One Pair
  if (rankCounts[0].count === 2) {
    const pair = rankCounts[0].rank;
    const kickers = [rankCounts[1].rank, rankCounts[2].rank, rankCounts[3].rank];
    return {
      tier: 2,
      scoreValue: 20000000 + pair * 100000 + encodeKickers(kickers),
      rankScore: 1000 + pair,
      name: `Paire de ${RANK_LABELS[pair]}`,
      frenchName: `Paire de ${RANK_LABELS[pair]}`,
      primaryRank: pair,
      kickers,
      cards: sorted.filter(c => c.rank === pair).concat(sorted.filter(c => c.rank !== pair)),
    };
  }

  // 1. High Card
  const highRank = ranks[0];
  const kickers = ranks.slice(1);
  return {
    tier: 1,
    scoreValue: 10000000 + encodeKickers(ranks),
    rankScore: highRank,
    name: `Carte Haute ${RANK_LABELS[highRank]}`,
    frenchName: `Carte Haute (${RANK_LABELS[highRank]})`,
    primaryRank: highRank,
    kickers,
    cards: sorted,
  };
}

export class MemoryPokerEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Solo mode: add smart AI rival
    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_ai_orbit',
        name: '🤖 Orbit AI',
        color: 'purple',
        avatar: '🧠',
        isBot: true,
        score: 0,
      });
    }

    this.difficulty = settings.difficulty || 'normal';
    const cfg = DIFFICULTY_SETTINGS[this.difficulty] || DIFFICULTY_SETTINGS.normal;
    this.memoDuration = cfg.memoSeconds;
    this.decisionDuration = cfg.decisionSeconds;

    this.currentRound = 1;
    this.totalRounds = settings.totalRounds || 3;
    this.grid = [];             // 16 cards (indices 0..15)
    this.communityCards = [];    // 3 cards (revealed after memo)
    this.phase = 'memorize';    // 'memorize' | 'selection' | 'showdown' | 'ended'
    this.timeLeft = this.memoDuration;
    this.timerInterval = null;
    this.selectedCards = {};    // playerId -> number[] (exactly 2 indices)
    this.confirmedPlayers = {}; // playerId -> boolean
    this.playerHands = {};      // playerId -> evaluation result
    this.winnerId = null;
    this.startTime = Date.now();
    this.selectionStartTime = 0;

    this.initRound();
  }

  generateDeck() {
    const deck = [];
    for (const suit of SUITS) {
      const isRed = suit === 'heart' || suit === 'diamond';
      for (let rank = 2; rank <= 14; rank++) {
        deck.push({
          id: `${suit}_${rank}`,
          suit,
          rank,
          display: RANK_LABELS[rank],
          symbol: SUIT_SYMBOLS[suit],
          color: isRed ? 'red' : 'black',
        });
      }
    }
    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  initRound() {
    const deck = this.generateDeck();
    this.grid = deck.slice(0, 16);
    this.communityCards = deck.slice(16, 19);
    this.phase = 'memorize';
    this.timeLeft = this.memoDuration;
    this.selectedCards = {};
    this.confirmedPlayers = {};
    this.playerHands = {};
    this.winnerId = null;

    for (const p of this.players) {
      this.selectedCards[p.id] = [];
      this.confirmedPlayers[p.id] = false;
    }

    this.startMemorizeCountdown();
    this.broadcast();
  }

  startMemorizeCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.transitionToSelection();
      } else {
        this.broadcast();
      }
    }, 1000);
  }

  transitionToSelection() {
    this.phase = 'selection';
    this.timeLeft = this.decisionDuration;
    this.selectionStartTime = Date.now();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.autoCompleteSelections();
        this.evaluateShowdown();
      } else {
        this.broadcast();
      }
    }, 1000);

    this.broadcast();
    this.runBotSelections();
  }

  runBotSelections() {
    // If bots are in room, simulate realistic memory decision
    const bots = this.players.filter(p => p.isBot);
    for (const bot of bots) {
      setTimeout(() => {
        if (this.phase !== 'selection') return;
        // Evaluate all pairs in grid to find best or decent hand
        let bestPair = [0, 1];
        let bestScore = -1;
        const accuracy = this.difficulty === 'hard' ? 0.95 : this.difficulty === 'normal' ? 0.75 : 0.5;

        for (let i = 0; i < 16; i++) {
          for (let j = i + 1; j < 16; j++) {
            const fiveCards = [this.grid[i], this.grid[j], ...this.communityCards];
            const ev = evaluatePokerHand(fiveCards);
            if (ev.scoreValue > bestScore) {
              bestScore = ev.scoreValue;
              bestPair = [i, j];
            }
          }
        }

        // Apply inaccuracy if not perfect
        if (Math.random() > accuracy) {
          bestPair = [Math.floor(Math.random() * 16), Math.floor(Math.random() * 16)];
          while (bestPair[0] === bestPair[1]) {
            bestPair[1] = Math.floor(Math.random() * 16);
          }
        }

        this.selectedCards[bot.id] = bestPair;
        this.confirmedPlayers[bot.id] = true;
        this.broadcast();
        this.checkAllSubmitted();
      }, 3000 + Math.random() * 4000);
    }
  }

  autoCompleteSelections() {
    for (const p of this.players) {
      if ((this.selectedCards[p.id] || []).length < 2) {
        const current = [...(this.selectedCards[p.id] || [])];
        while (current.length < 2) {
          const rand = Math.floor(Math.random() * 16);
          if (!current.includes(rand)) current.push(rand);
        }
        this.selectedCards[p.id] = current;
        this.confirmedPlayers[p.id] = true;
      }
    }
  }

  checkAllSubmitted() {
    const allDone = this.players.every(p => {
      const selected = this.selectedCards[p.id] || [];
      return selected.length === 2 && (this.confirmedPlayers[p.id] || p.isBot);
    });

    if (allDone && this.phase === 'selection') {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.evaluateShowdown();
    }
  }

  evaluateShowdown() {
    this.phase = 'showdown';
    const decisionTimeUsed = Math.max(1, Math.round((Date.now() - this.selectionStartTime) / 1000));
    const cfg = DIFFICULTY_SETTINGS[this.difficulty] || DIFFICULTY_SETTINGS.normal;

    let bestScore = -1;
    let winningPlayerId = null;

    for (const p of this.players) {
      const indices = this.selectedCards[p.id] || [0, 1];
      const chosenCards = indices.map(idx => this.grid[idx]).filter(Boolean);
      const fiveCards = [...chosenCards, ...this.communityCards];
      const evaluation = evaluatePokerHand(fiveCards);

      const basePts = TIER_POINTS[evaluation.tier] || 25;
      const remainingSeconds = Math.max(0, this.decisionDuration - decisionTimeUsed);
      const speedBonus = this.decisionDuration > 0
        ? Math.round((remainingSeconds / this.decisionDuration) * 200)
        : 0;

      const totalRoundScore = Math.round((basePts + speedBonus) * cfg.multiplier);

      this.playerHands[p.id] = {
        chosenIndices: indices,
        chosenCards,
        fiveCards,
        evaluation,
        basePts,
        speedBonus,
        totalRoundScore,
      };

      p.score = (p.score || 0) + totalRoundScore;

      if (evaluation.scoreValue > bestScore) {
        bestScore = evaluation.scoreValue;
        winningPlayerId = p.id;
      }
    }

    this.winnerId = winningPlayerId;
    this.broadcast();

    // Trigger end after showdown celebration
    setTimeout(() => {
      this.phase = 'ended';
      this.broadcast();
      if (typeof this.onGameOver === 'function') {
        const finalScores = this.players.map(p => ({
          id: p.id,
          name: p.name,
          score: p.score || 0,
        })).sort((a, b) => b.score - a.score);

        this.onGameOver({
          winnerId: this.winnerId,
          finalScores,
        });
      }
    }, 4500);
  }

  handleAction(playerOrId, action, payload = {}) {
    const playerId = typeof playerOrId === 'object' && playerOrId !== null
      ? playerOrId.id
      : String(playerOrId);

    if (action === 'confirm_ready') {
      // Early transition to selection if user finished memorizing
      if (this.phase === 'memorize') {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.transitionToSelection();
      }
      return;
    }

    if (action === 'restart' || action === 'reset_round') {
      this.currentRound = 1;
      this.initRound();
      return;
    }

    if (action === 'next_round') {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        this.initRound();
      }
      return;
    }

    if (this.phase !== 'selection') return;

    if (action === 'select_cards') {
      const indices = Array.isArray(payload && payload.cardIndices) ? payload.cardIndices.slice(0, 2) : [];
      if (!this.confirmedPlayers[playerId]) {
        this.selectedCards[playerId] = indices;
        this.broadcast();
      }
      return;
    }

    if (action === 'toggle_card' || action === 'select_card') {
      const idx = Number(payload.cardIndex);
      if (isNaN(idx) || idx < 0 || idx >= 16) return;
      if (this.confirmedPlayers[playerId]) return;

      const current = this.selectedCards[playerId] || [];
      if (current.includes(idx)) {
        this.selectedCards[playerId] = current.filter(i => i !== idx);
      } else if (current.length < 2) {
        this.selectedCards[playerId] = [...current, idx];
      }
      this.broadcast();
    } else if (action === 'confirm_selection') {
      const current = this.selectedCards[playerId] || [];
      if (current.length === 2) {
        this.confirmedPlayers[playerId] = true;
        this.broadcast();
        this.checkAllSubmitted();
      }
    }
  }

  getState() {
    // Anti-cheat: during 'selection' phase, the client only sees positions, not secret face-down values
    const publicGrid = this.phase === 'memorize' || this.phase === 'showdown' || this.phase === 'ended'
      ? this.grid
      : this.grid.map((card, idx) => ({
          id: `hidden_${idx}`,
          position: idx,
          isHidden: true,
        }));

    return {
      arenaGameId: 'memory_poker',
      difficulty: this.difficulty,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      phase: this.phase,
      timeLeft: this.timeLeft,
      memoDuration: this.memoDuration,
      decisionDuration: this.decisionDuration,
      grid: publicGrid,
      communityCards: this.phase === 'memorize' ? [] : this.communityCards,
      selectedCards: this.selectedCards,
      confirmedPlayers: this.confirmedPlayers,
      playerHands: this.playerHands,
      winnerId: this.winnerId,
    };
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
