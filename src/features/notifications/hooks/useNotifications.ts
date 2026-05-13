import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useProfile, usePricing } from '@/features/authentication/hooks/useAuth';
import { useNewPrescriptions } from '@/features/home/hooks';
import { getPharmacyNotifications, NotificationType } from '../utils/pharmacy-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { notificationSocket } from '@/core/socket/notificationSocket';
import { pharmacySocket } from '@/core/socket/pharmacySocket';
import { socketCore } from '@/core/socket/socketClient';
import type {
    NotificationCounts,
    NotificationQueryParams,
    NewPrescriptionEvent,
    PrescriptionStatusChangedEvent,
    PaymentReceivedEvent,
    DisputeRaisedEvent,
} from '../types';

export interface NotificationItem {
    id: string;
    type: NotificationType | 'prescription';
    title: string;
    message: string;
    route?: string;
    createdAt?: string;
}

const STORAGE_KEY = 'cf_dismissed_notifications';

async function getDismissedIds(): Promise<Set<string>> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch {
        return new Set<string>();
    }
}

async function saveDismissedIds(ids: Set<string>): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {
        // Silently fail
    }
}

export function useNotifications() {
    const queryClient = useQueryClient();
    const { data: profile } = useProfile();
    const { data: pricing } = usePricing();
    const { data: newPrescriptions = [] } = useNewPrescriptions(10);

    // Get dismissed IDs from storage
    const { data: dismissedSet = new Set<string>() } = useQuery({
        queryKey: ['notifications', 'dismissed'],
        queryFn: getDismissedIds,
        staleTime: Infinity,
    });

    // Build all notifications
    const allNotifications: NotificationItem[] = useMemo(() => {
        const systemAlerts = getPharmacyNotifications(profile?.pharmacy, pricing);

        return [
            // System alerts (profile incomplete, pricing, etc.)
            ...systemAlerts.map(
                (a): NotificationItem => ({
                    id: a.id,
                    type: a.type,
                    title: a.title,
                    message: a.message,
                    route: a.actionRoute,
                }),
            ),
            // New prescription notifications
            ...newPrescriptions.map(
                (p): NotificationItem => ({
                    id: `prescription-${p.id}`,
                    type: 'prescription',
                    title: 'New prescription request',
                    message: `${p.patient?.fullName ?? 'A patient'} · ${p.reference}`,
                    route: `/prescription/${p.id}`,
                    createdAt: p.createdAt,
                }),
            ),
        ];
    }, [profile?.pharmacy, pricing, newPrescriptions]);

    // Filter out dismissed notifications
    const visibleNotifications = useMemo(() => {
        return allNotifications.filter((n) => !dismissedSet.has(n.id));
    }, [allNotifications, dismissedSet]);

    // Dismiss a single notification
    const dismiss = useCallback(
        async (id: string) => {
            const newSet = new Set([...dismissedSet, id]);
            await saveDismissedIds(newSet);
            queryClient.setQueryData(['notifications', 'dismissed'], newSet);
        },
        [dismissedSet, queryClient],
    );

    // Dismiss all notifications
    const dismissAll = useCallback(async () => {
        const allIds = visibleNotifications.map((n) => n.id);
        const newSet = new Set([...dismissedSet, ...allIds]);
        await saveDismissedIds(newSet);
        queryClient.setQueryData(['notifications', 'dismissed'], newSet);
    }, [dismissedSet, visibleNotifications, queryClient]);

    return {
        notifications: visibleNotifications,
        allNotifications,
        count: visibleNotifications.length,
        dismiss,
        dismissAll,
    };
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const NOTIFICATION_KEYS = {
    all: ['server-notifications'] as const,
    list: (params?: NotificationQueryParams) => [...NOTIFICATION_KEYS.all, 'list', params] as const,
    counts: ['server-notifications', 'counts'] as const,
};

// ─── Socket Connection Hook ───────────────────────────────────────────────────

/**
 * Initializes socket connection when user is authenticated.
 * Should be called once at app root level.
 */
export function useSocketConnection() {
    const { data: profile, isLoading: profileLoading } = useProfile();
    const isConnecting = useRef(false);

    useEffect(() => {
        const userId = profile?.user?.id;

        // Don't attempt connection if:
        // - Profile is still loading
        // - No user ID
        // - Already connecting
        if (profileLoading || !userId || isConnecting.current) return;

        const attemptConnection = async () => {
            // Double-check we have a valid token before attempting socket connection
            const { storage } = await import('@/core/storage');
            const token = await storage.getToken();

            if (!token) {
                console.log('⚠️ [Socket] No token available, skipping connection');
                return;
            }

            isConnecting.current = true;

            try {
                await socketCore.connect(userId);
                console.log('✅ Socket connected for user:', userId);
            } catch (error) {
                console.error('❌ Socket connection failed:', error);
                // Error handling (including auth errors) is done in socketClient
            } finally {
                isConnecting.current = false;
            }
        };

        attemptConnection();

        return () => {
            // Don't disconnect on unmount - let the app manage connection lifecycle
        };
    }, [profile?.user?.id, profileLoading]);

    return {
        isConnected: socketCore.isConnected(),
        connectionState: socketCore.getConnectionState(),
    };
}

// ─── Server Notification List Hook ────────────────────────────────────────────

/**
 * Fetches server notifications with optional filters and handles real-time updates.
 */
export function useServerNotifications(params?: NotificationQueryParams) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: NOTIFICATION_KEYS.list(params),
        queryFn: () => notificationService.getNotifications(params),
        staleTime: 30 * 1000, // 30 seconds
    });

    // Handle real-time notification updates
    useEffect(() => {
        const handleNewNotification = () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts });
        };

        const handleAllRead = () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts });
        };

        notificationSocket.onNotification(handleNewNotification);
        notificationSocket.onAllRead(handleAllRead);
        pharmacySocket.onNotification(handleNewNotification);

        return () => {
            notificationSocket.offNotification(handleNewNotification);
            notificationSocket.offAllRead(handleAllRead);
            pharmacySocket.offNotification(handleNewNotification);
        };
    }, [queryClient]);

    return {
        notifications: query.data?.notifications ?? [],
        total: (query.data as any)?.pagination?.total ?? query.data?.total ?? 0,
        isLoading: query.isLoading,
        isRefetching: query.isRefetching,
        error: query.error,
        refetch: query.refetch,
    };
}

