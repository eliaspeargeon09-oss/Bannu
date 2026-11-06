import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, CheckCircle2, ChevronRight, Shield, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface BirthdayInitScreenProps {
  onComplete: () => void;
}

const MESSAGES = [
  'Starting birthday protocol...',
  'Preparing your surprise...',
  'Loading memories...',
  'Birthday mission ready.',
];

export const BirthdayInitScreen: React.FC<BirthdayInitScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const enterFullscreen = () => {
    try {
      const elem = document.documentElement as any;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } catch {
      // Browser permissions or mobile fallbacks
    }
  };

  const handleProceed = () => {
    sounds.playTap();
    enterFullscreen();
    onComplete();
  };

  useEffect(() => {
    sounds.playScan();

    const timers = [
      setTimeout(() => {
        setCurrentStep(1);
        sounds.playTap();
      }, 700),
      setTimeout(() => {
        setCurrentStep(2);
        sounds.playTap();
      }, 1500),
      setTimeout(() => {
        setCurrentStep(3);
        sounds.playTap();
      }, 2300),
      setTimeout(() => {
        setCurrentStep(4);
        setIsReady(true);
        sounds.playDecode();
      }, 3100),
      setTimeout(() => {
        // Fallback auto-transition after plenty of time to read
        handleProceed();
      }, 12000),
    ];

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [onComplete]);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between p-6 md:p-12 z-20 overflow-hidden bg-[#040812]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono-tech text-xs tracking-widest text-cyan-300 uppercase">
            System Initialization // Stardate 2026.10
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-400">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>SECURITY LEVEL: MAXIMUM</span>
        </div>
      </div>

      {/* Central Initialization Core */}
      <div className="flex-1 flex flex-col items-center justify-center my-8 max-w-xl mx-auto w-full text-center">
        {/* Holographic Glowing Energy Core */}
        <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center mb-8">
          <div
            className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed animate-spin"
            style={{ animationDuration: '18s' }}
          />
          <div
            className="absolute inset-3 rounded-full border border-cyan-400/20 animate-spin"
            style={{ animationDuration: '12s', animationDirection: 'reverse' }}
          />
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cyan-950/60 border border-cyan-400/80 flex items-center justify-center shadow-[0_0_35px_rgba(34,211,238,0.4)] backdrop-blur-md">
            <Zap className="w-8 h-8 md:w-10 md:h-10 text-cyan-300 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <span className="text-xs font-mono-tech tracking-widest text-amber-400 uppercase mb-1 block">
            CLASSIFIED MISSION FOR CAPTAIN BANNU
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-amber-200 uppercase drop-shadow-lg">
            INITIALIZING BIRTHDAY EXPERIENCE...
          </h1>
        </div>

        {/* Progressive System Console Messages */}
        <div className="w-full max-w-md rounded-2xl bg-slate-950/80 border border-cyan-500/30 p-5 backdrop-blur-md shadow-2xl text-left font-mono-tech text-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONSOLE STREAM</span>
          </div>

          {MESSAGES.map((msg, index) => {
            const isDone = currentStep > index;
            const isCurrent = currentStep === index;

            if (currentStep < index) return null;

            return (
              <div
                key={index}
                className={`flex items-center justify-between transition-all duration-300 ${
                  isCurrent ? 'text-cyan-300 animate-pulse' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-500">&gt;</span>
                  <span>{msg}</span>
                </div>
                {isDone && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
              </div>
            );
          })}

          {isReady && (
            <div className="pt-2 border-t border-cyan-900/40 text-center font-display font-bold text-sm tracking-wider text-emerald-400 flex items-center justify-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>ALL SYSTEMS READY</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between border-t border-cyan-900/30 pt-4 max-w-xl mx-auto w-full">
        <span className="text-[11px] font-mono-tech text-slate-400">
          Entering video feed...
        </span>

        <button
          onClick={handleProceed}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-mono-tech font-bold transition-all cursor-pointer ${
            isReady
              ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.7)] animate-pulse scale-105'
              : 'bg-cyan-600/30 hover:bg-cyan-600/50 border-cyan-400 text-cyan-300'
          }`}
        >
          <span>PROCEED TO VIDEO</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
