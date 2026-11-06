import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Heart,
  Sparkles,
  Flame,
  Cake,
  PartyPopper,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';
import { FriendshipWishCard } from '../FriendshipWishCard';

// Video source located in the public directory
const FRIENDSHIP_VIDEO_URL = '/videos/10.mp4';

interface FriendshipSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
  isFinalDestination?: boolean;
}

// Procedural Audio Engine for Gentle Piano & Energetic Rock/Orchestral
class FriendshipAudioEngine {
  private ctx: AudioContext | null = null;
  private pianoLoopTimer: NodeJS.Timeout | null = null;
  private energeticLoopTimer: NodeJS.Timeout | null = null;
  private currentMode: 'none' | 'piano' | 'energetic' = 'none';

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Plays a single rich, warm piano-like note
  private playPianoNote(freq: number, time: number, duration: number = 2.0, volume: number = 0.08) {
    if (sounds.getMuted() || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm acoustic filtering
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.frequency.exponentialRampToValueAtTime(350, time + duration);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, time);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
      oscHarmonic.start(time);
      oscHarmonic.stop(time + duration);
    } catch {
      // Audio context blocked
    }
  }

  // Gentle, emotional, peaceful piano chord progression
  public startPeacefulPiano() {
    if (this.currentMode === 'piano') return;
    this.stopAll();
    this.initCtx();
    this.currentMode = 'piano';

    // Arpeggiated emotional progression in D / Bm (serene, warm, thoughtful)
    const chords = [
      [293.66, 369.99, 440.0, 554.37], // Dmaj7 (D4, F#4, A4, C#5)
      [196.0, 293.66, 369.99, 440.0],  // Gmaj9 (G3, D4, F#4, A4)
      [246.94, 293.66, 369.99, 440.0], // Bm7 (B3, D4, F#4, A4)
      [220.0, 329.63, 440.0, 587.33],  // Asus4 (A3, E4, A4, D5)
    ];

    let chordIdx = 0;

    const playCycle = () => {
      if (this.currentMode !== 'piano' || !this.ctx) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];

      currentChord.forEach((freq, noteIdx) => {
        this.playPianoNote(freq, now + noteIdx * 0.45, 2.5, 0.07);
      });

      chordIdx++;
    };

    playCycle();
    this.pianoLoopTimer = setInterval(playCycle, 2400);
  }

  // Energetic, driving rock & roll / orchestral anthem
  public startEnergeticRockAndRoll() {
    if (this.currentMode === 'energetic') return;
    this.stopAll();
    this.initCtx();
    this.currentMode = 'energetic';

    // Big power chords & driving synth rhythm
    const playRockMeasure = () => {
      if (this.currentMode !== 'energetic' || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy bass drum impulse
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.frequency.setValueAtTime(140, now);
      kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.2);
      kickGain.gain.setValueAtTime(0.18, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      kickOsc.connect(kickGain);
      kickGain.connect(this.ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.2);

      // Energetic power synth brass chord
      [220, 329.63, 440, 554.37].forEach((f) => {
        if (!this.ctx) return;
        const saw = this.ctx.createOscillator();
        const sawGain = this.ctx.createGain();
        saw.type = 'sawtooth';
        saw.frequency.setValueAtTime(f, now);
        sawGain.gain.setValueAtTime(0.06, now);
        sawGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        saw.connect(sawGain);
        sawGain.connect(this.ctx.destination);
        saw.start(now);
        saw.stop(now + 0.35);
      });
    };

    playRockMeasure();
    this.energeticLoopTimer = setInterval(playRockMeasure, 450);
  }

  public stopAll() {
    this.currentMode = 'none';
    if (this.pianoLoopTimer) {
      clearInterval(this.pianoLoopTimer);
      this.pianoLoopTimer = null;
    }
    if (this.energeticLoopTimer) {
      clearInterval(this.energeticLoopTimer);
      this.energeticLoopTimer = null;
    }
  }
}

