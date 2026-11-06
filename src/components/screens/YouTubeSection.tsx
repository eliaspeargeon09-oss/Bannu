import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Youtube,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ChevronRight,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Heart,
  Video,
  Radio,
  Eye,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';

const YOUTUBE_VIDEO_URL = '/videos/5.mp4';
const YOUTUBE_IMAGE_URL = '/images/youtube_channel.jpg';

interface RoastLine {
  id: string;
  type: 'heading' | 'roast' | 'pause' | 'pivot' | 'faith' | 'closing' | 'outro';
  text: string;
  highlight?: string;
  subtext?: string;
}

const YOUTUBE_LINES: RoastLine[] = [
  {
    id: 'l1',
    type: 'heading',
    text: 'BANNU! BRO, COME ON! 😂',
    subtext: 'URGENT TRANSMISSION DETECTED FROM CREATOR HQ',
  },
  {
    id: 'l2',
    type: 'roast',
    text: 'Bro, WAKE UP!',
    highlight: 'WAKE UP!',
  },
  {
    id: 'l3',
    type: 'roast',
    text: 'Our subscribers are getting DECREASED!',
    highlight: 'DECREASED!',
  },
  {
    id: 'l4',
    type: 'roast',
    text: 'Do something, bro! Upload something! Save the channel! 😭',
    highlight: 'Save the channel!',
  },
  {
    id: 'l5',
    type: 'pause',
    text: 'But this guy...',
    subtext: 'Looking calm like nothing happened...',
  },
  {
    id: 'l6',
    type: 'pivot',
    text: 'RELAX, RELAX. NOTHING HAPPENED. 😂',
    highlight: 'RELAX, RELAX.',
  },
  {
    id: 'l7',
    type: 'faith',
    text: "UNTIL GOD IS THERE, YOU'LL HANDLE IT PROPERLY!",
    highlight: 'UNTIL GOD IS THERE',
    subtext: 'Faith over algorithm. Purpose over numbers. 🙏✨',
  },
  {
    id: 'l8',
    type: 'closing',
    text: 'Honestly, bro, keep creating. Keep growing. Keep trusting God.',
    highlight: 'keep creating.',
  },
  {
    id: 'l9',
    type: 'closing',
    text: "Your journey isn't over. This is just another chapter!",
    highlight: 'another chapter!',
  },
  {
    id: 'l10',
    type: 'outro',
    text: 'NOW GO AND UPLOAD SOMETHING, BRO! 😂❤️',
    highlight: 'UPLOAD SOMETHING',
  },
];

interface YouTubeSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
}

