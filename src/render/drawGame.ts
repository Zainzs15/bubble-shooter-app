import { PaintStyle, Skia } from '@shopify/react-native-skia';
import type { SkCanvas, SkImage } from '@shopify/react-native-skia';
import { backgroundConfig } from '../config/background';
import { BUBBLE_STYLES } from '../data/colors';
import type { GameEngine } from '../game/engine/GameEngine';
import { drawBubble, linePaint } from './bubbleSprites';

const dot = Skia.Paint();
dot.setAntiAlias(true);

function popLook(progress: number) {
  if (progress < 0.45) {
    const blend = progress / 0.45;
    return { scale: 1 + 0.22 * blend, alpha: 1, flash: blend };
  }
  const blend = (progress - 0.45) / 0.55;
  return { scale: Math.max(0.08, 1.22 * (1 - blend)), alpha: 1 - blend, flash: 1 - blend };
}

export function drawGame(canvas: SkCanvas, engine: GameEngine, background: SkImage | null) {
  const { width, height, radius } = engine.metrics;
  const base = Skia.Paint();
  base.setAntiAlias(true);
  base.setColor(Skia.Color(backgroundConfig.color));
  canvas.drawRect(Skia.XYWHRect(0, 0, width, height), base);

  if (backgroundConfig.enabled && background) {
    const imagePaint = Skia.Paint();
    imagePaint.setAntiAlias(true);
    canvas.drawImageRect(
      background,
      Skia.XYWHRect(0, 0, background.width(), background.height()),
      Skia.XYWHRect(0, 0, width, height),
      imagePaint,
    );
  }

  drawDangerLine(canvas, engine);
  drawTrajectory(canvas, engine);

  for (const bubble of engine.bubbles.values()) {
    const point = engine.visualPosition(bubble.row, bubble.col);
    const progress = engine.popProgress(bubble.id);
    const look = progress == null ? { scale: 1, alpha: 1, flash: 0 } : popLook(progress);
    const shine = Math.sin(engine.time * 0.003 + bubble.id) * 0.5;
    drawBubble(canvas, point.x, point.y, radius * look.scale, bubble.color, look.alpha, shine, look.flash);
  }

  for (const bubble of engine.falling) {
    const alpha = Math.max(0, Math.min(1, bubble.life / 280));
    canvas.save();
    canvas.translate(bubble.x, bubble.y);
    canvas.rotate((bubble.rot * 180) / Math.PI, 0, 0);
    drawBubble(canvas, 0, 0, radius * 0.96, bubble.color, alpha, 0, 0);
    canvas.restore();
  }

  for (const particle of engine.particles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);
    dot.setColor(Skia.Color(particle.color));
    dot.setAlphaf(alpha);
    canvas.drawCircle(particle.x, particle.y, particle.size, dot);
  }

  if (engine.projectile) {
    drawBubble(canvas, engine.projectile.x, engine.projectile.y, radius, engine.projectile.color, 1, 0.4, 0);
  }

  drawCannon(canvas, engine);
}

function drawDangerLine(canvas: SkCanvas, engine: GameEngine) {
  const { left, right, dangerY, radius } = engine.metrics;
  let nearest = dangerY;
  for (const bubble of engine.bubbles.values()) {
    const point = engine.visualPosition(bubble.row, bubble.col);
    nearest = Math.min(nearest, point.y);
  }
  const pressure = Math.max(0, Math.min(1, (dangerY - nearest) / (radius * 5)));
  const pulse = 0.35 + pressure * 0.4 + Math.sin(engine.time / 180) * pressure * 0.15;
  const paint = linePaint();
  paint.setStrokeWidth(2);
  paint.setColor(Skia.Color(`rgba(229, 72, 77, ${pulse})`));
  const dash = radius * 0.55;
  const gap = radius * 0.42;
  for (let x = left + 6; x < right - 6; x += dash + gap) {
    canvas.drawLine(x, dangerY, Math.min(right - 6, x + dash), dangerY, paint);
  }
}

