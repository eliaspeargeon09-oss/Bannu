import { AdventureProgress, DestinationId } from '../types/adventure';

const STORAGE_KEY = 'bannu_unknown_world_v1';

export const INITIAL_PROGRESS: AdventureProgress = {
  completedDestinations: [],
  currentDestinationId: 'camera',
  isMapUnlocked: false,
  hasVisitedCelebration: false,
  candleLit: true,
  wishMade: false,
};

export function loadProgress(): AdventureProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
    };
  } catch (e) {
    console.error('Failed to load progress from localStorage:', e);
    return INITIAL_PROGRESS;
  }
}

export function saveProgress(progress: AdventureProgress) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage:', e);
  }
}

export function resetProgress(): AdventureProgress {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  }
  return INITIAL_PROGRESS;
}

export function isDestinationUnlocked(
  destId: DestinationId,
  completedList: DestinationId[],
  orderedIds: DestinationId[],
  isMapUnlocked: boolean
): boolean {
  // If full exploration map is unlocked, all destinations are unlocked
  if (isMapUnlocked) return true;
  // Destination 1 is always unlocked
  const idx = orderedIds.indexOf(destId);
  if (idx === 0) return true;
  // Any destination whose previous destination is completed is unlocked
  const prevId = orderedIds[idx - 1];
  return completedList.includes(prevId);
}
