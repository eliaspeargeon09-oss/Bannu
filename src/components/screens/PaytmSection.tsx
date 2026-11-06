import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Trophy,
  ShieldAlert,
  Zap,
  TrendingDown,
  Sparkles,
  Heart,
  Wallet,
  Coins,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';

// Video source located in the public directory
const PAYTM_VIDEO_URL = '/videos/7.mp4';

interface PaytmSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
}

// Synthesized sound effects helper for sci-fi financial alerts and glitches
function createPaytmSFX() {
  const getCtx = () => {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  };

  return {
    playGlitch: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Noise burst
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(3, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
      } catch {
        // audio context blocked or unsupported
      }
    },

    playSystemAlert: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Dual tone red alert pulses
        [0, 0.22, 0.44].forEach((offset) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sawtooth';
          osc2.type = 'square';

          osc1.frequency.setValueAtTime(880, now + offset);
          osc1.frequency.exponentialRampToValueAtTime(440, now + offset + 0.18);

          osc2.frequency.setValueAtTime(660, now + offset);
          osc2.frequency.exponentialRampToValueAtTime(330, now + offset + 0.18);

          gain.gain.setValueAtTime(0.12, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.19);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now + offset);
          osc1.stop(now + offset + 0.19);
          osc2.start(now + offset);
          osc2.stop(now + offset + 0.19);
        });
      } catch {
        // audio context blocked or unsupported
      }
    },

    playBelowZero: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.6);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.65);
      } catch {
        // audio context blocked or unsupported
      }
    },

    playTrophyFanfare: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const notes = [
          { f: 440, t: 0.0 }, // A4
          { f: 554.37, t: 0.12 }, // C#5
          { f: 659.25, t: 0.24 }, // E5
          { f: 880, t: 0.38 }, // A5
          { f: 1108.73, t: 0.55 }, // C#6
        ];

        notes.forEach((n) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now + n.t);

          gain.gain.setValueAtTime(0.12, now + n.t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + n.t);
          osc.stop(now + n.t + 0.45);
        });
      } catch {
        // audio context blocked or unsupported
      }
    },
  };
}

