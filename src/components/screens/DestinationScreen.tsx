import React, { useState, useEffect } from 'react';
import {
  Camera,
  Package,
  Layers,
  Play,
  Music2,
  Coins,
  Compass,
  Heart,
  CheckCircle2,
  Radio,
  Sliders,
  Volume2,
  Sparkles,
  Search,
  Eye,
  KeyRound,
  ChevronRight,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { AIAssistantDialogue } from '../AIAssistantDialogue';
import { sounds } from '../../utils/audio';
import { CameraSection } from './CameraSection';
import { AmazonSection } from './AmazonSection';
import { CanvaSection } from './CanvaSection';
import { YouTubeSection } from './YouTubeSection';
import { MusicSection } from './MusicSection';
import { PaytmSection } from './PaytmSection';
import { ZooParkSection } from './ZooParkSection';
import { GoogleMapsSection } from './GoogleMapsSection';
import { FriendshipSection } from './FriendshipSection';

interface DestinationScreenProps {
  destination: DestinationConfig;
  isCompleted: boolean;
  onCompleteDestination: (id: DestinationId) => void;
  onContinueNext: () => void;
  nextDestinationName?: string;
  isFinalDestination?: boolean;
}

export const DestinationScreen: React.FC<DestinationScreenProps> = ({
  destination,
  isCompleted,
  onCompleteDestination,
  onContinueNext,
  nextDestinationName,
  isFinalDestination = false,
}) => {
  // Dedicated personalized scenes
  if (destination.id === 'camera') {
    return (
      <CameraSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
      />
    );
  }

  if (destination.id === 'amazon') {
    return (
      <AmazonSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
      />
    );
  }

  if (destination.id === 'canva') {
    return (
      <CanvaSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
      />
    );
  }

  if (destination.id === 'youtube') {
    return (
      <YouTubeSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
      />
    );
  }

  if (destination.id === 'music') {
    return (
      <MusicSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
      />
    );
  }

  if (destination.id === 'paytm') {
    return (
      <PaytmSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
      />
    );
  }

  if (destination.id === 'zoo-park') {
    return (
      <ZooParkSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
      />
    );
  }

  if (destination.id === 'google-maps') {
    return (
      <GoogleMapsSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
      />
    );
  }

  if (destination.id === 'friendship') {
    return (
      <FriendshipSection
        destination={destination}
        isCompleted={isCompleted}
        onCompleteDestination={onCompleteDestination}
        onContinueNext={onContinueNext}
        nextDestinationName={nextDestinationName}
        isFinalDestination={isFinalDestination}
      />
    );
  }

  const [hasInvestigated, setHasInvestigated] = useState(isCompleted);
  const [isDecoding, setIsDecoding] = useState(false);
  const [showCelebrationFlash, setShowCelebrationFlash] = useState(false);

  // If already completed in past session, initialize state to investigated
  useEffect(() => {
    if (isCompleted) {
      setHasInvestigated(true);
    }
  }, [isCompleted]);

  const handleInvestigate = () => {
    sounds.playScan();
    setIsDecoding(true);
    setTimeout(() => {
      setIsDecoding(false);
      setHasInvestigated(true);
      sounds.playTap();
    }, 600);
  };

  const handleDecodeComplete = () => {
    sounds.playDecode();
    setShowCelebrationFlash(true);
    onCompleteDestination(destination.id);

    setTimeout(() => {
      setShowCelebrationFlash(false);
      onContinueNext();
    }, 900);
  };

  // Render distinct custom interactive scene for each destination
  const renderInteractiveScene = () => {
    switch (destination.id) {
      case 'camera':
        return (
          <div className="relative w-full max-w-md aspect-[16/10] rounded-3xl bg-gradient-to-b from-slate-950/80 to-cyan-950/40 border border-cyan-500/40 p-6 flex flex-col items-center justify-between overflow-hidden shadow-[0_0_35px_rgba(34,211,238,0.2)] backdrop-blur-md">
            {/* Viewfinder corner crosshairs */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

            {/* Top scanning HUD */}
            <div className="w-full flex items-center justify-between font-mono-tech text-[11px] text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                OPTICAL SENSOR // RECON
              </span>
              <span>ISO 800 · 1/2000s</span>
            </div>

            {/* Central Optical Lens Aperture with Video Scan Beam */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border border-cyan-400/40 border-dashed animate-spin"
                style={{ animationDuration: '15s' }}
              />
              <div className="absolute inset-3 rounded-full border border-cyan-300/60" />
              <div className="w-20 h-20 rounded-full bg-cyan-900/40 border border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                <Camera className="w-9 h-9 text-cyan-200" />
              </div>
            </div>

            <div className="w-full flex items-center justify-between font-mono-tech text-[10px] text-slate-400">
              <span>FOCAL LENGTH: 35mm</span>
              <span className="text-cyan-400 font-bold">
                {hasInvestigated ? 'ARCHIVE DECODED' : 'AWAITING SCAN'}
              </span>
            </div>
          </div>
        );

      case 'amazon':
        return (
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-slate-900/90 border border-amber-500/40 p-4 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            {/* Sealed Heavy Orbital Container */}
            <div className="relative w-32 h-28 bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-400/60 rounded-xl flex flex-col items-center justify-center p-2 shadow-inner">
              <div className="w-full flex justify-between px-2 text-[9px] font-mono-tech text-amber-400">
                <span>CARGO: PKG-02</span>
                <span>STATUS: {hasInvestigated ? 'RECOVERED' : 'SEALED'}</span>
              </div>
              <div className="my-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-400/40">
                <Package className="w-8 h-8 text-amber-400" />
              </div>
              <div className="w-full h-1 bg-amber-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-3/4 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-amber-400 tracking-wider">
              MAGNETIC SEALS: {hasInvestigated ? 'DISENGAGED' : 'ACTIVE'}
            </div>
          </div>
        );

      case 'canva':
        return (
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-slate-900/90 border border-purple-500/40 p-4 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(192,132,252,0.15)]">
            {/* Holographic Canvas Floating Shapes */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute w-20 h-20 border border-purple-400/50 rotate-12 rounded-lg animate-spin" style={{ animationDuration: '30s' }} />
              <div className="absolute w-16 h-16 border border-pink-400/60 -rotate-45 rounded-lg" />
              <div className="relative w-12 h-12 rounded-full bg-purple-900/50 border border-purple-300 flex items-center justify-center shadow-[0_0_20px_#c084fc]">
                <Layers className="w-6 h-6 text-purple-300" />
              </div>
            </div>
            <div className="mt-2 text-[10px] font-mono-tech text-purple-300 tracking-wider">
              PRISMATIC VECTORS: {hasInvestigated ? 'SYNCHRONIZED' : 'ENCRYPTED'}
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-slate-900/90 border border-rose-500/40 p-4 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(251,113,133,0.15)]">
            {/* Holographic Video Screen */}
            <div className="relative w-36 h-24 rounded-lg bg-black border border-rose-500/60 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-holo-grid opacity-30" />
              {/* Scanline */}
              <div className="absolute inset-x-0 h-0.5 bg-rose-400/70 shadow-[0_0_8px_#fb7185] animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-rose-600/40 border border-rose-400 flex items-center justify-center">
                <Play className="w-5 h-5 text-rose-300 ml-0.5" />
              </div>
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-rose-400 tracking-wider">
              FEED FREQUENCY: {hasInvestigated ? 'BUFFERED' : 'SCANNING'}
            </div>
          </div>
        );

      case 'music':
        return (
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-4 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(52,211,153,0.15)]">
            {/* Harmonic Sound Waves */}
            <div className="relative w-32 h-24 flex items-center justify-center gap-1.5">
              {[18, 36, 52, 28, 44, 60, 32, 22].map((height, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full bg-gradient-to-t from-emerald-600 to-emerald-300 shadow-[0_0_8px_#34d399]"
                  style={{
                    height: hasInvestigated ? `${height}px` : '12px',
                    transition: 'height 0.4s ease',
                  }}
                />
              ))}
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-emerald-400 tracking-wider">
              ACOUSTIC RESONANCE: {hasInvestigated ? 'HARMONIZED' : 'MEASURING'}
            </div>
          </div>
        );

      case 'paytm':
        return (
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-slate-900/90 border border-sky-500/40 p-4 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(56,189,248,0.15)]">
            {/* Holographic Floating Token / Energy Credit */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-sky-400/30 border-dashed animate-spin" style={{ animationDuration: '14s' }} />
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/30 to-blue-900/60 border border-sky-300 flex items-center justify-center shadow-[0_0_20px_#38bdf8]">
                <Coins className="w-8 h-8 text-sky-200" />
              </div>
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-sky-400 tracking-wider">
              QUANTUM CIPHER: {hasInvestigated ? 'DECRYPTED' : 'LOCKED'}
            </div>
          </div>
        );

      case 'zoo-park':
        return (
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-slate-900/90 border border-teal-500/40 p-4 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(45,212,191,0.15)]">
            {/* Radar Bioscanner */}
            <div className="relative w-28 h-28 rounded-full border border-teal-500/40 bg-teal-950/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-radar-grid opacity-30" />
              {/* Radar sweep line */}
              <div className="absolute inset-0 origin-center animate-radar bg-gradient-to-tr from-transparent via-transparent to-teal-400/30" />
              {/* Creature silhouettes markers */}
              <div className="absolute top-6 left-8 w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_6px_#2dd4bf] animate-ping" />
              <div className="absolute bottom-7 right-7 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-teal-400 tracking-wider">
              BIOMASS SIGNATURES: {hasInvestigated ? 'IDENTIFIED' : 'SCANNING'}
            </div>
          </div>
        );

      case 'google-maps':
        return (
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-slate-900/90 border border-blue-500/40 p-4 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(96,165,250,0.15)]">
            {/* Holographic Planetary Coordinates Grid */}
            <div className="relative w-32 h-28 rounded-xl border border-blue-400/40 bg-blue-950/30 p-2 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between text-[8px] font-mono-tech text-blue-300">
                <span>LAT: 44.18° N</span>
                <span>LON: 102.8° E</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center">
                <Compass className="w-8 h-8 text-blue-300 animate-pulse" />
                <div className="absolute w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              </div>
              <div className="text-[8px] font-mono-tech text-cyan-300 text-center">
                WAYPOINT {destination.order} MARKED
              </div>
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-blue-400 tracking-wider">
              PLANETARY GRID: {hasInvestigated ? 'COORDINATES LOCKED' : 'TRIANGULATING'}
            </div>
          </div>
        );

      case 'friendship':
        return (
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-gradient-to-b from-amber-950/50 via-slate-950/90 to-black border border-amber-400/60 p-4 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_35px_rgba(251,191,36,0.25)]">
            {/* Luminous Golden Warm Singularity */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center shadow-[0_0_25px_#fbbf24]">
                <Heart className="w-8 h-8 text-slate-950 fill-current" />
              </div>
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-amber-300 tracking-wider">
              {hasInvestigated ? 'TRUE BEACON REVEALED' : 'SINGULARITY DETECTED'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 select-none overflow-y-auto no-scrollbar z-10">
      {/* Flash overlay upon decoding */}
      {showCelebrationFlash && (
        <div className="absolute inset-0 bg-cyan-400/30 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-500" />
      )}

      {/* Destination Header Banner */}
      <div className="w-full flex items-center justify-between border-b border-cyan-900/40 pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono-tech text-cyan-400">
              SIGNAL #{destination.order} //
            </span>
            <span className="font-display text-sm font-extrabold tracking-wider text-slate-100">
              {destination.name}
            </span>
          </div>
          <span className="text-[10px] font-mono-tech text-slate-400">
            {destination.codename}
          </span>
        </div>

        {/* Completion status badge */}
        <div className="flex items-center gap-1 text-[11px] font-mono-tech">
          {isCompleted ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              DECODED
            </span>
          ) : (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Central Visual Scene */}
      <div className="flex-1 flex flex-col items-center justify-center my-3">
        {renderInteractiveScene()}

        {/* Object description subtext */}
        <p className="text-[11px] text-slate-400 font-sans text-center mt-2.5 max-w-xs leading-normal">
          {destination.objectDescription}
        </p>
      </div>

      {/* AI Assistant Dialogue matching exact instructions */}
      <div className="w-full mb-3">
        <AIAssistantDialogue
          speakerName="AURA // SENSOR LOG"
          message={destination.aiIntroduction}
        />
      </div>

      {/* Revealed Message card after investigation */}
      {hasInvestigated && (
        <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/40 p-4 mb-3 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.1)]">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-mono-tech font-bold text-cyan-300">
              {destination.id === 'friendship'
                ? 'EMOTIONAL INSIGHT'
                : 'SIGNAL ARCHIVE DECODED'}
            </span>
          </div>
          <p
            className={`text-xs ${
              destination.id === 'friendship'
                ? 'text-amber-200 font-serif italic text-sm'
                : 'text-slate-200 font-sans'
            } leading-relaxed`}
          >
            {destination.revealedMessage}
          </p>

          {destination.quoteOrMeaning && (
            <p className="text-[11px] text-amber-300/90 font-sans mt-2 pt-2 border-t border-amber-500/20">
              {destination.quoteOrMeaning}
            </p>
          )}
        </div>
      )}

      {/* Interactive Controls & Progression Buttons strictly following prompt flow */}
      <div className="w-full pt-1 flex flex-col gap-2">
        {!hasInvestigated ? (
          <button
            onClick={handleInvestigate}
            disabled={isDecoding}
            className="w-full h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-[0.98] transition-all cursor-pointer"
          >
            {isDecoding ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>SCANNING FREQUENCY...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>INVESTIGATE SIGNAL</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDecodeComplete}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-display font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(52,211,153,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isFinalDestination ? 'FINAL SIGNAL DECODED' : 'SIGNAL DECODED'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {isCompleted && nextDestinationName && (
          <button
            onClick={onContinueNext}
            className="w-full py-1 text-[11px] font-mono-tech text-slate-400 hover:text-cyan-300 transition-colors text-center"
          >
            Proceed to next destination: {nextDestinationName} →
          </button>
        )}
      </div>
    </div>
  );
};
