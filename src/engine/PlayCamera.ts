// Dynamic 2.5D / Pseudo-3D Camera System for TV & Game Boards
// Smooth action zooms, cinematic screen shakes, focal tracking and panoramic reveals

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  tilt: number; // 2.5D isometric tilt (degrees)
  shakeX: number;
  shakeY: number;
}

export type CameraListener = (state: CameraState) => void;

export class PlayCamera {
  private targetX = 0;
  private targetY = 0;
  private targetZoom = 1;
  private targetTilt = 15; // default subtle 2.5D tilt

  public currentX = 0;
  public currentY = 0;
  public currentZoom = 1;
  public currentTilt = 15;

  private shakeIntensity = 0;
  private shakeDecay = 0.9;
  private listeners: CameraListener[] = [];
  private isAnimating = false;
  private animFrameId: number | null = null;

  constructor() {
    this.startLoop();
  }

  public subscribe(listener: CameraListener): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): CameraState {
    const angle = Math.random() * Math.PI * 2;
    const shakeOffsetX = Math.cos(angle) * this.shakeIntensity;
    const shakeOffsetY = Math.sin(angle) * this.shakeIntensity;

    return {
      x: this.currentX,
      y: this.currentY,
      zoom: this.currentZoom,
      rotation: 0,
      tilt: this.currentTilt,
      shakeX: shakeOffsetX,
      shakeY: shakeOffsetY,
    };
  }

  // --- Dynamic Action Triggers ---

  // 1. Reset to full board panoramic view
  public reset(durationMs = 600) {
    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 1;
    this.targetTilt = 15;
  }

  // 2. Focus & Zoom on active rolling dice
  public focusDice(diceX: number, diceY: number) {
    this.targetX = (diceX - 300) * 0.4;
    this.targetY = (diceY - 300) * 0.4;
    this.targetZoom = 1.15;
    this.targetTilt = 18;
  }

  // 3. Focus on moving pawn
  public focusPawn(pawnX: number, pawnY: number) {
    this.targetX = (pawnX - 300) * 0.35;
    this.targetY = (pawnY - 300) * 0.35;
    this.targetZoom = 1.1;
    this.targetTilt = 16;
  }

  // 4. Dramatic Action Cam for Captures / Duel Knockout
  public focusCapture(cellX: number, cellY: number) {
    this.targetX = (cellX - 300) * 0.6;
    this.targetY = (cellY - 300) * 0.6;
    this.targetZoom = 1.35;
    this.targetTilt = 22;
    this.shake(12);

    // Auto reset after 1.4s
    setTimeout(() => {
      this.reset();
    }, 1400);
  }

  // 5. Grand Victory Celebration Panorama
  public victoryPanorama() {
    this.targetX = 0;
    this.targetY = -30;
    this.targetZoom = 0.92;
    this.targetTilt = 24;
    this.shake(6);
  }

  // 6. Screen Shake trigger
  public shake(intensity = 8) {
    this.shakeIntensity = Math.min(25, this.shakeIntensity + intensity);
  }

  private startLoop() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const tick = () => {
      if (!this.isAnimating) return;

      // Smooth Easing (Lerp)
      const lerp = 0.1;
      this.currentX += (this.targetX - this.currentX) * lerp;
      this.currentY += (this.targetY - this.currentY) * lerp;
      this.currentZoom += (this.targetZoom - this.currentZoom) * lerp;
      this.currentTilt += (this.targetTilt - this.currentTilt) * lerp;

      // Shake decay
      this.shakeIntensity *= this.shakeDecay;
      if (this.shakeIntensity < 0.2) this.shakeIntensity = 0;

      const state = this.getState();
      for (const listener of this.listeners) {
        listener(state);
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public destroy() {
    this.isAnimating = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.listeners = [];
  }
}

export const playCamera = new PlayCamera();
