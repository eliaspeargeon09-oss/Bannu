import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Palette,
  Layers,
  ChevronRight,
  Sparkles,
  Cake,
  RotateCcw,
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

const CANVA_VIDEO_URL = '/videos/4.mp4';
const CANVA_IMAGE_URL = '/images/media_1793184605942.jpg';

interface CanvaSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
}

export const CanvaSection: React.FC<CanvaSectionProps> = ({
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

  // Content Stages (ONLY begin after video completes)
  // 'prank' -> 'suspense' -> 'surprise' -> 'emotional'
  const [stage, setStage] = useState<'prank' | 'suspense' | 'surprise' | 'emotional'>('prank');
  const [prankStep, setPrankStep] = useState(0);

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

  // Progressive fake editing assignment sequence runs ONLY when phase === 'content'
  useEffect(() => {
    if (phase !== 'content') return;

    const t1 = setTimeout(() => {
      setPrankStep(1); // "Can you make one more poster for me?"
      sounds.playTap();
    }, 1800);

    const t2 = setTimeout(() => {
      setPrankStep(2); // "Just a small edit, bro. Nothing complicated. 😂"
      sounds.playTap();
    }, 3800);

    const t3 = setTimeout(() => {
      setStage('suspense'); // Suspense pause
      sounds.playScan();
    }, 5800);

    const t4 = setTimeout(() => {
      setStage('surprise'); // "WAIT... WAIT... WAIT! NO, NO! I WAS JUST KIDDING!"
      sounds.playDecode();
    }, 7800);

    const t5 = setTimeout(() => {
      setStage('emotional'); // Full birthday reveal & celebration
      sounds.playCelebration();
    }, 11500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [phase]);

  const handleSkipToSurprise = () => {
    sounds.playDecode();
    setPrankStep(2);
    setStage('emotional');
  };

  const handleReplayStory = () => {
    sounds.playTap();
    setStage('prank');
    setPrankStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueAdventure = () => {
    sounds.playCelebration();
    onCompleteDestination('canva');
    setTimeout(() => {
      onContinueNext();
    }, 450);
  };

  /* ------------------------------------------------------------- */
  /* PHASE 1 & 2: INTRODUCTORY VIDEO (4.mp4) - PLAYS FIRST          */
  /* ------------------------------------------------------------- */
  if (phase === 'video' || phase === 'transitioning') {
    return (
      <div
        ref={videoContainerRef}
        className={`fixed inset-0 z-50 bg-[#06040b] flex flex-col justify-between overflow-hidden transition-opacity duration-700 select-none ${
          phase === 'transitioning' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Ambient Purple/Pink Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-400/60 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.3)]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase">
                  CANVA // SECTOR GAMMA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              </div>
              <p className="text-[10px] font-mono-tech text-purple-400">
                TRANSMISSION 04: DESIGN CANVAS FEED
              </p>
            </div>
          </div>

          {/* Quick Skip to Canva Content */}
          <button
            onClick={handleSkipVideo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 text-xs font-mono-tech font-bold transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(192,132,252,0.2)]"
          >
            <span>SKIP TO CONTENT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Video Viewport (Preserving Aspect Ratio) */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4">
          <video
            ref={videoRef}
            src={CANVA_VIDEO_URL}
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
              <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-400 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(192,132,252,0.7)] hover:scale-110 transition-transform">
                <Play className="w-9 h-9 text-purple-300 ml-1" />
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
                Could not stream the Canva sector video. You can retry playback or proceed directly to the surprise.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setVideoError(false);
                    videoRef.current?.load();
                    videoRef.current?.play();
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-display font-bold text-xs cursor-pointer transition-colors"
                >
                  Retry Playback
                </button>
                <button
                  onClick={handleSkipVideo}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech cursor-pointer transition-colors"
                >
                  Proceed to Surprise
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
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-purple-300 hover:border-purple-500/50 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-purple-300 hover:border-purple-500/50 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-purple-400" />
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
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-purple-300 hover:border-purple-500/50 transition-colors cursor-pointer"
              title="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-purple-300 hover:border-purple-500/50 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-purple-400" />
              ) : (
                <Maximize className="w-4 h-4 text-slate-200" />
              )}
            </button>
          </div>

          <button
            onClick={handleSkipVideo}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-slate-950 font-display font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(192,132,252,0.4)] hover:shadow-[0_0_30px_rgba(192,132,252,0.6)] transition-all cursor-pointer"
          >
            <span>ENTER CANVA STUDIO</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* PHASE 3: CANVA POSTER IMAGE + BIRTHDAY SURPRISE DIALOGUE       */
  /* ------------------------------------------------------------- */
  return (
    <div className="relative w-full min-h-screen text-slate-100 flex flex-col items-center px-4 py-6 md:px-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Background Ambient Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative w-full text-center mb-6 pt-2 flex flex-col items-center">
        {/* Holographic Glowing Canva Icon */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-3">
          <div
            className="absolute inset-0 rounded-full border border-purple-400/40 border-dashed animate-spin"
            style={{ animationDuration: '24s' }}
          />
          <div className="absolute inset-1.5 rounded-full border border-pink-500/20" />
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-950/70 border border-purple-400/80 flex items-center justify-center shadow-[0_0_25px_rgba(192,132,252,0.4)] backdrop-blur-md">
            <Palette className="w-6 h-6 md:w-7 md:h-7 text-purple-300" />
          </div>
        </div>

        {/* Sector Tag */}
        <div className="flex items-center gap-2 mb-1.5 font-mono-tech text-[11px] tracking-widest text-purple-300 uppercase bg-purple-950/60 border border-purple-500/40 px-3.5 py-0.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(192,132,252,0.2)]">
          <Layers className="w-3.5 h-3.5 text-pink-300" />
          <span>SECTOR 03 // HOLOGRAPHIC CANVAS</span>
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 uppercase drop-shadow-md">
          CANVA
        </h1>

        <p className="text-xs text-slate-300 font-sans max-w-md mx-auto mt-1 leading-relaxed">
          {stage === 'emotional'
            ? 'OFFICIAL BIRTHDAY DECREE FOR BANNU'
            : 'NEW DESIGN ASSIGNMENT DETECTED'}
        </p>

        {/* Replay Video Action */}
        {hasWatchedVideo && (
          <div className="mt-3">
            <button
              onClick={handleReplayVideo}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-purple-300 text-[10px] font-mono-tech transition-all cursor-pointer"
              title="Watch the sector introductory transmission again"
            >
              <Film className="w-3 h-3 text-purple-400" />
              <span>REPLAY INTRO VIDEO</span>
            </button>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VISUAL FOCUS: THE CANVA POSTER IMAGE (CENTERED BOX)     */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full flex flex-col items-center mb-6">
        <div className="group relative rounded-2xl md:rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950 border-2 border-purple-500/40 hover:border-purple-400/80 p-3 shadow-[0_0_40px_rgba(192,132,252,0.25)] transition-all duration-300 backdrop-blur-md flex flex-col items-center max-w-lg md:max-w-xl w-full">
          {/* Corner tech crosshair brackets */}
          <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-purple-400 pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-purple-400 pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-purple-400 pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-purple-400 pointer-events-none" />

          {/* Top Label */}
          <div className="w-full flex items-center justify-between font-mono-tech text-[10px] text-purple-300 mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              CANVAS SPECIMEN // BANNER PROJECT
            </span>
            <span>1024 × 768 · POSTER ARCHIVE</span>
          </div>

          {/* Strictly Contained Image Box */}
          <div className="relative w-full h-[240px] sm:h-[300px] md:h-[340px] rounded-xl bg-black/90 border border-purple-950 flex items-center justify-center p-2 overflow-hidden shadow-inner">
            <img
              src={CANVA_IMAGE_URL}
              alt="Bannu Graphic Design Poster"
              className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg drop-shadow-[0_0_20px_rgba(192,132,252,0.25)] animate-fadeIn select-none"
            />
          </div>

          <div className="w-full text-center mt-2 font-mono-tech text-[10px] text-slate-400">
            {stage === 'emotional'
              ? 'MASTERPIECE VERIFIED · ZERO REVISIONS REQUIRED'
              : 'CANVA FILE RECOVERED · PENDING INSPECTION'}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* STORY & DIALOGUE SEQUENCES                                     */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full max-w-xl flex flex-col items-center">
        {/* PHASE 1: THE FAKE EDITING ASSIGNMENT */}
        <div className="w-full space-y-3">
          {/* Line 1 */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-slate-200 text-xs sm:text-sm font-sans flex items-start gap-2.5 animate-fadeIn">
            <span className="text-purple-400 font-mono-tech text-xs mt-0.5">&gt;</span>
            <p className="font-semibold text-purple-200">BANNU... ONE LAST THING. 👀</p>
          </div>

          {/* Line 2 */}
          {prankStep >= 1 && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-slate-200 text-xs sm:text-sm font-sans flex items-start gap-2.5 animate-fadeIn">
              <span className="text-purple-400 font-mono-tech text-xs mt-0.5">&gt;</span>
              <p>Can you make one more poster for me?</p>
            </div>
          )}

          {/* Line 3 */}
          {prankStep >= 2 && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-slate-200 text-xs sm:text-sm font-sans flex items-start gap-2.5 animate-fadeIn">
              <span className="text-purple-400 font-mono-tech text-xs mt-0.5">&gt;</span>
              <p>Just a small edit, bro. Nothing complicated. 😂</p>
            </div>
          )}

          {/* Suspense Pause */}
          {stage === 'suspense' && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-dashed border-purple-400/50 text-center font-mono-tech text-xs text-purple-300 animate-pulse">
              <span>Calculating revisions...</span>
            </div>
          )}

          {/* PHASE 2: THE JOKE REVEAL */}
          {(stage === 'surprise' || stage === 'emotional') && (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/80 via-slate-950 to-slate-950 border-2 border-pink-500/60 shadow-[0_0_30px_rgba(236,72,153,0.3)] text-center space-y-2 animate-fadeIn">
              <span className="font-display font-extrabold text-sm sm:text-base text-pink-300 block">
                WAIT... WAIT... WAIT!
              </span>
              <p className="font-display font-bold text-base sm:text-lg text-white">
                NO, NO! I WAS JUST KIDDING! 😂❤️
              </p>
              <div className="py-2 text-xs font-mono-tech text-purple-200 font-bold space-y-1">
                <p>EVERYTHING IS ALREADY DONE!</p>
                <p>NO MORE POSTERS.</p>
                <p>NO MORE EDITS.</p>
                <p className="text-pink-300">NO MORE &apos;BRO, JUST CHANGE THIS ONE THING&apos;!</p>
              </div>
            </div>
          )}

          {/* PHASE 3: PROMINENT BIRTHDAY CELEBRATION MESSAGE */}
          {stage === 'emotional' && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-900/60 via-slate-950 to-black border-2 border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.4)] text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-400 mx-auto flex items-center justify-center text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                <Cake className="w-6 h-6 animate-bounce" />
              </div>

              <div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-purple-200 to-amber-200 uppercase tracking-wider">
                  HAPPY BIRTHDAY, BANNU! 🎂🎉
                </h2>
                <span className="font-mono-tech text-xs text-amber-300 font-bold block mt-1">
                  Today, you&apos;re officially OFF DUTY.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-slate-200 font-sans leading-relaxed">
                <p>No editing. No last-minute changes. No extra revisions.</p>
                <p className="mt-1 font-semibold text-purple-200">
                  Just relax, enjoy your birthday, and have an amazing day!
                </p>
              </div>

              {/* Final Emotional Touch */}
              <div className="pt-3 border-t border-purple-900/50 space-y-2">
                <p className="text-xs sm:text-sm font-sans font-medium text-pink-200 italic leading-relaxed">
                  &ldquo;YOU SPEND SO MUCH TIME CREATING THINGS FOR EVERYONE ELSE.&rdquo;
                </p>
                <p className="text-xs sm:text-sm font-sans font-bold text-white uppercase tracking-wider">
                  TODAY, LET EVERYONE CELEBRATE YOU. ❤️
                </p>
                <div className="pt-2">
                  <span className="font-display text-sm sm:text-base font-extrabold text-amber-300 tracking-wide block">
                    ENJOY YOUR BIRTHDAY, EDITOR! 🎬🎂
                  </span>
                </div>
              </div>

              {/* Action: Continue Birthday Adventure */}
              <div className="pt-4">
                <button
                  onClick={handleContinueAdventure}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:from-purple-400 hover:to-pink-400 text-slate-950 font-display font-extrabold text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(236,72,153,0.5)] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>CONTINUE ADVENTURE</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Replay or Skip helper buttons */}
        {stage !== 'emotional' && (
          <div className="mt-4">
            <button
              onClick={handleSkipToSurprise}
              className="text-[10px] font-mono-tech text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              Skip to Birthday Surprise →
            </button>
          </div>
        )}

        {stage === 'emotional' && (
          <div className="mt-4">
            <button
              onClick={handleReplayStory}
              className="flex items-center gap-1 text-[10px] font-mono-tech text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Replay Surprise</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
