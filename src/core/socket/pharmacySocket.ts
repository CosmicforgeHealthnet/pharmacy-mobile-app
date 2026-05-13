/**
 * @file pharmacySocket.ts
 * @description Pharmacy-specific WebSocket feature module.
 * Listens for pharmacy-specific server-pushed events.
 *
 * Events (incoming from server):
 *   - new_prescription           → Patient assigned prescription to pharmacy
 *   - prescription_status_changed → Status transition (payment, ready, dispatched, etc.)
 *   - payment_received           → Patient paid an invoice
 *   - dispute_raised             → Patient raised a dispute
 *   - notification               → Generic bell notification (payout, dispute resolved, etc.)
 */
import { Socket } from 'socket.io-client';
import { socketCore } from './socketClient';
import { CallbackManager } from './CallbackManager';
import type {
    NewPrescriptionEvent,
    PrescriptionStatusChangedEvent,
    PaymentReceivedEvent,
    DisputeRaisedEvent,
    GenericNotificationEvent,
} from '@/features/notifications/types';

// ─── Callback Registries ──────────────────────────────────────────────────────

const onNewPrescription = new CallbackManager<(e: NewPrescriptionEvent) => void>();
const onPrescriptionStatusChanged = new CallbackManager<(e: PrescriptionStatusChangedEvent) => void>();
const onPaymentReceived = new CallbackManager<(e: PaymentReceivedEvent) => void>();
const onDisputeRaised = new CallbackManager<(e: DisputeRaisedEvent) => void>();
const onNotification = new CallbackManager<(e: GenericNotificationEvent) => void>();

// ─── Feature Module ───────────────────────────────────────────────────────────

export const pharmacySocket = {
    /** Called by socketCore after a successful connection. Sets up all event listeners. */
    setupListeners(socket: Socket) {
        // Remove stale listeners to prevent duplicates on reconnect
        const events = [
            'new_prescription',
            'prescription_status_changed',
            'payment_received',
            'dispute_raised',
            'notification',
        ];
        events.forEach((e) => socket.off(e));

        // ─── Incoming Server Events ───────────────────────────────────────────

        socket.on('new_prescription', (data: NewPrescriptionEvent) => {
            console.log('📋 [PharmacySocket] New prescription:', data.reference);
            onNewPrescription.execute(data);
        });

        socket.on('prescription_status_changed', (data: PrescriptionStatusChangedEvent) => {
            console.log('🔄 [PharmacySocket] Prescription status changed:', data.reference, '->', data.status);
            onPrescriptionStatusChanged.execute(data);
        });

        socket.on('payment_received', (data: PaymentReceivedEvent) => {
            console.log('💰 [PharmacySocket] Payment received:', data.reference);
            onPaymentReceived.execute(data);
        });

        socket.on('dispute_raised', (data: DisputeRaisedEvent) => {
            console.log('⚠️ [PharmacySocket] Dispute raised:', data.reference);
            onDisputeRaised.execute(data);
        });

        socket.on('notification', (data: GenericNotificationEvent) => {
            console.log('🔔 [PharmacySocket] Notification:', data.type, '-', data.message);
            onNotification.execute(data);
        });

        console.log('✅ [PharmacySocket] Event listeners registered');
    },

    // ─── Subscriptions ──────────────────────────────────────────────────────

    /** Subscribe to new prescription events */
    onNewPrescription(cb: (e: NewPrescriptionEvent) => void) {
        onNewPrescription.add(cb);
    },
    offNewPrescription(cb: (e: NewPrescriptionEvent) => void) {
        return onNewPrescription.remove(cb);
    },

    /** Subscribe to prescription status change events */
    onPrescriptionStatusChanged(cb: (e: PrescriptionStatusChangedEvent) => void) {
        onPrescriptionStatusChanged.add(cb);
    },
    offPrescriptionStatusChanged(cb: (e: PrescriptionStatusChangedEvent) => void) {
        return onPrescriptionStatusChanged.remove(cb);
    },

    /** Subscribe to payment received events */
    onPaymentReceived(cb: (e: PaymentReceivedEvent) => void) {
        onPaymentReceived.add(cb);
    },
    offPaymentReceived(cb: (e: PaymentReceivedEvent) => void) {
        return onPaymentReceived.remove(cb);
    },

    /** Subscribe to dispute raised events */
    onDisputeRaised(cb: (e: DisputeRaisedEvent) => void) {
        onDisputeRaised.add(cb);
    },
    offDisputeRaised(cb: (e: DisputeRaisedEvent) => void) {
        return onDisputeRaised.remove(cb);
    },

    /** Subscribe to generic notification events */
    onNotification(cb: (e: GenericNotificationEvent) => void) {
        onNotification.add(cb);
    },
    offNotification(cb: (e: GenericNotificationEvent) => void) {
        return onNotification.remove(cb);
    },

    /** Clear all callbacks */
    clearAll() {
        onNewPrescription.clear();
        onPrescriptionStatusChanged.clear();
        onPaymentReceived.clear();
        onDisputeRaised.clear();
        onNotification.clear();
    },
};

// Register the pharmacy feature module with the core socket service
socketCore.registerFeature(pharmacySocket);
