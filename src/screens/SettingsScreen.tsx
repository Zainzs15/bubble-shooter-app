import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlossyButton } from '../components/GlossyButton';
import { Screen } from '../components/Screen';
import { SettingsPanel } from '../components/SettingsPanel';
import { theme } from '../theme';

export function SettingsScreen() {
  const router = useRouter();
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <SettingsPanel />
        <View style={styles.back}>
          <GlossyButton label="Back" tone="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 18,
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 30,
    color: theme.ink,
    textAlign: 'center',
  },
  back: {
    marginTop: 8,
  },
});
