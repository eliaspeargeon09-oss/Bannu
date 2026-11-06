import React from 'react';
import { ShieldCheck, Compass, Sparkles, Radio, ChevronRight } from 'lucide-react';
import { AIAssistantDialogue } from '../AIAssistantDialogue';
import { sounds } from '../../utils/audio';

interface MissionBriefingScreenProps {
  onBeginMission: () => void;
}

export const MissionBriefingScreen: React.FC<MissionBriefingScreenProps> = ({
  onBeginMission,
}) => {
  const handleBegin = () => {
    sounds.playTap();
    onBeginMission();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-y-auto no-scrollbar z-10">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono-tech text-xs tracking-wider text-cyan-300 uppercase">
            Holographic Link // Online
          </span>
        </div>
        <span className="text-[10px] font-mono-tech text-slate-400">
          VESSEL: ODYSSEY-9
        </span>
      </div>

      {/* Futuristic Holographic AI Core Orb Animation */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Orbital Outer Rings */}
          <div
            className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed animate-spin"
            style={{ animationDuration: '24s' }}
          />
          <div
            className="absolute inset-3 rounded-full border border-amber-500/30 animate-spin"
            style={{ animationDuration: '16s', animationDirection: 'reverse' }}
          />
          <div
            className="absolute inset-8 rounded-full border border-cyan-400/40 animate-spin"
            style={{ animationDuration: '10s' }}
          />

          {/* Core Energy Hologram Sphere */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600/40 via-cyan-400/30 to-amber-400/30 backdrop-blur-md border border-cyan-400/80 shadow-[0_0_35px_rgba(34,211,238,0.35)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-holo-grid opacity-30" />
            <div className="w-12 h-12 rounded-full bg-cyan-300/40 blur-md animate-pulse" />
            <div className="w-6 h-6 rounded-full bg-cyan-100 shadow-[0_0_12px_#ffffff]" />
          </div>

          {/* Telemetry Radar Data Nodes */}
          <div className="absolute top-2 left-6 px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-[9px] font-mono-tech text-cyan-300">
            SIG: 9 DETECTED
          </div>
          <div className="absolute bottom-2 right-4 px-1.5 py-0.5 rounded bg-black/60 border border-amber-500/30 text-[9px] font-mono-tech text-amber-300">
            ATM: STABLE
          </div>
        </div>

        {/* AI Dialogue Box matching exact prompt copy */}
        <div className="w-full mt-4">
          <AIAssistantDialogue
            speakerName="AURA // SPACESHIP AI ASSISTANT"
            message="Captain Bannu, our systems have detected nine unusual signals across this planet. Their origins remain unknown. I recommend investigating them in sequence."
          />
        </div>
      </div>

      {/* Mission Objective Card */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 p-4 mb-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1 text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <h2 className="font-display text-xs font-bold tracking-wider">
            MISSION OBJECTIVE
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Investigate all nine signals to unlock the complete exploration map.
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="w-full pt-1">
        <button
          onClick={handleBegin}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-amber-500 text-slate-950 font-display font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span>BEGIN MISSION</span>
          <ChevronRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
