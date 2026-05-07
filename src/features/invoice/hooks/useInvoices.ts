// Invoice Hooks for Mobile App

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoice.service';
import type { Invoice, CreateInvoicePayload } from '../types';

// Query Keys
export const INVOICE_KEYS = {
    all: ['invoices'] as const,
    list: (params?: object) => [...INVOICE_KEYS.all, 'list', params] as const,
    detail: (id: string) => [...INVOICE_KEYS.all, 'detail', id] as const,
} as const;

// ─── Queries ───────────────────────────────────────────

/**
 * Fetch all invoices with optional filters
 */
export const useInvoices = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    prescriptionId?: string;
    dateFrom?: string;
    dateTo?: string;
}) => {
    return useQuery({
        queryKey: INVOICE_KEYS.list(params),
        queryFn: () => invoiceService.getInvoices(params),
        staleTime: 30 * 1000, // 30 seconds
    });
};

/**
 * Fetch invoice by ID
 */
export const useInvoiceById = (id: string) => {
    return useQuery({
        queryKey: INVOICE_KEYS.detail(id),
        queryFn: () => invoiceService.getInvoiceById(id),
        enabled: !!id,
        staleTime: 30 * 1000,
    });
};

// ─── Mutations ───────────────────────────────────────────

/**
 * Create a new invoice
 */
export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateInvoicePayload) => invoiceService.createInvoice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all });
        },
    });
};

/**
 * Update an existing invoice
 */
export const useUpdateInvoice = (invoiceId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<CreateInvoicePayload>) =>
            invoiceService.updateInvoice(invoiceId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(invoiceId) });
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all });
        },
    });
};

/**
 * Send invoice to patient
 */
export const useSendInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invoiceId: string) => invoiceService.sendInvoice(invoiceId),
        onSuccess: (_, invoiceId) => {
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(invoiceId) });
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all });
        },
    });
};

/**
 * Cancel an invoice
 */
export const useCancelInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invoiceId: string) => invoiceService.cancelInvoice(invoiceId),
        onSuccess: (_, invoiceId) => {
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(invoiceId) });
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all });
        },
    });
};

/**
 * Mark invoice as paid
 */
export const useMarkInvoicePaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invoiceId: string) => invoiceService.markAsPaid(invoiceId),
        onSuccess: (_, invoiceId) => {
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(invoiceId) });
            queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all });
        },
    });
};
