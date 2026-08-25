// Le Président / Trouduc Game Engine for PLAYFLIX - AI Bots Edition
// Classic French party card game of hierarchy and bluff

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const RANK_VALUES = {
  '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15,
};

export class PresidentEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players; // Array of Player objects with isBot
    this.currentTurnIndex = 0;
    this.currentTrick = [];
    this.lastPlayPlayerId = null;
    this.passedPlayers = [];
    this.playerHands = {};
    this.finishedPlayers = [];
    this.isRevolution = false;
    this.turnTimeLeft = 20;
    this.lastActionLog = 'La partie de Président commence !';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.dealDeck();

    this.timer = null;
    this.botTimer = null; // E2
    this.startTurnTimer();
    this.checkBotTurn();
  }

  dealDeck() {
    const deck = [];
    let idCounter = 0;
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          id: `c_${idCounter++}`,
          suit,
          rank,
          value: RANK_VALUES[rank],
        });
      }
    }

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.players.forEach(p => this.playerHands[p.id] = []);
    let pIdx = 0;
    while (deck.length > 0) {
      const card = deck.pop();
      const p = this.players[pIdx % this.players.length];
      this.playerHands[p.id].push(card);
      pIdx++;
    }

    for (const pId of Object.keys(this.playerHands)) {
      this.playerHands[pId].sort((a, b) => a.value - b.value);
    }
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
    this.turnTimeLeft = 20;
    this.timer = setInterval(() => {
      this.turnTimeLeft--;
      if (this.turnTimeLeft <= 0) {
        this.passTurn(this.getCurrentPlayer()?.id);
      }
      this.notify();
    }, 1000);
  }

  checkBotTurn() {
    if (this.finishedPlayers.length >= this.players.length - 1) return;
    // E2 — pattern menteurEngine : un seul timer bot à la fois
    if (this.botTimer) clearTimeout(this.botTimer);
    if (this.isCurrentPlayerBot()) {
      this.botTimer = setTimeout(() => {
        if (!this._destroyed && this.isCurrentPlayerBot()) {
          this.executeBotPlay();
        }
      }, 1200);
    }
  }

  executeBotPlay() {
    const bot = this.getCurrentPlayer();
    if (!bot) return;
    const hand = this.playerHands[bot.id] || [];
    if (hand.length === 0) return;

    // Group hand cards by rank
    const rankGroups = {};
    for (const card of hand) {
      if (!rankGroups[card.rank]) rankGroups[card.rank] = [];
      rankGroups[card.rank].push(card);
    }

    const requiredCount = this.currentTrick.length || 1;
    const topValue = this.currentTrick.length > 0 ? this.currentTrick[0].value : 0;

    // Find candidate combinations
    const candidateRanks = Object.keys(rankGroups).filter(rank => {
      const cards = rankGroups[rank];
      if (cards.length < requiredCount) return false;
      const val = cards[0].value;
      if (this.currentTrick.length === 0) return true;
      return this.isRevolution ? val < topValue : val > topValue;
    });

    if (candidateRanks.length > 0) {
      // Sort candidates by lowest value (or highest if revolution)
      candidateRanks.sort((a, b) => {
        const valA = RANK_VALUES[a];
        const valB = RANK_VALUES[b];
        return this.isRevolution ? valB - valA : valA - valB;
      });

      const chosenRank = candidateRanks[0];
      const chosenCards = rankGroups[chosenRank].slice(0, requiredCount).map(c => c.id);
      this.playCards(bot.id, chosenCards);
    } else {
      this.passTurn(bot.id);
    }
  }

  playCards(playerId, cardIds) {
    const currentP = this.getCurrentPlayer();
    if (!currentP || currentP.id !== playerId) return { success: false, error: "Ce n'est pas votre tour" };

    const hand = this.playerHands[playerId] || [];
    const playedCards = hand.filter(c => cardIds.includes(c.id));

    if (playedCards.length === 0 || playedCards.length !== cardIds.length) {
      return { success: false, error: 'Cartes invalides' };
    }

    const firstRank = playedCards[0].rank;
    if (!playedCards.every(c => c.rank === firstRank)) {
      return { success: false, error: 'Toutes les cartes jouées doivent être de même valeur' };
    }

    const cardRankValue = playedCards[0].value;

    if (this.currentTrick.length > 0) {
      if (playedCards.length !== this.currentTrick.length) {
        return { success: false, error: `Vous devez poser exactement ${this.currentTrick.length} carte(s)` };
      }
      const topRankValue = this.currentTrick[0].value;

      const isValidRank = this.isRevolution
        ? cardRankValue < topRankValue
        : cardRankValue > topRankValue;

      if (!isValidRank) {
        return { success: false, error: 'Votre combinaison doit être supérieure à celle sur la table' };
      }
    }

    this.playerHands[playerId] = hand.filter(c => !cardIds.includes(c.id));
    this.currentTrick = playedCards;
    this.lastPlayPlayerId = playerId;

    if (playedCards.length === 4) {
      this.isRevolution = !this.isRevolution;
      this.lastActionLog = `💥 RÉVOLUTION par ${currentP.name} ! Hiérarchie inversée !`;
    } else {
      this.lastActionLog = `${currentP.name} joue ${playedCards.length}x ${firstRank}`;
    }

    if (this.playerHands[playerId].length === 0) {
      const titles = ['president', 'vice_president', 'neutral', 'vice_trouduc', 'trouduc'];
      const assignedTitle = titles[this.finishedPlayers.length] || 'trouduc';
      this.finishedPlayers.push({
        playerId,
        name: currentP.name,
        rankTitle: assignedTitle,
      });
      this.lastActionLog = `👑 ${currentP.name} termine ses cartes et devient ${assignedTitle.toUpperCase()} !`;

      if (this.finishedPlayers.length >= this.players.length - 1) {
        this.endGame();
        return { success: true };
      }
    }

    if (firstRank === '2' && !this.isRevolution || firstRank === '3' && this.isRevolution) {
      this.currentTrick = [];
      this.passedPlayers = [];
      this.lastActionLog = `🔥 Carte 2 jouée par ${currentP.name} : pli coupé et vidé !`;
      this.startTurnTimer();
      this.checkBotTurn();
      this.notify();
      return { success: true };
    }

    this.advanceTurn();
    return { success: true };
  }

  passTurn(playerId) {
    const currentP = this.getCurrentPlayer();
    if (!currentP || currentP.id !== playerId) return;

    if (!this.passedPlayers.includes(playerId)) {
      this.passedPlayers.push(playerId);
    }
    this.lastActionLog = `${currentP.name} passe son tour.`;

    const remainingInHand = this.players.filter(p => (this.playerHands[p.id] || []).length > 0);
    const activeUnpassed = remainingInHand.filter(p => !this.passedPlayers.includes(p.id));

    if (activeUnpassed.length <= 1) {
      this.currentTrick = [];
      this.passedPlayers = [];
      this.lastActionLog = 'Tous les joueurs ont passé : le pli est nettoyé !';
      if (this.lastPlayPlayerId) {
        const lastIdx = this.players.findIndex(p => p.id === this.lastPlayPlayerId);
        if (lastIdx !== -1) this.currentTurnIndex = lastIdx;
      }
      this.startTurnTimer();
      this.checkBotTurn();
      this.notify();
      return;
    }

    this.advanceTurn();
  }

  advanceTurn() {
    let nextIdx = (this.currentTurnIndex + 1) % this.players.length;
    let loopCount = 0;
    while ((this.playerHands[this.players[nextIdx].id] || []).length === 0 || this.passedPlayers.includes(this.players[nextIdx].id)) {
      nextIdx = (nextIdx + 1) % this.players.length;
      loopCount++;
      if (loopCount > this.players.length * 2) break;
    }
    this.currentTurnIndex = nextIdx;
    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();
  }

  endGame() {
    if (this.timer) clearInterval(this.timer);
    const remaining = this.players.find(p => !this.finishedPlayers.some(f => f.playerId === p.id));
    if (remaining) {
      this.finishedPlayers.push({
        playerId: remaining.id,
        name: remaining.name,
        rankTitle: 'trouduc',
      });
    }

    this.lastActionLog = `🏆 Fin de manche ! Le Président est ${this.finishedPlayers[0]?.name}`;
    this.notify();
    if (this.onGameOver) this.onGameOver(this.finishedPlayers[0]?.playerId);
  }

  getState() {
    const playerCardCounts = {};
    for (const p of this.players) {
      playerCardCounts[p.id] = (this.playerHands[p.id] || []).length;
    }

    return {
      currentTrick: this.currentTrick,
      lastPlayPlayerId: this.lastPlayPlayerId,
      currentTurnPlayerId: this.getCurrentPlayer()?.id || '',
      passedPlayers: this.passedPlayers,
      playerCardCounts,
      playerHands: this.playerHands,
      finishedPlayers: this.finishedPlayers,
      isRevolution: this.isRevolution,
      turnTimeLeft: this.turnTimeLeft,
      lastActionLog: this.lastActionLog,
    };
  }

  /**
   * C1 — État PUBLIC : les mains complètes sont retirées, seuls les compteurs
   * publics (playerCardCounts) circulent.
   */
  getPublicState() {
    const { playerHands, ...publicState } = this.getState();
    return publicState;
  }

  /**
   * C1 — Fragment PRIVÉ : uniquement la main du joueur destinataire.
   */
  getPrivateState(playerId) {
    return {
      playerHands: { [playerId]: this.playerHands[playerId] || [] },
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    this._destroyed = true; // E2
    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);
  }
}
