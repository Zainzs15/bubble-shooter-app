import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { audio } from '../audio/SoundManager';
import { PauseOverlay } from '../components/overlays/PauseOverlay';
import { ResultOverlay } from '../components/overlays/ResultOverlay';
import { getLevel } from '../data/levels';
import { GameEngine } from '../game/engine/GameEngine';
import type { GameEvent, HudState } from '../game/types';
import { useProgress } from '../progress/ProgressContext';
import { GameCanvas } from '../render/GameCanvas';
import { theme } from '../theme';
import { confirmTap } from '../utils/feedback';
import { pulse } from '../utils/haptics';
import { computeBoardMetrics } from '../utils/layout';

export function GameScreen({ levelId }: { levelId: number }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const progress = useProgress();
  const level = getLevel(levelId);
  const [session, setSession] = useState(0);
  const metrics = useMemo(
    () => computeBoardMetrics(width, height, insets.top, insets.bottom, level.formation.length),
    [height, insets.bottom, insets.top, level.formation.length, width],
  );
  const engine = useMemo(() => new GameEngine(level, metrics), [level, session]);
  const intro = useRef(new Animated.Value(1)).current;
  const [hud, setHud] = useState<HudState>(() => engine.getHud());
  const [overlay, setOverlay] = useState<'none' | 'pause' | 'win' | 'lose'>('none');
  const [result, setResult] = useState({ score: 0, stars: 1 });

  useEffect(() => {
    let ready = false;
    let cancelled = false;
    activateKeepAwakeAsync('bubble-shooter')
      .then(() => {
        ready = true;
        if (cancelled) deactivateKeepAwake('bubble-shooter').catch(() => undefined);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (ready) deactivateKeepAwake('bubble-shooter').catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    engine.setMetrics(metrics);
  }, [engine, metrics]);

  useEffect(() => {
    setHud(engine.getHud());
    setOverlay('none');
    intro.setValue(1);
    Animated.timing(intro, { toValue: 0, duration: 420, delay: 900, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [engine, intro]);

  useEffect(() => {
    engine.setPaused(overlay === 'pause');
  }, [engine, overlay]);

  const best = Math.max(progress.records[String(level.id)]?.best ?? 0, overlay === 'win' ? result.score : 0);
  const misses = Array.from({ length: hud.missLimit }, (_, index) => index < hud.misses);

  const onEvents = (events: GameEvent[]) => {
    for (const event of events) {
      if (event.type === 'shoot') {
        audio.play('shoot');
        void pulse('light', progress.settings.vibration);
      } else if (event.type === 'attach') {
        audio.play('attach');
      } else if (event.type === 'pop') {
        audio.play(event.count >= 6 ? 'popMulti' : 'pop');
        void pulse('medium', progress.settings.vibration);
      } else if (event.type === 'drop') {
        audio.play('drop');
      } else if (event.type === 'combo') {
        audio.play('combo');
      } else if (event.type === 'row') {
        audio.play('row');
        void pulse('medium', progress.settings.vibration);
      } else if (event.type === 'win') {
        audio.play('win');
        void pulse('success', progress.settings.vibration);
        progress.recordWin(level.id, event.score, event.stars);
        setResult({ score: event.score, stars: event.stars });
        setOverlay('win');
      } else if (event.type === 'lose') {
        audio.play('lose');
        void pulse('error', progress.settings.vibration);
        progress.recordScore(level.id, event.score);
        setResult({ score: event.score, stars: 1 });
        setOverlay('lose');
      }
    }
  };

  return (
    <View style={styles.root}>
      <GameCanvas engine={engine} onHud={setHud} onEvents={onEvents} />
      <View pointerEvents="box-none" style={[styles.hud, { top: insets.top, height: 74 }]}>
        <Pressable
          accessibilityLabel="Pause"
          style={styles.pause}
          onPress={() => {
            confirmTap('light');
            setOverlay('pause');
          }}
        >
          <View style={styles.pauseBars}>
            <View style={styles.bar} />
            <View style={styles.bar} />
          </View>
        </Pressable>
        <View pointerEvents="none" style={styles.center}>
          <Text style={styles.level}>Level {hud.levelId}</Text>
          <View style={styles.misses}>
            {misses.map((filled, index) => (
              <View key={index} style={[styles.miss, filled && styles.missOn]} />
            ))}
          </View>
        </View>
        <View pointerEvents="none" style={styles.scoreBox}>
          <Text style={styles.score}>{hud.score.toLocaleString()}</Text>
          <Text style={styles.best}>Best {best.toLocaleString()}</Text>
        </View>
      </View>
      <Animated.View pointerEvents="none" style={[styles.intro, { opacity: intro, top: insets.top + 86 }]}>
        <Text style={styles.introLevel}>Level {level.id}</Text>
        <Text style={styles.introName}>{level.name}</Text>
      </Animated.View>
      <Text pointerEvents="none" style={[styles.ammo, { left: Math.max(12, metrics.cannonX - metrics.radius * 3.5), top: metrics.cannonY - 10 }]}>
        CURRENT
      </Text>
      <Text pointerEvents="none" style={[styles.ammo, { left: metrics.nextX - 30, top: metrics.nextY - metrics.radius - 22, width: 60 }]}>
        NEXT
      </Text>
      {overlay === 'pause' ? (
        <PauseOverlay
          onResume={() => setOverlay('none')}
          onRestart={() => {
            setSession((value) => value + 1);
            setOverlay('none');
          }}
        />
      ) : null}
      {overlay === 'win' ? (
        <ResultOverlay
          title="Level Complete!"
          levelName={level.name}
          score={result.score}
          best={Math.max(best, result.score)}
          stars={result.stars}
          primaryLabel={level.id < 30 ? 'Next Level' : 'Level Select'}
          onPrimary={() => {
            if (level.id < 30) router.replace(`/game/${level.id + 1}`);
            else router.replace('/levels');
          }}
          secondaryLabel="Replay"
          onSecondary={() => setSession((value) => value + 1)}
          tertiaryLabel="Main Menu"
          onTertiary={() => router.replace('/')}
        />
      ) : null}
      {overlay === 'lose' ? (
        <ResultOverlay
          title="Game Over"
          levelName={`Level ${level.id}`}
          score={result.score}
          best={Math.max(best, result.score)}
          primaryLabel="Restart"
          onPrimary={() => setSession((value) => value + 1)}
          secondaryLabel="Main Menu"
          onSecondary={() => router.replace('/')}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E7F4FB',
  },
  hud: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pause: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8FB0D4',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pauseBars: {
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: theme.ink,
  },
  center: {
    alignItems: 'center',
    gap: 4,
  },
  level: {
    fontFamily: 'Nunito_800ExtraBold',
    color: theme.ink,
    fontSize: 16,
  },
  misses: {
    flexDirection: 'row',
    gap: 5,
  },
  miss: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E1EAF3',
  },
  missOn: {
    backgroundColor: theme.danger,
  },
  scoreBox: {
    minWidth: 78,
    alignItems: 'flex-end',
  },
  score: {
    fontFamily: 'Fredoka_700Bold',
    color: theme.blue,
    fontSize: 22,
  },
  best: {
    fontFamily: 'Nunito_700Bold',
    color: theme.muted,
    fontSize: 11,
  },
  intro: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  introLevel: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: theme.ink,
  },
  introName: {
    fontFamily: 'Nunito_700Bold',
    color: theme.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  ammo: {
    position: 'absolute',
    width: 72,
    textAlign: 'center',
    color: theme.muted,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
