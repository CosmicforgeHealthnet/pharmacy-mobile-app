import { useAppTheme } from '@/core/providers/AppThemeProvider';

/**
 * Custom hook that returns the current theme ('light' or 'dark').
 * It respects the manual toggle from the AppThemeProvider.
 */
export function useColorScheme() {
  const { theme } = useAppTheme();
  return theme;
}
