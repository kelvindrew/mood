// Server Game Engine for "L'ESPION : UNDERCOVER"
// Social deduction and bluffing game for 3 to 10 players (with smart bots support)

export const SPY_WORD_PAIRS = [
  { civil: 'Chocolat', spy: 'Nutella', category: 'Gourmandise' },
  { civil: 'Café', spy: 'Thé', category: 'Boissons' },
  { civil: 'Tour Eiffel', spy: 'Arc de Triomphe', category: 'Monuments' },
  { civil: 'Plage', spy: 'Piscine', category: 'Vacances' },
  { civil: 'Avion', spy: 'Fusée', category: 'Transport' },
  { civil: 'Loup', spy: 'Chien', category: 'Animaux' },
  { civil: 'Cinéma', spy: 'Théâtre', category: 'Spectacle' },
  { civil: 'Guitare', spy: 'Violon', category: 'Musique' },
  { civil: 'Pizza', spy: 'Burger', category: 'Fast Food' },
  { civil: 'Lune', spy: 'Soleil', category: 'Astronomie' },
  { civil: 'Vampire', spy: 'Zombie', category: 'Créatures' },
  { civil: 'Médecin', spy: 'Infirmier', category: 'Métiers' },
  { civil: 'Bateau', spy: 'Sous-marin', category: 'Marine' },
  { civil: 'Stylo', spy: 'Crayon', category: 'Fournitures' },
  { civil: 'Neige', spy: 'Glace', category: 'Hiver' },
  { civil: 'Voiture', spy: 'Moto', category: 'Véhicules' },
  { civil: 'Lion', spy: 'Tigre', category: 'Félins' },
  { civil: 'Pomme', spy: 'Poire', category: 'Fruits' },
  { civil: 'Football', spy: 'Rugby', category: 'Sports' },
  { civil: 'Livre', spy: 'Journal', category: 'Lecture' },
  { civil: 'Téléphone', spy: 'Tablette', category: 'Tech' },
  { civil: 'Montagne', spy: 'Volcan', category: 'Nature' },
  { civil: 'Château', spy: 'Palais', category: 'Architecture' },
  { civil: 'Bière', spy: 'Vin', category: 'Apéro' },
  { civil: 'Croissant', spy: 'Pain au chocolat', category: 'Boulangerie' },
  { civil: 'Piano', spy: 'Orgue', category: 'Instruments' },
  { civil: 'Hélicoptère', spy: 'Drone', category: 'Aviation' },
  { civil: 'Désert', spy: 'Plage', category: 'Paysages' },
  { civil: 'Super-héros', spy: 'Magicien', category: 'Fantaisie' },
  { civil: 'Diamant', spy: 'Or', category: 'Richesses' },
];

