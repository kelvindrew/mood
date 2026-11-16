// Server Game Engine for ARENA: SECRET NUMBER
// Deductive reasoning, strikes & balls, clue purchasing

export function calculateStrikesAndBalls(secret, guess) {
  let strikes = 0;
  let balls = 0;
  const sStr = String(secret);
  const gStr = String(guess);

  for (let i = 0; i < sStr.length; i++) {
    if (sStr[i] === gStr[i]) {
      strikes++;
    } else if (sStr.includes(gStr[i])) {
      balls++;
    }
  }
  return { strikes, balls };
}

export function generateDistinctCode(length = 3) {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, length).join('');
}

export class SecretNumberEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_dongjoo',
        name: '🤖 Dong-joo (IA)',
        color: 'yellow',
        avatar: '⚖️',
        isBot: true,
        score: 0,
      });
    }

    this.secretCodes = {}; // playerId -> '123'
    for (const p of this.players) {
      this.secretCodes[p.id] = generateDistinctCode(3);
    }

    this.history = []; // { playerId, guess, strikes, balls, timestamp }
    this.clues = {}; // playerId -> string[]
    for (const p of this.players) {
      this.clues[p.id] = [];
    }

    this.turnIndex = 0;
    this.winnerId = null;
    this.phase = 'playing'; // 'playing' | 'ended'
    this.broadcast();

    // Si le premier joueur est un bot
    this.checkBotTurn();
  }

  get activePlayer() {
    return this.players[this.turnIndex % this.players.length];
  }

  handleAction(player, action, payload = {}) {
    if (this.phase !== 'playing') return;
    if (player.id !== this.activePlayer.id) return;

    if (action === 'submit_guess') {
      const guess = String(payload.guess || '').trim();
      if (guess.length !== 3 || new Set(guess).size !== 3) return; // 3 chiffres uniques

      // Cible : joueur suivant (ou cible spécifiée)
      const targetPlayer = this.players.find(p => p.id !== player.id) || this.players[1];
      const targetCode = this.secretCodes[targetPlayer.id];

      const { strikes, balls } = calculateStrikesAndBalls(targetCode, guess);
      this.history.unshift({
        playerId: player.id,
        playerName: player.name,
        targetName: targetPlayer.name,
        guess,
        strikes,
        balls,
        timestamp: Date.now(),
      });

      if (strikes === 3) {
        // Victoire !
        this.winnerId = player.id;
        player.score += 200;
        this.phase = 'ended';
        this.broadcast();
        if (typeof this.onGameOver === 'function') {
          this.onGameOver(this.winnerId);
        }
        return;
      }

      this.turnIndex++;
      this.broadcast();
      this.checkBotTurn();
    } else if (action === 'buy_clue') {
      const clueType = payload.clueType; // 'sum' | 'parity'
      const targetPlayer = this.players.find(p => p.id !== player.id) || this.players[1];
      const code = this.secretCodes[targetPlayer.id];
      let clueText = '';

      if (clueType === 'sum') {
        const sum = code.split('').reduce((acc, c) => acc + Number(c), 0);
        clueText = `La somme des chiffres de ${targetPlayer.name} est ${sum}.`;
      } else if (clueType === 'parity') {
        const evens = code.split('').filter(c => Number(c) % 2 === 0).length;
        clueText = `${targetPlayer.name} possède ${evens} chiffre(s) pair(s) et ${3 - evens} impair(s).`;
      }

      if (clueText && !this.clues[player.id].includes(clueText)) {
        this.clues[player.id].push(clueText);
        this.broadcast();
      }
    }
  }

  checkBotTurn() {
    if (this.phase !== 'playing') return;
    const current = this.activePlayer;
    if (current && current.isBot) {
      setTimeout(() => {
        // IA : génère une hypothèse valide cohérente
        const botGuess = generateDistinctCode(3);
        this.handleAction(current, 'submit_guess', { guess: botGuess });
      }, 2000);
    }
  }

  getState() {
    return {
      turnPlayerId: this.activePlayer?.id,
      turnPlayerName: this.activePlayer?.name,
      history: this.history,
      winnerId: this.winnerId,
      phase: this.phase,
    };
  }

  getPublicState() {
    // SÉCURITÉ STRICTE : Les codes secrets ne sont JAMAIS dans l'état public diffusé à la TV
    return {
      arenaGameId: 'secret_number',
      ...this.getState(),
    };
  }

  getPrivateState(playerId) {
    // SÉCURITÉ STRICTE : Chaque joueur ne voit QUE son propre code secret et ses indices achetés
    return {
      mySecretNumber: this.secretCodes[playerId],
      myClues: this.clues[playerId] || [],
    };
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {}
}
