import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DarkTheme as PaperDarkTheme, LightTheme as PaperLightTheme } from '@/shared/constants/paperTheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Navigation theme
  const navigationTheme = isDark ? NavDarkTheme : NavDefaultTheme;

  // Paper theme
  const paperTheme = isDark ? PaperDarkTheme : PaperLightTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <PaperProvider theme={paperTheme}>
        <Stack >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>

        <StatusBar style={isDark ? 'light' : 'dark'} />
      </PaperProvider>
    </ThemeProvider>
  );
}