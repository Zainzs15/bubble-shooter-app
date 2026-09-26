import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Canvas, Picture, Skia, useImage } from '@shopify/react-native-skia';
import type { SkImage, SkPicture } from '@shopify/react-native-skia';
import { backgroundConfig } from '../config/background';
import type { GameEngine } from '../game/engine/GameEngine';
import type { GameEvent, HudState } from '../game/types';
import { drawGame } from './drawGame';

interface Props {
  engine: GameEngine;
  onHud: (hud: HudState) => void;
  onEvents: (events: GameEvent[]) => void;
}

export function GameCanvas({ engine, onHud, onEvents }: Props) {
  const background = useImage(backgroundConfig.enabled ? backgroundConfig.source : null);
  const [picture, setPicture] = useState<SkPicture | null>(null);
  const [, setFrame] = useState(0);
  const engineRef = useRef(engine);
  const onHudRef = useRef(onHud);
  const onEventsRef = useRef(onEvents);
  const backgroundRef = useRef<SkImage | null>(null);
  engineRef.current = engine;
  onHudRef.current = onHud;
  onEventsRef.current = onEvents;
  backgroundRef.current = background;

  useEffect(() => {
    let mounted = true;
    let last = globalThis.performance?.now?.() ?? Date.now();
    let raf = 0;

    const loop = (now: number) => {
      if (!mounted) return;
      const current = engineRef.current;
      const dt = Math.min(34, Math.max(0, now - last));
      last = now;
      if (!current.paused) {
        try {
          current.update(dt);
        } catch {
          current.recover();
        }
        const events = current.consumeEvents();
        if (events.length > 0) onEventsRef.current(events);
        if (current.hudDirty) {
          current.hudDirty = false;
          onHudRef.current(current.getHud());
        }
        try {
          setPicture(recordFrame(current, backgroundRef.current));
        } catch {
          // Keep the previous frame if the renderer hits a bad state.
        }
        if (current.floaters.length > 0) setFrame((value) => (value + 1) % 100000);
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, []);

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

  const touch = (x: number, y: number) => engineRef.current.aimAt(x, y);

  return (
    <View
      style={[styles.board, { width: engine.metrics.width, height: engine.metrics.height }]}
      onStartShouldSetResponder={() => engineRef.current.phase !== 'won' && engineRef.current.phase !== 'lost'}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(event) => touch(event.nativeEvent.locationX, event.nativeEvent.locationY)}
      onResponderMove={(event) => touch(event.nativeEvent.locationX, event.nativeEvent.locationY)}
      onResponderRelease={(event) => {
        touch(event.nativeEvent.locationX, event.nativeEvent.locationY);
        engineRef.current.endAim(true);
      }}
      onResponderTerminate={() => engineRef.current.endAim(false)}
    >
      <Canvas style={{ width: engine.metrics.width, height: engine.metrics.height }}>
        {picture ? <Picture picture={picture} /> : null}
      </Canvas>
      {engine.floaters.map((floater) => {
        const appear = Math.min(1, (floater.maxLife - floater.life) / 160);
        return (
          <Text
            key={floater.id}
            pointerEvents="none"
            style={[
              styles.floater,
              floater.kind === 'combo' && styles.combo,
              floater.kind === 'big' && styles.big,
              {
                left: floater.x - 70,
                top: floater.y,
                opacity: Math.max(0, floater.life / floater.maxLife),
                transform: [{ scale: 0.86 + appear * 0.2 }],
              },
            ]}
          >
            {floater.text}
          </Text>
        );
      })}
    </View>
  );
}

function recordFrame(engine: GameEngine, background: SkImage | null) {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, engine.metrics.width, engine.metrics.height));
  drawGame(canvas, engine, background);
  return recorder.finishRecordingAsPicture();
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  floater: {
    position: 'absolute',
    width: 140,
    textAlign: 'center',
    color: '#14324F',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(255,255,255,0.95)',
    textShadowRadius: 8,
  },
  combo: {
    color: '#6D28D9',
    fontSize: 20,
  },
  big: {
    color: '#E25800',
    fontSize: 18,
  },
});
