import { useCallback, useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_ENABLED_KEY = "@biometric_enabled";

export interface UseBiometricResult {
   /** Device supports biometric hardware AND has enrolled credentials. */
   isSupported: boolean;
   /** User has opted in to biometric lock. */
   isEnabled: boolean;
   /** Prompt the biometric dialog.  Resolves true on success, false on failure/cancel. */
   authenticate: () => Promise<boolean>;
   /** Persist the user's preference. */
   setEnabled: (value: boolean) => Promise<void>;
   loading: boolean;
}

export function useBiometric(): UseBiometricResult {
   const [isSupported, setIsSupported] = useState(false);
   const [isEnabled, setIsEnabledState] = useState(false);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      (async () => {
         const hardware = await LocalAuthentication.hasHardwareAsync();
         const enrolled = await LocalAuthentication.isEnrolledAsync();
         const supported = hardware && enrolled;
         setIsSupported(supported);

         const stored = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
         setIsEnabledState(supported && stored === "true");
         setLoading(false);
      })();
   }, []);

   const authenticate = useCallback(async (): Promise<boolean> => {
      if (!isSupported) return true; // nothing to check — let user through
      const result = await LocalAuthentication.authenticateAsync({
         promptMessage: "Verify your identity",
         fallbackLabel: "Use passcode",
         cancelLabel: "Cancel",
         disableDeviceFallback: false,
      });
      return result.success;
   }, [isSupported]);

   const setEnabled = useCallback(
      async (value: boolean) => {
         if (value && !isSupported) return; // can't enable on unsupported device
         await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, value ? "true" : "false");
         setIsEnabledState(value);
      },
      [isSupported],
   );

   return { isSupported, isEnabled, authenticate, setEnabled, loading };
}
