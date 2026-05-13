// Messaging Hooks for Mobile App

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '../services/messaging.service';
import type { ChatMessage, SendMessagePayload } from '../types';

// Query Keys
export const MESSAGING_KEYS = {
    all: ['messaging'] as const,
    contacts: () => [...MESSAGING_KEYS.all, 'contacts'] as const,
    chat: (prescriptionId: string) => [...MESSAGING_KEYS.all, 'chat', prescriptionId] as const,
} as const;

// ─── Queries ───────────────────────────────────────────

/**
 * Fetch all pharmacy contacts (patients with conversations)
 */
export const usePharmacyContacts = () => {
    return useQuery({
        queryKey: MESSAGING_KEYS.contacts(),
        queryFn: () => messagingService.getContacts(),
        staleTime: 30 * 1000, // 30 seconds
    });
};

/**
 * Fetch chat messages for a prescription
 */
export const useChatMessages = (prescriptionId: string) => {
    return useQuery({
        queryKey: MESSAGING_KEYS.chat(prescriptionId),
        queryFn: () => messagingService.getChatMessages(prescriptionId),
        enabled: !!prescriptionId,
        staleTime: 10 * 1000, // 10 seconds - chat should be fresher
        refetchInterval: 30 * 1000, // Poll every 30 seconds for new messages
    });
};

// ─── Mutations ───────────────────────────────────────────

/**
 * Send a chat message
 */
export const useSendChatMessage = (prescriptionId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SendMessagePayload) => messagingService.sendMessage(prescriptionId, data),
        onMutate: async (newMessage) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: MESSAGING_KEYS.chat(prescriptionId) });

            // Snapshot previous value
            const previousMessages = queryClient.getQueryData<ChatMessage[]>(
                MESSAGING_KEYS.chat(prescriptionId)
            );

            // Optimistically add the new message
            const optimisticMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                senderType: newMessage.senderType,
                senderId: 'pharmacy',
                message: newMessage.message,
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<ChatMessage[]>(
                MESSAGING_KEYS.chat(prescriptionId),
                (old) => [...(old ?? []), optimisticMessage]
            );

            return { previousMessages };
        },
        onError: (err, newMessage, context) => {
            // Rollback on error
            if (context?.previousMessages) {
                queryClient.setQueryData(
                    MESSAGING_KEYS.chat(prescriptionId),
                    context.previousMessages
                );
            }
        },
        onSettled: () => {
            // Refetch to get the real message from server
            queryClient.invalidateQueries({ queryKey: MESSAGING_KEYS.chat(prescriptionId) });
            queryClient.invalidateQueries({ queryKey: MESSAGING_KEYS.contacts() });
        },
    });
};

/**
 * Mark messages as read
 */
export const useMarkAsRead = (prescriptionId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => messagingService.markAsRead(prescriptionId),
        onSuccess: () => {
            // Update contacts to reflect read status
            queryClient.invalidateQueries({ queryKey: MESSAGING_KEYS.contacts() });
        },
    });
};
