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
} from 'react-native';

// ─── Types ───────────────────────────────────────────
interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    showArrow?: boolean;
    onPress?: () => void;
    colors: typeof Colors.light;
    danger?: boolean;
}

interface ToggleItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    colors: typeof Colors.light;
}

// ─── Menu Item ───────────────────────────────────────
function MenuItem({ icon, label, value, showArrow = true, onPress, colors, danger }: MenuItemProps) {
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: danger ? '#FEE2E2' : `${colors.primary}15` }]}>
                <Ionicons name={icon} size={20} color={danger ? '#DC2626' : colors.primary} />
            </View>
            <View style={styles.menuContent}>
                <ThemedText style={[styles.menuLabel, danger && { color: '#DC2626' }]}>{label}</ThemedText>
                {value && (
                    <ThemedText style={[styles.menuValue, { color: colors.placeholder }]}>
                        {value}
                    </ThemedText>
                )}
            </View>
            {showArrow && (
                <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
            )}
        </TouchableOpacity>
    );
}

// ─── Toggle Item ─────────────────────────────────────
function ToggleItem({ icon, label, value, onToggle, colors }: ToggleItemProps) {
    return (
        <View style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
                <ThemedText style={styles.menuLabel}>{label}</ThemedText>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
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

// ─── Profile Screen ──────────────────────────────────
export function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [notifications, setNotifications] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(colorScheme === 'dark');

    // Mock profile data - replace with actual API data
    const profile = {
        pharmacyName: 'CosmicForge Pharmacy',
        email: 'pharmacy@cosmicforge.com',
        phone: '+234 805 773 5987',
        address: '123 Health Street, Lagos',
        registrationNumber: 'PCN-12345',
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

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
                <View style={[styles.profileCard, { backgroundColor: colors.background }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                        <ThemedText style={styles.avatarText}>
                            {profile.pharmacyName.charAt(0)}
                        </ThemedText>
                    </View>
                    <View style={styles.profileInfo}>
                        <ThemedText style={styles.pharmacyName}>{profile.pharmacyName}</ThemedText>
                        <ThemedText style={[styles.registrationNumber, { color: colors.placeholder }]}>
                            {profile.registrationNumber}
                        </ThemedText>
                    </View>
                    <TouchableOpacity style={[styles.editButton, { borderColor: colors.primary }]}>
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Pharmacy Information */}
                <View style={[styles.section, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Pharmacy Information" />
                    <MenuItem
                        icon="business-outline"
                        label="Pharmacy Name"
                        value={profile.pharmacyName}
                        showArrow={false}
                        colors={colors}
                    />
                    <MenuItem
                        icon="mail-outline"
                        label="Email"
                        value={profile.email}
                        showArrow={false}
                        colors={colors}
                    />
                    <MenuItem
                        icon="call-outline"
                        label="Phone"
                        value={profile.phone}
                        showArrow={false}
                        colors={colors}
                    />
                    <MenuItem
                        icon="location-outline"
                        label="Address"
                        value={profile.address}
                        showArrow={false}
                        colors={colors}
                    />
                </View>

                {/* Operating Hours */}
                <View style={[styles.section, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Operating Hours" />
                    <MenuItem
                        icon="time-outline"
                        label="Business Hours"
                        value="Mon-Sat: 8AM - 9PM"
                        onPress={() => {}}
                        colors={colors}
                    />
                </View>

                {/* Notifications */}
                <View style={[styles.section, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Notifications" />
                    <ToggleItem
                        icon="notifications-outline"
                        label="Push Notifications"
                        value={notifications}
                        onToggle={setNotifications}
                        colors={colors}
                    />
                    <MenuItem
                        icon="mail-outline"
                        label="Email Notifications"
                        onPress={() => {}}
                        colors={colors}
                    />
                </View>

                {/* Preferences */}
                <View style={[styles.section, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Preferences" />
                    <ToggleItem
                        icon="moon-outline"
                        label="Dark Mode"
                        value={darkMode}
                        onToggle={setDarkMode}
                        colors={colors}
                    />
                    <MenuItem
                        icon="language-outline"
                        label="Language"
                        value="English"
                        onPress={() => {}}
                        colors={colors}
                    />
                </View>

                {/* Account */}
                <View style={[styles.section, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Account" />
                    <MenuItem
                        icon="people-outline"
                        label="Staff Management"
                        onPress={() => {}}
                        colors={colors}
                    />
                    <MenuItem
                        icon="lock-closed-outline"
                        label="Change Password"
                        onPress={() => {}}
                        colors={colors}
                    />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        label="Privacy & Security"
                        onPress={() => {}}
                        colors={colors}
                    />
                </View>

                {/* Support */}
                <View style={[styles.section, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Support" />
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help Center"
                        onPress={() => {}}
                        colors={colors}
                    />
                    <MenuItem
                        icon="chatbox-outline"
                        label="Contact Support"
                        onPress={() => {}}
                        colors={colors}
                    />
                    <MenuItem
                        icon="document-text-outline"
                        label="Terms of Service"
                        onPress={() => {}}
                        colors={colors}
                    />
                    <MenuItem
                        icon="shield-outline"
                        label="Privacy Policy"
                        onPress={() => {}}
                        colors={colors}
                    />
                </View>

                {/* Logout */}
                <View style={[styles.section, { backgroundColor: colors.background }]}>
                    <MenuItem
                        icon="log-out-outline"
                        label="Logout"
                        showArrow={false}
                        onPress={handleLogout}
                        colors={colors}
                        danger
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

// ─── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
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
    },
    sectionHeader: {
        fontSize: 13,
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
