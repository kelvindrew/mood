// Bomb Party (Tic-Tac Boom) Server Engine
// Fast-paced word-chain party game with unpredictable bomb timer and life deduction
import { isValidScrabbleWord, SCRABBLE_SET } from './scrabbleDictionary.js';

// Curated list of high-energy French 2-3 letter syllables that have rich vocabularies
const SYLLABLES = [
  'TR', 'ON', 'MA', 'TE', 'LI', 'CH', 'PL', 'AN', 'OU', 'IN',
  'CO', 'BA', 'RO', 'DE', 'PA', 'VI', 'SO', 'LU', 'GR', 'BL',
  'PO', 'CA', 'ME', 'RE', 'TI', 'NE', 'MO', 'RA', 'SE', 'FA',
  'BR', 'CL', 'CR', 'FL', 'FR', 'GL', 'PR', 'VR', 'TA', 'TO',
  'VA', 'VE', 'LA', 'LE', 'LO', 'MI', 'NO', 'PI', 'SA', 'SI',
  'AL', 'AR', 'EL', 'EN', 'ER', 'ES', 'EU', 'IL', 'OR', 'UR'
];

export class BombPartyEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.rawPlayers = players || [];
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Minimum 2 players: add virtual bot companion if solo
    const safePlayers = [...this.rawPlayers];
    if (safePlayers.length === 1) {
      safePlayers.push({
        id: 'bot_tictac',
        name: '🤖 RoboBoom',
        avatar: '🤖',
        color: 'red',
        isBot: true,
      });
    }

    // Initialize player state
    this.players = safePlayers.map((p) => ({
      id: p.id,
      name: p.name || 'Joueur',
      color: p.color || 'blue',
      avatar: p.avatar || '💣',
      isBot: Boolean(p.isBot),
      lives: 3,
      isAlive: true,
      score: 0,
    }));

    this.roundNumber = 1;
    this.phase = 'playing'; // 'playing' | 'exploding' | 'gameover'
    this.turnDuration = Math.max(10, Math.min(25, Number(settings.turnDuration) || 16));
    this.turnTimeRemaining = this.turnDuration;
    this.activePlayerIndex = Math.floor(Math.random() * this.players.length);
    this.currentSyllable = this.pickRandomSyllable();
    this.usedWords = new Set();
    this.lastWord = null;
    this.lastExplodedPlayerId = null;
    this.combo = 0;
    this.isGameOver = false;
    this.finalPodium = null;

    this.timerInterval = null;
    this.botTimeout = null;
    this.explosionTimeout = null;

    this.startTurn();
  }

  pickRandomSyllable() {
    let syl;
    let attempts = 0;
    do {
      syl = SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)];
      attempts++;
    } while (syl === this.currentSyllable && attempts < 10);
    return syl;
  }

  getActivePlayer() {
    return this.players[this.activePlayerIndex] || this.players[0];
  }

  getAlivePlayers() {
    return this.players.filter((p) => p.isAlive);
  }

  startTurn() {
    this.clearAllTimers();
    if (this.isGameOver) return;

    this.phase = 'playing';
    // Slightly decrease turn time as combo rises to heighten the tension!
    const speedBonusReduction = Math.min(4, Math.floor(this.combo / 4));
    this.turnTimeRemaining = Math.max(8, this.turnDuration - speedBonusReduction);

    this.emitState();

    // 1-second countdown ticker
    this.timerInterval = setInterval(() => {
      this.turnTimeRemaining -= 1;

      if (this.turnTimeRemaining <= 0) {
        this.clearAllTimers();
        this.triggerExplosion();
      } else {
        this.emitState();
      }
    }, 1000);

    // Bot automation if current active player is a bot
    const activePlayer = this.getActivePlayer();
    if (activePlayer && activePlayer.isBot && activePlayer.isAlive) {
      this.scheduleBotTurn(activePlayer);
    }
  }

  scheduleBotTurn(botPlayer) {
    // Bot thinks for between 2 and 4.5 seconds
    const thinkDelayMs = 2000 + Math.random() * 2500;

    this.botTimeout = setTimeout(() => {
      if (this.phase !== 'playing' || this.getActivePlayer()?.id !== botPlayer.id) return;

      // Search a word containing this.currentSyllable from SCRABBLE_SET
      const syl = this.currentSyllable;
      const candidates = [];
      for (const word of SCRABBLE_SET) {
        if (word.length >= 3 && word.length <= 8 && word.includes(syl) && !this.usedWords.has(word)) {
          candidates.push(word);
          if (candidates.length >= 25) break;
        }
      }

      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        this.submitWord(botPlayer.id, chosen);
      }
      // If no candidate found (unlikely), bot lets the bomb explode
    }, thinkDelayMs);
  }

  cleanWord(w) {
    if (!w || typeof w !== 'string') return '';
    return w
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^A-Z]/g, ''); // keep only alphabetic letters
  }

  submitWord(playerId, rawWord) {
    if (this.phase !== 'playing' || this.isGameOver) {
      return { success: false, error: 'Ce n’est pas le moment de jouer !' };
    }

    const activePlayer = this.getActivePlayer();
    if (!activePlayer || activePlayer.id !== playerId) {
      return { success: false, error: 'Ce n’est pas ton tour d’avoir la bombe !' };
    }

    const word = this.cleanWord(rawWord);

    if (word.length < 3) {
      return { success: false, error: 'Le mot doit faire au moins 3 lettres !' };
    }

    if (!word.includes(this.currentSyllable)) {
      return { success: false, error: `Le mot doit contenir la syllabe "${this.currentSyllable}" !` };
    }

    if (this.usedWords.has(word)) {
      return { success: false, error: `Le mot "${word}" a déjà été utilisé dans cette manche !` };
    }

    // Verify against French Scrabble / dictionary
    const isValid = isValidScrabbleWord(word);
    if (!isValid) {
      return { success: false, error: `"${word}" n’est pas reconnu dans le dictionnaire français !` };
    }

    // Word is valid!
    this.usedWords.add(word);
    this.lastWord = {
      word,
      player: activePlayer.name,
      playerId: activePlayer.id,
    };

    // Calculate score
    const pointsGained = 100 + (this.combo * 15);
    activePlayer.score += pointsGained;
    this.combo += 1;

    // Pick new syllable
    this.currentSyllable = this.pickRandomSyllable();

    // Pass bomb to next alive player
    this.passBombToNextAlive();

    // Start next turn
    this.startTurn();

    return { success: true, pointsGained };
  }

  passBombToNextAlive() {
    const alivePlayers = this.getAlivePlayers();
    if (alivePlayers.length <= 1) return;

    let nextIdx = (this.activePlayerIndex + 1) % this.players.length;
    while (!this.players[nextIdx].isAlive) {
      nextIdx = (nextIdx + 1) % this.players.length;
    }
    this.activePlayerIndex = nextIdx;
  }

  triggerExplosion() {
    this.clearAllTimers();
    this.phase = 'exploding';

    const activePlayer = this.getActivePlayer();
    if (activePlayer) {
      activePlayer.lives = Math.max(0, activePlayer.lives - 1);
      this.lastExplodedPlayerId = activePlayer.id;

      if (activePlayer.lives <= 0) {
        activePlayer.isAlive = false;
      }
    }

    // Reset combo after explosion
    this.combo = 0;

    const alivePlayers = this.getAlivePlayers();

    // Check game over condition
    if (alivePlayers.length <= 1) {
      this.endGame();
      return;
    }

    this.emitState();

    // Pause for 3.5 seconds to show explosion on TV and mobile, then start next round
    this.explosionTimeout = setTimeout(() => {
      if (this.isGameOver) return;
      this.usedWords.clear();
      this.lastWord = null;
      this.currentSyllable = this.pickRandomSyllable();
      this.passBombToNextAlive();
      this.roundNumber += 1;
      this.startTurn();
    }, 3500);
  }

  endGame() {
    this.clearAllTimers();
    this.isGameOver = true;
    this.phase = 'gameover';

    // Rank players: survivors first by lives, then by score
    const sorted = [...this.players].sort((a, b) => {
      if (b.isAlive !== a.isAlive) {
        return b.isAlive ? 1 : -1;
      }
      if (b.lives !== a.lives) {
        return b.lives - a.lives;
      }
      return b.score - a.score;
    });

    this.finalPodium = sorted.map((p, idx) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      score: p.score,
      rank: idx + 1,
      isWinner: idx === 0,
    }));

    this.emitState();

    if (this.onGameOver) {
      this.onGameOver(this.finalPodium);
    }
  }

  handleAction(action, payload = {}, socketId = null, playerId = null) {
    const effectivePlayerId = playerId || socketId;

    switch (action) {
      case 'bp_submit_word': {
        const rawWord = payload.word || '';
        return this.submitWord(effectivePlayerId, rawWord);
      }
      case 'bp_pass_manual': {
        // Fallback action if needed
        return { success: false, error: 'Entre un mot valide pour passer la bombe !' };
      }
      default:
        return { success: false, error: `Action inconnue: ${action}` };
    }
  }

  clearAllTimers() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.botTimeout) {
      clearTimeout(this.botTimeout);
      this.botTimeout = null;
    }
    if (this.explosionTimeout) {
      clearTimeout(this.explosionTimeout);
      this.explosionTimeout = null;
    }
  }

  destroy() {
    this.clearAllTimers();
  }

  getState(targetPlayerId = null) {
    const activePlayer = this.getActivePlayer();

    return {
      gameId: 'bomb_party',
      phase: this.phase,
      currentSyllable: this.currentSyllable,
      activePlayerId: activePlayer ? activePlayer.id : '',
      activePlayerName: activePlayer ? activePlayer.name : '',
      activePlayerColor: activePlayer ? activePlayer.color : 'red',
      turnTimeRemaining: this.turnTimeRemaining,
      turnDuration: this.turnDuration,
      roundNumber: this.roundNumber,
      combo: this.combo,
      usedWords: Array.from(this.usedWords),
      lastWord: this.lastWord,
      lastExplodedPlayerId: this.lastExplodedPlayerId,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        avatar: p.avatar,
        lives: p.lives,
        isAlive: p.isAlive,
        isBot: p.isBot,
        score: p.score,
      })),
      isGameOver: this.isGameOver,
      finalPodium: this.finalPodium,
      // Private view helper for controller
      isMyTurn: targetPlayerId ? activePlayer?.id === targetPlayerId : false,
      myLives: targetPlayerId ? this.players.find((p) => p.id === targetPlayerId)?.lives ?? 0 : undefined,
      isMyAlive: targetPlayerId ? this.players.find((p) => p.id === targetPlayerId)?.isAlive ?? false : undefined,
    };
  }

  emitState() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}
