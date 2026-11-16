// Server Game Engine for ARENA: MONTAGE
// Fast-paced observation & memory game inspired by The Devil's Plan
// Players observe a rapid sequence of distinctive artifact cards.
// When an artifact that was ALREADY SHOWN reappears, players must buzz immediately.

export const MONTAGE_ITEMS = [
  { id: 'mask_gold', name: "Le Masque d'Or", icon: '🎭', color: '#D4AF37', symbol: 'GOLD_MASK' },
  { id: 'astral_compass', name: 'La Boussole Astrale', icon: '🧭', color: '#38BDF8', symbol: 'COMPASS' },
  { id: 'emerald_scarab', name: "Le Scarabée d'Émeraude", icon: '🪲', color: '#10B981', symbol: 'SCARAB' },
  { id: 'crystal_skull', name: 'Le Crâne de Cristal', icon: '💀', color: '#E0E7FF', symbol: 'SKULL' },
  { id: 'obsidian_key', name: "La Clé d'Obsidienne", icon: '🗝️', color: '#94A3B8', symbol: 'KEY' },
  { id: 'solar_crown', name: 'La Couronne Solaire', icon: '👑', color: '#F59E0B', symbol: 'CROWN' },
  { id: 'time_hourglass', name: 'Le Sablier Temporel', icon: '⏳', color: '#F97316', symbol: 'HOURGLASS' },
  { id: 'silver_medallion', name: "Le Médaillon d'Argent", icon: '🪙', color: '#CBD5E1', symbol: 'MEDALLION' },
  { id: 'celestial_dagger', name: 'La Dague Céleste', icon: '🗡️', color: '#818CF8', symbol: 'DAGGER' },
  { id: 'shadow_mirror', name: 'Le Miroir des Ombres', icon: '🪞', color: '#A855F7', symbol: 'MIRROR' },
  { id: 'eye_of_horus', name: "L'Œil Mystique", icon: '👁️', color: '#EC4899', symbol: 'EYE' },
  { id: 'alchemist_flask', name: "La Fiole d'Alchimie", icon: '🧪', color: '#06B6D4', symbol: 'FLASK' },
  { id: 'storm_ring', name: "L'Anneau des Tempêtes", icon: '💍', color: '#6366F1', symbol: 'RING' },
  { id: 'truth_scales', name: 'La Balance de Vérité', icon: '⚖️', color: '#FBBF24', symbol: 'SCALES' },
  { id: 'demon_seal', name: 'Le Sceau du Démon', icon: '🔱', color: '#EF4444', symbol: 'SEAL' },
  { id: 'celestial_globe', name: 'Le Globe Céleste', icon: '🌐', color: '#60A5FA', symbol: 'GLOBE' },
];

