// Mini Racing Arcade Game Engine for PLAYFLIX
// Real-time physics, checkpoint tracking, collision bounce, drift, and nitro boost

const TRACK_LENGTH = 1000;
const TOTAL_LAPS = 3;

export class MiniRacingEngine {
  constructor(players, onStateChange, onGameOver) {
    this.playersList = players.map((p, idx) => {
      const col = typeof p === 'string' ? p : p.color || 'red';
      const name = typeof p === 'string' ? p : p.name || `Pilote ${idx + 1}`;
      return {
        id: typeof p === 'string' ? `p_${idx}` : p.id || `p_${idx}`,
        name,
        color: col,
        isBot: typeof p === 'object' ? !!p.isBot : false,
        x: 0.5, // horizontal track position (-1 to 1)
        progress: 0, // 0 to TRACK_LENGTH * TOTAL_LAPS
        lap: 1,
        speed: 0,
        maxSpeed: 28,
        nitro: 100, // 0 to 100
        isNitroActive: false,
        isDrifting: false,
        steering: 0, // -1 (left) to 1 (right)
        isAccelerating: false,
        isBraking: false,
        finishedRank: null,
      };
    });

    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.status = 'countdown'; // 'countdown' | 'racing' | 'finished'
    this.countdown = 3;
    this.winner = null;
    this.finishOrder = [];

    this.loopTimer = null;
    this.countdownTimer = null;

    this.startCountdown();
  }

  startCountdown() {
    this.countdown = 3;
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownTimer);
        this.status = 'racing';
        this.startPhysicsLoop();
      }
      this.notify();
    }, 1000);
  }

  startPhysicsLoop() {
    if (this.loopTimer) clearInterval(this.loopTimer);

    // 30 Hz server physics tick (low overhead for TV WebSocket bandwidth)
    this.loopTimer = setInterval(() => {
      if (this.status !== 'racing') return;

      let allFinished = true;

      for (const p of this.playersList) {
        if (p.finishedRank !== null) continue;
        allFinished = false;

        // Bot autonomous AI logic
        if (p.isBot) {
          p.isAccelerating = true;
          // Slight steering variation towards center
          p.steering = (Math.random() - 0.5) * 0.4 + (0.5 - p.x) * 0.1;
          if (Math.random() < 0.05 && p.nitro > 20) {
            p.isNitroActive = true;
          }
        }

        // 1. Acceleration / Braking
        const accel = p.isAccelerating ? 0.9 : -0.4;
        const nitroBoost = p.isNitroActive && p.nitro > 0 ? 1.6 : 1.0;
        if (p.isNitroActive && p.nitro > 0) {
          p.nitro = Math.max(0, p.nitro - 1.5);
          if (p.nitro <= 0) p.isNitroActive = false;
        } else {
          p.nitro = Math.min(100, p.nitro + 0.1); // slow recharge
        }

        p.speed = Math.max(0, Math.min(p.maxSpeed * nitroBoost, p.speed + accel));
        if (p.isBraking) p.speed = Math.max(0, p.speed - 1.2);

        // 2. Horizontal Steering & track bounds
        p.x += p.steering * (p.speed / p.maxSpeed) * 0.06;
        if (p.x < 0.1) {
          p.x = 0.1;
          p.speed *= 0.85; // grass friction
        } else if (p.x > 0.9) {
          p.x = 0.9;
          p.speed *= 0.85; // grass friction
        }

        // 3. Track Progress
        p.progress += p.speed * 0.35;
        p.lap = Math.min(TOTAL_LAPS, Math.floor(p.progress / TRACK_LENGTH) + 1);

        // 4. Finish condition
        if (p.progress >= TRACK_LENGTH * TOTAL_LAPS && p.finishedRank === null) {
          this.finishOrder.push(p.id);
          p.finishedRank = this.finishOrder.length;
          if (!this.winner) {
            this.winner = p.name;
          }
        }
      }

      if (allFinished || this.finishOrder.length === this.playersList.length) {
        this.status = 'finished';
        clearInterval(this.loopTimer);
        if (this.onGameOver) this.onGameOver(this.winner);
      }

      this.notify();
    }, 33);
  }

  handlePlayerInput(playerId, action, payload = {}) {
    const p = this.playersList.find(pl => pl.id === playerId);
    if (!p) return;

    if (action === 'steer') {
      p.steering = Math.max(-1, Math.min(1, Number(payload.steering) || 0));
    } else if (action === 'accelerate') {
      p.isAccelerating = !!payload.active;
    } else if (action === 'brake') {
      p.isBraking = !!payload.active;
    } else if (action === 'nitro') {
      if (payload.active && p.nitro > 15) {
        p.isNitroActive = true;
      } else {
        p.isNitroActive = false;
      }
    }
  }

  getState() {
    // Sort live rankings by progress descending
    const rankings = [...this.playersList]
      .sort((a, b) => b.progress - a.progress)
      .map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        progress: p.progress,
        lap: p.lap,
        speed: Math.round(p.speed * 4.5), // km/h display
        nitro: Math.round(p.nitro),
        isNitroActive: p.isNitroActive,
        finishedRank: p.finishedRank,
        x: p.x,
      }));

    return {
      status: this.status,
      countdown: this.countdown,
      totalLaps: TOTAL_LAPS,
      trackLength: TRACK_LENGTH,
      players: rankings,
      winner: this.winner,
      finishOrder: this.finishOrder,
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.loopTimer) clearInterval(this.loopTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
}
