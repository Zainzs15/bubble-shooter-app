import { PaintStyle, Skia, StrokeCap, TileMode } from '@shopify/react-native-skia';
import type { SkCanvas, SkPaint } from '@shopify/react-native-skia';
import { BUBBLE_STYLES } from '../data/colors';
import type { BubbleColor } from '../game/types';

const fill = Skia.Paint();
const stroke = Skia.Paint();
fill.setAntiAlias(true);
stroke.setAntiAlias(true);

function resetFill() {
  fill.setShader(null);
  fill.setAlphaf(1);
  fill.setStyle(PaintStyle.Fill);
}

export function drawBubbleArt(
  canvas: SkCanvas,
  x: number,
  y: number,
  radius: number,
  color: BubbleColor,
  alpha: number,
) {
  const style = BUBBLE_STYLES[color];
  resetFill();
  fill.setColor(Skia.Color(`rgba(40, 55, 80, ${0.28 * alpha})`));
  canvas.drawOval(Skia.XYWHRect(x - radius * 0.86, y + radius * 0.72, radius * 1.72, radius * 0.46), fill);

  resetFill();
  fill.setColor(Skia.Color(style.base));
  fill.setAlphaf(alpha);
  canvas.drawCircle(x, y, radius, fill);

  const shader = Skia.Shader.MakeRadialGradient(
    { x: x - radius * 0.32, y: y - radius * 0.38 },
    radius * 1.35,
    [Skia.Color(style.light), Skia.Color(style.mid), Skia.Color(style.base), Skia.Color(style.dark)],
    [0, 0.28, 0.62, 1],
    TileMode.Clamp,
  );
  resetFill();
  fill.setShader(shader);
  fill.setAlphaf(alpha);
  canvas.drawCircle(x, y, radius, fill);

  stroke.setStyle(PaintStyle.Stroke);
  stroke.setStrokeWidth(Math.max(1.2, radius * 0.075));
  stroke.setColor(Skia.Color(style.deep));
  stroke.setAlphaf(0.55 * alpha);
  canvas.drawCircle(x, y, radius * 0.93, stroke);

  resetFill();
  fill.setColor(Skia.Color(`rgba(255,255,255,${0.9 * alpha})`));
  canvas.drawOval(Skia.XYWHRect(x - radius * 0.58, y - radius * 0.72, radius * 0.78, radius * 0.36), fill);

  resetFill();
  fill.setColor(Skia.Color(`rgba(255,255,255,${0.55 * alpha})`));
  canvas.drawCircle(x + radius * 0.34, y + radius * 0.28, radius * 0.13, fill);

  resetFill();
  fill.setColor(Skia.Color(style.deep));
  fill.setAlphaf(0.16 * alpha);
  canvas.drawOval(Skia.XYWHRect(x - radius * 0.55, y + radius * 0.2, radius * 1.1, radius * 0.48), fill);
}

export function drawBubble(
  canvas: SkCanvas,
  x: number,
  y: number,
  radius: number,
  color: BubbleColor,
  alpha: number,
  shine: number,
  flash: number,
) {
  if (alpha <= 0.01 || radius <= 0) return;
  drawBubbleArt(canvas, x, y, radius, color, alpha);

  if (shine !== 0) {
    resetFill();
    fill.setColor(Skia.Color(`rgba(255,255,255,${0.28 * alpha})`));
    canvas.drawOval(
      Skia.XYWHRect(x - radius * 0.34 + shine * radius * 0.16, y - radius * 0.58, radius * 0.42, radius * 0.2),
      fill,
    );
  }

  if (flash > 0.02) {
    resetFill();
    fill.setColor(Skia.Color(`rgba(255,255,255,${0.45 * flash * alpha})`));
    canvas.drawCircle(x, y, radius * 0.92, fill);
  }
}

export function glossPaint(): SkPaint {
  return fill;
}

export function linePaint() {
  stroke.setStyle(PaintStyle.Stroke);
  stroke.setStrokeCap(StrokeCap.Round);
  stroke.setShader(null);
  return stroke;
}
