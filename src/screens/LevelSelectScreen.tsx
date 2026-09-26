import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GlossyButton } from '../components/GlossyButton';
import { LockIcon } from '../components/LockIcon';
import { Screen } from '../components/Screen';
import { StarRow } from '../components/StarRow';
import { LEVELS } from '../data/levels';
import { useProgress } from '../progress/ProgressContext';
import { theme } from '../theme';
import { confirmTap } from '../utils/feedback';

export function LevelSelectScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { unlocked, records } = useProgress();
  const columns = width >= 700 ? 6 : 5;
  const gridWidth = Math.min(width - 32, 560);
  const gap = 10;
  const cell = (gridWidth - gap * (columns - 1)) / columns;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Level Select</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, { width: gridWidth }]}>
          {LEVELS.map((level) => {
            const locked = level.id > unlocked;
            const record = records[String(level.id)];
            const stars = record?.stars ?? 0;
            return (
              <Pressable
                key={level.id}
                disabled={locked}
                onPress={() => {
                  confirmTap('light');
                  router.push(`/game/${level.id}`);
                }}
                style={[styles.cell, { width: cell, height: cell * 1.05 }, locked && styles.locked]}
              >
                {locked ? (
                  <LockIcon />
                ) : (
                  <>
                    <Text style={styles.number}>{String(level.id).padStart(2, '0')}</Text>
                    {stars > 0 ? <StarRow stars={stars} size={11} /> : <Text style={styles.open}>Open</Text>}
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <GlossyButton label="Back" tone="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: theme.ink,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  cell: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#8FB0D4',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  locked: {
    backgroundColor: '#F3F6FA',
  },
  number: {
    fontFamily: 'Nunito_800ExtraBold',
    color: theme.ink,
    fontSize: 18,
  },
  open: {
    fontFamily: 'Nunito_700Bold',
    color: theme.muted,
    fontSize: 11,
  },
  footer: {
    padding: 16,
  },
});
