import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useProfile, useLogout, useUpdateProfile } from '@/features/authentication/hooks/useAuth';
import { useAppTheme } from '@/core/providers/AppThemeProvider';
import { getCurrencySymbol } from '@/shared/constants/currency';
import type { OperatingHours } from '@/features/authentication/types';

// ─── Types ───────────────────────────────────────────
interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    showArrow?: boolean;
    onPress?: () => void;
    colors: typeof Colors.light;
    danger?: boolean;
    loading?: boolean;
}

interface ToggleItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    colors: typeof Colors.light;
    loading?: boolean;
}

// ─── Menu Item ───────────────────────────────────────
function MenuItem({ icon, label, value, showArrow = true, onPress, colors, danger, loading }: MenuItemProps) {
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={loading || !onPress}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: danger ? '#FEE2E2' : `${colors.primary}15` }]}>
                {loading ? (
                    <ActivityIndicator size="small" color={danger ? '#DC2626' : colors.primary} />
                ) : (
                    <Ionicons name={icon} size={20} color={danger ? '#DC2626' : colors.primary} />
                )}
            </View>
            <View style={styles.menuContent}>
                <ThemedText style={[styles.menuLabel, danger && { color: '#DC2626' }]}>{label}</ThemedText>
                {value && (
                    <ThemedText style={[styles.menuValue, { color: colors.placeholder }]}>
                        {value}
                    </ThemedText>
                )}
            </View>
            {showArrow && !loading && (
                <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
            )}
        </TouchableOpacity>
    );
}

// ─── Toggle Item ─────────────────────────────────────
function ToggleItem({ icon, label, value, onToggle, colors, loading }: ToggleItemProps) {
    return (
        <View style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                {loading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                    <Ionicons name={icon} size={20} color={colors.primary} />
                )}
            </View>
            <View style={styles.menuContent}>
                <ThemedText style={styles.menuLabel}>{label}</ThemedText>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                disabled={loading}
                trackColor={{ false: '#E5E7EB', true: `${colors.primary}50` }}
                thumbColor={value ? colors.primary : '#FFFFFF'}
            />
        </View>
    );
}

// ─── Section Header ──────────────────────────────────
function SectionHeader({ title }: { title: string }) {
    return (
        <ThemedText style={styles.sectionHeader}>{title}</ThemedText>
    );
}

// ─── Helpers ──────────────────────────────────────────
function formatHours(hours?: OperatingHours) {
    if (!hours) return 'Not configured';
    const days = Object.keys(hours);
    if (days.length === 0) return 'Closed';
    if (days.length === 7) return 'Open 24/7 (Everyday)';
    return `${days.length} days configured`;
}

