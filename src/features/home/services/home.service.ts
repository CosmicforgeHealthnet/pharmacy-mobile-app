import { apiClient } from '@/core/api/client';
import type {
    Prescription,
    PrescriptionListResponse,
    ActiveOrder,
    DashboardStats,
    DashboardActivityItem,
} from '../types';

// ─── API Endpoints ────────────────────────────────────────────────────────────

const PRESCRIPTION_URLS = {
    BASE: '/pharmacy/prescriptions',
    DETAIL: (id: string) => `/pharmacy/prescriptions/${id}`,
    DASHBOARD_STATS: '/pharmacy/prescriptions/dashboard/stats',
    DASHBOARD_ACTIVITY: '/pharmacy/prescriptions/dashboard/activity',
    ACTIVE: '/pharmacy/prescriptions/active',
} as const;

// ─── Helper Functions ─────────────────────────────────────────────────────────

function normalisePrescriptions(raw: any): Prescription[] {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.prescriptions)) return raw.prescriptions;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
}

const NEW_STATUSES = ['new', 'pending'];

// ─── Home Service ─────────────────────────────────────────────────────────────

class HomeService {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await apiClient.get<any>(PRESCRIPTION_URLS.DASHBOARD_STATS);
        const data = response?.data ?? response;
        return data;
    }

    /**
     * Get dashboard activity
     */
    async getDashboardActivity(limit = 10): Promise<DashboardActivityItem[]> {
        const response = await apiClient.get<any>(PRESCRIPTION_URLS.DASHBOARD_ACTIVITY, {
            params: { limit },
        });
        const data = response?.data ?? response;
        return Array.isArray(data) ? data : [];
    }

    /**
     * Get new prescription requests (status: new, pending)
     */
    async getNewPrescriptions(limit = 5): Promise<Prescription[]> {
        const response = await apiClient.get<any>(PRESCRIPTION_URLS.BASE, {
            params: { limit: limit * 2 }, // Fetch more to filter
        });
        const all = normalisePrescriptions(response);
        return all
            .filter((p) => NEW_STATUSES.includes(p.status))
            .slice(0, limit);
    }

    /**
     * Get all prescriptions with optional filters
     */
    async getPrescriptions(params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<Prescription[]> {
        const response = await apiClient.get<any>(PRESCRIPTION_URLS.BASE, { params });
        return normalisePrescriptions(response);
    }

    /**
     * Get active orders
     */
    async getActiveOrders(): Promise<ActiveOrder[]> {
        const response = await apiClient.get<any>(PRESCRIPTION_URLS.ACTIVE);
        const data = response?.data ?? response;
        return Array.isArray(data) ? data : [];
    }

    /**
     * Get prescription by ID
     */
    async getPrescriptionById(id: string): Promise<Prescription> {
        const response = await apiClient.get<any>(PRESCRIPTION_URLS.DETAIL(id));
        const data = response?.data ?? response;
        return data;
    }
}

export const homeService = new HomeService();
