import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    useBankAccounts,
    useAddBankAccount,
    useSetDefaultBankAccount,
    useDeleteBankAccount,
} from '../hooks/useWallet';
import type { BankAccount, AddBankAccountPayload } from '../types';

// Nigerian Banks List
const NIGERIAN_BANKS = [
    { code: '044', name: 'Access Bank' },
    { code: '023', name: 'Citibank Nigeria' },
    { code: '063', name: 'Diamond Bank' },
    { code: '050', name: 'Ecobank Nigeria' },
    { code: '084', name: 'Enterprise Bank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '526', name: 'Parallex Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '100', name: 'Suntrust Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '033', name: 'United Bank For Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
];

interface BankAccountItemProps {
    account: BankAccount;
    colors: typeof Colors.light;
    onSetDefault: () => void;
    onDelete: () => void;
    isSettingDefault: boolean;
    isDeleting: boolean;
}

function BankAccountItem({
    account,
    colors,
    onSetDefault,
    onDelete,
    isSettingDefault,
    isDeleting,
}: BankAccountItemProps) {
    const maskedNumber = `****${account.accountNumber.slice(-4)}`;

    return (
        <View style={[styles.accountItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.accountInfo}>
                <View style={[styles.bankIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="business-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.accountDetails}>
                    <View style={styles.accountNameRow}>
                        <ThemedText style={styles.bankName}>{account.bankName}</ThemedText>
                        {account.isDefault && (
                            <View style={[styles.defaultBadge, { backgroundColor: '#10B98115' }]}>
                                <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                            </View>
                        )}
                    </View>
                    <ThemedText style={[styles.accountNumber, { color: colors.placeholder }]}>
                        {maskedNumber} • {account.accountName}
                    </ThemedText>
                </View>
            </View>
            <View style={styles.accountActions}>
                {!account.isDefault && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
                        onPress={onSetDefault}
                        disabled={isSettingDefault}
                    >
                        {isSettingDefault ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons name="star-outline" size={18} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#EF444410' }]}
                    onPress={onDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

export function BankAccountsSection() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isBankPickerVisible, setIsBankPickerVisible] = useState(false);
    const [selectedBank, setSelectedBank] = useState<{ code: string; name: string } | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: bankAccountsData, isLoading } = useBankAccounts();
    const { mutateAsync: addBankAccount, isPending: isAdding } = useAddBankAccount();
    const { mutateAsync: setDefaultBankAccount } = useSetDefaultBankAccount();
    const { mutateAsync: deleteBankAccount } = useDeleteBankAccount();

    const bankAccounts: BankAccount[] = bankAccountsData?.bankAccounts || bankAccountsData || [];

    const resetForm = () => {
        setSelectedBank(null);
        setAccountNumber('');
        setAccountName('');
    };

    const handleAddAccount = async () => {
        if (!selectedBank || !accountNumber || !accountName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (accountNumber.length !== 10) {
            Alert.alert('Error', 'Account number must be 10 digits');
            return;
        }

        try {
            const payload: AddBankAccountPayload = {
                bankName: selectedBank.name,
                bankCode: selectedBank.code,
                accountNumber: accountNumber.trim(),
                accountName: accountName.trim(),
            };
            await addBankAccount(payload);
            setIsAddModalVisible(false);
            resetForm();
            Alert.alert('Success', 'Bank account added successfully');
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to add bank account');
        }
    };

    const handleSetDefault = async (accountId: string) => {
        setSettingDefaultId(accountId);
        try {
            await setDefaultBankAccount(accountId);
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to set default account');
        } finally {
            setSettingDefaultId(null);
        }
    };

    const handleDelete = (account: BankAccount) => {
        if (account.isDefault && bankAccounts.length > 1) {
            Alert.alert(
                'Cannot Delete',
                'You cannot delete the default account. Please set another account as default first.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Delete Bank Account',
            `Are you sure you want to delete ${account.bankName} (****${account.accountNumber.slice(-4)})?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingId(account.id);
                        try {
                            await deleteBankAccount(account.id);
                        } catch (error: any) {
                            Alert.alert('Error', error?.message || 'Failed to delete bank account');
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    return (
        <View style={styles.section}>
            {/* Header */}
            <View style={[styles.sectionHeader, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="card-outline" size={20} color={colors.primary} />
                    <ThemedText style={styles.sectionTitle}>Bank Accounts</ThemedText>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => setIsAddModalVisible(true)}
                >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <ThemedText style={styles.addButtonText}>Add</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Bank Accounts List */}
            <View style={[styles.listContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {bankAccounts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="card-outline" size={48} color={colors.placeholder} />
                        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                            No Bank Accounts
                        </ThemedText>
                        <ThemedText style={[styles.emptyDesc, { color: colors.placeholder }]}>
                            Add a bank account to receive payouts
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
                            onPress={() => setIsAddModalVisible(true)}
                        >
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <ThemedText style={styles.emptyAddButtonText}>Add Bank Account</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    bankAccounts.map((account, index) => (
                        <React.Fragment key={account.id}>
                            <BankAccountItem
                                account={account}
                                colors={colors}
                                onSetDefault={() => handleSetDefault(account.id)}
                                onDelete={() => handleDelete(account)}
                                isSettingDefault={settingDefaultId === account.id}
                                isDeleting={deletingId === account.id}
                            />
                            {index < bankAccounts.length - 1 && (
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            )}
                        </React.Fragment>
                    ))
                )}
            </View>

            {/* Add Bank Account Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setIsAddModalVisible(false);
                    resetForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <ThemedText style={styles.modalTitle}>Add Bank Account</ThemedText>
                            <TouchableOpacity onPress={() => {
                                setIsAddModalVisible(false);
                                resetForm();
                            }}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {/* Bank Selection */}
                            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                                Select Bank
                            </ThemedText>
                            <TouchableOpacity
                                style={[
                                    styles.selectInput,
                                    { backgroundColor: colors.inputBackground, borderColor: colors.border }
                                ]}
                                onPress={() => setIsBankPickerVisible(true)}
                            >
                                <ThemedText style={[
                                    styles.selectInputText,
                                    { color: selectedBank ? colors.text : colors.placeholder }
                                ]}>
                                    {selectedBank?.name || 'Select a bank'}
                                </ThemedText>
                                <Ionicons name="chevron-down" size={20} color={colors.placeholder} />
                            </TouchableOpacity>

                            {/* Account Number */}
                            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                                Account Number
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }
                                ]}
                                value={accountNumber}
                                onChangeText={(text) => setAccountNumber(text.replace(/\D/g, '').slice(0, 10))}
                                placeholder="Enter 10-digit account number"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="number-pad"
                                maxLength={10}
                            />

                            {/* Account Name */}
                            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                                Account Name
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }
                                ]}
                                value={accountName}
                                onChangeText={setAccountName}
                                placeholder="Enter account holder name"
                                placeholderTextColor={colors.placeholder}
                                autoCapitalize="words"
                            />

                            <ThemedText style={[styles.inputHint, { color: colors.placeholder }]}>
                                Your first bank account will be set as the default for payouts.
                            </ThemedText>
                        </ScrollView>

                        <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: colors.border }]}
                                onPress={() => {
                                    setIsAddModalVisible(false);
                                    resetForm();
                                }}
                            >
                                <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>
                                    Cancel
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    {
                                        backgroundColor: selectedBank && accountNumber.length === 10 && accountName
                                            ? colors.primary
                                            : colors.inputBackground,
                                    },
                                ]}
                                onPress={handleAddAccount}
                                disabled={!selectedBank || accountNumber.length !== 10 || !accountName || isAdding}
                            >
                                {isAdding ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <ThemedText style={styles.submitButtonText}>Add Account</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </View>
            </Modal>

            {/* Bank Picker Modal */}
            <Modal
                visible={isBankPickerVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsBankPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <ThemedView style={[styles.modalContent, { maxHeight: '70%' }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <ThemedText style={styles.modalTitle}>Select Bank</ThemedText>
                            <TouchableOpacity onPress={() => setIsBankPickerVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.bankList} showsVerticalScrollIndicator={false}>
                            {NIGERIAN_BANKS.map((bank) => (
                                <TouchableOpacity
                                    key={bank.code}
                                    style={[
                                        styles.bankOption,
                                        { borderBottomColor: colors.border },
                                        selectedBank?.code === bank.code && { backgroundColor: colors.primary + '10' }
                                    ]}
                                    onPress={() => {
                                        setSelectedBank(bank);
                                        setIsBankPickerVisible(false);
                                    }}
                                >
                                    <View style={[styles.bankIconSmall, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="business-outline" size={16} color={colors.primary} />
                                    </View>
                                    <ThemedText style={styles.bankOptionText}>{bank.name}</ThemedText>
                                    {selectedBank?.code === bank.code && (
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </ThemedView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    listContainer: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    bankIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    accountDetails: {
        flex: 1,
    },
    accountNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    bankName: {
        fontSize: 15,
        fontWeight: '600',
    },
    defaultBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    defaultBadgeText: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: '600',
    },
    accountNumber: {
        fontSize: 13,
    },
    accountActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    emptyAddButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    selectInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    selectInputText: {
        fontSize: 16,
    },
    inputHint: {
        fontSize: 12,
        marginTop: 4,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 36,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    bankList: {
        paddingVertical: 8,
    },
    bankOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        gap: 12,
    },
    bankIconSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bankOptionText: {
        flex: 1,
        fontSize: 15,
    },
});
