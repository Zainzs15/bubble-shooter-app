import { SCORING } from '../../config/gameConfig';

export interface ScoreResult {
  total: number;
  matchPoints: number;
  floatPoints: number;
  largeBonus: number;
  comboBonus: number;
  bigDropBonus: number;
  clearBonus: number;
}

export function scoreShot(input: {
  matched: number;
  floating: number;
  combo: number;
  clearedBoard: boolean;
}): ScoreResult {
  const matchPoints = input.matched * SCORING.matchBubble;
  const floatPoints = input.floating * SCORING.floatingBubble;
  let largeBonus = 0;
  if (input.matched >= SCORING.hugeMatchThreshold) largeBonus = SCORING.hugeMatchBonus;
  else if (input.matched >= SCORING.largeMatchThreshold) largeBonus = SCORING.largeMatchBonus;
  const comboBonus = input.combo >= 2 ? SCORING.comboStepBonus * (input.combo - 1) : 0;
  const bigDropBonus = input.floating >= SCORING.bigDropCount ? SCORING.bigDropBonus : 0;
  const clearBonus = input.clearedBoard ? SCORING.levelClearBonus : 0;
  const total = matchPoints + floatPoints + largeBonus + comboBonus + bigDropBonus + clearBonus;
  return { total, matchPoints, floatPoints, largeBonus, comboBonus, bigDropBonus, clearBonus };
}

export function computeStars(score: number, bubbleCount: number): 1 | 2 | 3 {
  const bubbles = Math.max(1, bubbleCount);
  const clear = SCORING.levelClearBonus;
  if (score >= bubbles * SCORING.threeStarPerBubble + clear) return 3;
  if (score >= bubbles * SCORING.twoStarPerBubble + clear) return 2;
  return 1;
}
