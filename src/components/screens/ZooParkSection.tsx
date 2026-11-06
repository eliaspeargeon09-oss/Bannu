import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Heart,
  CheckCircle2,
  Scan,
  Radio,
  Eye,
  Zap,
  Info,
  Terminal,
  Volume2,
  Compass,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';

// Video source located in the public directory
const ZOO_VIDEO_URL = '/videos/8.mp4';

// Specimen definition strictly preserving all exact text and classifications
export interface WildlifeSpecimen {
  id: string;
  code: string;
  name: string;
  animal: string;
  species: string;
  image: string;
  description: string;
  classification: string;
  classificationColor: {
    badge: string;
    glow: string;
    border: string;
  };
  attributes: {
    label: string;
    value: string;
  }[];
}

export const WILDLIFE_SPECIMENS: WildlifeSpecimen[] = [
  {
    id: 'deevena',
    code: 'SPECIMEN 001',
    name: 'DEEVENA',
    animal: 'Meerkat',
    species: 'Meerkatus Deevena',
    image: '/images/meerkat.jpg',
    description:
      "Meet Deevena, the highly alert meerkat. Always watching, always observing, and somehow knows everyone's business before they do. Scientists believe her surveillance system works 24/7. Even CCTV cameras feel unemployed around her.",
    classification: 'RARE SPECIES',
    classificationColor: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60',
      glow: 'shadow-[0_0_25px_rgba(52,211,153,0.35)]',
      border: 'border-emerald-500/50',
    },
    attributes: [
      { label: 'SURVEILLANCE RADAR', value: '24/7 CONTINUOUS' },
      { label: 'ALERTNESS INDEX', value: '99.9%' },
      { label: 'CCTV STATUS', value: 'OUTPERFORMED' },
    ],
  },
  {
    id: 'cutie',
    code: 'SPECIMEN 002',
    name: 'CUTIE',
    animal: 'Monkey',
    species: 'Monkeyus Cutie',
    image: '/images/monkey.jpg',
    description:
      "Here we have Cutie, a rare energetic primate. Known for unpredictable movements, unlimited mischief and an extraordinary ability to turn every peaceful situation into a circus. Approach with caution. Seriousness has never been detected in this species.",
    classification: 'HIGHLY UNPREDICTABLE',
    classificationColor: {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/60',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]',
      border: 'border-amber-500/50',
    },
    attributes: [
      { label: 'CHAOS POTENTIAL', value: 'UNMEASURABLE' },
      { label: 'SERIOUSNESS LEVEL', value: '0.00% DETECTED' },
      { label: 'CIRCUS FACTOR', value: 'MAXIMUM OVERDRIVE' },
    ],
  },
  {
    id: 'hanok',
    code: 'SPECIMEN 003',
    name: 'HANOK',
    animal: 'Crane',
    species: 'Cranius Hanok',
    image: '/images/crane.jpg',
    description:
      "Introducing Hanok, the legendary crane. Recognisable by his unusually long appearance and ability to stand around observing everything. Frequently mistaken for a walking antenna. Researchers are still investigating whether he receives Wi-Fi signals.",
    classification: 'UNDER OBSERVATION',
    classificationColor: {
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60',
      glow: 'shadow-[0_0_25px_rgba(34,211,238,0.35)]',
      border: 'border-cyan-500/50',
    },
    attributes: [
      { label: 'ANTENNA ELEVATION', value: 'STATUESQUE' },
      { label: 'WI-FI SIGNAL', value: 'SCANNING 5GHz' },
      { label: 'OBSERVATION MODE', value: 'CONSTANT' },
    ],
  },
];

interface ZooParkSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
}

