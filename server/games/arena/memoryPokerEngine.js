// Server Game Engine for ARENA: MEMORY POKER
// Memorization of cards grid & Poker hand optimization

const SUITS = ['spade', 'heart', 'diamond', 'club'];
const SUIT_SYMBOLS = { spade: '♠', heart: '♥', diamond: '♦', club: '♣' };
const RANK_LABELS = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
  10: '10', 9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2'
};

export function evaluatePokerHand(cards) {
  if (!cards || cards.length !== 5) {
    return { rankScore: 0, name: 'Main incomplète' };
  }

  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const ranks = sorted.map(c => c.rank);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = (
    ranks[0] - ranks[1] === 1 &&
    ranks[1] - ranks[2] === 1 &&
    ranks[2] - ranks[3] === 1 &&
    ranks[3] - ranks[4] === 1
  ) || (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2); // Roue A-2-3-4-5

  const counts = {};
  for (const r of ranks) {
    counts[r] = (counts[r] || 0) + 1;
  }
  const countValues = Object.values(counts).sort((a, b) => b - a);

  if (isFlush && isStraight) {
    if (ranks[0] === 14 && ranks[1] === 13) return { rankScore: 9000, name: 'Quinte Flush Royale !' };
    return { rankScore: 8000 + ranks[0], name: `Quinte Flush (${RANK_LABELS[ranks[0]]})` };
  }
  if (countValues[0] === 4) {
    const quadRank = Object.keys(counts).find(k => counts[k] === 4);
    return { rankScore: 7000 + Number(quadRank), name: `Carré de ${RANK_LABELS[quadRank]}` };
  }
  if (countValues[0] === 3 && countValues[1] === 2) {
    const tripsRank = Object.keys(counts).find(k => counts[k] === 3);
    return { rankScore: 6000 + Number(tripsRank), name: `Full House aux ${RANK_LABELS[tripsRank]}` };
  }
  if (isFlush) {
    return { rankScore: 5000 + ranks[0], name: `Couleur (${SUIT_SYMBOLS[suits[0]]})` };
  }
  if (isStraight) {
    return { rankScore: 4000 + ranks[0], name: `Quinte à hauteur ${RANK_LABELS[ranks[0]]}` };
  }
  if (countValues[0] === 3) {
    const tripsRank = Object.keys(counts).find(k => counts[k] === 3);
    return { rankScore: 3000 + Number(tripsRank), name: `Brelan de ${RANK_LABELS[tripsRank]}` };
  }
  if (countValues[0] === 2 && countValues[1] === 2) {
    const pairRanks = Object.keys(counts).filter(k => counts[k] === 2).map(Number).sort((a,b) => b-a);
    return { rankScore: 2000 + pairRanks[0], name: `Deux Paires (${RANK_LABELS[pairRanks[0]]} et ${RANK_LABELS[pairRanks[1]]})` };
  }
  if (countValues[0] === 2) {
    const pairRank = Object.keys(counts).find(k => counts[k] === 2);
    return { rankScore: 1000 + Number(pairRank), name: `Paire de ${RANK_LABELS[pairRank]}` };
  }

  return { rankScore: ranks[0], name: `Carte Haute (${RANK_LABELS[ranks[0]]})` };
}

