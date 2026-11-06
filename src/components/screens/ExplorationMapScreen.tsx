import React, { useState, useId } from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  ChevronRight,
  Cake,
  CheckCircle2,
  Lock,
  Globe2,
  Radio,
  Eye,
  Camera,
  Package,
  Layers,
  Play,
  Music2,
  Coins,
  Trees,
  Navigation,
  Heart,
  Satellite,
  Info,
  X,
  Volume2,
} from 'lucide-react';
import { DestinationConfig, DestinationId } from '../../types/adventure';
import { sounds } from '../../utils/audio';

interface ExplorationMapScreenProps {
  destinations: DestinationConfig[];
  completedIds: DestinationId[];
  onSelectDestination: (id: DestinationId) => void;
  onContinueToCelebration: () => void;
}

// Fixed harmonic coordinates (viewBox 0 0 1000 680)
// Designed in exact sequential order with ample spacing and an ascending central convergence
interface PlanetPosition {
  id: DestinationId;
  order: number;
  x: number;
  y: number;
  color: string;
  glowColor: string;
  radius: number;
  labelOffsetY: number;
}

const PLANET_POSITIONS: Record<DestinationId, PlanetPosition> = {
  camera: {
    id: 'camera',
    order: 1,
    x: 130,
    y: 160,
    color: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.45)',
    radius: 32,
    labelOffsetY: 46,
  },
  amazon: {
    id: 'amazon',
    order: 2,
    x: 270,
    y: 310,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    radius: 32,
    labelOffsetY: 46,
  },
  canva: {
    id: 'canva',
    order: 3,
    x: 430,
    y: 150,
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    radius: 32,
    labelOffsetY: 46,
  },
  youtube: {
    id: 'youtube',
    order: 4,
    x: 640,
    y: 210,
    color: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.45)',
    radius: 32,
    labelOffsetY: 46,
  },
  music: {
    id: 'music',
    order: 5,
    x: 870,
    y: 160,
    color: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    radius: 32,
    labelOffsetY: 46,
  },
  paytm: {
    id: 'paytm',
    order: 6,
    x: 860,
    y: 470,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    radius: 32,
    labelOffsetY: 46,
  },
  'zoo-park': {
    id: 'zoo-park',
    order: 7,
    x: 670,
    y: 560,
    color: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.45)',
    radius: 32,
    labelOffsetY: 46,
  },
  'google-maps': {
    id: 'google-maps',
    order: 8,
    x: 310,
    y: 560,
    color: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.45)',
    radius: 32,
    labelOffsetY: 46,
  },
  friendship: {
    id: 'friendship',
    order: 9,
    x: 490,
    y: 370,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.65)',
    radius: 44, // Special centerpiece world
    labelOffsetY: 56,
  },
};

// Smooth cubic Bezier segments connecting 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9
const ROUTE_SEGMENTS = [
  // 1 -> 2
  'M 130 160 C 160 250, 200 310, 270 310',
  // 2 -> 3
  'M 270 310 C 330 310, 360 170, 430 150',
  // 3 -> 4
  'M 430 150 C 490 130, 570 180, 640 210',
  // 4 -> 5
  'M 640 210 C 700 240, 790 140, 870 160',
  // 5 -> 6
  'M 870 160 C 940 180, 930 420, 860 470',
  // 6 -> 7
  'M 860 470 C 800 520, 740 560, 670 560',
  // 7 -> 8
  'M 670 560 C 550 560, 440 560, 310 560',
  // 8 -> 9 (Ascends to Friendship Core)
  'M 310 560 C 220 540, 350 390, 490 370',
];

const FULL_ORBITAL_PATH = ROUTE_SEGMENTS.join(' ');

// Stardust background star generator
const BACKGROUND_STARS = Array.from({ length: 48 }, (_, i) => ({
  cx: (i * 73 + 19) % 980 + 10,
  cy: (i * 97 + 37) % 660 + 10,
  r: (i % 5 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.8),
  opacity: 0.25 + (i % 7) * 0.1,
}));

