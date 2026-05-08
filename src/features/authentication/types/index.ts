// ─── Auth Request Types ───────────────────────────────────────────────────────

export interface PharmacyRegisterRequest {
    fullName: string;
    email: string;
    password: string;
    pharmacyName: string;
    registrationNumber: string;
    address: string;
    phone: string;
    primaryContactPerson: string;
    preferredUsername: string;
}

export interface PharmacyLoginRequest {
    email: string;
    password: string;
    deviceFingerprint?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateAccountRequest {
    fullName?: string;
    email?: string;
}

// ─── Auth Response Types ──────────────────────────────────────────────────────

export interface PharmacyUser {
    id: string;
    fullName: string;
    email: string;
    status: string;
}

export interface DayOperatingHours {
    open: string | null;
    close: string | null;
    isOpen: boolean;
}

export interface OperatingHours {
    monday?: DayOperatingHours;
    tuesday?: DayOperatingHours;
    wednesday?: DayOperatingHours;
    thursday?: DayOperatingHours;
    friday?: DayOperatingHours;
    saturday?: DayOperatingHours;
    sunday?: DayOperatingHours;
}

export interface NotificationPreferences {
    email?: {
        newOrder?: boolean;
        orderStatusUpdate?: boolean;
        paymentReceived?: boolean;
        lowStock?: boolean;
    };
    push?: {
        newOrder?: boolean;
        orderStatusUpdate?: boolean;
        paymentReceived?: boolean;
        lowStock?: boolean;
    };
    sms?: {
        newOrder?: boolean;
        orderStatusUpdate?: boolean;
    };
}

export interface PricingItem {
    id: string;
    feeType: string;
    price: number;
    currency: string;
}

export interface Pharmacy {
    id: string;
    pharmacyName: string;
    username: string;
    verificationStatus: 'pending' | 'approved' | 'rejected' | 'pending_documents';
    registrationNumber?: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    primaryContactPerson?: string;
    email?: string;
    isActive?: boolean;
    documentsSubmitted: boolean;
    description?: string;
    website?: string;
    operatingHours?: OperatingHours;
    serviceRadius?: number;
    defaultCurrency?: string;
    notificationPreferences?: NotificationPreferences;
    pricing?: PricingItem[];
    createdAt: string;
    updatedAt: string;
}

export interface PharmacyRegisterResponse {
    message: string;
    pharmacy: Pharmacy;
    user: PharmacyUser;
}

export interface LocationInfo {
    country: string;
    city: string;
    region: string;
    timezone: string;
    ip: string;
}

export interface PharmacyLoginResponse {
    accessToken: string;
    refreshToken: string;
    pharmacy: Pharmacy;
    user?: PharmacyUser;
    location?: LocationInfo;
}

export interface PharmacyProfileResponse {
    pharmacy: Pharmacy;
    user?: PharmacyUser;
    location?: LocationInfo;
}

export interface VerifyEmailResponse {
    message: string;
}

export interface ResendVerificationResponse {
    message: string;
}

export interface AuthError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

// ─── Document Types ──────────────────────────────────────────────────────────

export interface Document {
    id: string;
    documentType: string;
    documentName: string;
    submissionStatus: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface DocumentUploadResponse {
    message: string;
    documents: Document[];
    pharmacy: {
        verificationStatus: string;
    };
}

export interface DocumentsListResponse {
    documents: Document[];
}

export interface DocumentFile {
    uri: string;
    name: string;
    mimeType: string;
    size?: number;
}

export interface DocumentUploadRequest {
    files: DocumentFile[];
    documentTypes: string[];
    documentNames: string[];
}

export type DocumentType =
    | 'pharmacy_license'
    | 'government_id'
    | 'business_registration'
    | 'tax_certificate'
    | 'other';

// ─── Staff Types ──────────────────────────────────────────────────────────────

export interface StaffMember {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface AddStaffRequest {
    fullName: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
}

export interface StaffListResponse {
    staff: StaffMember[];
}

// ─── Pricing Types ────────────────────────────────────────────────────────────

export interface SetPricingPayload {
    feeType: string;
    price: number;
    currency: string;
}

export interface PharmacyPricingResponse {
    pricing: PricingItem[];
}

// ─── Update Profile Request ───────────────────────────────────────────────────

export interface UpdateProfileRequest {
    fullName?: string;
    pharmacyName?: string;
    address?: string;
    phone?: string;
    primaryContactPerson?: string;
    operatingHours?: OperatingHours;
    description?: string;
    website?: string;
    serviceRadius?: number;
    defaultCurrency?: string;
    notificationPreferences?: NotificationPreferences;
}
