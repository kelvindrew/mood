// Texas Hold'em Poker Game Engine for PLAYFLIX - AI Bots Edition
// Multi-player salon poker with community cards on TV & secret hole cards on smartphone

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

export class PokerEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players; // Array of Player objects with isBot
    this.deck = [];
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 20;
    this.stage = 'preflop';
    this.dealerIndex = 0;
    this.currentTurnIndex = 0;
    this.playerChips = {};
    this.playerBets = {};
    this.playerHands = {};
    this.foldedPlayers = [];
    this.turnTimeLeft = 25;
    this.winnerId = null;
    this.winningHandName = '';
    this.lastActionLog = 'Nouvelle main de Poker Texas Hold’em ! Blinds posées.';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.players.forEach(p => {
      this.playerChips[p.id] = 1000;
      this.playerBets[p.id] = 0;
      this.playerHands[p.id] = [];
    });

    this.initHand();

    this.timer = null;
    this.startTurnTimer();
    this.checkBotTurn();
  }

  initDeck() {
    this.deck = [];
    let idCounter = 0;
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.deck.push({
          id: `pok_${idCounter++}`,
          suit,
          rank,
          value: RANK_VALUES[rank],
        });
      }
    }
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  initHand() {
    this.initDeck();
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 20;
    this.stage = 'preflop';
    this.foldedPlayers = [];
    this.winnerId = null;
    this.winningHandName = '';

    const sbPlayer = this.players[this.dealerIndex % this.players.length];
    const bbPlayer = this.players[(this.dealerIndex + 1) % this.players.length];

    this.playerChips[sbPlayer.id] -= 10;
    this.playerBets[sbPlayer.id] = 10;
    this.playerChips[bbPlayer.id] -= 20;
    this.playerBets[bbPlayer.id] = 20;
    this.pot = 30;

    this.players.forEach(p => {
      this.playerHands[p.id] = [this.deck.pop(), this.deck.pop()];
    });

    this.currentTurnIndex = (this.dealerIndex + 2) % this.players.length;
    this.lastActionLog = `Pre-flop : Au tour de ${this.getCurrentPlayer()?.name}`;
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex];
  }

  isCurrentPlayerBot() {
    const current = this.getCurrentPlayer();
    return current ? !!current.isBot : false;
  }

  startTurnTimer() {
    if (this.timer) clearInterval(this.timer);
    this.turnTimeLeft = 25;
    this.timer = setInterval(() => {
      this.turnTimeLeft--;
      if (this.turnTimeLeft <= 0) {
        this.handleFold(this.getCurrentPlayer()?.id);
      }
      this.notify();
    }, 1000);
  }

  checkBotTurn() {
    if (this.winnerId || this.stage === 'showdown') return;
    if (this.isCurrentPlayerBot()) {
      setTimeout(() => {
        if (this.isCurrentPlayerBot()) {
          this.executeBotAction();
        }
      }, 1200);
    }
  }

  executeBotAction() {
    const bot = this.getCurrentPlayer();
    if (!bot) return;

    const playerBet = this.playerBets[bot.id] || 0;
    const toCall = this.currentBet - playerBet;

    if (toCall === 0) {
      this.handleCheckCall(bot.id);
    } else if (toCall <= 40) {
      this.handleCheckCall(bot.id);
    } else {
      // 70% call, 30% fold
      if (Math.random() < 0.7) {
        this.handleCheckCall(bot.id);
      } else {
        this.handleFold(bot.id);
      }
    }
  }

  handleCheckCall(playerId) {
    const currentP = this.getCurrentPlayer();
    if (!currentP || currentP.id !== playerId) return;

    const currentBet = this.currentBet;
    const playerBet = this.playerBets[playerId] || 0;
    const toCall = currentBet - playerBet;

    if (toCall > 0) {
      const callAmount = Math.min(toCall, this.playerChips[playerId] || 0);
      this.playerChips[playerId] -= callAmount;
      this.playerBets[playerId] = playerBet + callAmount;
      this.pot += callAmount;
      this.lastActionLog = `${currentP.name} suit (${callAmount} $)`;
    } else {
      this.lastActionLog = `${currentP.name} check / parole`;
    }

    this.advanceBettingTurn();
  }

  handleRaise(playerId, raiseAmount = 40) {
    const currentP = this.getCurrentPlayer();
    if (!currentP || currentP.id !== playerId) return;

    const playerBet = this.playerBets[playerId] || 0;
    const totalNewBet = this.currentBet + raiseAmount;
    const toPay = totalNewBet - playerBet;
    const actualPay = Math.min(toPay, this.playerChips[playerId] || 0);

    this.playerChips[playerId] -= actualPay;
    this.playerBets[playerId] = playerBet + actualPay;
    this.currentBet = totalNewBet;
    this.pot += actualPay;

    this.lastActionLog = `🔥 ${currentP.name} relance à ${this.currentBet} $ !`;
    this.advanceBettingTurn();
  }

  handleFold(playerId) {
    const currentP = this.getCurrentPlayer();
    if (!currentP || currentP.id !== playerId) return;

    if (!this.foldedPlayers.includes(playerId)) {
      this.foldedPlayers.push(playerId);
    }
    this.lastActionLog = `${currentP.name} se couche.`;

    const activePlayers = this.players.filter(p => !this.foldedPlayers.includes(p.id));
    if (activePlayers.length === 1) {
      this.endHandWithWinner(activePlayers[0].id, 'Dernier joueur en jeu');
      return;
    }

    this.advanceBettingTurn();
  }

  advanceBettingTurn() {
    const activePlayers = this.players.filter(p => !this.foldedPlayers.includes(p.id));
    const allBetsEqual = activePlayers.every(p => (this.playerBets[p.id] || 0) === this.currentBet);

    let nextIdx = (this.currentTurnIndex + 1) % this.players.length;
    let loop = 0;
    while (this.foldedPlayers.includes(this.players[nextIdx].id)) {
      nextIdx = (nextIdx + 1) % this.players.length;
      loop++;
      if (loop > this.players.length * 2) break;
    }

    if (allBetsEqual && loop > 0) {
      this.advanceStage();
    } else {
      this.currentTurnIndex = nextIdx;
      this.startTurnTimer();
      this.checkBotTurn();
      this.notify();
    }
  }

  advanceStage() {
    this.players.forEach(p => this.playerBets[p.id] = 0);
    this.currentBet = 0;

    if (this.stage === 'preflop') {
      this.stage = 'flop';
      this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
      this.lastActionLog = 'Le FLOP est dévoilé sur la TV !';
    } else if (this.stage === 'flop') {
      this.stage = 'turn';
      this.communityCards.push(this.deck.pop());
      this.lastActionLog = 'La TURN est dévoilée sur la TV !';
    } else if (this.stage === 'turn') {
      this.stage = 'river';
      this.communityCards.push(this.deck.pop());
      this.lastActionLog = 'La RIVER est dévoilée sur la TV !';
    } else if (this.stage === 'river') {
      this.stage = 'showdown';
      this.evaluateShowdown();
      return;
    }

    this.currentTurnIndex = (this.dealerIndex + 1) % this.players.length;
    while (this.foldedPlayers.includes(this.players[this.currentTurnIndex].id)) {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    }

    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();
  }

  evaluateShowdown() {
    if (this.timer) clearInterval(this.timer);
    const activePlayers = this.players.filter(p => !this.foldedPlayers.includes(p.id));

    let bestScore = -1;
    let bestPlayerId = activePlayers[0]?.id || this.players[0].id;

    for (const p of activePlayers) {
      const hand = this.playerHands[p.id] || [];
      const score = hand.reduce((sum, c) => sum + c.value, 0);
      if (score > bestScore) {
        bestScore = score;
        bestPlayerId = p.id;
      }
    }

    this.endHandWithWinner(bestPlayerId, 'Paire Max / Carte Haute');
  }

  endHandWithWinner(winnerId, handName) {
    if (this.timer) clearInterval(this.timer);
    this.winnerId = winnerId;
    this.winningHandName = handName;
    const winnerPlayer = this.players.find(p => p.id === winnerId);

    this.playerChips[winnerId] = (this.playerChips[winnerId] || 0) + this.pot;
    this.lastActionLog = `🏆 ${winnerPlayer?.name} remporte le pot de ${this.pot} $ (${handName}) !`;

    this.notify();
    if (this.onGameOver) this.onGameOver(winnerId);
  }

  getState() {
    return {
      stage: this.stage,
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.currentBet,
      dealerIndex: this.dealerIndex,
      currentTurnPlayerId: this.getCurrentPlayer()?.id || '',
      playerChips: this.playerChips,
      playerBets: this.playerBets,
      playerHands: this.playerHands,
      foldedPlayers: this.foldedPlayers,
      turnTimeLeft: this.turnTimeLeft,
      lastActionLog: this.lastActionLog,
      winnerId: this.winnerId,
      winningHandName: this.winningHandName,
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
