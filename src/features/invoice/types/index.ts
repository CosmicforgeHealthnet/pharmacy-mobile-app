// Invoice types for the pharmacy mobile app (matching dashboard structure)

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'awaiting_payment' | 'paid' | 'overdue' | 'cancelled';

export type InvoicePaymentMethod = 'online' | 'pay_on_pickup';

export interface InvoiceLineItem {
    id: string;
    medicationName: string;
    dosage?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Invoice {
    id: string;
    invoiceRef: string;
    reference?: string; // API may return this instead of invoiceRef
    prescriptionId: string;
    prescriptionRef: string;
    pharmacyId: string;
    patientId: string;
    patientName: string;
    patientEmail?: string;
    lineItems: InvoiceLineItem[];
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    currency: string;
    paymentMethod: InvoicePaymentMethod;
    status: InvoiceStatus;
    paidAt?: string;
    dueAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Helper to get invoice reference (handles both field names)
export function getInvoiceRef(invoice: Invoice): string {
    return invoice.invoiceRef || invoice.reference || '';
}

export interface InvoiceListResponse {
    invoices: Invoice[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateInvoicePayload {
    prescriptionId: string;
    lineItems: { medicationName: string; unitPrice: number; quantity: number; dosage?: string }[];
    deliveryFee?: number;
    paymentMethod: InvoicePaymentMethod;
    notes?: string;
}

export type PaymentSource = 'wallet' | 'card';

export interface PaymentPayload {
    invoiceId: string;
    source: PaymentSource;
}

export interface PaymentResponse {
    paymentId: string;
    invoiceId: string;
    amount: number;
    status: 'success' | 'pending' | 'failed';
    authorizationUrl?: string;
    reference: string;
}

// Status color mapping for UI
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, { bg: string; text: string; border: string }> = {
    draft: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
    sent: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    viewed: { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
    awaiting_payment: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    paid: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    overdue: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    cancelled: { bg: '#F3F4F6', text: '#9CA3AF', border: '#E5E7EB' },
};

// Helper functions
export function getInvoiceStatusColor(status: InvoiceStatus) {
    return INVOICE_STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
}

export function formatInvoiceStatus(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
        draft: 'Draft',
        sent: 'Sent',
        viewed: 'Viewed',
        awaiting_payment: 'Payment Due',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
    };
    return labels[status] ?? status;
}

// Note: Use formatCurrency from '@/shared/constants/currency' instead
// This function is deprecated - kept for backwards compatibility
export function formatCurrencyLegacy(amount: number): string {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInvoiceDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
