import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useWalletPayouts } from '../hooks/useWallet';
import type { Payout } from '../types';

// ─── Helpers ─────────────────────────────────────────────
function formatCurrency(amount: number) {
    return `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusColor(status: Payout['status']) {
    switch (status) {
        case 'completed': return '#10B981';
        case 'pending': return '#F59E0B';
        case 'processing': return '#3B82F6';
        case 'failed': return '#EF4444';
        case 'cancelled': return '#6B7280';
        default: return '#6B7280';
    }
}

function getMethodIcon(method: Payout['method']): keyof typeof Ionicons.glyphMap {
    switch (method) {
        case 'bank_transfer': return 'business-outline';
        case 'mobile_money': return 'phone-portrait-outline';
        case 'wallet': return 'wallet-outline';
        default: return 'cash-outline';
    }
}

// ─── Payout Item ─────────────────────────────────────────
function PayoutItem({ payout, colors }: { payout: Payout; colors: any }) {
    return (
        <View style={styles.payoutItem}>
            <View style={[styles.payoutIconContainer, { backgroundColor: '#3B82F615' }]}>
                <Ionicons name={getMethodIcon(payout.method)} size={18} color="#3B82F6" />
            </View>
            <View style={styles.payoutContent}>
                <ThemedText style={styles.payoutTitle} numberOfLines={1}>
                    {payout.bankName || 'Wallet Transfer'}
                </ThemedText>
                <ThemedText style={[styles.payoutMeta, { color: colors.placeholder }]}>
                    {payout.reference} • {payout.requestedAt}
                </ThemedText>
            </View>
            <View style={styles.payoutAmountContainer}>
                <ThemedText style={styles.payoutAmount}>
                    -{formatCurrency(payout.amount)}
                </ThemedText>
                <View style={[styles.payoutStatusBadge, { backgroundColor: `${getStatusColor(payout.status)}15` }]}>
                    <ThemedText style={[styles.payoutStatusText, { color: getStatusColor(payout.status) }]}>
                        {payout.status}
                    </ThemedText>
                </View>
            </View>
        </View>
    );
}

// ─── Main Component ──────────────────────────────────────
interface PayoutsSectionProps {
    onSeeAll?: () => void;
}

export function PayoutsSection({ onSeeAll }: PayoutsSectionProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [search, setSearch] = React.useState('');

    const { data: payoutsData, isLoading: loadingPayouts } = useWalletPayouts();

    const payouts: Payout[] = payoutsData?.payouts || [];

    const filtered = payouts.filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return p.reference?.toLowerCase().includes(q) || p.bankName?.toLowerCase().includes(q);
    });

    if (loadingPayouts) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    return (
        <View style={styles.section}>
            {/* Payout History */}
            <View style={[styles.historyCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={[styles.historyHeader, { borderBottomColor: colors.border }]}>
                    <ThemedText style={styles.historyTitle}>Payout History</ThemedText>
                    {onSeeAll && (
                        <TouchableOpacity onPress={onSeeAll}>
                            <ThemedText style={[styles.seeAllText, { color: colors.primary }]}>See All</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search */}
                <View style={[styles.searchBox, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="search-outline" size={18} color={colors.placeholder} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by reference or bank…"
                        placeholderTextColor={colors.placeholder}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* List */}
                {filtered.length > 0 ? (
                    filtered.map((payout, index) => (
                        <React.Fragment key={payout.id}>
                            <PayoutItem payout={payout} colors={colors} />
                            {index < filtered.length - 1 && (
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="list-outline" size={40} color={colors.inputBackground} style={{ marginBottom: 12 }} />
                        <ThemedText style={styles.emptyTitle}>No payouts found</ThemedText>
                        <ThemedText style={[styles.emptyDesc, { color: colors.placeholder }]}>
                            {search ? 'No payouts match your current filters.' : 'Your payout history will appear here.'}
                        </ThemedText>
                    </View>
                )}
                <ThemedText style={[styles.footerText, { color: colors.placeholder }]}>
                    Showing {filtered.length} of {payouts.length} payouts
                </ThemedText>
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
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    historyCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    seeAllText: {
        fontSize: 14,
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
    payoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    payoutIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payoutContent: {
        flex: 1,
    },
    payoutTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    payoutMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    payoutAmountContainer: {
        alignItems: 'flex-end',
    },
    payoutAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    payoutStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 4,
    },
    payoutStatusText: {
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        marginHorizontal: 12,
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
    footerText: {
        fontSize: 12,
        textAlign: 'center',
        paddingVertical: 12,
    },
});
