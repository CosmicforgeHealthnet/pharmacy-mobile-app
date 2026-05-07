import { useQuery, useQueryClient } from '@tanstack/react-query';
import { homeService } from '../services';
import type {
    DashboardStats,
    DashboardActivityItem,
    Prescription,
    ActiveOrder,
} from '../types';

export const HOME_QUERY_KEYS = {
    stats: ['home', 'stats'] as const,
    activity: (limit: number) => ['home', 'activity', limit] as const,
    prescriptions: (limit: number) => ['home', 'prescriptions', limit] as const,
    orders: ['home', 'orders'] as const,
};

// ─── Dashboard Stats Hook ─────────────────────────────────────────────────────

export function useDashboardStats() {
    return useQuery({
        queryKey: HOME_QUERY_KEYS.stats,
        queryFn: () => homeService.getDashboardStats(),
    });
}

// ─── Dashboard Activity Hook ──────────────────────────────────────────────────

export function useDashboardActivity(limit = 10) {
    return useQuery({
        queryKey: HOME_QUERY_KEYS.activity(limit),
        queryFn: () => homeService.getDashboardActivity(limit),
    });
}

// ─── New Prescriptions Hook ───────────────────────────────────────────────────

export function useNewPrescriptions(limit = 5) {
    return useQuery({
        queryKey: HOME_QUERY_KEYS.prescriptions(limit),
        queryFn: () => homeService.getNewPrescriptions(limit),
    });
}

// ─── Active Orders Hook ───────────────────────────────────────────────────────

export function useActiveOrders() {
    return useQuery({
        queryKey: HOME_QUERY_KEYS.orders,
        queryFn: () => homeService.getActiveOrders(),
    });
}

// ─── Combined Home Data Hook ──────────────────────────────────────────────────

export function useHomeData() {
    const { 
        data: stats, 
        isLoading: statsLoading, 
        error: statsError, 
        refetch: refetchStats 
    } = useDashboardStats();

    const { 
        data: activities, 
        isLoading: activitiesLoading, 
        error: activitiesError, 
        refetch: refetchActivities 
    } = useDashboardActivity(5);

    const { 
        data: prescriptions, 
        isLoading: prescriptionsLoading, 
        error: prescriptionsError, 
        refetch: refetchPrescriptions 
    } = useNewPrescriptions(3);

    const { 
        data: orders, 
        isLoading: ordersLoading, 
        error: ordersError, 
        refetch: refetchOrders 
    } = useActiveOrders();

    const loading = statsLoading || activitiesLoading || prescriptionsLoading || ordersLoading;
    const error = statsError || activitiesError || prescriptionsError || ordersError;

    const refetchAll = async () => {
        await Promise.all([
            refetchStats(),
            refetchActivities(),
            refetchPrescriptions(),
            refetchOrders(),
        ]);
    };

    return {
        stats,
        activities: activities ?? [],
        prescriptions: prescriptions ?? [],
        orders: orders ?? [],
        loading,
        error,
        refetch: refetchAll,
    };
}
