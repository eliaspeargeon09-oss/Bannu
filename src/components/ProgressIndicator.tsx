import React from 'react';
import { Check, Lock } from 'lucide-react';
import { DestinationConfig, DestinationId } from '../types/adventure';
import { sounds } from '../utils/audio';

interface ProgressIndicatorProps {
  destinations: DestinationConfig[];
  completedIds: DestinationId[];
  currentId: DestinationId;
  onSelectDestination?: (id: DestinationId) => void;
  isMapUnlocked: boolean;
  compact?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  destinations,
  completedIds,
  currentId,
  onSelectDestination,
  isMapUnlocked,
  compact = false,
}) => {
  const completedCount = completedIds.length;
  const totalCount = destinations.length;

  const handleNodeClick = (dest: DestinationConfig, isUnlocked: boolean) => {
    if (isUnlocked && onSelectDestination) {
      sounds.playTap();
      onSelectDestination(dest.id);
    }
  };

  return (
    <div className="w-full select-none">
      {/* Header text */}
      <div className="flex items-center justify-between text-xs font-mono-tech mb-2">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="font-semibold tracking-wider text-[11px] text-cyan-200">
            EXPLORATION PROGRESS:
          </span>
          <span className="text-cyan-400 font-bold tabular-nums">
            {completedCount}/{totalCount}
          </span>
        </div>

        {isMapUnlocked && (
          <span className="text-[10px] text-amber-300 tracking-wider">
            FREE ROAM ACTIVE
          </span>
        )}
      </div>

      {/* 9 Segmented Progress Bar Nodes */}
      <div className="grid grid-cols-9 gap-1.5 items-center">
        {destinations.map((dest, idx) => {
          const isCompleted = completedIds.includes(dest.id);
          const isCurrent = currentId === dest.id;
          const isUnlocked =
            isMapUnlocked ||
            idx === 0 ||
            completedIds.includes(destinations[idx - 1]?.id);

          return (
            <button
              key={dest.id}
              onClick={() => handleNodeClick(dest, isUnlocked)}
              disabled={!isUnlocked}
              title={`${dest.order}. ${dest.name} (${
                isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'
              })`}
              className={`group relative flex flex-col items-center justify-center transition-all ${
                compact ? 'h-7' : 'h-8'
              } rounded-md border ${
                isCompleted
                  ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-300 hover:border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : isCurrent
                  ? 'bg-amber-950/40 border-amber-400 text-amber-300 animate-pulse-slow'
                  : isUnlocked
                  ? 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  : 'bg-slate-950/40 border-slate-900/80 text-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
              ) : isCurrent ? (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              ) : isUnlocked ? (
                <span className="text-[10px] font-mono-tech font-semibold">
                  {dest.order}
                </span>
              ) : (
                <Lock className="w-3 h-3 text-slate-700" />
              )}

              {/* Destination tooltip badge on desktop hover */}
              <div className="absolute bottom-full mb-1 hidden sm:group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-slate-900 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-lg">
                  {dest.order}. {dest.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
