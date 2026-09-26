import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const STEPS = [
  ['1', 'Aim the cannon', 'Drag anywhere on the board. The cannon follows your finger.'],
  ['2', 'Shoot the bubble', 'Release to fire the loaded bubble. The next color slides into place.'],
  ['3', 'Match 3 or more', 'Connect three or more bubbles of the same color and they pop.'],
  ['4', 'Drop loose bubbles', 'Anything that loses its connection to the ceiling falls for bonus points.'],
  ['5', 'Clear the formation', 'Empty the board to finish the level and earn stars.'],
];

export function HowToContent() {
  return (
    <View style={styles.stack}>
      {STEPS.map(([index, title, body]) => (
        <View key={index} style={styles.step}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{index}</Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>
        </View>
      ))}
      <View style={styles.card}>
        <Text style={styles.title}>Wall bounce</Text>
        <Text style={styles.body}>Shots rebound off the side walls and keep their angle. Use a bank shot to reach bubbles tucked behind a cluster.</Text>
        <View style={styles.diagram}>
          <View style={styles.wall} />
          <View style={[styles.dot, { left: 28, bottom: 18, backgroundColor: '#2F6BFF' }]} />
          <View style={[styles.dot, { left: 58, bottom: 48, backgroundColor: '#8EB4FF' }]} />
          <View style={[styles.dot, { left: 18, bottom: 78, backgroundColor: '#8EB4FF' }]} />
          <View style={[styles.dot, { left: 48, bottom: 112, backgroundColor: '#8EB4FF' }]} />
          <View style={[styles.bubble, { right: 28, top: 16, backgroundColor: '#FF5A5A' }]} />
          <View style={[styles.bubble, { right: 58, top: 16, backgroundColor: '#3DDC97' }]} />
          <View style={[styles.bubble, { right: 42, top: 42, backgroundColor: '#FFC400' }]} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Misses</Text>
        <Text style={styles.body}>Shots that do not make a match fill the miss meter. When it fills, a new row drops from the ceiling. Clear matches to keep the board under the danger line.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.line,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_800ExtraBold',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.ink,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
  },
  body: {
    color: theme.muted,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.line,
    gap: 8,
  },
  diagram: {
    height: 150,
    borderRadius: 14,
    backgroundColor: '#F8FBFF',
    overflow: 'hidden',
  },
  wall: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: '#D7E4F4',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bubble: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
});
