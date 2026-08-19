// Le Menteur (Bluff / Cheat Arena) Engine for PLAYFLIX
// Standard 52-card bluff game with real-time central pile accumulation and accusation reveal

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class MenteurEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players.map(p => (typeof p === 'string' ? { id: p, name: p, color: 'red', isBot: false } : { ...p }));

    // If only 1 player, auto-fill with 3 AI bots for a lively 4-player bluff table
    if (this.players.length === 1) {
      this.players.push(
        { id: 'bot_menteur_1', name: 'Jarvis', color: 'blue', isBot: true, avatar: 'B1' },
        { id: 'bot_menteur_2', name: 'Cyber Bot', color: 'green', isBot: true, avatar: 'B2' },
        { id: 'bot_menteur_3', name: 'Sophia', color: 'yellow', isBot: true, avatar: 'B3' }
      );
    } else if (this.players.length === 2) {
      this.players.push(
        { id: 'bot_menteur_1', name: 'Jarvis', color: 'green', isBot: true, avatar: 'B1' },
        { id: 'bot_menteur_2', name: 'Sophia', color: 'yellow', isBot: true, avatar: 'B2' }
      );
    }

    this.currentTurnIndex = 0;
    this.centralPile = []; // accumulated face-down cards
    this.lastPlay = null; // { playerId, playerName, claimedRank, cardCount, realCards }
    this.accusationResult = null;
    this.playerHands = {};
    this.winner = null;
    this.turnTimeLeft = 30;
    this.lastActionLog = 'La partie de Menteur commence ! Observez bien vos adversaires.';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.dealCards();

    this.timer = null;
    this.botTimer = null;
    this.startTurnTimer();
    this.checkBotTurn();
  }

  dealCards() {
    const deck = [];
    for (const suit of SUITS) {
      for (let i = 0; i < RANKS.length; i++) {
        const rank = RANKS[i];
        deck.push({
          id: `card_${suit}_${rank}_${Math.random().toString(36).substring(2, 6)}`,
          suit,
          rank,
          value: i + 2,
        });
      }
    }

    // Shuffle deck
    deck.sort(() => Math.random() - 0.5);

    // Distribute equally among players
    for (const p of this.players) {
      this.playerHands[p.id] = [];
    }

    let pIdx = 0;
    while (deck.length > 0) {
      const card = deck.pop();
      const p = this.players[pIdx % this.players.length];
      this.playerHands[p.id].push(card);
      pIdx++;
    }

    // Sort hands by value for comfort
    for (const p of this.players) {
      this.playerHands[p.id].sort((a, b) => a.value - b.value);
    }
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

    const hand = this.playerHands[cur.id] || [];
    if (hand.length > 0) {
      // Auto play 1 card
      const card = hand[0];
      this.playCards(cur.id, [card.id], card.rank);
    } else {
      this.nextTurn();
    }
  }

  checkBotTurn() {
    if (this.winner) return;
    if (this.botTimer) clearTimeout(this.botTimer);

    // 1. Check if an AI bot wants to challenge the previous play as "MENTEUR !"
    if (this.lastPlay && this.lastPlay.playerId !== this.getCurrentPlayer()?.id) {
      for (const bot of this.players.filter(p => p.isBot && p.id !== this.lastPlay.playerId)) {
        const botHand = this.playerHands[bot.id] || [];
        const matchingCardsInHand = botHand.filter(c => c.rank === this.lastPlay.claimedRank).length;

        // Probability heuristic:
        // Total cards of that rank = 4. If claimed count + cards in bot hand > 4, it's a guaranteed lie!
        const isImpossible = this.lastPlay.cardCount + matchingCardsInHand > 4;
        const suspicionScore = (this.lastPlay.cardCount + matchingCardsInHand) / 4;

        if (isImpossible || Math.random() < (suspicionScore * 0.65)) {
          this.botTimer = setTimeout(() => {
            if (!this.winner && this.lastPlay) {
              this.callLiar(bot.id);
            }
          }, 1200 + Math.random() * 800);
          return;
        }
      }
    }

    // 2. If it is a bot's turn to play cards
    if (this.isCurrentPlayerBot()) {
      this.botTimer = setTimeout(() => {
        if (this.isCurrentPlayerBot() && !this.winner) {
          this.playBotMove();
        }
      }, 1500);
    }
  }

  playBotMove() {
    const bot = this.getCurrentPlayer();
    if (!bot) return;

    const hand = this.playerHands[bot.id] || [];
    if (hand.length === 0) return;

    // Determine target rank to claim
    let targetRank = this.lastPlay ? this.lastPlay.claimedRank : RANKS[Math.floor(Math.random() * RANKS.length)];

    // Check if bot actually has cards of targetRank
    const trueCards = hand.filter(c => c.rank === targetRank);

    if (trueCards.length > 0 && Math.random() > 0.3) {
      // Play 1 or 2 true cards
      const countToPlay = Math.min(trueCards.length, Math.floor(Math.random() * 2) + 1);
      const cardIds = trueCards.slice(0, countToPlay).map(c => c.id);
      this.playCards(bot.id, cardIds, targetRank);
    } else {
      // Bluff! Pick 1 or 2 random cards and claim targetRank
      const countToPlay = Math.min(hand.length, Math.floor(Math.random() * 2) + 1);
      const cardIds = hand.slice(0, countToPlay).map(c => c.id);
      this.playCards(bot.id, cardIds, targetRank);
    }
  }

  /**
   * Play cards face down with an announced claim
   * @param {string} playerId 
   * @param {string[]} cardIds 
   * @param {string} claimedRank 
   */
  playCards(playerId, cardIds, claimedRank) {
    if (this.winner) return { success: false, error: 'Partie terminée' };
    const cur = this.getCurrentPlayer();
    if (!cur || cur.id !== playerId) {
      return { success: false, error: "Ce n'est pas votre tour" };
    }

    if (!cardIds || cardIds.length === 0) {
      return { success: false, error: 'Sélectionnez au moins une carte' };
    }

    const hand = this.playerHands[playerId] || [];
    const realPlayedCards = [];

    for (const id of cardIds) {
      const idx = hand.findIndex(c => c.id === id);
      if (idx === -1) {
        return { success: false, error: 'Carte non possédée en main' };
      }
      realPlayedCards.push(hand.splice(idx, 1)[0]);
    }

    // Add cards face down to the central pile
    this.centralPile.push(...realPlayedCards);

    this.lastPlay = {
      playerId: cur.id,
      playerName: cur.name,
      claimedRank,
      cardCount: realPlayedCards.length,
      realCards: realPlayedCards,
      timestamp: Date.now(),
    };

    this.accusationResult = null;
    this.lastActionLog = `${cur.name} pose ${realPlayedCards.length} carte(s) en annonçant "${claimedRank}".`;

    // Check if player emptied their hand
    if (hand.length === 0) {
      this.winner = cur.id;
      this.lastActionLog = `Victoire de ${cur.name} qui s'est débarrassé de toutes ses cartes !`;
      if (this.timer) clearInterval(this.timer);
      if (this.botTimer) clearTimeout(this.botTimer);
      this.notify();
      if (this.onGameOver) this.onGameOver(cur.id);
      return { success: true, winner: cur.id };
    }

    this.nextTurn();
    return { success: true };
  }

  /**
   * Accuse the last player of lying: "MENTEUR !"
   * @param {string} accuserId 
   */
  callLiar(accuserId) {
    if (this.winner) return { success: false, error: 'Partie terminée' };
    if (!this.lastPlay) return { success: false, error: 'Aucun coup précédent à accuser' };

    const accuser = this.players.find(p => p.id === accuserId);
    if (!accuser) return { success: false, error: 'Joueur introuvable' };

    if (accuser.id === this.lastPlay.playerId) {
      return { success: false, error: 'Vous ne pouvez pas vous accuser vous-même' };
    }

    const targetPlayer = this.players.find(p => p.id === this.lastPlay.playerId);
    const claimedRank = this.lastPlay.claimedRank;
    const realCards = this.lastPlay.realCards;

    // Check if the target was lying: did any card NOT match claimedRank?
    const wasLying = realCards.some(c => c.rank !== claimedRank);
    const pileCount = this.centralPile.length;

    if (wasLying) {
      // The target LIED! Target picks up the entire central pile!
      const targetHand = this.playerHands[targetPlayer.id] || [];
      targetHand.push(...this.centralPile);
      targetHand.sort((a, b) => a.value - b.value);
      this.playerHands[targetPlayer.id] = targetHand;

      this.lastActionLog = `MENSONGE DÉMASQUÉ ! ${accuser.name} a démasqué ${targetPlayer.name}. ${targetPlayer.name} ramasse les ${pileCount} cartes du tas !`;
      
      // Accuser gets the next turn
      this.currentTurnIndex = this.players.findIndex(p => p.id === accuser.id);
    } else {
      // The target TOLD THE TRUTH! Accuser was wrong and picks up the entire pile!
      const accuserHand = this.playerHands[accuser.id] || [];
      accuserHand.push(...this.centralPile);
      accuserHand.sort((a, b) => a.value - b.value);
      this.playerHands[accuser.id] = accuserHand;

      this.lastActionLog = `VÉRITÉ ! ${targetPlayer.name} disait la vérité avec ses ${claimedRank}. ${accuser.name} ramasse les ${pileCount} cartes du tas !`;

      // Target gets the next turn
      this.currentTurnIndex = this.players.findIndex(p => p.id === targetPlayer.id);
    }

    this.accusationResult = {
      accuserId: accuser.id,
      accuserName: accuser.name,
      targetId: targetPlayer.id,
      targetName: targetPlayer.name,
      claimedRank,
      realCards,
      wasLying,
      pileCountTaken: pileCount,
      timestamp: Date.now(),
    };

    // Reset central pile and last play
    this.centralPile = [];
    this.lastPlay = null;

    // Check victory condition
    for (const p of this.players) {
      if ((this.playerHands[p.id] || []).length === 0) {
        this.winner = p.id;
        this.lastActionLog = `Victoire éclatante de ${p.name} !`;
        if (this.timer) clearInterval(this.timer);
        if (this.botTimer) clearTimeout(this.botTimer);
        this.notify();
        if (this.onGameOver) this.onGameOver(p.id);
        return { success: true, result: this.accusationResult, winner: p.id };
      }
    }

    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();

    return { success: true, result: this.accusationResult };
  }

  nextTurn() {
    if (this.botTimer) clearTimeout(this.botTimer);
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();
  }

  getState() {
    const cardCounts = {};
    for (const p of this.players) {
      cardCounts[p.id] = (this.playerHands[p.id] || []).length;
    }

    return {
      currentTurnPlayerId: this.getCurrentPlayer()?.id || '',
      currentClaimedRank: this.lastPlay ? this.lastPlay.claimedRank : null,
      centralPileCount: this.centralPile.length,
      lastPlay: this.lastPlay ? {
        playerId: this.lastPlay.playerId,
        playerName: this.lastPlay.playerName,
        claimedRank: this.lastPlay.claimedRank,
        cardCount: this.lastPlay.cardCount,
        // Do not expose realCards to clients until accusation
      } : null,
      accusationResult: this.accusationResult,
      playerCardCounts: cardCounts,
      playerHands: this.playerHands,
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