export const PaytmSection: React.FC<PaytmSectionProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
  nextDestinationName = 'Zoo Park',
}) => {
  // Experience flow: 'video' -> 'glitch' -> 'roast'
  const [phase, setPhase] = useState<'video' | 'glitch' | 'roast'>('video');
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sfxRef = useRef(createPaytmSFX());

  // Attempt autoplay when entering 'video' phase
  useEffect(() => {
    if (phase !== 'video') return;

    const video = videoRef.current;
    if (!video) return;

    setVideoError(null);
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // If unmuted autoplay is prevented by browser policy, try muted
        console.warn('Autoplay unmuted blocked by browser policy, falling back to muted:', err);
        video.muted = true;
        video.play().catch((secondErr) => {
          console.warn('Playback requires user gesture:', secondErr);
        });
      });
    }
  }, [phase]);

  // Video Ended Handler: Triggers glitch transition and immediately reveals roast screen
  const handleVideoEnded = useCallback(() => {
    sfxRef.current.playGlitch();
    setPhase('glitch');

    // Trigger red system alert sound shortly into glitch
    setTimeout(() => {
      sfxRef.current.playSystemAlert();
    }, 250);

    // Transition smoothly into roast screen
    setTimeout(() => {
      setPhase('roast');
      sfxRef.current.playBelowZero();

      // Fanfare for the Trophy
      setTimeout(() => {
        sfxRef.current.playTrophyFanfare();
      }, 1200);
    }, 750);
  }, []);

  // Video Error Handler
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Paytm video failed to load:', e);
    setVideoError(
      'Failed to load video file from /videos/7.mp4. Please verify the file is placed at public/videos/7.mp4.'
    );
  };

  // Replay option: resets video and re-enters full-screen video playback
  const handleReplayVideo = () => {
    sounds.playTap();
    setPhase('video');
    setVideoError(null);
  };

  // Mark Paytm complete and advance to next planet
  const handleProceed = () => {
    sounds.playDecode();
    onCompleteDestination('paytm');
    onContinueNext();
  };

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-start text-slate-100 select-none">
      {/* ========================================================================= */}
      {/* 1. FULLSCREEN VIDEO PLAYBACK                                              */}
      {/* Strict: Pure video, no menus, no buttons, no overlays, original aspect     */}
      {/* ========================================================================= */}
      {phase === 'video' && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={PAYTM_VIDEO_URL}
            playsInline
            autoPlay
            loop={false}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            onClick={() => {
              // Unmute or play if paused on tap
              if (videoRef.current) {
                if (videoRef.current.paused) {
                  videoRef.current.play();
                } else if (videoRef.current.muted) {
                  videoRef.current.muted = false;
                }
              }
            }}
            className="w-full h-full object-contain bg-black cursor-pointer"
          />

          {/* Development environment error message */}
          {videoError && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
              <div className="max-w-md w-full p-6 rounded-2xl bg-red-950/90 border-2 border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.5)] text-center font-mono-tech">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3 animate-pulse" />
                <h3 className="font-display text-lg font-bold text-red-200 uppercase tracking-wider mb-2">
                  VIDEO PLAYBACK ERROR
                </h3>
                <p className="text-xs text-red-300 mb-3 leading-relaxed">
                  {videoError}
                </p>
                <div className="p-2.5 rounded-lg bg-black/70 border border-red-500/40 text-[11px] text-amber-300 mb-4 select-all">
                  Source: {PAYTM_VIDEO_URL}
                </div>
                <p className="text-[11px] text-slate-400 mb-5 leading-normal">
                  Make sure <code className="text-cyan-300">public/videos/7.mp4</code> is placed in your project.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.load();
                        videoRef.current.play();
                      }
                      setVideoError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-slate-950 font-display font-bold text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    RETRY VIDEO
                  </button>
                  <button
                    onClick={() => setPhase('roast')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech transition-colors cursor-pointer"
                  >
                    CONTINUE TO ROAST SCREEN
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GLITCH SYSTEM-ALERT TRANSITION                                         */}
      {/* ========================================================================= */}
      {phase === 'glitch' && (
        <div className="fixed inset-0 z-50 bg-[#050002] flex flex-col items-center justify-center overflow-hidden animate-glitch">
          {/* Crimson scanlines */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-red-600/10 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(239,68,68,0.25)_0%,transparent_70%)]" />

          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.7)] animate-pulse">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono-tech text-xs text-red-400 font-bold tracking-widest animate-pulse">
                [ CRITICAL FINANCIAL ANOMALY DETECTED ]
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-black text-white tracking-wider">
                DECRYPTING SECTOR ZETA...
              </h2>
            </div>
            <div className="h-1 w-48 bg-red-950 rounded-full overflow-hidden border border-red-500/40">
              <div className="h-full bg-red-500 w-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROAST BANNU SCREEN – DARK FUTURISTIC FINANCIAL INTERFACE                */}
      {/* ========================================================================= */}
      {phase === 'roast' && (
        <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 flex flex-col items-center gap-5 sm:gap-6 animate-fadeIn">
          {/* Ambient red hazard glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Status HUD */}
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-red-900/50 pb-2.5 sm:pb-3 gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-xs font-mono-tech font-bold text-red-400 tracking-wider">
                  PAYTM QUANTUM VAULT // SECTOR ZETA
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono-tech text-slate-400">
                  INCIDENT LOG: #BNU-404-SUBZERO
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-2.5 py-1 rounded-md bg-red-950/80 border border-red-500/60 text-[9px] sm:text-[10px] font-mono-tech text-red-300 font-bold uppercase tracking-wider animate-pulse">
                STATUS: DEBT PARADOX
              </span>
            </div>
          </div>

          {/* SYSTEM ALERT Header Box */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-950/90 to-red-950/90 border-2 border-red-500/70 p-4 sm:p-5 md:p-6 shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-red-alert relative overflow-hidden">
            {/* Background warning grid */}
            <div className="absolute inset-0 bg-holo-grid opacity-15 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4 w-full md:w-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-900/40 border border-red-400/80 flex items-center justify-center text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.5)] shrink-0">
                  <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] font-mono-tech font-extrabold text-red-400 tracking-widest uppercase">
                      ⚠️ EMERGENCY FINANCIAL PROTOCOL
                    </span>
                  </div>
                  <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide mt-0.5">
                    SYSTEM ALERT!
                  </h1>
                  <p className="text-[11px] sm:text-xs text-red-200/80 font-mono-tech mt-1 truncate">
                    Anomalous transaction logged in interplanetary ledger.
                  </p>
                </div>
              </div>

              {/* Live Negative Balance Hologram */}
              <div className="w-full md:w-auto px-4 py-2.5 sm:py-3 rounded-xl bg-black/70 border border-red-500/50 flex flex-col items-center md:items-end justify-center shadow-inner">
                <span className="text-[9px] sm:text-[10px] font-mono-tech text-red-400 tracking-wider">
                  RECORDED BALANCE
                </span>
                <span className="font-mono-tech text-2xl sm:text-3xl font-black text-red-400 tracking-tight flex items-center gap-1 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                  -₹ 999.00
                </span>
                <span className="text-[9px] font-mono-tech text-red-300/60 uppercase">
                  (Below Zero Level: Critical)
                </span>
              </div>
            </div>
          </div>

          {/* Central Roast Dialogue Cards (Humorous Planetary Roast) */}
          <div className="w-full flex flex-col gap-3.5 sm:gap-4">
            {/* Roast Card 1: History Books */}
            <div className="rounded-2xl bg-slate-950/80 border border-red-500/40 p-4 sm:p-5 md:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(239,68,68,0.15)] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-400 text-[11px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-red-400" />
                <span>PLANETARY AI ANNOUNCEMENT</span>
              </div>
              <p className="font-display text-base sm:text-lg md:text-xl font-bold text-slate-100 leading-snug">
                &ldquo;Captain Bannu has entered the financial history books!&rdquo;
              </p>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Intergalactic economists have assembled across Sector Zeta to study how a single human defied the fundamental laws of banking.
              </p>
            </div>

            {/* Roast Card 2: The Two Directions */}
            <div className="rounded-2xl bg-slate-950/80 border border-amber-500/40 p-4 sm:p-5 md:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-400 text-[11px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>SCIENTIFIC DISCOVERY</span>
              </div>
              <p className="font-display text-sm sm:text-base md:text-lg font-bold text-amber-200 leading-snug">
                &ldquo;Scientists have discovered that money can travel in two directions: Income and Expense...&rdquo;
              </p>
              <div className="p-3 sm:p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] sm:text-xs font-mono-tech text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <span>DIRECTION A: + CREDITS (Rare)</span>
                <span>DIRECTION B: - DEBITS (Frequent)</span>
              </div>
            </div>

            {/* Roast Card 3: The Third Direction (The Punchline!) */}
            <div className="rounded-2xl bg-gradient-to-br from-red-950/90 via-slate-950 to-black border-2 border-red-500 p-5 sm:p-6 md:p-8 backdrop-blur-md shadow-[0_0_40px_rgba(239,68,68,0.35)] flex flex-col items-center text-center gap-3">
              <span className="px-3 py-1 rounded-full bg-red-900/60 border border-red-400 text-red-300 font-mono-tech text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse">
                THE HISTORIC DISCOVERY
              </span>
              <p className="font-display text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight">
                &ldquo;Apparently, Bannu discovered the third direction:{' '}
                <span className="text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] underline decoration-red-500 decoration-wavy">
                  BELOW ZERO.
                </span>
                &rdquo; 😂
              </p>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-sans leading-relaxed mt-1">
                Even Paytm&apos;s quantum algorithms couldn&apos;t calculate how you spent money that didn&apos;t exist!
                ATMs across the galaxy are currently holding a moment of silence for his bank account.
              </p>
            </div>

            {/* Trophy Unlock Section */}
            <div className="w-full rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-950/90 to-amber-950/60 border-2 border-amber-400/80 p-4 sm:p-6 backdrop-blur-md shadow-[0_0_45px_rgba(251,191,36,0.25)] flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5">
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3.5 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_30px_#fbbf24] shrink-0">
                  <Trophy className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-300 text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ACHIEVEMENT UNLOCKED</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl md:text-2xl font-black text-amber-300 tracking-wider mt-0.5">
                    FINANCIAL LEGEND UNLOCKED 🏆
                  </h2>
                  <p className="text-[11px] sm:text-xs text-amber-100/80 font-sans mt-1">
                    Rank: <span className="font-bold text-amber-300">The Below-Zero Pioneer</span> • Special Skill:{' '}
                    <span className="font-bold text-amber-300">Deficit Manipulation</span>
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/40 text-center shrink-0">
                <span className="text-[9px] sm:text-[10px] font-mono-tech text-amber-400 uppercase tracking-wider block">
                  COSMIC REPUTATION
                </span>
                <span className="text-base sm:text-lg font-display font-black text-amber-200">
                  +9999 HUMOR
                </span>
              </div>
            </div>

            {/* Playful Friendly Birthday Message */}
            <div className="rounded-2xl bg-slate-950/70 border border-cyan-500/30 p-3.5 sm:p-4 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 text-cyan-300 text-[11px] sm:text-xs font-mono-tech mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span className="font-bold">ALL JOKES ASIDE, HAPPY BIRTHDAY BANNU!</span>
              </div>
              <p className="text-xs text-slate-300 font-sans max-w-lg mx-auto leading-relaxed">
                May your upcoming year bring boundless blessings, unbreakable health, pure laughter, and bank balances that only climb to the stars! 🚀🎂
              </p>
            </div>
          </div>

          {/* Action Buttons: Replay Video & Proceed to Next Sector */}
          <div className="w-full pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Replay Option */}
            <button
              onClick={handleReplayVideo}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-red-500/50 hover:border-red-400 text-red-200 hover:text-white font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>REPLAY VIDEO</span>
            </button>

            {/* Proceed to Next Destination */}
            <button
              onClick={handleProceed}
              className="w-full sm:w-auto min-h-[48px] flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 hover:from-red-500 hover:to-emerald-300 text-slate-950 font-display text-xs md:text-sm font-black tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>SECTOR COMPLETE: PROCEED TO {nextDestinationName.toUpperCase()}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
