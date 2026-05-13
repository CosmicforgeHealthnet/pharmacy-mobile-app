import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useNotificationCounts } from '../hooks';

interface NotificationBellProps {
    colors: typeof Colors.light;
}

export function NotificationBell({ colors }: NotificationBellProps) {
    const router = useRouter();
    const { unreadCount } = useNotificationCounts();

    return (
        <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
            onPress={() => router.push('/notifications')}
        >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </ThemedText>
                </View>
            )}
        </TouchableOpacity>
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
});
