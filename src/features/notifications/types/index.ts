// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationType =
    | 'new_prescription'
    | 'prescription_status_changed'
    | 'payment_received'
    | 'dispute_raised'
    | 'dispute_resolved'
    | 'payout_requested'
    | 'payout_completed'
    | 'payout_failed'
    | 'invoice_sent'
    | 'invoice_overdue'
    | 'general';

// Alias for backwards compatibility
export type NotificationCategory = NotificationType;

export interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    message: string;
    metadata?: Record<string, any>;
    isRead: boolean;
    resourceId?: string;
    resourceType?: string;
    createdAt: string;
    updatedAt?: string;
}

// Alias for backwards compatibility
export type AppNotification = Notification & {
    category: NotificationCategory;
};

export interface NotificationCounts {
    unread: number;
    total: number;
}

// ─── Socket Event Payloads ────────────────────────────────────────────────────

export interface NewPrescriptionEvent {
    prescriptionId: string;
    reference: string;
    patientName: string;
    status: string;
    createdAt: string;
}

export interface PrescriptionStatusChangedEvent {
    prescriptionId: string;
    reference: string;
    status: string;
    updatedAt: string;
}

export interface PaymentReceivedEvent {
    invoiceId: string;
    reference: string;
    prescriptionId: string;
}

export interface DisputeRaisedEvent {
    disputeId: string;
    invoiceId: string;
    reference: string;
}

export interface InvoiceSentEvent {
    invoiceId: string;
    reference: string;
    prescriptionId: string;
    totalAmount: number;
    currency: string;
}

export interface GenericNotificationEvent {
    id: string;
    type: NotificationType;
    message: string;
    metadata?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface NotificationsPagination {
    limit: number;
    skip: number;
    total: number;
}

export interface NotificationCountsData {
    total: number;
    unread: number;
    notifications: number;
    alerts: number;
    unreadNotifications: number;
    unreadAlerts: number;
}

export interface NotificationsResponse {
    notifications: Notification[];
    counts?: NotificationCountsData;
    pagination?: NotificationsPagination;
    // Legacy fields for backwards compatibility
    total?: number;
    page?: number;
    limit?: number;
}

// Alias for backwards compatibility
export type NotificationsListResponse = NotificationsResponse;

export interface NotificationCountsResponse {
    unread: number;
    total: number;
}

// ─── Query Parameters ─────────────────────────────────────────────────────────

export interface NotificationQueryParams {
    type?: NotificationType;
    isRead?: boolean;
    limit?: number;
    skip?: number;
}
