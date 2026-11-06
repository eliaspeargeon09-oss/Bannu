import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  MapPin,
  Compass,
  Radio,
  Satellite,
  Globe2,
  Navigation,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Heart,
  Terminal,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';

// Video source located in the public directory
const MAPS_VIDEO_URL = '/videos/9.mp4';

// Search steps strictly preserving user prompt wording
const SEARCH_STEPS = [
  'Scanning nearby locations...',
  'Searching residential addresses...',
  'Checking saved locations...',
  'Contacting navigation satellites...',
  'Recalculating search area...',
];

// Roast lines strictly preserving user prompt wording
const ROAST_LINES = [
  "Bro doesn't even have a fixed place to stay!",
  'Google Maps has searched the entire planet...',
  "And still can't figure out where this guy lives!",
];

// Random jumping locations for the final punchline map pin
const JUMPING_LOCATIONS = [
  { name: 'HYDERABAD (Temporary Base)', coords: '17.3850° N, 78.4867° E' },
  { name: 'BANGALORE (Tech Orbit)', coords: '12.9716° N, 77.5946° E' },
  { name: "FRIEND'S COUCH (Sector Beta)", coords: '0.0000° N, 0.0000° E' },
  { name: 'THE GYM (Heavy Gravity Zone)', coords: '17.4401° N, 78.3489° E' },
  { name: 'RAILWAY STATION (Always Moving)', coords: '17.4344° N, 78.5017° E' },
  { name: 'SOMEWHERE IN THE MULTIVERSE', coords: '∞.∞° N, ∞.∞° E' },
];

interface GoogleMapsSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
}

// Sound synthesizer for satellite map telemetry, radar, and comical punchline
function createMapsSFX() {
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
    playSatellitePing: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1480, now);
        osc.frequency.exponentialRampToValueAtTime(1860, now + 0.06);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } catch {
        // audio context blocked
      }
    },

    playRadarSweep: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.3);
        osc.frequency.linearRampToValueAtTime(330, now + 0.6);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
      } catch {
        // audio context blocked
      }
    },

    playWarningBuzzer: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Two low warning buzz pulses
        [0, 0.2].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now + offset);
          osc.frequency.linearRampToValueAtTime(150, now + offset + 0.15);

          gain.gain.setValueAtTime(0.12, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + offset);
          osc.stop(now + offset + 0.16);
        });
      } catch {
        // audio context blocked
      }
    },

    playPinBounce: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
      } catch {
        // audio context blocked
      }
    },

    playGiveUpFanfare: () => {
      if (sounds.getMuted()) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Comical descending slide followed by humorous finish
        const notes = [
          { f: 783.99, t: 0.0 }, // G5
          { f: 659.25, t: 0.12 }, // E5
          { f: 523.25, t: 0.24 }, // C5
          { f: 392.0, t: 0.38 }, // G4
          { f: 587.33, t: 0.55 }, // D5 (comical resolved question mark)
        ];

        notes.forEach((n) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now + n.t);

          gain.gain.setValueAtTime(0.14, now + n.t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + n.t);
          osc.stop(now + n.t + 0.5);
        });
      } catch {
        // audio context blocked
      }
    },
  };
}

