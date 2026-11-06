import React from 'react';
import { Compass, Sparkles, ChevronRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface OpeningScreenProps {
  onStartExploration: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onStartExploration }) => {
  const handleStart = () => {
    sounds.playTap();
    onStartExploration();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-y-auto no-scrollbar z-10">
      {/* Top Telemetry Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span className="text-[11px] font-mono-tech tracking-wider text-cyan-300 uppercase">
            Telemetry Stream // Sector 7
          </span>
        </div>
        <span className="text-[10px] font-mono-tech text-slate-400">
          STARDATE 2026.10
        </span>
      </div>

      {/* Center Cinematic Scene: Bannu standing in spacesuit viewed from behind looking at the alien vista */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-4">
        {/* Visual Scene Box */}
        <div className="relative w-full max-w-xs aspect-[4/5] rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col items-center justify-end p-4">
          {/* Sky background with dual planetary moons & rings */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#091b2c] to-[#040811]">
            {/* Upper celestial ring */}
            <div className="absolute -top-12 -right-8 w-48 h-48 rounded-full border border-cyan-400/20" />
            <div className="absolute -top-10 -right-6 w-44 h-44 rounded-full border border-cyan-300/10" />

            {/* Glowing moon */}
            <div className="absolute top-8 right-10 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-200 to-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.5)] opacity-80" />

            {/* Distant crashed starship smoke plumes */}
            <div className="absolute top-24 left-6 w-32 h-20 opacity-70">
              {/* Starship hull silhouette resting diagonally */}
              <svg viewBox="0 0 160 80" className="w-full h-full text-slate-800">
                <path
                  d="M10,60 L90,15 L145,25 L155,40 L100,55 L35,65 Z"
                  fill="#0f1f33"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                />
                <circle cx="85" cy="28" r="3" fill="#f59e0b" opacity="0.8" />
                <path
                  d="M85,25 Q95,10 90,0 Q80,10 85,25"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </svg>
            </div>

            {/* Spire Mountains Silhouette */}
            <svg
              className="absolute bottom-16 left-0 right-0 w-full h-28 opacity-40"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
            >
              <polygon points="0,120 40,50 80,120" fill="#081422" />
              <polygon points="60,120 120,30 180,120" fill="#0c1b2c" />
              <polygon points="150,120 220,60 290,120" fill="#07121e" />
              <polygon points="260,120 340,40 400,120" fill="#0a192a" />
            </svg>

            {/* Glowing planetary dust embers */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
          </div>

          {/* Bannu: Futuristic Spacesuit Silhouette viewed from behind standing on rock ridge */}
          <div className="relative z-10 flex flex-col items-center">
            <svg
              viewBox="0 0 120 180"
              className="w-32 h-48 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
            >
              {/* Rocky platform Bannu stands on */}
              <path
                d="M5,175 Q60,160 115,175 L120,180 L0,180 Z"
                fill="#070d17"
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Legs / Boots */}
              <path
                d="M38,130 L35,168 L48,172 L50,132"
                fill="#e2e8f0"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <path
                d="M68,132 L70,172 L83,168 L80,130"
                fill="#e2e8f0"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              {/* Boot soles & copper trim */}
              <rect x="33" y="165" width="16" height="6" rx="2" fill="#0f172a" />
              <rect x="69" y="165" width="16" height="6" rx="2" fill="#0f172a" />
              <line x1="36" y1="145" x2="48" y2="145" stroke="#f59e0b" strokeWidth="2" />
              <line x1="70" y1="145" x2="82" y2="145" stroke="#f59e0b" strokeWidth="2" />

              {/* Torso & Suit Back */}
              <path
                d="M36,65 L32,125 L86,125 L82,65 Z"
                fill="#f8fafc"
                stroke="#334155"
                strokeWidth="2"
              />
              {/* Life support backpack */}
              <rect
                x="42"
                y="68"
                width="34"
                height="46"
                rx="6"
                fill="#1e293b"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              {/* Cyan oxygen power core indicator */}
              <circle cx="59" cy="88" r="5" fill="#22d3ee" className="animate-pulse" />
              <rect x="46" y="102" width="26" height="4" rx="2" fill="#f59e0b" />

              {/* Arms (Resting by sides, looking outward) */}
              <path
                d="M34,68 L25,108 L28,124 L34,124 L36,75"
                fill="#cbd5e1"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <path
                d="M84,68 L93,108 L90,124 L84,124 L82,75"
                fill="#cbd5e1"
                stroke="#1e293b"
                strokeWidth="1.5"
              />

              {/* Helmet (Viewed from back, sleek explorer visor reflection glow) */}
              <ellipse
                cx="59"
                cy="44"
                rx="21"
                ry="23"
                fill="#f1f5f9"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse
                cx="59"
                cy="42"
                rx="15"
                ry="17"
                fill="#0f172a"
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              {/* Antenna / communication node */}
              <line x1="75" y1="36" x2="82" y2="28" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="82" cy="28" r="2" fill="#22d3ee" />
            </svg>
          </div>

          {/* Scanner beam overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cyan-950/80 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Typography & Mission Briefing Header */}
      <div className="flex flex-col items-center text-center my-2">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-amber-200 uppercase drop-shadow-md">
          WELCOME TO THE UNKNOWN
        </h1>

        <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-amber-400 my-2.5 rounded-full" />

        {/* Status Metadata strictly matching prompt specifications */}
        <div className="flex flex-col gap-1 text-[11px] font-mono-tech text-slate-300">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-slate-400">MISSION STATUS:</span>
            <span className="text-amber-400 font-bold">EXPLORATION MODE</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-slate-400">LOCATION:</span>
            <span className="text-cyan-300 font-medium">UNKNOWN PLANET</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="text-slate-400">OBJECTIVE:</span>
            <span className="text-emerald-400 font-medium">
              INVESTIGATE NINE MYSTERIOUS SIGNALS
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="w-full pt-3">
        <button
          onClick={handleStart}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-amber-500 text-slate-950 font-display font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span>INITIALIZE EXPLORATION</span>
          <ChevronRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
