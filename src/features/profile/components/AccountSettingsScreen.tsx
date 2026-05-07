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
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProfile, useUpdateAccount, useChangePassword } from '@/features/authentication/hooks/useAuth';

export function AccountSettingsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { data: profileData, isLoading: loadingProfile } = useProfile();
    const updateAccount = useUpdateAccount();
    const changePassword = useChangePassword();

    const profile = profileData?.pharmacy;

    // Account form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditingAccount, setIsEditingAccount] = useState(false);

    // Password modal state
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.primaryContactPerson || '');
            setEmail(profile.email || '');
        }
    }, [profile]);

    const handleSaveAccount = async () => {
        try {
            await updateAccount.mutateAsync({ fullName, email });
            Alert.alert('Success', 'Account updated successfully');
            setIsEditingAccount(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update account. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setFullName(profile?.primaryContactPerson || '');
        setEmail(profile?.email || '');
        setIsEditingAccount(false);
    };

    const resetPasswordForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        try {
            await changePassword.mutateAsync({ currentPassword, newPassword });
            Alert.alert('Success', 'Password changed successfully');
            setIsPasswordModalVisible(false);
            resetPasswordForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to change password. Please check your current password and try again.');
        }
    };

    if (loadingProfile && !profile) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Account Settings</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Information Section */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
                        {!isEditingAccount && (
                            <TouchableOpacity
                                onPress={() => setIsEditingAccount(true)}
                                style={[styles.editButton, { backgroundColor: `${colors.primary}15` }]}
                            >
                                <Ionicons name="pencil" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.field}>
                        <ThemedText style={[styles.label, { color: colors.placeholder }]}>Contact Person</ThemedText>
                        {isEditingAccount ? (
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter name"
                                placeholderTextColor={colors.placeholder}
                            />
                        ) : (
                            <ThemedText style={styles.value}>{fullName || 'Not set'}</ThemedText>
                        )}
                    </View>

                    <View style={styles.field}>
                        <ThemedText style={[styles.label, { color: colors.placeholder }]}>Email Address</ThemedText>
                        {isEditingAccount ? (
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter email"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        ) : (
                            <ThemedText style={styles.value}>{email || 'Not set'}</ThemedText>
                        )}
                    </View>

                    {isEditingAccount && (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.primary }]}
                                onPress={handleSaveAccount}
                                disabled={updateAccount.isPending}
                            >
                                {updateAccount.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.outlineButton, { borderColor: colors.border }]}
                                onPress={handleCancelEdit}
                                disabled={updateAccount.isPending}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Security Section */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <ThemedText style={styles.sectionTitle}>Security</ThemedText>

                    <View style={styles.field}>
                        <ThemedText style={[styles.label, { color: colors.placeholder }]}>Password</ThemedText>
                        <ThemedText style={styles.value}>••••••••</ThemedText>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={() => setIsPasswordModalVisible(true)}
                    >
                        <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" />
                        <ThemedText style={styles.buttonText}>Change Password</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Verification Status */}
                <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <ThemedText style={styles.sectionTitle}>Verification</ThemedText>
                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusBadge,
                                profile?.verificationStatus === 'approved'
                                    ? { backgroundColor: '#ECFDF5' }
                                    : profile?.verificationStatus === 'pending'
                                    ? { backgroundColor: '#FEF3C7' }
                                    : { backgroundColor: '#FEF2F2' },
                            ]}
                        >
                            <Ionicons
                                name={
                                    profile?.verificationStatus === 'approved'
                                        ? 'checkmark-circle'
                                        : profile?.verificationStatus === 'pending'
                                        ? 'time'
                                        : 'alert-circle'
                                }
                                size={16}
                                color={
                                    profile?.verificationStatus === 'approved'
                                        ? '#059669'
                                        : profile?.verificationStatus === 'pending'
                                        ? '#D97706'
                                        : '#DC2626'
                                }
                            />
                            <ThemedText
                                style={[
                                    styles.statusText,
                                    {
                                        color:
                                            profile?.verificationStatus === 'approved'
                                                ? '#059669'
                                                : profile?.verificationStatus === 'pending'
                                                ? '#D97706'
                                                : '#DC2626',
                                    },
                                ]}
                            >
                                {profile?.verificationStatus?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
                                    'Pending'}
                            </ThemedText>
                        </View>
                        {profile?.registrationNumber && (
                            <ThemedText style={[styles.regNumber, { color: colors.placeholder }]}>
                                Reg: {profile.registrationNumber}
                            </ThemedText>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Password Change Modal */}
            <Modal
                visible={isPasswordModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => {
                    setIsPasswordModalVisible(false);
                    resetPasswordForm();
                }}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Change Password</ThemedText>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsPasswordModalVisible(false);
                                    resetPasswordForm();
                                }}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={[styles.modalDescription, { color: colors.placeholder }]}>
                            Enter your current password and a new password to update your credentials.
                        </ThemedText>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Current Password</ThemedText>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.passwordInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor={colors.placeholder}
                                    secureTextEntry={!showCurrentPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    <Ionicons
                                        name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.placeholder}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>New Password</ThemedText>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.passwordInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor={colors.placeholder}
                                    secureTextEntry={!showNewPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Ionicons
                                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.placeholder}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Confirm New Password</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.placeholder}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.outlineButton, { borderColor: colors.border, flex: 1 }]}
                                onPress={() => {
                                    setIsPasswordModalVisible(false);
                                    resetPasswordForm();
                                }}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]}
                                onPress={handleChangePassword}
                                disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
                            >
                                {changePassword.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>Change Password</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    editButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 16,
    },
    input: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    regNumber: {
        fontSize: 13,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    modalDescription: {
        fontSize: 14,
        marginBottom: 20,
    },
    modalField: {
        marginBottom: 16,
    },
    passwordInputContainer: {
        position: 'relative',
    },
    passwordInput: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        paddingRight: 44,
        fontSize: 16,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -10,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
});