// ─── Notification Counts Hook ─────────────────────────────────────────────────

/**
 * Fetches and maintains notification counts with real-time updates.
 */
export function useNotificationCounts() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: NOTIFICATION_KEYS.counts,
        queryFn: () => notificationService.getCounts(),
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000, // Backup refetch every minute
    });

    useEffect(() => {
        const handleCountsUpdate = (counts: NotificationCounts) => {
            queryClient.setQueryData(NOTIFICATION_KEYS.counts, counts);
        };

        const handleNewNotification = () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts });
        };

        const handleAllRead = () => {
            queryClient.setQueryData(NOTIFICATION_KEYS.counts, (old: NotificationCounts | undefined) => ({
                unread: 0,
                total: old?.total ?? 0,
            }));
        };

        notificationSocket.onCounts(handleCountsUpdate);
        notificationSocket.onNotification(handleNewNotification);
        notificationSocket.onAllRead(handleAllRead);
        pharmacySocket.onNotification(handleNewNotification);

        return () => {
            notificationSocket.offCounts(handleCountsUpdate);
            notificationSocket.offNotification(handleNewNotification);
            notificationSocket.offAllRead(handleAllRead);
            pharmacySocket.offNotification(handleNewNotification);
        };
    }, [queryClient]);

    return {
        unreadCount: query.data?.unread ?? 0,
        totalCount: query.data?.total ?? 0,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            queryClient.setQueryData(NOTIFICATION_KEYS.counts, (old: NotificationCounts | undefined) => ({
                unread: 0,
                total: old?.total ?? 0,
            }));
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts });
        },
    });
}

// ─── Pharmacy Event Hooks ─────────────────────────────────────────────────────

export function useNewPrescriptionEvent(callback: (event: NewPrescriptionEvent) => void) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const handler = (event: NewPrescriptionEvent) => callbackRef.current(event);
        pharmacySocket.onNewPrescription(handler);
        return () => {
            pharmacySocket.offNewPrescription(handler);
        };
    }, []);
}

export function usePrescriptionStatusEvent(callback: (event: PrescriptionStatusChangedEvent) => void) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const handler = (event: PrescriptionStatusChangedEvent) => callbackRef.current(event);
        pharmacySocket.onPrescriptionStatusChanged(handler);
        return () => {
            pharmacySocket.offPrescriptionStatusChanged(handler);
        };
    }, []);
}

export function usePaymentReceivedEvent(callback: (event: PaymentReceivedEvent) => void) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const handler = (event: PaymentReceivedEvent) => callbackRef.current(event);
        pharmacySocket.onPaymentReceived(handler);
        return () => {
            pharmacySocket.offPaymentReceived(handler);
        };
    }, []);
}

export function useDisputeRaisedEvent(callback: (event: DisputeRaisedEvent) => void) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const handler = (event: DisputeRaisedEvent) => callbackRef.current(event);
        pharmacySocket.onDisputeRaised(handler);
        return () => {
            pharmacySocket.offDisputeRaised(handler);
        };
    }, []);
}

/**
 * Combined hook that invalidates relevant queries when pharmacy events occur.
 * Use this in screens that display prescriptions, invoices, or wallet data.
 */
export function usePharmacyEventRefresh() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleNewPrescription = () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts });
        };

        const handleStatusChange = () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        };

        const handlePayment = () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        };

        const handleDispute = () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts });
        };

        pharmacySocket.onNewPrescription(handleNewPrescription);
        pharmacySocket.onPrescriptionStatusChanged(handleStatusChange);
        pharmacySocket.onPaymentReceived(handlePayment);
        pharmacySocket.onDisputeRaised(handleDispute);

        return () => {
            pharmacySocket.offNewPrescription(handleNewPrescription);
            pharmacySocket.offPrescriptionStatusChanged(handleStatusChange);
            pharmacySocket.offPaymentReceived(handlePayment);
            pharmacySocket.offDisputeRaised(handleDispute);
        };
    }, [queryClient]);
}
