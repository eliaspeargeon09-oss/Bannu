import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Music2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Heart,
  ChevronRight,
  Maximize,
  CheckCircle2,
  AlertCircle,
  Radio,
  Disc3,
  Sliders,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';

const MUSIC_VIDEO_URL = '/videos/6.mp4';
const MUSIC_IMAGE_URL = '/images/music_piano_lyrics.png';
const MUSIC_AUDIO_URL = '/audio/bannu_song.mp3';

interface MusicSectionProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
}

export const MusicSection: React.FC<MusicSectionProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
  nextDestinationName = 'Paytm',
}) => {
  // Navigation phase: 'video' -> 'transitioning' -> 'music'
  const [phase, setPhase] = useState<'video' | 'transitioning' | 'music'>('video');

  // Video intro refs & state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Audio Player states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(105); // default ~1:45
  const [volume, setVolume] = useState(0.85);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [hasSongEnded, setHasSongEnded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [hasStartedPlayingOnce, setHasStartedPlayingOnce] = useState(false);

  // Video Autoplay handling
  useEffect(() => {
    if (phase !== 'video') return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {
      video.muted = true;
      setIsVideoMuted(true);
      video.play().catch(() => {
        setIsVideoPlaying(false);
      });
    });
  }, [phase]);

  // Handle video progress
  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setVideoProgress((video.currentTime / video.duration) * 100);
  };

  const handleVideoEnded = useCallback(() => {
    setIsVideoPlaying(false);
    sounds.playDecode();
    setPhase('transitioning');
    setTimeout(() => {
      setPhase('music');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  }, []);

  const handleSkipVideo = () => {
    sounds.playTap();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPhase('transitioning');
    setTimeout(() => {
      setPhase('music');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  // Synchronize audio element settings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isAudioMuted ? 0 : volume;
  }, [volume, isAudioMuted]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsAudioPlaying(false);
      setHasSongEnded(true);
      sounds.playCelebration();
    };

    const onError = () => {
      setAudioError(true);
      setIsAudioPlaying(false);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [phase]);

  // Audio Play / Pause toggle
  const toggleAudioPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsAudioPlaying(true);
          setHasStartedPlayingOnce(true);
          sounds.playTap();
        })
        .catch(() => {
          setIsAudioPlaying(false);
        });
    } else {
      audio.pause();
      setIsAudioPlaying(false);
      sounds.playTap();
    }
  };

  // Seeking on progress bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressBarRef.current;
    if (!audio || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = fraction * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isAudioMuted) {
      setIsAudioMuted(false);
    }
  };

  const toggleAudioMute = () => {
    setIsAudioMuted(!isAudioMuted);
    sounds.playTap();
  };

  const handleRestartAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().then(() => {
      setIsAudioPlaying(true);
      setHasSongEnded(false);
    });
    sounds.playTap();
  };

  const handleProceedNext = () => {
    // Stop audio cleanly before transitioning
    if (audioRef.current) {
      audioRef.current.pause();
    }
    sounds.playCelebration();
    onCompleteDestination('music');
    setTimeout(() => {
      onContinueNext();
    }, 450);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start text-slate-100">
      {/* Hidden real audio element */}
      <audio
        ref={audioRef}
        src={MUSIC_AUDIO_URL}
        preload="auto"
      />

      {/* ========================================================================= */}
      {/* PHASE 1: INTRODUCTORY CINEMATIC VIDEO (6.mp4)                            */}
      {/* ========================================================================= */}
      {phase === 'video' && (
        <section className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-black overflow-hidden px-2 sm:px-4 py-16">
          {/* Ambient Acoustic Cyan/Emerald Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Info Bar */}
          <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] shrink-0">
                <Music2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase truncate">
                    MUSIC // SECTOR EPSILON
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p className="text-[9px] sm:text-[10px] font-mono-tech text-emerald-400 truncate">
                  TRANSMISSION 06: ACOUSTIC RESONANCE CORE
                </p>
              </div>
            </div>

            {/* Quick Skip Button */}
            <button
              onClick={handleSkipVideo}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[11px] sm:text-xs font-mono-tech font-bold transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.2)] shrink-0 min-h-[36px]"
            >
              <span className="hidden sm:inline">LISTEN TO SONG</span>
              <span className="sm:hidden">SKIP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Video Viewport */}
          <div className="relative w-full max-w-4xl aspect-video max-h-[72vh] sm:max-h-[80vh] flex items-center justify-center bg-black/95 rounded-xl sm:rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_50px_rgba(52,211,153,0.2)]">
            <video
              ref={videoRef}
              src={MUSIC_VIDEO_URL}
              playsInline
              autoPlay
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.paused) videoRef.current.play();
                  else videoRef.current.pause();
                }
              }}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2 z-20">
              <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-100"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2 sm:gap-3 truncate">
                  <span className="font-mono-tech text-[10px] sm:text-[11px] text-emerald-400 truncate">
                    Entering the Sanctuary of Melody...
                  </span>
                </div>
                <button
                  onClick={handleSkipVideo}
                  className="text-[11px] sm:text-xs font-mono-tech text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                >
                  Skip Intro →
                </button>
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
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)] animate-pulse">
            <Disc3 className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <span className="font-display font-extrabold tracking-widest text-slate-200 uppercase text-sm">
            CALIBRATING ACOUSTIC RESONANCE...
          </span>
          <span className="font-mono-tech text-xs text-emerald-400">
            LOADING BANNU'S ORIGINAL COMPOSITION
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3: MAIN MUSIC SCENE ("HIS SONG, HIS MOMENT")                         */}
      {/* ========================================================================= */}
      {phase === 'music' && (
        <section className="relative w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 flex flex-col items-center gap-6 sm:gap-8 animate-fade-in">
          {/* Subtle Floating Ambient Musical Sparkles */}
          <div className="absolute top-10 left-8 text-cyan-400/30 text-xl select-none animate-float pointer-events-none">
            ♩
          </div>
          <div
            className="absolute top-24 right-12 text-amber-300/30 text-2xl select-none animate-float pointer-events-none"
            style={{ animationDelay: '1.2s' }}
          >
            ♫
          </div>
          <div
            className="absolute bottom-28 left-16 text-emerald-400/30 text-xl select-none animate-float pointer-events-none"
            style={{ animationDelay: '2s' }}
          >
            ♬
          </div>

          {/* Sector Header Banner */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-cyan-950/50 border border-emerald-500/30 p-3.5 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 backdrop-blur-md shadow-[0_0_30px_rgba(52,211,153,0.12)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 flex items-center justify-center text-white shadow-[0_0_20px_rgba(52,211,153,0.4)] shrink-0">
                <Music2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-extrabold text-base sm:text-lg md:text-xl text-white tracking-wide">
                    SECTOR EPSILON // HIS SONG, HIS MOMENT
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] sm:text-[10px] font-mono-tech text-emerald-300 uppercase">
                    Acoustic Core
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-mono-tech text-slate-400 truncate">
                  AN ORIGINAL COMPOSITION WRITTEN & SUNG BY BANNU
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playTap();
                setPhase('video');
              }}
              className="self-start sm:self-auto min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono-tech transition-colors cursor-pointer shrink-0"
            >
              Replay Intro
            </button>
          </div>

          {/* ========================================================================= */}
          {/* STEP 1: CINEMATIC ARTWORK CENTERPIECE (PIANO & LYRICS)                    */}
          {/* ========================================================================= */}
          <div className="relative w-full flex flex-col items-center">
            {/* Ambient Backlight Glow around Artwork */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500/15 via-cyan-500/20 to-purple-500/15 blur-2xl opacity-75 pointer-events-none" />

            <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-cyan-400/30 bg-slate-950 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              {/* Preserves original aspect ratio without cropping lyrics or hands */}
              <img
                src={MUSIC_IMAGE_URL}
                alt="Bannu's Original Song: A boy playing piano with glowing musical lyrics"
                className="w-full h-auto object-contain block max-h-[55vh] sm:max-h-[68vh] md:max-h-[72vh] mx-auto select-none"
              />

              {/* Discreet Floating Atmosphere Badge */}
              <div className="absolute top-3 left-3 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono-tech text-cyan-300">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAudioPlaying ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                <span>{isAudioPlaying ? 'NOW PLAYING' : 'AUDIO READY'}</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP 2: TASTEFUL INTEGRATED MUSIC PLAYER                                  */}
          {/* ========================================================================= */}
          <div className="w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-slate-950/85 border border-cyan-500/40 p-4 sm:p-5 md:p-7 shadow-[0_0_40px_rgba(6,182,212,0.2)] backdrop-blur-xl flex flex-col gap-4 sm:gap-5">
            {/* Song Meta + Equalizer Animation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Rotating Vinyl Icon */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-900 to-slate-900 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0 ${
                    isAudioPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '6s' }}
                >
                  <Disc3 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-black text-base sm:text-lg md:text-xl text-white tracking-wide truncate">
                    A Song by Bannu
                  </h3>
                  <p className="font-mono-tech text-[11px] sm:text-xs text-cyan-300/90 truncate">
                    Original Composition • Converted High Fidelity Master
                  </p>
                </div>
              </div>

              {/* Dynamic Equalizer Visualizer Bars */}
              <div className="flex items-end gap-1 h-6 sm:h-7 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 self-start sm:self-auto shrink-0">
                {[60, 100, 45, 80, 95, 40, 75, 90, 50].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isAudioPlaying
                        ? 'bg-gradient-to-t from-cyan-500 to-emerald-400'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      height: isAudioPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 0.9 : 1.1)))}%` : '20%',
                      animation: isAudioPlaying ? `pulse 0.8s ease-in-out infinite alternate ${i * 0.1}s` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Scrubbable Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div
                ref={progressBarRef}
                onClick={handleSeek}
                className="group relative w-full h-3 bg-slate-900 rounded-full overflow-hidden cursor-pointer border border-slate-800"
                role="slider"
                aria-label="Audio scrubber"
                aria-valuenow={currentTime}
                aria-valuemin={0}
                aria-valuemax={duration}
              >
                {/* Active progress */}
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-300 rounded-full transition-all duration-100 relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Scrubber thumb */}
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Time Indicators */}
              <div className="w-full flex items-center justify-between text-xs font-mono-tech text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                {/* Large Play / Pause button */}
                <button
                  onClick={toggleAudioPlay}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 hover:from-cyan-300 hover:to-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.5)] active:scale-95 transition-all cursor-pointer shrink-0"
                  aria-label={isAudioPlaying ? 'Pause song' : 'Play song'}
                >
                  {isAudioPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current stroke-[2.5]" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current stroke-[2.5] ml-0.5" />
                  )}
                </button>

                {/* Restart Button */}
                <button
                  onClick={handleRestartAudio}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  title="Replay from start"
                  aria-label="Restart song"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAudioMute}
                  className="min-h-[44px] min-w-[44px] p-2 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  aria-label={isAudioMuted ? 'Unmute' : 'Mute'}
                >
                  {isAudioMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isAudioMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  aria-label="Volume slider"
                />
              </div>
            </div>

            {/* Error notice if playback failed */}
            {audioError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Audio stream unavailable. Ensure `/audio/bannu_song.mp3` is loaded.</span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* STEP 4: HEARTFELT ENDING MESSAGE                                          */}
          {/* Displays after song finishes, or user can toggle/enjoy at any time        */}
          {/* ========================================================================= */}
          {(hasSongEnded || hasStartedPlayingOnce) && (
            <div className="w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-950/90 via-slate-900/90 to-amber-950/40 border-2 border-amber-400/40 p-4 sm:p-6 md:p-8 shadow-[0_0_40px_rgba(251,191,36,0.15)] flex flex-col items-center text-center gap-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mb-1">
                <Heart className="w-6 h-6 fill-amber-400/40 text-amber-300" />
              </div>

              {/* Exact required text: */}
              <div className="flex flex-col gap-2 max-w-xl">
                <p className="font-display font-semibold text-sm sm:text-base md:text-lg text-slate-200">
                  "Some people create videos. Some people create memories."
                </p>
                <p className="font-display font-semibold text-sm sm:text-base md:text-lg text-slate-200">
                  "And some people turn their feelings into music."
                </p>
                <p className="font-display font-black text-base sm:text-lg md:text-xl text-amber-300 mt-2">
                  "Keep creating, Bannu. Your gift is worth sharing. ❤️"
                </p>
              </div>

              {/* Continue to Next Adventure Sector */}
              <div className="pt-3 sm:pt-4 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleRestartAudio}
                  className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono-tech text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Replay Song</span>
                </button>

                <button
                  onClick={handleProceedNext}
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-display font-extrabold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(34,211,238,0.4)] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>CONTINUE ADVENTURE</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