export class MontageEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Solo mode: add AI rival
    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_ai_orbit',
        name: '🤖 Orbit AI',
        color: 'purple',
        avatar: '🧠',
        score: 0,
        isBot: true,
      });
    }

    this.difficulty = settings.difficulty || 'normal';
    // Display duration per card
    this.cardDurationMs = this.difficulty === 'easy' ? 3200 : this.difficulty === 'hard' ? 1600 : 2400;
    this.totalCardsCount = 24;

    this.sequence = [];
    this.currentIndex = -1;
    this.currentCard = null;
    this.seenItemIds = new Set();
    this.playerScores = {};
    this.players.forEach(p => { this.playerScores[p.id] = 0; });

    this.buzzedPlayersForCurrentCard = new Set();
    this.currentCardResult = null; // { buzzedPlayerName, isCorrect, pointsChange }
    this.timerInterval = null;
    this.phase = 'countdown'; // 'countdown' | 'showing' | 'result' | 'ended'
    this.countdown = 3;
    this.winnerId = null;

    this.initSequence();
    this.startCountdown();
  }

  initSequence() {
    // Generate a sequence of 24 cards with strategic repetitions
    // We select 12 distinct items
    const shuffledItems = [...MONTAGE_ITEMS].sort(() => Math.random() - 0.5).slice(0, 12);
    
    // We build a sequence where ~10 cards are new and ~14 cards are repeats with gaps >= 2
    const seq = [];
    const poolOfIntroduced = [];
    const remainingToIntroduce = [...shuffledItems];

    for (let i = 0; i < this.totalCardsCount; i++) {
      // First 2 cards must be new
      const mustBeNew = poolOfIntroduced.length < 2 || (remainingToIntroduce.length > 0 && Math.random() < 0.45);
      
      if (mustBeNew && remainingToIntroduce.length > 0) {
        const item = remainingToIntroduce.shift();
        seq.push({ ...item, isRepeat: false, stepIndex: i });
        poolOfIntroduced.push(item);
      } else {
        // Pick an item from poolOfIntroduced that wasn't the immediate predecessor
        const candidates = poolOfIntroduced.filter(it => !seq[i - 1] || seq[i - 1].id !== it.id);
        const item = candidates[Math.floor(Math.random() * candidates.length)] || poolOfIntroduced[0];
        seq.push({ ...item, isRepeat: true, stepIndex: i });
      }
    }

    this.sequence = seq;
  }

  startCountdown() {
    this.phase = 'countdown';
    this.countdown = 3;
    this.broadcast();

    const interval = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.nextCard();
      } else {
        this.broadcast();
      }
    }, 1000);
  }

  nextCard() {
    if (this.timerInterval) {
      clearTimeout(this.timerInterval);
      this.timerInterval = null;
    }

    this.currentIndex += 1;
    if (this.currentIndex >= this.sequence.length) {
      this.endGame();
      return;
    }

    const item = this.sequence[this.currentIndex];
    const isActuallyRepeat = this.seenItemIds.has(item.id);
    this.seenItemIds.add(item.id);

    this.currentCard = {
      ...item,
      isRepeat: isActuallyRepeat,
      number: this.currentIndex + 1,
      total: this.sequence.length,
    };

    this.buzzedPlayersForCurrentCard.clear();
    this.currentCardResult = null;
    this.phase = 'showing';
    this.cardStartTime = Date.now();
    this.broadcast();

    // AI bot reaction simulation
    this.scheduleBotAction(isActuallyRepeat);

    // Auto-advance to next card after duration
    this.timerInterval = setTimeout(() => {
      this.nextCard();
    }, this.cardDurationMs);
  }

  scheduleBotAction(isRepeat) {
    const bot = this.players.find(p => p.isBot);
    if (!bot) return;

    // Bot accuracy based on difficulty
    const botAccuracy = this.difficulty === 'easy' ? 0.70 : this.difficulty === 'hard' ? 0.95 : 0.85;
    const willBuzzOnRepeat = isRepeat && Math.random() < botAccuracy;
    const willFalseBuzz = !isRepeat && Math.random() < 0.10; // 10% false alarm mistake

    if (willBuzzOnRepeat || willFalseBuzz) {
      const delay = 600 + Math.random() * 1100;
      if (delay < this.cardDurationMs - 100) {
        setTimeout(() => {
          if (this.phase === 'showing' && !this.buzzedPlayersForCurrentCard.has(bot.id)) {
            this.handleBuzz(bot.id);
          }
        }, delay);
      }
    }
  }

  handleBuzz(playerId) {
    if (this.phase !== 'showing') return;
    if (this.buzzedPlayersForCurrentCard.has(playerId)) return;

    this.buzzedPlayersForCurrentCard.add(playerId);
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    const isRepeat = this.currentCard.isRepeat;
    const elapsed = Date.now() - this.cardStartTime;
    const speedBonus = elapsed < 1000 ? 30 : 0;

    let pointsChange = 0;
    if (isRepeat) {
      // Good Buzz!
      pointsChange = 100 + speedBonus;
      this.playerScores[playerId] = (this.playerScores[playerId] || 0) + pointsChange;
      this.currentCardResult = {
        playerId,
        playerName: player.name,
        isCorrect: true,
        pointsChange,
        message: `DÉJÀ VU DÉTECTÉ ! +${pointsChange} pts`,
      };
    } else {
      // False alarm penalty!
      pointsChange = -50;
      this.playerScores[playerId] = Math.max(0, (this.playerScores[playerId] || 0) + pointsChange);
      this.currentCardResult = {
        playerId,
        playerName: player.name,
        isCorrect: false,
        pointsChange,
        message: 'FAUSSE ALERTE ! Première apparition (-50 pts)',
      };
    }

    this.broadcast();
  }

  handleAction(playerOrId, action, payload = {}) {
    const playerId = typeof playerOrId === 'object' && playerOrId !== null
      ? playerOrId.id
      : String(playerOrId);

    if (action === 'buzz' || action === 'repeat_detected') {
      this.handleBuzz(playerId);
    } else if (action === 'restart' || action === 'reset_round') {
      this.seenItemIds.clear();
      this.initSequence();
      this.currentIndex = -1;
      this.startCountdown();
    }
  }

  endGame() {
    this.phase = 'ended';
    if (this.timerInterval) {
      clearTimeout(this.timerInterval);
      this.timerInterval = null;
    }

    let topScore = -1;
    let winnerId = null;
    for (const [pid, score] of Object.entries(this.playerScores)) {
      if (score > topScore) {
        topScore = score;
        winnerId = pid;
      }
    }

    this.winnerId = winnerId;
    this.broadcast();

    if (typeof this.onGameOver === 'function') {
      this.onGameOver(winnerId);
    }
  }

  getState() {
    return {
      arenaGameId: 'montage',
      phase: this.phase,
      countdown: this.countdown,
      cardDurationMs: this.cardDurationMs,
      currentCard: this.currentCard ? {
        id: this.currentCard.id,
        name: this.currentCard.name,
        icon: this.currentCard.icon,
        color: this.currentCard.color,
        symbol: this.currentCard.symbol,
        number: this.currentCard.number,
        total: this.currentCard.total,
        isRepeat: this.phase === 'ended' || Boolean(this.currentCardResult) ? this.currentCard.isRepeat : undefined,
      } : null,
      currentCardResult: this.currentCardResult,
      playerScores: this.playerScores,
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
      clearTimeout(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
