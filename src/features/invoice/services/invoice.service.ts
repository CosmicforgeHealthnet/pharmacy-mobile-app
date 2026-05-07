// Invoice Service for Mobile App

import { apiClient } from '@/core/api/client';
import type {
    Invoice,
    InvoiceListResponse,
    CreateInvoicePayload,
} from '../types';

// API URLs for invoices
const INVOICE_URLS = {
    BASE: '/pharmacy/invoices',
    DETAIL: (id: string) => `/pharmacy/invoices/${id}`,
    SEND: (id: string) => `/pharmacy/invoices/${id}/send`,
    CANCEL: (id: string) => `/pharmacy/invoices/${id}/cancel`,
    MARK_PAID: (id: string) => `/pharmacy/invoices/${id}/mark-paid`,
};

export const invoiceService = {
    // Get all invoices with optional filters
    async getInvoices(params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        prescriptionId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<Invoice[]> {
        const response = await apiClient.get<InvoiceListResponse | Invoice[]>(
            INVOICE_URLS.BASE,
            { params }
        );

        // Normalize response
        if (Array.isArray(response)) return response;
        if (Array.isArray((response as any)?.invoices)) return (response as any).invoices;
        if (Array.isArray((response as any)?.data)) return (response as any).data;
        return [];
    },

    // Get invoice by ID
    async getInvoiceById(id: string): Promise<Invoice> {
        const response = await apiClient.get<any>(INVOICE_URLS.DETAIL(id));
        return response?.data ?? response;
    },

    // Create a new invoice
    async createInvoice(data: CreateInvoicePayload): Promise<Invoice> {
        return apiClient.post<Invoice>(INVOICE_URLS.BASE, data);
    },

    // Update an existing invoice
    async updateInvoice(id: string, data: Partial<CreateInvoicePayload>): Promise<Invoice> {
        return apiClient.patch<Invoice>(INVOICE_URLS.DETAIL(id), data);
    },

    // Send invoice to patient
    async sendInvoice(id: string): Promise<Invoice> {
        return apiClient.post<Invoice>(INVOICE_URLS.SEND(id));
    },

    // Cancel invoice
    async cancelInvoice(id: string): Promise<Invoice> {
        return apiClient.patch<Invoice>(INVOICE_URLS.CANCEL(id));
    },

    // Mark invoice as paid
    async markAsPaid(id: string): Promise<Invoice> {
        return apiClient.patch<Invoice>(INVOICE_URLS.MARK_PAID(id));
    },
};
