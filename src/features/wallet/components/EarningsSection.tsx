import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useWalletEarnings, useWalletTransactions } from '../hooks/useWallet';

type Period = 'monthly' | 'weekly' | 'yearly';

// ─── Stat Card ───────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string;
    delta?: number | null;
}

function StatCard({ label, value, delta }: StatCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    return (
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.statLabel, { color: colors.placeholder }]}>{label}</ThemedText>
            <ThemedText style={styles.statValue}>{value}</ThemedText>
            {delta !== undefined && delta !== null && (
                <View style={styles.deltaRow}>
                    <Ionicons
                        name={delta >= 0 ? 'trending-up' : 'trending-down'}
                        size={12}
                        color={delta >= 0 ? '#10B981' : '#EF4444'}
                    />
                    <ThemedText style={[styles.deltaText, { color: delta >= 0 ? '#10B981' : '#EF4444' }]}>
                        {delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs last period
                    </ThemedText>
                </View>
            )}
        </View>
    );
}

// ─── Breakdown Row with bar ──────────────────────────────
interface BreakdownRowProps {
    label: string;
    subLabel: string;
    totalAmount: string;
    delta?: number | null;
    barPercent: number;
    primary: string;
}

function BreakdownRow({ label, subLabel, totalAmount, delta, barPercent, primary }: BreakdownRowProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    return (
        <View style={styles.breakdownRow}>
            <View style={styles.breakdownTop}>
                <View style={styles.breakdownLeft}>
                    <ThemedText style={styles.breakdownLabel}>{label}</ThemedText>
                    <ThemedText style={[styles.breakdownSub, { color: colors.placeholder }]}>{subLabel}</ThemedText>
                </View>
                <View style={styles.breakdownRight}>
                    <ThemedText style={styles.breakdownAmount}>{totalAmount}</ThemedText>
                    {delta !== null && delta !== undefined && (
                        <ThemedText style={[styles.breakdownDelta, { color: delta >= 0 ? '#10B981' : '#EF4444' }]}>
                            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                        </ThemedText>
                    )}
                </View>
            </View>
            {/* Progress bar */}
            <View style={[styles.barTrack, { backgroundColor: colors.inputBackground }]}>
                <View style={[styles.barFill, { width: `${barPercent}%`, backgroundColor: primary }]} />
            </View>
        </View>
    );
}

