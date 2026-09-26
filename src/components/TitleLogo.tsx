import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function TitleLogo({ width }: { width: number }) {
  const size = Math.min(36, Math.max(26, width * 0.078));
  return (
    <View style={styles.wrap}>
      <Text style={[styles.base, styles.shadow, { fontSize: size }]}>BUBBLE SHOOTER</Text>
      <Text style={[styles.base, styles.main, { fontSize: size }]}>BUBBLE SHOOTER</Text>
      <View style={[styles.glossClip, { height: size * 0.46 }]}>
        <Text style={[styles.base, styles.gloss, { fontSize: size }]}>BUBBLE SHOOTER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  base: {
    fontFamily: 'Fredoka_700Bold',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  shadow: {
    position: 'absolute',
    color: '#8FB4FF',
    top: 3,
  },
  main: {
    color: theme.blue,
    textShadowColor: 'rgba(47, 123, 255, 0.28)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  glossClip: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    overflow: 'hidden',
  },
  gloss: {
    color: 'rgba(255,255,255,0.72)',
  },
});
