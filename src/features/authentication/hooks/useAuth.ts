import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import { getCurrencyForCountry } from '@/shared/constants/currency';
import { clearDismissedAlerts } from '@/features/home/components';
import type {
    PharmacyLoginRequest,
    PharmacyRegisterRequest,
    UpdateProfileRequest,
    UpdateAccountRequest,
    ChangePasswordRequest,
    AddStaffRequest,
    SetPricingPayload,
    PricingItem,
} from '../types';

export const AUTH_KEYS = {
    profile: ['auth', 'profile'] as const,
    staff: ['auth', 'staff'] as const,
    pricing: ['auth', 'pricing'] as const,
};

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PharmacyLoginRequest) => authService.login(data),
        onSuccess: async (data) => {
            // Clear any previously dismissed alerts on new login
            await clearDismissedAlerts();

            // Pre-populate profile query with pharmacy data
            queryClient.setQueryData(AUTH_KEYS.profile, { pharmacy: data.pharmacy });

            // Update default currency based on location if available
            if (data.location?.country) {
                const currencyForLocation = getCurrencyForCountry(data.location.country);
                // Only update if currency is different or not set
                if (!data.pharmacy?.defaultCurrency || data.pharmacy.defaultCurrency !== currencyForLocation) {
                    try {
                        await authService.updateProfile({ defaultCurrency: currencyForLocation });
                        // Invalidate profile to refetch with new currency
                        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
                    } catch (error) {
                        console.error('Failed to update default currency:', error);
                    }
                }
            }
        },
    });
}

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PharmacyRegisterRequest) => authService.register(data),
        onSuccess: (data) => {
            queryClient.setQueryData(AUTH_KEYS.profile, data.pharmacy);
        },
    });
}

export function useProfile() {
    return useQuery({
        queryKey: AUTH_KEYS.profile,
        queryFn: () => authService.getProfile(),
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            queryClient.removeQueries();
        },
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
        },
    });
}

export function useUploadProfileLogo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ uri, filename, mimeType }: { uri: string; filename: string; mimeType: string }) =>
            authService.uploadProfileLogo(uri, filename, mimeType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
        },
    });
}

export function useUpdateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateAccountRequest) => authService.updateAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    });
}

// ─── Staff Management ─────────────────────────────────────────────────────────

export function useStaff() {
    return useQuery({
        queryKey: AUTH_KEYS.staff,
        queryFn: () => authService.getStaff(),
        staleTime: 2 * 60 * 1000,
    });
}

export function useAddStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddStaffRequest) => authService.addStaff(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.staff });
        },
    });
}

export function useRemoveStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => authService.removeStaff(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.staff });
        },
    });
}

// ─── Pricing Configuration ────────────────────────────────────────────────────

export function usePricing() {
    return useQuery({
        queryKey: AUTH_KEYS.pricing,
        queryFn: () => authService.getPricing(),
        staleTime: 5 * 60 * 1000,
        select: (data): PricingItem[] => {
            // Handle different response formats from API
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = data as any;
            if (Array.isArray(response)) return response;
            if (response?.pricing) return response.pricing;
            if (response?.data?.pricing) return response.data.pricing;
            if (Array.isArray(response?.data)) return response.data;
            return [];
        },
    });
}

export function useSetPricing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SetPricingPayload) => authService.setPricing(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.pricing });
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
        },
    });
}

export function useDeletePricing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (feeType: string) => authService.deletePricing(feeType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.pricing });
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
        },
    });
}
