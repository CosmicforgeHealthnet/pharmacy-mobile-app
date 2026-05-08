import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
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
        Linking.openURL('tel:+2347031455395');
    };

    const handleOpenWhatsApp = () => {
        Linking.openURL('https://wa.link/6ser4t');
    };

    const handleOpenInstagram = () => {
        Linking.openURL('https://www.instagram.com/cf_healthnet');
    };

    const handleOpenTikTok = () => {
        Linking.openURL('https://www.tiktok.com/@cf_healthnet1');
    };

    const handleOpenTwitter = () => {
        Linking.openURL('https://x.com/cf_healthnet');
    };

    const handleOpenLinkedIn = () => {
        Linking.openURL('https://www.linkedin.com/company/cosmicforge-healthnet-limited/');
    };

    const handleOpenFacebook = () => {
        Linking.openURL('https://facebook.com/profile.php?id=61565802410939');
    };

    const handleOpenFAQ = () => {
        Linking.openURL('https://help.cosmicforge.com/pharmacy');
    };

    const handleOpenTerms = () => {
        Linking.openURL('https://www.cosmicforge-healthnet.com/terms');
    };

    const handleOpenPrivacy = () => {
        Linking.openURL('https://www.cosmicforge-healthnet.com/privacy-policy');
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
                        description="+234 703 145 5395"
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

                {/* Social Media Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Follow Us</ThemedText>
                    <ThemedText style={[styles.sectionDescription, { color: colors.placeholder }]}>
                        Connect with us on social media.
                    </ThemedText>

                    <View style={styles.socialGrid}>
                        <TouchableOpacity
                            style={[styles.socialItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleOpenInstagram}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: '#FDF2F4' }]}>
                                <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                            </View>
                            <ThemedText style={styles.socialLabel}>Instagram</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleOpenTikTok}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="logo-tiktok" size={20} color="#000000" />
                            </View>
                            <ThemedText style={styles.socialLabel}>TikTok</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleOpenTwitter}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="logo-twitter" size={20} color="#000000" />
                            </View>
                            <ThemedText style={styles.socialLabel}>X (Twitter)</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleOpenLinkedIn}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: '#EFF6FF' }]}>
                                <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
                            </View>
                            <ThemedText style={styles.socialLabel}>LinkedIn</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleOpenFacebook}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: '#EFF6FF' }]}>
                                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                            </View>
                            <ThemedText style={styles.socialLabel}>Facebook</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleOpenWhatsApp}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: '#ECFDF5' }]}>
                                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                            </View>
                            <ThemedText style={styles.socialLabel}>WhatsApp</ThemedText>
                        </TouchableOpacity>
                    </View>
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
                    <Image
                        source={require('../../../../assets/images/cosmic-log.png')}
                        style={styles.appLogo}
                        resizeMode="contain"
                    />
                    <ThemedText style={styles.appName}>CosmicForge Pharmacy</ThemedText>
                    <ThemedText style={[styles.appVersion, { color: colors.placeholder }]}>
                        Version 1.0.0
                    </ThemedText>
                    <ThemedText style={[styles.copyright, { color: colors.placeholder }]}>
                        © 2026 CosmicForge HealthNet. All rights reserved.
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
    socialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    socialItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    socialIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    appLogo: {
        width: 80,
        height: 80,
        marginBottom: 12,
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
