import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { Colors } from "./theme";

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    text: Colors.light.text,
    placeholder: Colors.light.placeholder,
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    text: Colors.dark.text,
    placeholder: Colors.dark.placeholder,
  },
};
