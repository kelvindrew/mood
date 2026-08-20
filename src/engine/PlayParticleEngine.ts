// High-Performance Pooled 2D/2.5D Particle Engine for Hisense VIDAA TV & Mobile
// Zero Garbage Collection during gameplay for buttery smooth 60 FPS

export type ParticleType = 'confetti' | 'spark' | 'smoke' | 'fire' | 'star' | 'dust' | 'speed_line' | 'ice';

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: ParticleType;
  rotation: number;
  vRot: number;
  gravity: number;
  scaleDecay: number;
}

export class PlayParticleEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private pool: Particle[] = [];
  private maxParticles = 300; // Optimized for Smart TV CPU/GPU
  private isRunning = false;
  private animFrameId: number | null = null;

  constructor(maxParticles = 300) {
    this.maxParticles = maxParticles;
    // Preallocate object pool to prevent memory churn & GC pauses
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 4,
        color: '#FFFFFF',
        alpha: 1,
        life: 0,
        maxLife: 60,
        type: 'spark',
        rotation: 0,
        vRot: 0,
        gravity: 0.1,
        scaleDecay: 0.98,
      });
    }
  }

  public attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.start();
  }

  public detach() {
    this.stop();
    this.canvas = null;
    this.ctx = null;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      this.updateAndRender();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public clear() {
    for (const p of this.pool) {
      p.active = false;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    color: string,
    maxLife: number,
    type: ParticleType,
    gravity = 0.1
  ) {
    // Find inactive particle in pool
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.size = size;
        p.color = color;
        p.alpha = 1;
        p.life = 0;
        p.maxLife = maxLife;
        p.type = type;
        p.rotation = Math.random() * Math.PI * 2;
        p.vRot = (Math.random() - 0.5) * 0.2;
        p.gravity = gravity;
        p.scaleDecay = 0.98;
        return;
      }
    }
  }

  // --- Particle Effect Presets ---

  // 1. Victory / Capture Explosion
  public emitExplosion(x: number, y: number, color = '#FFD100', count = 35) {
    const colors = [color, '#FFFFFF', '#FF3B30', '#34C759', '#007AFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const col = colors[Math.floor(Math.random() * colors.length)];
      this.spawn(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        4 + Math.random() * 6,
        col,
        45 + Math.random() * 30,
        'star',
        0.15
      );
    }
  }

  // 2. Pawn Landing Dust / Impact Shockwave
  public emitImpact(x: number, y: number, color = '#FFFFFF', count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.spawn(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed * 0.5, // 2.5D squashed ellipse
        3 + Math.random() * 4,
        color,
        25 + Math.random() * 15,
        'dust',
        0.02
      );
    }
  }

  // 3. Dice Roll Spark Trail
  public emitDiceSparks(x: number, y: number, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.spawn(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 1,
        2 + Math.random() * 3,
        '#FFD700',
        20 + Math.random() * 15,
        'spark',
        0.1
      );
    }
  }

  // 4. Car Speed / Drift Smoke Trail
  public emitTireSmoke(x: number, y: number, vx: number, vy: number, color = '#AAAAAA') {
    this.spawn(
      x + (Math.random() - 0.5) * 6,
      y + (Math.random() - 0.5) * 6,
      vx * 0.2 + (Math.random() - 0.5) * 1.5,
      vy * 0.2 + (Math.random() - 0.5) * 1.5,
      6 + Math.random() * 8,
      color,
      30 + Math.random() * 20,
      'smoke',
      -0.02 // slight rise
    );
  }

  // 5. Environmental Ambient Motes (Volcano embers, Galaxy stardust, Ice flakes)
  public emitAmbientMote(width: number, height: number, type: 'fire' | 'ice' | 'star') {
    const x = Math.random() * width;
    if (type === 'fire') {
      // Lava embers rise up
      this.spawn(
        x,
        height + 10,
        (Math.random() - 0.5) * 1,
        -1.5 - Math.random() * 2,
        3 + Math.random() * 4,
        Math.random() > 0.4 ? '#FF4500' : '#FFD700',
        90 + Math.random() * 60,
        'fire',
        -0.01
      );
    } else if (type === 'ice') {
      // Snow falls gently
      this.spawn(
        x,
        -10,
        (Math.random() - 0.5) * 0.8,
        1 + Math.random() * 1.5,
        2.5 + Math.random() * 3,
        '#E0F7FA',
        100 + Math.random() * 60,
        'ice',
        0.01
      );
    } else {
      // Twinkling space dust
      this.spawn(
        x,
        Math.random() * height,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        1.5 + Math.random() * 2.5,
        '#C5CAE9',
        80 + Math.random() * 40,
        'star',
        0
      );
    }
  }

  private updateAndRender() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life++;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      // Physics integration
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;
      p.size *= p.scaleDecay;
      p.alpha = 1 - p.life / p.maxLife;

      // Draw particle based on type
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.type === 'star' || p.type === 'confetti') {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      } else if (p.type === 'smoke' || p.type === 'dust') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else if (p.type === 'fire') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
      } else {
        // Spark / Ice / default circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, Math.max(1, p.size), 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }
}

export const playParticles = new PlayParticleEngine(250);
