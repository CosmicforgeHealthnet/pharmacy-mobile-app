import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProfile, useUpdateProfile } from '@/features/authentication/hooks/useAuth';
import type { NotificationPreferences } from '@/features/authentication/types';

type NotificationCategory = 'email' | 'push' | 'sms';

interface NotificationOption {
    key: string;
    label: string;
    description: string;
}

const EMAIL_OPTIONS: NotificationOption[] = [
    { key: 'newOrder', label: 'New Order', description: 'When a new prescription is assigned to you' },
    { key: 'orderStatusUpdate', label: 'Order Status Update', description: 'When order status changes' },
    { key: 'paymentReceived', label: 'Payment Received', description: 'When payment is confirmed' },
    { key: 'lowStock', label: 'Low Stock Alert', description: 'When inventory is running low' },
];

const PUSH_OPTIONS: NotificationOption[] = [
    { key: 'newOrder', label: 'New Order', description: 'Instant notification for new prescriptions' },
    { key: 'orderStatusUpdate', label: 'Order Status Update', description: 'Real-time status changes' },
    { key: 'paymentReceived', label: 'Payment Received', description: 'Payment confirmations' },
    { key: 'lowStock', label: 'Low Stock Alert', description: 'Inventory warnings' },
];

const SMS_OPTIONS: NotificationOption[] = [
    { key: 'newOrder', label: 'New Order', description: 'SMS for urgent new prescriptions' },
    { key: 'orderStatusUpdate', label: 'Order Status Update', description: 'Critical status updates via SMS' },
];

const DEFAULT_PREFS: NotificationPreferences = {
    email: {
        newOrder: true,
        orderStatusUpdate: true,
        paymentReceived: true,
        lowStock: false,
    },
    push: {
        newOrder: true,
        orderStatusUpdate: true,
        paymentReceived: false,
        lowStock: true,
    },
    sms: {
        newOrder: false,
        orderStatusUpdate: false,
    },
};

