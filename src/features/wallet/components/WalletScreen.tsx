import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import type {
    OverviewStats,
    OverviewPeriod,
} from '../types';
import { OverviewSection } from './OverviewSection';
import { EarningsSection } from './EarningsSection';
import { PayoutsSection } from './PayoutsSection';
import { DisputesSection } from './DisputesSection';
import { TransactionsSection } from './TransactionsSection';
import { BankAccountsSection } from './BankAccountsSection';
import {
    useWalletSummary,
    useWalletPayouts,
    useWalletDisputes,
    useRequestPayout,
    useBankAccounts,
} from '../hooks/useWallet';
import type { BankAccount } from '../types';

type WalletTab = 'overview' | 'earnings' | 'payouts' | 'bank_accounts' | 'disputes' | 'transactions';

interface TabItem {
    key: WalletTab;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
    { key: 'overview', label: 'Overview', icon: 'grid-outline' },
    { key: 'earnings', label: 'Earnings', icon: 'trending-up-outline' },
    { key: 'payouts', label: 'Payouts', icon: 'arrow-up-circle-outline' },
    { key: 'bank_accounts', label: 'Bank Accounts', icon: 'card-outline' },
    { key: 'disputes', label: 'Disputes', icon: 'alert-circle-outline' },
    { key: 'transactions', label: 'History', icon: 'list-outline' },
];

