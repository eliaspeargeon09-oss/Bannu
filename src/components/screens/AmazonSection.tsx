import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingCart,
  Package,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Flame,
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';

const AMAZON_VIDEO_URL = '/videos/3.mp4';
const AMAZON_IMAGE_URL = '/images/media_1793184605907.jpg';

interface RoastLine {
  text: string;
  highlight?: string;
  isHeading?: boolean;
}

const ROAST_LINES: RoastLine[] = [
  { text: 'BANNU, WE NEED TO TALK. 😂', isHeading: true },
  { text: 'Bro, is your Amazon cart a shopping cart or your entire life plan?' },
  { text: 'Your cart list is UNENDING! 😭', highlight: 'UNENDING' },
  { text: 'Phone-related things? Added.' },
  { text: 'Music equipment? Added.' },
  { text: 'Sound systems and audio accessories? Added.' },
  { text: 'Study materials? Added.' },
  { text: 'Something completely unnecessary that you suddenly want at 2 AM? ADDED! 💀', highlight: 'ADDED!' },
  { text: 'Bro wants everything Amazon has ever manufactured!', highlight: 'everything' },
  { text: 'At this point, Amazon should stop sending you notifications and start sending you a salary slip. 😂', highlight: 'salary slip' },
  { text: 'And the funniest part?' },
  { text: "YOU HAVEN'T EVEN FINISHED WANTING EVERYTHING YET!", highlight: 'EVERYTHING' },
];

interface AmazonSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
}