export const GoogleMapsSection: React.FC<GoogleMapsSectionProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
  nextDestinationName = 'Friendship',
}) => {
  // Sequence states strictly conforming to instructions:
  // VIDEO -> LOCATION SEARCH -> SEARCH FAILURES -> BANNU ROAST -> FINAL PUNCHLINE
  const [phase, setPhase] = useState<'video' | 'search_init' | 'searching' | 'roast' | 'punchline'>(
    'video'
  );

  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [currentRoastIndex, setCurrentRoastIndex] = useState(0);
  const [jumpingPinIndex, setJumpingPinIndex] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sfxRef = useRef(createMapsSFX());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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
        console.warn('Video autoplay unmuted prevented, falling back to muted:', err);
        video.muted = true;
        video.play().catch((secondErr) => {
          console.warn('Playback requires tap:', secondErr);
        });
      });
    }
  }, [phase]);

  // Video Ended Handler -> Transitions to Step 2: Location Search Initiated
  const handleVideoEnded = useCallback(() => {
    setPhase('search_init');
    sfxRef.current.playRadarSweep();

    // After 2 seconds of showing the satellite search initialization, start search steps
    timerRef.current = setTimeout(() => {
      setPhase('searching');
      setCurrentSearchIndex(0);
      setShowLocationWarning(false);
    }, 2200);
  }, []);

  // Step 3: Progressive Search Steps with short pauses
  useEffect(() => {
    if (phase !== 'searching') return;

    if (currentSearchIndex < SEARCH_STEPS.length) {
      sfxRef.current.playSatellitePing();

      timerRef.current = setTimeout(() => {
        setCurrentSearchIndex((prev) => prev + 1);
      }, 1400); // 1.4s pause between each search step
    } else if (currentSearchIndex === SEARCH_STEPS.length && !showLocationWarning) {
      // All 5 search queries finished -> Display Major Warning: LOCATION NOT FOUND!
      timerRef.current = setTimeout(() => {
        setShowLocationWarning(true);
        sfxRef.current.playWarningBuzzer();

        // After displaying warning for 2.2s, transition to Step 4: The Roast
        timerRef.current = setTimeout(() => {
          setPhase('roast');
          setCurrentRoastIndex(0);
        }, 2200);
      }, 800);
    }
  }, [phase, currentSearchIndex, showLocationWarning]);

  // Step 4: The Roast - Progressive reveals with pauses
  useEffect(() => {
    if (phase !== 'roast') return;

    sfxRef.current.playSatellitePing();

    if (currentRoastIndex < ROAST_LINES.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentRoastIndex((prev) => prev + 1);
      }, 2000); // 2s pause between punchlines
    } else {
      // All roast lines revealed -> Transition to Step 5: Final Punchline
      timerRef.current = setTimeout(() => {
        setPhase('punchline');
        sfxRef.current.playGiveUpFanfare();
      }, 2600);
    }
  }, [phase, currentRoastIndex]);

  // Step 5: Jumping Pin Animation Interval
  useEffect(() => {
    if (phase !== 'punchline') return;

    const interval = setInterval(() => {
      setJumpingPinIndex((prev) => {
        const next = (prev + 1) % JUMPING_LOCATIONS.length;
        sfxRef.current.playPinBounce();
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [phase]);

  // Replay Video
  const handleReplayVideo = () => {
    sounds.playTap();
    setPhase('video');
    setVideoError(null);
  };

  // Re-run Search & Roast
  const handleRerunSearch = () => {
    sounds.playTap();
    setPhase('search_init');
    setShowLocationWarning(false);
    setCurrentSearchIndex(0);
    setCurrentRoastIndex(0);

    timerRef.current = setTimeout(() => {
      setPhase('searching');
    }, 1800);
  };

  // Complete Destination & Proceed to Final Planet (Friendship)
  const handleProceed = () => {
    sounds.playCelebration();
    onCompleteDestination('google-maps');
    onContinueNext();
  };

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-start text-slate-100 select-none">
      {/* ========================================================================= */}
      {/* 1. FULLSCREEN VIDEO PLAYBACK                                              */}
      {/* Strictly pure video, no overlays, no controls, no loop, full screen       */}
      {/* ========================================================================= */}
      {phase === 'video' && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={MAPS_VIDEO_URL}
            playsInline
            autoPlay
            loop={false}
            onEnded={handleVideoEnded}
            onError={() => {
              setVideoError(
                'Failed to load video from /videos/9.mp4. Please verify public/videos/9.mp4 exists.'
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
              <div className="max-w-md w-full p-6 rounded-2xl bg-blue-950/90 border-2 border-blue-500/80 shadow-[0_0_50px_rgba(59,130,246,0.5)] text-center font-mono-tech">
                <AlertTriangle className="w-12 h-12 text-blue-400 mx-auto mb-3 animate-pulse" />
                <h3 className="font-display text-lg font-bold text-blue-200 uppercase tracking-wider mb-2">
                  VIDEO PLAYBACK ERROR
                </h3>
                <p className="text-xs text-blue-300 mb-3 leading-relaxed">{videoError}</p>
                <div className="p-2.5 rounded-lg bg-black/70 border border-blue-500/40 text-[11px] text-cyan-300 mb-4 select-all">
                  Source: {MAPS_VIDEO_URL}
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
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 font-display font-bold text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    RETRY VIDEO
                  </button>
                  <button
                    onClick={handleVideoEnded}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech transition-colors cursor-pointer"
                  >
                    CONTINUE TO MAPS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OPENING ANNOUNCEMENT: LOCATION SEARCH INITIATED                        */}
      {/* ========================================================================= */}
      {phase === 'search_init' && (
        <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-14 flex flex-col items-center gap-5 sm:gap-6 animate-fadeIn">
          {/* Ambient navigation cyan glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Interface Bar */}
          <div className="w-full flex items-center justify-between border-b border-blue-900/50 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <span className="font-mono-tech text-[11px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest">
                SECTOR THETA // COORDINATE NEXUS
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono-tech text-slate-400">
              ORBITAL SATELLITE NETWORK ACTIVE
            </span>
          </div>

          {/* Opening Radar & Globe Console */}
          <div className="w-full rounded-2xl sm:rounded-3xl bg-slate-950/85 border-2 border-blue-500/50 p-4 sm:p-6 md:p-10 shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col items-center text-center gap-5 sm:gap-6 relative overflow-hidden animate-pulse-glow-blue">
            {/* Holographic Radar Grid Background */}
            <div className="absolute inset-0 bg-radar-grid opacity-20 pointer-events-none" />

            {/* Rotating Globe + Scanning Radar + Moving Location Marker */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-blue-400/40 bg-blue-950/20 flex items-center justify-center overflow-hidden shadow-[0_0_35px_rgba(59,130,246,0.25)]">
              {/* Radar sweep */}
              <div className="absolute inset-0 origin-center animate-radar bg-gradient-to-tr from-transparent via-transparent to-blue-400/40" />

              {/* Rotating Wireframe Globe */}
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '18s' }}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300" />
              </div>
              <Globe2 className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400/80 animate-pulse" />

              {/* Moving Location Marker */}
              <div className="absolute top-6 sm:top-8 right-8 sm:right-10 text-rose-500 animate-bounce">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_0_8px_#f43f5e]" />
              </div>
            </div>

            {/* Announcement Texts */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 animate-bounce" />
                <h1 className="font-display text-xl sm:text-2xl md:text-4xl font-black text-white tracking-wide">
                  📍 LOCATION SEARCH INITIATED
                </h1>
              </div>

              <p className="font-display text-base sm:text-lg md:text-xl font-bold text-cyan-300">
                &ldquo;Searching for Captain Bannu...&rdquo;
              </p>

              <span className="text-[11px] sm:text-xs font-mono-tech text-blue-300/80 tracking-widest mt-1">
                CONTACTING 24 GLOBAL NAVIGATION SATELLITES...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. THE SEARCH (PROGRESSIVE STEPS & MAJOR WARNING)                         */}
      {/* ========================================================================= */}
      {phase === 'searching' && (
        <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 flex flex-col items-center gap-5 sm:gap-6 animate-fadeIn">
          {/* Top Interface Bar */}
          <div className="w-full flex items-center justify-between border-b border-blue-900/50 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono-tech text-[11px] sm:text-xs font-bold text-cyan-400 uppercase tracking-widest">
                GOOGLE MAPS // GLOBAL POSITIONING RADAR
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono-tech text-slate-400">
              TARGET: CAPTAIN BANNU
            </span>
          </div>

          {/* Main Terminal Console */}
          <div className="w-full rounded-2xl sm:rounded-3xl bg-slate-950/90 border-2 border-blue-500/60 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-[0_0_45px_rgba(59,130,246,0.25)] flex flex-col gap-5 sm:gap-6 relative overflow-hidden">
            {/* Header with Coordinates status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-b border-blue-900/40 pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-900/40 border border-blue-400/60 flex items-center justify-center text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
                  <Satellite className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" style={{ animationDuration: '10s' }} />
                </div>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-wider">
                    SATELLITE POSITION SEARCH
                  </h2>
                  <span className="text-[10px] sm:text-[11px] font-mono-tech text-blue-400">
                    SATELLITE ARRAY: GPS · GLONASS · NAVIC
                  </span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-400/40 text-[10px] sm:text-[11px] font-mono-tech text-cyan-300 flex items-center gap-2 self-start sm:self-auto shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>QUERYING GLOBAL GRID</span>
              </div>
            </div>

            {/* Progressive Search Step Messages (Displayed one after another) */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {SEARCH_STEPS.map((step, idx) => {
                const isCurrent = idx === currentSearchIndex;
                const isPast = idx < currentSearchIndex;

                if (idx > currentSearchIndex) return null;

                return (
                  <div
                    key={idx}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 flex items-center justify-between gap-2 animate-fadeIn ${
                      isCurrent
                        ? 'bg-blue-900/30 border-blue-400 text-cyan-200 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                        : isPast
                        ? 'bg-black/50 border-blue-900/40 text-slate-400'
                        : 'opacity-0'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/60 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
                        {isCurrent ? (
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                        )}
                      </div>
                      <span className="font-mono-tech text-xs sm:text-sm font-semibold tracking-wide truncate">
                        {step}
                      </span>
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-mono-tech uppercase font-bold tracking-wider px-2 sm:px-2.5 py-1 rounded-md bg-black/60 border border-blue-500/20 shrink-0">
                      {isCurrent ? (
                        <span className="text-cyan-300 animate-pulse">SEARCHING...</span>
                      ) : (
                        <span className="text-amber-400">0 MATCHES</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Major Warning Banner: LOCATION NOT FOUND! */}
            {showLocationWarning && (
              <div className="rounded-2xl bg-gradient-to-r from-red-950/95 via-rose-950/90 to-red-950/95 border-2 border-red-500 p-4 sm:p-6 text-center flex flex-col items-center gap-2 shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-glitch">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 animate-pulse" />
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wider">
                  ⚠️ LOCATION NOT FOUND!
                </h2>
                <p className="font-mono-tech text-[10px] sm:text-xs text-red-300 tracking-wider uppercase">
                  ERROR CODE: 404_NO_FIXED_RESIDENCE_DETECTED
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. THE ROAST (PROGRESSIVE TEXT REVEALS WITH PAUSES)                        */}
      {/* ========================================================================= */}
      {phase === 'roast' && (
        <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 flex flex-col items-center gap-5 sm:gap-6 animate-fadeIn">
          {/* Top Interface Bar */}
          <div className="w-full flex items-center justify-between border-b border-rose-900/50 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
              <span className="font-mono-tech text-[11px] sm:text-xs font-bold text-rose-400 uppercase tracking-widest">
                GOOGLE MAPS // INVESTIGATION REPORT
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono-tech text-slate-400">
              STATUS: COMPLETE SATELLITE BEWILDERMENT
            </span>
          </div>

          {/* Roast Cards Stack (Revealed progressively, not all at once) */}
          <div className="w-full flex flex-col gap-3.5 sm:gap-4">
            {/* Roast Line 1 */}
            {currentRoastIndex >= 0 && (
              <div className="rounded-2xl bg-gradient-to-r from-slate-950/90 via-blue-950/40 to-slate-950/90 border-2 border-blue-400/60 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.25)] flex items-center gap-3.5 sm:gap-4 animate-fadeIn">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-900/40 border border-blue-400 flex items-center justify-center text-blue-300 shrink-0">
                  <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-mono-tech text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                    [ PRELIMINARY DIAGNOSTIC ]
                  </span>
                  <p className="font-display text-base sm:text-xl md:text-2xl font-black text-white leading-snug">
                    &ldquo;{ROAST_LINES[0]}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Roast Line 2 */}
            {currentRoastIndex >= 1 && (
              <div className="rounded-2xl bg-gradient-to-r from-slate-950/90 via-amber-950/40 to-slate-950/90 border-2 border-amber-400/60 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.25)] flex items-center gap-3.5 sm:gap-4 animate-fadeIn">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-900/40 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
                  <Globe2 className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-mono-tech text-amber-400 font-bold uppercase tracking-wider block mb-1">
                    [ GLOBAL COVERAGE METRIC ]
                  </span>
                  <p className="font-display text-base sm:text-xl md:text-2xl font-black text-amber-200 leading-snug">
                    &ldquo;{ROAST_LINES[1]}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Roast Line 3 */}
            {currentRoastIndex >= 2 && (
              <div className="rounded-2xl bg-gradient-to-r from-slate-950/90 via-rose-950/50 to-slate-950/90 border-2 border-rose-500 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-[0_0_40px_rgba(244,63,94,0.35)] flex items-center gap-3.5 sm:gap-4 animate-fadeIn">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-900/40 border border-rose-400 flex items-center justify-center text-rose-300 shrink-0">
                  <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-mono-tech text-rose-400 font-bold uppercase tracking-wider block mb-1">
                    [ SYSTEM CONCLUSION ]
                  </span>
                  <p className="font-display text-base sm:text-xl md:text-2xl font-black text-rose-300 leading-snug">
                    &ldquo;{ROAST_LINES[2]}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FINAL PUNCHLINE: JUMPING PIN & BANNU: LOCATION UNKNOWN                  */}
      {/* ========================================================================= */}
      {phase === 'punchline' && (
        <div className="relative w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 flex flex-col items-center gap-6 sm:gap-8 animate-fadeIn">
          {/* Ambient navigation glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[400px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />

          {/* Interactive Jumping Map Pin HUD Canvas */}
          <div className="w-full rounded-2xl sm:rounded-3xl bg-slate-950/90 border-2 border-blue-500/70 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-[0_0_50px_rgba(59,130,246,0.35)] flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
            {/* Background Grid Map Pattern */}
            <div className="absolute inset-0 bg-holo-grid opacity-25 pointer-events-none" />

            {/* Left: The Jumping Google Maps Pin Viewport */}
            <div className="relative w-full md:w-80 h-52 sm:h-64 rounded-2xl bg-black/80 border-2 border-rose-500/50 p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner shrink-0">
              {/* Radar sweep inside the map */}
              <div className="absolute inset-0 bg-radar-grid opacity-40 pointer-events-none" />
              <div className="absolute inset-0 origin-center animate-radar bg-gradient-to-tr from-transparent via-transparent to-blue-400/25 pointer-events-none" />

              {/* Status Header */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-cyan-300 z-10">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  GPS TRACKER: ERRATIC
                </span>
                <span>HOP: #{jumpingPinIndex + 1}</span>
              </div>

              {/* Animated Jumping Location Pin */}
              <div className="relative my-auto flex flex-col items-center z-10">
                <div className="animate-pin-jump flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-[0_0_25px_#f43f5e] relative">
                    <MapPin className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
                  </div>
                  {/* Pin point shadow */}
                  <div className="w-7 sm:w-8 h-2 rounded-full bg-black/60 blur-xs mt-1" />
                </div>
              </div>

              {/* Dynamic Jumping Location Readout */}
              <div className="w-full p-2 rounded-lg bg-black/75 border border-rose-500/40 text-center z-10">
                <span className="text-[10px] font-mono-tech text-amber-300 font-bold block truncate">
                  📍 {JUMPING_LOCATIONS[jumpingPinIndex].name}
                </span>
                <span className="text-[9px] font-mono-tech text-slate-400 block truncate">
                  {JUMPING_LOCATIONS[jumpingPinIndex].coords}
                </span>
              </div>
            </div>

            {/* Right: Enormous Punchline Text */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-3 w-full">
              <span className="px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/60 text-rose-300 font-mono-tech text-[10px] sm:text-xs font-extrabold uppercase tracking-widest animate-pulse">
                OFFICIAL SATELLITE VERDICT
              </span>

              <div className="animate-punchline-zoom">
                <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-300 tracking-tight leading-tight drop-shadow-[0_0_30px_rgba(244,63,94,0.6)]">
                  BANNU: LOCATION UNKNOWN
                </h1>
              </div>

              <p className="font-display text-base sm:text-xl md:text-2xl font-bold text-white mt-0.5">
                &ldquo;Even Google Maps has officially given up! 😂&rdquo;
              </p>

              <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-lg">
                Satellites have ceased orbital triangulations. Bannu resides in the hearts of his friends, the clouds of spontaneity, and literally anywhere except a fixed pin on the map.
              </p>

              {/* Honorary Nomadic Badge */}
              <div className="mt-1 sm:mt-2 px-3.5 sm:px-4 py-2 rounded-xl bg-blue-950/60 border border-blue-400/50 flex items-center gap-2.5 sm:gap-3">
                <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
                <span className="text-xs font-mono-tech text-blue-200">
                  Title Unlocked: <span className="font-bold text-cyan-300">The Multiverse Nomad</span>
                </span>
              </div>
            </div>
          </div>

          {/* Warm Birthday Message */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-950/90 to-blue-950/50 border border-blue-500/40 p-4 sm:p-5 text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-2 text-cyan-300 text-[11px] sm:text-xs font-mono-tech mb-1">
              <Heart className="w-4 h-4 text-rose-400 fill-current" />
              <span className="font-bold">HAPPY BIRTHDAY BANNU!</span>
            </div>
            <p className="text-xs text-slate-200 font-sans max-w-lg mx-auto leading-relaxed">
              No matter where in the world you wander, our coordinates will always lock onto you. May your new year bring epic travels and zero lost signals! ❤️🎂
            </p>
          </div>

          {/* Action Controls */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleReplayVideo}
                className="flex-1 sm:flex-none min-h-[48px] px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-blue-500/50 text-blue-200 hover:text-white font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>REPLAY VIDEO</span>
              </button>

              <button
                onClick={handleRerunSearch}
                className="flex-1 sm:flex-none min-h-[48px] px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>RE-SEARCH</span>
              </button>
            </div>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto min-h-[48px] flex-1 sm:max-w-md px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 hover:from-blue-400 hover:to-amber-300 text-slate-950 font-display text-xs md:text-sm font-black tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>PROCEED TO FINAL SECTOR: {nextDestinationName.toUpperCase()}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
