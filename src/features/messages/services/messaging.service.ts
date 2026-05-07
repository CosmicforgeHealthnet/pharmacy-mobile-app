// Messaging Service for Mobile App

import { apiClient } from '@/core/api/client';
import type { PharmacyContact, ChatMessage, SendMessagePayload } from '../types';

// API URLs for messaging
const MESSAGING_URLS = {
    CONTACTS: '/pharmacy/prescriptions/contacts',
    PRESCRIPTION_DETAIL: (id: string) => `/pharmacy/prescriptions/${id}`,
    CHAT: (prescriptionId: string) => `/pharmacy/prescriptions/${prescriptionId}/chat`,
};

export const messagingService = {
    // Get all pharmacy contacts (patients with active conversations)
    async getContacts(): Promise<PharmacyContact[]> {
        const response = await apiClient.get<any>(MESSAGING_URLS.CONTACTS);

        // Normalize response
        const data = response?.data ?? response;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    },

    // Get chat messages for a prescription
    async getChatMessages(prescriptionId: string): Promise<ChatMessage[]> {
        const response = await apiClient.get<any>(MESSAGING_URLS.PRESCRIPTION_DETAIL(prescriptionId));

        // Extract chatMessages from prescription detail
        const prescription = response?.data ?? response;
        const messages = prescription?.chatMessages ?? [];

        // Normalize message format
        return messages.map((m: any) => ({
            id: m.id ?? m._id ?? String(Math.random()),
            senderType: m.senderType ?? m.sender_type ?? 'patient',
            senderId: m.senderId ?? m.sender_id ?? '',
            message: m.message ?? m.content ?? '',
            createdAt: m.createdAt ?? m.created_at ?? new Date().toISOString(),
        }));
    },

    // Send a chat message
    async sendMessage(prescriptionId: string, data: SendMessagePayload): Promise<ChatMessage> {
        const response = await apiClient.post<any>(MESSAGING_URLS.CHAT(prescriptionId), data);
        const msg = response?.data ?? response;

        return {
            id: msg.id ?? msg._id ?? String(Date.now()),
            senderType: msg.senderType ?? data.senderType,
            senderId: msg.senderId ?? '',
            message: msg.message ?? data.message,
            createdAt: msg.createdAt ?? new Date().toISOString(),
        };
    },

    // Mark messages as read (if endpoint exists)
    async markAsRead(prescriptionId: string): Promise<void> {
        try {
            await apiClient.post(`/pharmacy/prescriptions/${prescriptionId}/mark-read`);
        } catch {
            // Endpoint may not exist, fail silently
        }
    },
};
