// Card Party (Uno-style / 8 Américain) Engine for PLAYFLIX
// Dynamic multi-player card battle with hidden hands on mobile

const COLORS = ['red', 'blue', 'green', 'yellow'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTIONS = ['+2', 'skip', 'reverse'];

export class CardEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players; // Array of { id, name, socketId }
    this.currentTurnIndex = 0;
    this.direction = 1; // 1 = clockwise, -1 = counter-clockwise
    this.drawPile = [];
    this.discardPile = [];
    this.playerHands = {};
    this.unoCalledBy = {};
    this.winner = null;
    this.turnTimeLeft = 20;
    this.currentColor = 'red';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.initDeck();
    this.dealHands();

    this.timer = null;
    this.startTurnTimer();
  }

  initDeck() {
    this.drawPile = [];
    let idCounter = 0;

    // Add color cards
    for (const color of COLORS) {
      // 0 card
      this.drawPile.push({ id: `c_${idCounter++}`, color, value: '0' });

      // 1-9 twice
      for (const num of NUMBERS.slice(1)) {
        this.drawPile.push({ id: `c_${idCounter++}`, color, value: num });
        this.drawPile.push({ id: `c_${idCounter++}`, color, value: num });
      }

      // Actions twice
      for (const act of ACTIONS) {
        this.drawPile.push({ id: `c_${idCounter++}`, color, value: act });
        this.drawPile.push({ id: `c_${idCounter++}`, color, value: act });
      }
    }

    // Wild cards (4 Wild, 4 Wild +4)
    for (let i = 0; i < 4; i++) {
      this.drawPile.push({ id: `c_${idCounter++}`, color: 'wild', value: 'wild' });
      this.drawPile.push({ id: `c_${idCounter++}`, color: 'wild', value: '+4' });
    }

    this.shuffle(this.drawPile);

    // Initial discard top (ensure it's a regular number)
    let top = this.drawPile.pop();
    while (top.color === 'wild' || ACTIONS.includes(top.value)) {
      this.drawPile.unshift(top);
      this.shuffle(this.drawPile);
      top = this.drawPile.pop();
    }
    this.discardPile.push(top);
    this.currentColor = top.color;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  dealHands() {
    for (const player of this.players) {
      this.playerHands[player.id] = [];
      for (let i = 0; i < 7; i++) {
        this.playerHands[player.id].push(this.drawSingleCard());
      }
      this.unoCalledBy[player.id] = false;
    }
  }

  drawSingleCard() {
    if (this.drawPile.length === 0) {
      // Reshuffle discard pile except top
      const top = this.discardPile.pop();
      this.drawPile = [...this.discardPile];
      this.discardPile = [top];
      this.shuffle(this.drawPile);
    }
    return this.drawPile.pop() || { id: `wild_${Math.random()}`, color: 'wild', value: 'wild' };
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex];
  }

  startTurnTimer() {
    if (this.timer) clearInterval(this.timer);
    this.turnTimeLeft = 25;
    this.timer = setInterval(() => {
      this.turnTimeLeft--;
      if (this.turnTimeLeft <= 0) {
        // Auto draw & pass on timeout
        this.playerDraw(this.getCurrentPlayer()?.id);
      }
      this.notify();
    }, 1000);
  }

  isValidPlay(card, chosenColor = null) {
    const top = this.discardPile[this.discardPile.length - 1];
    if (card.color === 'wild') return true;
    if (card.color === this.currentColor) return true;
    if (card.value === top.value) return true;
    return false;
  }

  playCard(playerId, cardId, chosenWildColor = null) {
    if (this.winner) return { success: false, error: 'Partie terminée' };
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return { success: false, error: "Ce n'est pas votre tour" };
    }

    const hand = this.playerHands[playerId] || [];
    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: 'Carte introuvable' };
    }

    const card = hand[cardIndex];
    if (!this.isValidPlay(card)) {
      return { success: false, error: 'Coup invalide' };
    }

    // Remove from hand & place on discard
    hand.splice(cardIndex, 1);
    this.discardPile.push(card);

    if (card.color === 'wild') {
      this.currentColor = chosenWildColor && COLORS.includes(chosenWildColor) ? chosenWildColor : 'red';
    } else {
      this.currentColor = card.color;
    }

    // Check winner
    if (hand.length === 0) {
      this.winner = playerId;
      if (this.timer) clearInterval(this.timer);
      this.notify();
      if (this.onGameOver) this.onGameOver(playerId);
      return { success: true, winner: playerId };
    }

    // Apply special card effects
    let skipNext = false;
    let cardsToDrawNext = 0;

    if (card.value === 'reverse') {
      if (this.players.length === 2) {
        skipNext = true;
      } else {
        this.direction *= -1;
      }
    } else if (card.value === 'skip') {
      skipNext = true;
    } else if (card.value === '+2') {
      cardsToDrawNext = 2;
      skipNext = true;
    } else if (card.value === '+4') {
      cardsToDrawNext = 4;
      skipNext = true;
    }

    // Advance turn
    this.advanceTurn(skipNext ? 2 : 1, cardsToDrawNext);
    return { success: true };
  }

  playerDraw(playerId) {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) return false;

    const newCard = this.drawSingleCard();
    this.playerHands[playerId].push(newCard);

    // After drawing, move to next player
    this.advanceTurn(1, 0);
    return true;
  }

  callUno(playerId) {
    const hand = this.playerHands[playerId] || [];
    if (hand.length <= 2) {
      this.unoCalledBy[playerId] = true;
      this.notify();
      return true;
    }
    return false;
  }

  advanceTurn(steps = 1, cardsToDraw = 0) {
    const numPlayers = this.players.length;
    let nextIndex = (this.currentTurnIndex + (this.direction * steps)) % numPlayers;
    if (nextIndex < 0) nextIndex += numPlayers;

    // If cards to draw for that next player
    if (cardsToDraw > 0) {
      const targetPlayer = this.players[nextIndex];
      for (let i = 0; i < cardsToDraw; i++) {
        this.playerHands[targetPlayer.id].push(this.drawSingleCard());
      }
    }

    this.currentTurnIndex = nextIndex;
    this.startTurnTimer();
    this.notify();
  }

  getState() {
    const playerCardCounts = {};
    for (const p of this.players) {
      playerCardCounts[p.id] = (this.playerHands[p.id] || []).length;
    }

    return {
      discardPileTop: this.discardPile[this.discardPile.length - 1],
      currentColor: this.currentColor,
      direction: this.direction,
      currentPlayerId: this.getCurrentPlayer()?.id || '',
      playerCardCounts,
      playerHands: this.playerHands,
      drawPileCount: this.drawPile.length,
      unoCalledBy: this.unoCalledBy,
      winner: this.winner,
      turnTimeLeft: this.turnTimeLeft,
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
