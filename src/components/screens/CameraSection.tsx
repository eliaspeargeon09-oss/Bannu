import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
  ZoomIn,
  Film,
  AlertCircle,
  ArrowDown,
  Eye,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';

const CAMERA_VIDEO_URL = '/videos/2.mp4';

interface CameraPhoto {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  category: string;
  dimensions: string;
}

const CAMERA_PHOTOS: CameraPhoto[] = [
  {
    id: 'mall-hangout',
    src: '/images/media_1793178592937.jpg',
    title: 'The Mall Chronicles',
    subtitle: 'Classic smiles and spontaneous adventures with the crew.',
    category: 'ARCHIVE 01',
    dimensions: '1024 × 576',
  },
  {
    id: 'cowboy-swagger',
    src: '/images/media_1793178592969.jpg',
    title: 'The Wild West Aisle',
    subtitle: 'Bringing unmistakable cowboy swagger to everyday store aisles.',
    category: 'ARCHIVE 02',
    dimensions: '576 × 1024',
  },
  {
    id: 'future-goggles',
    src: '/images/media_1793178592986.jpg',
    title: 'Cyberpunk Vision',
    subtitle: 'Stylishly calibrated: recon optics fully synchronized.',
    category: 'ARCHIVE 03',
    dimensions: '575 × 1024',
  },
  {
    id: 'brotherly-carry',
    src: '/images/media_1793178593080.jpg',
    title: 'Got Your Back',
    subtitle: 'Through late night climbs and real life challenges—always brothers.',
    category: 'ARCHIVE 04',
    dimensions: '576 × 1024',
  },
  {
    id: 'outdoor-rocks',
    src: '/images/media_1793178593098.jpg',
    title: 'Heights & High Spirits',
    subtitle: 'Scaling rock formations, laughing without limits, making memories.',
    category: 'ARCHIVE 05',
    dimensions: '1024 × 575',
  },
];

interface CameraSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
}

