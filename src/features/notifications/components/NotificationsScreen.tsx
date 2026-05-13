import React from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useServerNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '../hooks';
import { formatRelativeTime } from '@/features/prescriptions/types';
import type { Notification, NotificationType } from '../types';

type DisplayType = 'warning' | 'info' | 'error' | 'success' | 'prescription' | 'payment' | 'payout';

const TYPE_CONFIG: Record<DisplayType, { bg: string; iconName: keyof typeof Ionicons.glyphMap; iconColor: string }> = {
    warning: { bg: '#FEF3C7', iconName: 'alert-circle', iconColor: '#F59E0B' },
    info: { bg: '#DBEAFE', iconName: 'information-circle', iconColor: '#3B82F6' },
    error: { bg: '#FEE2E2', iconName: 'close-circle', iconColor: '#EF4444' },
    success: { bg: '#D1FAE5', iconName: 'checkmark-circle', iconColor: '#10B981' },
    prescription: { bg: '#E0E7FF', iconName: 'document-text', iconColor: '#6366F1' },
    payment: { bg: '#D1FAE5', iconName: 'card', iconColor: '#10B981' },
    payout: { bg: '#FEF3C7', iconName: 'wallet', iconColor: '#F59E0B' },
};

function getDisplayType(type: string, metadata?: Record<string, any>): DisplayType {
    // Check metadata type first for more specific categorization
    const metadataType = metadata?.type as string | undefined;

    if (metadataType === 'prescription_assigned' || metadataType === 'alternative_approved') {
        return 'prescription';
    }
    if (metadataType === 'new_chat_message') {
        return 'info';
    }

    switch (type) {
        case 'payment_received':
            return 'payment';
        case 'payout_requested':
        case 'payout_completed':
        case 'payout_failed':
            return 'payout';
        case 'new_prescription':
        case 'prescription_status_changed':
            return 'prescription';
        case 'dispute_raised':
        case 'dispute_resolved':
            return 'warning';
        case 'invoice_sent':
        case 'invoice_overdue':
            return 'info';
        case 'notification':
            return 'info';
        default:
            return 'info';
    }
}

function getNotificationTitle(type: string, metadata?: Record<string, any>): string {
    const metadataType = metadata?.type as string | undefined;

    if (metadataType === 'prescription_assigned') {
        return 'New Prescription';
    }
    if (metadataType === 'alternative_approved') {
        return 'Alternative Approved';
    }
    if (metadataType === 'new_chat_message') {
        return 'New Message';
    }

    switch (type) {
        case 'payment_received':
            return 'Payment Received';
        case 'payout_requested':
            return 'Payout Requested';
        case 'payout_completed':
            return 'Payout Completed';
        case 'payout_failed':
            return 'Payout Failed';
        case 'new_prescription':
            return 'New Prescription';
        case 'prescription_status_changed':
            return 'Status Updated';
        case 'dispute_raised':
            return 'Dispute Raised';
        case 'dispute_resolved':
            return 'Dispute Resolved';
        case 'invoice_sent':
            return 'Invoice Sent';
        case 'invoice_overdue':
            return 'Invoice Overdue';
        default:
            return 'Notification';
    }
}

export function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { notifications, isLoading, refetch } = useServerNotifications();
    const { mutate: markAllRead } = useMarkAllNotificationsRead();
    const { mutate: markAsRead } = useMarkNotificationRead();

    const [refreshing, setRefreshing] = React.useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationPress = (notification: Notification) => {
        console.log('Notification pressed:', notification);
        console.log('Metadata:', notification.metadata);

        // Mark as read when tapped
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigate based on metadata
        if (notification.metadata?.prescriptionId) {
            console.log('Navigating to prescription:', notification.metadata.prescriptionId);
            router.push({
                pathname: '/prescription/[id]',
                params: { id: notification.metadata.prescriptionId }
            } as any);
        } else if (notification.metadata?.invoiceId) {
            console.log('Navigating to invoice:', notification.metadata.invoiceId);
            router.push({
                pathname: '/invoice/[id]',
                params: { id: notification.metadata.invoiceId }
            } as any);
        } else {
            console.log('No route available for this notification');
        }
    };

    const handleMarkAllRead = () => {
        markAllRead();
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    return (
        <ThemedView style={styles.container}>
            {/* Header - Wallet Style */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
                {unreadCount > 0 ? (
                    <TouchableOpacity onPress={handleMarkAllRead} style={styles.rightButton}>
                        <Ionicons name="checkmark-done" size={24} color={colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.rightButton} />
                )}
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={[styles.loadingText, { color: colors.placeholder }]}>
                        Loading notifications...
                    </ThemedText>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {notifications.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.inputBackground }]}>
                                <Ionicons name="notifications-outline" size={32} color={colors.placeholder} />
                            </View>
                            <ThemedText style={styles.emptyTitle}>You&apos;re all caught up!</ThemedText>
                            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                                No new notifications right now.
                            </ThemedText>
                        </View>
                    ) : (
                        notifications.map((notification) => {
                            const displayType = getDisplayType(notification.type, notification.metadata);
                            const config = TYPE_CONFIG[displayType];
                            const title = getNotificationTitle(notification.type, notification.metadata);

                            return (
                                <TouchableOpacity
                                    key={notification.id}
                                    style={[
                                        styles.notificationItem,
                                        { backgroundColor: colors.background },
                                        !notification.isRead && styles.unreadItem
                                    ]}
                                    onPress={() => handleNotificationPress(notification)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.notificationIcon, { backgroundColor: config.bg }]}>
                                        <Ionicons
                                            name={config.iconName}
                                            size={20}
                                            color={config.iconColor}
                                        />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <View style={styles.titleRow}>
                                            <ThemedText style={[
                                                styles.notificationTitle,
                                                !notification.isRead && styles.unreadTitle
                                            ]}>
                                                {title}
                                            </ThemedText>
                                            {!notification.isRead && (
                                                <View style={styles.unreadDot} />
                                            )}
                                        </View>
                                        <ThemedText
                                            style={[styles.notificationMessage, { color: colors.placeholder }]}
                                            numberOfLines={2}
                                        >
                                            {notification.message}
                                        </ThemedText>
                                        <ThemedText style={[styles.notificationTime, { color: colors.placeholder }]}>
                                            {formatRelativeTime(notification.createdAt)}
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                    <View style={{ height: 24 }} />
                </ScrollView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 60,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    rightButton: {
        padding: 4,
        width: 32,
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 12,
    },
    unreadItem: {
        backgroundColor: '#F8FAFC',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
    },
    notificationMessage: {
        fontSize: 13,
        lineHeight: 18,
    },
    notificationTime: {
        fontSize: 11,
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
    },
});
