import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  Film,
  RotateCcw,
  Sparkles,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { DestinationConfig, ScreenType } from '../types/adventure';
import { sounds } from '../utils/audio';

interface CinematicTopNavProps {
  currentScreen: ScreenType;
  currentDestination?: DestinationConfig;
  onNavigateBack?: () => void;
  onReplayVideo?: () => void;
  onOpenMap?: () => void;
  onResetProgress?: () => void;
  isMapUnlocked: boolean;
}

export const CinematicTopNav: React.FC<CinematicTopNavProps> = ({
  currentScreen,
  currentDestination,
  onNavigateBack,
  onReplayVideo,
  onOpenMap,
  onResetProgress,
  isMapUnlocked,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showDevModal, setShowDevModal] = useState(false);

  const toggleSound = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
    if (!next) sounds.playTap();
  };

  const showBack =
    currentScreen === 'destination' ||
    currentScreen === 'exploration-map' ||
    currentScreen === 'birthday-cake';

  return (
    <header className="relative w-full z-40 px-4 md:px-8 py-3.5 flex items-center justify-between bg-slate-950/70 border-b border-cyan-900/30 backdrop-blur-md">
      {/* Left: Back affordance or Mission Badge */}
      <div className="flex items-center gap-3">
        {showBack && onNavigateBack && (
          <button
            onClick={() => {
              sounds.playTap();
              onNavigateBack();
            }}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Return"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="font-display text-xs md:text-sm font-bold tracking-wider text-slate-100">
              BANNU
            </span>
            <span className="text-[10px] font-mono-tech text-amber-400 font-semibold tracking-wider">
              BIRTHDAY MISSION
            </span>
          </div>

          {currentDestination && currentScreen === 'destination' && (
            <span className="text-[10px] font-mono-tech text-cyan-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>
                {currentDestination.order}. {currentDestination.name}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Replay Intro Video Button */}
        {onReplayVideo && (
          <button
            onClick={() => {
              sounds.playTap();
              onReplayVideo();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 text-xs font-mono-tech transition-colors cursor-pointer"
            title="Replay Introductory Video"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Intro Video</span>
          </button>
        )}

        {/* Planetary Map shortcut */}
        {isMapUnlocked && onOpenMap && currentScreen !== 'exploration-map' && (
          <button
            onClick={() => {
              sounds.playTap();
              onOpenMap();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-400/50 text-cyan-300 text-xs font-mono-tech font-semibold transition-colors cursor-pointer"
            title="Open Exploration Map"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Map</span>
          </button>
        )}

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Dev Reset */}
        {onResetProgress && (
          <button
            onClick={() => setShowDevModal(true)}
            className="w-9 h-9 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-colors cursor-pointer"
            title="Restart Experience"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dev Reset Modal */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-xs w-full shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-display text-sm font-bold">RESET ADVENTURE</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              Restart the birthday experience from the initialization sequence and intro video?
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowDevModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onResetProgress) onResetProgress();
                  setShowDevModal(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Restart Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