function drawTrajectory(canvas: SkCanvas, engine: GameEngine) {
  if (engine.phase !== 'aiming') return;
  const trajectory = engine.getTrajectory();
  const color = BUBBLE_STYLES[engine.current];
  const radius = engine.metrics.radius;
  trajectory.points.forEach((point, index) => {
    const fade = 0.15 + (1 - index / Math.max(1, trajectory.points.length)) * (engine.touching ? 0.55 : 0.32);
    dot.setColor(Skia.Color(color.base));
    dot.setAlphaf(fade);
    canvas.drawCircle(point.x, point.y, Math.max(2.2, radius * 0.09), dot);
    dot.setColor(Skia.Color('#FFFFFF'));
    dot.setAlphaf(fade * 0.8);
    canvas.drawCircle(point.x, point.y, Math.max(1.1, radius * 0.045), dot);
  });
  if (trajectory.ghost) {
    drawBubble(canvas, trajectory.ghost.x, trajectory.ghost.y, radius, engine.current, engine.touching ? 0.42 : 0.28, 0, 0);
  }
}

function drawCannon(canvas: SkCanvas, engine: GameEngine) {
  const radius = engine.metrics.radius;
  const pivot = engine.cannonPivot();
  const muzzle = engine.muzzlePoint();
  const base = Skia.Paint();
  base.setAntiAlias(true);

  base.setColor(Skia.Color('rgba(47, 123, 255, 0.16)'));
  canvas.drawOval(Skia.XYWHRect(pivot.x - radius * 1.7, pivot.y - radius * 0.35, radius * 3.4, radius * 1.15), base);

  base.setColor(Skia.Color('rgba(70, 90, 120, 0.2)'));
  canvas.drawOval(Skia.XYWHRect(pivot.x - radius * 1.15, pivot.y + radius * 0.35, radius * 2.3, radius * 0.55), base);

  base.setColor(Skia.Color('#D5DEE8'));
  canvas.drawOval(Skia.XYWHRect(pivot.x - radius * 1.05, pivot.y - radius * 0.28, radius * 2.1, radius * 0.95), base);
  base.setColor(Skia.Color('#F7FBFF'));
  canvas.drawOval(Skia.XYWHRect(pivot.x - radius * 0.72, pivot.y - radius * 0.22, radius * 1.2, radius * 0.42), base);

  base.setColor(Skia.Color('#E7B008'));
  canvas.drawCircle(pivot.x - radius * 0.72, pivot.y, radius * 0.16, base);
  canvas.drawCircle(pivot.x + radius * 0.72, pivot.y, radius * 0.16, base);

  const barrel = linePaint();
  barrel.setStyle(PaintStyle.Stroke);
  barrel.setStrokeWidth(radius * 0.92);
  barrel.setColor(Skia.Color('#8EA0B5'));
  canvas.drawLine(pivot.x, pivot.y, muzzle.x, muzzle.y, barrel);
  barrel.setStrokeWidth(radius * 0.48);
  barrel.setColor(Skia.Color('#F4F8FC'));
  canvas.drawLine(pivot.x, pivot.y, muzzle.x, muzzle.y, barrel);
  barrel.setStrokeWidth(radius * 0.16);
  barrel.setColor(Skia.Color('#E7B008'));
  const goldX = pivot.x + (muzzle.x - pivot.x) * 0.42;
  const goldY = pivot.y + (muzzle.y - pivot.y) * 0.42;
  canvas.drawLine(pivot.x, pivot.y, goldX, goldY, barrel);

  drawBubble(canvas, muzzle.x, muzzle.y, radius * 0.92, engine.current, 1, 0.35, 0);

  const next = engine.metrics;
  base.setStyle(PaintStyle.Fill);
  base.setColor(Skia.Color('rgba(255,255,255,0.94)'));
  canvas.drawCircle(next.nextX, next.nextY, radius * 0.78, base);
  base.setStyle(PaintStyle.Stroke);
  base.setStrokeWidth(2);
  base.setColor(Skia.Color('rgba(47, 123, 255, 0.35)'));
  canvas.drawCircle(next.nextX, next.nextY, radius * 0.78, base);
  drawBubble(canvas, next.nextX, next.nextY, radius * 0.62, engine.next, 1, 0.2, 0);
}