export function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { data: profileData, isLoading: loadingProfile } = useProfile();
    const updateProfile = useUpdateProfile();

    const profile = profileData?.pharmacy;

    const [isEditing, setIsEditing] = useState(false);
    const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);

    useEffect(() => {
        if (profile?.notificationPreferences && Object.keys(profile.notificationPreferences).length > 0) {
            setPrefs(profile.notificationPreferences);
        }
    }, [profile]);

    const resetForm = () => {
        if (profile?.notificationPreferences && Object.keys(profile.notificationPreferences).length > 0) {
            setPrefs(profile.notificationPreferences);
        } else {
            setPrefs(DEFAULT_PREFS);
        }
    };

    const handleStartEditing = () => {
        resetForm();
        setIsEditing(true);
    };

    const handleCancel = () => {
        resetForm();
        setIsEditing(false);
    };

    const updatePref = (category: NotificationCategory, key: string, value: boolean) => {
        setPrefs((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            },
        }));
    };

    const handleSave = async () => {
        try {
            await updateProfile.mutateAsync({ notificationPreferences: prefs });
            Alert.alert('Success', 'Notification preferences updated successfully');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update preferences. Please try again.');
        }
    };

    if (loadingProfile && !profile) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
        );
    }

    const getStatusText = (category: NotificationCategory, options: NotificationOption[]) => {
        const categoryPrefs = prefs[category] as any;
        if (!categoryPrefs) return 'All off';
        const enabledCount = options.filter(opt => categoryPrefs[opt.key]).length;
        if (enabledCount === 0) return 'All off';
        if (enabledCount === options.length) return 'All on';
        return `${enabledCount} of ${options.length} on`;
    };

    const renderViewSection = (
        title: string,
        icon: keyof typeof Ionicons.glyphMap,
        category: NotificationCategory,
        options: NotificationOption[],
        bgColor: string,
        iconColor: string
    ) => (
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.sectionHeader, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
                <ThemedText style={[styles.sectionTitle, { color: iconColor }]}>{title}</ThemedText>
            </View>
            {options.map((option, index) => {
                const isEnabled = (prefs[category] as any)?.[option.key] ?? false;
                return (
                    <View
                        key={option.key}
                        style={[
                            styles.optionRow,
                            index < options.length - 1 && styles.optionBorder,
                        ]}
                    >
                        <View style={styles.optionInfo}>
                            <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                            <ThemedText style={[styles.optionDescription, { color: colors.placeholder }]}>
                                {option.description}
                            </ThemedText>
                        </View>
                        <View style={[
                            styles.statusIndicator,
                            { backgroundColor: isEnabled ? '#ECFDF5' : '#F3F4F6' }
                        ]}>
                            <Ionicons
                                name={isEnabled ? 'checkmark-circle' : 'close-circle'}
                                size={18}
                                color={isEnabled ? '#059669' : '#9CA3AF'}
                            />
                            <ThemedText style={[
                                styles.statusText,
                                { color: isEnabled ? '#059669' : '#9CA3AF' }
                            ]}>
                                {isEnabled ? 'On' : 'Off'}
                            </ThemedText>
                        </View>
                    </View>
                );
            })}
        </View>
    );

    const renderEditSection = (
        title: string,
        icon: keyof typeof Ionicons.glyphMap,
        category: NotificationCategory,
        options: NotificationOption[],
        bgColor: string,
        iconColor: string
    ) => (
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.sectionHeader, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
                <ThemedText style={[styles.sectionTitle, { color: iconColor }]}>{title}</ThemedText>
            </View>
            {options.map((option, index) => (
                <View
                    key={option.key}
                    style={[
                        styles.optionRow,
                        index < options.length - 1 && styles.optionBorder,
                    ]}
                >
                    <View style={styles.optionInfo}>
                        <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                        <ThemedText style={[styles.optionDescription, { color: colors.placeholder }]}>
                            {option.description}
                        </ThemedText>
                    </View>
                    <Switch
                        value={(prefs[category] as any)?.[option.key] ?? false}
                        onValueChange={(checked) => updatePref(category, option.key, checked)}
                        trackColor={{ false: '#E5E7EB', true: `${colors.primary}50` }}
                        thumbColor={(prefs[category] as any)?.[option.key] ? colors.primary : '#FFFFFF'}
                    />
                </View>
            ))}
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
                {!isEditing ? (
                    <TouchableOpacity
                        onPress={handleStartEditing}
                        style={[styles.editButton, { backgroundColor: `${colors.primary}15` }]}
                    >
                        <Ionicons name="pencil" size={18} color={colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ThemedText style={[styles.pageDescription, { color: colors.placeholder }]}>
                    {isEditing
                        ? 'Toggle the switches to change your notification preferences.'
                        : 'Choose how you want to receive notifications about orders and updates.'}
                </ThemedText>

                {isEditing ? (
                    <>
                        {/* Edit Mode */}
                        {renderEditSection(
                            'Email Notifications',
                            'mail-outline',
                            'email',
                            EMAIL_OPTIONS,
                            '#EFF6FF',
                            '#2563EB'
                        )}

                        {renderEditSection(
                            'Push Notifications',
                            'notifications-outline',
                            'push',
                            PUSH_OPTIONS,
                            '#F3E8FF',
                            '#9333EA'
                        )}

                        {renderEditSection(
                            'SMS Notifications',
                            'chatbox-outline',
                            'sms',
                            SMS_OPTIONS,
                            '#ECFDF5',
                            '#059669'
                        )}

                        {/* Action Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                                onPress={handleCancel}
                                disabled={updateProfile.isPending}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                                onPress={handleSave}
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Save</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        {/* View Mode */}
                        {renderViewSection(
                            'Email Notifications',
                            'mail-outline',
                            'email',
                            EMAIL_OPTIONS,
                            '#EFF6FF',
                            '#2563EB'
                        )}

                        {renderViewSection(
                            'Push Notifications',
                            'notifications-outline',
                            'push',
                            PUSH_OPTIONS,
                            '#F3E8FF',
                            '#9333EA'
                        )}

                        {renderViewSection(
                            'SMS Notifications',
                            'chatbox-outline',
                            'sms',
                            SMS_OPTIONS,
                            '#ECFDF5',
                            '#059669'
                        )}
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontWeight: '600',
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerSpacer: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
        paddingBottom: 40,
    },
    pageDescription: {
        fontSize: 14,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    optionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    optionInfo: {
        flex: 1,
        marginRight: 12,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    optionDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    saveButton: {},
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
