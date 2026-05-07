import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Sensitive keys stored in the device's secure enclave
const SECURE_KEYS = {
   AUTH_TOKEN: "auth_token",
   REFRESH_TOKEN: "refresh_token",
} as const;

// Non-sensitive keys stored in AsyncStorage
const ASYNC_KEYS = {
   USER_DATA: "@user_data",
   THEME: "@theme",
   LANGUAGE: "@language",
   ONBOARDING_COMPLETED: "@onboarding_completed",
   APP_SETTINGS: "@app_settings",
   NEEDS_VERIFICATION: "@needs_verification",
} as const;

// Exported union for consumers that need raw key access
export const STORAGE_KEYS = { ...SECURE_KEYS, ...ASYNC_KEYS } as const;

type StorageValue = string | number | boolean | object | null;

// ─── Secure helpers ────────────────────────────────────────────────────────────

async function secureGet(key: string): Promise<string | null> {
   try {
      return await SecureStore.getItemAsync(key);
   } catch {
      return null;
   }
}

async function secureSet(key: string, value: string): Promise<void> {
   await SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string): Promise<void> {
   try {
      await SecureStore.deleteItemAsync(key);
   } catch {
      // already absent — ignore
   }
}

// ─── Async helpers ─────────────────────────────────────────────────────────────

async function asyncGet<T>(key: string): Promise<T | null> {
   try {
      const raw = await AsyncStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : null;
   } catch {
      return null;
   }
}

async function asyncSet(key: string, value: StorageValue): Promise<void> {
   await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function asyncDelete(key: string): Promise<void> {
   await AsyncStorage.removeItem(key);
}

// ─── Storage class ─────────────────────────────────────────────────────────────

class Storage {
   // ── Auth tokens (SecureStore) ─────────────────────────────────────────────

   async setToken(token: string): Promise<void> {
      await secureSet(SECURE_KEYS.AUTH_TOKEN, token);
   }

   async getToken(): Promise<string | null> {
      return secureGet(SECURE_KEYS.AUTH_TOKEN);
   }

   async removeToken(): Promise<void> {
      await secureDelete(SECURE_KEYS.AUTH_TOKEN);
   }

   async setRefreshToken(token: string): Promise<void> {
      await secureSet(SECURE_KEYS.REFRESH_TOKEN, token);
   }

   async getRefreshToken(): Promise<string | null> {
      return secureGet(SECURE_KEYS.REFRESH_TOKEN);
   }

   async removeRefreshToken(): Promise<void> {
      await secureDelete(SECURE_KEYS.REFRESH_TOKEN);
   }

   /** Clear all auth credentials (tokens + user data). */
   async clearAuth(): Promise<void> {
      await Promise.all([
         secureDelete(SECURE_KEYS.AUTH_TOKEN),
         secureDelete(SECURE_KEYS.REFRESH_TOKEN),
         asyncDelete(ASYNC_KEYS.USER_DATA),
      ]);
   }

   async isAuthenticated(): Promise<boolean> {
      return (await this.getToken()) !== null;
   }

   // ── User data (AsyncStorage) ──────────────────────────────────────────────

   async setUserData<T extends object>(userData: T): Promise<void> {
      await asyncSet(ASYNC_KEYS.USER_DATA, userData);
   }

   async getUserData<T = any>(): Promise<T | null> {
      return asyncGet<T>(ASYNC_KEYS.USER_DATA);
   }

   async removeUserData(): Promise<void> {
      await asyncDelete(ASYNC_KEYS.USER_DATA);
   }

   // ── App preferences (AsyncStorage) ────────────────────────────────────────

   async setTheme(theme: "light" | "dark" | "system"): Promise<void> {
      await asyncSet(ASYNC_KEYS.THEME, theme);
   }

   async getTheme(): Promise<"light" | "dark" | "system" | null> {
      return asyncGet<"light" | "dark" | "system">(ASYNC_KEYS.THEME);
   }

   async setLanguage(language: string): Promise<void> {
      await asyncSet(ASYNC_KEYS.LANGUAGE, language);
   }

   async getLanguage(): Promise<string | null> {
      return asyncGet<string>(ASYNC_KEYS.LANGUAGE);
   }

   async setOnboardingCompleted(completed: boolean): Promise<void> {
      await asyncSet(ASYNC_KEYS.ONBOARDING_COMPLETED, completed);
   }

   async hasCompletedOnboarding(): Promise<boolean> {
      return (await asyncGet<boolean>(ASYNC_KEYS.ONBOARDING_COMPLETED)) === true;
   }

   // ── Verification status ────────────────────────────────────────────────────

   async setNeedsVerification(needsVerification: boolean): Promise<void> {
      await asyncSet(ASYNC_KEYS.NEEDS_VERIFICATION, needsVerification);
   }

   async getNeedsVerification(): Promise<boolean> {
      return (await asyncGet<boolean>(ASYNC_KEYS.NEEDS_VERIFICATION)) === true;
   }

   async clearNeedsVerification(): Promise<void> {
      await asyncDelete(ASYNC_KEYS.NEEDS_VERIFICATION);
   }

   async setAppSettings<T extends object>(settings: T): Promise<void> {
      await asyncSet(ASYNC_KEYS.APP_SETTINGS, settings);
   }

   async getAppSettings<T = any>(): Promise<T | null> {
      return asyncGet<T>(ASYNC_KEYS.APP_SETTINGS);
   }

   // ── Generic AsyncStorage passthrough (for non-auth, non-sensitive data) ───

   async setItem(key: string, value: StorageValue): Promise<void> {
      await asyncSet(key, value);
   }

   async getItem<T = StorageValue>(key: string): Promise<T | null> {
      return asyncGet<T>(key);
   }

   async removeItem(key: string): Promise<void> {
      await asyncDelete(key);
   }

   async clear(): Promise<void> {
      await AsyncStorage.clear();
   }

   async getAllKeys(): Promise<readonly string[]> {
      return AsyncStorage.getAllKeys();
   }

   // ── Device Fingerprint ──────────────────────────────────────────────────────

   async getDeviceFingerprint(): Promise<string> {
      let fp = await asyncGet<string>("@device_fingerprint");
      if (!fp) {
         fp = "mobile_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
         await asyncSet("@device_fingerprint", fp);
      }
      return fp;
   }
}

export const storage = new Storage();
