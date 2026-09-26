import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlossyButton } from '../GlossyButton';
import { SettingsPanel } from '../SettingsPanel';
import { theme } from '../../theme';

interface Props {
  onResume: () => void;
  onRestart: () => void;
}

export function PauseOverlay({ onResume, onRestart }: Props) {
  const router = useRouter();
  const [page, setPage] = useState<'main' | 'settings'>('main');

  useEffect(() => {
    setPage('main');
  }, []);

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>{page === 'settings' ? 'Settings' : 'Paused'}</Text>
        {page === 'main' ? (
          <View style={styles.stack}>
            <GlossyButton label="Resume" onPress={onResume} />
            <GlossyButton label="Restart" tone="secondary" onPress={onRestart} />
            <GlossyButton label="Settings" tone="secondary" onPress={() => setPage('settings')} />
            <GlossyButton label="Main Menu" tone="quiet" onPress={() => router.replace('/')} />
          </View>
        ) : (
          <View style={styles.stack}>
            <SettingsPanel showHowTo={false} />
            <GlossyButton label="Back" tone="secondary" onPress={() => setPage('main')} />
          </View>
        )}
      </View>
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
    backgroundColor: 'rgba(12, 32, 58, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: theme.line,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: theme.ink,
  },
  stack: {
    gap: 10,
  },
});
