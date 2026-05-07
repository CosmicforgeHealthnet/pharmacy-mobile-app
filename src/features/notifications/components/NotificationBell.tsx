import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useNotifications, NotificationItem } from '../hooks';
import { formatRelativeTime } from '@/features/prescriptions/types';

interface NotificationBellProps {
    colors: typeof Colors.light;
}

const TYPE_CONFIG: Record<
    NotificationItem['type'],
    { bg: string; iconName: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
    warning: { bg: '#FEF3C7', iconName: 'alert-circle', iconColor: '#F59E0B' },
    info: { bg: '#DBEAFE', iconName: 'information-circle', iconColor: '#3B82F6' },
    error: { bg: '#FEE2E2', iconName: 'close-circle', iconColor: '#EF4444' },
    prescription: { bg: '#E0E7FF', iconName: 'document-text', iconColor: '#6366F1' },
};

export function NotificationBell({ colors }: NotificationBellProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, count, dismiss, dismissAll } = useNotifications();

    const handleNotificationPress = (notification: NotificationItem) => {
        if (notification.route) {
            setIsOpen(false);
            router.push(notification.route as any);
        }
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
                onPress={() => setIsOpen(true)}
            >
                <Ionicons name="notifications-outline" size={22} color={colors.text} />
                {count > 0 && (
                    <View style={styles.badge}>
                        <ThemedText style={styles.badgeText}>
                            {count > 99 ? '99+' : count}
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.headerLeft}>
                                <ThemedText style={styles.modalTitle}>Notifications</ThemedText>
                                {count > 0 && (
                                    <View style={styles.countBadge}>
                                        <ThemedText style={styles.countText}>{count} new</ThemedText>
                                    </View>
                                )}
                            </View>
                            <View style={styles.headerRight}>
                                {count > 0 && (
                                    <TouchableOpacity
                                        onPress={dismissAll}
                                        style={styles.markAllButton}
                                    >
                                        <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                                        <ThemedText style={[styles.markAllText, { color: colors.primary }]}>
                                            Mark all read
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => setIsOpen(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Notification List */}
                        <ScrollView
                            style={styles.notificationList}
                            showsVerticalScrollIndicator={false}
                        >
                            {notifications.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <View style={[styles.emptyIcon, { backgroundColor: colors.inputBackground }]}>
                                        <Ionicons name="notifications-outline" size={32} color={colors.placeholder} />
                                    </View>
                                    <ThemedText style={styles.emptyTitle}>You're all caught up!</ThemedText>
                                    <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                                        No new notifications right now.
                                    </ThemedText>
                                </View>
                            ) : (
                                notifications.map((notification) => {
                                    const config = TYPE_CONFIG[notification.type];
                                    return (
                                        <TouchableOpacity
                                            key={notification.id}
                                            style={[styles.notificationItem, { backgroundColor: colors.background }]}
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
                                                <ThemedText style={styles.notificationTitle}>
                                                    {notification.title}
                                                </ThemedText>
                                                <ThemedText
                                                    style={[styles.notificationMessage, { color: colors.placeholder }]}
                                                    numberOfLines={2}
                                                >
                                                    {notification.message}
                                                </ThemedText>
                                                {notification.createdAt && (
                                                    <ThemedText style={[styles.notificationTime, { color: colors.placeholder }]}>
                                                        {formatRelativeTime(notification.createdAt)}
                                                    </ThemedText>
                                                )}
                                            </View>
                                            <TouchableOpacity
                                                style={styles.dismissButton}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    dismiss(notification.id);
                                                }}
                                            >
                                                <Ionicons name="close" size={18} color={colors.placeholder} />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                            <View style={{ height: 24 }} />
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        backgroundColor: '#EF4444',
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingTop: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    countBadge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#EF4444',
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    markAllText: {
        fontSize: 12,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
    },
    notificationList: {
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
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    notificationMessage: {
        fontSize: 13,
        lineHeight: 18,
    },
    notificationTime: {
        fontSize: 11,
        marginTop: 4,
    },
    dismissButton: {
        padding: 4,
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
