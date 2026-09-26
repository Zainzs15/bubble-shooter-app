import { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { backgroundConfig } from '../config/background';

export function Screen({ children }: { children: ReactNode }) {
  const body = <View style={styles.flex}>{children}</View>;
  if (backgroundConfig.enabled && backgroundConfig.source) {
    return (
      <ImageBackground source={backgroundConfig.source} resizeMode="cover" style={styles.safe}>
        <SafeAreaView style={styles.safe}>{body}</SafeAreaView>
      </ImageBackground>
    );
  }
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: backgroundConfig.color }]}>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});
