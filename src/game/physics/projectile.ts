import { MAX_BOUNCES } from '../../config/gameConfig';
import type { BoardMetrics } from '../types';

export interface ShotBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounces: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  row: number;
  col: number;
}

export type StepOutcome = { type: 'fly' } | { type: 'hit'; obstacle: Obstacle | null };

export function stepShot(
  shot: ShotBody,
  dtMs: number,
  metrics: BoardMetrics,
  obstacles: Obstacle[],
): StepOutcome {
  const speed = Math.max(1, Math.hypot(shot.vx, shot.vy));
  const subMs = ((metrics.radius * 0.34) / speed) * 1000;
  let left = dtMs;
  const wallLeft = metrics.left + metrics.radius;
  const wallRight = metrics.right - metrics.radius;
  const ceilingY = metrics.top + metrics.radius;
  const hitDist = metrics.radius * 2 - 0.55;

  while (left > 0) {
    const step = Math.min(left, Math.max(4, subMs));
    const scale = step / 1000;
    shot.x += shot.vx * scale;
    shot.y += shot.vy * scale;
    left -= step;

    if (shot.x < wallLeft) {
      shot.x = wallLeft + (wallLeft - shot.x);
      shot.vx = Math.abs(shot.vx);
      shot.bounces += 1;
    } else if (shot.x > wallRight) {
      shot.x = wallRight - (shot.x - wallRight);
      shot.vx = -Math.abs(shot.vx);
      shot.bounces += 1;
    }
    shot.x = Math.min(wallRight, Math.max(wallLeft, shot.x));

    if (shot.bounces > MAX_BOUNCES) {
      shot.y = Math.min(shot.y, ceilingY);
      return { type: 'hit', obstacle: null };
    }

    let nearest: Obstacle | null = null;
    let nearestDist = hitDist * hitDist;
    for (const obstacle of obstacles) {
      const dx = shot.x - obstacle.x;
      const dy = shot.y - obstacle.y;
      const dist = dx * dx + dy * dy;
      if (dist <= nearestDist) {
        nearestDist = dist;
        nearest = obstacle;
      }
    }

    if (nearest) {
      const dx = shot.x - nearest.x;
      const dy = shot.y - nearest.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      shot.x = nearest.x + (dx / dist) * metrics.radius * 2;
      shot.y = nearest.y + (dy / dist) * metrics.radius * 2;
      return { type: 'hit', obstacle: nearest };
    }

    if (shot.y <= ceilingY) {
      shot.y = ceilingY;
      return { type: 'hit', obstacle: null };
    }
  }

  return { type: 'fly' };
}

export function predictShot(
  origin: { x: number; y: number },
  angle: number,
  metrics: BoardMetrics,
  obstacles: Obstacle[],
): { points: { x: number; y: number }[]; end: { x: number; y: number }; obstacle: Obstacle | null } {
  const shot: ShotBody = {
    x: origin.x,
    y: origin.y,
    vx: Math.cos(angle) * metrics.shotSpeed,
    vy: Math.sin(angle) * metrics.shotSpeed,
    bounces: 0,
  };
  const points = [{ x: shot.x, y: shot.y }];
  const spacing = metrics.radius * 0.92;
  let traveled = 0;
  let obstacle: Obstacle | null = null;
  const step = 16;
  const maxTravel = metrics.radius * 52;

  for (let i = 0; i < 180 && traveled < maxTravel; i += 1) {
    const beforeX = shot.x;
    const beforeY = shot.y;
    const beforeBounces = shot.bounces;
    const outcome = stepShot(shot, step, metrics, obstacles);
    traveled += Math.hypot(shot.x - beforeX, shot.y - beforeY);
    const last = points[points.length - 1];
    if (shot.bounces !== beforeBounces) {
      const wallX = shot.vx > 0 ? metrics.left + metrics.radius : metrics.right - metrics.radius;
      points.push({ x: wallX, y: shot.y });
    } else if (Math.hypot(shot.x - last.x, shot.y - last.y) >= spacing) {
      points.push({ x: shot.x, y: shot.y });
    }
    if (outcome.type === 'hit') {
      obstacle = outcome.obstacle;
      points.push({ x: shot.x, y: shot.y });
      break;
    }
  }

  const trimmed = points.length > 16 ? samplePoints(points, 16) : points;
  return { points: trimmed, end: { x: shot.x, y: shot.y }, obstacle };
}

function samplePoints(points: { x: number; y: number }[], count: number) {
  if (points.length <= count) return points;
  const sampled = [points[0]];
  const span = points.length - 1;
  for (let i = 1; i < count - 1; i += 1) {
    sampled.push(points[Math.round((i * span) / (count - 1))]);
  }
  sampled.push(points[points.length - 1]);
  const extremes = [points.reduce((best, point) => (point.x < best.x ? point : best)), points.reduce((best, point) => (point.x > best.x ? point : best))];
  for (const extreme of extremes) {
    if (!sampled.some((point) => point.x === extreme.x && point.y === extreme.y)) sampled.push(extreme);
  }
  return sampled;
}
