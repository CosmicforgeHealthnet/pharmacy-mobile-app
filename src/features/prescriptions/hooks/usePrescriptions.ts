// Prescription Hooks for Mobile App

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { prescriptionService } from '../services/prescription.service';
import type {
    Prescription,
    PrescriptionDetail,
    AddInternalNoteRequest,
    ProposeAlternativeRequest,
    ProvideCostsPayload,
    SendChatMessagePayload,
} from '../types';

// Query Keys
export const PRESCRIPTION_KEYS = {
    all: ['prescriptions'] as const,
    list: (params?: object) => [...PRESCRIPTION_KEYS.all, 'list', params] as const,
    detail: (id: string) => [...PRESCRIPTION_KEYS.all, 'detail', id] as const,
    search: (query: string, params?: object) => [...PRESCRIPTION_KEYS.all, 'search', query, params] as const,
} as const;

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
        mutationFn: () => prescriptionService.startProcessing(prescriptionId),
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
 * Mark prescription as ready for pickup
 */
export const useMarkReady = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => prescriptionService.markReady(prescriptionId),
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
        mutationFn: (note?: string) => prescriptionService.initiateDispatch(prescriptionId, note),
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
 * Cancel prescription with optional reason
 */
export const useCancelPrescription = (prescriptionId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reason?: string) => prescriptionService.cancelPrescription(prescriptionId, reason),
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
