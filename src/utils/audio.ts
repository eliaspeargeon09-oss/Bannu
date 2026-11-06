// Dynamic Web Audio API synthesized sound generator for sci-fi UI and celebration

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // lazy init on first user tap
  }

  private initCtx() {
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

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Soft UI tap chirp
  public playTap() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  // Atmospheric signal decode chime
  public playDecode() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {
      // Ignored
    }
  }

  // Holographic scan hum
  public playScan() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.25);
      osc.frequency.linearRampToValueAtTime(330, now + 0.4);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignored
    }
  }

  // Birthday celebration magical fanfare
  public playCelebration() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Arpeggio chords
      const notes = [
        { f: 523.25, t: 0.0 }, // C5
        { f: 659.25, t: 0.15 }, // E5
        { f: 783.99, t: 0.3 }, // G5
        { f: 1046.5, t: 0.45 }, // C6
        { f: 1318.51, t: 0.65 }, // E6
        { f: 1567.98, t: 0.85 }, // G6
      ];

      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0.12, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + 0.7);
      });
    } catch {
      // Ignored
    }
  }

  // Candle ignition spark
  public playCandleSpark() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignored
    }
  }

  // Blowing out candle puff sound
  public playBlowSound() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Ignored
    }
  }

  // Knife slice & celebration shimmer
  public playKnifeCut() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.25);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);

      // Followed by high sparkle chimes
      [1318.51, 1567.98, 2093.0].forEach((f, i) => {
        const chime = this.ctx!.createOscillator();
        const cGain = this.ctx!.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(f, now + 0.15 + i * 0.08);
        cGain.gain.setValueAtTime(0.07, now + 0.15 + i * 0.08);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + i * 0.08 + 0.4);
        chime.connect(cGain);
        cGain.connect(this.ctx!.destination);
        chime.start(now + 0.15 + i * 0.08);
        chime.stop(now + 0.15 + i * 0.08 + 0.4);
      });
    } catch {
      // Ignored
    }
  }

  // Sweet music box / bell chime playing Happy Birthday opening melody
  public playHappyBirthdayTune() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.25, t: 0.0 }, // C5
        { f: 523.25, d: 0.25, t: 0.3 }, // C5
        { f: 587.33, d: 0.5, t: 0.6 }, // D5
        { f: 523.25, d: 0.5, t: 1.15 }, // C5
        { f: 698.46, d: 0.5, t: 1.7 }, // F5
        { f: 659.25, d: 0.85, t: 2.25 }, // E5

        { f: 523.25, d: 0.25, t: 3.2 }, // C5
        { f: 523.25, d: 0.25, t: 3.5 }, // C5
        { f: 587.33, d: 0.5, t: 3.8 }, // D5
        { f: 523.25, d: 0.5, t: 4.35 }, // C5
        { f: 783.99, d: 0.5, t: 4.9 }, // G5
        { f: 698.46, d: 0.95, t: 5.45 }, // F5
      ];

      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(n.f * 2, now + n.t);

        gain.gain.setValueAtTime(0.09, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d + 0.2);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.2);
        osc2.start(now + n.t);
        osc2.stop(now + n.t + n.d + 0.2);
      });
    } catch {
      // Ignored
    }
  }
}

export const sounds = new SoundController();
