import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlossyButton } from './GlossyButton';
import { ToggleRow } from './ToggleRow';
import { useProgress } from '../progress/ProgressContext';
import { theme } from '../theme';

export function SettingsPanel({ showHowTo = true }: { showHowTo?: boolean }) {
  const router = useRouter();
  const { settings, updateSettings, resetProgress } = useProgress();

  return (
    <View style={styles.stack}>
      <ToggleRow label="Sound" value={settings.sound} onChange={(sound) => updateSettings({ sound })} />
      <ToggleRow label="Music" value={settings.music} onChange={(music) => updateSettings({ music })} />
      <ToggleRow label="Vibration" value={settings.vibration} onChange={(vibration) => updateSettings({ vibration })} />
      {showHowTo ? <GlossyButton label="How to Play" tone="secondary" onPress={() => router.push('/howto')} /> : null}
      <GlossyButton
        label="Reset Progress"
        tone="quiet"
        onPress={() => {
          Alert.alert('Reset progress?', 'Levels, stars, and best scores will be cleared.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: resetProgress },
          ]);
        }}
      />
      <Text style={styles.note}>Sound clips can be added later. The game stays fully playable while sound is off.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  note: {
    color: theme.muted,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
