// Meme Factory (What Do You Meme?) Server Engine
// Anonymous punchline submission, gallery display, voting and crown for the funniest meme master

export const MEME_TEMPLATES = [
  {
    id: 'm1',
    title: 'Le Regard Suspect',
    imageUrl: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&w=800&q=80',
    situation: 'Quand ton pote dit : "Fais-moi confiance, je gère complètement la situation"...',
    defaultJokes: [
      'Quand tu vois l’addition arriver après avoir dit "prenez ce que vous voulez"',
      'Quand tu dis que tu as révisé alors que tu as juste regardé la première page',
      'Le chien qui attend que tu fasses tomber un morceau de fromage',
    ],
  },
  {
    id: 'm2',
    title: 'La Surprise Totale',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    situation: 'Quand le réveil sonne à 6h30 et que tu réalises qu’on est seulement mardi...',
    defaultJokes: [
      'Quand tu vérifies ton compte en banque après une soirée en ville',
      'Quand le prof dit : "Rangez tout, sortez une feuille double !"',
      'Quand le micro est resté allumé pendant que tu parlais tout seul',
    ],
  },
  {
    id: 'm3',
    title: 'Le Boss Suprême',
    imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80',
    situation: 'Quand tu réussis à insérer la clé USB du premier coup dans le noir complet...',
    defaultJokes: [
      'Quand ton code compile du premier coup sans aucun bug',
      'Quand tu trouves une place de parking pile devant la porte',
      'Quand tu gagnes une partie sans même connaître les règles',
    ],
  },
  {
    id: 'm4',
    title: 'Le Doute Existentiel',
    imageUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80',
    situation: 'Quand tu as fermé la porte de chez toi mais que ton cerveau te demande : "Et le gaz ?"',
    defaultJokes: [
      'Moi en train de calculer combien d’heures de sommeil il me reste à 4h du matin',
      'Quand tu essaies de te rappeler si tu as envoyé le message à la bonne personne',
      'Quand le GPS dit "faites demi-tour dès que possible" avec insistance',
    ],
  },
  {
    id: 'm5',
    title: 'Le Sommeil Inévitable',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    situation: 'Quand tu dis : "Je regarde juste un dernier épisode et je vais me coucher"...',
    defaultJokes: [
      'Moi en réunion le vendredi à 16h45',
      'Quand la clim dans la voiture souffle pile à la bonne température',
      'Le prof qui commence son cours d’histoire avec la lumière éteinte',
    ],
  },
  {
    id: 'm6',
    title: 'L’Incompréhension',
    imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
    situation: 'Quand quelqu’un essaie de t’expliquer les règles d’un jeu de société pendant 45 minutes...',
    defaultJokes: [
      'Quand tu lis l’exercice 1 du contrôle de maths',
      'Quand on me demande où je me vois dans 5 ans',
      'Moi en train de fixer le tableau de bord quand un voyant orange s’allume',
    ],
  },
];

