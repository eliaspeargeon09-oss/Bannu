export type DestinationId =
  | 'camera'
  | 'amazon'
  | 'canva'
  | 'youtube'
  | 'music'
  | 'paytm'
  | 'zoo-park'
  | 'google-maps'
  | 'friendship';

export type ScreenType =
  | 'init'
  | 'intro-video'
  | 'opening'
  | 'briefing'
  | 'destination'
  | 'exploration-map'
  | 'celebration-transition'
  | 'birthday-cake';

export interface DestinationConfig {
  id: DestinationId;
  order: number; // 1 to 9
  name: string;
  codename: string;
  category: string;
  coordinates: { x: number; y: number }; // For planetary map (percentage 0-100)
  aiIntroduction: string;
  objectDescription: string;
  investigatePrompt: string;
  revealedMessage: string;
  quoteOrMeaning?: string;
  themeColor: {
    primary: string;
    border: string;
    glow: string;
    accent: string;
  };
}

export interface AdventureProgress {
  completedDestinations: DestinationId[];
  currentDestinationId: DestinationId;
  isMapUnlocked: boolean;
  hasVisitedCelebration: boolean;
  candleLit: boolean;
  wishMade: boolean;
}
