// Prescription Hooks for Mobile App

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { prescriptionService } from '../services/prescription.service';
import type {
    Prescription,
    PrescriptionDetail,
    AddInternalNoteRequest,
    ProposeAlternativeRequest,
    ProvideCostsPayload,
    MarkReadyPayload,
    InitiateDispatchPayload,
    SendChatMessagePayload,
} from '../types';

// Query Keys
export const PRESCRIPTION_KEYS = {
    all: ['prescriptions'] as const,
    list: (params?: object) => [...PRESCRIPTION_KEYS.all, 'list', params] as const,
    detail: (id: string) => [...PRESCRIPTION_KEYS.all, 'detail', id] as const,
    search: (query: string, params?: object) => [...PRESCRIPTION_KEYS.all, 'search', query, params] as const,
    dashboard: () => [...PRESCRIPTION_KEYS.all, 'dashboard'] as const,
    active: () => [...PRESCRIPTION_KEYS.all, 'active'] as const,
} as const;

/** Statuses that represent new / unattended prescription requests */
const NEW_STATUSES = ['new', 'pending'];

// ─── Queries ───────────────────────────────────────────

/**
 * Fetch all prescriptions with optional filters
 */
export const usePrescriptions = (params?: { status?: string; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.list(params),
        queryFn: () => prescriptionService.getPrescriptions(params),
        staleTime: 60 * 1000, // 1 minute
    });
};

/**
 * Fetch new/pending prescriptions (for dashboard/home widgets)
 */
export const useNewPrescriptions = (limit = 5) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.list({ new: true, limit }),
        queryFn: () => prescriptionService.getPrescriptions({ limit }),
        staleTime: 60 * 1000,
        select: (data) => {
            return data
                .filter((p) => NEW_STATUSES.includes(p.status))
                .slice(0, limit);
        },
    });
};

/**
 * Fetch prescription by ID
 */
export const usePrescriptionById = (id: string) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.detail(id),
        queryFn: () => prescriptionService.getPrescriptionById(id),
        enabled: !!id,
        staleTime: 60 * 1000,
    });
};

/**
 * Search prescriptions
 */
export const useSearchPrescriptions = (query: string, params?: { limit?: number; page?: number }) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.search(query, params),
        queryFn: () => prescriptionService.searchPrescriptions(query, params),
        enabled: query.trim().length > 0,
        staleTime: 30 * 1000,
    });
};

// ─── Mutations ───────────────────────────────────────────

/**
 * Update prescription status
 */
export const useUpdatePrescriptionStatus = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (status: string) => prescriptionService.updatePrescriptionStatus(prescriptionId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Confirm medication availability
 */
export const useConfirmAvailability = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => prescriptionService.confirmAvailability(prescriptionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Add internal note to prescription
 */
export const useAddInternalNote = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AddInternalNoteRequest) =>
            prescriptionService.addInternalNote(prescriptionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
        },
    });
};

/**
 * Propose alternative medications
 */
export const useProposeAlternative = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ProposeAlternativeRequest) =>
            prescriptionService.proposeAlternative(prescriptionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Start processing prescription
 */
export const useStartProcessing = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pharmacistId: string) => prescriptionService.startProcessing(prescriptionId, pharmacistId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Provide cost estimate for prescription
 */
export const useProvideCosts = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ProvideCostsPayload) => prescriptionService.provideCosts(prescriptionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Mark prescription as ready for pickup or delivery
 */
export const useMarkReady = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: MarkReadyPayload) => prescriptionService.markReady(prescriptionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Initiate dispatch for delivery orders
 */
export const useInitiateDispatch = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InitiateDispatchPayload) => prescriptionService.initiateDispatch(prescriptionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Mark prescription as delivered
 */
export const useMarkDelivered = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => prescriptionService.markDelivered(prescriptionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Complete prescription (for pickup)
 */
export const useCompletePrescription = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => prescriptionService.complete(prescriptionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Cancel prescription with reason
 */
export const useCancelPrescription = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reason: string) => prescriptionService.cancelPrescription(prescriptionId, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
        },
    });
};

/**
 * Send chat message
 */
export const useSendChatMessage = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SendChatMessagePayload) =>
            prescriptionService.sendChatMessage(prescriptionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(prescriptionId) });
        },
    });
};
