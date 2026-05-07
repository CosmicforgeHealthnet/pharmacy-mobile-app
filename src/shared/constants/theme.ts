/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";


export const Colors = {
  light: {
    text: "#030303",
    background: "#FFFFFF",
    tint: "#272EA7",
    icon: "#8F90A4",
    tabIconDefault: "#8F90A4",
    tabIconSelected: "#272EA7",
    primary: "#272EA7",
    inputBackground: "#F5F5F5",
    placeholder: "#8F90A4",
    border: "#E5E7EB",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: "#272EA7",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#272EA7",
    primary: "#272EA7",
    inputBackground: "#2A2A2A",
    placeholder: "#9BA1A6",
    border: "#333333",
  },
};

export const OnboardingColors = {
  background: "#120E3C",
  backgroundSecondary: "#1A1560",
  primary: "#272EA7",
  primaryLight: "#5B4FE8",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.6)",
  textSubtle: "rgba(255,255,255,0.55)",
  dot: "#FFFFFF",
  gradientOverlay: ["transparent", "rgba(18,14,60,0.55)", "#120E3C"] as const,
  gradientPanel: ["#120E3C", "#1A1560", "#120E3C"] as const,
  gradientButton: ["#272EA7", "#272EA7"] as const,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
