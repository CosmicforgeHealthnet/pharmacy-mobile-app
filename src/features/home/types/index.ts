// ─── Prescription Status ──────────────────────────────────────────────────────

export type PrescriptionStatus =
    | 'new'
    | 'pending'
    | 'pharmacy_assigned'
    | 'under_review'
    | 'awaiting_payment'
    | 'in_progress'
    | 'ready_for_pickup'
    | 'out_for_delivery'
    | 'completed'
    | 'cancelled';

// ─── Patient & Doctor ─────────────────────────────────────────────────────────

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
    consultationReference?: string;
    departmentSpecialty?: string;
}

// ─── Medication ───────────────────────────────────────────────────────────────

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

// ─── Internal Note ────────────────────────────────────────────────────────────

export interface PrescriptionInternalNote {
    note: string;
    pharmacistId: string;
    timestamp: string;
}

// ─── Prescription ─────────────────────────────────────────────────────────────

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

// ─── Active Order ─────────────────────────────────────────────────────────────

export interface ActiveOrder {
    id: string;
    reference: string;
    status: PrescriptionStatus;
    patient?: PrescriptionPatient;
    medications: PrescriptionMedication[];
    createdAt: string;
    updatedAt: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
    totalPrescriptions: number;
    pendingPrescriptions: number;
    activeOrders: number;
    completedToday: number;
    inProgressPrescriptions: number;
    completedPrescriptions: number;
    cancelledPrescriptions: number;
    todayPrescriptions: number;
    pendingInvoices: number;
    totalRevenue?: number;
}

// ─── Dashboard Activity ───────────────────────────────────────────────────────

export interface DashboardActivityItem {
    id: string;
    type: string;
    message: string;
    prescriptionId?: string;
    prescriptionRef?: string;
    patientName?: string;
    timestamp: string;
    createdAt: string;
}

// ─── Prescription List Response ───────────────────────────────────────────────

export interface PrescriptionListResponse {
    prescriptions: Prescription[];
    total?: number;
    page?: number;
    limit?: number;
}

// ─── Overview Types ───────────────────────────────────
export interface OverviewStats {
    totalEarnings: number;
    totalPayouts: number;
    pendingPayouts: number;
    totalTransactions: number;
    activeDisputes: number;
    resolvedDisputes: number;
    successRate: number;
    averageOrderValue: number;
}

export interface OverviewPeriod {
    label: string;
    value: 'today' | 'week' | 'month' | 'year';
}

// ─── Earnings Types ───────────────────────────────────
export type EarningsStatus = 'received' | 'pending' | 'processing';
export type EarningsCategory = 'prescription' | 'consultation' | 'delivery' | 'refund_reversal';

export interface Earning {
    id: string;
    amount: number;
    status: EarningsStatus;
    category: EarningsCategory;
    description: string;
    reference: string;
    orderId?: string;
    patientName?: string;
    createdAt: string;
}

export interface EarningsSummary {
    totalEarnings: number;
    pendingEarnings: number;
    receivedToday: number;
    receivedThisWeek: number;
    receivedThisMonth: number;
    currency: 'NGN';
}

// ─── Payout Types ─────────────────────────────────────
export type PayoutStatus = 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled';
export type PayoutMethod = 'bank_transfer' | 'mobile_money' | 'wallet';

export interface Payout {
    id: string;
    amount: number;
    status: PayoutStatus;
    method: PayoutMethod;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    reference: string;
    fee: number;
    netAmount: number;
    requestedAt: string;
    processedAt?: string;
    completedAt?: string;
    failureReason?: string;
}

export interface PayoutSummary {
    availableBalance: number;
    pendingPayouts: number;
    totalPaidOut: number;
    lastPayoutDate?: string;
    lastPayoutAmount?: number;
    currency: 'NGN';
}

export interface PayoutRequest {
    amount: number;
    method: PayoutMethod;
    bankCode?: string;
    accountNumber?: string;
}

// ─── Dispute Types ────────────────────────────────────
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'escalated' | 'closed';
export type DisputeType = 'refund_request' | 'order_issue' | 'payment_issue' | 'quality_complaint' | 'delivery_issue' | 'other';
export type DisputePriority = 'low' | 'medium' | 'high' | 'urgent';
export type DisputeResolution = 'refund_issued' | 'partial_refund' | 'no_refund' | 'order_replaced' | 'other';

export interface Dispute {
    id: string;
    type: DisputeType;
    status: DisputeStatus;
    priority: DisputePriority;
    orderId: string;
    orderRef: string;
    patientId: string;
    patientName: string;
    amount: number;
    description: string;
    resolution?: DisputeResolution;
    resolutionNotes?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    assignedTo?: string;
}

export interface DisputeSummary {
    totalDisputes: number;
    openDisputes: number;
    underReviewDisputes: number;
    resolvedDisputes: number;
    escalatedDisputes: number;
    averageResolutionTime: string;
}

// ─── Transaction Types ────────────────────────────────
export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';
export type TransactionCategory =
    | 'order_payment'
    | 'payout'
    | 'refund'
    | 'fee'
    | 'adjustment'
    | 'reversal'
    | 'top_up'
    | 'withdrawal';

export interface Transaction {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    category: TransactionCategory;
    amount: number;
    fee?: number;
    netAmount: number;
    balanceAfter: number;
    description: string;
    reference: string;
    orderId?: string;
    orderRef?: string;
    payoutId?: string;
    disputeId?: string;
    createdAt: string;
}

export interface TransactionSummary {
    totalCredits: number;
    totalDebits: number;
    netBalance: number;
    transactionCount: number;
    currency: 'NGN';
}

export interface TransactionFilter {
    type?: TransactionType;
    status?: TransactionStatus;
    category?: TransactionCategory;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
}
