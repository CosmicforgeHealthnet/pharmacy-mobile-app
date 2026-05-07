import { useCallback } from "react";
import { router } from "expo-router";
import { storage } from "@/core/storage";

export function useOnboarding() {
  const markAsSeen = useCallback(async () => {
    try {
      await storage.setOnboardingCompleted(true);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
      router.replace("/(auth)/login");
    }
  }, []);

  const checkIfSeen = useCallback(async (): Promise<boolean> => {
    return storage.hasCompletedOnboarding();
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await storage.setOnboardingCompleted(false);
    } catch (error) {
      console.error("Failed to reset onboarding state:", error);
    }
  }, []);

  return { markAsSeen, checkIfSeen, resetOnboarding };
}