export class MemeFactoryEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.rawPlayers = players || [];
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Minimum 2 players: add bot companion if solo
    const safePlayers = [...this.rawPlayers];
    if (safePlayers.length === 1) {
      safePlayers.push({
        id: 'bot_meme',
        name: '🤖 MemeBot 3000',
        avatar: '🤖',
        color: 'purple',
        isBot: true,
      });
    }

    this.players = safePlayers.map((p) => ({
      id: p.id,
      name: p.name || 'Memeur',
      color: p.color || 'blue',
      avatar: p.avatar || '😎',
      isBot: Boolean(p.isBot),
      score: 0,
      hasSubmitted: false,
      hasVoted: false,
      currentCaption: '',
    }));

    this.totalRounds = Math.min(5, Math.max(2, Number(settings.totalRounds) || 3));
    this.currentRound = 1;
    this.phase = 'captioning'; // 'captioning' | 'voting' | 'reveal' | 'gameover'

    this.captionDuration = 45;
    this.votingDuration = 25;
    this.revealDuration = 10;
    this.timeRemaining = this.captionDuration;

    this.currentMeme = null;
    this.submissions = []; // [{ id, playerId, playerName, text, votes: [] }]
    this.votes = {}; // voterPlayerId -> submissionId
    this.isGameOver = false;
    this.finalPodium = null;

    this.timerInterval = null;
    this.phaseTimeout = null;

    this.startRound();
  }

  startRound() {
    this.clearAllTimers();
    if (this.isGameOver) return;

    this.phase = 'captioning';
    this.timeRemaining = this.captionDuration;
    this.submissions = [];
    this.votes = {};

    // Reset player round state
    this.players.forEach((p) => {
      p.hasSubmitted = false;
      p.hasVoted = false;
      p.currentCaption = '';
    });

    // Pick a meme template
    const templateIdx = (this.currentRound - 1) % MEME_TEMPLATES.length;
    this.currentMeme = MEME_TEMPLATES[templateIdx];

    this.emitState();

    // Countdown timer
    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 1;
      if (this.timeRemaining <= 0) {
        this.clearAllTimers();
        this.finishCaptionPhase();
      } else {
        this.emitState();
      }
    }, 1000);

    // Bot submissions
    this.scheduleBotCaptions();
  }

  scheduleBotCaptions() {
    this.players.filter((p) => p.isBot).forEach((bot) => {
      const delayMs = 3000 + Math.random() * 8000;
      setTimeout(() => {
        if (this.phase !== 'captioning' || bot.hasSubmitted) return;
        const pool = this.currentMeme?.defaultJokes || ['Moi quand tout se passe comme prévu'];
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        this.submitCaption(bot.id, chosen);
      }, delayMs);
    });
  }

  submitCaption(playerId, rawCaption) {
    if (this.phase !== 'captioning') {
      return { success: false, error: 'La phase d’écriture est terminée !' };
    }

    const player = this.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Joueur introuvable !' };

    const caption = (rawCaption || '').trim();
    if (!caption) return { success: false, error: 'Le punchline ne peut pas être vide !' };

    player.currentCaption = caption;
    player.hasSubmitted = true;

    // Check if already in submissions
    const existingIdx = this.submissions.findIndex((s) => s.playerId === playerId);
    if (existingIdx !== -1) {
      this.submissions[existingIdx].text = caption;
    } else {
      this.submissions.push({
        id: `sub_${playerId}`,
        playerId,
        playerName: player.name,
        avatar: player.avatar,
        color: player.color,
        text: caption,
        votes: [],
      });
    }

    this.emitState();

    // If all submitted, finish early
    const allSubmitted = this.players.every((p) => p.hasSubmitted);
    if (allSubmitted) {
      this.clearAllTimers();
      this.finishCaptionPhase();
    }

    return { success: true };
  }

  finishCaptionPhase() {
    this.clearAllTimers();

    // Fallback for players who did not submit: assign a default funny joke
    this.players.forEach((p) => {
      if (!p.hasSubmitted) {
        const fallback = this.currentMeme?.defaultJokes[0] || 'Oups, pas eu le temps de taper...';
        this.submitCaption(p.id, fallback);
      }
    });

    // Shuffle submissions so voting is anonymous
    this.submissions = this.submissions.sort(() => Math.random() - 0.5);

    // Transition to voting
    this.phase = 'voting';
    this.timeRemaining = this.votingDuration;
    this.emitState();

    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 1;
      if (this.timeRemaining <= 0) {
        this.clearAllTimers();
        this.finishVotingPhase();
      } else {
        this.emitState();
      }
    }, 1000);

    // Bot votes
    this.scheduleBotVotes();
  }

  scheduleBotVotes() {
    this.players.filter((p) => p.isBot).forEach((bot) => {
      const delayMs = 2500 + Math.random() * 6000;
      setTimeout(() => {
        if (this.phase !== 'voting' || bot.hasVoted) return;

        // Bot votes for someone else's submission
        const eligible = this.submissions.filter((s) => s.playerId !== bot.id);
        if (eligible.length > 0) {
          const picked = eligible[Math.floor(Math.random() * eligible.length)];
          this.castVote(bot.id, picked.id);
        }
      }, delayMs);
    });
  }

  castVote(voterId, submissionId) {
    if (this.phase !== 'voting') {
      return { success: false, error: 'Le vote est terminé !' };
    }

    const voter = this.players.find((p) => p.id === voterId);
    if (!voter) return { success: false, error: 'Joueur introuvable !' };

    const targetSub = this.submissions.find((s) => s.id === submissionId);
    if (!targetSub) return { success: false, error: 'Proposition introuvable !' };

    // Cannot vote for own submission
    if (targetSub.playerId === voterId) {
      return { success: false, error: 'Tu ne peux pas voter pour ton propre meme !' };
    }

    this.votes[voterId] = submissionId;
    voter.hasVoted = true;

    // Record vote into submission
    if (!targetSub.votes.includes(voter.name)) {
      targetSub.votes.push(voter.name);
    }

    this.emitState();

    // If all voted, finish voting early
    const allVoted = this.players.every((p) => p.hasVoted);
    if (allVoted) {
      this.clearAllTimers();
      this.finishVotingPhase();
    }

    return { success: true };
  }

  finishVotingPhase() {
    this.clearAllTimers();
    this.phase = 'reveal';
    this.timeRemaining = this.revealDuration;

    // Score calculations:
    // +150 points per vote received!
    // +100 bonus for round winner (most votes)
    let maxVotes = 0;
    this.submissions.forEach((s) => {
      const voteCount = s.votes.length;
      if (voteCount > maxVotes) maxVotes = voteCount;

      const author = this.players.find((p) => p.id === s.playerId);
      if (author) {
        author.score += voteCount * 150;
      }
    });

    if (maxVotes > 0) {
      this.submissions
        .filter((s) => s.votes.length === maxVotes)
        .forEach((s) => {
          const author = this.players.find((p) => p.id === s.playerId);
          if (author) author.score += 100;
        });
    }

    this.emitState();

    // Wait reveal duration, then next round or gameover
    this.phaseTimeout = setTimeout(() => {
      if (this.currentRound >= this.totalRounds) {
        this.endGame();
      } else {
        this.currentRound += 1;
        this.startRound();
      }
    }, this.revealDuration * 1000);
  }

  endGame() {
    this.clearAllTimers();
    this.isGameOver = true;
    this.phase = 'gameover';

    const sorted = [...this.players].sort((a, b) => b.score - a.score);
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
      case 'mf_submit_caption':
        return this.submitCaption(effectivePlayerId, payload.caption || '');
      case 'mf_cast_vote':
        return this.castVote(effectivePlayerId, payload.submissionId || '');
      default:
        return { success: false, error: `Action inconnue: ${action}` };
    }
  }

  clearAllTimers() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.phaseTimeout) {
      clearTimeout(this.phaseTimeout);
      this.phaseTimeout = null;
    }
  }

  destroy() {
    this.clearAllTimers();
  }

  getState(targetPlayerId = null) {
    const myPlayer = this.players.find((p) => p.id === targetPlayerId);

    return {
      gameId: 'meme_factory',
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timeRemaining: this.timeRemaining,
      currentMeme: this.currentMeme,
      // In voting phase: submissions are anonymous (no author name or playerId)
      // In reveal phase: authors are fully unmasked!
      submissions: this.submissions.map((s) => ({
        id: s.id,
        text: s.text,
        authorName: this.phase === 'reveal' || this.isGameOver ? s.playerName : undefined,
        authorAvatar: this.phase === 'reveal' || this.isGameOver ? s.avatar : undefined,
        authorColor: this.phase === 'reveal' || this.isGameOver ? s.color : undefined,
        votesCount: this.phase === 'reveal' || this.isGameOver ? s.votes.length : undefined,
        voters: this.phase === 'reveal' || this.isGameOver ? s.votes : undefined,
        isMine: targetPlayerId ? s.playerId === targetPlayerId : false,
      })),
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        avatar: p.avatar,
        score: p.score,
        hasSubmitted: p.hasSubmitted,
        hasVoted: p.hasVoted,
      })),
      isGameOver: this.isGameOver,
      finalPodium: this.finalPodium,
      // Controller convenience
      hasSubmitted: myPlayer?.hasSubmitted ?? false,
      hasVoted: myPlayer?.hasVoted ?? false,
      myCaption: myPlayer?.currentCaption ?? '',
      myVotedSubmissionId: targetPlayerId ? this.votes[targetPlayerId] : undefined,
    };
  }

  // C1 — État PUBLIC : votes et identités des auteurs masqués pendant le vote
  getPublicState() {
    return this.getState(null);
  }

  // C1 — Fragment PRIVÉ : chaque joueur reçoit ses propres statuts (hasSubmitted, hasVoted, myCaption)
  getPrivateState(playerId) {
    const myPlayer = this.players.find((p) => p.id === playerId);
    if (!myPlayer) return null;
    return {
      hasSubmitted: myPlayer.hasSubmitted ?? false,
      hasVoted: myPlayer.hasVoted ?? false,
      myCaption: myPlayer.currentCaption ?? '',
      myVotedSubmissionId: this.votes[playerId] || null,
      isMine: true,
    };
  }

  emitState() {
    if (this.onStateChange) {
      this.onStateChange(this.getPublicState());
    }
  }
}
