import { DestinationConfig, DestinationId } from '../types/adventure';

export const DESTINATIONS: DestinationConfig[] = [
  {
    id: 'camera',
    order: 1,
    name: 'CAMERA',
    codename: 'SECTOR ALPHA // OPTICAL LENS',
    category: 'Visual Archive',
    coordinates: { x: 22, y: 38 },
    aiIntroduction:
      "Captain, we've detected an unusual visual signal. It appears to be connected to a camera.",
    objectDescription: 'Holographic optical sensor node scanning planetary light refraction.',
    investigatePrompt: 'CALIBRATE OPTICAL SENSOR',
    revealedMessage:
      'Visual archive detected. The contents of this archive have not yet been decoded.',
    themeColor: {
      primary: 'text-cyan-400',
      border: 'border-cyan-500/40',
      glow: 'shadow-cyan-500/20',
      accent: '#22d3ee',
    },
  },
  {
    id: 'amazon',
    order: 2,
    name: 'AMAZON',
    codename: 'SECTOR BETA // CARGO REPOSITORY',
    category: 'Supply Capsule',
    coordinates: { x: 38, y: 55 },
    aiIntroduction:
      'Captain, another signal has been detected. An unidentified package appears to be connected to this transmission.',
    objectDescription: 'Reinforced orbital supply container sealed with electromagnetic locks.',
    investigatePrompt: 'UNLOCK SUPPLY CAPSULE',
    revealedMessage: 'An unidentified supply package has been recovered.',
    themeColor: {
      primary: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-amber-500/20',
      accent: '#f59e0b',
    },
  },
  {
    id: 'canva',
    order: 3,
    name: 'CANVA',
    codename: 'SECTOR GAMMA // HOLOGRAPHIC CANVAS',
    category: 'Creative Design',
    coordinates: { x: 54, y: 28 },
    aiIntroduction:
      'A creative signal has been detected. Its original design remains encrypted.',
    objectDescription: 'Suspended crystalline canvas projecting geometric prisms and chromatic spectra.',
    investigatePrompt: 'ALIGN PRISMATIC LAYERS',
    revealedMessage:
      'Creative archive detected. The original design is waiting to be discovered.',
    themeColor: {
      primary: 'text-purple-400',
      border: 'border-purple-500/40',
      glow: 'shadow-purple-500/20',
      accent: '#c084fc',
    },
  },
  {
    id: 'youtube',
    order: 4,
    name: 'YOUTUBE',
    codename: 'SECTOR DELTA // TRANSMISSION ARRAY',
    category: 'Video Feed',
    coordinates: { x: 70, y: 45 },
    aiIntroduction:
      'Captain, an unidentified transmission has been recovered.',
    objectDescription: 'Trans-atmospheric transmission array with oscillating broadcast waves.',
    investigatePrompt: 'STABILIZE TRANSMISSION',
    revealedMessage: 'Transmission detected. Its contents remain encrypted.',
    themeColor: {
      primary: 'text-rose-400',
      border: 'border-rose-500/40',
      glow: 'shadow-rose-500/20',
      accent: '#fb7185',
    },
  },
  {
    id: 'music',
    order: 5,
    name: 'MUSIC',
    codename: 'SECTOR EPSILON // RESONANCE CORE',
    category: 'Acoustic Wave',
    coordinates: { x: 80, y: 68 },
    aiIntroduction:
      'A musical signal is resonating across this planet.',
    objectDescription: 'Acoustic harmonic resonator pulsing with subterranean atmospheric waveforms.',
    investigatePrompt: 'HARMONIZE FREQUENCIES',
    revealedMessage: 'An unknown musical frequency has been detected.',
    themeColor: {
      primary: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'shadow-emerald-500/20',
      accent: '#34d399',
    },
  },
  {
    id: 'paytm',
    order: 6,
    name: 'PAYTM',
    codename: 'SECTOR ZETA // VAULT CIPHER',
    category: 'Digital Reward',
    coordinates: { x: 62, y: 78 },
    aiIntroduction:
      "Captain, we've recovered an unidentified digital reward.",
    objectDescription: 'Antimatter quantum token orbiting within a magnetized containment shell.',
    investigatePrompt: 'DECRYPT QUANTUM KEY',
    revealedMessage: 'Digital reward detected. Its purpose remains unknown.',
    themeColor: {
      primary: 'text-sky-400',
      border: 'border-sky-500/40',
      glow: 'shadow-sky-500/20',
      accent: '#38bdf8',
    },
  },
  {
    id: 'zoo-park',
    order: 7,
    name: 'ZOO PARK',
    codename: 'SECTOR ETA // BIOSIGNATURE BASIN',
    category: 'Alien Wildlife',
    coordinates: { x: 35, y: 82 },
    aiIntroduction:
      'Captain, life-form signatures have been detected in this region.',
    objectDescription: 'Bioluminescent planetary flora and gentle distant wandering silhouettes.',
    investigatePrompt: 'ENGAGE BIOSCANNER',
    revealedMessage:
      'Wildlife signals detected. The region contains several unidentified life forms.',
    themeColor: {
      primary: 'text-teal-400',
      border: 'border-teal-500/40',
      glow: 'shadow-teal-500/20',
      accent: '#2dd4bf',
    },
  },
  {
    id: 'google-maps',
    order: 8,
    name: 'GOOGLE MAPS',
    codename: 'SECTOR THETA // COORDINATE NEXUS',
    category: 'Planetary Grid',
    coordinates: { x: 18, y: 70 },
    aiIntroduction:
      'Captain, a hidden destination has been identified on the planetary map.',
    objectDescription: 'Orbital navigation grid projecting planetary vectors and vector beacons.',
    investigatePrompt: 'PLOT TRAJECTORY',
    revealedMessage:
      'Coordinates recovered. A mysterious location has been added to the navigation system.',
    themeColor: {
      primary: 'text-blue-400',
      border: 'border-blue-500/40',
      glow: 'shadow-blue-500/20',
      accent: '#60a5fa',
    },
  },
  {
    id: 'friendship',
    order: 9,
    name: 'FRIENDSHIP',
    codename: 'SECTOR OMEGA // THE INNER SANCTUM',
    category: 'Emotional Beacon',
    coordinates: { x: 50, y: 48 }, // Planet center
    aiIntroduction:
      'Captain, the final signal is different. It does not appear to come from a machine, a location, or an object. It appears to be connected to something much more meaningful.',
    objectDescription: 'A luminous, warm golden singularity pulsing gently with stardust.',
    investigatePrompt: 'ATTUNE TO FINAL SIGNAL',
    revealedMessage:
      'Some journeys are not about discovering new worlds. They are about discovering the people who make our world special.',
    quoteOrMeaning:
      'Across every galaxy and through every cosmic anomaly, friendship is the truest constellation that guides us home.',
    themeColor: {
      primary: 'text-amber-300',
      border: 'border-amber-400/60',
      glow: 'shadow-amber-400/30',
      accent: '#fbbf24',
    },
  },
];

export const ORDERED_DESTINATION_IDS: DestinationId[] = DESTINATIONS.map((d) => d.id);