export function WalletScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [activeTab, setActiveTab] = useState<WalletTab>('overview');
    const [selectedPeriod, setSelectedPeriod] = useState<OverviewPeriod>('month');
    const [refreshing, setRefreshing] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);
    const [isBankSelectVisible, setIsBankSelectVisible] = useState(false);

    const { data: walletSummary, refetch: refetchSummary, isLoading: isLoadingSummary } = useWalletSummary();
    const { data: payoutsData, refetch: refetchPayouts, isLoading: isLoadingPayouts } = useWalletPayouts();
    const { data: disputesData, refetch: refetchDisputes, isLoading: isLoadingDisputes } = useWalletDisputes();
    const { data: bankAccountsData, refetch: refetchBankAccounts, isLoading: isLoadingBankAccounts } = useBankAccounts();

    const isLoading = isLoadingSummary || isLoadingPayouts || isLoadingDisputes || isLoadingBankAccounts;

    const bankAccounts: BankAccount[] = bankAccountsData?.bankAccounts || bankAccountsData || [];
    const defaultBankAccount = bankAccounts.find(acc => acc.isDefault);
    const selectedBankAccount = bankAccounts.find(acc => acc.id === selectedBankAccountId) || defaultBankAccount;

    // Use correct API field names: pendingClearance instead of escrowBalance
    const walletBalance = walletSummary?.availableBalance || 0;
    const pendingBalance = walletSummary?.pendingClearance || 0;

    // Overview Stats
    const overviewStats: OverviewStats = {
        totalEarnings: walletSummary?.totalEarnings || 0,
        totalPayouts: payoutsData?.total || 0,
        pendingPayouts: walletSummary?.pendingClearance || 0,
        totalTransactions: 0,
        activeDisputes: disputesData?.total || 0,
        resolvedDisputes: 0,
        successRate: 100,
        averageOrderValue: 0,
    };

    const { mutateAsync: requestPayout, isPending: isRequestingPayout } = useRequestPayout();

    const formatCurrency = (amount: number) => {
        return `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        Promise.all([
            refetchSummary(),
            refetchPayouts(),
            refetchDisputes(),
            refetchBankAccounts(),
        ]).finally(() => setRefreshing(false));
    }, [refetchSummary, refetchPayouts, refetchDisputes, refetchBankAccounts]);

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount.replace(/,/g, ''));
        if (!amount || isNaN(amount) || amount < 1000) return;
        if (amount > walletBalance) return;
        if (!selectedBankAccount) return;

        try {
            await requestPayout({
                amount,
                bankAccountId: selectedBankAccount.id,
                note: 'Mobile app withdrawal'
            });
            setIsWithdrawModalVisible(false);
            setWithdrawAmount('');
            setSelectedBankAccountId(null);
        } catch (error) {
            console.error('Withdrawal failed', error);
        }
    };

    const quickAmounts = [10000, 25000, 50000, 100000];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewSection
                        stats={overviewStats}
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                        walletSummary={walletSummary}
                        onViewAllTransactions={() => setActiveTab('transactions')}
                    />
                );
            case 'earnings':
                return <EarningsSection />;
            case 'payouts':
                return (
                    <PayoutsSection
                        onSeeAll={() => console.log('See all payouts')}
                    />
                );
            case 'bank_accounts':
                return <BankAccountsSection />;
            case 'disputes':
                return (
                    <DisputesSection />
                );
            case 'transactions':
                return <TransactionsSection />;
            default:
                return null;
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Wallet</ThemedText>
                <TouchableOpacity style={styles.settingsButton}>
                    <Ionicons name="settings-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={[styles.loadingText, { color: colors.placeholder }]}>
                        Loading wallet...
                    </ThemedText>
                </View>
            ) : (
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Balance Card */}
                <LinearGradient
                    colors={['#272EA7', '#0F1241']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceHeader}>
                        <View style={styles.balanceIconContainer}>
                            <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />
                        </View>
                        <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
                        </View>
                    </View>

                    <View style={styles.balanceSection}>
                        <View style={styles.balanceLabelRow}>
                            <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
                            <TouchableOpacity
                                onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="rgba(255, 255, 255, 0.8)"
                                    style={{ marginLeft: 8 }}
                                />
                            </TouchableOpacity>
                        </View>
                        <ThemedText style={styles.balanceAmount}>
                            {isBalanceVisible ? formatCurrency(walletBalance) : '₦••••••••'}
                        </ThemedText>
                        <View style={styles.pendingRow}>
                            <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
                            <ThemedText style={styles.pendingText}>
                                {isBalanceVisible ? `${formatCurrency(pendingBalance)} pending` : '₦•••••• pending'}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.balanceActions}>
                        <TouchableOpacity
                            style={styles.balanceActionButton}
                            onPress={() => setIsWithdrawModalVisible(true)}
                        >
                            <View style={styles.balanceActionIconContainer}>
                                <Ionicons name="arrow-up-outline" size={18} color="#272EA7" />
                            </View>
                            <ThemedText style={styles.balanceActionText}>Withdraw</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.balanceActionButton}
                            onPress={() => setActiveTab('bank_accounts')}
                        >
                            <View style={styles.balanceActionIconContainer}>
                                <Ionicons name="card-outline" size={18} color="#272EA7" />
                            </View>
                            <ThemedText style={styles.balanceActionText}>Bank Accounts</ThemedText>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Tab Navigation */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsContainer}
                    contentContainerStyle={styles.tabsContent}
                >
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabButton,
                                activeTab === tab.key && { backgroundColor: colors.primary },
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={16}
                                color={activeTab === tab.key ? '#FFFFFF' : colors.placeholder}
                            />
                            <ThemedText
                                style={[
                                    styles.tabText,
                                    { color: activeTab === tab.key ? '#FFFFFF' : colors.placeholder },
                                ]}
                            >
                                {tab.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {renderTabContent()}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
            )}

            {/* Withdraw Modal */}
            <Modal
                visible={isWithdrawModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsWithdrawModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <View style={styles.modalTitleRow}>
                                <View style={[styles.balanceActionIconContainer, { width: 32, height: 32 }]}>
                                    <Ionicons name="arrow-up-outline" size={16} color="#272EA7" />
                                </View>
                                <ThemedText style={styles.modalTitle}>Withdraw Funds</ThemedText>
                            </View>
                            <TouchableOpacity onPress={() => setIsWithdrawModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <ThemedText style={[styles.currentBalance, { color: colors.placeholder }]}>
                                Available: <ThemedText style={[styles.currentBalanceValue, { color: colors.text }]}>{formatCurrency(walletBalance)}</ThemedText>
                            </ThemedText>

                            {/* Bank Account Selection */}
                            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Withdraw To</ThemedText>
                            {bankAccounts.length === 0 ? (
                                <TouchableOpacity
                                    style={[styles.noBankAccountBox, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}
                                    onPress={() => {
                                        setIsWithdrawModalVisible(false);
                                        setActiveTab('bank_accounts');
                                    }}
                                >
                                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                                    <ThemedText style={[styles.noBankAccountText, { color: colors.placeholder }]}>
                                        Add a bank account first
                                    </ThemedText>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.bankSelectButton, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}
                                    onPress={() => setIsBankSelectVisible(true)}
                                >
                                    <View style={[styles.bankSelectIcon, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="business-outline" size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.bankSelectInfo}>
                                        <ThemedText style={styles.bankSelectName}>
                                            {selectedBankAccount?.bankName || 'Select Bank Account'}
                                        </ThemedText>
                                        {selectedBankAccount && (
                                            <ThemedText style={[styles.bankSelectNumber, { color: colors.placeholder }]}>
                                                ****{selectedBankAccount.accountNumber.slice(-4)} • {selectedBankAccount.accountName}
                                            </ThemedText>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-down" size={20} color={colors.placeholder} />
                                </TouchableOpacity>
                            )}

                            <ThemedText style={[styles.quickAmountsLabel, { color: colors.placeholder, marginTop: 16 }]}>Quick Amounts</ThemedText>
                            <View style={styles.quickAmountsGrid}>
                                {[5000, 10000, 20000, 50000].map((amt) => (
                                    <TouchableOpacity
                                        key={amt}
                                        style={[
                                            styles.quickAmountButton,
                                            {
                                                backgroundColor: withdrawAmount === amt.toString() ? colors.primary + '10' : colors.background,
                                                borderColor: withdrawAmount === amt.toString() ? colors.primary : colors.border
                                            }
                                        ]}
                                        onPress={() => setWithdrawAmount(amt.toString())}
                                    >
                                        <ThemedText style={[
                                            styles.quickAmountText,
                                            { color: withdrawAmount === amt.toString() ? colors.primary : colors.text }
                                        ]}>
                                            {formatCurrency(amt)}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Withdrawal Amount</ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.inputBackground,
                                        color: colors.text,
                                        borderColor: colors.border,
                                        borderWidth: 1
                                    }
                                ]}
                                value={withdrawAmount}
                                onChangeText={setWithdrawAmount}
                                placeholder="Enter amount"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="numeric"
                            />
                            <ThemedText style={[styles.inputHint, { color: colors.placeholder }]}>
                                Minimum withdrawal: ₦1,000. Processing time: 1-3 business days.
                            </ThemedText>
                        </ScrollView>

                        <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: colors.border }]}
                                onPress={() => {
                                    setIsWithdrawModalVisible(false);
                                    setWithdrawAmount('');
                                    setSelectedBankAccountId(null);
                                }}
                            >
                                <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.proceedButton,
                                    {
                                        backgroundColor:
                                            withdrawAmount && parseFloat(withdrawAmount) >= 1000 && selectedBankAccount && !isRequestingPayout
                                                ? colors.primary
                                                : colors.inputBackground,
                                    },
                                ]}
                                onPress={handleWithdraw}
                                disabled={!withdrawAmount || parseFloat(withdrawAmount) < 1000 || !selectedBankAccount || isRequestingPayout}
                            >
                                <ThemedText style={styles.proceedButtonText}>
                                    {isRequestingPayout ? 'Processing...' : 'Request Payout'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </View>
            </Modal>

            {/* Bank Account Selection Modal */}
            <Modal
                visible={isBankSelectVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsBankSelectVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <ThemedView style={[styles.modalContent, { maxHeight: '60%' }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <ThemedText style={styles.modalTitle}>Select Bank Account</ThemedText>
                            <TouchableOpacity onPress={() => setIsBankSelectVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.bankListScroll} showsVerticalScrollIndicator={false}>
                            {bankAccounts.map((account) => (
                                <TouchableOpacity
                                    key={account.id}
                                    style={[
                                        styles.bankListItem,
                                        { borderBottomColor: colors.border },
                                        selectedBankAccount?.id === account.id && { backgroundColor: colors.primary + '10' }
                                    ]}
                                    onPress={() => {
                                        setSelectedBankAccountId(account.id);
                                        setIsBankSelectVisible(false);
                                    }}
                                >
                                    <View style={[styles.bankListIcon, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="business-outline" size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.bankListInfo}>
                                        <View style={styles.bankListNameRow}>
                                            <ThemedText style={styles.bankListName}>{account.bankName}</ThemedText>
                                            {account.isDefault && (
                                                <View style={[styles.defaultTag, { backgroundColor: '#10B98115' }]}>
                                                    <ThemedText style={styles.defaultTagText}>Default</ThemedText>
                                                </View>
                                            )}
                                        </View>
                                        <ThemedText style={[styles.bankListNumber, { color: colors.placeholder }]}>
                                            ****{account.accountNumber.slice(-4)} • {account.accountName}
                                        </ThemedText>
                                    </View>
                                    {selectedBankAccount?.id === account.id && (
                                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </ThemedView>
                </View>
            </Modal>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        fontWeight: '700',
    },
    settingsButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    balanceCard: {
        margin: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    balanceIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    verifiedText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '600',
    },
    balanceSection: {
        marginBottom: 24,
    },
    balanceLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    balanceAmount: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    pendingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pendingText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
    },
    balanceActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    balanceActionButton: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    balanceActionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceActionText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
    tabsContainer: {
        marginBottom: 8,
    },
    tabsContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
        marginRight: 8,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    tabContent: {
        marginTop: 8,
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
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    currentBalance: {
        fontSize: 13,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    currentBalanceValue: {
        fontWeight: '600',
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    quickAmountsLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    quickAmountsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    quickAmountButton: {
        width: '48%',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    quickAmountText: {
        fontSize: 14,
        fontWeight: '600',
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
        fontSize: 18,
        fontWeight: '600',
    },
    inputHint: {
        fontSize: 12,
        marginTop: 6,
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
    proceedButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    proceedButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Bank Selection Styles
    noBankAccountBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: 8,
    },
    noBankAccountText: {
        fontSize: 14,
    },
    bankSelectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        gap: 12,
    },
    bankSelectIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bankSelectInfo: {
        flex: 1,
    },
    bankSelectName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    bankSelectNumber: {
        fontSize: 13,
    },
    bankListScroll: {
        paddingVertical: 8,
    },
    bankListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        gap: 12,
    },
    bankListIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bankListInfo: {
        flex: 1,
    },
    bankListNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    bankListName: {
        fontSize: 15,
        fontWeight: '600',
    },
    bankListNumber: {
        fontSize: 13,
    },
    defaultTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    defaultTagText: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: '600',
    },
});