// Sound effects synthesizer for wildlife scanning and punchline
function createZooSFX() {
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
    // Green bio-scanner sound
    playBioScan: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(840, now + 0.35);
        osc.frequency.linearRampToValueAtTime(520, now + 0.7);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.7);
      } catch {
        // audio context blocked
      }
    },

    // Specimen lock-on chime
    playSpecimenLock: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        [0, 0.1].forEach((delay, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? 987.77 : 1318.51, now + delay);

          gain.gain.setValueAtTime(0.12, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.25);
        });
      } catch {
        // ignored
      }
    },

    // Suspense pause heartbeat/rumble
    playSuspenseBeat: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      } catch {
        // ignored
      }
    },

    // Funny / triumphant punchline hit
    playPunchlineHit: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Comical upward whistle / brass flourish
        const notes = [
          { f: 392.0, t: 0.0 }, // G4
          { f: 523.25, t: 0.1 }, // C5
          { f: 659.25, t: 0.2 }, // E5
          { f: 783.99, t: 0.3 }, // G5
          { f: 1046.5, t: 0.45 }, // C6
        ];

        notes.forEach((n) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now + n.t);

          gain.gain.setValueAtTime(0.15, now + n.t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + n.t);
          osc.stop(now + n.t + 0.6);
        });
      } catch {
        // ignored
      }
    },
  };
}

// Robotic AI speech announcement helper
function speakRoboticAI(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (sounds.getMuted()) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Select robotic or clean synthetic English voice if available
    const voice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('David') ||
            v.name.includes('Zira') ||
            v.name.includes('Natural') ||
            v.name.includes('Robot'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (voice) {
      utterance.voice = voice;
    }
    utterance.pitch = 0.95;
    utterance.rate = 1.0;
    utterance.volume = 0.85;

    window.speechSynthesis.speak(utterance);
  } catch {
    // speech synthesis unavailable
  }
}

