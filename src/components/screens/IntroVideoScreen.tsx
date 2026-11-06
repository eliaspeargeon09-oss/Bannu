import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronRight,
  Film,
  Maximize,
  Minimize,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface IntroVideoScreenProps {
  onVideoComplete: () => void;
  customVideoUrl?: string;
  onSetCustomVideoUrl?: (url: string) => void;
}

export const IntroVideoScreen: React.FC<IntroVideoScreenProps> = ({
  onVideoComplete,
  customVideoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoSrc] = useState(customVideoUrl || '/1.mp4');

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Attempt auto-play when mounted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try unmuted first since user clicked "PROCEED TO VIDEO"
    video.play().catch(() => {
      // In case browser policy still requires muted initial playback
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {
        setIsPlaying(false);
      });
    });
  }, [videoSrc]);

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
      const elem = (containerRef.current || document.documentElement) as any;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleVideoEnded = () => {
    setHasEnded(true);
    setIsPlaying(false);
    sounds.playDecode();
    // Auto proceed shortly after video ends
    setTimeout(() => {
      onVideoComplete();
    }, 1200);
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
    setHasEnded(false);
    setHasError(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black flex flex-col justify-between overflow-hidden z-20 select-none"
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-auto">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="font-display text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase">
              Bannu: The Unknown World
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono-tech text-cyan-400 ml-2">
              SECTOR TRANSMISSION
            </span>
          </div>
        </div>

        {/* Quick Skip / Continue Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playTap();
              onVideoComplete();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400 text-cyan-300 text-xs font-mono-tech font-bold transition-all cursor-pointer backdrop-blur-md"
          >
            <span>CONTINUE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Video Viewport (No Distortion, Responsive Center) */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {/* Actual Video Element */}
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          autoPlay
          onEnded={handleVideoEnded}
          onError={() => {
            setHasError(true);
          }}
          className="w-full h-full max-h-screen object-contain z-10"
        />

        {/* Play/Pause overlay click handler */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
        >
          {!isPlaying && !hasEnded && !hasError && (
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-400 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_#22d3ee] hover:scale-110 transition-transform">
              <Play className="w-9 h-9 text-cyan-300 ml-1" />
            </div>
          )}
        </div>

        {/* Fallback Notice if file fails (Clean, never asks to import) */}
        {hasError && (
          <div className="absolute z-30 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 max-w-md text-center backdrop-blur-md shadow-2xl">
            <h3 className="font-display text-sm font-bold text-cyan-300">
              TRANSMISSION PLAYBACK
            </h3>
            <p className="text-xs text-slate-300 mt-2 mb-4 leading-relaxed font-sans">
              Video playback was interrupted or completed.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleReplay}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-bold text-xs cursor-pointer transition-colors"
              >
                Replay Video
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  onVideoComplete();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech cursor-pointer transition-colors"
              >
                Continue to Adventure
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Minimal Controls (NO Timeline / Scrubber) */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          <button
            onClick={handleReplay}
            className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Replay Video"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-cyan-400" />
            ) : (
              <Maximize className="w-4 h-4 text-slate-200" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playTap();
              onVideoComplete();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-amber-500 text-slate-950 font-display font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all cursor-pointer"
          >
            <span>CONTINUE TO ADVENTURE</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
