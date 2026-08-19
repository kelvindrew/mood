// Loup-Garou / Village Secret Game Engine for PLAYFLIX
// Dynamic day/night phases, secret roles on mobile, immersive TV town hall

export class WerewolfEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players; // array of { id, name, avatar }
    this.playerStates = {};
    this.phase = 'night_seer';
    this.dayNumber = 1;
    this.timeRemaining = 25;
    this.lastNightVictimId = null;
    this.lastExecutedId = null;
    this.winnerTeam = null;
    this.narratorLog = 'La nuit tombe sur le village... Tout le monde s’endort.';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.assignRoles();

    this.timer = null;
    this.startPhaseTimer();
  }

  assignRoles() {
    const rolesPool = ['werewolf', 'seer', 'villager', 'witch', 'hunter', 'werewolf', 'villager', 'villager'];
    const shuffled = [...rolesPool].sort(() => Math.random() - 0.5);

    this.players.forEach((p, idx) => {
      this.playerStates[p.id] = {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        role: shuffled[idx % shuffled.length],
        isAlive: true,
        targetId: undefined,
      };
    });
  }

  startPhaseTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timeRemaining = this.phase.startsWith('night') ? 20 : 35;

    this.timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.advancePhase();
      }
      this.notify();
    }, 1000);

    this.notify();
  }

  handleAction(playerId, targetId) {
    const player = this.playerStates[playerId];
    if (!player || !player.isAlive) return;

    player.targetId = targetId;
    this.notify();
  }

  advancePhase() {
    if (this.phase === 'night_seer') {
      this.phase = 'night_werewolves';
      this.narratorLog = 'Les Loups-Garous se réveillent et choisissent leur proie...';
    } else if (this.phase === 'night_werewolves') {
      // Find victim targeted by wolves
      const wolfTargets = Object.values(this.playerStates)
        .filter(p => p.role === 'werewolf' && p.isAlive && p.targetId)
        .map(p => p.targetId);

      this.lastNightVictimId = wolfTargets[0] || null;
      this.phase = 'night_witch';
      this.narratorLog = 'La Sorcière se réveille... Va-t-elle sauver ou empoisonner ?';
    } else if (this.phase === 'night_witch') {
      // Apply victim death
      if (this.lastNightVictimId && this.playerStates[this.lastNightVictimId]) {
        this.playerStates[this.lastNightVictimId].isAlive = false;
      }
      this.phase = 'day_discussion';
      this.narratorLog = `Le soleil se lève sur le village ! ${
        this.lastNightVictimId
          ? `${this.playerStates[this.lastNightVictimId]?.name} a été dévoré cette nuit !`
          : 'Miracle, personne n’est mort cette nuit !'
      }`;
      // Reset targets
      Object.values(this.playerStates).forEach(p => p.targetId = undefined);
    } else if (this.phase === 'day_discussion') {
      this.phase = 'day_voting';
      this.narratorLog = 'Le Tribunal du Village est ouvert ! Votez pour désigner un suspect.';
    } else if (this.phase === 'day_voting') {
      // Tally votes
      const voteCounts = {};
      Object.values(this.playerStates).filter(p => p.isAlive && p.targetId).forEach(p => {
        voteCounts[p.targetId] = (voteCounts[p.targetId] || 0) + 1;
      });

      let maxVotes = 0;
      let executedId = null;
      for (const [tId, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
          maxVotes = count;
          executedId = tId;
        }
      }

      if (executedId && this.playerStates[executedId]) {
        this.playerStates[executedId].isAlive = false;
        this.lastExecutedId = executedId;
        this.narratorLog = `Le village a voté : ${this.playerStates[executedId].name} (${this.playerStates[executedId].role}) est éliminé !`;
      } else {
        this.narratorLog = 'Égalité ou absence de votes : personne n’est exécuté aujourd’hui.';
      }

      // Check win condition
      if (this.checkWinCondition()) return;

      this.dayNumber++;
      this.phase = 'night_seer';
      this.lastNightVictimId = null;
      Object.values(this.playerStates).forEach(p => p.targetId = undefined);
    }

    if (!this.checkWinCondition()) {
      this.startPhaseTimer();
    }
  }

  checkWinCondition() {
    const alive = Object.values(this.playerStates).filter(p => p.isAlive);
    const aliveWolves = alive.filter(p => p.role === 'werewolf');
    const aliveVillagers = alive.filter(p => p.role !== 'werewolf');

    if (aliveWolves.length === 0) {
      this.winnerTeam = 'villagers';
      this.endGame('Les Villageois ont éliminé tous les Loups-Garous ! Victoire du Village !');
      return true;
    }

    if (aliveWolves.length >= aliveVillagers.length) {
      this.winnerTeam = 'werewolves';
      this.endGame('Les Loups-Garous ont décimé le village ! Victoire des Loups !');
      return true;
    }

    return false;
  }

  endGame(log) {
    if (this.timer) clearInterval(this.timer);
    this.phase = 'game_over';
    this.narratorLog = log;
    this.notify();
    if (this.onGameOver) this.onGameOver(this.winnerTeam);
  }

  getState() {
    return {
      phase: this.phase,
      dayNumber: this.dayNumber,
      timeRemaining: this.timeRemaining,
      players: this.playerStates,
      lastNightVictimId: this.lastNightVictimId,
      lastExecutedId: this.lastExecutedId,
      winnerTeam: this.winnerTeam,
      narratorLog: this.narratorLog,
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
