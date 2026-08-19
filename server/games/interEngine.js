// Inter Card Game Engine for PLAYFLIX
// Fast-paced competitive action card game with stackable penalties (+2, +4, +5), Stop (A), Reverse (J), Demand (8)

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class InterEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players.map(p => (typeof p === 'string' ? { id: p, name: p, color: 'red', isBot: false } : { ...p }));

    // Auto-fill bots if fewer than 3 players
    if (this.players.length === 1) {
      this.players.push(
        { id: 'bot_inter_1', name: 'Jarvis', color: 'blue', isBot: true, avatar: 'B1' },
        { id: 'bot_inter_2', name: 'Cyber Bot', color: 'green', isBot: true, avatar: 'B2' },
        { id: 'bot_inter_3', name: 'Sophia', color: 'yellow', isBot: true, avatar: 'B3' }
      );
    } else if (this.players.length === 2) {
      this.players.push(
        { id: 'bot_inter_1', name: 'Jarvis', color: 'green', isBot: true, avatar: 'B1' },
        { id: 'bot_inter_2', name: 'Sophia', color: 'yellow', isBot: true, avatar: 'B2' }
      );
    }

    this.currentTurnIndex = 0;
    this.direction = 1; // 1 = clockwise, -1 = counter-clockwise
    this.drawDeck = [];
    this.discardPile = [];
    this.topCard = null;
    this.currentSuit = 'spades';
    this.activeDemandRank = null; // rank requested by 8
    this.pendingPenaltyDraws = 0; // accumulated +2 / +4 / +5
    this.playerHands = {};
    this.scores = {};
    this.roundNumber = 1;
    this.lastSpecialEffect = null;
    this.winner = null;
    this.turnTimeLeft = 25;
    this.lastActionLog = 'La partie de Inter commence ! À vos cartes spéciales.';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    for (const p of this.players) {
      this.scores[p.id] = 0;
    }

    this.initRound();

    this.timer = null;
    this.botTimer = null;
    this.startTurnTimer();
    this.checkBotTurn();
  }

  initRound() {
    // 52 cards + 2 Jokers
    this.drawDeck = [];
    for (const suit of SUITS) {
      for (let i = 0; i < RANKS.length; i++) {
        const rank = RANKS[i];
        this.drawDeck.push({
          id: `card_${suit}_${rank}_${Math.random().toString(36).substring(2, 6)}`,
          suit,
          rank,
          value: i + 2,
        });
      }
    }

    // 2 Jokers (+5)
    this.drawDeck.push(
      { id: `card_joker_1_${Math.random().toString(36).substring(2, 6)}`, suit: 'spades', rank: 'JOKER', value: 20 },
      { id: `card_joker_2_${Math.random().toString(36).substring(2, 6)}`, suit: 'hearts', rank: 'JOKER', value: 20 }
    );

    this.drawDeck.sort(() => Math.random() - 0.5);

    // Deal 7 cards to each player
    for (const p of this.players) {
      this.playerHands[p.id] = [];
      for (let i = 0; i < 7; i++) {
        if (this.drawDeck.length > 0) {
          this.playerHands[p.id].push(this.drawDeck.pop());
        }
      }
    }

    // Flip starter card (must not be special action card for clean start)
    let starter = this.drawDeck.pop();
    while (['A', '2', '8', '10', 'J', 'JOKER'].includes(starter.rank) && this.drawDeck.length > 0) {
      this.drawDeck.unshift(starter);
      starter = this.drawDeck.pop();
    }

    this.topCard = starter;
    this.currentSuit = starter.suit;
    this.discardPile = [starter];
    this.activeDemandRank = null;
    this.pendingPenaltyDraws = 0;
    this.lastSpecialEffect = null;
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex];
  }

  isCurrentPlayerBot() {
    const p = this.getCurrentPlayer();
    return p ? !!p.isBot : false;
  }

  startTurnTimer() {
    if (this.timer) clearInterval(this.timer);
    this.turnTimeLeft = 25;
    this.timer = setInterval(() => {
      this.turnTimeLeft--;
      if (this.turnTimeLeft <= 0) {
        this.handleTurnTimeout();
      }
      this.notify();
    }, 1000);
  }

  handleTurnTimeout() {
    if (this.winner) return;
    const cur = this.getCurrentPlayer();
    if (!cur) return;

    // If timeout, auto draw
    this.drawCard(cur.id);
  }

  checkBotTurn() {
    if (this.winner) return;
    if (this.botTimer) clearTimeout(this.botTimer);

    if (this.isCurrentPlayerBot()) {
      this.botTimer = setTimeout(() => {
        if (this.isCurrentPlayerBot() && !this.winner) {
          this.playBotMove();
        }
      }, 1400);
    }
  }

  playBotMove() {
    const bot = this.getCurrentPlayer();
    if (!bot) return;

    const hand = this.playerHands[bot.id] || [];
    const playableCards = hand.filter(c => this.isCardPlayable(c));

    if (playableCards.length > 0) {
      // Prioritize counter attacks if under penalty
      if (this.pendingPenaltyDraws > 0) {
        const counterCard = playableCards.find(c => ['2', '10', 'JOKER'].includes(c.rank));
        if (counterCard) {
          this.playCard(bot.id, counterCard.id);
          return;
        }
      }

      // Prioritize special cards or highest matching rank
      const specialCard = playableCards.find(c => ['A', '2', '8', '10', 'J', 'JOKER'].includes(c.rank));
      const cardToPlay = specialCard || playableCards[0];

      // If playing an 8, pick most frequent rank in bot's hand
      let chosenDemand = undefined;
      if (cardToPlay.rank === '8') {
        const otherRanks = hand.filter(c => c.id !== cardToPlay.id).map(c => c.rank);
        chosenDemand = otherRanks[0] || 'A';
      }

      this.playCard(bot.id, cardToPlay.id, chosenDemand);
    } else {
      // Must draw
      this.drawCard(bot.id);
    }
  }

  isCardPlayable(card) {
    if (card.rank === 'JOKER') return true;

    // If there is an active penalty attack (+2 / +4 / +5), only counter-attacks are allowed
    if (this.pendingPenaltyDraws > 0) {
      return card.rank === '2' || card.rank === '10' || card.rank === 'JOKER';
    }

    // If an 8 demanded a specific rank
    if (this.activeDemandRank) {
      return card.rank === this.activeDemandRank;
    }

    // Standard matching: match rank OR match suit
    return card.rank === this.topCard.rank || card.suit === this.currentSuit;
  }

  playCard(playerId, cardId, chosenDemandRank = null) {
    if (this.winner) return { success: false, error: 'Partie terminée' };
    const cur = this.getCurrentPlayer();
    if (!cur || cur.id !== playerId) {
      return { success: false, error: "Ce n'est pas votre tour" };
    }

    const hand = this.playerHands[playerId] || [];
    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: 'Carte non possédée en main' };
    }

    const card = hand[cardIndex];
    if (!this.isCardPlayable(card)) {
      return { success: false, error: 'Cette carte ne peut pas être jouée' };
    }

    // Remove from hand and add to discard pile
    hand.splice(cardIndex, 1);
    this.discardPile.push(card);
    this.topCard = card;
    this.currentSuit = card.suit;
    this.activeDemandRank = null; // reset demand unless playing another 8

    let skipNextPlayer = false;

    // Apply special card effects
    if (card.rank === 'A') {
      // STOP: skip next player
      skipNextPlayer = true;
      this.lastSpecialEffect = { type: 'stop', message: `${cur.name} joue un AS (STOP) ! Le joueur suivant passe son tour.` };
      this.lastActionLog = `${cur.name} joue un AS (STOP) !`;
    } else if (card.rank === '2') {
      // +2: add 2 to penalty
      this.pendingPenaltyDraws += 2;
      this.lastSpecialEffect = { type: 'plus2', message: `${cur.name} joue un +2 ! Attaque cumulée : +${this.pendingPenaltyDraws} cartes.` };
      this.lastActionLog = `${cur.name} lance une attaque +2 (Total : +${this.pendingPenaltyDraws}) !`;
    } else if (card.rank === '8') {
      // DEMANDE: pick rank
      const demanded = chosenDemandRank || 'A';
      this.activeDemandRank = demanded;
      this.lastSpecialEffect = { type: 'demand', message: `${cur.name} joue un 8 et exige la valeur : ${demanded} !` };
      this.lastActionLog = `${cur.name} exige la valeur : ${demanded} !`;
    } else if (card.rank === '10') {
      // +4: add 4 to penalty
      this.pendingPenaltyDraws += 4;
      this.lastSpecialEffect = { type: 'plus4', message: `${cur.name} joue un 10 (+4) ! Attaque cumulée : +${this.pendingPenaltyDraws} cartes.` };
      this.lastActionLog = `${cur.name} lance une attaque +4 (Total : +${this.pendingPenaltyDraws}) !`;
    } else if (card.rank === 'J') {
      // RETOUR: reverse direction
      this.direction *= -1;
      this.lastSpecialEffect = { type: 'reverse', message: `${cur.name} joue un VALET (RETOUR) ! Le sens du jeu est inversé.` };
      this.lastActionLog = `${cur.name} inverse le sens de rotation de la table !`;
    } else if (card.rank === 'JOKER') {
      // +5: add 5 to penalty
      this.pendingPenaltyDraws += 5;
      this.lastSpecialEffect = { type: 'plus5', message: `${cur.name} joue un JOKER (+5) ! Attaque cumulée : +${this.pendingPenaltyDraws} cartes.` };
      this.lastActionLog = `${cur.name} déclenche un JOKER +5 (Total : +${this.pendingPenaltyDraws}) !`;
    } else {
      this.lastSpecialEffect = null;
      this.lastActionLog = `${cur.name} pose un ${card.rank} de ${card.suit}.`;
    }

    // Check round victory
    if (hand.length === 0) {
      this.winner = cur.id;
      // Award points from all opponents' remaining cards
      let roundPoints = 0;
      for (const p of this.players) {
        if (p.id !== cur.id) {
          roundPoints += (this.playerHands[p.id] || []).reduce((sum, c) => sum + (c.value || 5), 0);
        }
      }
      this.scores[cur.id] = (this.scores[cur.id] || 0) + roundPoints;
      this.lastActionLog = `Victoire de ${cur.name} dans cette manche (+${roundPoints} points) !`;
      if (this.timer) clearInterval(this.timer);
      if (this.botTimer) clearTimeout(this.botTimer);
      this.notify();
      if (this.onGameOver) this.onGameOver(cur.id);
      return { success: true, winner: cur.id };
    }

    if (skipNextPlayer) {
      this.advanceTurn();
      this.advanceTurn();
    } else {
      this.advanceTurn();
    }

    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();

    return { success: true };
  }

  drawCard(playerId) {
    if (this.winner) return { success: false, error: 'Partie terminée' };
    const cur = this.getCurrentPlayer();
    if (!cur || cur.id !== playerId) {
      return { success: false, error: "Ce n'est pas votre tour" };
    }

    const hand = this.playerHands[playerId] || [];
    const countToDraw = this.pendingPenaltyDraws > 0 ? this.pendingPenaltyDraws : 1;

    for (let i = 0; i < countToDraw; i++) {
      if (this.drawDeck.length === 0) {
        // Recycle discard pile into draw deck except top card
        const top = this.discardPile.pop();
        this.drawDeck = [...this.discardPile].sort(() => Math.random() - 0.5);
        this.discardPile = [top];
      }
      if (this.drawDeck.length > 0) {
        hand.push(this.drawDeck.pop());
      }
    }

    if (this.pendingPenaltyDraws > 0) {
      this.lastActionLog = `${cur.name} subit l'attaque et pioche ${this.pendingPenaltyDraws} cartes !`;
      this.pendingPenaltyDraws = 0;
    } else {
      this.lastActionLog = `${cur.name} pioche 1 carte.`;
    }

    this.advanceTurn();
    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();

    return { success: true, drawnCount: countToDraw };
  }

  advanceTurn() {
    const n = this.players.length;
    this.currentTurnIndex = (this.currentTurnIndex + this.direction + n) % n;
  }

  getState() {
    const cardCounts = {};
    for (const p of this.players) {
      cardCounts[p.id] = (this.playerHands[p.id] || []).length;
    }

    return {
      topCard: this.topCard,
      currentSuit: this.currentSuit,
      activeDemandRank: this.activeDemandRank,
      pendingPenaltyDraws: this.pendingPenaltyDraws,
      direction: this.direction,
      currentTurnPlayerId: this.getCurrentPlayer()?.id || '',
      playerCardCounts: cardCounts,
      playerHands: this.playerHands,
      drawDeckCount: this.drawDeck.length,
      lastSpecialEffect: this.lastSpecialEffect,
      scores: this.scores,
      roundNumber: this.roundNumber,
      turnTimeLeft: this.turnTimeLeft,
      lastActionLog: this.lastActionLog,
      winner: this.winner,
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);
  }
}
