import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useWalletTransactions } from '../hooks/useWallet';

// ─── Constants ───────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
    order_payment: 'Order Payment',
    invoice_payment: 'Invoice Payment',
    payout: 'Payout',
    refund: 'Refund',
    fee: 'Fee',
    adjustment: 'Adjustment',
    reversal: 'Reversal',
    top_up: 'Top Up',
    withdrawal: 'Withdrawal',
};

const TYPE_OPTIONS = ['all', 'credit', 'debit'];
const STATUS_OPTIONS = ['all', 'completed', 'pending', 'failed', 'reversed'];
const CATEGORY_OPTIONS = ['all', 'order_payment', 'invoice_payment', 'payout', 'refund', 'fee', 'adjustment', 'reversal'];

// ─── Helpers ─────────────────────────────────────────────
function formatCurrency(amount: number) {
    return `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'completed': return '#10B981';
        case 'pending': return '#F59E0B';
        case 'processing': return '#3B82F6';
        case 'failed': return '#EF4444';
        default: return '#6B7280';
    }
}

function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
    switch (category) {
        case 'order_payment': return 'cart-outline';
        case 'invoice_payment': return 'document-text-outline';
        case 'payout': return 'arrow-up-circle-outline';
        case 'refund': return 'refresh-outline';
        case 'fee': return 'pricetag-outline';
        case 'adjustment': return 'swap-horizontal-outline';
        case 'reversal': return 'arrow-undo-outline';
        case 'top_up': return 'add-circle-outline';
        case 'withdrawal': return 'arrow-down-circle-outline';
        default: return 'cash-outline';
    }
}

// ─── Filter Chip ─────────────────────────────────────────
interface FilterChipProps {
    label: string;
    selected: boolean;
    onPress: () => void;
    primary: string;
    placeholder: string;
    border: string;
}

function FilterChip({ label, selected, onPress, primary, placeholder, border }: FilterChipProps) {
    return (
        <TouchableOpacity
            style={[
                styles.chip,
                selected
                    ? { backgroundColor: primary }
                    : { borderColor: border, borderWidth: 1 },
            ]}
            onPress={onPress}
        >
            <ThemedText style={[styles.chipText, { color: selected ? '#FFFFFF' : placeholder }]}>
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
}

// ─── Transaction Row ─────────────────────────────────────
function TransactionRow({ t, colors }: { t: any; colors: typeof Colors.light }) {
    const isCredit = t.type === 'credit';
    const statusColor = getStatusColor(t.status);

    return (
        <View style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: isCredit ? '#10B98115' : '#EF444415' }]}>
                <Ionicons
                    name={getCategoryIcon(t.category)}
                    size={18}
                    color={isCredit ? '#10B981' : '#EF4444'}
                />
            </View>
            <View style={styles.txContent}>
                <ThemedText style={styles.txDesc} numberOfLines={2}>
                    {t.description}
                </ThemedText>
                <View style={styles.txMetaRow}>
                    <ThemedText style={[styles.txMeta, { color: colors.placeholder }]} numberOfLines={1}>
                        {CATEGORY_LABELS[t.category] ?? t.category}
                        {t.invoiceRef ? ` · ${t.invoiceRef}` : ''}
                    </ThemedText>
                </View>
                <ThemedText style={[styles.txDate, { color: colors.placeholder }]} numberOfLines={1}>
                    {formatDate(t.createdAt)}
                </ThemedText>
            </View>
            <View style={styles.txRight}>
                <ThemedText
                    style={[styles.txAmount, { color: isCredit ? '#10B981' : '#EF4444' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                >
                    {isCredit ? '+' : '−'}{formatCurrency(t.amount)}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                    <ThemedText style={[styles.statusText, { color: statusColor }]}>
                        {t.status}
                    </ThemedText>
                </View>
            </View>
        </View>
    );
}

// ─── Main Component ──────────────────────────────────────
export function TransactionsSection() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [search, setSearch] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState('all');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [catFilter, setCatFilter] = React.useState('all');

    const { data, isLoading } = useWalletTransactions({
        type: typeFilter !== 'all' ? (typeFilter as 'credit' | 'debit') : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: catFilter !== 'all' ? catFilter : undefined,
    });

    const allTx: any[] = data ?? [];

    const filtered = React.useMemo(() => {
        if (!search) return allTx;
        const q = search.toLowerCase();
        return allTx.filter((t) =>
            t.description?.toLowerCase().includes(q) ||
            t.reference?.toLowerCase().includes(q) ||
            (t.patientName ?? '').toLowerCase().includes(q),
        );
    }, [allTx, search]);

    const hasFilters =
        search.length > 0 ||
        typeFilter !== 'all' ||
        statusFilter !== 'all' ||
        catFilter !== 'all';

    return (
        <View style={styles.container}>
            {/* Filters */}
            <View style={[styles.filtersCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {/* Search */}
                <View style={[styles.searchBox, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="search-outline" size={18} color={colors.placeholder} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by description, reference or patient…"
                        placeholderTextColor={colors.placeholder}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color={colors.placeholder} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Type */}
                <ThemedText style={[styles.filterGroupLabel, { color: colors.placeholder }]}>
                    Type
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {TYPE_OPTIONS.map((opt) => (
                            <FilterChip
                                key={opt}
                                label={
                                    opt === 'all'
                                        ? 'All Types'
                                        : opt.charAt(0).toUpperCase() + opt.slice(1)
                                }
                                selected={typeFilter === opt}
                                onPress={() => setTypeFilter(opt)}
                                primary={colors.primary}
                                placeholder={colors.placeholder}
                                border={colors.border}
                            />
                        ))}
                    </View>
                </ScrollView>

                {/* Status */}
                <ThemedText style={[styles.filterGroupLabel, { color: colors.placeholder }]}>
                    Status
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {STATUS_OPTIONS.map((opt) => (
                            <FilterChip
                                key={opt}
                                label={
                                    opt === 'all'
                                        ? 'All Statuses'
                                        : opt.charAt(0).toUpperCase() + opt.slice(1)
                                }
                                selected={statusFilter === opt}
                                onPress={() => setStatusFilter(opt)}
                                primary={colors.primary}
                                placeholder={colors.placeholder}
                                border={colors.border}
                            />
                        ))}
                    </View>
                </ScrollView>

                {/* Category */}
                <ThemedText style={[styles.filterGroupLabel, { color: colors.placeholder }]}>
                    Category
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {CATEGORY_OPTIONS.map((opt) => (
                            <FilterChip
                                key={opt}
                                label={opt === 'all' ? 'All Categories' : (CATEGORY_LABELS[opt] ?? opt)}
                                selected={catFilter === opt}
                                onPress={() => setCatFilter(opt)}
                                primary={colors.primary}
                                placeholder={colors.placeholder}
                                border={colors.border}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Transaction List */}
            <View style={[styles.listCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {isLoading && [1, 2, 3].map((i) => (
                    <View
                        key={i}
                        style={[styles.skeleton, { backgroundColor: colors.inputBackground }]}
                    />
                ))}

                {!isLoading && filtered.map((t, i) => (
                    <React.Fragment key={t.id ?? i}>
                        <TransactionRow t={t} colors={colors} />
                        {i < filtered.length - 1 && (
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        )}
                    </React.Fragment>
                ))}

                {!isLoading && filtered.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="list-outline" size={40} color={colors.border} />
                        <ThemedText style={styles.emptyTitle}>No transactions found</ThemedText>
                        <ThemedText style={[styles.emptyDesc, { color: colors.placeholder }]}>
                            {hasFilters
                                ? 'No transactions match your current filters.'
                                : 'Transactions appear here once patients pay invoices.'}
                        </ThemedText>
                    </View>
                )}
            </View>

            {/* Footer */}
            <ThemedText style={[styles.footer, { color: colors.placeholder }]}>
                Showing {filtered.length} of {data?.total ?? 0} transactions
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 24,
    },
    filtersCard: {
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        gap: 8,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    filterGroupLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 4,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 6,
        paddingBottom: 4,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    listCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    skeleton: {
        height: 68,
        margin: 12,
        borderRadius: 8,
        opacity: 0.5,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    txIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    txContent: {
        flex: 1,
        gap: 2,
        minWidth: 0,
    },
    txDesc: {
        fontSize: 14,
        fontWeight: '500',
    },
    txMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    txMeta: {
        fontSize: 12,
        flex: 1,
    },
    txDate: {
        fontSize: 11,
    },
    txRight: {
        alignItems: 'flex-end',
        gap: 4,
        flexShrink: 0,
        maxWidth: '45%',
    },
    txAmount: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
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
    emptyState: {
        padding: 40,
        alignItems: 'center',
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
    footer: {
        fontSize: 12,
        textAlign: 'center',
    },
});
