import { useMemo, useCallback } from 'react';
import { useProfile, usePricing } from '@/features/authentication/hooks/useAuth';
import { useNewPrescriptions } from '@/features/home/hooks';
import { getPharmacyNotifications, NotificationType } from '../utils/pharmacy-notifications';
import { formatRelativeTime } from '@/features/prescriptions/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
        const systemAlerts = getPharmacyNotifications(profile, pricing);

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
    }, [profile, pricing, newPrescriptions]);

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
