import { GRID_COLS, HUD_HEIGHT } from '../config/gameConfig';
import type { BoardMetrics } from '../game/types';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeBoardMetrics(
  screenW: number,
  screenH: number,
  topInset: number,
  bottomInset: number,
  formationRows = 10,
): BoardMetrics {
  const cols = GRID_COLS;
  const margin = clamp(screenW * 0.035, 8, 24);
  const originY = topInset + HUD_HEIGHT;
  const cannonPad = 58;
  const cannonY = Math.max(originY + 180, screenH - bottomInset - cannonPad);
  const maxRadius = (Math.max(180, screenW) - margin * 2) / (cols * 2 + 1);
  const slots = clamp(formationRows + 3, 11, 16);

  let radius = maxRadius;
  for (let pass = 0; pass < 3; pass += 1) {
    const dangerY = cannonY - radius * 3.3;
    const play = Math.max(120, dangerY - originY - radius);
    const fit = play / (slots * Math.sqrt(3));
    radius = clamp(Math.min(maxRadius, fit), 12, 34);
  }

  const gridWidth = radius * 2 * cols + radius;
  const originX = (screenW - gridWidth) / 2;
  const dangerY = cannonY - radius * 3.3;
  const nextX = clamp(screenW / 2 + radius * 3.1, originX + radius * 2, screenW - radius * 1.35);

  return {
    width: screenW,
    height: screenH,
    cols,
    radius,
    originX,
    originY,
    left: originX,
    right: originX + gridWidth,
    top: originY,
    dangerY,
    cannonX: screenW / 2,
    cannonY,
    shotSpeed: radius * 72,
    nextX,
    nextY: cannonY + radius * 0.08,
  };
}
