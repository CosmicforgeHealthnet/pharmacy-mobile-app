import { DeviceEventEmitter, EmitterSubscription } from "react-native";

const EVENTS = {
   UNAUTHORIZED: "session_unauthorized",
   TIMEOUT: "session_timeout",
} as const;

/**
 * Cross-module event bus for session lifecycle events.
 * The API client emits UNAUTHORIZED when token refresh fails.
 * The session timeout hook emits TIMEOUT after inactivity.
 * The drawer layout listens to both and performs logout + redirect.
 */
export const sessionEvents = {
   emitUnauthorized(): void {
      DeviceEventEmitter.emit(EVENTS.UNAUTHORIZED);
   },

   emitTimeout(): void {
      DeviceEventEmitter.emit(EVENTS.TIMEOUT);
   },

   onUnauthorized(callback: () => void): EmitterSubscription {
      return DeviceEventEmitter.addListener(EVENTS.UNAUTHORIZED, callback);
   },

   onTimeout(callback: () => void): EmitterSubscription {
      return DeviceEventEmitter.addListener(EVENTS.TIMEOUT, callback);
   },
};
