/**
 * @file socketClient.ts
 * @description Singleton WebSocket core service for the Doctor mobile app.
 * Mirrors the web app's WebSocketCoreService, adapted for React Native.
 * Uses `storage.getToken()` for authentication (no browser localStorage).
 */
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { storage } from "../storage";
import { sessionEvents } from "../auth/sessionEvents";

// ─── Types ────────────────────────────────────────────────────────────────────

export enum ConnectionState {
   DISCONNECTED = "disconnected",
   CONNECTING = "connecting",
   CONNECTED = "connected",
   RECONNECTING = "reconnecting",
   ERROR = "error",
}

type SocketFeature = {
   setupListeners: (socket: Socket) => void;
};

// ─── Core Service ─────────────────────────────────────────────────────────────

class SocketCoreService {
   private socket: Socket | null = null;
   private static instance: SocketCoreService;
   private features: SocketFeature[] = [];
   private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
   private connectionPromise: Promise<Socket> | null = null;

   private constructor() {}

   /** Returns the singleton instance. */
   public static getInstance(): SocketCoreService {
      if (!SocketCoreService.instance) {
         SocketCoreService.instance = new SocketCoreService();
      }
      return SocketCoreService.instance;
   }

   /** Connect to the WebSocket server. Idempotent — safe to call multiple times. */
   public async connect(userId?: string): Promise<Socket> {
      if (this.socket?.connected) return this.socket;
      if (this.connectionPromise) return this.connectionPromise;

      this.connectionPromise = this.establishConnection(userId);
      return this.connectionPromise;
   }

   private async establishConnection(userId?: string): Promise<Socket> {
      const token = await storage.getToken();

      if (!token) {
         this.connectionPromise = null;
         throw new Error("Authentication required for WebSocket connection");
      }

      // Socket URL from app config (app.json extra.socketUrl)
      // Falls back to deriving from apiUrl or using production URL
      const socketUrl =
         Constants.expoConfig?.extra?.socketUrl ||
         Constants.expoConfig?.extra?.apiUrl?.replace("/api", "") ||
         "https://api.cosmicforge-healthnet.com";

      this.connectionState = ConnectionState.CONNECTING;

      console.log("🔌 [Socket] Connecting to:", socketUrl);

      this.socket = io(socketUrl, {
         // path: "/socket.io", // Uncomment and change if server uses custom path
         transports: ["polling", "websocket"], // Try polling first, more reliable on mobile
         timeout: 20000,
         autoConnect: true,
         reconnection: true,
         reconnectionAttempts: 3,
         reconnectionDelay: 2000,
         forceNew: true,
         auth: {
            token,
            authorization: `Bearer ${token}`,
         },
         query: { token },
      });

      return new Promise((resolve, reject) => {
         const connectionTimeout = setTimeout(() => {
            this.connectionPromise = null;
            reject(new Error("WebSocket connection timeout"));
         }, 25000);

         this.socket!.on("connect", () => {
            clearTimeout(connectionTimeout);
            this.connectionState = ConnectionState.CONNECTED;
            this.connectionPromise = null;

            // Join the user's personal room for targeted events
            if (userId) {
               this.socket?.emit("join-user-room", userId);
            }

            // Register all features that were queued before connection
            this.features.forEach((f) => f.setupListeners(this.socket!));

            console.log("🔗 [Socket] Connected to WebSocket server");
            resolve(this.socket!);
         });

         this.socket!.on("disconnect", (reason: string) => {
            this.connectionState = ConnectionState.DISCONNECTED;
            this.connectionPromise = null;
            console.log(`🔌 [Socket] Disconnected: ${reason}`);
         });

         this.socket!.on("reconnect_attempt", (attemptNumber: number) => {
            this.connectionState = ConnectionState.RECONNECTING;
            console.log(`🔄 [Socket] Reconnecting... (attempt ${attemptNumber})`);
         });

         this.socket!.on("connect_error", async (error: Error) => {
            clearTimeout(connectionTimeout);
            this.connectionState = ConnectionState.ERROR;
            this.connectionPromise = null;
            console.error("❌ [Socket] Connection error:", error.message);

            // Check for authentication-related errors
            const authErrors = [
               "user not found",
               "invalid token",
               "token expired",
               "unauthorized",
               "authentication failed",
               "not authenticated",
            ];
            const isAuthError = authErrors.some(msg =>
               error.message.toLowerCase().includes(msg)
            );

            if (isAuthError) {
               // Stop reconnection attempts for auth errors
               this.socket?.disconnect();
               this.socket = null;
               // Clear auth and redirect to login
               await storage.clearAuth();
               sessionEvents.emitUnauthorized();
            }

            reject(error);
         });
      });
   }

   /**
    * Register a feature module. If already connected, sets up listeners immediately.
    * Otherwise, listeners will be set up on next successful connect.
    */
   public registerFeature(feature: SocketFeature): void {
      this.features.push(feature);
      if (this.socket?.connected) {
         feature.setupListeners(this.socket);
      }
   }

   /** Emit a socket event. Connects first if not already connected. */
   public async emit(event: string, data?: any): Promise<boolean> {
      try {
         if (!this.isConnected()) {
            await this.connect();
         }
         if (!this.socket?.connected) return false;
         this.socket.emit(event, data);
         return true;
      } catch {
         return false;
      }
   }

   /** Cleanly disconnect and reset all state. */
   public disconnect(): void {
      this.connectionState = ConnectionState.DISCONNECTED;
      this.connectionPromise = null;
      this.socket?.disconnect();
      this.socket = null;
      console.log("🔌 [Socket] Manually disconnected");
   }

   public getSocket(): Socket | null {
      return this.socket;
   }

   public isConnected(): boolean {
      return this.socket?.connected ?? false;
   }

   public getConnectionState(): ConnectionState {
      return this.connectionState;
   }
}

export const socketCore = SocketCoreService.getInstance();
