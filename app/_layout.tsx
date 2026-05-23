import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

const DevMenuPreferences = requireOptionalNativeModule('DevMenuPreferences');

if (process.env.EXPO_PUBLIC_SCREENSHOT_MODE === 'true') {
  LogBox.ignoreAllLogs();
}


export default function RootLayout() {
  const colorScheme = useColorScheme();
  console.log('EXPO_PUBLIC_SCREENSHOT_MODE in layout:', process.env.EXPO_PUBLIC_SCREENSHOT_MODE);

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_SCREENSHOT_MODE === 'true') {
      console.log('DevMenuPreferences native module is present:', !!DevMenuPreferences);
      try {
        DevMenuPreferences?.setPreferencesAsync({
          showFloatingActionButton: false,
          motionGestureEnabled: true,
          touchGestureEnabled: true,
          showsAtLaunch: false,
        });
      } catch (e) {
        console.warn('Failed to configure dev menu preferences:', e);
      }
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="flower-detail" />
        <Stack.Screen name="+not-found" options={{ headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