export const FriendshipSection: React.FC<FriendshipSectionProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
}) => {
  // Navigation flow:
  // 'video' -> 'opening' -> 'ministry' -> 'energetic' -> 'final'
  const [phase, setPhase] = useState<'video' | 'opening' | 'ministry' | 'energetic' | 'final'>(
    'video'
  );

  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<FriendshipAudioEngine>(new FriendshipAudioEngine());

  // Clean up audio on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.stopAll();
    };
  }, []);

  // Autoplay video on entering 'video' phase
  useEffect(() => {
    if (phase !== 'video') return;

    const video = videoRef.current;
    if (!video) return;

    setVideoError(null);
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Video unmuted autoplay prevented, trying muted:', err);
        video.muted = true;
        video.play().catch((secondErr) => {
          console.warn('Playback requires user gesture:', secondErr);
        });
      });
    }
  }, [phase]);

  // Video Ended Handler -> Transitions into peaceful friendship opening
  const handleVideoEnded = useCallback(() => {
    setPhase('opening');
    audioRef.current.startPeacefulPiano();
  }, []);

  // User clicked NEXT from Section 1 (Opening) to Section 2 (Ministry Connection)
  const handleProceedToMinistry = () => {
    sounds.playTap();
    setPhase('ministry');
  };

  // User clicked NEXT from Section 2 (Ministry) to Section 3 (Energetic Reveal)
  const handleProceedToEnergetic = () => {
    sounds.playTap();
    setPhase('energetic');
    audioRef.current.startEnergeticRockAndRoll();
  };

  // User clicked NEXT from Section 3 (Energetic) to Section 4 (Final Message)
  const handleProceedToFinal = () => {
    sounds.playCelebration();
    setPhase('final');
  };

  // Replay Video
  const handleReplayVideo = () => {
    sounds.playTap();
    audioRef.current.stopAll();
    setPhase('video');
    setVideoError(null);
  };

  // Read message again from beginning
  const handleReadAgain = () => {
    sounds.playTap();
    setPhase('opening');
    audioRef.current.startPeacefulPiano();
  };

  // Finish Friendship sector and enter grand Birthday Cake Celebration
  const handleCompleteAndCelebrate = () => {
    audioRef.current.stopAll();
    sounds.playCelebration();
    onCompleteDestination('friendship');
    onContinueNext();
  };

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-start text-slate-100 select-none">
      {/* ========================================================================= */}
      {/* 1. FULLSCREEN VIDEO PLAYBACK                                              */}
      {/* Pure video, no controls, no overlays, no loop, full screen                */}
      {/* ========================================================================= */}
      {phase === 'video' && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={FRIENDSHIP_VIDEO_URL}
            playsInline
            autoPlay
            loop={false}
            onEnded={handleVideoEnded}
            onError={() => {
              setVideoError(
                'Failed to load video from /videos/10.mp4. Please verify public/videos/10.mp4 exists.'
              );
            }}
            onClick={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) videoRef.current.play();
                else if (videoRef.current.muted) videoRef.current.muted = false;
              }
            }}
            className="w-full h-full object-contain bg-black cursor-pointer"
          />

          {/* Development error fallback */}
          {videoError && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="max-w-md w-full p-6 rounded-2xl bg-amber-950/90 border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.5)] text-center font-mono-tech">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-pulse" />
                <h3 className="font-display text-lg font-bold text-amber-200 uppercase tracking-wider mb-2">
                  VIDEO PLAYBACK ERROR
                </h3>
                <p className="text-xs text-amber-300 mb-3 leading-relaxed">{videoError}</p>
                <div className="p-2.5 rounded-lg bg-black/70 border border-amber-500/40 text-[11px] text-amber-200 mb-4 select-all">
                  Source: {FRIENDSHIP_VIDEO_URL}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.load();
                        videoRef.current.play();
                      }
                      setVideoError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    RETRY VIDEO
                  </button>
                  <button
                    onClick={handleVideoEnded}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech transition-colors cursor-pointer"
                  >
                    CONTINUE TO MESSAGE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Gentle Audio Indicator when in message phases */}
      {phase !== 'video' && (
        <div className="fixed top-16 sm:top-18 right-2 sm:right-4 md:right-8 z-30 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-900/85 border border-amber-500/30 backdrop-blur-md text-[10px] sm:text-[11px] font-mono-tech text-amber-300 pointer-events-none">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-pulse shrink-0" />
          <span className="truncate">{phase === 'energetic' ? 'ROCK & ROLL HARMONY' : 'GENTLE PIANO THEME'}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FRIENDSHIP MESSAGE – INTRODUCTION (OPENING)                            */}
      {/* ========================================================================= */}
      {phase === 'opening' && (
        <div className="relative w-full max-w-3xl mx-auto px-3 sm:px-5 py-6 sm:py-10 md:py-16 flex flex-col items-center gap-6 sm:gap-8 animate-fadeIn">
          {/* Ambient Warm Golden Glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/15 rounded-full blur-[150px] pointer-events-none" />

          {/* Golden Badge */}
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 font-mono-tech text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse">
            <Heart className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>SECTOR OMEGA // THE INNER SANCTUM</span>
          </div>

          {/* Card with Peaceful Presentation */}
          <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-950/90 via-amber-950/25 to-slate-950/90 border-2 border-amber-400/60 p-4 sm:p-7 md:p-12 backdrop-blur-md shadow-[0_0_55px_rgba(251,191,36,0.25)] flex flex-col gap-5 sm:gap-7 relative overflow-hidden animate-golden-glow">
            {/* Opening Title */}
            <div className="text-center border-b border-amber-500/30 pb-4 sm:pb-5">
              <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-black text-amber-300 tracking-wider">
                &ldquo;SOME FRIENDSHIPS ARE NEVER PLANNED...&rdquo;
              </h1>
            </div>

            {/* Emotional Paragraphs (Smooth Progressive Fade) */}
            <div className="flex flex-col gap-4 sm:gap-5 text-slate-200 font-sans text-sm sm:text-base md:text-lg leading-relaxed text-center">
              <p className="text-amber-100 font-serif italic text-base sm:text-lg md:text-xl">
                &ldquo;I don&apos;t know how I met you.&rdquo;
              </p>

              <p className="text-slate-300">
                &ldquo;I didn&apos;t even plan on meeting you.&rdquo;
              </p>

              <p className="text-amber-200 font-medium">
                &ldquo;But somehow, our roads met.&rdquo;
              </p>

              <p className="text-slate-200 font-sans text-sm sm:text-base md:text-lg pt-2 border-t border-amber-500/20">
                &ldquo;Two different journeys, two different paths, and somehow we ended up walking
                together.&rdquo;
              </p>
            </div>

            {/* User-Controlled NEXT Button */}
            <div className="pt-2 sm:pt-4 flex justify-center">
              <button
                onClick={handleProceedToMinistry}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-black text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.45)] hover:shadow-[0_0_40px_rgba(251,191,36,0.7)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>NEXT →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MINISTRY CONNECTION                                                    */}
      {/* ========================================================================= */}
      {phase === 'ministry' && (
        <div className="relative w-full max-w-3xl mx-auto px-3 sm:px-5 py-6 sm:py-10 md:py-16 flex flex-col items-center gap-6 sm:gap-8 animate-fadeIn">
          {/* Ambient Warm Golden Glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/15 rounded-full blur-[150px] pointer-events-none" />

          {/* Golden Badge */}
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 font-mono-tech text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PURPOSE &amp; CALLING</span>
          </div>

          {/* Ministry Card */}
          <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-950/90 via-amber-950/30 to-slate-950/90 border-2 border-amber-400/60 p-4 sm:p-7 md:p-12 backdrop-blur-md shadow-[0_0_55px_rgba(251,191,36,0.25)] flex flex-col gap-5 sm:gap-7 relative overflow-hidden animate-golden-glow">
            <div className="flex flex-col gap-4 sm:gap-6 text-center">
              <h2 className="font-display text-lg sm:text-2xl md:text-3xl font-black text-amber-300 leading-snug">
                &ldquo;And now, here we are, together in this ministry!&rdquo;
              </h2>

              <p className="text-slate-200 font-sans text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto pt-2 border-t border-amber-500/20">
                &ldquo;We&apos;ve got a mission ahead of us, memories to create, people to reach and
                so much more to accomplish.&rdquo;
              </p>
            </div>

            {/* User-Controlled NEXT Button */}
            <div className="pt-2 sm:pt-4 flex justify-center">
              <button
                onClick={handleProceedToEnergetic}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-black text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.45)] hover:shadow-[0_0_40px_rgba(251,191,36,0.7)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>NEXT →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ENERGETIC REVEAL ("LET'S ROCK AND ROLL!")                               */}
      {/* ========================================================================= */}
      {phase === 'energetic' && (
        <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-5 py-6 sm:py-10 md:py-16 flex flex-col items-center gap-6 sm:gap-8 animate-fadeIn">
          {/* Ambient Radiant Energy Glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-yellow-500/20 rounded-full blur-[160px] pointer-events-none" />

          {/* Energy Badge */}
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-rose-500/20 border border-rose-400/60 text-rose-300 font-mono-tech text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>FULL THROTTLE // UNSTOPPABLE SPIRIT</span>
          </div>

          {/* Energetic Console */}
          <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-950 via-amber-950/40 to-rose-950/40 border-2 border-amber-400 p-5 sm:p-8 md:p-14 backdrop-blur-md shadow-[0_0_60px_rgba(251,191,36,0.4)] flex flex-col items-center text-center gap-5 sm:gap-7 relative overflow-hidden">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <span className="font-mono-tech text-sm sm:text-base md:text-lg text-amber-300 font-semibold tracking-wider">
                &ldquo;So, Bannu...&rdquo;
              </span>

              {/* Enormous Bold Energetic Typography */}
              <div className="animate-punchline-zoom">
                <h1 className="font-display text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 tracking-tight leading-tight sm:leading-none drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
                  LET&apos;S ROCK AND ROLL!
                </h1>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3 mt-2 sm:mt-3 max-w-2xl">
                <p className="font-display text-sm sm:text-base md:text-xl font-bold text-white">
                  &ldquo;Bring all your energy, all your passion and all your craziness.&rdquo;
                </p>

                <p className="text-slate-200 font-sans text-xs sm:text-sm md:text-base leading-relaxed pt-2 border-t border-amber-500/20">
                  &ldquo;Let&apos;s give everything we&apos;ve got, serve together, laugh together,
                  grow together and keep going until the very end!&rdquo;
                </p>
              </div>
            </div>

            {/* User-Controlled NEXT Button */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleProceedToFinal}
                className="w-full sm:w-auto min-h-[48px] px-8 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-black text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(244,63,94,0.5)] hover:shadow-[0_0_45px_rgba(251,191,36,0.7)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>NEXT →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FINAL MESSAGE: "THE JOURNEY ISN'T OVER. IT'S JUST GETTING STARTED! ❤️"   */}
      {/* ========================================================================= */}
      {phase === 'final' && (
        <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-5 py-6 sm:py-10 md:py-16 flex flex-col items-center gap-6 sm:gap-8 animate-fadeIn">
          {/* Ambient Heavenly Golden Glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-r from-amber-400/20 via-yellow-400/25 to-amber-500/20 rounded-full blur-[170px] pointer-events-none" />

          {/* Central Cosmic Singularity Beacon */}
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl animate-pulse" />
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-500 flex items-center justify-center shadow-[0_0_35px_#fbbf24]">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-slate-950 fill-current animate-pulse" />
            </div>
          </div>

          {/* The Final Message Box */}
          <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-950/90 via-amber-950/35 to-slate-950/90 border-2 border-amber-400/80 p-5 sm:p-8 md:p-14 backdrop-blur-md shadow-[0_0_60px_rgba(251,191,36,0.35)] flex flex-col items-center text-center gap-4 sm:gap-6 relative overflow-hidden animate-golden-glow">
            <span className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 font-mono-tech text-[10px] sm:text-xs font-extrabold uppercase tracking-widest animate-pulse">
              SECTOR 9 DECODED // ALL 9 SIGNALS COMPLETE
            </span>

            {/* Cinematic Headline */}
            <h1 className="font-display text-xl sm:text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-200 tracking-tight leading-snug drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              THE JOURNEY ISN&apos;T OVER.
              <br />
              IT&apos;S JUST GETTING STARTED! ❤️
            </h1>

            <p className="text-slate-300 font-sans text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">
              Across every galaxy and through every cosmic anomaly, genuine brotherhood and mission
              are the truest constellation that guides us forward.
            </p>

            {/* Friendship Wish Submission to Firebase Firestore */}
            <FriendshipWishCard />

            {/* Actions: Replay Video, Read Again, or Enter Birthday Cake Celebration */}
            <div className="w-full pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleReplayVideo}
                className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-200 hover:text-white font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.15)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>REPLAY VIDEO</span>
              </button>

              <button
                onClick={handleReadAgain}
                className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>READ AGAIN</span>
              </button>

              <button
                onClick={handleCompleteAndCelebrate}
                className="w-full sm:w-auto min-h-[48px] px-7 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-black text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(251,191,36,0.5)] hover:shadow-[0_0_45px_rgba(251,191,36,0.7)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Cake className="w-4 h-4 stroke-[2.5]" />
                <span>ENTER BIRTHDAY CELEBRATION</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
