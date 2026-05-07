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
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfile, useUpdateProfile, useUploadProfileLogo } from '@/features/authentication/hooks/useAuth';

interface InfoRowProps {
    label: string;
    value?: string;
    colors: typeof Colors.light;
}

function InfoRow({ label, value, colors }: InfoRowProps) {
    return (
        <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.placeholder }]}>{label}</ThemedText>
            <ThemedText style={styles.infoValue}>{value || 'Not set'}</ThemedText>
        </View>
    );
}

export function PharmacyInfoScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { data: profileData, isLoading: loadingProfile } = useProfile();
    const updateProfile = useUpdateProfile();
    const uploadLogo = useUploadProfileLogo();

    const profile = profileData?.pharmacy;

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [pharmacyName, setPharmacyName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [serviceRadius, setServiceRadius] = useState('');
    const [logoUri, setLogoUri] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            resetForm();
        }
    }, [profile]);

    const resetForm = () => {
        setPharmacyName(profile?.pharmacyName || '');
        setAddress(profile?.address || '');
        setPhone(profile?.phone || '');
        setDescription(profile?.description || '');
        setWebsite(profile?.website || '');
        setServiceRadius(profile?.serviceRadius?.toString() || '');
        setLogoUri(profile?.logoUrl || null);
    };

    const handleStartEditing = () => {
        resetForm();
        setIsEditing(true);
    };

    const handleCancel = () => {
        resetForm();
        setIsEditing(false);
    };

    const handlePickImage = async () => {
        if (!isEditing) return;

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Please allow access to your photo library to upload a logo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setLogoUri(asset.uri);

            // Upload the image
            try {
                const filename = asset.uri.split('/').pop() || 'logo.jpg';
                const mimeType = asset.mimeType || 'image/jpeg';
                await uploadLogo.mutateAsync({ uri: asset.uri, filename, mimeType });
                Alert.alert('Success', 'Logo updated successfully');
            } catch (error) {
                Alert.alert('Error', 'Failed to upload logo. Please try again.');
            }
        }
    };

    const handleUpdate = async () => {
        try {
            await updateProfile.mutateAsync({
                pharmacyName,
                address,
                phone,
                description,
                website,
                serviceRadius: serviceRadius ? parseInt(serviceRadius, 10) : undefined,
            });
            Alert.alert('Success', 'Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
    };

    if (loadingProfile && !profile) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
        );
    }

    const isSaving = updateProfile.isPending || uploadLogo.isPending;

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Pharmacy Information</ThemedText>
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
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <TouchableOpacity
                            style={[styles.logoContainer, { backgroundColor: colors.primary }]}
                            onPress={handlePickImage}
                            disabled={!isEditing || uploadLogo.isPending}
                        >
                            {uploadLogo.isPending ? (
                                <ActivityIndicator size="large" color="#FFFFFF" />
                            ) : logoUri ? (
                                <Image source={{ uri: logoUri }} style={styles.logoImage} />
                            ) : (
                                <ThemedText style={styles.logoText}>
                                    {profile?.pharmacyName?.charAt(0) || 'P'}
                                </ThemedText>
                            )}
                            {isEditing && (
                                <View style={[styles.cameraIcon, { backgroundColor: colors.background }]}>
                                    <Ionicons name="camera" size={16} color={colors.primary} />
                                </View>
                            )}
                        </TouchableOpacity>
                        {isEditing && (
                            <ThemedText style={[styles.logoHint, { color: colors.placeholder }]}>
                                Tap to change logo
                            </ThemedText>
                        )}
                    </View>

                    {/* Content */}
                    <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        {isEditing ? (
                            <>
                                {/* Edit Mode */}
                                <View style={styles.field}>
                                    <ThemedText style={[styles.label, { color: colors.placeholder }]}>Pharmacy Name</ThemedText>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                        value={pharmacyName}
                                        onChangeText={setPharmacyName}
                                        placeholder="Enter pharmacy name"
                                        placeholderTextColor={colors.placeholder}
                                    />
                                </View>

                                <View style={styles.field}>
                                    <ThemedText style={[styles.label, { color: colors.placeholder }]}>Address</ThemedText>
                                    <TextInput
                                        style={[styles.input, styles.multilineInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                        value={address}
                                        onChangeText={setAddress}
                                        placeholder="Enter full address"
                                        placeholderTextColor={colors.placeholder}
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <View style={styles.field}>
                                    <ThemedText style={[styles.label, { color: colors.placeholder }]}>Phone</ThemedText>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder="Enter phone number"
                                        placeholderTextColor={colors.placeholder}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.field}>
                                    <ThemedText style={[styles.label, { color: colors.placeholder }]}>Website</ThemedText>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                        value={website}
                                        onChangeText={setWebsite}
                                        placeholder="https://example.com"
                                        placeholderTextColor={colors.placeholder}
                                        keyboardType="url"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.field}>
                                    <ThemedText style={[styles.label, { color: colors.placeholder }]}>Service Radius (km)</ThemedText>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                        value={serviceRadius}
                                        onChangeText={setServiceRadius}
                                        placeholder="e.g. 10"
                                        placeholderTextColor={colors.placeholder}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.field}>
                                    <ThemedText style={[styles.label, { color: colors.placeholder }]}>Description</ThemedText>
                                    <TextInput
                                        style={[styles.input, styles.multilineInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholder="Tell customers about your pharmacy..."
                                        placeholderTextColor={colors.placeholder}
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                                        onPress={handleCancel}
                                        disabled={isSaving}
                                    >
                                        <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.updateButton, { backgroundColor: colors.primary }]}
                                        onPress={handleUpdate}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Update</ThemedText>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                {/* View Mode */}
                                <InfoRow label="Pharmacy Name" value={profile?.pharmacyName} colors={colors} />
                                <InfoRow label="Email" value={profile?.email} colors={colors} />
                                <InfoRow label="Phone" value={profile?.phone} colors={colors} />
                                <InfoRow label="Address" value={profile?.address} colors={colors} />
                                <InfoRow label="Website" value={profile?.website} colors={colors} />
                                <InfoRow label="Service Radius" value={profile?.serviceRadius ? `${profile.serviceRadius} km` : undefined} colors={colors} />
                                <InfoRow label="Description" value={profile?.description} colors={colors} />
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingBottom: 40,
    },
    logoSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '700',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    logoHint: {
        marginTop: 8,
        fontSize: 13,
    },
    section: {
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    // View mode styles
    infoRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 16,
    },
    // Edit mode styles
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
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
    updateButton: {},
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