export const AmazonSection: React.FC<AmazonSectionProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
}) => {
  // Navigation states: 'video' -> 'transitioning' -> 'content'
  const [phase, setPhase] = useState<'video' | 'transitioning' | 'content'>('video');
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);

  // Video playback states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Roast state (ONLY begins after video ends / phase === 'content')
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const roastEndRef = useRef<HTMLDivElement | null>(null);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Video Autoplay handling
  useEffect(() => {
    if (phase !== 'video') return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setVideoError(false);

    video.play().catch(() => {
      // In case browser requires initial muted autoplay
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {
        setIsPlaying(false);
      });
    });
  }, [phase]);

  // Video Ended Callback
  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    setHasWatchedVideo(true);
    sounds.playDecode();

    setPhase('transitioning');
    setTimeout(() => {
      setPhase('content');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  }, []);

  const handleSkipVideo = () => {
    sounds.playTap();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setHasWatchedVideo(true);
    setPhase('transitioning');
    setTimeout(() => {
      setPhase('content');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleReplayVideo = () => {
    sounds.playTap();
    setPhase('video');
    setIsPlaying(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const elem = (videoContainerRef.current || document.documentElement) as any;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Progressive roast lines reveal ONLY runs when phase === 'content'
  useEffect(() => {
    if (phase !== 'content' || !isAutoPlaying || isFinished) return;

    if (currentLineIndex < ROAST_LINES.length) {
      const delay = currentLineIndex === 0 ? 1500 : currentLineIndex === ROAST_LINES.length - 1 ? 2500 : 1900;
      const timer = setTimeout(() => {
        sounds.playTap();
        setCurrentLineIndex((prev) => {
          const next = prev + 1;
          if (next >= ROAST_LINES.length) {
            setIsFinished(true);
            sounds.playDecode();
          }
          return next;
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [phase, currentLineIndex, isAutoPlaying, isFinished]);

  // Auto-scroll as new roast lines appear
  useEffect(() => {
    if (phase === 'content' && currentLineIndex > 2 && roastEndRef.current) {
      roastEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [phase, currentLineIndex]);

  const handleNextLine = () => {
    sounds.playTap();
    if (currentLineIndex < ROAST_LINES.length) {
      const next = currentLineIndex + 1;
      setCurrentLineIndex(next);
      if (next >= ROAST_LINES.length) {
        setIsFinished(true);
        sounds.playDecode();
      }
    }
  };

  const handleShowAll = () => {
    sounds.playTap();
    setCurrentLineIndex(ROAST_LINES.length);
    setIsFinished(true);
    sounds.playDecode();
  };

  const handleReplayRoast = () => {
    sounds.playTap();
    setCurrentLineIndex(0);
    setIsFinished(false);
    setIsAutoPlaying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCanva = () => {
    sounds.playCelebration();
    onCompleteDestination('amazon');
    setTimeout(() => {
      onContinueNext();
    }, 450);
  };

  const renderLineText = (line: RoastLine) => {
    if (!line.highlight) return line.text;

    const parts = line.text.split(new RegExp(`(${line.highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === line.highlight?.toLowerCase() ? (
            <span
              key={i}
              className="text-amber-300 font-extrabold underline decoration-amber-400/60 underline-offset-4 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  /* ------------------------------------------------------------- */
  /* PHASE 1 & 2: INTRODUCTORY VIDEO (3.mp4) - PLAYS FIRST          */
  /* ------------------------------------------------------------- */
  if (phase === 'video' || phase === 'transitioning') {
    return (
      <div
        ref={videoContainerRef}
        className={`fixed inset-0 z-50 bg-[#04060b] flex flex-col justify-between overflow-hidden transition-opacity duration-700 select-none ${
          phase === 'transitioning' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Ambient Amber Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase">
                  AMAZON // SECTOR BETA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <p className="text-[10px] font-mono-tech text-amber-400">
                TRANSMISSION 03: SUPPLY CAPSULE FEED
              </p>
            </div>
          </div>

          {/* Quick Skip to Roast Content */}
          <button
            onClick={handleSkipVideo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-mono-tech font-bold transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <span>SKIP TO CONTENT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Video Viewport (Preserving Aspect Ratio) */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4">
          <video
            ref={videoRef}
            src={AMAZON_VIDEO_URL}
            playsInline
            autoPlay
            onEnded={handleVideoEnded}
            onError={() => setVideoError(true)}
            className="w-full h-full max-h-screen object-contain z-10"
          />

          {/* Play/Pause Overlay Click Target */}
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
          >
            {!isPlaying && !videoError && (
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-400 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-110 transition-transform">
                <Play className="w-9 h-9 text-amber-300 ml-1" />
              </div>
            )}
          </div>

          {/* Error Fallback State */}
          {videoError && (
            <div className="absolute z-30 p-6 rounded-2xl bg-slate-900/95 border border-rose-500/50 max-w-md text-center backdrop-blur-md shadow-2xl">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <h3 className="font-display text-sm font-bold text-rose-200 uppercase tracking-wider">
                VIDEO TRANSMISSION NOTICE
              </h3>
              <p className="text-xs text-slate-300 mt-2 mb-4 leading-relaxed font-sans">
                Could not stream the Amazon sector video. You can retry playback or proceed directly to the content.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setVideoError(false);
                    videoRef.current?.load();
                    videoRef.current?.play();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer transition-colors"
                >
                  Retry Playback
                </button>
                <button
                  onClick={handleSkipVideo}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech cursor-pointer transition-colors"
                >
                  Proceed to Content
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating Minimal Controls */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-300 hover:border-amber-500/50 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-300 hover:border-amber-500/50 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-300 hover:border-amber-500/50 transition-colors cursor-pointer"
              title="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-300 hover:border-amber-500/50 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-amber-400" />
              ) : (
                <Maximize className="w-4 h-4 text-slate-200" />
              )}
            </button>
          </div>

          <button
            onClick={handleSkipVideo}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-display font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all cursor-pointer"
          >
            <span>ENTER AMAZON CART</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* PHASE 3: AMAZON IMAGE + PERSONALIZED SHOPPING CART ROAST       */
  /* ------------------------------------------------------------- */
  return (
    <div className="relative w-full min-h-screen text-slate-100 flex flex-col items-center px-4 py-6 md:px-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative w-full text-center mb-6 pt-2 flex flex-col items-center">
        {/* Holographic Glowing Amazon Box Core */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-3">
          <div
            className="absolute inset-0 rounded-full border border-amber-400/40 border-dashed animate-spin"
            style={{ animationDuration: '22s' }}
          />
          <div className="absolute inset-1.5 rounded-full border border-amber-500/20" />
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-950/70 border border-amber-400/80 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] backdrop-blur-md">
            <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-amber-300" />
          </div>
        </div>

        {/* Sector Tag */}
        <div className="flex items-center gap-2 mb-1.5 font-mono-tech text-[11px] tracking-widest text-amber-400 uppercase bg-amber-950/60 border border-amber-500/40 px-3.5 py-0.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Package className="w-3.5 h-3.5 text-amber-300" />
          <span>SECTOR 02 // CARGO REPOSITORY</span>
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-orange-400 uppercase drop-shadow-md">
          AMAZON
        </h1>

        <p className="text-xs text-slate-300 font-sans max-w-md mx-auto mt-1 leading-relaxed">
          THE NEVER-ENDING CART TRANSMISSION
        </p>

        {/* Replay Video Action */}
        {hasWatchedVideo && (
          <div className="mt-3">
            <button
              onClick={handleReplayVideo}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 text-[10px] font-mono-tech transition-all cursor-pointer"
              title="Watch the sector introductory transmission again"
            >
              <Film className="w-3 h-3 text-amber-400" />
              <span>REPLAY INTRO VIDEO</span>
            </button>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VISUAL FOCUS: THE PROVIDED AMAZON IMAGE (CENTERED BOX)  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full flex flex-col items-center mb-8">
        <div className="group relative rounded-2xl md:rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-2 border-amber-500/40 hover:border-amber-400/80 p-3 shadow-[0_0_40px_rgba(245,158,11,0.25)] transition-all duration-300 backdrop-blur-md flex flex-col items-center max-w-[320px] sm:max-w-[360px]">
          {/* Corner tech crosshair brackets */}
          <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

          {/* Top Label */}
          <div className="w-full flex items-center justify-between font-mono-tech text-[10px] text-amber-400 mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              CART INTERCEPT // LIVE EVIDENCE
            </span>
            <span>4+ ITEMS & COUNTING</span>
          </div>

          {/* Strictly Contained Image Box */}
          <div className="relative w-full h-[360px] sm:h-[400px] rounded-xl bg-black/90 border border-amber-950 flex items-center justify-center p-2 overflow-hidden shadow-inner">
            <img
              src={AMAZON_IMAGE_URL}
              alt="Bannu Amazon Cart Evidence"
              className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg drop-shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-fadeIn select-none"
            />
          </div>

          <div className="w-full text-center mt-2 font-mono-tech text-[10px] text-slate-400">
            CONFIDENTIAL CART INTEL RECOVERED
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PERSONALIZED ROAST STORY SECTION BENEATH THE IMAGE            */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full max-w-xl flex flex-col items-center">
        {/* Roast Header Banner */}
        <div className="w-full flex items-center justify-between pb-2 mb-4 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="font-mono-tech text-xs tracking-wider text-amber-300 font-bold uppercase">
              INTERCEPTED TRANSMISSION ROAST
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isFinished && (
              <button
                onClick={handleShowAll}
                className="text-[10px] font-mono-tech text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Skip to end
              </button>
            )}
            {isFinished && (
              <button
                onClick={handleReplayRoast}
                className="flex items-center gap-1 text-[10px] font-mono-tech text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            )}
          </div>
        </div>

        {/* Sequential Roast Lines */}
        <div className="w-full space-y-3">
          {ROAST_LINES.slice(0, currentLineIndex).map((line, idx) => {
            const isLatest = idx === currentLineIndex - 1 && !isFinished;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 animate-fadeIn ${
                  line.isHeading
                    ? 'bg-amber-950/60 border-amber-400/80 text-amber-200 font-display font-extrabold text-sm sm:text-base text-center shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : isLatest
                    ? 'bg-slate-900/90 border-amber-500/60 text-slate-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-amber-400 font-mono-tech text-xs select-none mt-0.5">
                    &gt;
                  </span>
                  <p className="text-xs sm:text-sm font-sans leading-relaxed flex-1">
                    {renderLineText(line)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll anchor */}
        <div ref={roastEndRef} />

        {/* Continue typing prompt if autoplaying */}
        {!isFinished && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleNextLine}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 text-xs font-mono-tech transition-all cursor-pointer"
            >
              <span>NEXT LINE</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ENDING OF AMAZON SCENE & CANVA TRANSITION                     */}
        {/* ------------------------------------------------------------- */}
        {isFinished && (
          <div className="w-full mt-8 p-6 rounded-2xl bg-gradient-to-b from-amber-950/70 via-slate-950 to-slate-950 border-2 border-amber-400/80 backdrop-blur-md shadow-[0_0_35px_rgba(245,158,11,0.3)] text-center animate-fadeIn">
            <h3 className="font-display text-base sm:text-lg font-bold text-amber-200 uppercase tracking-wider mb-2">
              ANYWAY, GO CHECK YOUR CART AGAIN. 😂
            </h3>
            <p className="text-xs text-slate-300 font-mono-tech mb-5">
              NEXT STOP: CANVA 🎨
            </p>

            <button
              onClick={handleProceedToCanva}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-extrabold text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>ENTER CANVA // SECTOR GAMMA</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
