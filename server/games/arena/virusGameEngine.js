// Server Game Engine for ARENA: THE VIRUS GAME
// Social deduction, secret roles (Doctor, Infected, Immune, Infiltrator), day/night cycles

export class VirusGameEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0, isAlive: true, isQuarantined: false }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Minimum 3 joueurs (ajouter des bots si nécessaire)
    const botTemplates = [
      { id: 'bot_dr_orbit', name: '🤖 Dr. Orbit (IA)', avatar: '🔬' },
      { id: 'bot_agent_viper', name: '🤖 Viper (IA)', avatar: '🐍' },
      { id: 'bot_citizen_neo', name: '🤖 Neo (IA)', avatar: '🛡️' },
    ];
    let botIdx = 0;
    while (this.players.length < 3) {
      const t = botTemplates[botIdx++];
      this.players.push({
        id: t.id,
        name: t.name,
        color: ['purple', 'cyan', 'orange'][botIdx - 1] || 'purple',
        avatar: t.avatar,
        isBot: true,
        score: 0,
        isAlive: true,
        isQuarantined: false,
      });
    }

    this.roles = {}; // playerId -> 'doctor' | 'infected' | 'immune' | 'infiltrator'
    this.statusMap = {}; // playerId -> 'healthy' | 'infected' | 'protected'
    this.assignRoles();

    this.round = 1;
    this.phase = 'night'; // 'night' | 'day_discussion' | 'day_voting' | 'quarantine_reveal' | 'ended'
    this.timer = 15;
    this.timerInterval = null;

    this.nightActions = {
      infectedTargetId: null,
      doctorProtectedId: null,
    };

    this.votes = {}; // voterId -> targetId
    this.lastQuarantined = null;
    this.winnerTeam = null; // 'civils' | 'virus'

    this.startNightPhase();
  }

  assignRoles() {
    const pCount = this.players.length;
    const shuffled = [...this.players].sort(() => Math.random() - 0.5);

    // Répartition : 1 Docteur, 1 Porteur de virus (ou 2 si > 5), 1 Infiltré si > 6, reste Immunisé/Citoyen
    this.roles[shuffled[0].id] = 'infected';
    this.roles[shuffled[1].id] = 'doctor';
    this.roles[shuffled[2].id] = 'immune';

    for (let i = 3; i < pCount; i++) {
      if (i === 3 && pCount >= 6) {
        this.roles[shuffled[i].id] = 'infiltrator';
      } else {
        this.roles[shuffled[i].id] = 'immune';
      }
    }

    for (const p of this.players) {
      this.statusMap[p.id] = (this.roles[p.id] === 'infected' || this.roles[p.id] === 'infiltrator') ? 'infected' : 'healthy';
    }
  }

  startNightPhase() {
    this.phase = 'night';
    this.timer = 12;
    this.nightActions = { infectedTargetId: null, doctorProtectedId: null };
    this.broadcast();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.resolveNight();
      } else {
        this.broadcast();
      }
    }, 1000);

    // Bots IA en phase de nuit
    for (const p of this.players) {
      if (p.isBot && !p.isQuarantined) {
        const role = this.roles[p.id];
        const livingTargets = this.players.filter(target => !target.isQuarantined && target.id !== p.id);
        const randomTarget = livingTargets[Math.floor(Math.random() * livingTargets.length)]?.id;

        if (role === 'infected' && randomTarget) {
          this.nightActions.infectedTargetId = randomTarget;
        } else if (role === 'doctor' && randomTarget) {
          this.nightActions.doctorProtectedId = randomTarget;
        }
      }
    }
  }

  handleAction(player, action, payload = {}) {
    if (player.isQuarantined) return;

    if (this.phase === 'night') {
      const role = this.roles[player.id];
      const targetId = payload.targetId;
      if (!targetId || targetId === player.id) return;

      if (role === 'infected' || role === 'infiltrator') {
        this.nightActions.infectedTargetId = targetId;
      } else if (role === 'doctor') {
        this.nightActions.doctorProtectedId = targetId;
      }
      this.broadcast();

      // Si toutes les actions requises sont passées
      if (this.nightActions.infectedTargetId && this.nightActions.doctorProtectedId) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.resolveNight();
      }
    } else if (this.phase === 'day_voting') {
      if (action === 'cast_vote') {
        const targetId = payload.targetId;
        if (targetId && targetId !== player.id) {
          this.votes[player.id] = targetId;
          this.broadcast();

          // Si tous les joueurs vivants ont voté
          const livingPlayers = this.players.filter(p => !p.isQuarantined);
          const allVoted = livingPlayers.every(p => this.votes[p.id]);
          if (allVoted) {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.resolveVoting();
          }
        }
      }
    }
  }

  resolveNight() {
    // Si la cible du virus a été protégée par le docteur, l'infection échoue !
    if (this.nightActions.infectedTargetId) {
      if (this.nightActions.infectedTargetId !== this.nightActions.doctorProtectedId) {
        this.statusMap[this.nightActions.infectedTargetId] = 'infected';
      }
    }

    this.startDayDiscussion();
  }

  startDayDiscussion() {
    this.phase = 'day_discussion';
    this.timer = 15;
    this.broadcast();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.startDayVoting();
      } else {
        this.broadcast();
      }
    }, 1000);
  }

  startDayVoting() {
    this.phase = 'day_voting';
    this.timer = 15;
    this.votes = {};
    this.broadcast();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.resolveVoting();
      } else {
        this.broadcast();
      }
    }, 1000);

    // Votes IA
    const candidates = this.players.filter(p => !p.isQuarantined);
    for (const p of this.players) {
      if (p.isBot && !p.isQuarantined) {
        const potential = candidates.filter(c => c.id !== p.id);
        const choice = potential[Math.floor(Math.random() * potential.length)];
        if (choice) {
          setTimeout(() => {
            this.handleAction(p, 'cast_vote', { targetId: choice.id });
          }, 2000 + Math.random() * 3000);
        }
      }
    }
  }

  resolveVoting() {
    this.phase = 'quarantine_reveal';
    const tally = {};
    for (const targetId of Object.values(this.votes)) {
      tally[targetId] = (tally[targetId] || 0) + 1;
    }

    let maxVotes = -1;
    let chosenId = null;
    for (const [tId, count] of Object.entries(tally)) {
      if (count > maxVotes) {
        maxVotes = count;
        chosenId = tId;
      }
    }

    if (chosenId) {
      const quarantinedPlayer = this.players.find(p => p.id === chosenId);
      if (quarantinedPlayer) {
        quarantinedPlayer.isQuarantined = true;
        this.lastQuarantined = {
          id: quarantinedPlayer.id,
          name: quarantinedPlayer.name,
          role: this.roles[quarantinedPlayer.id],
        };
      }
    }

    this.broadcast();

    // Vérifier les conditions de victoire
    const living = this.players.filter(p => !p.isQuarantined);
    const livingInfected = living.filter(p => this.roles[p.id] === 'infected' || this.roles[p.id] === 'infiltrator');

    if (livingInfected.length === 0) {
      this.winnerTeam = 'civils';
      this.endGame();
    } else if (livingInfected.length >= living.length / 2) {
      this.winnerTeam = 'virus';
      this.endGame();
    } else {
      setTimeout(() => {
        this.round++;
        this.startNightPhase();
      }, 4000);
    }
  }

  endGame() {
    this.phase = 'ended';
    for (const p of this.players) {
      const isVirus = this.roles[p.id] === 'infected' || this.roles[p.id] === 'infiltrator';
      if ((this.winnerTeam === 'virus' && isVirus) || (this.winnerTeam === 'civils' && !isVirus)) {
        p.score += 250;
      }
    }
    this.broadcast();
    if (typeof this.onGameOver === 'function') {
      this.onGameOver(this.winnerTeam);
    }
  }

  getState() {
    return {
      round: this.round,
      phase: this.phase,
      timer: this.timer,
      quarantinedPlayers: this.players.filter(p => p.isQuarantined).map(p => p.id),
      lastQuarantined: this.lastQuarantined,
      winnerTeam: this.winnerTeam,
      votes: this.votes,
    };
  }

  getPublicState() {
    // SÉCURITÉ STRICTE : Les rôles secrets ne sont pas envoyés sur la TV avant révélation de quarantaine
    return {
      arenaGameId: 'the_virus_game',
      ...this.getState(),
      livingCount: this.players.filter(p => !p.isQuarantined).length,
    };
  }

  getPrivateState(playerId) {
    // SÉCURITÉ STRICTE : Chaque joueur ne voit que son propre rôle
    return {
      myVirusRole: this.roles[playerId],
      myHealthStatus: this.statusMap[playerId],
    };
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
