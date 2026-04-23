import { useEffect } from "react";
import { router } from "expo-router";
import { storage } from "@/core/storage";

export default function Index() {
    useEffect(() => {
        async function bootstrap() {
            const [seenOnboarding, isAuthed] = await Promise.all([
                storage.hasCompletedOnboarding(),
                storage.isAuthenticated(),
            ]);

            if (!seenOnboarding) {
                router.replace("/onboarding");
            } else if (isAuthed) {
                router.replace("/(tabs)");
            } else {
                router.replace("/(auth)/login");
            }
        }

        bootstrap();
    }, []);

    return null; // or a splash/loading indicator
}