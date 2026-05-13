/**
 * @file notification.service.ts
 * @description REST API service for notification endpoints.
 */
import { apiClient } from '@/core/api/client';
import type {
    Notification,
    NotificationsResponse,
    NotificationCountsResponse,
    NotificationQueryParams,
} from '../types';

const ENDPOINTS = {
    notifications: '/notifications',
    counts: '/notifications/counts',
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
    delete: (id: string) => `/notifications/${id}`,
} as const;

// API response wrapper type
interface ApiResponseWrapper<T> {
    success: boolean;
    data: T;
    location?: any;
}

export const notificationService = {
    /**
     * Get notifications with optional filters.
     */
    async getNotifications(params?: NotificationQueryParams): Promise<NotificationsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append('type', params.type);
        if (params?.isRead !== undefined) queryParams.append('isRead', String(params.isRead));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.skip) queryParams.append('skip', String(params.skip));

        const queryString = queryParams.toString();
        const url = queryString
            ? `${ENDPOINTS.notifications}?${queryString}`
            : ENDPOINTS.notifications;

        const response = await apiClient.get<ApiResponseWrapper<NotificationsResponse>>(url);
        // Extract nested data from API response wrapper
        return response.data || response;
    },

    /**
     * Get unread notification counts.
     */
    async getCounts(): Promise<NotificationCountsResponse> {
        const response = await apiClient.get<ApiResponseWrapper<{ counts: NotificationCountsResponse }>>(ENDPOINTS.counts);
        // Extract nested counts from API response wrapper
        const data = response.data || response;
        return (data as any).counts || data;
    },

    /**
     * Mark a single notification as read.
     */
    async markAsRead(notificationId: string): Promise<Notification> {
        const response = await apiClient.put<Notification>(ENDPOINTS.read(notificationId));
        return response;
    },

    /**
     * Mark all notifications as read.
     */
    async markAllAsRead(): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.put<{ success: boolean; message: string }>(
            ENDPOINTS.readAll,
        );
        return response;
    },

    /**
     * Delete a notification.
     */
    async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
        const response = await apiClient.delete<{ success: boolean }>(
            ENDPOINTS.delete(notificationId),
        );
        return response;
    },
};
