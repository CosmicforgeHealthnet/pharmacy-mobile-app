// Prescription Service for Mobile App

import { apiClient } from '@/core/api/client';
import type {
    Prescription,
    PrescriptionDetail,
    PrescriptionListResponse,
    AddInternalNoteRequest,
    ProposeAlternativeRequest,
    ProvideCostsPayload,
    SendChatMessagePayload,
} from '../types';

// API URLs for prescriptions
const PRESCRIPTION_URLS = {
    BASE: '/pharmacy/prescriptions',
    DETAIL: (id: string) => `/pharmacy/prescriptions/${id}`,
    STATUS: (id: string) => `/pharmacy/prescriptions/${id}/status`,
    CONFIRM_AVAILABILITY: (id: string) => `/pharmacy/prescriptions/${id}/confirm-availability`,
    INTERNAL_NOTES: (id: string) => `/pharmacy/prescriptions/${id}/internal-notes`,
    PROPOSE_ALTERNATIVE: (id: string) => `/pharmacy/prescriptions/${id}/propose-alternative`,
    START_PROCESSING: (id: string) => `/pharmacy/prescriptions/${id}/start-processing`,
    PROVIDE_COSTS: (id: string) => `/pharmacy/prescriptions/${id}/provide-costs`,
    MARK_READY: (id: string) => `/pharmacy/prescriptions/${id}/mark-ready`,
    DISPATCH: (id: string) => `/pharmacy/prescriptions/${id}/dispatch`,
    MARK_DELIVERED: (id: string) => `/pharmacy/prescriptions/${id}/mark-delivered`,
    COMPLETE: (id: string) => `/pharmacy/prescriptions/${id}/complete`,
    CANCEL: (id: string) => `/pharmacy/prescriptions/${id}/cancel`,
    SEARCH: '/pharmacy/prescriptions/search',
    CHAT: (id: string) => `/pharmacy/prescriptions/${id}/chat`,
};

export const prescriptionService = {
    // Get all prescriptions with optional filters
    async getPrescriptions(params?: {
        status?: string;
        limit?: number;
        page?: number;
    }): Promise<Prescription[]> {
        const response = await apiClient.get<PrescriptionListResponse | Prescription[]>(
            PRESCRIPTION_URLS.BASE,
            { params }
        );

        // Normalize response
        if (Array.isArray(response)) return response;
        if (Array.isArray((response as any)?.prescriptions)) return (response as any).prescriptions;
        if (Array.isArray((response as any)?.data)) return (response as any).data;
        return [];
    },

    // Get prescription by ID
    async getPrescriptionById(id: string): Promise<PrescriptionDetail> {
        const response = await apiClient.get<any>(PRESCRIPTION_URLS.DETAIL(id));
        return response?.data ?? response;
    },

    // Update prescription status
    async updatePrescriptionStatus(id: string, status: string): Promise<PrescriptionDetail> {
        return apiClient.patch<PrescriptionDetail>(PRESCRIPTION_URLS.STATUS(id), { status });
    },

    // Confirm medication availability
    async confirmAvailability(id: string): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.CONFIRM_AVAILABILITY(id));
    },

    // Add internal note
    async addInternalNote(id: string, data: AddInternalNoteRequest): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.INTERNAL_NOTES(id), data);
    },

    // Propose alternative medications
    async proposeAlternative(id: string, data: ProposeAlternativeRequest): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.PROPOSE_ALTERNATIVE(id), data);
    },

    // Start processing prescription
    async startProcessing(id: string): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.START_PROCESSING(id));
    },

    // Provide cost estimate
    async provideCosts(id: string, data: ProvideCostsPayload): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.PROVIDE_COSTS(id), data);
    },

    // Mark prescription as ready for pickup
    async markReady(id: string): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.MARK_READY(id));
    },

    // Initiate dispatch for delivery
    async initiateDispatch(id: string, note?: string): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.DISPATCH(id), { note });
    },

    // Mark prescription as delivered
    async markDelivered(id: string): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.MARK_DELIVERED(id));
    },

    // Complete prescription (for pickup)
    async complete(id: string): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.COMPLETE(id));
    },

    // Cancel prescription with reason
    async cancelPrescription(id: string, reason?: string): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.CANCEL(id), { reason });
    },

    // Search prescriptions
    async searchPrescriptions(
        query: string,
        params?: { limit?: number; page?: number }
    ): Promise<Prescription[]> {
        const response = await apiClient.get<PrescriptionListResponse | Prescription[]>(
            PRESCRIPTION_URLS.SEARCH,
            { params: { q: query, ...params } }
        );

        // Normalize response
        if (Array.isArray(response)) return response;
        if (Array.isArray((response as any)?.prescriptions)) return (response as any).prescriptions;
        if (Array.isArray((response as any)?.data)) return (response as any).data;
        return [];
    },

    // Send chat message
    async sendChatMessage(
        prescriptionId: string,
        data: SendChatMessagePayload
    ): Promise<PrescriptionDetail> {
        return apiClient.post<PrescriptionDetail>(PRESCRIPTION_URLS.CHAT(prescriptionId), data);
    },
};