// ─── Main Component ──────────────────────────────────────
export function EarningsSection() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [period, setPeriod] = React.useState<Period>('monthly');

    const { data: earnings, isLoading } = useWalletEarnings({ period });
    const { data: txData } = useWalletTransactions();

    const formatCurrency = (amount: number) =>
        `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Delta between two periods
    const pct = (a: number, b: number) => (b === 0 ? null : ((a - b) / b) * 100);
    const change = earnings ? pct(earnings.currentMonth || 0, earnings.lastMonth || 0) : null;

    const byPeriod: any[] = earnings?.byPeriod ?? [];
    const maxTotal = byPeriod.length > 0 ? Math.max(...byPeriod.map((r: any) => r.totalAmount)) : 1;

    // Recent credit transactions as individual earning items
    const creditTx = (txData?.transactions ?? []).filter((t: any) => t.type === 'credit');

    const periods: { label: string; value: Period }[] = [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Yearly', value: 'yearly' },
    ];

    return (
        <View style={styles.container}>
            {/* ── 4 Stat Cards ── */}
            <View style={styles.statsGrid}>
                <StatCard
                    label="This Month"
                    value={isLoading ? '...' : formatCurrency(earnings?.currentMonth ?? 0)}
                    delta={change}
                />
                <StatCard
                    label="Last Month"
                    value={isLoading ? '...' : formatCurrency(earnings?.lastMonth ?? 0)}
                />
                <StatCard
                    label="Last 3 Months"
                    value={isLoading ? '...' : formatCurrency(earnings?.last3Months ?? 0)}
                />
                <StatCard
                    label="All Time"
                    value={isLoading ? '...' : formatCurrency(earnings?.allTime ?? 0)}
                />
            </View>

            {/* ── Earnings Breakdown ── */}
            <View style={[styles.card, { backgroundColor: colors.background }]}>
                {/* Card header */}
                <View style={[styles.cardHeader, { borderBottomColor: colors.inputBackground }]}>
                    <ThemedText style={styles.cardTitle}>Earnings Breakdown</ThemedText>
                    {/* Period selector */}
                    <View style={styles.periodRow}>
                        {periods.map((p) => (
                            <TouchableOpacity
                                key={p.value}
                                style={[
                                    styles.periodChip,
                                    period === p.value && { backgroundColor: colors.primary },
                                ]}
                                onPress={() => setPeriod(p.value)}
                            >
                                <ThemedText
                                    style={[
                                        styles.periodChipText,
                                        { color: period === p.value ? '#FFFFFF' : colors.placeholder },
                                    ]}
                                >
                                    {p.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Loading skeletons */}
                {isLoading && [1, 2, 3].map((i) => (
                    <View key={i} style={[styles.skeletonRow, { backgroundColor: colors.inputBackground }]} />
                ))}

                {/* Breakdown rows */}
                {!isLoading && byPeriod.map((row: any, i: number) => {
                    const prev = byPeriod[i + 1];
                    const delta = prev ? pct(row.totalAmount, prev.totalAmount) : null;
                    const barPercent = maxTotal > 0 ? (row.totalAmount / maxTotal) * 100 : 0;
                    return (
                        <BreakdownRow
                            key={row.period ?? i}
                            label={row.label ?? row.period}
                            subLabel={`${row.invoiceCount ?? 0} invoices · avg ${formatCurrency(row.averageAmount ?? 0)}`}
                            totalAmount={formatCurrency(row.totalAmount ?? 0)}
                            delta={delta}
                            barPercent={barPercent}
                            primary={colors.primary}
                        />
                    );
                })}

                {/* Empty state */}
                {!isLoading && byPeriod.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="trending-up-outline" size={40} color={colors.inputBackground} />
                        <ThemedText style={styles.emptyTitle}>No earnings data</ThemedText>
                        <ThemedText style={[styles.emptyDesc, { color: colors.placeholder }]}>
                            Earnings appear here once invoices are paid.
                        </ThemedText>
                    </View>
                )}
            </View>

            {/* ── Recent Credits ── */}
            {creditTx.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <View style={[styles.cardHeader, { borderBottomColor: colors.inputBackground }]}>
                        <ThemedText style={styles.cardTitle}>Recent Credits</ThemedText>
                    </View>
                    {creditTx.slice(0, 10).map((t: any, i: number) => {
                        const categoryLabel: Record<string, string> = {
                            invoice_payment: 'Invoice Payment',
                            payout: 'Payout',
                            refund: 'Refund',
                            dispute_reversal: 'Dispute Reversal',
                            adjustment: 'Adjustment',
                        };
                        const formattedDate = (() => {
                            try {
                                return new Date(t.createdAt).toLocaleDateString('en-NG', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                });
                            } catch { return t.createdAt; }
                        })();
                        const statusColor = (() => {
                            switch (t.status) {
                                case 'completed': return '#10B981';
                                case 'pending': return '#F59E0B';
                                case 'processing': return '#3B82F6';
                                case 'failed': return '#EF4444';
                                default: return colors.placeholder;
                            }
                        })();
                        return (
                            <React.Fragment key={t.id}>
                                <View style={styles.creditRow}>
                                    <View style={styles.creditIcon}>
                                        <Ionicons name="arrow-down-outline" size={16} color="#10B981" />
                                    </View>
                                    <View style={styles.creditContent}>
                                        <ThemedText style={styles.creditDesc} numberOfLines={1}>
                                            {t.description}
                                        </ThemedText>
                                        <ThemedText style={[styles.creditMeta, { color: colors.placeholder }]}>
                                            {categoryLabel[t.category] ?? t.category} · {formattedDate}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.creditRight}>
                                        <ThemedText style={styles.creditAmount}>
                                            +{formatCurrency(t.amount)}
                                        </ThemedText>
                                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                                            <ThemedText style={[styles.statusText, { color: statusColor }]}>
                                                {t.status}
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                                {i < Math.min(creditTx.length, 10) - 1 && (
                                    <View style={[styles.divider, { backgroundColor: colors.inputBackground }]} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 24,
    },
    // Stat cards
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
        borderColor: '#E5E7EB',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    deltaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    deltaText: {
        fontSize: 11,
        fontWeight: '500',
    },
    // Card
    card: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        flexWrap: 'wrap',
        gap: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    // Period chips
    periodRow: {
        flexDirection: 'row',
        gap: 4,
    },
    periodChip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    periodChipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    // Breakdown rows
    breakdownRow: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    breakdownTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    breakdownLeft: {
        flex: 1,
    },
    breakdownRight: {
        alignItems: 'flex-end',
    },
    breakdownLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    breakdownSub: {
        fontSize: 11,
        marginTop: 2,
    },
    breakdownAmount: {
        fontSize: 14,
        fontWeight: '700',
    },
    breakdownDelta: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    barTrack: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: 6,
        borderRadius: 3,
    },
    // Skeleton
    skeletonRow: {
        height: 72,
        margin: 12,
        borderRadius: 8,
        opacity: 0.5,
    },
    // Empty
    emptyState: {
        alignItems: 'center',
        padding: 40,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    emptyDesc: {
        fontSize: 13,
        textAlign: 'center',
    },
    // Credits list
    creditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    creditIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#10B98115',
        alignItems: 'center',
        justifyContent: 'center',
    },
    creditContent: {
        flex: 1,
    },
    creditDesc: {
        fontSize: 14,
        fontWeight: '500',
    },
    creditMeta: {
        fontSize: 11,
        marginTop: 2,
    },
    creditRight: {
        alignItems: 'flex-end',
    },
    creditAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
});