// ─── Profile Screen ──────────────────────────────────
export function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    
    const { data: profileData, isLoading: loadingProfile } = useProfile();
    const logoutMutation = useLogout();
    const updateProfile = useUpdateProfile();
    const { theme, toggleTheme } = useAppTheme();

    const isDark = theme === 'dark';

    const profile = profileData?.pharmacy;
    const location = profileData?.location;

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logoutMutation.mutateAsync();
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('Logout failed:', error);
                            router.replace('/(auth)/login');
                        }
                    },
                },
            ]
        );
    };

    const toggleNotifications = async (val: boolean) => {
        try {
            await updateProfile.mutateAsync({
                notificationPreferences: {
                    ...profile?.notificationPreferences,
                    push: {
                        ...profile?.notificationPreferences?.push,
                        newOrder: val,
                        orderStatusUpdate: val,
                    }
                }
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update notification preferences');
        }
    };

    if (loadingProfile && !profile) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
        );
    }

    const pushEnabled = !!(profile?.notificationPreferences?.push?.newOrder || profile?.notificationPreferences?.push?.orderStatusUpdate);

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.headerTitle}>Profile</ThemedText>
                </View>

                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                        {profile?.logoUrl ? (
                            <Image source={{ uri: profile.logoUrl }} style={styles.avatarImage} />
                        ) : (
                            <ThemedText style={styles.avatarText}>
                                {profile?.pharmacyName?.charAt(0) || 'P'}
                            </ThemedText>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <ThemedText style={styles.pharmacyName}>{profile?.pharmacyName || 'Loading...'}</ThemedText>
                        <ThemedText style={[styles.registrationNumber, { color: colors.placeholder }]}>
                            {profile?.registrationNumber || 'No registration number'}
                        </ThemedText>
                        {/* Location and Currency */}
                        <View style={styles.profileMeta}>
                            {location && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="location-outline" size={12} color={colors.primary} />
                                    <ThemedText style={[styles.metaText, { color: colors.placeholder }]}>
                                        {location.city}, {location.country}
                                    </ThemedText>
                                </View>
                            )}
                            {profile?.defaultCurrency && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="cash-outline" size={12} color={colors.primary} />
                                    <ThemedText style={[styles.metaText, { color: colors.placeholder }]}>
                                        {profile.defaultCurrency} ({getCurrencySymbol(profile.defaultCurrency)})
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.editButton, { borderColor: colors.primary }]}
                        onPress={() => router.push('/profile/pharmacy-info')}
                    >
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Pharmacy Information */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <SectionHeader title="Pharmacy Information" />
                    {/* <MenuItem
                        icon="business-outline"
                        label="Pharmacy Details"
                        value={profile?.pharmacyName}
                        onPress={() => router.push('/profile/pharmacy-info')}
                        colors={colors}
                    /> */}
                    <MenuItem
                        icon="time-outline"
                        label="Operating Hours"
                        value={formatHours(profile?.operatingHours)}
                        onPress={() => router.push('/profile/operating-hours')}
                        colors={colors}
                    />
                    <MenuItem
                        icon="pricetags-outline"
                        label="Pricing Configuration"
                        onPress={() => router.push('/profile/pricing')}
                        colors={colors}
                    />
                </View>

                {/* Notifications */}
                {/* <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <SectionHeader title="Notifications" />
                    <ToggleItem
                        icon="notifications-outline"
                        label="Push Notifications"
                        value={pushEnabled}
                        onToggle={toggleNotifications}
                        colors={colors}
                        loading={updateProfile.isPending}
                    />
                    <MenuItem
                        icon="settings-outline"
                        label="Notification Settings"
                        onPress={() => router.push('/profile/notifications')}
                        colors={colors}
                    />
                </View> */}

                {/* Account */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <SectionHeader title="Account" />
                    <MenuItem
                        icon="person-outline"
                        label="Account Settings"
                        onPress={() => router.push('/profile/account-settings')}
                        colors={colors}
                    />
                    <MenuItem
                        icon="people-outline"
                        label="Staff Management"
                        onPress={() => router.push('/profile/staff')}
                        colors={colors}
                    />
                </View>

                {/* Wallet & Payments */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <SectionHeader title="Wallet & Payments" />
                    <MenuItem
                        icon="wallet-outline"
                        label="Wallet"
                        onPress={() => router.push('/wallet')}
                        colors={colors}
                    />
                    <MenuItem
                        icon="card-outline"
                        label="Bank Accounts"
                        onPress={() => router.push('/profile/bank-accounts')}
                        colors={colors}
                    />
                </View>

                {/* Preferences */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <SectionHeader title="Preferences" />
                    <ToggleItem
                        icon="moon-outline"
                        label="Dark Mode"
                        value={isDark}
                        onToggle={toggleTheme}
                        colors={colors}
                    />
                </View>

                {/* Support */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <SectionHeader title="Support" />
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help & Support"
                        onPress={() => router.push('/profile/support')}
                        colors={colors}
                    />
                </View>

                {/* Logout */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <MenuItem
                        icon="log-out-outline"
                        label="Logout"
                        showArrow={false}
                        onPress={handleLogout}
                        colors={colors}
                        danger
                        loading={logoutMutation.isPending}
                    />
                </View>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <ThemedText style={[styles.versionText, { color: colors.placeholder }]}>
                        Version 1.0.0
                    </ThemedText>
                </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 12,
    },
    pharmacyName: {
        fontSize: 18,
        fontWeight: '700',
    },
    registrationNumber: {
        fontSize: 13,
        marginTop: 2,
    },
    profileMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
        paddingHorizontal: 16,
        paddingVertical: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContent: {
        flex: 1,
        marginLeft: 12,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuValue: {
        fontSize: 13,
        marginTop: 2,
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    versionText: {
        fontSize: 13,
    },
});
