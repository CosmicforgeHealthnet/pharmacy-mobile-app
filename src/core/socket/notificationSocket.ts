/**
 * @file notificationSocket.ts
 * @description Notification-specific WebSocket feature module.
 * Listens for server-pushed notification events and provides
 * callback-based subscription methods for use in React hooks.
 *
 * Events (incoming from server):
 *   - notification              → new notification received
 *   - notification_read         → a notification was marked as read
 *   - all_notifications_read    → all notifications marked as read
 *   - notification_deleted      → a notification was deleted
 *   - notification_counts       → unread counts updated
 *
 * Events (outgoing to server):
 *   - get_notification_counts   → request current counts
 *   - mark_notification_read    → mark a single notification as read
 */
import { Socket } from "socket.io-client";
import { socketCore } from "./socketClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SocketNotification {
   id: string;
   type: string;
   title: string;
   message: string;
   isRead: boolean;
   isDeleted: boolean;
   createdAt: string;
   userId?: string;
   data?: Record<string, any>;
}

export interface NotificationCounts {
   unread: number;
   total: number;
}

export interface MarkNotificationReadData {
   notificationId: string;
   userId: string;
}

export interface NotificationDeletedData {
   notificationId: string;
   userId: string;
}

// ─── Callback Manager ─────────────────────────────────────────────────────────

class CallbackManager<T extends (...args: any[]) => void> {
   private callbacks: T[] = [];

   add(cb: T): void {
      this.callbacks.push(cb);
   }

   remove(cb: T): boolean {
      const i = this.callbacks.indexOf(cb);
      if (i !== -1) { this.callbacks.splice(i, 1); return true; }
      return false;
   }

   execute(...args: Parameters<T>): void {
      this.callbacks.forEach((cb) => {
         try { cb(...args); } catch {}
      });
   }

   clear(): void { this.callbacks.length = 0; }

   get size(): number { return this.callbacks.length; }
}

// ─── Callback Registries ──────────────────────────────────────────────────────

const onNewNotification = new CallbackManager<(n: SocketNotification) => void>();
const onNotificationRead = new CallbackManager<(d: MarkNotificationReadData) => void>();
const onAllNotificationsRead = new CallbackManager<(d: { userId: string }) => void>();
const onNotificationDeleted = new CallbackManager<(d: NotificationDeletedData) => void>();
const onNotificationCounts = new CallbackManager<(c: NotificationCounts) => void>();

// ─── Feature Module ───────────────────────────────────────────────────────────

export const notificationSocket = {
   /** Called by socketCore after a successful connection. Sets up all event listeners. */
   setupListeners(socket: Socket) {
      // Remove stale listeners to prevent duplicates on reconnect
      const events = [
         "notification",
         "notification_read",
         "all_notifications_read",
         "notification_deleted",
         "notification_counts",
      ];
      events.forEach((e) => socket.off(e));

      // Incoming server events
      socket.on("notification", (n: SocketNotification) => {
         if (!n.isDeleted) {
            console.log("🔔 [Socket] New notification:", n.title);
            onNewNotification.execute(n);
         }
      });

      socket.on("notification_read", (d: MarkNotificationReadData) => {
         onNotificationRead.execute(d);
      });

      socket.on("all_notifications_read", (d: { userId: string }) => {
         onAllNotificationsRead.execute(d);
      });

      socket.on("notification_deleted", (d: NotificationDeletedData) => {
         onNotificationDeleted.execute(d);
      });

      socket.on("notification_counts", (c: NotificationCounts) => {
         onNotificationCounts.execute(c);
      });
   },

   // ─── Subscriptions ──────────────────────────────────────────────────────

   onNotification(cb: (n: SocketNotification) => void) { onNewNotification.add(cb); },
   offNotification(cb: (n: SocketNotification) => void) { return onNewNotification.remove(cb); },

   onNotificationRead(cb: (d: MarkNotificationReadData) => void) { onNotificationRead.add(cb); },
   offNotificationRead(cb: (d: MarkNotificationReadData) => void) { return onNotificationRead.remove(cb); },

   onAllRead(cb: (d: { userId: string }) => void) { onAllNotificationsRead.add(cb); },
   offAllRead(cb: (d: { userId: string }) => void) { return onAllNotificationsRead.remove(cb); },

   onDeleted(cb: (d: NotificationDeletedData) => void) { onNotificationDeleted.add(cb); },
   offDeleted(cb: (d: NotificationDeletedData) => void) { return onNotificationDeleted.remove(cb); },

   onCounts(cb: (c: NotificationCounts) => void) { onNotificationCounts.add(cb); },
   offCounts(cb: (c: NotificationCounts) => void) { return onNotificationCounts.remove(cb); },

   // ─── Emitters ───────────────────────────────────────────────────────────

   async requestCounts(userId: string): Promise<boolean> {
      return socketCore.emit("get_notification_counts", userId);
   },

   async markRead(data: { notificationId: string; userId: string }): Promise<boolean> {
      return socketCore.emit("mark_notification_read", data);
   },

   clearAll() {
      onNewNotification.clear();
      onNotificationRead.clear();
      onAllNotificationsRead.clear();
      onNotificationDeleted.clear();
      onNotificationCounts.clear();
   },
};

// Register the notification feature module with the core socket service
socketCore.registerFeature(notificationSocket);
