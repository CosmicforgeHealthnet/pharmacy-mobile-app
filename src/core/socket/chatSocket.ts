/**
 * @file chatSocket.ts
 * @description Chat-specific WebSocket feature module for the Doctor mobile app.
 * Plugs into the existing `socketCore` singleton (same pattern as notificationSocket).
 *
 * Incoming server events:
 *   - new_message              → a new chat message was sent
 *   - message_edited           → an existing message was edited
 *   - message_deleted          → a message was deleted
 *   - message_read             → a message was read by a participant
 *   - typing_start             → someone started typing
 *   - typing_stop              → someone stopped typing
 *   - appointment_joined       → a participant joined an appointment chat
 *   - appointment_ended        → an appointment chat session ended
 *
 * Outgoing client events:
 *   - join_room                → join a specific chat room
 *   - leave_room               → leave a specific chat room
 *   - typing_start             → broadcast "I am typing"
 *   - typing_stop              → broadcast "I stopped typing"
 *   - join_appointment_chat    → join an appointment-based chat room
 */
import { Socket } from "socket.io-client";
import { socketCore } from "./socketClient";
import { CallbackManager } from "./CallbackManager";
import { ChatMessage, AppointmentChat } from "@/features/messages/types";

// ─── Callback Registries ──────────────────────────────────────────────────────

const onNewMessageCbs = new CallbackManager<(m: ChatMessage) => void>();
const onMessageEditedCbs = new CallbackManager<(m: ChatMessage) => void>();
const onMessageDeletedCbs = new CallbackManager<
   (d: { messageId: string; soft: boolean }) => void
>();
const onMessageReadCbs = new CallbackManager<
   (d: { messageId: string; readBy: string }) => void
>();
const onTypingStartCbs = new CallbackManager<(d: { roomId: string; user: any }) => void>();
const onTypingStopCbs = new CallbackManager<(d: { roomId: string; user: any }) => void>();
const onAppointmentJoinedCbs = new CallbackManager<
   (d: { appointmentChat: AppointmentChat; room: any }) => void
>();
const onAppointmentEndedCbs = new CallbackManager<
   (d: { appointmentChat: AppointmentChat }) => void
>();

// ─── Feature Module ───────────────────────────────────────────────────────────