export class MemoryPokerEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // S'assurer d'au moins 2 joueurs (ajouter un bot IA intelligent si solo)
    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_ai_orbit',
        name: '🤖 Orbit (IA)',
        color: 'purple',
        avatar: '🔬',
        isBot: true,
        score: 0,
      });
    }

    this.gridSize = settings.gridSize || 16; // 4x4
    this.grid = [];
    this.phase = 'memorize'; // 'memorize' | 'selection' | 'showdown' | 'ended'
    this.revealTimeLeft = 12;
    this.timerInterval = null;
    this.selectedCards = {}; // playerId -> number[]
    this.playerHands = {};
    this.winnerId = null;

    this.initRound();
  }

  generateDeck() {
    const deck = [];
    let id = 1;
    for (const suit of SUITS) {
      for (let rank = 2; rank <= 14; rank++) {
        deck.push({
          id: id++,
          suit,
          rank,
          display: `${RANK_LABELS[rank]}${SUIT_SYMBOLS[suit]}`,
        });
      }
    }
    // Mélange de Fisher-Yates
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  initRound() {
    const deck = this.generateDeck();
    this.grid = deck.slice(0, this.gridSize);
    this.phase = 'memorize';
    this.revealTimeLeft = 12;
    this.selectedCards = {};
    this.playerHands = {};
    this.winnerId = null;

    for (const p of this.players) {
      this.selectedCards[p.id] = [];
    }

    this.startMemorizeCountdown();
    this.broadcast();
  }

  startMemorizeCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.revealTimeLeft--;
      if (this.revealTimeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.phase = 'selection';
        this.broadcast();
        this.runBotSelections();
      } else {
        this.broadcast();
      }
    }, 1000);
  }

  runBotSelections() {
    for (const p of this.players) {
      if (p.isBot) {
        setTimeout(() => {
          // Simulation d'une IA intelligente qui choisit les 5 meilleures cartes selon mémoire
          const remembered = [...this.grid.keys()];
          // Tri par valeur de carte
          remembered.sort((a, b) => (this.grid[b]?.rank || 0) - (this.grid[a]?.rank || 0));
          const top5 = remembered.slice(0, 5);
          this.handleAction(p, 'select_cards', { cardIndices: top5 });
        }, 1500 + Math.random() * 2000);
      }
    }
  }

  handleAction(player, action, payload = {}) {
    if (this.phase !== 'selection') return;

    if (action === 'toggle_card') {
      const idx = Number(payload.cardIndex);
      if (isNaN(idx) || idx < 0 || idx >= this.gridSize) return;

      const current = this.selectedCards[player.id] || [];
      if (current.includes(idx)) {
        this.selectedCards[player.id] = current.filter(i => i !== idx);
      } else if (current.length < 5) {
        this.selectedCards[player.id] = [...current, idx];
      }
      this.broadcast();
      this.checkAllSubmitted();
    } else if (action === 'select_cards') {
      const indices = payload.cardIndices || [];
      if (Array.isArray(indices)) {
        this.selectedCards[player.id] = indices.slice(0, 5);
        this.broadcast();
        this.checkAllSubmitted();
      }
    }
  }

  checkAllSubmitted() {
    const allDone = this.players.every(p => (this.selectedCards[p.id] || []).length === 5);
    if (allDone) {
      this.resolveShowdown();
    }
  }

  resolveShowdown() {
    this.phase = 'showdown';
    let bestScore = -1;
    let bestPlayerId = null;

    for (const p of this.players) {
      const indices = this.selectedCards[p.id] || [];
      const cards = indices.map(i => this.grid[i]).filter(Boolean);
      const evalResult = evaluatePokerHand(cards);
      this.playerHands[p.id] = {
        handName: evalResult.name,
        scoreRank: evalResult.rankScore,
        cards,
      };

      if (evalResult.rankScore > bestScore) {
        bestScore = evalResult.rankScore;
        bestPlayerId = p.id;
      }
    }

    this.winnerId = bestPlayerId;
    if (bestPlayerId) {
      const winner = this.players.find(p => p.id === bestPlayerId);
      if (winner) winner.score += 100;
    }

    this.broadcast();

    setTimeout(() => {
      this.phase = 'ended';
      this.broadcast();
      if (typeof this.onGameOver === 'function') {
        this.onGameOver(this.winnerId);
      }
    }, 5000);
  }

  getState() {
    return {
      grid: this.grid,
      gridSize: this.gridSize,
      phase: this.phase,
      revealTimeLeft: this.revealTimeLeft,
      revealedCards: this.phase === 'memorize' || this.phase === 'showdown' || this.phase === 'ended'
        ? Array.from(this.grid.keys())
        : [],
      selectedCards: this.selectedCards,
      playerHands: this.playerHands,
      winnerId: this.winnerId,
    };
  }

  getPublicState() {
    // Pendant la phase de sélection, cacher la grille sur la TV si elle n'est plus mémorisée
    const hideGrid = this.phase === 'selection';
    return {
      arenaGameId: 'memory_poker',
      grid: hideGrid ? this.grid.map(() => null) : this.grid,
      gridSize: this.gridSize,
      phase: this.phase,
      revealTimeLeft: this.revealTimeLeft,
      selectedCount: Object.fromEntries(
        Object.entries(this.selectedCards).map(([pid, list]) => [pid, list.length])
      ),
      playerHands: this.phase === 'showdown' || this.phase === 'ended' ? this.playerHands : {},
      winnerId: this.winnerId,
    };
  }

  getPrivateState(playerId) {
    return {
      mySelectedIndices: this.selectedCards[playerId] || [],
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
    }
  }
}
