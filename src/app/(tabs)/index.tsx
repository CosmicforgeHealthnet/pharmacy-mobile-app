
// ─────────────────────────────────────────
// app/(main)/index.tsx  —  your home screen
// ─────────────────────────────────────────
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>Welcome to the App 🎉</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#120E3C",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
});