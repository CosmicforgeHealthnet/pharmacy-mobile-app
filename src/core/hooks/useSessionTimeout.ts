import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { sessionEvents } from "../auth/sessionEvents";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Emits a session timeout event after the app has been in the background
 * for longer than TIMEOUT_MS.  Mount this hook once inside the authenticated
 * drawer layout so it is active for the entire logged-in session.
 */
export function useSessionTimeout() {
   const backgroundedAt = useRef<number | null>(null);

   useEffect(() => {
      const subscription = AppState.addEventListener(
         "change",
         (nextState: AppStateStatus) => {
            if (nextState === "background" || nextState === "inactive") {
               backgroundedAt.current = Date.now();
            } else if (nextState === "active") {
               if (backgroundedAt.current !== null) {
                  const elapsed = Date.now() - backgroundedAt.current;
                  if (elapsed >= TIMEOUT_MS) {
                     sessionEvents.emitTimeout();
                  }
               }
               backgroundedAt.current = null;
            }
         },
      );

      return () => subscription.remove();
   }, []);
}
