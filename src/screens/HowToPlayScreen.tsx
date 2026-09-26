import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlossyButton } from '../components/GlossyButton';
import { HowToContent } from '../components/HowToContent';
import { Screen } from '../components/Screen';
import { theme } from '../theme';

export function HowToPlayScreen() {
  const router = useRouter();
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How to Play</Text>
        <HowToContent />
        <View style={styles.back}>
          <GlossyButton label="Back" tone="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 30,
    color: theme.ink,
    textAlign: 'center',
  },
  back: {
    marginTop: 4,
  },
});
