import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useProfile, usePricing } from '@/features/authentication/hooks/useAuth';
import { getPharmacyNotifications, PharmacyNotification, NotificationType } from '@/shared/utils/pharmacy-notifications';

const DISMISSED_ALERTS_KEY = '@pharmacy_dismissed_alerts';

interface AlertConfig {
    bgColor: string;
    borderColor: string;
    textColor: string;
    titleColor: string;
    iconColor: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const ALERT_CONFIG: Record<NotificationType, AlertConfig> = {
    info: {
        bgColor: '#EFF6FF',
        borderColor: '#3B82F6',
        textColor: '#1E40AF',
        titleColor: '#1E3A8A',
        iconColor: '#3B82F6',
        icon: 'information-circle',
    },
    warning: {
        bgColor: '#FFFBEB',
        borderColor: '#F59E0B',
        textColor: '#92400E',
        titleColor: '#78350F',
        iconColor: '#F59E0B',
        icon: 'alert-circle',
    },
    error: {
        bgColor: '#FEF2F2',
        borderColor: '#EF4444',
        textColor: '#991B1B',
        titleColor: '#7F1D1D',
        iconColor: '#EF4444',
        icon: 'close-circle',
    },
};

interface AlertItemProps {
    alert: PharmacyNotification;
    onDismiss: (id: string) => void;
    colors: typeof Colors.light;
}

function AlertItem({ alert, onDismiss, colors }: AlertItemProps) {
    const router = useRouter();
    const cfg = ALERT_CONFIG[alert.type];

    const handleAction = () => {
        if (alert.actionRoute) {
            router.push(alert.actionRoute as any);
        }
    };

    return (
        <View style={[styles.alertContainer, { backgroundColor: cfg.bgColor, borderLeftColor: cfg.borderColor }]}>
            <View style={styles.alertContent}>
                <View style={styles.alertHeader}>
                    <Ionicons name={cfg.icon} size={20} color={cfg.iconColor} />
                    <ThemedText style={[styles.alertTitle, { color: cfg.titleColor }]}>
                        {alert.title}
                    </ThemedText>
                    <TouchableOpacity
                        onPress={() => onDismiss(alert.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={18} color={cfg.textColor} />
                    </TouchableOpacity>
                </View>

                <ThemedText style={[styles.alertMessage, { color: cfg.textColor }]}>
                    {alert.message}
                </ThemedText>

                {alert.items && alert.items.length > 0 && (
                    <View style={styles.itemsList}>
                        {alert.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <View style={[styles.itemDot, { backgroundColor: cfg.textColor }]} />
                                <ThemedText style={[styles.itemText, { color: cfg.textColor }]}>
                                    {item}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                )}

                {alert.actionLabel && alert.actionRoute && (
                    <TouchableOpacity
                        onPress={handleAction}
                        style={[styles.actionButton, { backgroundColor: cfg.borderColor }]}
                    >
                        <ThemedText style={styles.actionButtonText}>
                            {alert.actionLabel}
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export function PharmacyAlerts() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { data: profileData, isLoading: isLoadingProfile } = useProfile();
    const { data: pricing, isLoading: isLoadingPricing } = usePricing();
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [isLoadingDismissed, setIsLoadingDismissed] = useState(true);

    // Load dismissed alerts from storage
    useEffect(() => {
        const loadDismissedAlerts = async () => {
            try {
                const stored = await AsyncStorage.getItem(DISMISSED_ALERTS_KEY);
                if (stored) {
                    setDismissedIds(new Set(JSON.parse(stored)));
                }
            } catch (error) {
                console.error('Failed to load dismissed alerts:', error);
            } finally {
                setIsLoadingDismissed(false);
            }
        };
        loadDismissedAlerts();
    }, []);

    // Save dismissed alerts to storage
    const handleDismiss = async (id: string) => {
        const newDismissed = new Set([...dismissedIds, id]);
        setDismissedIds(newDismissed);

        try {
            await AsyncStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify([...newDismissed]));
        } catch (error) {
            console.error('Failed to save dismissed alert:', error);
        }
    };

    if (isLoadingProfile || isLoadingPricing || isLoadingDismissed) {
        return null;
    }

    const profile = profileData?.pharmacy;
    const allAlerts = getPharmacyNotifications(profile, pricing);
    const visibleAlerts = allAlerts.filter(alert => !dismissedIds.has(alert.id));

    if (visibleAlerts.length === 0) {
        return null;
    }

    // Sort: warnings/errors first, then info
    const sortedAlerts = [
        ...visibleAlerts.filter(a => a.type === 'warning' || a.type === 'error'),
        ...visibleAlerts.filter(a => a.type === 'info'),
    ];

    return (
        <View style={styles.container}>
            {sortedAlerts.map(alert => (
                <AlertItem
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismiss}
                    colors={colors}
                />
            ))}
        </View>
    );
}

// Export helper to clear dismissed alerts (call on login)
export async function clearDismissedAlerts(): Promise<void> {
    try {
        await AsyncStorage.removeItem(DISMISSED_ALERTS_KEY);
    } catch (error) {
        console.error('Failed to clear dismissed alerts:', error);
    }
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
        marginBottom: 16,
    },
    alertContainer: {
        borderLeftWidth: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    alertContent: {
        padding: 12,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    alertTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    alertMessage: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    itemsList: {
        marginTop: 4,
        marginBottom: 8,
        gap: 4,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    itemText: {
        fontSize: 13,
    },
    actionButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 4,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
});
