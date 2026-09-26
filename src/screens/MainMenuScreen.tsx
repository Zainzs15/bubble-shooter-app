import { useRouter } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GlossyButton } from '../components/GlossyButton';
import { MenuBubbles } from '../components/MenuBubbles';
import { Screen } from '../components/Screen';
import { TitleLogo } from '../components/TitleLogo';
import { theme } from '../theme';

export function MainMenuScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  return (
    <Screen>
      <View style={styles.root}>
        <MenuBubbles width={width} height={height} />
        <View style={styles.content}>
          <TitleLogo width={width} />
          <Text style={styles.tag}>Match. Drop. Clear.</Text>
          <View style={styles.actions}>
            <GlossyButton label="Play" onPress={() => router.push('/levels')} />
            <GlossyButton label="Levels" tone="secondary" onPress={() => router.push('/levels')} />
            <GlossyButton label="How to Play" tone="secondary" onPress={() => router.push('/howto')} />
            <GlossyButton label="Settings" tone="quiet" onPress={() => router.push('/settings')} />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 18,
  },
  tag: {
    textAlign: 'center',
    color: theme.muted,
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    marginTop: -8,
  },
  actions: {
    gap: 12,
    marginTop: 12,
  },
});