export const CameraSection: React.FC<CameraSectionProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
  nextDestinationName,
}) => {
  // Navigation states: 'video' -> 'transitioning' -> 'gallery'
  const [phase, setPhase] = useState<'video' | 'transitioning' | 'gallery'>('video');
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);

  // Video playback states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Gallery & Selected Photo Box states
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle Autoplay for CAMERA video
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

  // Video finished callback
  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    setHasWatchedVideo(true);
    sounds.playDecode();

    setPhase('transitioning');
    setTimeout(() => {
      setPhase('gallery');
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
      setPhase('gallery');
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

  // Keyboard navigation for Clicked Photo Box
  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev + 1) % CAMERA_PHOTOS.length : 0
        );
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev - 1 + CAMERA_PHOTOS.length) % CAMERA_PHOTOS.length : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex]);

  // Complete & proceed to next destination
  const handleCompleteAndContinue = () => {
    sounds.playCelebration();
    onCompleteDestination('camera');
    setTimeout(() => {
      onContinueNext();
    }, 500);
  };

  /* ------------------------------------------------------------- */
  /* PHASE 1 & 2: INTRODUCTORY VIDEO SCREEN (MUST PLAY FIRST)       */
  /* ------------------------------------------------------------- */
  if (phase === 'video' || phase === 'transitioning') {
    return (
      <div
        ref={videoContainerRef}
        className={`fixed inset-0 z-50 bg-[#02050b] flex flex-col justify-between overflow-hidden transition-opacity duration-700 select-none ${
          phase === 'transitioning' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase">
                  CAMERA // SECTOR ALPHA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <p className="text-[10px] font-mono-tech text-cyan-400">
                TRANSMISSION 02: INCOMING OPTICAL FEED
              </p>
            </div>
          </div>

          {/* Quick Skip to Gallery */}
          <button
            onClick={handleSkipVideo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono-tech font-bold transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            <span>SKIP TO GALLERY</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Video Viewport */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4">
          <video
            ref={videoRef}
            src={CAMERA_VIDEO_URL}
            playsInline
            autoPlay
            onEnded={handleVideoEnded}
            onError={() => setVideoError(true)}
            className="w-full h-full max-h-screen object-contain z-10"
          />

          <div
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
          >
            {!isPlaying && !videoError && (
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-400 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(34,211,238,0.7)] hover:scale-110 transition-transform">
                <Play className="w-9 h-9 text-cyan-300 ml-1" />
              </div>
            )}
          </div>

          {videoError && (
            <div className="absolute z-30 p-6 rounded-2xl bg-slate-900/95 border border-rose-500/50 max-w-md text-center backdrop-blur-md shadow-2xl">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <h3 className="font-display text-sm font-bold text-rose-200 uppercase tracking-wider">
                VIDEO TRANSMISSION NOTICE
              </h3>
              <p className="text-xs text-slate-300 mt-2 mb-4 leading-relaxed font-sans">
                Could not stream the sector video feed. You can retry playback or proceed directly to the photo gallery.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setVideoError(false);
                    videoRef.current?.load();
                    videoRef.current?.play();
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-bold text-xs cursor-pointer transition-colors"
                >
                  Retry Playback
                </button>
                <button
                  onClick={handleSkipVideo}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech cursor-pointer transition-colors"
                >
                  Proceed to Gallery
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
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
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
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
              title="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-cyan-400" />
              ) : (
                <Maximize className="w-4 h-4 text-slate-200" />
              )}
            </button>
          </div>

          <button
            onClick={handleSkipVideo}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-amber-500 text-slate-950 font-display font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all cursor-pointer"
          >
            <span>ENTER PHOTO GALLERY</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* PHASE 3: PHOTO GALLERY IN ATTRACTIVE BOXES                    */
  /* ------------------------------------------------------------- */
  return (
    <div className="relative w-full min-h-screen text-slate-100 flex flex-col items-center px-4 py-6 md:px-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header & CAMERA Branding */}
      <header className="relative w-full text-center mb-7 pt-2 flex flex-col items-center">
        {/* Holographic Camera Aperture Core */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-3">
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/30 border-dashed animate-spin"
            style={{ animationDuration: '20s' }}
          />
          <div className="absolute inset-1.5 rounded-full border border-cyan-500/20" />
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cyan-950/70 border border-cyan-400/80 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.4)] backdrop-blur-md">
            <Camera className="w-6 h-6 md:w-7 md:h-7 text-cyan-300" />
          </div>
        </div>

        {/* Category Pill */}
        <div className="flex items-center gap-2 mb-1.5 font-mono-tech text-[11px] tracking-widest text-cyan-400 uppercase bg-cyan-950/60 border border-cyan-500/30 px-3 py-0.5 rounded-full backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-cyan-300" />
          <span>SECTOR 01 // OPTICAL ARCHIVE</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-amber-200 uppercase drop-shadow-md">
          CAMERA
        </h1>

        <p className="text-xs text-slate-300 font-sans max-w-md mx-auto mt-1.5 leading-relaxed">
          5 encrypted photographic memories recovered from Captain Bannu&apos;s planetary journey.
        </p>

        {/* Stats & Actions */}
        <div className="mt-3.5 flex items-center gap-3">
          <span className="text-[10px] font-mono-tech text-cyan-300/90 bg-slate-900/80 border border-cyan-900/50 px-2.5 py-1 rounded-lg">
            5 MEMORY BOXES LOADED
          </span>

          {hasWatchedVideo && (
            <button
              onClick={handleReplayVideo}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 text-[10px] font-mono-tech transition-all cursor-pointer"
              title="Watch the sector introductory transmission again"
            >
              <Film className="w-3 h-3 text-cyan-400" />
              <span>REPLAY INTRO VIDEO</span>
            </button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* ATTRACTIVE PHOTO BOX GRID                                     */}
      {/* ------------------------------------------------------------- */}
      <main className="w-full">
        {/* Section subtitle */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono-tech text-xs tracking-wider text-cyan-300 uppercase">
              RECOVERED PHOTOGRAPHS
            </span>
          </div>
          <span className="text-[10px] font-mono-tech text-slate-400">
            Click any box to inspect
          </span>
        </div>

        {/* Responsive Grid of Neat Photo Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {CAMERA_PHOTOS.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => {
                sounds.playTap();
                setSelectedPhotoIndex(index);
              }}
              className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-cyan-500/25 hover:border-cyan-400/80 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all duration-300 cursor-pointer backdrop-blur-md flex flex-col justify-between"
            >
              {/* Corner crosshairs for authentic camera HUD look */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-cyan-500/40 group-hover:border-cyan-400 transition-colors pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-cyan-500/40 group-hover:border-cyan-400 transition-colors pointer-events-none" />

              {/* Strict Framed Photo Box */}
              <div className="relative w-full h-56 sm:h-60 rounded-xl bg-black/90 border border-cyan-950/80 overflow-hidden flex items-center justify-center p-2">
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  decoding="async"
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg group-hover:scale-[1.03] transition-transform duration-300"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-cyan-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-400 text-cyan-300 text-[11px] font-mono-tech font-bold flex items-center gap-1.5 shadow-[0_0_15px_#22d3ee]">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>OPEN BOX</span>
                  </div>
                </div>

                {/* Top Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="font-mono-tech text-[9px] text-cyan-300 bg-slate-950/90 border border-cyan-500/40 px-2 py-0.5 rounded backdrop-blur-md">
                    {photo.category}
                  </span>
                </div>
              </div>

              {/* Photo Box Footer Information */}
              <div className="mt-3 px-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-display text-xs md:text-sm font-bold text-slate-100 group-hover:text-cyan-200 uppercase tracking-wide truncate">
                    {photo.title}
                  </h3>
                  <span className="font-mono-tech text-[9px] text-slate-400 shrink-0">
                    {photo.dimensions}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-1 leading-normal">
                  {photo.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MISSION DECODED & CONTINUATION ACTION BAR                     */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full mt-10 mb-6 pt-5 border-t border-cyan-900/40 flex flex-col items-center">
        <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/40 border border-cyan-500/40 p-5 backdrop-blur-md shadow-[0_0_25px_rgba(34,211,238,0.15)] text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/80 mx-auto flex items-center justify-center text-emerald-300 mb-2.5 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>

          <h3 className="font-display text-sm md:text-base font-bold text-slate-100 uppercase tracking-wider mb-1">
            CAMERA ARCHIVE DECRYPTED
          </h3>
          <p className="text-[11px] text-slate-300 font-sans mb-4 max-w-sm mx-auto leading-relaxed">
            All 5 photographic memories of Captain Bannu have been preserved and synchronized.
          </p>

          <button
            onClick={handleCompleteAndContinue}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-display font-extrabold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(52,211,153,0.4)] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <span>
              {isCompleted
                ? `CONTINUE TO ${nextDestinationName || 'NEXT SECTOR'}`
                : `COMPLETE CAMERA & PROCEED`}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* STRICT ATTRACTIVE CLICKED PHOTO BOX (MODAL)                  */}
      {/* ------------------------------------------------------------- */}
      {selectedPhotoIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Centered Attractive Photo Box */}
          <div
            className="relative w-full max-w-md sm:max-w-lg bg-[#070d18] border-2 border-cyan-400/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(34,211,238,0.35)] flex flex-col justify-between overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Decorative Tech Brackets */}
            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Box Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono-tech text-[10px] sm:text-xs text-cyan-300 tracking-wider">
                  SPECIMEN {selectedPhotoIndex + 1} / {CAMERA_PHOTOS.length}
                </span>
                <span className="text-[9px] font-mono-tech text-slate-500">
                  [{CAMERA_PHOTOS[selectedPhotoIndex].dimensions}]
                </span>
              </div>

              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Strict Photo Container Box */}
            <div className="relative w-full h-[280px] sm:h-[340px] my-3 rounded-xl bg-black/95 border border-cyan-500/30 flex items-center justify-center p-2 overflow-hidden shadow-inner">
              {/* Previous Photo Button */}
              <button
                onClick={() =>
                  setSelectedPhotoIndex(
                    (prev) => (prev! - 1 + CAMERA_PHOTOS.length) % CAMERA_PHOTOS.length
                  )
                }
                className="absolute left-2 z-20 w-8 h-8 rounded-full bg-slate-950/80 border border-cyan-500/50 hover:bg-cyan-900/70 text-slate-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* The Photo — strictly fitting inside its box */}
              <img
                src={CAMERA_PHOTOS[selectedPhotoIndex].src}
                alt={CAMERA_PHOTOS[selectedPhotoIndex].title}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg drop-shadow-[0_0_20px_rgba(34,211,238,0.25)] select-none"
              />

              {/* Next Photo Button */}
              <button
                onClick={() =>
                  setSelectedPhotoIndex((prev) => (prev! + 1) % CAMERA_PHOTOS.length)
                }
                className="absolute right-2 z-20 w-8 h-8 rounded-full bg-slate-950/80 border border-cyan-500/50 hover:bg-cyan-900/70 text-slate-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Box Footer Information */}
            <div className="pt-2 border-t border-cyan-900/40 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide truncate">
                  {CAMERA_PHOTOS[selectedPhotoIndex].title}
                </h4>
                <p className="text-[11px] text-slate-300 font-sans mt-0.5 line-clamp-2 leading-relaxed">
                  {CAMERA_PHOTOS[selectedPhotoIndex].subtitle}
                </p>
              </div>

              {/* Next navigation pill */}
              <button
                onClick={() =>
                  setSelectedPhotoIndex(
                    (prev) => (prev! + 1) % CAMERA_PHOTOS.length
                  )
                }
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono-tech font-bold transition-all cursor-pointer"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
