import React, { useState, useEffect } from 'react';
import { Bot, Radio } from 'lucide-react';

interface AIAssistantDialogueProps {
  message: string;
  speakerName?: string;
  onFinishedTyping?: () => void;
  interactive?: boolean;
}

export const AIAssistantDialogue: React.FC<AIAssistantDialogueProps> = ({
  message,
  speakerName = 'AURA // SYSTEM AI',
  onFinishedTyping,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsDone(true);
        if (onFinishedTyping) onFinishedTyping();
      }
    }, 18);

    return () => clearInterval(interval);
  }, [message, onFinishedTyping]);

  const handleSkipTyping = () => {
    if (!isDone) {
      setDisplayedText(message);
      setIsDone(true);
      if (onFinishedTyping) onFinishedTyping();
    }
  };

  return (
    <div
      onClick={handleSkipTyping}
      className="relative w-full rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(34,211,238,0.05)] backdrop-blur-md cursor-pointer transition-all hover:border-cyan-500/50"
    >
      {/* Top AI Indicator row */}
      <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          {/* Animated Holographic Core Mini-Orb */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-400/60 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </div>
          <span className="font-mono-tech text-[11px] font-bold tracking-wider text-cyan-300">
            {speakerName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-cyan-400/70">
          <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
          <span>TRANSMISSION ACTIVE</span>
        </div>
      </div>

      {/* Spoken Message Body */}
      <div className="text-sm text-slate-100 font-sans leading-relaxed tracking-wide min-h-[44px]">
        <span>{displayedText}</span>
        {!isDone && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
        )}
      </div>

      {/* Subtle skip prompt */}
      {!isDone && (
        <div className="text-[10px] font-mono-tech text-slate-500 text-right mt-1.5">
          Tap to reveal all
        </div>
      )}
    </div>
  );
};