export const ZooParkSection: React.FC<ZooParkSectionProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
  nextDestinationName = 'Google Maps',
}) => {
  // Navigation sequence:
  // 'video' -> 'intro' -> 'specimen_0' -> 'specimen_1' -> 'specimen_2' -> 'suspense' -> 'punchline'
  const [phase, setPhase] = useState<
    'video' | 'intro' | 'specimen_0' | 'specimen_1' | 'specimen_2' | 'suspense' | 'punchline'
  >('video');

  const [isScanningTransition, setIsScanningTransition] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sfxRef = useRef(createZooSFX());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Autoplay video when in 'video' phase
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

  // Video Ended Handler -> Transition into Wildlife Sanctuary AI Introduction
  const handleVideoEnded = useCallback(() => {
    setPhase('intro');
    sfxRef.current.playBioScan();

    // Trigger Robotic AI Voice announcement
    const aiText =
      'Captain, welcome to the wildlife sanctuary. Please remain calm. These creatures may look familiar, but our research confirms that they are anything but ordinary.';
    speakRoboticAI(aiText);
  }, []);

  // Start Specimen 001 from AI Introduction
  const handleStartSpecimens = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsScanningTransition(true);
    sfxRef.current.playBioScan();

    setTimeout(() => {
      setIsScanningTransition(false);
      setPhase('specimen_0');
      sfxRef.current.playSpecimenLock();
    }, 900);
  };

  // Manual user-controlled transition between specimens or to suspense screen
  const handleNextStep = () => {
    sounds.playTap();

    if (phase === 'specimen_0') {
      // User clicked NEXT SPECIMEN on Deevena -> Transition to Cutie
      setIsScanningTransition(true);
      sfxRef.current.playBioScan();
      setTimeout(() => {
        setIsScanningTransition(false);
        setPhase('specimen_1');
        sfxRef.current.playSpecimenLock();
      }, 700);
    } else if (phase === 'specimen_1') {
      // User clicked NEXT SPECIMEN on Cutie -> Transition to Hanok
      setIsScanningTransition(true);
      sfxRef.current.playBioScan();
      setTimeout(() => {
        setIsScanningTransition(false);
        setPhase('specimen_2');
        sfxRef.current.playSpecimenLock();
      }, 700);
    } else if (phase === 'specimen_2') {
      // User clicked COMPLETE DISCOVERY on Hanok -> Transition to Suspense screen
      setPhase('suspense');
      sfxRef.current.playSuspenseBeat();

      // Pause briefly for ~1.8s then reveal punchline
      setTimeout(() => {
        setPhase('punchline');
        sfxRef.current.playPunchlineHit();
      }, 1800);
    }
  };

  // Replay Video option
  const handleReplayVideo = () => {
    sounds.playTap();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPhase('video');
    setVideoError(null);
  };

  // Replay Specimen Reveal
  const handleReplaySpecimens = () => {
    sounds.playTap();
    handleStartSpecimens();
  };

  // Complete Destination & Proceed
  const handleProceed = () => {
    sounds.playDecode();
    onCompleteDestination('zoo-park');
    onContinueNext();
  };

  // Current specimen helper
  const currentSpecimenIndex =
    phase === 'specimen_0' ? 0 : phase === 'specimen_1' ? 1 : phase === 'specimen_2' ? 2 : null;
  const currentSpecimen =
    currentSpecimenIndex !== null ? WILDLIFE_SPECIMENS[currentSpecimenIndex] : null;

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-start text-slate-100 select-none">
      {/* ========================================================================= */}
      {/* 1. FULLSCREEN VIDEO PLAYBACK                                              */}
      {/* Pure video, no menus, no buttons, no overlays, original aspect ratio      */}
      {/* ========================================================================= */}
      {phase === 'video' && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={ZOO_VIDEO_URL}
            playsInline
            autoPlay
            loop={false}
            onEnded={handleVideoEnded}
            onError={() => {
              setVideoError(
                'Failed to load video from /videos/8.mp4. Please verify public/videos/8.mp4 is available.'
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

          {/* Development error overlay */}
          {videoError && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="max-w-md w-full p-6 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.5)] text-center font-mono-tech">
                <AlertTriangle className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-pulse" />
                <h3 className="font-display text-lg font-bold text-emerald-200 uppercase tracking-wider mb-2">
                  VIDEO PLAYBACK ERROR
                </h3>
                <p className="text-xs text-emerald-300 mb-3 leading-relaxed">{videoError}</p>
                <div className="p-2.5 rounded-lg bg-black/70 border border-emerald-500/40 text-[11px] text-amber-300 mb-4 select-all">
                  Source: {ZOO_VIDEO_URL}
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
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-display font-bold text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    RETRY VIDEO
                  </button>
                  <button
                    onClick={handleVideoEnded}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech transition-colors cursor-pointer"
                  >
                    PROCEED TO SANCTUARY
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCANNING TRANSITION OVERLAY                                               */}
      {/* ========================================================================= */}
      {isScanningTransition && (
        <div className="fixed inset-0 z-50 bg-[#020905]/90 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <div className="relative w-36 h-36 rounded-full border-2 border-emerald-400/50 flex items-center justify-center">
            <div className="absolute inset-0 bg-radar-grid opacity-40 rounded-full" />
            <div className="absolute inset-0 rounded-full animate-radar bg-gradient-to-tr from-transparent via-transparent to-emerald-400/30" />
            <Scan className="w-12 h-12 text-emerald-300 animate-pulse" />
          </div>
          <span className="font-mono-tech text-xs text-emerald-400 tracking-widest uppercase font-bold animate-pulse">
            CALIBRATING BIOSIGNATURE SCANNER...
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AI INTRODUCTION SCREEN                                                 */}
      {/* ========================================================================= */}
      {phase === 'intro' && (
        <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 flex flex-col items-center gap-5 sm:gap-6 animate-fadeIn">
          {/* Ambient emerald bio-glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Habitat Header */}
          <div className="w-full flex items-center justify-between border-b border-emerald-900/50 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono-tech text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest">
                SECTOR ETA // BIOSIGNATURE BASIN
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono-tech text-slate-400">
              SYSTEM: XENO-WILDLIFE RESEARCH GRID
            </span>
          </div>

          {/* Welcome Announcement Card */}
          <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-950/90 via-emerald-950/40 to-slate-950/90 border-2 border-emerald-500/50 p-4 sm:p-6 md:p-10 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col items-center text-center gap-4 sm:gap-5 relative overflow-hidden animate-bio-pulse">
            {/* Green laser scanline */}
            <div className="absolute inset-x-0 h-0.5 bg-emerald-400/80 shadow-[0_0_12px_#34d399] animate-laser-scan pointer-events-none" />

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-emerald-900/40 border border-emerald-400/80 flex items-center justify-center text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.4)]">
              <span className="text-3xl sm:text-4xl">🦁</span>
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5">
              <span className="text-[10px] sm:text-xs font-mono-tech text-emerald-400 font-extrabold uppercase tracking-widest">
                [ SECURE RESEARCH LAB ENTRY ]
              </span>
              <h1 className="font-display text-xl sm:text-2xl md:text-4xl font-black text-white tracking-wide">
                🦁 WELCOME TO THE WILDLIFE SANCTUARY
              </h1>
            </div>

            {/* AI Announcement Dialogue */}
            <div className="max-w-2xl w-full p-4 sm:p-5 rounded-2xl bg-black/60 border border-emerald-500/30 text-left flex flex-col sm:flex-row items-start gap-3 sm:gap-4 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] font-mono-tech text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                  AURA AI ANNOUNCEMENT:
                </span>
                <p className="text-xs sm:text-sm md:text-base text-slate-100 font-sans leading-relaxed">
                  &ldquo;Captain, welcome to the wildlife sanctuary. Please remain calm. These
                  creatures may look familiar, but our research confirms that they are anything but
                  ordinary.&rdquo;
                </p>
              </div>
            </div>

            {/* Begin Specimen Inspection CTA */}
            <button
              onClick={handleStartSpecimens}
              className="mt-2 w-full sm:w-auto min-h-[48px] px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-display font-black text-xs md:text-sm tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(52,211,153,0.45)] hover:shadow-[0_0_40px_rgba(52,211,153,0.65)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Scan className="w-4 h-4 stroke-[3]" />
              <span>ACCESS CLASSIFIED SPECIMENS</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REVEAL SPECIMENS ONE BY ONE (DEEVENA, CUTIE, HANOK)                    */}
      {/* ========================================================================= */}
      {currentSpecimen && (
        <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 flex flex-col items-center gap-5 sm:gap-6 animate-fadeIn">
          {/* Ambient biosignature glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Progress Track Header */}
          <div className="w-full flex items-center justify-between border-b border-emerald-900/50 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] sm:text-xs font-mono-tech font-bold text-emerald-300 tracking-wider">
                WILDLIFE DATABASE // {currentSpecimen.code}
              </span>
            </div>

            {/* Stepper indicator: 1 of 3 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSpecimenIndex
                      ? 'w-6 sm:w-8 bg-emerald-400 shadow-[0_0_10px_#34d399]'
                      : idx < (currentSpecimenIndex ?? 0)
                      ? 'w-3 sm:w-4 bg-emerald-600'
                      : 'w-3 sm:w-4 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Specimen Profile Card */}
          <div
            className={`w-full rounded-2xl sm:rounded-3xl bg-slate-950/85 border-2 ${currentSpecimen.classificationColor.border} p-4 sm:p-6 md:p-8 backdrop-blur-md ${currentSpecimen.classificationColor.glow} flex flex-col md:flex-row items-center gap-5 sm:gap-6 md:gap-8 relative overflow-hidden`}
          >
            {/* Green Laser Scan Line animation */}
            <div className="absolute inset-x-0 h-0.5 bg-emerald-400/80 shadow-[0_0_10px_#34d399] animate-laser-scan pointer-events-none" />

            {/* Prominent Specimen Portrait with Viewport HUD */}
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl bg-black/80 border-2 border-emerald-500/40 p-2 overflow-hidden shadow-2xl shrink-0">
              {/* Corner crosshairs */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-400 z-20 pointer-events-none" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-400 z-20 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-400 z-20 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-400 z-20 pointer-events-none" />

              {/* Status Header Overlay */}
              <div className="absolute top-4 inset-x-4 z-20 flex justify-between items-center text-[10px] font-mono-tech text-emerald-300 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm pointer-events-none">
                <span>{currentSpecimen.code}</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OPTICAL LOCK
                </span>
              </div>

              {/* Animal Photo */}
              <img
                src={currentSpecimen.image}
                alt={currentSpecimen.name}
                className="w-full h-full object-cover rounded-xl"
                loading="eager"
              />

              {/* Bottom Telemetry Overlay */}
              <div className="absolute bottom-4 inset-x-4 z-20 text-[10px] font-mono-tech text-emerald-300 bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-sm text-center pointer-events-none">
                TAXONOMY: {currentSpecimen.species.toUpperCase()}
              </div>
            </div>

            {/* Specimen Profile Information */}
            <div className="flex-1 flex flex-col justify-between gap-3.5 sm:gap-4 w-full">
              {/* Name & Classification */}
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <span className="text-[11px] sm:text-xs font-mono-tech text-emerald-400 font-bold uppercase tracking-wider">
                    {currentSpecimen.code} // CLASSIFIED RECORD
                  </span>
                  <span
                    className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono-tech font-extrabold uppercase tracking-wider border ${currentSpecimen.classificationColor.badge}`}
                  >
                    {currentSpecimen.classification}
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wider">
                  {currentSpecimen.name}
                </h2>

                <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs font-mono-tech text-slate-300 flex-wrap">
                  <span className="text-emerald-400 font-semibold">
                    Animal:{' '}
                    <span className="text-slate-100 font-display font-bold">
                      {currentSpecimen.animal}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="text-teal-400 italic font-serif">
                    Species: {currentSpecimen.species}
                  </span>
                </div>
              </div>

              {/* Exact Description Text */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-emerald-500/30 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed shadow-inner">
                {currentSpecimen.description}
              </div>

              {/* Scientific Bio-Telemetry Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentSpecimen.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="p-2 sm:p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center"
                  >
                    <span className="text-[9px] font-mono-tech text-emerald-400/80 uppercase block">
                      {attr.label}
                    </span>
                    <span className="text-[11px] font-mono-tech text-slate-100 font-bold mt-0.5 block truncate">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Manual Navigation Between Profiles */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-emerald-900/40">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-mono-tech uppercase tracking-wider text-emerald-300">
                    {phase === 'specimen_0' && 'SPECIMEN 001 OF 003 // READY'}
                    {phase === 'specimen_1' && 'SPECIMEN 002 OF 003 // READY'}
                    {phase === 'specimen_2' && 'SPECIMEN 003 OF 003 // READY'}
                  </span>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full sm:w-auto min-h-[48px] px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-display font-black text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(52,211,153,0.4)] hover:shadow-[0_0_35px_rgba(52,211,153,0.6)] active:scale-[0.98] cursor-pointer transition-all"
                >
                  <span>
                    {phase === 'specimen_2' ? 'COMPLETE DISCOVERY →' : 'NEXT SPECIMEN →'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUSPENSE SCREEN ("AND GUESS WHAT...")                                   */}
      {/* ========================================================================= */}
      {phase === 'suspense' && (
        <div className="fixed inset-0 z-50 bg-[#020704] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="absolute inset-0 bg-radial-grid opacity-30" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <span className="text-xs font-mono-tech text-emerald-400 uppercase tracking-widest font-bold animate-pulse">
              [ FINAL BIO-INTELLIGENCE SYNTHESIS ]
            </span>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-amber-300 tracking-wider animate-pulse drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
              AND GUESS WHAT...
            </h1>
            <div className="flex gap-2 mt-4">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping delay-100" />
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping delay-200" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FINAL PUNCHLINE: "WE LIVE AMONG THESE SPECIES! 😂😂"                    */}
      {/* ========================================================================= */}
      {phase === 'punchline' && (
        <div className="relative w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 flex flex-col items-center gap-6 sm:gap-8 animate-fadeIn">
          {/* Ambient celebration glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[400px] bg-emerald-500/15 rounded-full blur-[160px] pointer-events-none" />

          {/* Enormous Dramatic Punchline Headline */}
          <div className="w-full text-center flex flex-col items-center gap-3">
            <span className="px-3.5 sm:px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 font-mono-tech text-[10px] sm:text-xs font-extrabold uppercase tracking-widest animate-pulse">
              SHOCKING SCIENTIFIC REVELATION
            </span>

            <div className="animate-punchline-zoom">
              <h1 className="font-display text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-400 tracking-tight leading-tight drop-shadow-[0_0_35px_rgba(251,191,36,0.5)]">
                WE LIVE AMONG THESE SPECIES! 😂😂
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl leading-relaxed mt-1">
              Confirmed across planetary scans: The surveillance meerkat, the circus primate, and the Wi-Fi crane are walking right alongside Captain Bannu!
            </p>
          </div>

          {/* 3 Specimens Side-by-Side Summary Grid (Single column on mobile, 3 columns on desktop) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {WILDLIFE_SPECIMENS.map((specimen) => (
              <div
                key={specimen.id}
                className="rounded-2xl bg-slate-950/80 border border-emerald-500/40 p-4 flex flex-col items-center text-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-400/80 transition-all"
              >
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden border border-emerald-500/50 shadow-md">
                  <img
                    src={specimen.image}
                    alt={specimen.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 inset-x-1 bg-black/70 px-1 py-0.5 rounded text-[9px] font-mono-tech text-emerald-300">
                    {specimen.animal.toUpperCase()}
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-base sm:text-lg font-black text-white tracking-wider">
                    {specimen.name}
                  </h3>
                  <span className="text-[10px] font-mono-tech text-teal-300 block italic">
                    {specimen.species}
                  </span>
                  <span
                    className={`mt-1.5 inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono-tech font-bold uppercase border ${specimen.classificationColor.badge}`}
                  >
                    {specimen.classification}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-normal line-clamp-3">
                  {specimen.description}
                </p>
              </div>
            ))}
          </div>

          {/* Friendly Squad Tribute */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-950/90 to-emerald-950/50 border border-emerald-500/40 p-4 sm:p-5 text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono-tech mb-1">
              <Heart className="w-4 h-4 text-rose-400 fill-current" />
              <span className="font-bold">THE ULTIMATE BIRTHDAY CREW</span>
            </div>
            <p className="text-xs text-slate-200 font-sans max-w-lg mx-auto leading-relaxed">
              Every galaxy needs surveillance, chaos, and tall antennas. Bannu is surrounded by the best crew in the cosmos! Happy Birthday! ❤️🎂
            </p>
          </div>

          {/* Controls: Replay Video, Replay Specimens, and Proceed */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleReplayVideo}
                className="flex-1 sm:flex-none min-h-[48px] px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/50 text-emerald-200 hover:text-white font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>REPLAY VIDEO</span>
              </button>

              <button
                onClick={handleReplaySpecimens}
                className="flex-1 sm:flex-none min-h-[48px] px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-300 font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5 text-cyan-400" />
                <span>RE-ANALYZE</span>
              </button>
            </div>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto min-h-[48px] flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-display text-xs md:text-sm font-black tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.6)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>DISCOVERY ARCHIVED: PROCEED TO {nextDestinationName.toUpperCase()}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