export class SpyEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map((p, idx) =>
      typeof p === 'string'
        ? { id: p, name: p, color: 'blue', isBot: false }
        : { ...p }
    );

    // If fewer than 3 players, add friendly bot agents for full testability
    const botNames = ['🤖 Agent Shadow', '🤖 Agent Viper', '🤖 Agent Ghost'];
    let botIdx = 0;
    while (this.players.length < 3) {
      this.players.push({
        id: `bot_spy_${Date.now()}_${botIdx}`,
        name: botNames[botIdx] || `Agent IA ${botIdx + 1}`,
        color: ['purple', 'cyan', 'orange'][botIdx] || 'purple',
        avatar: '🕵️',
        isBot: true,
      });
      botIdx++;
    }

    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    this.phase = 'reveal'; // 'reveal' | 'clue' | 'vote' | 'elimination' | 'guess' | 'gameover'
    this.round = 1;
    this.timer = 20;
    this.timerInterval = null;

    this.wordPair = null;
    this.roles = {}; // playerId -> { role: 'civil' | 'spy' | 'white', word: string, alive: boolean }
    this.clues = {}; // playerId -> string
    this.votes = {}; // playerId -> targetPlayerId
    this.turnOrder = [];
    this.currentSpeakerIndex = 0;

    this.lastEliminated = null;
    this.winner = null; // 'civils' | 'spies'
    this.winningRoleName = null;
    this.finalPodium = null;

    this.initRound();
  }

  initRound() {
    // Pick random pair
    const pair = SPY_WORD_PAIRS[Math.floor(Math.random() * SPY_WORD_PAIRS.length)];
    this.wordPair = pair;

    const playerList = [...this.players];
    // Shuffle
    playerList.sort(() => Math.random() - 0.5);

    // Number of spies based on player count:
    // 3-4 players: 1 Undercover, remainder Civils
    // 5-6 players: 1 Undercover, 1 Mr. White, remainder Civils
    // 7+ players: 2 Undercovers, 1 Mr. White, remainder Civils
    const total = playerList.length;
    let spyCount = 1;
    let hasMrWhite = false;

    if (total >= 7) {
      spyCount = 2;
      hasMrWhite = true;
    } else if (total >= 5) {
      hasMrWhite = true;
    }

    this.roles = {};
    for (let i = 0; i < playerList.length; i++) {
      const p = playerList[i];
      if (i < spyCount) {
        this.roles[p.id] = { role: 'spy', word: pair.spy, alive: true, name: p.name };
      } else if (hasMrWhite && i === spyCount) {
        this.roles[p.id] = { role: 'white', word: '??? (Vous êtes l’Infiltré)', alive: true, name: p.name };
      } else {
        this.roles[p.id] = { role: 'civil', word: pair.civil, alive: true, name: p.name };
      }
    }

    this.turnOrder = playerList.map((p) => p.id);
    this.currentSpeakerIndex = 0;
    this.clues = {};
    this.votes = {};
    this.phase = 'reveal';
    this.timer = 15;

    this.startTimer(() => {
      this.startCluePhase();
    });
    this.notify();
  }

  startCluePhase() {
    this.phase = 'clue';
    this.clues = {};
    this.currentSpeakerIndex = 0;
    this.timer = 30;

    this.startTimer(() => {
      // If speaker timed out, auto-advance
      this.handleNextSpeaker();
    });
    this.notify();

    // Check if current speaker is a bot
    this.checkBotSpeaker();
  }

  checkBotSpeaker() {
    if (this.phase !== 'clue') return;
    const currentSpeakerId = this.turnOrder[this.currentSpeakerIndex];
    const speaker = this.players.find((p) => p.id === currentSpeakerId);

    if (speaker?.isBot && this.roles[currentSpeakerId]?.alive) {
      setTimeout(() => {
        if (this.phase === 'clue' && this.turnOrder[this.currentSpeakerIndex] === currentSpeakerId) {
          const roleInfo = this.roles[currentSpeakerId];
          const botClues = [
            `Quelque chose lié à ${this.wordPair.category}`,
            `C'est souvent très populaire`,
            `On l'utilise au quotidien`,
            `Ça me fait penser à du plaisir`,
          ];
          const clue = botClues[Math.floor(Math.random() * botClues.length)];
          this.submitClue(currentSpeakerId, clue);
        }
      }, 2500);
    }
  }

  submitClue(playerId, clueText) {
    if (this.phase !== 'clue') return { success: false, error: 'Ce n’est pas la phase d’indices' };
    const currentSpeakerId = this.turnOrder[this.currentSpeakerIndex];
    if (currentSpeakerId !== playerId) {
      return { success: false, error: 'Ce n’est pas votre tour de parole' };
    }

    this.clues[playerId] = clueText || 'A passé la parole';
    this.handleNextSpeaker();
    return { success: true };
  }

  handleNextSpeaker() {
    let nextIdx = this.currentSpeakerIndex + 1;
    // Skip dead players
    while (nextIdx < this.turnOrder.length && !this.roles[this.turnOrder[nextIdx]]?.alive) {
      nextIdx++;
    }

    if (nextIdx >= this.turnOrder.length) {
      // All alive players gave clues -> move to Voting Phase
      this.startVotePhase();
    } else {
      this.currentSpeakerIndex = nextIdx;
      this.timer = 30;
      this.startTimer(() => {
        this.handleNextSpeaker();
      });
      this.notify();
      this.checkBotSpeaker();
    }
  }

  startVotePhase() {
    this.phase = 'vote';
    this.votes = {};
    this.timer = 45;

    this.startTimer(() => {
      this.resolveVotes();
    });
    this.notify();

    // Trigger Bot Votes
    setTimeout(() => {
      this.triggerBotVotes();
    }, 2000);
  }

  triggerBotVotes() {
    if (this.phase !== 'vote') return;
    const alivePlayers = this.players.filter((p) => this.roles[p.id]?.alive);

    for (const bot of alivePlayers.filter((p) => p.isBot)) {
      // Bot votes randomly among other alive players
      const candidateTargets = alivePlayers.filter((p) => p.id !== bot.id);
      if (candidateTargets.length > 0) {
        const target = candidateTargets[Math.floor(Math.random() * candidateTargets.length)];
        this.castVote(bot.id, target.id);
      }
    }
  }

  castVote(voterId, targetPlayerId) {
    if (this.phase !== 'vote') return { success: false, error: 'Vote non ouvert' };
    if (!this.roles[voterId]?.alive) return { success: false, error: 'Les éliminés ne votent pas' };
    if (!this.roles[targetPlayerId]?.alive) return { success: false, error: 'Ce joueur est déjà éliminé' };

    this.votes[voterId] = targetPlayerId;
    this.notify();

    // If all alive players have voted, resolve early
    const aliveCount = Object.values(this.roles).filter((r) => r.alive).length;
    const voteCount = Object.keys(this.votes).length;

    if (voteCount >= aliveCount) {
      this.resolveVotes();
    }

    return { success: true };
  }

  resolveVotes() {
    this.clearTimer();

    // Tally votes
    const counts = {};
    for (const targetId of Object.values(this.votes)) {
      counts[targetId] = (counts[targetId] || 0) + 1;
    }

    let maxVotes = 0;
    let eliminatedId = null;
    let isTie = false;

    for (const [id, count] of Object.entries(counts)) {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = id;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true;
      }
    }

    // In case of tie or no votes, pick one with max votes
    if (eliminatedId) {
      const eliminatedPlayer = this.players.find((p) => p.id === eliminatedId);
      const roleData = this.roles[eliminatedId];
      if (roleData) roleData.alive = false;

      this.lastEliminated = {
        id: eliminatedId,
        name: eliminatedPlayer?.name || 'Joueur inconnu',
        role: roleData?.role || 'civil',
        votesReceived: maxVotes,
      };

      // If Mr White or Spy was eliminated, give them a chance to guess the civil word
      if (roleData?.role === 'white' || roleData?.role === 'spy') {
        this.phase = 'guess';
        this.timer = 25;
        this.startTimer(() => {
          this.checkWinCondition();
        });
        this.notify();
        return;
      }
    } else {
      this.lastEliminated = null;
    }

    this.checkWinCondition();
  }

  submitSpyGuess(playerId, guessedWord) {
    if (this.phase !== 'guess' || this.lastEliminated?.id !== playerId) {
      return { success: false, error: 'Pas autorisé à deviner' };
    }

    this.clearTimer();
    const cleanGuess = (guessedWord || '').trim().toLowerCase();
    const cleanCivilWord = this.wordPair.civil.trim().toLowerCase();

    if (cleanGuess === cleanCivilWord) {
      // Spy or Mr White successfully stole victory!
      this.endGame('spies', `🎉 L'espion a deviné le mot secret (${this.wordPair.civil}) ! Victoire des Espions !`);
      return { success: true, correct: true };
    } else {
      // Failed guess, proceed to normal win check
      this.checkWinCondition();
      return { success: true, correct: false };
    }
  }

  checkWinCondition() {
    this.clearTimer();

    const aliveSpies = Object.values(this.roles).filter(
      (r) => r.alive && (r.role === 'spy' || r.role === 'white')
    ).length;
    const aliveCivils = Object.values(this.roles).filter(
      (r) => r.alive && r.role === 'civil'
    ).length;

    if (aliveSpies === 0) {
      // Civils Win!
      this.endGame('civils', '🎉 Tous les espions ont été éliminés ! Victoire des Citoyens !');
      return;
    }

    if (aliveSpies >= aliveCivils) {
      // Spies Win!
      this.endGame('spies', '🕵️ Les espions sont désormais en supériorité ! Victoire des Espions !');
      return;
    }

    // Continue to next round of clues
    this.phase = 'elimination';
    this.timer = 6;
    this.startTimer(() => {
      this.round++;
      this.startCluePhase();
    });
    this.notify();
  }

  endGame(winningTeam, message) {
    this.clearTimer();
    this.phase = 'gameover';
    this.winner = winningTeam;
    this.winningRoleName = winningTeam === 'civils' ? 'Les Citoyens' : 'Les Espions';

    // Calculate podium scores
    this.finalPodium = this.players.map((p) => {
      const isWinner =
        winningTeam === 'civils'
          ? this.roles[p.id]?.role === 'civil'
          : this.roles[p.id]?.role !== 'civil';
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        color: p.color,
        role: this.roles[p.id]?.role || 'civil',
        score: isWinner ? 100 : 25,
        isWinner,
      };
    }).sort((a, b) => b.score - a.score);

    this.notify();
    if (this.onGameOver) {
      this.onGameOver(winningTeam);
    }
  }

  startTimer(onComplete) {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.clearTimer();
        if (onComplete) onComplete();
      } else {
        this.notify();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  destroy() {
    this.clearTimer();
  }

  handleAction(playerId, action, data = {}) {
    switch (action) {
      case 'spy_submit_clue':
        return this.submitClue(playerId, data.clue);
      case 'spy_vote':
        return this.castVote(playerId, data.targetPlayerId);
      case 'spy_guess_word':
        return this.submitSpyGuess(playerId, data.word);
      case 'spy_restart':
        this.initRound();
        return { success: true };
      default:
        return { success: false, error: `Action inconnue : ${action}` };
    }
  }

  getState() {
    return this.getPublicState();
  }

  getPublicState() {
    return {
      gameId: 'spy',
      phase: this.phase,
      round: this.round,
      timer: this.timer,
      category: this.wordPair?.category || 'Général',
      currentSpeakerId: this.turnOrder[this.currentSpeakerIndex] || null,
      clues: this.clues,
      votes: this.votes,
      lastEliminated: this.lastEliminated,
      winner: this.winner,
      winningRoleName: this.winningRoleName,
      finalPodium: this.finalPodium,
      isGameOver: this.phase === 'gameover',
      alivePlayerIds: Object.entries(this.roles)
        .filter(([, r]) => r.alive)
        .map(([id]) => id),
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        avatar: p.avatar,
        isBot: p.isBot,
        alive: this.roles[p.id]?.alive ?? true,
        hasVoted: !!this.votes[p.id],
        hasGivenClue: !!this.clues[p.id],
      })),
      civilWord: this.phase === 'gameover' ? this.wordPair?.civil : undefined,
      spyWord: this.phase === 'gameover' ? this.wordPair?.spy : undefined,
    };
  }

  getPrivateState(playerId) {
    const roleInfo = this.roles[playerId];
    return {
      myRole: roleInfo?.role || 'civil',
      myWord: roleInfo?.word || '???',
      isAlive: roleInfo?.alive ?? true,
      myClue: this.clues[playerId] || '',
      myVote: this.votes[playerId] || null,
      isMyTurnToSpeak: this.phase === 'clue' && this.turnOrder[this.currentSpeakerIndex] === playerId,
      canGuessWord: this.phase === 'guess' && this.lastEliminated?.id === playerId,
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getPublicState());
    }
  }
}
