// Wallet types for patient wallet (mobile app)

export type PatientTransactionType = "credit" | "debit";
export type PatientTransactionStatus = "completed" | "pending" | "failed";
export type PatientTransactionCategory =
    | "top_up"
    | "invoice_payment"
    | "refund"
    | "reversal";

export interface PatientWalletTransaction {
    id: string;
    type: PatientTransactionType;
    status: PatientTransactionStatus;
    category: PatientTransactionCategory;
    amount: number;
    balanceAfter: number;
    description: string;
    reference: string;
    invoiceId?: string;
    invoiceRef?: string;
    createdAt: string;
}

export interface PatientWalletSummary {
    balance: number;
    currency: "NGN";
    totalSpent: number;
    totalToppedUp: number;
    refundsReceived: number;
}

// ─── Pharmacy Wallet Summary (API Response) ──────────
export interface PharmacyWalletSummary {
    availableBalance: number;
    pendingClearance: number;
    totalEarnings: number;
    currency: 'NGN';
    thisMonthEarnings: number;
    lastPayoutAmount: number | null;
    lastPayoutDate: string | null;
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

export type OverviewPeriod = 'today' | 'week' | 'month' | 'year';

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

export interface PayoutBankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
    isDefault: boolean;
}

export interface Payout {
    id: string;
    amount: number;
    currency: string;
    status: PayoutStatus;
    bankAccount: PayoutBankAccount;
    reference: string;
    note?: string;
    failureReason?: string;
    requestedAt: string;
    processedAt?: string;
}

export interface PayoutSummary {
    availableBalance: number;
    pendingPayouts: number;
    totalPaidOut: number;
    lastPayoutDate?: string;
    lastPayoutAmount?: number;
    currency: 'NGN';
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
    | 'invoice_payment'
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
    balanceAfter: number;
    description: string;
    reference: string;
    invoiceId?: string;
    invoiceRef?: string;
    prescriptionRef?: string;
    currency: string;
    settledAt?: string | null;
    createdAt: string;
}

export interface TransactionSummary {
    totalCredits: number;
    totalDebits: number;
    netBalance: number;
    transactionCount: number;
    currency: 'NGN';
}

// ─── API Response Types ──────────────────────────────
export interface TransactionsResponse {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    currency: string;
}

export interface PayoutsResponse {
    payouts: Payout[];
    total: number;
    page: number;
    limit: number;
}

export interface BankAccountsResponse {
    bankAccounts: BankAccount[];
}

export interface DisputesResponse {
    disputes: Dispute[];
    total: number;
    page: number;
    limit: number;
}

// ─── Bank Account Types ──────────────────────────────
export interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
    isDefault: boolean;
}

export interface AddBankAccountPayload {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
}

// ─── Payout Request Payload ──────────────────────────
export interface RequestPayoutPayload {
    amount: number;
    bankAccountId: string;
    note?: string;
}

// ─── Dispute Response Payload ────────────────────────
export interface RespondToDisputePayload {
    response: string;
    attachments?: string[];
}