export const YouTubeSection: React.FC<YouTubeSectionProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
  nextDestinationName = 'Music',
}) => {
  // Navigation states: 'video' -> 'transitioning' -> 'content'
  const [phase, setPhase] = useState<'video' | 'transitioning' | 'content'>('video');
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);

  // Video player states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Progressive roast reveal state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const roastEndRef = useRef<HTMLDivElement | null>(null);

  // Video Autoplay handling
  useEffect(() => {
    if (phase !== 'video') return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setVideoError(false);

    video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {
        setIsPlaying(false);
      });
    });
  }, [phase]);

  // Video progress tracking
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setVideoCurrentTime(video.currentTime);
    if (video.duration) {
      setVideoProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setVideoDuration(video.duration);
    }
  };

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
      const elem = (videoContainerRef.current || document.documentElement) as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
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

    if (currentLineIndex < YOUTUBE_LINES.length) {
      // Custom pauses: line 4 is the pause before "But this guy..."
      const current = YOUTUBE_LINES[currentLineIndex];
      let delay = 1900;
      if (currentLineIndex === 0) delay = 1600;
      else if (current.type === 'pause') delay = 2400; // playful dramatic pause!
      else if (current.type === 'pivot') delay = 2200;
      else if (current.type === 'faith') delay = 2600;
      else if (currentLineIndex === YOUTUBE_LINES.length - 1) delay = 2800;

      const timer = setTimeout(() => {
        sounds.playTap();
        setCurrentLineIndex((prev) => {
          const next = prev + 1;
          if (next >= YOUTUBE_LINES.length) {
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
    if (currentLineIndex < YOUTUBE_LINES.length) {
      const next = currentLineIndex + 1;
      setCurrentLineIndex(next);
      if (next >= YOUTUBE_LINES.length) {
        setIsFinished(true);
        sounds.playDecode();
      }
    }
  };

  const handleShowAll = () => {
    sounds.playTap();
    setCurrentLineIndex(YOUTUBE_LINES.length);
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

  const handleProceedToMusic = () => {
    sounds.playCelebration();
    onCompleteDestination('youtube');
    setTimeout(() => {
      onContinueNext();
    }, 450);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
              className={`font-black underline underline-offset-4 ${
                line.type === 'faith'
                  ? 'text-amber-300 decoration-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'text-rose-400 decoration-rose-500/80 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]'
              }`}
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

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start text-slate-100">
      {/* ========================================================================= */}
      {/* PHASE 1: INTRODUCTORY VIDEO (5.mp4)                                       */}
      {/* ========================================================================= */}
      {phase === 'video' && (
        <section
          ref={videoContainerRef}
          className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-black overflow-hidden px-2 sm:px-4 py-16"
        >
          {/* Ambient YouTube Red Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Info Bar */}
          <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] shrink-0">
                <Youtube className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase truncate">
                    YOUTUBE // SECTOR DELTA
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                </div>
                <p className="text-[9px] sm:text-[10px] font-mono-tech text-rose-400 truncate">
                  TRANSMISSION 05: BROADCAST ARRAY FEED
                </p>
              </div>
            </div>

            {/* Quick Skip Button */}
            <button
              onClick={handleSkipVideo}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-[11px] sm:text-xs font-mono-tech font-bold transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.25)] shrink-0 min-h-[36px]"
            >
              <span className="hidden sm:inline">SKIP TO CONTENT</span>
              <span className="sm:hidden">SKIP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Video Viewport - Responsive Aspect Ratio & Height */}
          <div className="relative w-full max-w-4xl aspect-video max-h-[72vh] sm:max-h-[80vh] flex items-center justify-center bg-black/95 rounded-xl sm:rounded-2xl overflow-hidden border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
            <video
              ref={videoRef}
              src={YOUTUBE_VIDEO_URL}
              playsInline
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
              onError={() => setVideoError(true)}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Error Fallback */}
            {videoError && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 sm:p-6 text-center z-20">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 mb-2 sm:mb-3" />
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-100 mb-1">
                  Video Feed Offline
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-4 font-mono-tech">
                  Unable to stream Sector Delta transmission. Proceed directly to the channel briefing.
                </p>
                <button
                  onClick={handleSkipVideo}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono-tech text-xs font-bold cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.4)] min-h-[44px]"
                >
                  PROCEED TO CHANNEL
                </button>
              </div>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2 z-20 opacity-90 hover:opacity-100 transition-opacity">
              {/* Progress Slider */}
              <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden cursor-pointer">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-400 transition-all duration-100"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono-tech text-[10px] sm:text-[11px] text-slate-400">
                    {formatSeconds(videoCurrentTime)} / {formatSeconds(videoDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label="Toggle Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: SMOOTH TRANSITION INTERMEDIARY                                  */}
      {/* ========================================================================= */}
      {phase === 'transitioning' && (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 gap-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/80 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-pulse">
            <Youtube className="w-8 h-8 fill-current" />
          </div>
          <span className="font-display font-extrabold tracking-widest text-slate-200 uppercase text-sm">
            ACCESSING CREATOR STUDIO ARCHIVES...
          </span>
          <span className="font-mono-tech text-xs text-rose-400">
            DECRYPTING RECENT ANALYTICS & SUBSCRIBER TELEMETRY
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3: INTERACTIVE YOUTUBE SCENE ("BRO, WAKE UP!")                       */}
      {/* ========================================================================= */}
      {phase === 'content' && (
        <section className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 flex flex-col gap-6 sm:gap-8 animate-fade-in">
          {/* Sector Header Banner */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900/80 to-slate-950/90 border border-rose-500/30 p-3.5 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 backdrop-blur-md shadow-[0_0_30px_rgba(244,63,94,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] shrink-0">
                <Youtube className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-extrabold text-base sm:text-lg md:text-xl text-white tracking-wide">
                    SECTOR DELTA // YOUTUBE
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] sm:text-[10px] font-mono-tech text-rose-300 uppercase">
                    Channel Intel
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-mono-tech text-slate-400 truncate">
                  CREATOR ARCHIVE: "BRO, WAKE UP!" • PASTOR VIJAYARAJU CHANNEL
                </p>
              </div>
            </div>

            {/* Quick Actions / Replay Video */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => {
                  sounds.playTap();
                  setPhase('video');
                }}
                className="min-h-[40px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono-tech transition-colors cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-rose-400" />
                <span>Replay Intro</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Content Layout (Single column on mobile, side-by-side on lg) */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ------------------------------------------------------------- */}
            {/* COLUMN 1: THE PROVIDED CHANNEL PHOTO (VISUAL FOCUS)          */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col items-center gap-4 w-full">
              <div className="relative w-full max-w-full sm:max-w-[360px] rounded-3xl p-3 bg-gradient-to-b from-rose-950/40 via-slate-950 to-slate-900 border border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.2)] overflow-hidden group">
                {/* Subtle Red Spotlight behind the frame */}
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

                {/* Top Channel Badge */}
                <div className="w-full flex items-center justify-between px-2 py-1.5 mb-2 font-mono-tech text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                    LIVE TELEMETRY
                  </span>
                  <span>760 VIDEOS RECORDED</span>
                </div>

                {/* Image Container (Preserving aspect ratio, responsive, crisp) */}
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative w-full rounded-2xl overflow-hidden cursor-zoom-in bg-black border border-slate-800/80 shadow-inner group/img"
                >
                  <img
                    src={YOUTUBE_IMAGE_URL}
                    alt="Pastor Vijayaraju YouTube Channel"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                    loading="eager"
                  />

                  {/* Zoom prompt badge */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono-tech text-white flex items-center gap-1 opacity-80 group-hover/img:opacity-100 transition-opacity">
                    <Eye className="w-3 h-3 text-rose-400" />
                    <span>Click to Expand</span>
                  </div>
                </div>

                {/* Bottom Channel Caption */}
                <div className="mt-3 px-2 py-1 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-slate-100">
                      Pastor Vijayaraju
                    </span>
                    <span className="font-mono-tech text-[11px] text-rose-400">
                      @ramakrishnasali • 353 subscribers
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-rose-950/60 border border-rose-500/30 text-[10px] font-mono-tech text-rose-300 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                    <span>Watch Out!</span>
                  </div>
                </div>
              </div>

              {/* Faith & Creator Affirmation Note */}
              <div className="w-full max-w-full sm:max-w-[360px] p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 font-sans leading-relaxed">
                  <strong className="text-amber-300">Faith Fact:</strong> True impact isn't measured in view counts—it's measured in lives touched and gifts multiplied!
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* COLUMN 2: THE ROAST & ENCOURAGEMENT DIALOGUE STREAM           */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col gap-4 w-full">
              {/* Dialogue Container */}
              <div className="w-full rounded-2xl sm:rounded-3xl bg-slate-950/70 border border-slate-800/90 p-4 sm:p-5 md:p-7 flex flex-col gap-4 shadow-xl backdrop-blur-md min-h-[380px] sm:min-h-[460px]">
                {/* Dialogue HUD Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-mono-tech text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                      TRANSMISSION LOG // ROAST SEQUENCE
                    </span>
                  </div>
                  <span className="font-mono-tech text-[10px] sm:text-xs text-rose-400 font-bold">
                    {Math.min(currentLineIndex, YOUTUBE_LINES.length)} / {YOUTUBE_LINES.length} LINES
                  </span>
                </div>

                {/* Line-by-Line Stream */}
                <div className="flex flex-col gap-3.5 my-2">
                  {YOUTUBE_LINES.slice(0, currentLineIndex).map((line, idx) => {
                    const isLatest = idx === currentLineIndex - 1;

                    if (line.type === 'heading') {
                      return (
                        <div
                          key={line.id}
                          className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/40 border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)] animate-fade-in"
                        >
                          <div className="font-display font-black text-xl md:text-2xl text-rose-300 tracking-wide mb-1">
                            {line.text}
                          </div>
                          {line.subtext && (
                            <div className="font-mono-tech text-[10px] text-rose-400/80 uppercase">
                              {line.subtext}
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (line.type === 'roast') {
                      return (
                        <div
                          key={line.id}
                          className={`p-3.5 rounded-2xl border transition-all animate-fade-in ${
                            isLatest
                              ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                              : 'bg-slate-900/80 border-slate-800/80'
                          }`}
                        >
                          <p className="text-sm md:text-base text-slate-200 font-medium leading-snug">
                            {renderLineText(line)}
                          </p>
                        </div>
                      );
                    }

                    if (line.type === 'pause') {
                      return (
                        <div
                          key={line.id}
                          className="my-1 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 border-dashed text-slate-400 font-mono-tech text-xs italic flex items-center justify-between animate-fade-in"
                        >
                          <span className="text-slate-300 font-semibold">{line.text}</span>
                          <span className="text-[11px] text-amber-400/80 font-mono-tech">
                            {line.subtext}
                          </span>
                        </div>
                      );
                    }

                    if (line.type === 'pivot') {
                      return (
                        <div
                          key={line.id}
                          className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-fade-in"
                        >
                          <p className="text-base md:text-lg font-bold text-amber-300 leading-snug">
                            {renderLineText(line)}
                          </p>
                        </div>
                      );
                    }

                    if (line.type === 'faith') {
                      return (
                        <div
                          key={line.id}
                          className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-rose-950/50 border border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.25)] animate-fade-in"
                        >
                          <div className="text-base md:text-lg font-extrabold text-white tracking-wide mb-1">
                            {renderLineText(line)}
                          </div>
                          {line.subtext && (
                            <p className="text-xs font-sans text-amber-200/90 mt-1">
                              {line.subtext}
                            </p>
                          )}
                        </div>
                      );
                    }

                    if (line.type === 'closing') {
                      return (
                        <div
                          key={line.id}
                          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 animate-fade-in"
                        >
                          <p className="text-sm md:text-base text-slate-200 font-medium">
                            {renderLineText(line)}
                          </p>
                        </div>
                      );
                    }

                    if (line.type === 'outro') {
                      return (
                        <div
                          key={line.id}
                          className="p-4 rounded-2xl bg-gradient-to-r from-rose-600/30 via-red-500/20 to-amber-500/20 border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)] animate-fade-in"
                        >
                          <p className="font-display font-black text-lg md:text-xl text-white tracking-wide text-center">
                            {renderLineText(line)}
                          </p>
                        </div>
                      );
                    }

                    return null;
                  })}
                  <div ref={roastEndRef} />
                </div>

                {/* Interactive Controls Bar */}
                <div className="mt-auto pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!isFinished && (
                      <button
                        onClick={handleNextLine}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono-tech text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)] flex items-center gap-1.5"
                      >
                        <span>Next Line</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isFinished && (
                      <button
                        onClick={handleShowAll}
                        className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono-tech text-xs transition-colors cursor-pointer"
                      >
                        Reveal All
                      </button>
                    )}

                    {isFinished && (
                      <button
                        onClick={handleReplayRoast}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono-tech text-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Replay Roast</span>
                      </button>
                    )}
                  </div>

                  {/* Auto-Play Toggle */}
                  {!isFinished && (
                    <button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-colors cursor-pointer ${
                        isAutoPlaying
                          ? 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isAutoPlaying ? 'Auto-Advancing: ON' : 'Auto-Advancing: PAUSED'}
                    </button>
                  )}
                </div>
              </div>

              {/* NEXT SECTOR BUTTON (TRANSITION TO SCENE 6: MUSIC) */}
              {isFinished && (
                <div className="w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-emerald-950/80 border-2 border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-sm sm:text-base text-white">
                        Sector Delta Cleared!
                      </h4>
                      <p className="font-mono-tech text-[11px] sm:text-xs text-rose-300 truncate">
                        Proceeding to Sector Epsilon: {nextDestinationName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToMusic}
                    className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-emerald-500 hover:from-rose-400 hover:to-emerald-400 text-slate-950 font-display font-extrabold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(244,63,94,0.5)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>CONTINUE TO MUSIC SECTOR</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX MODAL FOR YOUTUBE CHANNEL SCREENSHOT                            */}
      {/* ========================================================================= */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full max-h-[92vh] flex flex-col items-center"
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={YOUTUBE_IMAGE_URL}
              alt="Pastor Vijayaraju YouTube Channel"
              className="w-auto max-h-[85vh] rounded-2xl border border-rose-500/40 shadow-[0_0_40px_rgba(244,63,94,0.3)] object-contain"
            />
            <p className="mt-3 text-xs font-mono-tech text-rose-300 text-center">
              Pastor Vijayaraju (@ramakrishnasali) • 353 subscribers • 760 videos
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
