// Server Game Engine for ARENA: DOUBT AND BET
// High-stakes bluffing, color cards bidding, dramatic reveal showdown

const COLORS = ['black', 'red', 'platinum', 'gold'];
const COLOR_NAMES = { black: 'Noir', red: 'Rouge', platinum: 'Platine', gold: 'Or Impérial' };
const COLOR_RANK = { black: 1, red: 2, platinum: 3, gold: 4 };

export class DoubtAndBetEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_dongjoo_bluff',
        name: '🤖 Dong-joo (IA)',
        color: 'purple',
        avatar: '⚖️',
        isBot: true,
        score: 0,
      });
    }

    this.chips = {};
    for (const p of this.players) {
      this.chips[p.id] = 200; // 200 jetons par défaut
    }

    this.hands = {}; // playerId -> DoubtCard[]
    this.currentBid = null; // { playerId, color, quantity }
    this.turnIndex = 0;
    this.phase = 'bidding'; // 'bidding' | 'doubt_called' | 'reveal' | 'ended'
    this.callerId = null;
    this.doubtSuccess = null;
    this.totalColorCount = { black: 0, red: 0, platinum: 0, gold: 0 };
    this.winnerId = null;

    this.dealHands();
    this.broadcast();
    this.checkBotTurn();
  }

  dealHands() {
    this.hands = {};
    const deck = [];
    let cId = 1;
    for (const color of COLORS) {
      for (let i = 0; i < 12; i++) {
        deck.push({
          id: `c_${cId++}`,
          color,
          value: (i % 5) + 1,
        });
      }
    }
    // Mélange
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    let dealIdx = 0;
    for (const p of this.players) {
      this.hands[p.id] = deck.slice(dealIdx, dealIdx + 5);
      dealIdx += 5;
    }

    // Calcul du total réel sur la table
    this.totalColorCount = { black: 0, red: 0, platinum: 0, gold: 0 };
    for (const hand of Object.values(this.hands)) {
      for (const card of hand) {
        this.totalColorCount[card.color] = (this.totalColorCount[card.color] || 0) + 1;
      }
    }
  }

  get activePlayer() {
    return this.players[this.turnIndex % this.players.length];
  }

  handleAction(player, action, payload = {}) {
    if (this.phase !== 'bidding') return;
    if (player.id !== this.activePlayer.id) return;

    if (action === 'submit_bid') {
      const { color, quantity } = payload;
      const qty = Number(quantity);
      if (!COLORS.includes(color) || isNaN(qty) || qty < 1) return;

      // Validation de la surenchère
      if (this.currentBid) {
        const isHigherQty = qty > this.currentBid.quantity;
        const isSameQtyHigherColor = qty === this.currentBid.quantity && COLOR_RANK[color] > COLOR_RANK[this.currentBid.color];
        if (!isHigherQty && !isSameQtyHigherColor) return;
      }

      this.currentBid = {
        playerId: player.id,
        playerName: player.name,
        color,
        colorName: COLOR_NAMES[color],
        quantity: qty,
      };

      this.turnIndex++;
      this.broadcast();
      this.checkBotTurn();
    } else if (action === 'call_doubt') {
      if (!this.currentBid) return; // Impossible de douter sans enchère préalable

      this.phase = 'doubt_called';
      this.callerId = player.id;
      this.broadcast();

      setTimeout(() => {
        this.resolveDoubt();
      }, 1500);
    }
  }

  resolveDoubt() {
    this.phase = 'reveal';
    const bidColor = this.currentBid.color;
    const actualCount = this.totalColorCount[bidColor] || 0;
    const bidQty = this.currentBid.quantity;

    const bidder = this.players.find(p => p.id === this.currentBid.playerId);
    const caller = this.players.find(p => p.id === this.callerId);

    if (actualCount >= bidQty) {
      // L'enchère était vraie ! Le douteur perd
      this.doubtSuccess = false;
      this.chips[caller.id] = Math.max(0, (this.chips[caller.id] || 0) - 50);
      this.chips[bidder.id] = (this.chips[bidder.id] || 0) + 50;
      bidder.score += 150;
    } else {
      // L'enchère était un bluff ! Le parieur perd
      this.doubtSuccess = true;
      this.chips[bidder.id] = Math.max(0, (this.chips[bidder.id] || 0) - 50);
      this.chips[caller.id] = (this.chips[caller.id] || 0) + 50;
      caller.score += 150;
    }

    this.broadcast();

    setTimeout(() => {
      // Vérifier si un joueur a gagné ou réinitialiser une manche
      let bestChips = -1;
      let leaderId = null;
      for (const p of this.players) {
        if (this.chips[p.id] > bestChips) {
          bestChips = this.chips[p.id];
          leaderId = p.id;
        }
      }

      this.phase = 'ended';
      this.winnerId = leaderId;
      this.broadcast();

      if (typeof this.onGameOver === 'function') {
        this.onGameOver(this.winnerId);
      }
    }, 5000);
  }

  checkBotTurn() {
    if (this.phase !== 'bidding') return;
    const current = this.activePlayer;
    if (current && current.isBot) {
      setTimeout(() => {
        // IA : analyse sa main
        const myHand = this.hands[current.id] || [];
        if (!this.currentBid) {
          // Première enchère : choisit sa couleur majoritaire
          const colorCounts = {};
          for (const c of myHand) colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
          const bestColor = Object.keys(colorCounts).sort((a,b) => colorCounts[b] - colorCounts[a])[0] || 'gold';
          this.handleAction(current, 'submit_bid', { color: bestColor, quantity: Math.max(2, colorCounts[bestColor] + 1) });
        } else {
          // Décision : Doute ou Surenchère
          const actualInHand = myHand.filter(c => c.color === this.currentBid.color).length;
          const otherCardsCount = (this.players.length - 1) * 5;
          const expectedOthers = otherCardsCount * 0.25;
          const expectedTotal = actualInHand + expectedOthers;

          if (this.currentBid.quantity > expectedTotal + 1.8) {
            // Probabilité trop faible -> Doute !
            this.handleAction(current, 'call_doubt');
          } else {
            // Surenchère raisonnable
            const nextQty = this.currentBid.quantity + 1;
            this.handleAction(current, 'submit_bid', { color: this.currentBid.color, quantity: nextQty });
          }
        }
      }, 2000);
    }
  }

  getState() {
    return {
      phase: this.phase,
      currentBid: this.currentBid,
      turnPlayerId: this.activePlayer?.id,
      turnPlayerName: this.activePlayer?.name,
      callerId: this.callerId,
      callerName: this.players.find(p => p.id === this.callerId)?.name,
      doubtSuccess: this.doubtSuccess,
      chips: this.chips,
      winnerId: this.winnerId,
    };
  }

  getPublicState() {
    return {
      arenaGameId: 'doubt_and_bet',
      ...this.getState(),
      revealedHands: this.phase === 'reveal' || this.phase === 'ended' ? this.hands : {},
      totalColorCount: this.phase === 'reveal' || this.phase === 'ended' ? this.totalColorCount : {},
    };
  }

  getPrivateState(playerId) {
    return {
      myDoubtCards: this.hands[playerId] || [],
    };
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {}
}