export const chatSocket = {
   /** Called by socketCore on each successful (re)connect. */
   setupListeners(socket: Socket) {
      const events = [
         "new_message",
         "new_chat_message",
         "message_edited",
         "message_deleted",
         "message_read",
         "user_typing",
         "appointment_status",
         "appointment_joined",
         "appointment_ended",
      ];
      // Remove stale listeners to prevent duplicates on reconnect
      events.forEach((e) => socket.off(e));

      socket.on("new_message", (m: ChatMessage) => {
         console.log("💬 [ChatSocket] new_message:", m.id);
         onNewMessageCbs.execute(m);
      });

      // Handle both event names for compatibility with different server implementations
      socket.on("new_chat_message", (m: ChatMessage) => {
         console.log("💬 [ChatSocket] new_chat_message:", m.id);
         onNewMessageCbs.execute(m);
      });

      socket.on("message_edited", (d: any) => {
         onMessageEditedCbs.execute(d);
      });

      socket.on("message_deleted", (d: { messageId: string; deletedAt: string; soft?: boolean }) => {
         onMessageDeletedCbs.execute({ messageId: d.messageId, soft: !!d.soft });
      });

      socket.on("message_read", (d: any) => {
         onMessageReadCbs.execute({ messageId: d.messageId, readBy: d.readByUserId });
      });

      socket.on("user_typing", (d: { roomId: string; userId: string; isTyping: boolean }) => {
         if (d.isTyping) {
            onTypingStartCbs.execute({ roomId: d.roomId, user: { id: d.userId } });
         } else {
            onTypingStopCbs.execute({ roomId: d.roomId, user: { id: d.userId } });
         }
      });

      socket.on("appointment_joined", (d: any) => {
         onAppointmentJoinedCbs.execute(d);
      });

      socket.on("appointment_ended", (d: { appointmentChat: AppointmentChat }) => {
         console.log("📅 [ChatSocket] appointment_ended:", d.appointmentChat?.id);
         onAppointmentEndedCbs.execute(d);
      });
   },

   // ─── Subscriptions ────────────────────────────────────────────────────────

   onNewMessage(cb: (m: ChatMessage) => void) { onNewMessageCbs.add(cb); },
   offNewMessage(cb: (m: ChatMessage) => void) { return onNewMessageCbs.remove(cb); },

   onMessageEdited(cb: (m: ChatMessage) => void) { onMessageEditedCbs.add(cb); },
   offMessageEdited(cb: (m: ChatMessage) => void) { return onMessageEditedCbs.remove(cb); },

   onMessageDeleted(cb: (d: { messageId: string; soft: boolean }) => void) {
      onMessageDeletedCbs.add(cb);
   },
   offMessageDeleted(cb: (d: { messageId: string; soft: boolean }) => void) {
      return onMessageDeletedCbs.remove(cb);
   },

   onMessageRead(cb: (d: { messageId: string; readBy: string }) => void) {
      onMessageReadCbs.add(cb);
   },
   offMessageRead(cb: (d: { messageId: string; readBy: string }) => void) {
      return onMessageReadCbs.remove(cb);
   },

   onTypingStart(cb: (d: { roomId: string; user: any }) => void) { onTypingStartCbs.add(cb); },
   offTypingStart(cb: (d: { roomId: string; user: any }) => void) {
      return onTypingStartCbs.remove(cb);
   },

   onTypingStop(cb: (d: { roomId: string; user: any }) => void) { onTypingStopCbs.add(cb); },
   offTypingStop(cb: (d: { roomId: string; user: any }) => void) {
      return onTypingStopCbs.remove(cb);
   },

   onAppointmentJoined(
      cb: (d: { appointmentChat: AppointmentChat; room: any }) => void,
   ) { onAppointmentJoinedCbs.add(cb); },
   offAppointmentJoined(
      cb: (d: { appointmentChat: AppointmentChat; room: any }) => void,
   ) { return onAppointmentJoinedCbs.remove(cb); },

   onAppointmentEnded(cb: (d: { appointmentChat: AppointmentChat }) => void) {
      onAppointmentEndedCbs.add(cb);
   },
   offAppointmentEnded(cb: (d: { appointmentChat: AppointmentChat }) => void) {
      return onAppointmentEndedCbs.remove(cb);
   },

   // ─── Emitters ─────────────────────────────────────────────────────────────

   async joinRoom(roomId: string): Promise<boolean> {
      return socketCore.emit("join_room", { roomId });
   },

   async leaveRoom(roomId: string): Promise<boolean> {
      return socketCore.emit("leave_room", { roomId });
   },

   async sendTypingStart(roomId: string): Promise<boolean> {
      return socketCore.emit("typing_start", { roomId });
   },

   async sendTypingStop(roomId: string): Promise<boolean> {
      return socketCore.emit("typing_stop", { roomId });
   },

   async joinAppointmentChat(appointmentId: string): Promise<boolean> {
      return socketCore.emit("join_appointment_chat", { appointmentChatId: appointmentId });
   },

   clearAll() {
      onNewMessageCbs.clear();
      onMessageEditedCbs.clear();
      onMessageDeletedCbs.clear();
      onMessageReadCbs.clear();
      onTypingStartCbs.clear();
      onTypingStopCbs.clear();
      onAppointmentJoinedCbs.clear();
      onAppointmentEndedCbs.clear();
   },
};

// Register the chat feature module with the core socket service so it
// receives setupListeners() on every (re)connect automatically.
socketCore.registerFeature(chatSocket);
