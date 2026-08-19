// Blackjack 21 VIP Casino Game Engine for PLAYFLIX - AI Bots Edition
// Players face the Smart TV Dealer house in a luxury casino atmosphere

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function calculateBlackjackScore(cards) {
  let score = 0;
  let aceCount = 0;

  for (const c of cards) {
    if (['J', 'Q', 'K'].includes(c.rank)) {
      score += 10;
    } else if (c.rank === 'A') {
      score += 11;
      aceCount++;
    } else {
      score += parseInt(c.rank, 10);
    }
  }

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
}

export class BlackjackEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players; // Array of Player objects with isBot
    this.deck = [];
    this.dealerHand = {
      cards: [],
      score: 0,
      isBust: false,
      isBlackjack: false,
      hideHoleCard: true,
    };
    this.playerHands = {};
    this.currentPlayerIndex = 0;
    this.gamePhase = 'player_turns';
    this.timeRemaining = 20;
    this.roundCount = 1;
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.initRound();

    this.timer = null;
    this.startTurnTimer();
    this.checkBotTurn();
  }

  initDeck() {
    this.deck = [];
    let idCounter = 0;
    for (let d = 0; d < 2; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          this.deck.push({
            id: `bj_${idCounter++}`,
            suit,
            rank,
            value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank, 10),
          });
        }
      }
    }
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  initRound() {
    this.initDeck();
    this.gamePhase = 'player_turns';
    this.currentPlayerIndex = 0;

    const dCard1 = this.deck.pop();
    const dCard2 = this.deck.pop();
    this.dealerHand = {
      cards: [dCard1, dCard2],
      score: calculateBlackjackScore([dCard1]),
      isBust: false,
      isBlackjack: calculateBlackjackScore([dCard1, dCard2]) === 21,
      hideHoleCard: true,
    };

    this.players.forEach(p => {
      const c1 = this.deck.pop();
      const c2 = this.deck.pop();
      const score = calculateBlackjackScore([c1, c2]);
      this.playerHands[p.id] = {
        cards: [c1, c2],
        score,
        isBust: false,
        isBlackjack: score === 21,
        isStand: false,
        bet: 50,
      };
    });
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  isCurrentPlayerBot() {
    const current = this.getCurrentPlayer();
    return current ? !!current.isBot : false;
  }

  startTurnTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timeRemaining = 20;
    this.timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.handleStand(this.getCurrentPlayer()?.id);
      }
      this.notify();
    }, 1000);
  }

  checkBotTurn() {
    if (this.gamePhase !== 'player_turns') return;
    if (this.isCurrentPlayerBot()) {
      setTimeout(() => {
        if (this.gamePhase === 'player_turns' && this.isCurrentPlayerBot()) {
          this.executeBotAction();
        }
      }, 1000);
    }
  }

  executeBotAction() {
    const bot = this.getCurrentPlayer();
    if (!bot) return;

    const hand = this.playerHands[bot.id];
    if (!hand || hand.isStand || hand.isBust) return;

    // Casino standard basic strategy: hit if < 17, stand on 17+
    if (hand.score < 17) {
      this.handleHit(bot.id);
      // If still < 17 and not bust, continue
      if (!hand.isBust && hand.score < 17) {
        setTimeout(() => this.executeBotAction(), 800);
      }
    } else {
      this.handleStand(bot.id);
    }
  }

  handleHit(playerId) {
    if (this.gamePhase !== 'player_turns') return;
    const currentP = this.getCurrentPlayer();
    if (!currentP || currentP.id !== playerId) return;

    const hand = this.playerHands[playerId];
    if (!hand || hand.isStand || hand.isBust) return;

    const newCard = this.deck.pop();
    hand.cards.push(newCard);
    hand.score = calculateBlackjackScore(hand.cards);

    if (hand.score > 21) {
      hand.isBust = true;
      this.advancePlayerTurn();
      return;
    }

    if (hand.score === 21) {
      hand.isStand = true;
      this.advancePlayerTurn();
      return;
    }

    this.notify();
  }

  handleStand(playerId) {
    if (this.gamePhase !== 'player_turns') return;
    const currentP = this.getCurrentPlayer();
    if (!currentP || currentP.id !== playerId) return;

    const hand = this.playerHands[playerId];
    if (hand) hand.isStand = true;

    this.advancePlayerTurn();
  }

  handleDouble(playerId) {
    if (this.gamePhase !== 'player_turns') return;
    const currentP = this.getCurrentPlayer();
    if (!currentP || currentP.id !== playerId) return;

    const hand = this.playerHands[playerId];
    if (!hand || hand.cards.length !== 2) return;

    hand.bet *= 2;
    const newCard = this.deck.pop();
    hand.cards.push(newCard);
    hand.score = calculateBlackjackScore(hand.cards);
    if (hand.score > 21) hand.isBust = true;
    hand.isStand = true;

    this.advancePlayerTurn();
  }

  advancePlayerTurn() {
    this.currentPlayerIndex++;
    if (this.currentPlayerIndex >= this.players.length) {
      this.playDealerTurn();
    } else {
      this.startTurnTimer();
      this.checkBotTurn();
      this.notify();
    }
  }

  playDealerTurn() {
    if (this.timer) clearInterval(this.timer);
    this.gamePhase = 'dealer_turn';
    this.dealerHand.hideHoleCard = false;
    this.dealerHand.score = calculateBlackjackScore(this.dealerHand.cards);
    this.notify();

    const dealerDrawInterval = setInterval(() => {
      if (this.dealerHand.score < 17) {
        const c = this.deck.pop();
        this.dealerHand.cards.push(c);
        this.dealerHand.score = calculateBlackjackScore(this.dealerHand.cards);
        if (this.dealerHand.score > 21) {
          this.dealerHand.isBust = true;
        }
        this.notify();
      } else {
        clearInterval(dealerDrawInterval);
        this.resolveRound();
      }
    }, 1000);
  }

  resolveRound() {
    this.gamePhase = 'round_over';
    const dScore = this.dealerHand.score;
    const dBust = this.dealerHand.isBust;

    for (const p of this.players) {
      const h = this.playerHands[p.id];
      if (h.isBust) {
        h.payoutStatus = 'lose';
      } else if (dBust) {
        h.payoutStatus = h.isBlackjack ? 'blackjack' : 'win';
      } else if (h.score > dScore) {
        h.payoutStatus = h.isBlackjack ? 'blackjack' : 'win';
      } else if (h.score === dScore) {
        h.payoutStatus = 'push';
      } else {
        h.payoutStatus = 'lose';
      }
    }

    this.notify();
    if (this.onGameOver) this.onGameOver(this.players[0].id);
  }

  getState() {
    return {
      dealerHand: this.dealerHand,
      playerHands: this.playerHands,
      currentPlayerId: this.gamePhase === 'player_turns' ? this.getCurrentPlayer()?.id || null : null,
      gamePhase: this.gamePhase,
      timeRemaining: this.timeRemaining,
      roundCount: this.roundCount,
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
