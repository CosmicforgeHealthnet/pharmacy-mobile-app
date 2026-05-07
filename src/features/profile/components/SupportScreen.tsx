import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface SupportItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    onPress: () => void;
    colors: typeof Colors.light;
    iconBgColor?: string;
    iconColor?: string;
}

function SupportItem({ icon, title, description, onPress, colors, iconBgColor, iconColor }: SupportItemProps) {
    return (
        <TouchableOpacity
            style={[styles.supportItem, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.supportIcon, { backgroundColor: iconBgColor || `${colors.primary}15` }]}>
                <Ionicons name={icon} size={24} color={iconColor || colors.primary} />
            </View>
            <View style={styles.supportInfo}>
                <ThemedText style={styles.supportTitle}>{title}</ThemedText>
                <ThemedText style={[styles.supportDescription, { color: colors.placeholder }]}>
                    {description}
                </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
        </TouchableOpacity>
    );
}

export function SupportScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const handleOpenEmail = () => {
        Linking.openURL('mailto:support@cosmicforge.com?subject=Pharmacy%20Support%20Request');
    };

    const handleOpenPhone = () => {
        Linking.openURL('tel:+2341234567890');
    };

    const handleOpenWhatsApp = () => {
        Linking.openURL('https://wa.me/2341234567890?text=Hello%2C%20I%20need%20support%20with%20my%20pharmacy%20app');
    };

    const handleOpenFAQ = () => {
        Linking.openURL('https://help.cosmicforge.com/pharmacy');
    };

    const handleOpenTerms = () => {
        Linking.openURL('https://cosmicforge.com/terms');
    };

    const handleOpenPrivacy = () => {
        Linking.openURL('https://cosmicforge.com/privacy');
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Support & Help</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Contact Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
                    <ThemedText style={[styles.sectionDescription, { color: colors.placeholder }]}>
                        Get in touch with our support team for assistance.
                    </ThemedText>

                    <SupportItem
                        icon="mail-outline"
                        title="Email Support"
                        description="Send us an email for detailed inquiries"
                        onPress={handleOpenEmail}
                        colors={colors}
                        iconBgColor="#EFF6FF"
                        iconColor="#2563EB"
                    />

                    <SupportItem
                        icon="call-outline"
                        title="Phone Support"
                        description="Call us for immediate assistance"
                        onPress={handleOpenPhone}
                        colors={colors}
                        iconBgColor="#ECFDF5"
                        iconColor="#059669"
                    />

                    <SupportItem
                        icon="logo-whatsapp"
                        title="WhatsApp"
                        description="Chat with us on WhatsApp"
                        onPress={handleOpenWhatsApp}
                        colors={colors}
                        iconBgColor="#DCFCE7"
                        iconColor="#16A34A"
                    />
                </View>

                {/* Resources Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Resources</ThemedText>
                    <ThemedText style={[styles.sectionDescription, { color: colors.placeholder }]}>
                        Browse guides and documentation.
                    </ThemedText>

                    <SupportItem
                        icon="help-circle-outline"
                        title="FAQ & Help Center"
                        description="Find answers to common questions"
                        onPress={handleOpenFAQ}
                        colors={colors}
                        iconBgColor="#F3E8FF"
                        iconColor="#9333EA"
                    />

                    <SupportItem
                        icon="book-outline"
                        title="User Guide"
                        description="Learn how to use the pharmacy dashboard"
                        onPress={handleOpenFAQ}
                        colors={colors}
                        iconBgColor="#FEF3C7"
                        iconColor="#D97706"
                    />
                </View>

                {/* Legal Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Legal</ThemedText>

                    <SupportItem
                        icon="document-text-outline"
                        title="Terms of Service"
                        description="Read our terms and conditions"
                        onPress={handleOpenTerms}
                        colors={colors}
                    />

                    <SupportItem
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        description="Learn how we protect your data"
                        onPress={handleOpenPrivacy}
                        colors={colors}
                    />
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <View style={[styles.appIcon, { backgroundColor: colors.primary }]}>
                        <Ionicons name="medical" size={32} color="#FFFFFF" />
                    </View>
                    <ThemedText style={styles.appName}>CosmicForge Pharmacy</ThemedText>
                    <ThemedText style={[styles.appVersion, { color: colors.placeholder }]}>
                        Version 1.0.0
                    </ThemedText>
                    <ThemedText style={[styles.copyright, { color: colors.placeholder }]}>
                        © 2026 CosmicForge. All rights reserved.
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
    section: {
        marginHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 13,
        marginBottom: 12,
    },
    supportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    supportIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportInfo: {
        flex: 1,
        marginLeft: 12,
    },
    supportTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    supportDescription: {
        fontSize: 13,
        marginTop: 2,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    appIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    appName: {
        fontSize: 18,
        fontWeight: '600',
    },
    appVersion: {
        fontSize: 14,
        marginTop: 4,
    },
    copyright: {
        fontSize: 12,
        marginTop: 8,
    },
});
