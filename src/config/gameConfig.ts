export const GRID_COLS = 8;
export const MATCH_MIN = 3;
export const MAX_PARTICLES = 64;
export const POP_MS = 190;
export const ROW_DROP_MS = 280;
export const MAX_BOUNCES = 6;
export const HUD_HEIGHT = 82;
export const LEVEL_COUNT = 30;

/** All scoring and star thresholds live here so they can be tuned without touching the engine. */
export const SCORING = {
  matchBubble: 10,
  floatingBubble: 15,
  largeMatchThreshold: 6,
  largeMatchBonus: 40,
  hugeMatchThreshold: 10,
  hugeMatchBonus: 90,
  comboStepBonus: 50,
  bigDropCount: 8,
  bigDropBonus: 40,
  levelClearBonus: 500,
  twoStarPerBubble: 12,
  threeStarPerBubble: 14,
};
