import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import type {
    PharmacyLoginRequest,
    PharmacyRegisterRequest,
    UpdateProfileRequest,
    UpdateAccountRequest,
    ChangePasswordRequest,
    AddStaffRequest,
    SetPricingPayload,
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
        onSuccess: (data) => {
            // Option to pre-populate or invalidate queries on login
            queryClient.setQueryData(AUTH_KEYS.profile, data.pharmacy);
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
        select: (data) => data.pricing,
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
