// Device Shake & Motion Detector for mobile controllers

export class ShakeDetector {
  private threshold: number = 16; // Acceleration threshold
  private lastX: number = 0;
  private lastY: number = 0;
  private lastZ: number = 0;
  private lastTime: number = 0;
  private onShakeCallback: (() => void) | null = null;
  private isListening: boolean = false;

  constructor(onShake: () => void, threshold = 16) {
    this.onShakeCallback = onShake;
    this.threshold = threshold;
    this.handleMotion = this.handleMotion.bind(this);
  }

  public start() {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      // For iOS 13+ permission request if needed
      const DeviceMotionEventTyped = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof DeviceMotionEventTyped.requestPermission === 'function') {
        DeviceMotionEventTyped.requestPermission().then((res) => {
          if (res === 'granted') {
            window.addEventListener('devicemotion', this.handleMotion);
            this.isListening = true;
          }
        }).catch(() => {});
      } else {
        window.addEventListener('devicemotion', this.handleMotion);
        this.isListening = true;
      }
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && this.isListening) {
      window.removeEventListener('devicemotion', this.handleMotion);
      this.isListening = false;
    }
  }

  private handleMotion(event: DeviceMotionEvent) {
    const current = event.accelerationIncludingGravity;
    if (!current || current.x === null || current.y === null || current.z === null) return;

    const now = Date.now();
    if (now - this.lastTime > 100) {
      const diffTime = now - this.lastTime;
      this.lastTime = now;

      const speed = Math.abs(current.x + current.y + current.z - this.lastX - this.lastY - this.lastZ) / diffTime * 10000;

      if (speed > this.threshold * 50) {
        if (this.onShakeCallback) {
          this.onShakeCallback();
        }
      }

      this.lastX = current.x;
      this.lastY = current.y;
      this.lastZ = current.z;
    }
  }
}
