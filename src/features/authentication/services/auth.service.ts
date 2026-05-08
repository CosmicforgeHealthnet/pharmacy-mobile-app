import { apiClient } from '@/core/api/client';
import { storage } from '@/core/storage';
import type {
    PharmacyRegisterRequest,
    PharmacyRegisterResponse,
    PharmacyLoginRequest,
    PharmacyLoginResponse,
    PharmacyProfileResponse,
    ChangePasswordRequest,
    VerifyEmailResponse,
    ResendVerificationResponse,
    UpdateProfileRequest,
    UpdateAccountRequest,
    StaffMember,
    AddStaffRequest,
    SetPricingPayload,
    PharmacyPricingResponse,
} from '../types';

// ─── API Endpoints ────────────────────────────────────────────────────────────

const AUTH_URLS = {
    REGISTER: '/pharmacy/auth/register',
    LOGIN: '/pharmacy/auth/login',
    PROFILE: '/pharmacy/auth/profile',
    PROFILE_LOGO: '/pharmacy/auth/profile/logo',
    CHANGE_PASSWORD: '/pharmacy/auth/change-password',
    ACCOUNT: '/pharmacy/auth/account',
    VERIFY_EMAIL: (token: string) => `/auth/verify-email?token=${token}`,
    RESEND_VERIFICATION: '/auth/resend-verification',
    // Staff
    STAFF: '/pharmacy/auth/staff',
    STAFF_DETAIL: (id: string) => `/pharmacy/auth/staff/${id}`,
    // Pricing
    PRICING: '/pharmacy/auth/pricing',
    PRICING_DELETE: (feeType: string) => `/pharmacy/auth/pricing/${encodeURIComponent(feeType)}`,
} as const;

// ─── Auth Service ─────────────────────────────────────────────────────────────

class AuthService {
    /**
     * Register a new pharmacy
     */
    async register(data: PharmacyRegisterRequest): Promise<PharmacyRegisterResponse> {
        const response = await apiClient.post<PharmacyRegisterResponse>(
            AUTH_URLS.REGISTER,
            data
        );
        return response;
    }

    /**
     * Login pharmacy user
     */
    async login(data: PharmacyLoginRequest): Promise<PharmacyLoginResponse> {
        const response = await apiClient.post<PharmacyLoginResponse>(
            AUTH_URLS.LOGIN,
            data
        );

        // Store tokens and user data
        if (response.accessToken) {
            await storage.setToken(response.accessToken);
        }
        if (response.refreshToken) {
            await storage.setRefreshToken(response.refreshToken);
        }
        if (response.pharmacy) {
            await storage.setUserData(response.pharmacy);
        }

        return response;
    }

    /**
     * Get current pharmacy profile
     */
    async getProfile(): Promise<PharmacyProfileResponse> {
        const response = await apiClient.get<PharmacyProfileResponse>(
            AUTH_URLS.PROFILE
        );
        return response;
    }

    /**
     * Verify email with token
     */
    async verifyEmail(token: string): Promise<VerifyEmailResponse> {
        const response = await apiClient.get<VerifyEmailResponse>(
            AUTH_URLS.VERIFY_EMAIL(token)
        );
        return response;
    }

    /**
     * Resend verification email
     */
    async resendVerification(email: string): Promise<ResendVerificationResponse> {
        const response = await apiClient.post<ResendVerificationResponse>(
            AUTH_URLS.RESEND_VERIFICATION,
            { email }
        );
        return response;
    }

    /**
     * Change password
     */
    async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(
            AUTH_URLS.CHANGE_PASSWORD,
            data
        );
        return response;
    }

    /**
     * Update pharmacy profile
     */
    async updateProfile(data: UpdateProfileRequest): Promise<PharmacyProfileResponse> {
        const response = await apiClient.put<PharmacyProfileResponse>(
            AUTH_URLS.PROFILE,
            data
        );
        return response;
    }

    /**
     * Upload profile logo
     */
    async uploadProfileLogo(uri: string, filename: string, mimeType: string): Promise<PharmacyProfileResponse> {
        const formData = new FormData();
        formData.append('logo', {
            uri,
            name: filename,
            type: mimeType,
        } as any);

        const response = await apiClient.post<PharmacyProfileResponse>(
            AUTH_URLS.PROFILE_LOGO,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response;
    }

    /**
     * Update account settings (contact person name / email)
     */
    async updateAccount(data: UpdateAccountRequest): Promise<{ message: string }> {
        const response = await apiClient.put<{ message: string }>(
            AUTH_URLS.ACCOUNT,
            data
        );
        return response;
    }

    // ─── Staff Management ─────────────────────────────────────────────────────

    /**
     * Get pharmacy staff list
     */
    async getStaff(): Promise<StaffMember[]> {
        const response = await apiClient.get<{ staff: StaffMember[] } | StaffMember[]>(
            AUTH_URLS.STAFF
        );
        // Handle both array response and wrapped object response
        if (Array.isArray(response)) return response;
        if (Array.isArray((response as any).staff)) return (response as any).staff;
        if (Array.isArray((response as any).data)) return (response as any).data;
        return [];
    }

    /**
     * Add new staff member
     */
    async addStaff(data: AddStaffRequest): Promise<StaffMember> {
        const response = await apiClient.post<StaffMember>(
            AUTH_URLS.STAFF,
            data
        );
        return response;
    }

    /**
     * Remove staff member
     */
    async removeStaff(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete<{ message: string }>(
            AUTH_URLS.STAFF_DETAIL(id)
        );
        return response;
    }

    // ─── Pricing Configuration ────────────────────────────────────────────────

    /**
     * Get pharmacy pricing
     */
    async getPricing(): Promise<PharmacyPricingResponse> {
        const response = await apiClient.get<PharmacyPricingResponse | any>(
            AUTH_URLS.PRICING
        );
        // Handle different response formats from API
        // API may return: { pricing: [...] }, [...], { data: { pricing: [...] } }, or { data: [...] }
        if (response?.pricing && Array.isArray(response.pricing)) {
            return response;
        }
        if (Array.isArray(response)) {
            return { pricing: response };
        }
        if (response?.data?.pricing && Array.isArray(response.data.pricing)) {
            return { pricing: response.data.pricing };
        }
        if (Array.isArray(response?.data)) {
            return { pricing: response.data };
        }
        // Return empty array if no valid format found
        return { pricing: [] };
    }

    /**
     * Set pricing item
     */
    async setPricing(data: SetPricingPayload): Promise<PharmacyPricingResponse> {
        const response = await apiClient.post<PharmacyPricingResponse>(
            AUTH_URLS.PRICING,
            data
        );
        return response;
    }

    /**
     * Delete pricing item
     */
    async deletePricing(feeType: string): Promise<{ message: string }> {
        const response = await apiClient.delete<{ message: string }>(
            AUTH_URLS.PRICING_DELETE(feeType)
        );
        return response;
    }

    /**
     * Logout - clear all auth data
     */
    async logout(): Promise<void> {
        await storage.clearAuth();
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        return storage.isAuthenticated();
    }

    /**
     * Get stored pharmacy data
     */
    async getStoredPharmacy(): Promise<any> {
        return storage.getUserData();
    }
}

export const authService = new AuthService();
