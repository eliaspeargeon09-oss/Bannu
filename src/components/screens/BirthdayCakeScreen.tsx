import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Heart,
  PartyPopper,
  Compass,
  Mic,
  MicOff,
  Wind,
  Scissors,
  RotateCcw,
  Star,
  Cake,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

/**
 * =======================================================================
 * BIRTHDAY NOTE TEXT
 * =======================================================================
 */
export const BIRTHDAY_NOTE_TEXT =
  "Happy birthday, bhai.\n\n" +
  "Really, I wanted to write so much for u, but health reason valla I couldn't write much — em anukoku. U r always special.\n\n" +
  "Once again, happy birthday, man! ❤️";

interface BirthdayCakeScreenProps {
  onReturnToMap: () => void;
  onRestartAdventure: () => void;
}

type CelebrationStage =
  | 'cake_reveal' // Stage 1: The Birthday Cake reveal
  | 'blow_and_cut' // Stage 2: Blow candles & Cut the cake
  | 'birthday_note'; // Stage 3: Full-screen handwritten letter

export const BirthdayCakeScreen: React.FC<BirthdayCakeScreenProps> = ({
  onReturnToMap,
  onRestartAdventure,
}) => {
  // Main stage tracking
  const [stage, setStage] = useState<CelebrationStage>('cake_reveal');

  // Cake state
  const [isCandleLit, setIsCandleLit] = useState(true);
  const [isSmokeRising, setIsSmokeRising] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [candlesBlownOut, setCandlesBlownOut] = useState(false);
  const [readyForCakeCutting, setReadyForCakeCutting] = useState(false);
  const [isCutting, setIsCutting] = useState(false);
  const [isCakeCut, setIsCakeCut] = useState(false);

  // Microphone detection state
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micStatus, setMicStatus] = useState<
    'idle' | 'listening' | 'denied' | 'unsupported'
  >('idle');
  const isListeningRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup microphone resources
  const stopMic = () => {
    isListeningRef.current = false;
    setIsListeningMic(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignored
      }
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  // Request microphone & listen for blowing turbulence
  const handleEnableMic = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicStatus('listening');
      setIsListeningMic(true);
      isListeningRef.current = true;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      let consecutiveFrames = 0;

      const detectBlow = () => {
        if (!isListeningRef.current) return;
        analyser.getFloatTimeDomainData(buffer);

        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sum / buffer.length);

        // Continuous breath/blowing sound produces high RMS > 0.15
        if (rms > 0.15) {
          consecutiveFrames++;
          if (consecutiveFrames >= 3) {
            stopMic();
            handleExtinguishCandle();
            return;
          }
        } else {
          consecutiveFrames = Math.max(0, consecutiveFrames - 1);
        }

        requestAnimationFrame(detectBlow);
      };

      requestAnimationFrame(detectBlow);
    } catch {
      setMicStatus('denied');
      setIsListeningMic(false);
      isListeningRef.current = false;
    }
  };

  // Extinguish candle (called by mic or tap)
  const handleExtinguishCandle = () => {
    if (!isCandleLit) return;
    stopMic();
    setIsCandleLit(false);
    setIsSmokeRising(true);
    setCandlesBlownOut(true);

    // Audio effects
    sounds.playBlowSound();
    setTimeout(() => {
      sounds.playCelebration();
      sounds.playHappyBirthdayTune();
    }, 300);

    // Confetti shower
    setShowConfetti(true);

    // Fade smoke after 3 seconds
    setTimeout(() => {
      setIsSmokeRising(false);
    }, 3200);

    // Prompt for cake cutting after a pleasant celebration pause
    setTimeout(() => {
      setReadyForCakeCutting(true);
    }, 1500);
  };

  // Perform cake cutting animation
  const handleCutTheCake = () => {
    if (isCakeCut || isCutting) return;
    setIsCutting(true);
    sounds.playKnifeCut();

    setTimeout(() => {
      setIsCakeCut(true);
      setIsCutting(false);
      sounds.playCelebration();
      setShowConfetti(true);

      // Transition directly to the birthday letter
      setTimeout(() => {
        setStage('birthday_note');
      }, 1000);
    }, 900);
  };

  // Reset celebration sequence to replay
  const handleReplayAll = () => {
    stopMic();
    sounds.playTap();
    setIsCandleLit(true);
    setIsSmokeRising(false);
    setShowConfetti(false);
    setCandlesBlownOut(false);
    setReadyForCakeCutting(false);
    setIsCutting(false);
    setIsCakeCut(false);
    setStage('cake_reveal');
  };

  // Floating stardust particles
  const floatingParticles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i * 13) % 96}%`,
      top: `${(i * 17) % 92}%`,
      size: (i % 3) + 2,
      duration: 3 + (i % 4),
      delay: (i % 5) * 0.7,
      color: ['#fbbf24', '#f43f5e', '#38bdf8', '#c084fc', '#34d399'][i % 5],
    }));
  }, []);

  // Confetti pieces for celebration
  const confettiPieces = useMemo(() => {
    const colors = [
      '#f59e0b',
      '#ec4899',
      '#38bdf8',
      '#a855f7',
      '#10b981',
      '#fbbf24',
      '#f43f5e',
      '#e0e7ff',
    ];
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: Math.random() * 98,
      duration: 2.2 + Math.random() * 2.2,
      delay: Math.random() * 1.2,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
      isCircle: i % 3 === 0,
      rotate: Math.random() * 360,
    }));
  }, []);

  return (
    <div className="relative w-full min-h-full flex-1 flex flex-col justify-between text-slate-100 select-none overflow-x-hidden">
      {/* Dynamic Keyframes for Candles, Smoke, Knife & Confetti */}
      <style>{`
        @keyframes flameFlicker {
          0%, 100% { transform: scale(1) rotate(-1deg); filter: drop-shadow(0 0 12px rgba(251,191,36,0.9)); }
          25% { transform: scale(1.08, 0.95) rotate(1.5deg); filter: drop-shadow(0 0 18px rgba(245,158,11,1)); }
          50% { transform: scale(0.96, 1.05) rotate(-2deg); filter: drop-shadow(0 0 14px rgba(239,68,68,0.95)); }
          75% { transform: scale(1.04, 1.02) rotate(1deg); filter: drop-shadow(0 0 20px rgba(251,191,36,1)); }
        }
        @keyframes flameAuraPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.25); }
        }
        @keyframes smokeWisp {
          0% { transform: translateY(0) scale(0.5) translateX(0); opacity: 0.85; }
          40% { transform: translateY(-25px) scale(1.2) translateX(-6px); opacity: 0.6; }
          75% { transform: translateY(-50px) scale(1.8) translateX(8px); opacity: 0.3; }
          100% { transform: translateY(-80px) scale(2.5) translateX(2px); opacity: 0; }
        }
        @keyframes confettiFallLoop {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0.85; }
        }
        @keyframes knifeSliceDown {
          0% { transform: translateY(-50px); opacity: 0; }
          30% { transform: translateY(0px); opacity: 1; }
          80% { transform: translateY(190px); opacity: 1; }
          100% { transform: translateY(220px); opacity: 0; }
        }
        @keyframes letterUnfold {
          0% { opacity: 0; transform: translateY(24px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-flame {
          animation: flameFlicker 0.45s ease-in-out infinite alternate;
          transform-origin: 120px 30px;
        }
        .animate-flame-aura {
          animation: flameAuraPulse 1.2s ease-in-out infinite;
        }
        .animate-smoke-1 {
          animation: smokeWisp 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-smoke-2 {
          animation: smokeWisp 2.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }
        .animate-smoke-3 {
          animation: smokeWisp 2.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }
        .animate-confetti {
          animation: confettiFallLoop linear forwards;
        }
        .animate-knife-slice {
          animation: knifeSliceDown 0.85s ease-in-out forwards;
        }
        .animate-letter-unfold {
          animation: letterUnfold 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Floating Sparkles & Dust Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {floatingParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: 0.65,
            }}
          />
        ))}
      </div>

      {/* Confetti Explosion (Triggered after candle blow and cake cut) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map((c) => (
            <div
              key={c.id}
              className="absolute top-[-20px] animate-confetti"
              style={{
                left: `${c.left}%`,
                width: `${c.size}px`,
                height: c.isCircle ? `${c.size}px` : `${c.size * 1.8}px`,
                backgroundColor: c.color,
                borderRadius: c.isCircle ? '50%' : '2px',
                transform: `rotate(${c.rotate}deg)`,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
                animationIterationCount: 'infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Global Top Mini Header */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400 font-mono-tech text-[11px] sm:text-xs tracking-wider">
          <PartyPopper className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span className="font-bold">
            {stage === 'cake_reveal' && 'STAGE 01 // CAKE PROTOCOL'}
            {stage === 'blow_and_cut' && 'STAGE 02 // BLOW & CELEBRATE'}
            {stage === 'birthday_note' && "STAGE 03 // CAPTAIN'S LETTER"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {stage !== 'cake_reveal' && (
            <button
              onClick={handleReplayAll}
              className="flex items-center gap-1 text-[11px] font-mono-tech text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-600/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Replay Celebration Sequence"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">REPLAY</span>
            </button>
          )}

          <button
            onClick={onReturnToMap}
            className="flex items-center gap-1.5 text-[11px] font-mono-tech text-cyan-300 hover:text-cyan-200 bg-slate-900/80 border border-cyan-700/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>MAP</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          STAGE 1: THE BIRTHDAY CAKE REVEAL
          Prompt Requirements:
          - Transition into a beautiful birthday celebration environment.
          - Display a magnificent birthday cake in the centre.
          - Elegant lighting, floating particles and subtle birthday decorations.
          - Animated candles with realistic flickering flames.
          - Display:
            "HOLD ON, CAPTAIN BANNU!"
            "Did you really think we would end this adventure without a birthday cake?"
          - Show a button:
            LET'S CELEBRATE!
          - Only proceed when user clicks it.
          ========================================================================= */}
      {stage === 'cake_reveal' && (
        <div className="relative z-10 w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-between px-4 py-4 sm:py-6 text-center animate-letter-unfold">
          {/* Header Dialogue strictly following prompt */}
          <div className="mt-2 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-[11px] font-mono-tech tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>COSMIC CELEBRATION UNLOCKED</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100 uppercase drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
              HOLD ON, CAPTAIN BANNU!
            </h1>

            <p className="text-sm sm:text-base font-serif italic text-amber-100/90 max-w-md mx-auto leading-relaxed px-2">
              "Did you really think we would end this adventure without a birthday cake?"
            </p>
          </div>

          {/* Central Magnificent Birthday Cake */}
          <div className="relative my-4 sm:my-6 flex flex-col items-center justify-center">
            {/* Ambient golden celebration glow */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

            {/* Festive Hanging Star Lanterns */}
            <div className="absolute -top-6 inset-x-0 flex justify-between px-8 text-amber-400/60 pointer-events-none">
              <Star className="w-4 h-4 animate-bounce" style={{ animationDuration: '2.5s' }} />
              <Star className="w-3 h-3 animate-bounce" style={{ animationDuration: '3.1s' }} />
              <Star className="w-4 h-4 animate-bounce" style={{ animationDuration: '2.8s' }} />
            </div>

            {/* Cake SVG Graphic */}
            <svg
              viewBox="0 0 240 260"
              className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter"
            >
              <defs>
                <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="tier1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="tier2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4c0519" />
                  <stop offset="100%" stopColor="#1f020a" />
                </linearGradient>
                <linearGradient id="tier3Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b0764" />
                  <stop offset="100%" stopColor="#1e0538" />
                </linearGradient>
              </defs>

              {/* Pedestal Stand */}
              <ellipse cx="120" cy="242" rx="92" ry="12" fill="url(#goldPlate)" opacity="0.9" />
              <ellipse cx="120" cy="240" rx="90" ry="11" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
              <path d="M75,242 Q120,256 165,242 L155,250 Q120,262 85,250 Z" fill="#b45309" />

              {/* Bottom Tier (Deep Cosmic Navy & Golden Starlight) */}
              <path
                d="M40,175 Q120,195 200,175 L200,226 Q120,246 40,226 Z"
                fill="url(#tier1Grad)"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <ellipse cx="120" cy="175" rx="80" ry="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />

              {/* Constellations & Gems on Bottom Tier */}
              <circle cx="65" cy="205" r="2.5" fill="#fbbf24" />
              <circle cx="95" cy="216" r="3" fill="#fef08a" />
              <circle cx="140" cy="212" r="2.5" fill="#fbbf24" />
              <circle cx="175" cy="202" r="3" fill="#fef08a" />
              <line x1="65" y1="205" x2="95" y2="216" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
              <line x1="95" y1="216" x2="140" y2="212" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
              <line x1="140" y1="212" x2="175" y2="202" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />

              {/* Middle Tier (Warm Rose Galaxy & Inscription) */}
              <path
                d="M60,120 Q120,138 180,120 L180,165 Q120,183 60,165 Z"
                fill="url(#tier2Grad)"
                stroke="#fb7185"
                strokeWidth="1.5"
              />
              <ellipse cx="120" cy="120" rx="60" ry="13" fill="#3b0724" stroke="#fb7185" strokeWidth="1.2" />

              {/* Inscription: BANNU */}
              <text
                x="120"
                y="152"
                fill="#fef08a"
                fontSize="13"
                fontWeight="bold"
                fontFamily="var(--font-orbitron), sans-serif"
                textAnchor="middle"
                letterSpacing="3"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                BANNU
              </text>

              {/* Top Tier (Cosmic Purple with Golden Frosting) */}
              <path
                d="M80,75 Q120,90 160,75 L160,112 Q120,127 80,112 Z"
                fill="url(#tier3Grad)"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <ellipse cx="120" cy="75" rx="40" ry="10" fill="#581c87" stroke="#f59e0b" strokeWidth="1.2" />

              {/* Birthday Candle Stem */}
              <rect x="116" y="38" width="8" height="37" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
              {/* Candle candy cane spiral */}
              <line x1="116" y1="46" x2="124" y2="52" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="116" y1="58" x2="124" y2="64" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />

              {/* Candle Wick */}
              <line x1="120" y1="38" x2="120" y2="28" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" />

              {/* Realistic Animated Candle Flame */}
              <g className="animate-flame">
                {/* Outer warm halo */}
                <ellipse cx="120" cy="18" rx="10" ry="16" fill="#f59e0b" opacity="0.35" className="animate-flame-aura" />
                {/* Main flame teardrop */}
                <path
                  d="M120,4 C112,12 111,24 120,28 C129,24 128,12 120,4 Z"
                  fill="#f97316"
                />
                {/* Mid flame */}
                <path
                  d="M120,9 C115,15 114,23 120,26 C126,23 125,15 120,9 Z"
                  fill="#fbbf24"
                />
                {/* Core white-hot teardrop */}
                <path
                  d="M120,15 C117,19 117,24 120,25.5 C123,24 123,19 120,15 Z"
                  fill="#ffffff"
                />
              </g>
            </svg>
          </div>

          {/* Action Button: LET'S CELEBRATE! strictly proceeding directly to candle blowing */}
          <div className="w-full max-w-sm mt-2 pb-2">
            <button
              onClick={() => {
                sounds.playCelebration();
                setStage('blow_and_cut');
              }}
              className="w-full h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-display font-bold text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.45)] hover:shadow-[0_0_45px_rgba(251,191,36,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Cake className="w-5 h-5 text-amber-200 stroke-[2.2]" />
              <span>LET'S CELEBRATE!</span>
              <Sparkles className="w-4 h-4 text-amber-200" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: BLOW CANDLES AND CUT THE CAKE
          - Display the birthday cake with animated candle flames.
          - Show: MAKE A WISH AND BLOW!
          - Extinguish via mic or tap button.
          - Then prompt CUT THE CAKE.
          - Knife cuts through the cake, portion separation animation.
          - Directly opens the full-screen birthday letter.
          ========================================================================= */}
      {stage === 'blow_and_cut' && (
        <div className="relative z-10 w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-between px-4 py-3 sm:py-5 text-center animate-letter-unfold">
          {/* Headline strictly following prompt */}
          <div className="mt-1 space-y-1.5">
            {!candlesBlownOut ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono-tech tracking-widest uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>FLAMES ARE LIT</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100 uppercase drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                  MAKE A WISH AND BLOW!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-sm mx-auto">
                  Blow into your microphone or tap the button below to blow out your candles!
                </p>
              </>
            ) : !isCakeCut ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-[11px] font-mono-tech tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>WISH SEALED IN THE COSMOS</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-emerald-200 uppercase drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                  HAPPY BIRTHDAY, CAPTAIN BANNU! 🎉
                </h1>
                {readyForCakeCutting && (
                  <p className="text-sm sm:text-base font-serif italic text-amber-200 animate-fadeIn">
                    "Alright, enough waiting. It's cake-cutting time!"
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-400/40 text-rose-300 text-[11px] font-mono-tech tracking-widest uppercase">
                  <Cake className="w-3.5 h-3.5 text-rose-400" />
                  <span>CAKE CEREMONY ACCOMPLISHED</span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-purple-200 uppercase">
                  OPENING YOUR BIRTHDAY LETTER...
                </h1>
              </>
            )}
          </div>

          {/* Central Interactive Birthday Cake with Smoke, Knife Slice & Halves Separation */}
          <div className="relative my-2 sm:my-4 flex flex-col items-center justify-center">
            {/* Ambient Warm Aura */}
            <div
              className={`absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                isCandleLit
                  ? 'bg-amber-500/25'
                  : isCakeCut
                  ? 'bg-rose-500/25'
                  : 'bg-indigo-500/15'
              }`}
            />

            {/* Click cake to blow out directly as a fun touch */}
            <div
              onClick={() => {
                if (isCandleLit) {
                  handleExtinguishCandle();
                }
              }}
              className="relative cursor-pointer transition-transform hover:scale-[1.02]"
              title={isCandleLit ? 'Tap to blow out the candle!' : ''}
            >
              <svg
                viewBox="0 0 240 260"
                className="w-60 h-60 sm:w-72 sm:h-72 drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]"
              >
                <defs>
                  {/* Clip paths for cutting cake in half */}
                  <clipPath id="cake-left-half">
                    <rect x="0" y="0" width="120" height="260" />
                  </clipPath>
                  <clipPath id="cake-right-half">
                    <rect x="120" y="0" width="120" height="260" />
                  </clipPath>

                  <linearGradient id="knifeBlade" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>

                {/* Pedestal Stand (Stays solid below) */}
                <ellipse cx="120" cy="242" rx="92" ry="12" fill="#d97706" opacity="0.8" />
                <ellipse cx="120" cy="240" rx="90" ry="11" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
                <path d="M75,242 Q120,256 165,242 L155,250 Q120,262 85,250 Z" fill="#b45309" />

                {/* Left Cake Half (Separates to left when cut) */}
                <g
                  clipPath="url(#cake-left-half)"
                  style={{
                    transform: isCakeCut ? 'translateX(-14px)' : 'none',
                    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Bottom Tier */}
                  <path
                    d="M40,175 Q120,195 200,175 L200,226 Q120,246 40,226 Z"
                    fill="#0f172a"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="120" cy="175" rx="80" ry="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
                  <circle cx="65" cy="205" r="2.5" fill="#fbbf24" />
                  <circle cx="95" cy="216" r="3" fill="#fef08a" />
                  <line x1="65" y1="205" x2="95" y2="216" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />

                  {/* Middle Tier */}
                  <path
                    d="M60,120 Q120,138 180,120 L180,165 Q120,183 60,165 Z"
                    fill="#311042"
                    stroke="#fb7185"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="120" cy="120" rx="60" ry="13" fill="#4a154b" stroke="#fb7185" strokeWidth="1.2" />
                  <text
                    x="120"
                    y="152"
                    fill="#fef08a"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="var(--font-orbitron), sans-serif"
                    textAnchor="middle"
                    letterSpacing="3"
                  >
                    BANNU
                  </text>

                  {/* Top Tier */}
                  <path
                    d="M80,75 Q120,90 160,75 L160,112 Q120,127 80,112 Z"
                    fill="#1e1b4b"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="120" cy="75" rx="40" ry="10" fill="#312e81" stroke="#f59e0b" strokeWidth="1.2" />

                  {/* Candle Left half */}
                  <rect x="116" y="38" width="4" height="37" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />
                </g>

                {/* Right Cake Half (Separates to right when cut) */}
                <g
                  clipPath="url(#cake-right-half)"
                  style={{
                    transform: isCakeCut ? 'translateX(14px)' : 'none',
                    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Bottom Tier */}
                  <path
                    d="M40,175 Q120,195 200,175 L200,226 Q120,246 40,226 Z"
                    fill="#0f172a"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="120" cy="175" rx="80" ry="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
                  <circle cx="140" cy="212" r="2.5" fill="#fbbf24" />
                  <circle cx="175" cy="202" r="3" fill="#fef08a" />
                  <line x1="140" y1="212" x2="175" y2="202" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />

                  {/* Middle Tier */}
                  <path
                    d="M60,120 Q120,138 180,120 L180,165 Q120,183 60,165 Z"
                    fill="#311042"
                    stroke="#fb7185"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="120" cy="120" rx="60" ry="13" fill="#4a154b" stroke="#fb7185" strokeWidth="1.2" />
                  <text
                    x="120"
                    y="152"
                    fill="#fef08a"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="var(--font-orbitron), sans-serif"
                    textAnchor="middle"
                    letterSpacing="3"
                  >
                    BANNU
                  </text>

                  {/* Top Tier */}
                  <path
                    d="M80,75 Q120,90 160,75 L160,112 Q120,127 80,112 Z"
                    fill="#1e1b4b"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="120" cy="75" rx="40" ry="10" fill="#312e81" stroke="#f59e0b" strokeWidth="1.2" />

                  {/* Candle Right half */}
                  <rect x="120" y="38" width="4" height="37" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />
                </g>

                {/* Cake Inner Slice Glow (Revealed after cut) */}
                {isCakeCut && (
                  <g className="animate-fadeIn">
                    <line x1="108" y1="75" x2="108" y2="226" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
                    <line x1="132" y1="75" x2="132" y2="226" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
                    {/* Golden interior stardust shimmer */}
                    <circle cx="120" cy="150" r="12" fill="#fbbf24" opacity="0.25" className="animate-ping" />
                  </g>
                )}

                {/* Candle Wick */}
                <line x1="120" y1="38" x2="120" y2="28" stroke="#78350f" strokeWidth="1.6" />

                {/* Candle Flame (Visible when lit) */}
                {isCandleLit && (
                  <g className="animate-flame">
                    <ellipse cx="120" cy="18" rx="10" ry="16" fill="#f59e0b" opacity="0.4" className="animate-flame-aura" />
                    <path d="M120,4 C112,12 111,24 120,28 C129,24 128,12 120,4 Z" fill="#f97316" />
                    <path d="M120,9 C115,15 114,23 120,26 C126,23 125,15 120,9 Z" fill="#fbbf24" />
                    <path d="M120,15 C117,19 117,24 120,25.5 C123,24 123,19 120,15 Z" fill="#ffffff" />
                  </g>
                )}

                {/* Smoke Wisps (Visible right after blowing out) */}
                {isSmokeRising && (
                  <g>
                    <path
                      d="M120,28 Q115,18 122,10 T118,-15"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.8"
                      className="animate-smoke-1"
                    />
                    <path
                      d="M120,28 Q125,16 117,8 T124,-20"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.7"
                      className="animate-smoke-2"
                    />
                    <path
                      d="M120,28 Q118,20 122,14 T119,-10"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.6"
                      className="animate-smoke-3"
                    />
                  </g>
                )}

                {/* Ceremonial Knife Animation */}
                {isCutting && (
                  <g className="animate-knife-slice">
                    {/* Golden Laser / Ceremonial Blade */}
                    <line x1="120" y1="10" x2="120" y2="95" stroke="url(#knifeBlade)" strokeWidth="4" strokeLinecap="round" />
                    {/* Knife Blade glow */}
                    <line x1="120" y1="15" x2="120" y2="90" stroke="#ffffff" strokeWidth="2" />
                    {/* Knife Handle */}
                    <rect x="116" y="-15" width="8" height="25" rx="2" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
                    {/* Sparkles on blade tip */}
                    <circle cx="120" cy="95" r="4" fill="#fbbf24" className="animate-ping" />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Dual Blow Controls & Cake Cutting Actions */}
          <div className="w-full max-w-sm mt-1 pb-2 space-y-2.5">
            {/* If candles are still lit: Show blow options */}
            {isCandleLit && (
              <>
                {/* Prominent TAP TO BLOW Button */}
                <button
                  onClick={handleExtinguishCandle}
                  className="w-full h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 text-slate-950 font-display font-extrabold text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:shadow-[0_0_45px_rgba(251,191,36,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Wind className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  <span>TAP TO BLOW 💨</span>
                </button>

                {/* Microphone Detection Alternative */}
                <div className="flex items-center justify-center">
                  {micStatus === 'idle' && (
                    <button
                      onClick={handleEnableMic}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400/60 text-slate-300 text-xs font-mono-tech transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-cyan-400" />
                      <span>BLOW WITH MIC 🎙️ (OPTIONAL)</span>
                    </button>
                  )}

                  {micStatus === 'listening' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-400 text-cyan-300 text-xs font-mono-tech animate-pulse">
                      <Mic className="w-3.5 h-3.5 text-cyan-400" />
                      <span>LISTENING... BLOW INTO YOUR MIC NOW!</span>
                    </div>
                  )}

                  {micStatus === 'denied' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 text-slate-400 text-[11px] font-mono-tech">
                      <MicOff className="w-3 h-3 text-slate-500" />
                      <span>MIC DENIED (TAP BUTTON ABOVE)</span>
                    </div>
                  )}

                  {micStatus === 'unsupported' && (
                    <div className="text-[11px] font-mono-tech text-slate-500">
                      MIC NOT SUPPORTED (USE TAP BUTTON)
                    </div>
                  )}
                </div>
              </>
            )}

            {/* If candles extinguished & ready for cake cutting */}
            {candlesBlownOut && !isCakeCut && readyForCakeCutting && (
              <button
                onClick={handleCutTheCake}
                disabled={isCutting}
                className="w-full h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-display font-extrabold text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(244,63,94,0.5)] hover:shadow-[0_0_50px_rgba(244,63,94,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer animate-fadeIn"
              >
                <Scissors className="w-5 h-5 text-amber-200 stroke-[2.2]" />
                <span>{isCutting ? 'CUTTING THE CAKE...' : 'CUT THE CAKE 🎂'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: THE BIRTHDAY NOTE
          Prompt Requirements:
          - Create a beautiful, full-screen birthday letter experience.
          - Design it like a personal handwritten letter:
            - Warm background.
            - Elegant typography.
            - Soft paper texture.
            - Subtle floating particles.
            - Smooth letter-opening animation.
            - Comfortable reading width.
            - Mobile-friendly layout.
          - Editable placeholder for the complete letter.
            (BIRTHDAY_NOTE_TEXT constant at top of file)
          - Do not invent the letter.
          - Do not generate additional personal messages.
          - Keep the entire letter visible and readable.
          - Allow the user to scroll naturally if the letter is long.
          - End with a simple:
            HAPPY BIRTHDAY, BANNU! ❤️
          ========================================================================= */}
      {stage === 'birthday_note' && (
        <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-start px-3 py-4 sm:py-6 overflow-y-auto no-scrollbar animate-letter-unfold">
          {/* Subtle Warm Amber Dust Aura */}
          <div className="fixed inset-0 bg-gradient-to-b from-[#12081a]/95 via-[#1a0e24]/90 to-[#0e0714]/95 pointer-events-none -z-10" />

          {/* Letter Container with Parchment Aesthetics */}
          <div className="relative w-full max-w-xl mx-auto my-auto bg-[#fffbf2] text-stone-900 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(251,191,36,0.2)] border-2 border-[#e6d5b8] flex flex-col items-center text-left">
            {/* Elegant Luxury Wax Seal / Postage Crest Header */}
            <div className="w-full flex items-center justify-between pb-4 sm:pb-6 border-b border-[#e7d8be] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-600 via-rose-600 to-amber-700 flex items-center justify-center text-white shadow-md border-2 border-amber-200">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 tracking-wide">
                    CAPTAIN'S ARCHIVE
                  </h3>
                  <p className="text-[11px] font-mono-tech text-amber-800 uppercase tracking-widest">
                    HANDWRITTEN TRANSMISSION
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-mono-tech font-bold uppercase tracking-wider">
                CONFIDENTIAL
              </div>
            </div>

            {/* Letter Body: Renders Editable BIRTHDAY_NOTE_TEXT with Natural Scrolling & Typography */}
            <div className="w-full text-stone-800 font-serif text-sm sm:text-base leading-relaxed sm:leading-loose whitespace-pre-line select-text">
              {BIRTHDAY_NOTE_TEXT}
            </div>

            {/* Ending Sign-off strictly following prompt */}
            <div className="w-full pt-8 sm:pt-10 mt-6 border-t border-[#e7d8be] text-center space-y-2">
              <div className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-rose-600 drop-shadow-sm">
                HAPPY BIRTHDAY, BANNU! ❤️
              </div>
              <p className="text-xs font-mono-tech text-stone-500 uppercase tracking-widest">
                FOREVER YOUR FRIEND & CREW
              </p>
            </div>
          </div>

          {/* Navigation & Replay Actions at bottom of letter */}
          <div className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 pb-6">
            <button
              onClick={handleReplayAll}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REPLAY CELEBRATION 🎂</span>
            </button>

            <button
              onClick={onReturnToMap}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>RETURN TO COSMIC ATLAS 🗺️</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
