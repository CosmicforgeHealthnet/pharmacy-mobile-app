import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useWalletTransactions } from '../hooks/useWallet';
import type { OverviewStats, OverviewPeriod, Transaction } from '../types';

interface OverviewSectionProps {
    stats: OverviewStats;
    selectedPeriod: OverviewPeriod;
    onPeriodChange: (period: OverviewPeriod) => void;
    walletSummary?: any;
    onViewAllTransactions?: () => void;
}

// ─── Stat Card ───────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    highlight?: boolean;
}

function StatCard({ label, value, sub, highlight }: StatCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    return (
        <View style={[
            styles.statCard,
            { backgroundColor: highlight ? colors.primary : colors.background, borderColor: colors.border }
        ]}>
            <ThemedText style={[
                styles.statCardLabel,
                { color: highlight ? 'rgba(255,255,255,0.7)' : colors.placeholder }
            ]}>
                {label}
            </ThemedText>
            <ThemedText style={[
                styles.statCardValue,
                { color: highlight ? '#FFFFFF' : colors.text }
            ]}>
                {value}
            </ThemedText>
            {sub && (
                <ThemedText style={[
                    styles.statCardSub,
                    { color: highlight ? 'rgba(255,255,255,0.6)' : colors.placeholder }
                ]}>
                    {sub}
                </ThemedText>
            )}
        </View>
    );
}

// ─── Transaction Row ─────────────────────────────────────
function RecentTransactionRow({ transaction }: { transaction: Transaction }) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isCredit = transaction.type === 'credit';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'processing': return '#3B82F6';
            case 'failed': return '#EF4444';
            default: return colors.placeholder;
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (amount: number) =>
        `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <View style={styles.txRow}>
            {/* Type icon */}
            <View style={[styles.txIcon, { backgroundColor: isCredit ? '#10B98115' : '#EF444415' }]}>
                <Ionicons
                    name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'}
                    size={16}
                    color={isCredit ? '#10B981' : '#EF4444'}
                />
            </View>
            {/* Description */}
            <View style={styles.txContent}>
                <ThemedText style={styles.txDescription} numberOfLines={1}>
                    {transaction.description}
                </ThemedText>
                <ThemedText style={[styles.txDate, { color: colors.placeholder }]}>
                    {formatDate(transaction.createdAt)}
                </ThemedText>
            </View>
            {/* Status + Amount */}
            <View style={styles.txRight}>
                <ThemedText
                    style={[styles.txAmount, { color: isCredit ? '#10B981' : '#EF4444' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                >
                    {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
                </ThemedText>
                <View style={[styles.txStatusBadge, { backgroundColor: `${getStatusColor(transaction.status)}15` }]}>
                    <ThemedText style={[styles.txStatusText, { color: getStatusColor(transaction.status) }]}>
                        {transaction.status}
                    </ThemedText>
                </View>
            </View>
        </View>
    );
}

// ─── Main Component ──────────────────────────────────────
export function OverviewSection({
    stats,
    selectedPeriod,
    onPeriodChange,
    walletSummary,
    onViewAllTransactions,
}: OverviewSectionProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [search, setSearch] = React.useState('');

    // Fetch own transactions internally
    const { data: txData } = useWalletTransactions();
    console.log("Wallet Transactions Data:", txData);
    const transactions = txData ?? [];

    const formatCurrency = (amount: number) =>
        `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const filteredTx = transactions.filter((t: Transaction) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            t.description?.toLowerCase().includes(q) ||
            t.reference?.toLowerCase().includes(q)
        );
    });

    const availableBalance = walletSummary?.availableBalance || 0;
    const pendingBalance = walletSummary?.pendingClearance || 0;
    const totalEarnings = walletSummary?.totalEarnings || 0;
    const totalBalance = availableBalance + pendingBalance;

    return (
        <View style={styles.section}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard label="Total Balance" value={formatCurrency(totalBalance)} sub="Wallet total" />
                <StatCard label="Total Earnings" value={formatCurrency(totalEarnings)} sub="All time" />
                <StatCard label="Pending" value={formatCurrency(pendingBalance)} sub="Clears in 1–3 days" />
                <StatCard label="Available" value={formatCurrency(availableBalance)} sub="Ready for payout" highlight />
            </View>

            {/* Recent Transactions */}
            <View style={[styles.txCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={[styles.txCardHeader, { borderBottomColor: colors.border }]}>
                    <View style={styles.txCardTitleRow}>
                        <Ionicons name="wallet-outline" size={16} color={colors.placeholder} />
                        <ThemedText style={styles.txCardTitle}>Recent Transactions</ThemedText>
                    </View>
                    {onViewAllTransactions && (
                        <TouchableOpacity onPress={onViewAllTransactions}>
                            <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>
                                View all
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search */}
                <View style={[styles.searchBox, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="search-outline" size={18} color={colors.placeholder} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search transactions…"
                        placeholderTextColor={colors.placeholder}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Transaction rows */}
                {filteredTx.length > 0 ? (
                    filteredTx.slice(0, 4).map((t: Transaction, i: number) => (
                        <React.Fragment key={t.id}>
                            <RecentTransactionRow transaction={t} />
                            {i < Math.min(filteredTx.length, 4) - 1 && (
                                <View style={[styles.divider, { backgroundColor: colors.inputBackground }]} />
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <ThemedText style={styles.emptyTitle}>No transactions found</ThemedText>
                        <ThemedText style={[styles.emptyDesc, { color: colors.placeholder }]}>
                            {search
                                ? 'No transactions match your search.'
                                : 'Transactions appear here once patients pay invoices.'}
                        </ThemedText>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
        gap: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '47%',
        flexGrow: 1,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
    },
    statCardLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 4,
    },
    statCardValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    statCardSub: {
        fontSize: 11,
    },
    txCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    txCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    txCardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    txCardTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '500',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        margin: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    txIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    txContent: {
        flex: 1,
        minWidth: 0,
    },
    txDescription: {
        fontSize: 14,
        fontWeight: '500',
    },
    txDate: {
        fontSize: 12,
        marginTop: 2,
    },
    txRight: {
        alignItems: 'flex-end',
        flexShrink: 0,
        maxWidth: '45%',
    },
    txAmount: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
    txStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 4,
    },
    txStatusText: {
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
    },
    emptyDesc: {
        fontSize: 13,
        textAlign: 'center',
    },
});
