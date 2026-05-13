import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { DarkTheme as PaperDarkTheme, LightTheme as PaperLightTheme } from '@/shared/constants/paperTheme';
import { QueryProvider } from '@/core/providers/QueryProvider';
import { AppThemeProvider, useAppTheme } from '@/core/providers/AppThemeProvider';
import { sessionEvents } from '@/core/auth/sessionEvents';
import { storage } from '@/core/storage';

function MainLayout() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  // Navigation theme
  const navigationTheme = isDark ? NavDarkTheme : NavDefaultTheme;

  // Paper theme
  const paperTheme = isDark ? PaperDarkTheme : PaperLightTheme;

  // Listen for unauthorized events and redirect to login
  useEffect(() => {
    const handleUnauthorized = async () => {
      console.log('🔒 Session unauthorized - redirecting to login');
      await storage.clearAuth();
      router.replace('/(auth)/login');
    };

    const handleTimeout = async () => {
      console.log('⏰ Session timeout - redirecting to login');
      await storage.clearAuth();
      router.replace('/(auth)/login');
    };

    const unsubUnauthorized = sessionEvents.onUnauthorized(handleUnauthorized);
    const unsubTimeout = sessionEvents.onTimeout(handleTimeout);

    return () => {
      unsubUnauthorized.remove();
      unsubTimeout.remove();
    };
  }, []);

  return (
    <ThemeProvider value={navigationTheme}>
      <PaperProvider theme={paperTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="invoice/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="prescription/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="wallet" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
        </Stack>

        <StatusBar style={isDark ? 'light' : 'dark'} />
      </PaperProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <AppThemeProvider>
        <MainLayout />
      </AppThemeProvider>
    </QueryProvider>
  );
}