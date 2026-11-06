import React from 'react';
import { Sparkles, Cake, ChevronRight, Star } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface CelebrationTransitionScreenProps {
  onEnterCelebration: () => void;
}

export const CelebrationTransitionScreen: React.FC<CelebrationTransitionScreenProps> = ({
  onEnterCelebration,
}) => {
  const handleEnter = () => {
    sounds.playCelebration();
    onEnterCelebration();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-y-auto no-scrollbar z-10 bg-black/90 text-center">
      {/* Top Telemetry */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="font-mono-tech text-[11px] tracking-widest text-amber-300 uppercase">
          PLANETARY PHASE 01 COMPLETE
        </span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      </div>

      {/* Center Cinematic Transition Block */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        {/* Glowing Nebula Singularity with Starburst */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 via-rose-500/20 to-purple-500/30 blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-950/60 to-purple-950/80 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.3)]">
            <Star className="w-12 h-12 text-amber-300 fill-amber-300/40 animate-pulse" />
          </div>
          {/* Orbital stardust rings */}
          <div className="absolute inset-2 rounded-full border border-amber-300/20 border-dashed animate-spin" style={{ animationDuration: '30s' }} />
        </div>

        {/* Cinematic Title & Message strictly matching prompt */}
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-100 uppercase drop-shadow-lg mb-4">
          MISSION COMPLETE
        </h1>

        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-5" />

        <p className="text-sm sm:text-base font-serif italic text-amber-100/90 max-w-xs leading-relaxed tracking-wide">
          "BUT YOUR MOST IMPORTANT DISCOVERY IS STILL WAITING..."
        </p>

        <p className="text-[11px] font-sans text-slate-400 mt-4 max-w-xs">
          Beyond the crashed starship and unknown horizons lies a milestone made just for you, Captain.
        </p>
      </div>

      {/* Primary Action Button: ENTER CELEBRATION */}
      <div className="w-full pb-2">
        <button
          onClick={handleEnter}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-display font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_45px_rgba(251,191,36,0.6)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Cake className="w-4 h-4 stroke-[2.5]" />
          <span>ENTER CELEBRATION</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
