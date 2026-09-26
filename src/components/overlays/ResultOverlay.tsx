import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { GlossyButton } from '../GlossyButton';
import { StarRow } from '../StarRow';
import { theme } from '../../theme';

interface Props {
  title: string;
  score: number;
  best: number;
  levelName: string;
  stars?: number;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  tertiaryLabel?: string;
  onTertiary?: () => void;
}

export function ResultOverlay({
  title,
  score,
  best,
  levelName,
  stars,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tertiaryLabel,
  onTertiary,
}: Props) {
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    scale.setValue(0.92);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
  }, [scale, title]);

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Text style={styles.kicker}>{levelName}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.score}>{score.toLocaleString()}</Text>
        {stars != null ? (
          <View style={styles.stars}>
            <Text style={styles.scoreLabel}>Stars</Text>
            <StarRow stars={stars} size={28} />
          </View>
        ) : null}
        <Text style={styles.best}>Best {best.toLocaleString()}</Text>
        <View style={styles.stack}>
          <GlossyButton label={primaryLabel} onPress={onPrimary} />
          <GlossyButton label={secondaryLabel} tone="secondary" onPress={onSecondary} />
          {tertiaryLabel && onTertiary ? <GlossyButton label={tertiaryLabel} tone="quiet" onPress={onTertiary} /> : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 32, 58, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.line,
  },
  kicker: {
    color: theme.muted,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 30,
    color: theme.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    color: theme.muted,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 0.6,
  },
  score: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    color: theme.blue,
  },
  stars: {
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  best: {
    color: theme.ink,
    fontFamily: 'Nunito_700Bold',
    marginTop: 4,
    marginBottom: 10,
  },
  stack: {
    alignSelf: 'stretch',
    gap: 10,
  },
});
