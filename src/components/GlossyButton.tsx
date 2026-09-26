import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { confirmTap } from '../utils/feedback';

interface Props {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'quiet';
  disabled?: boolean;
}

export function GlossyButton({ label, onPress, tone = 'primary', disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        confirmTap('light');
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        tone === 'primary' && styles.primary,
        tone === 'secondary' && styles.secondary,
        tone === 'quiet' && styles.quiet,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {tone === 'primary' ? <View style={styles.shine} /> : null}
      <Text style={[styles.label, tone !== 'primary' && styles.labelDark]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: theme.blue,
    shadowColor: theme.blueDark,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D5E6FA',
  },
  quiet: {
    backgroundColor: '#F4F8FC',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    letterSpacing: 0.4,
  },
  labelDark: {
    color: theme.ink,
  },
});
