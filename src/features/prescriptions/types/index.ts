// Prescription Types for Mobile App

export type PrescriptionStatus =
    | 'new'
    | 'pending'
    | 'patient_uploaded'
    | 'pharmacy_assigned'
    | 'under_review'
    | 'pharmacy_processing'
    | 'awaiting_payment'
    | 'in_progress'
    | 'ready_for_pickup'
    | 'ready_for_delivery'
    | 'out_for_delivery'
    | 'completed'
    | 'cancelled';

export interface PrescriptionMedication {
    id?: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    route?: string;
    notes?: string;
}

export interface PrescriptionPatient {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    address?: string;
    profileImageUrl?: string;
    isOnline?: boolean;
}

export interface PrescriptionDoctor {
    id: string;
    fullName: string;
    specialty?: string;
    email?: string;
    departmentSpecialty?: string;
    averageRating?: number | string;
    isOnline?: boolean;
    consultationReference?: string;
}

export interface PrescriptionPharmacy {
    pharmacyName?: string;
    address?: string;
    phone?: string;
}

export interface FulfillmentHistoryItem {
    status: string;
    timestamp: string;
    note?: string;
}

export interface PrescriptionInternalNote {
    note: string;
    pharmacistId: string;
    timestamp: string;
}

// Shape returned by GET /pharmacy/prescriptions (list)
export interface Prescription {
    id: string;
    reference: string;
    status: PrescriptionStatus;
    availabilityStatus?: string;
    patient?: PrescriptionPatient;
    doctor?: PrescriptionDoctor;
    medications: PrescriptionMedication[];
    diagnosis?: string;
    doctorNotes?: string;
    internalNotes?: PrescriptionInternalNote[];
    paymentStatus?: string;
    createdAt: string;
    updatedAt: string;
}

// Shape returned by GET /pharmacy/prescriptions/:id (detail)
export interface PrescriptionDetail {
    id: string;
    reference: string;
    doctorId: string;
    patientId: string;
    consultationId: string;
    pharmacyId: string;
    assignedPharmacistId?: string;
    doctor?: PrescriptionDoctor;
    patient?: PrescriptionPatient;
    pharmacy?: PrescriptionPharmacy;
    medications: PrescriptionMedication[];
    doctorNotes?: string;
    diagnosis?: string;
    doctorSignature?: string;
    status: PrescriptionStatus;
    availabilityStatus?: string;
    paymentStatus?: string;
    fulfillmentHistory?: FulfillmentHistoryItem[];
    chatMessages?: ChatMessage[];
    invoiceItems?: any[];
    deliveryFee?: number;
    totalDue?: number;
    deliveryAddress?: string;
    deliveryInstructions?: string;
    patientComplaint?: string;
    orderedTests?: string[];
    appointmentRef?: string;
    appointmentDate?: string;
    internalNotes?: PrescriptionInternalNote[];
    createdAt: string;
    updatedAt: string;
}

export interface PrescriptionListResponse {
    prescriptions: Prescription[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface ChatMessage {
    id: string;
    senderType: 'pharmacy' | 'patient';
    senderId: string;
    message: string;
    createdAt: string;
}

export interface AddInternalNoteRequest {
    note: string;
    pharmacistId: string;
}

export interface ProposeAlternativeItem {
    name: string;
    dosage: string;
    note: string;
}

export interface ProposeAlternativeRequest {
    alternatives: ProposeAlternativeItem[];
}

export interface ProvideCostItem {
    name: string;
    unitPrice: number;
    quantity: number;
}

export interface ProvideCostsPayload {
    items: ProvideCostItem[];
    deliveryFee: number;
    paymentMethod: string;
}

export interface MarkReadyPayload {
    readyType: 'delivery' | 'pickup';
    expectedDate?: string;
}

export interface InitiateDispatchPayload {
    estimatedDelivery?: string;
    note?: string;
}

export interface CancelPrescriptionPayload {
    reason: string;
}

export interface SendChatMessagePayload {
    message: string;
    senderType: 'pharmacy' | 'patient';
}

// Status color mapping for UI
export const STATUS_COLORS: Record<PrescriptionStatus, { bg: string; text: string; border: string }> = {
    new: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    pending: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    patient_uploaded: { bg: '#F0F9FF', text: '#0284C7', border: '#BAE6FD' },
    pharmacy_assigned: { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' },
    under_review: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    pharmacy_processing: { bg: '#FDF4FF', text: '#A855F7', border: '#E9D5FF' },
    awaiting_payment: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    in_progress: { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' },
    ready_for_pickup: { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' },
    ready_for_delivery: { bg: '#F0FDF4', text: '#22C55E', border: '#BBF7D0' },
    out_for_delivery: { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
    completed: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    cancelled: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

// Helper functions
export function getStatusColor(status: PrescriptionStatus | string) {
    return STATUS_COLORS[status as PrescriptionStatus] ?? { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
}

export function formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}
