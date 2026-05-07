import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useStaff, useAddStaff, useRemoveStaff } from '@/features/authentication/hooks/useAuth';
import type { StaffMember, AddStaffRequest } from '@/features/authentication/types';

const ROLE_OPTIONS = [
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'technician', label: 'Technician' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'admin', label: 'Admin' },
];

export function StaffManagementScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { data: staff = [], isLoading, refetch, isRefetching } = useStaff();
    const addStaff = useAddStaff();
    const removeStaff = useRemoveStaff();

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

    // Add staff form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('pharmacist');
    const [showPassword, setShowPassword] = useState(false);

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('pharmacist');
        setShowPassword(false);
    };

    const handleAddStaff = async () => {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        try {
            await addStaff.mutateAsync({
                fullName: fullName.trim(),
                email: email.trim(),
                password,
                role,
                isActive: true,
            });
            Alert.alert('Success', 'Staff member added successfully');
            setIsAddModalVisible(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to add staff member. Please try again.');
        }
    };

    const handleConfirmDelete = async () => {
        if (!staffToDelete) return;

        try {
            await removeStaff.mutateAsync(staffToDelete);
            Alert.alert('Success', 'Staff member removed successfully');
            setStaffToDelete(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to remove staff member. Please try again.');
            setStaffToDelete(null);
        }
    };

    const renderStaffItem = ({ item }: { item: StaffMember }) => (
        <View style={[styles.staffCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.staffAvatar, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.staffInitial}>
                    {item.fullName?.charAt(0)?.toUpperCase() || 'S'}
                </ThemedText>
            </View>
            <View style={styles.staffInfo}>
                <ThemedText style={styles.staffName}>{item.fullName}</ThemedText>
                <ThemedText style={[styles.staffEmail, { color: colors.placeholder }]}>{item.email}</ThemedText>
                <View style={styles.staffMeta}>
                    <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}15` }]}>
                        <ThemedText style={[styles.roleText, { color: colors.primary }]}>
                            {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                        </ThemedText>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            item.status === 'active'
                                ? { backgroundColor: '#ECFDF5' }
                                : { backgroundColor: '#F3F4F6' },
                        ]}
                    >
                        <ThemedText
                            style={[
                                styles.statusText,
                                { color: item.status === 'active' ? '#059669' : '#6B7280' },
                            ]}
                        >
                            {item.status}
                        </ThemedText>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setStaffToDelete(item.id)}
                disabled={removeStaff.isPending && staffToDelete === item.id}
            >
                {removeStaff.isPending && staffToDelete === item.id ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                    <Ionicons name="trash-outline" size={20} color="#DC2626" />
                )}
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.placeholder} />
            <ThemedText style={styles.emptyTitle}>No staff members yet</ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                Add your first staff member to get started.
            </ThemedText>
            <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => setIsAddModalVisible(true)}
            >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <ThemedText style={styles.emptyButtonText}>Add Staff</ThemedText>
            </TouchableOpacity>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Staff Management</ThemedText>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => setIsAddModalVisible(true)}
                >
                    <Ionicons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Staff List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={[styles.loadingText, { color: colors.placeholder }]}>
                        Loading staff members...
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={staff}
                    renderItem={renderStaffItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={() => refetch()}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}

            {/* Add Staff Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => {
                    setIsAddModalVisible(false);
                    resetForm();
                }}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Add Staff Member</ThemedText>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsAddModalVisible(false);
                                    resetForm();
                                }}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Full Name</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter full name"
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Email</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter email address"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Password</ThemedText>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.passwordInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter password (min 8 characters)"
                                    placeholderTextColor={colors.placeholder}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.placeholder}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Role</ThemedText>
                            <View style={styles.roleOptions}>
                                {ROLE_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.roleOption,
                                            {
                                                backgroundColor:
                                                    role === option.value
                                                        ? colors.primary
                                                        : colors.inputBackground,
                                                borderColor:
                                                    role === option.value
                                                        ? colors.primary
                                                        : colors.border,
                                            },
                                        ]}
                                        onPress={() => setRole(option.value)}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.roleOptionText,
                                                { color: role === option.value ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {option.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.outlineButton, { borderColor: colors.border, flex: 1 }]}
                                onPress={() => {
                                    setIsAddModalVisible(false);
                                    resetForm();
                                }}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]}
                                onPress={handleAddStaff}
                                disabled={addStaff.isPending}
                            >
                                {addStaff.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>Add Staff</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={!!staffToDelete}
                animationType="fade"
                transparent
                onRequestClose={() => setStaffToDelete(null)}
            >
                <View style={styles.confirmModalContainer}>
                    <View style={[styles.confirmModalContent, { backgroundColor: colors.background }]}>
                        <Ionicons name="warning-outline" size={48} color="#DC2626" />
                        <ThemedText style={styles.confirmTitle}>Remove Staff Member</ThemedText>
                        <ThemedText style={[styles.confirmDescription, { color: colors.placeholder }]}>
                            Are you sure you want to remove this staff member? This action cannot be undone.
                        </ThemedText>
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.outlineButton, { borderColor: colors.border, flex: 1 }]}
                                onPress={() => setStaffToDelete(null)}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#DC2626', flex: 1 }]}
                                onPress={handleConfirmDelete}
                                disabled={removeStaff.isPending}
                            >
                                {removeStaff.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>Remove</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    staffCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    staffAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    staffInitial: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    staffInfo: {
        flex: 1,
        marginLeft: 12,
    },
    staffName: {
        fontSize: 16,
        fontWeight: '600',
    },
    staffEmail: {
        fontSize: 13,
        marginTop: 2,
    },
    staffMeta: {
        flexDirection: 'row',
        marginTop: 6,
        gap: 8,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    deleteButton: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
        gap: 8,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
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
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    modalField: {
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
    roleOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roleOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    roleOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalButtons: {
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
    // Confirm modal styles
    confirmModalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    confirmModalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    confirmDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
});
