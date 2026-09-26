import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSoundSetup } from '../audio/useSoundSetup';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ProgressProvider, useProgress } from '../progress/ProgressContext';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { ready } = useProgress();
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  useSoundSetup();

  useEffect(() => {
    if ((fontsLoaded || fontError) && ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontError, fontsLoaded, ready]);

  if (!ready || (!fontsLoaded && !fontError)) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="game/[level]" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ProgressProvider>
            <RootNavigator />
          </ProgressProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
