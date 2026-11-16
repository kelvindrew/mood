// Audio & Speech Synthesis Manager for PLAYFLIX
// Includes custom buzzers, synthesized melody playback and voice announcer

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  // TV Voice Commentator via Web Speech Synthesis API
  public speak(text: string) {
    if (this.isMuted || !this.voiceEnabled) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Stop prior speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore speech synthesis errors
      }
    }
  }

  // UI Focus Sound (Disabled for zero latency and silent navigation)
  public playFocus() {
    // Silent navigation on cursor movement
  }

  // UI Select / Confirm
  public playSelect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.06);
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch {}
  }

  // Back / Cancel
  public playBack() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  // Dice Roll
  public playDiceRoll() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      for (let i = 0; i < 5; i++) {
        const time = this.ctx.currentTime + (i * 0.06);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180 + Math.random() * 150, time);

        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.04);
      }
    } catch {}
  }

  // Card Play Swoosh
  public playCardSwoosh() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {}
  }

  // Custom Buzzers by Type
  public playCustomBuzzer(soundType: string = 'arcade') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      switch (soundType) {
        case 'klaxon': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc1.type = 'sawtooth';
          osc2.type = 'sawtooth';
          osc1.frequency.setValueAtTime(311.13, now); // Eb4
          osc2.frequency.setValueAtTime(369.99, now); // F#4

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start();
          osc2.start();
          osc1.stop(now + 0.36);
          osc2.stop(now + 0.36);
          break;
        }
        case 'laser': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(now + 0.21);
          break;
        }
        case 'airhorn': {
          [233.08, 293.66, 349.23, 466.16].forEach((f) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start();
            osc.stop(now + 0.41);
          });
          break;
        }
        case 'gong': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, now);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(now + 1.25);
          break;
        }
        default: {
          // Standard Arcade Buzzer
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(now + 0.16);
          break;
        }
      }
    } catch {}
  }

  // Play Blind Test Melody
  public playMelody(notes: number[]) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !notes) return;

    try {
      const startTime = this.ctx.currentTime + 0.1;
      const noteDuration = 0.18;

      notes.forEach((freq, i) => {
        if (freq === 0) return;
        const time = startTime + (i * noteDuration);
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + (noteDuration * 0.9));

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(time);
        osc.stop(time + noteDuration);
      });
    } catch {}
  }

  // Victory Fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const time = this.ctx!.currentTime + (index * 0.12);
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        const duration = index === notes.length - 1 ? 0.6 : 0.15;
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(time);
        osc.stop(time + duration);
      });
    } catch {}
  }

  // Player Join Chime
  // --- MOOD ARENA DRAMATIC SOUND FX (The Devil's Plan) ---

  // Deep resonant bronze gong for rounds, challenges and phases
  public playArenaGong() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Oscillateur basse fréquence + harmonique
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(75, now + 2.2);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.exponentialRampToValueAtTime(145, now + 1.8);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
    } catch {}
  }

  // Tense double heartbeat for countdowns under 5 seconds
  public playHeartbeat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const beat = (time: number, freq: number, vol: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(time);
        osc.stop(time + 0.13);
      };

      beat(now, 60, 0.25);
      beat(now + 0.14, 50, 0.18);
    } catch {}
  }

  // High-tension dramatic stinger when Doubt is called or danger arises
  public playDoubtAlert() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      // Tritone dissonant pour choc psychologique
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(622.25, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } catch {}
  }

  // Bright metallic chime when a Mill is formed in Nine Men's Morris
  public playMillAlert() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [880, 1174.66, 1760];
      freqs.forEach((f, idx) => {
        const t = now + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    } catch {}
  }

  // Grand imperial triumph fanfare
  public playRoyalFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [
        [523.25, 659.25], // Do-Mi
        [659.25, 783.99], // Mi-Sol
        [783.99, 1046.50, 1318.51], // Sol-Do-Mi aigu
      ];

      chords.forEach((chord, step) => {
        const stepTime = now + step * 0.18;
        const duration = step === chords.length - 1 ? 0.9 : 0.16;

        chord.forEach(f => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, stepTime);

          gain.gain.setValueAtTime(0.1, stepTime);
          gain.gain.exponentialRampToValueAtTime(0.001, stepTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(stepTime);
          osc.stop(stepTime + duration + 0.05);
        });
      });
    } catch {}
  }

  public playPlayerJoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.21);
    } catch {}
  }
}

export const audio = new AudioManager();
