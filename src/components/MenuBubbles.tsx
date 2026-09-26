import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Picture, Skia } from '@shopify/react-native-skia';
import type { SkPicture } from '@shopify/react-native-skia';
import type { BubbleColor } from '../game/types';
import { drawBubble } from '../render/bubbleSprites';

const COLORS: BubbleColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'];

export function MenuBubbles({ width, height }: { width: number; height: number }) {
  const [picture, setPicture] = useState<SkPicture | null>(null);

  useEffect(() => {
    let mounted = true;
    let raf = 0;
    const start = Date.now();
    const bubbles = COLORS.map((color, index) => ({
      color,
      x: ((index * 97) % Math.max(1, width - 40)) + 20,
      y: 40 + ((index * 53) % Math.max(1, height - 80)),
      r: 14 + (index % 3) * 6,
      speed: 8 + (index % 4) * 3,
    }));

    const loop = () => {
      if (!mounted || width < 2 || height < 2) {
        raf = requestAnimationFrame(loop);
        return;
      }
      try {
        const t = (Date.now() - start) / 1000;
        const recorder = Skia.PictureRecorder();
        const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, width, height));
        bubbles.forEach((bubble, index) => {
          const y = ((bubble.y - t * bubble.speed) % (height + 40) + height + 40) % (height + 40) - 20;
          const x = bubble.x + Math.sin(t * 0.7 + index) * 10;
          drawBubble(canvas, x, y, bubble.r, bubble.color, 0.55, Math.sin(t + index), 0);
        });
        setPicture(recorder.finishRecordingAsPicture());
      } catch (error) {
        console.error(error);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, [width, height]);

  useEffect(() => {
    return () => {
      const old = picture;
      if (!old) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          try {
            old.dispose();
          } catch {
            // The frame may already have been released.
          }
        }),
      );
    };
  }, [picture]);

  return (
    <Canvas
      style={StyleSheet.flatten([
        styles.canvas,
        { width, height, pointerEvents: 'none' },
      ])}
    >
      {picture ? <Picture picture={picture} /> : null}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