export const ExplorationMapScreen: React.FC<ExplorationMapScreenProps> = ({
  destinations,
  completedIds,
  onSelectDestination,
  onContinueToCelebration,
}) => {
  const [selectedDestId, setSelectedDestId] = useState<DestinationId>(
    destinations[0]?.id || 'camera'
  );
  const [hoveredDestId, setHoveredDestId] = useState<DestinationId | null>(null);
  const [isAuraOpen, setIsAuraOpen] = useState(true);

  const selectedDest =
    destinations.find((d) => d.id === selectedDestId) || destinations[0];

  const allCompleted = completedIds.length >= 9;

  const handleNodeClick = (id: DestinationId) => {
    sounds.playTap();
    setSelectedDestId(id);
  };

  const handleOpenSelected = () => {
    sounds.playTap();
    onSelectDestination(selectedDestId);
  };

  const handleCelebrate = () => {
    sounds.playCelebration();
    onContinueToCelebration();
  };

  // Render miniature planetary illustration for each world
  const renderPlanetIllustration = (destId: DestinationId, isSelected: boolean) => {
    switch (destId) {
      // 01: CAMERA - Optical Lens World
      case 'camera':
        return (
          <g>
            {/* Dual Sensor Brackets */}
            <circle cx="0" cy="0" r="38" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="6 6" opacity="0.6" className="animate-spin-slow" />
            <circle cx="0" cy="0" r="30" fill="url(#grad-camera)" stroke="#22d3ee" strokeWidth="1.5" />
            {/* Aperture blades & Lens Core */}
            <circle cx="0" cy="0" r="18" fill="#042f2e" stroke="#67e8f9" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="10" fill="#22d3ee" fillOpacity="0.4" />
            <circle cx="-3" cy="-3" r="3.5" fill="#ffffff" fillOpacity="0.8" />
            {/* Viewfinder crosshairs */}
            <line x1="-24" y1="0" x2="-18" y2="0" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="18" y1="0" x2="24" y2="0" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="0" y1="-24" x2="0" y2="-18" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="0" y1="18" x2="0" y2="24" stroke="#22d3ee" strokeWidth="1.5" />
          </g>
        );

      // 02: AMAZON - Orbital Cargo Spire
      case 'amazon':
        return (
          <g>
            {/* Golden Logistics Docking Ring */}
            <ellipse cx="0" cy="0" rx="40" ry="16" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="5 3" transform="rotate(-20)" opacity="0.7" className="animate-spin-slow" />
            <circle cx="0" cy="0" r="30" fill="url(#grad-amazon)" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Cargo Hexagon Spire */}
            <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="#451a03" stroke="#fbbf24" strokeWidth="1.2" />
            <rect x="-6" y="-6" width="12" height="12" fill="#f59e0b" rx="2" />
            {/* Magnetic tractor beam */}
            <line x1="0" y1="16" x2="0" y2="28" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="2 2" />
          </g>
        );

      // 03: CANVA - Prismatic Creative Colony
      case 'canva':
        return (
          <g>
            {/* Rotating Prismatic Diamonds */}
            <rect x="-24" y="-24" width="48" height="48" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 4" transform="rotate(45)" opacity="0.6" className="animate-spin-slow" />
            <circle cx="0" cy="0" r="30" fill="url(#grad-canva)" stroke="#c084fc" strokeWidth="1.5" />
            {/* Prismatic layers */}
            <polygon points="0,-18 16,10 -16,10" fill="#701a75" fillOpacity="0.7" stroke="#e879f9" strokeWidth="1.2" />
            <polygon points="0,18 -16,-10 16,-10" fill="#581c87" fillOpacity="0.6" stroke="#c084fc" strokeWidth="1" />
            <circle cx="0" cy="0" r="6" fill="#f472b6" />
          </g>
        );

      // 04: YOUTUBE - Media Broadcast Array
      case 'youtube':
        return (
          <g>
            {/* Broadcasting wave pulses */}
            <circle cx="0" cy="0" r="39" fill="none" stroke="#fb7185" strokeWidth="1" opacity="0.4" strokeDasharray="8 6" className="animate-pulse" />
            <circle cx="0" cy="0" r="30" fill="url(#grad-youtube)" stroke="#fb7185" strokeWidth="1.5" />
            {/* Holographic TV Screen */}
            <rect x="-18" y="-13" width="36" height="26" rx="6" fill="#1c1917" stroke="#f43f5e" strokeWidth="1.5" />
            {/* Play Vector Triangle */}
            <polygon points="-4,-7 7,0 -4,7" fill="#ffffff" />
          </g>
        );

      // 05: MUSIC - Acoustic Resonance Sphere
      case 'music':
        return (
          <g>
            {/* Radial Sound Waves */}
            <circle cx="0" cy="0" r="40" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" className="animate-spin-reverse-slow" />
            <circle cx="0" cy="0" r="30" fill="url(#grad-music)" stroke="#34d399" strokeWidth="1.5" />
            {/* Frequency bars around the core */}
            {[-12, -6, 0, 6, 12].map((bx, i) => (
              <line
                key={i}
                x1={bx}
                y1={-[7, 13, 17, 11, 8][i]}
                x2={bx}
                y2={[7, 13, 17, 11, 8][i]}
                stroke="#6ee7b7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </g>
        );

      // 06: PAYTM - Quantum Financial Vault
      case 'paytm':
        return (
          <g>
            {/* Cryptographic matrix ring */}
            <ellipse cx="0" cy="0" rx="38" ry="18" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 3" transform="rotate(25)" opacity="0.7" className="animate-spin-slow" />
            <circle cx="0" cy="0" r="30" fill="url(#grad-paytm)" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Quantum Token Core */}
            <circle cx="0" cy="0" r="16" fill="#0c4a6e" stroke="#7dd3fc" strokeWidth="1.2" />
            <text x="0" y="5" textAnchor="middle" fill="#bae6fd" fontSize="13" fontFamily="var(--font-mono)" fontWeight="bold">
              ₹
            </text>
          </g>
        );

      // 07: ZOO PARK - Bioluminescent Xenosphere
      case 'zoo-park':
        return (
          <g>
            {/* Orbital Biosphere Ring */}
            <ellipse cx="0" cy="0" rx="40" ry="17" fill="none" stroke="#2dd4bf" strokeWidth="1.2" strokeDasharray="6 3" transform="rotate(-35)" opacity="0.7" className="animate-spin-reverse-slow" />
            <circle cx="0" cy="0" r="30" fill="url(#grad-zoo)" stroke="#2dd4bf" strokeWidth="1.5" />
            {/* Continents & Bio-Domes */}
            <circle cx="-8" cy="-6" r="8" fill="#134e4a" />
            <circle cx="9" cy="7" r="9" fill="#115e59" />
            <circle cx="0" cy="0" r="6" fill="#5eead4" fillOpacity="0.8" />
          </g>
        );

      // 08: GOOGLE MAPS - Coordinate Nexus
      case 'google-maps':
        return (
          <g>
            {/* Navigational Coordinate Grid */}
            <circle cx="0" cy="0" r="38" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="5 5" opacity="0.6" className="animate-spin-slow" />
            <circle cx="0" cy="0" r="30" fill="url(#grad-maps)" stroke="#60a5fa" strokeWidth="1.5" />
            {/* Grid latitude lines */}
            <ellipse cx="0" cy="0" rx="28" ry="12" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.5" />
            {/* Floating Red Navigation Pin at Core */}
            <g transform="translate(0, -6)">
              <path d="M 0 -10 C -5 -10 -8 -6 -8 -1 C -8 4 0 12 0 12 C 0 12 8 4 8 -1 C 8 -6 5 -10 0 -10 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
              <circle cx="0" cy="-2" r="2.5" fill="#ffffff" />
            </g>
          </g>
        );

      // 09: FRIENDSHIP - The Twin Interconnected Worlds (Sanctuary Centerpiece)
      case 'friendship':
        return (
          <g>
            {/* Radiant Stardust Halo */}
            <circle cx="0" cy="0" r="54" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.5" className="animate-spin-slow" />
            <circle cx="0" cy="0" r="44" fill="url(#grad-friendship-glow)" opacity="0.4" />

            {/* Connecting Bridge of Light */}
            <ellipse cx="0" cy="0" rx="30" ry="10" fill="none" stroke="#fde047" strokeWidth="2.5" strokeDasharray="4 2" className="animate-pulse" />

            {/* Left Twin World (Warm Amber) */}
            <circle cx="-16" cy="0" r="20" fill="url(#grad-friendship-left)" stroke="#fbbf24" strokeWidth="1.8" />

            {/* Right Twin World (Radiant Rose Gold) */}
            <circle cx="16" cy="0" r="20" fill="url(#grad-friendship-right)" stroke="#f59e0b" strokeWidth="1.8" />

            {/* Central Heart Singularity where the worlds meet */}
            <circle cx="0" cy="0" r="11" fill="#78350f" stroke="#fde68a" strokeWidth="1.5" />
            <path
              d="M 0 -3.5 C -1.5 -6 -4.5 -5 -4.5 -2.5 C -4.5 0.5 0 4.5 0 4.5 C 0 4.5 4.5 0.5 4.5 -2.5 C 4.5 -5 1.5 -6 0 -3.5 Z"
              fill="#fbbf24"
            />
          </g>
        );

      default:
        return <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />;
    }
  };

  return (
    <div className="relative w-full flex-1 flex flex-col justify-between py-2 sm:py-3 px-2 sm:px-4 md:px-8 select-none overflow-x-hidden z-10">
      {/* ========================================================================= */}
      {/* 1. REDESIGNED COMPACT FUTURISTIC NAVIGATION HEADER                        */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between border-b border-cyan-500/30 pb-2.5 sm:pb-3 mb-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] shrink-0">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs md:text-sm font-black tracking-widest text-white uppercase">
                PLANETARY EXPLORATION
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-display text-[10px] md:text-xs font-bold text-cyan-300 tracking-wider">
                COSMIC ATLAS
              </span>
              <span className="text-[10px] font-mono-tech text-slate-300">
                // SECTOR 01–09 ORBITAL ROUTE
              </span>
            </div>
          </div>
        </div>

        {/* Opposite side: SIGNALS DECODED: 9/9 */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400/40 flex items-center gap-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono-tech text-[11px] sm:text-xs md:text-sm font-bold text-emerald-300 tracking-wider">
              SIGNALS: {completedIds.length}/9
            </span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. FLOATING AURA AI COMMUNICATION PANEL (COMPACT & SLEEK)                 */}
      {/* ========================================================================= */}
      {isAuraOpen && (
        <div className="w-full max-w-4xl mx-auto mb-2 animate-fadeIn">
          <div className="w-full px-3.5 sm:px-4 py-2 rounded-xl bg-slate-950/90 border border-cyan-400/40 backdrop-blur-md flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Satellite className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <div className="flex items-center gap-2 min-w-0 text-xs font-mono-tech text-slate-200 truncate">
                <span className="font-bold text-cyan-300 shrink-0">AURA // TRANSMISSION:</span>
                <span className="truncate text-slate-200">
                  &ldquo;Captain Bannu, all nine signals have been decoded. The planetary exploration map is now fully accessible.&rdquo;
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAuraOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 transition-colors cursor-pointer shrink-0"
              title="Minimize transmission"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. THE COSMIC ATLAS – CENTRAL DEEP-SPACE MAP CANVAS                       */}
      {/* ========================================================================= */}
      <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px] rounded-2xl sm:rounded-3xl bg-[#070e22] border-2 border-cyan-400/40 overflow-hidden shadow-[0_0_60px_rgba(14,165,233,0.25)] flex items-center justify-center">
        {/* Luminous deep space background gradients & nebulae */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,58,110,0.38)_0%,_#070d1e_100%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/22 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/22 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Holographic grid lines */}
        <div className="absolute inset-0 bg-holo-grid opacity-25 pointer-events-none" />

        {/* SVG Interactive Canvas */}
        <svg
          viewBox="0 0 1000 680"
          className="w-full h-full object-contain overflow-visible select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Luminous, High-Contrast Gradients for each unique planet */}
            <radialGradient id="grad-camera" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#67e8f9" />
              <stop offset="65%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>

            <radialGradient id="grad-amazon" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>

            <radialGradient id="grad-canva" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#f5d0fe" />
              <stop offset="65%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </radialGradient>

            <radialGradient id="grad-youtube" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#fecdd3" />
              <stop offset="65%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </radialGradient>

            <radialGradient id="grad-music" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#a7f3d0" />
              <stop offset="65%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>

            <radialGradient id="grad-paytm" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#bae6fd" />
              <stop offset="65%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>

            <radialGradient id="grad-zoo" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#99f6e4" />
              <stop offset="65%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0f766e" />
            </radialGradient>

            <radialGradient id="grad-maps" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#bfdbfe" />
              <stop offset="65%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </radialGradient>

            <radialGradient id="grad-friendship-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="grad-friendship-left" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>

            <radialGradient id="grad-friendship-right" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>

            {/* Glowing route filter */}
            <filter id="glow-route" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Ambient Planet Halo Glow Filter */}
            <filter id="glow-planet" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Station Label & Badge Filter */}
            <filter id="glow-label" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Twinkling background starfield */}
          <g className="stars-layer">
            {BACKGROUND_STARS.map((star, idx) => (
              <circle
                key={idx}
                cx={star.cx}
                cy={star.cy}
                r={star.r * 1.2}
                fill="#ffffff"
                opacity={Math.min(1, star.opacity + 0.25)}
              />
            ))}
          </g>

          {/* Orbital Contour Concentric Guides behind the central world */}
          <g className="orbital-guides" opacity="0.45">
            <ellipse cx="490" cy="370" rx="360" ry="240" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 6" />
            <ellipse cx="490" cy="370" rx="240" ry="160" fill="none" stroke="#a78bfa" strokeWidth="1.2" strokeDasharray="3 5" />
            <ellipse cx="490" cy="370" rx="120" ry="80" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 4" />
          </g>

          {/* ===================================================================== */}
          {/* THE SEQUENTIAL ORBITAL ROUTE (CONNECTING 01 THROUGH 09)               */}
          {/* ===================================================================== */}
          <g className="route-layer">
            {/* Vivid background guide path */}
            <path
              d={FULL_ORBITAL_PATH}
              fill="none"
              stroke="#254d7e"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Radiant Conduit Glow Underlay */}
            <path
              d={FULL_ORBITAL_PATH}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="9"
              opacity="0.3"
              filter="url(#glow-route)"
            />

            {/* Glowing Energy Vector Conduit */}
            <path
              d={FULL_ORBITAL_PATH}
              fill="none"
              stroke="url(#grad-route-energy)"
              strokeWidth="3.2"
              strokeDasharray="9 6"
              className="animate-orbit-dash"
              filter="url(#glow-route)"
            />

            <linearGradient id="grad-route-energy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#c084fc" />
              <stop offset="70%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            {/* Active illuminated path leading to selected destination */}
            {destinations.map((dest, idx) => {
              const destPos = PLANET_POSITIONS[dest.id];
              const isPassed = destPos.order <= PLANET_POSITIONS[selectedDestId].order;
              if (idx === 0 || !isPassed) return null;

              return (
                <path
                  key={`active-seg-${idx}`}
                  d={ROUTE_SEGMENTS[idx - 1]}
                  fill="none"
                  stroke={destPos.color}
                  strokeWidth="3.8"
                  filter="url(#glow-route)"
                  opacity="1"
                />
              );
            })}
          </g>

          {/* ===================================================================== */}
          {/* NINE PLANETARY STATIONS                                               */}
          {/* ===================================================================== */}
          <g className="planets-layer">
            {destinations.map((dest) => {
              const pos = PLANET_POSITIONS[dest.id];
              const isSelected = selectedDestId === dest.id;
              const isHovered = hoveredDestId === dest.id;

              return (
                <g
                  key={dest.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => handleNodeClick(dest.id)}
                  onMouseEnter={() => setHoveredDestId(dest.id)}
                  onMouseLeave={() => setHoveredDestId(null)}
                  className="cursor-pointer group"
                >
                  {/* Outer active targeting reticle when selected */}
                  {isSelected && (
                    <g className="active-reticle pointer-events-none">
                      {/* Pulsing selection aura */}
                      <circle cx="0" cy="0" r={pos.radius + 18} fill="none" stroke={pos.color} strokeWidth="1.8" strokeDasharray="6 4" opacity="0.9" className="animate-spin-slow" />
                      {/* Targeting corner crosshairs */}
                      <circle cx="0" cy="0" r={pos.radius + 12} fill="none" stroke={pos.color} strokeWidth="2.5" strokeDasharray="30 70" />
                      {/* Sub-ping pulse */}
                      <circle cx="0" cy="0" r={pos.radius + 26} fill="none" stroke={pos.color} strokeWidth="1.2" opacity="0.5" className="animate-ping" style={{ animationDuration: '3s' }} />
                    </g>
                  )}

                  {/* Hover ambient ring */}
                  {isHovered && !isSelected && (
                    <circle cx="0" cy="0" r={pos.radius + 12} fill="none" stroke={pos.color} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" className="animate-spin-slow" />
                  )}

                  {/* Ambient Atmospheric Halo Glow behind each planet so it pops off deep space */}
                  <circle
                    cx="0"
                    cy="0"
                    r={pos.radius + 8}
                    fill={pos.color}
                    fillOpacity={isSelected ? '0.45' : '0.26'}
                    filter="url(#glow-planet)"
                  />

                  {/* Planet Illustration Wrapper with smooth hover scaling */}
                  <g className={`transition-transform duration-300 ${isSelected ? 'scale-110' : isHovered ? 'scale-105' : 'scale-100'}`}>
                    {renderPlanetIllustration(dest.id, isSelected)}
                  </g>

                  {/* Station Number Badge (Top-left of planet, bright and legible) */}
                  <g transform={`translate(-${pos.radius - 2}, -${pos.radius - 2})`} className="pointer-events-none">
                    <circle cx="0" cy="0" r="11" fill="#0b1733" stroke={pos.color} strokeWidth="2" filter="url(#glow-route)" />
                    <circle cx="0" cy="0" r="11" fill={pos.color} fillOpacity="0.25" />
                    <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontFamily="var(--font-mono)" fontWeight="900">
                      {dest.order < 10 ? `0${dest.order}` : dest.order}
                    </text>
                  </g>

                  {/* Planet Name Label (Carefully positioned below, high contrast, vibrant) */}
                  <g transform={`translate(0, ${pos.labelOffsetY})`} className="pointer-events-none">
                    <rect
                      x="-56"
                      y="-12"
                      width="112"
                      height="24"
                      rx="7"
                      fill="#08142a"
                      fillOpacity="0.94"
                      stroke={isSelected ? '#ffffff' : pos.color}
                      strokeWidth={isSelected ? '2' : '1.3'}
                      strokeOpacity={isSelected ? 1 : 0.8}
                      filter="url(#glow-label)"
                    />
                    <text
                      x="0"
                      y="4.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10.5"
                      fontFamily="var(--font-orbitron)"
                      fontWeight={isSelected ? '900' : '800'}
                      letterSpacing="0.08em"
                    >
                      {dest.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Quick Legend (Bottom-left of map) */}
        <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-[10px] font-mono-tech text-slate-300 backdrop-blur-md pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            STATIONS 01–08
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Heart className="w-3 h-3 fill-current text-amber-400" />
            STATION 09: FRIENDSHIP CORE
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONTEXTUAL PLANET INFORMATION PANEL                                    */}
      {/* ========================================================================= */}
      <div className="w-full mt-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 p-3.5 sm:p-4 backdrop-blur-md shadow-[0_0_25px_rgba(34,211,238,0.1)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 md:gap-4">
        {/* Destination Identity & Description */}
        <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-display font-black text-xs sm:text-sm text-slate-950 shadow-lg shrink-0 mt-0.5"
            style={{
              backgroundColor: PLANET_POSITIONS[selectedDest.id].color,
              boxShadow: `0 0 20px ${PLANET_POSITIONS[selectedDest.id].glowColor}`,
            }}
          >
            {selectedDest.order < 10 ? `0${selectedDest.order}` : selectedDest.order}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="font-display text-sm sm:text-base md:text-lg font-black text-white tracking-wider">
                {selectedDest.name}
              </h2>
              <span className="text-[9px] sm:text-[10px] font-mono-tech text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30">
                {selectedDest.category.toUpperCase()}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono-tech text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                DECODED
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed line-clamp-2 md:line-clamp-none">
              {selectedDest.revealedMessage}
            </p>
          </div>
        </div>

        {/* Action Controls: REVISIT SECTOR */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={handleOpenSelected}
            className="w-full md:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500/50 border border-cyan-400 text-cyan-200 hover:text-white font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>REVISIT SECTOR</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. REDESIGNED FUTURISTIC NAVIGATION COMMAND (CELEBRATION CTA)             */}
      {/* ========================================================================= */}
      <div className="w-full pt-2.5 sm:pt-3">
        <button
          onClick={handleCelebrate}
          disabled={!allCompleted}
          className="w-full min-h-[48px] py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display font-black text-[11px] sm:text-xs md:text-sm tracking-wider sm:tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_35px_rgba(251,191,36,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 stroke-[2.5] shrink-0" />
          <span className="text-center">INITIATE BIRTHDAY CELEBRATION PROTOCOL // ADVANCE TO NEXT PHASE</span>
          <ChevronRight className="w-4 h-4 stroke-[3] shrink-0" />
        </button>
      </div>
    </div>
  );
};
