import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useMemo, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useInvoices } from '../hooks';
import type { Invoice, InvoiceStatus } from '../types';
import { getInvoiceStatusColor, formatInvoiceStatus, formatCurrency, formatInvoiceDate, getInvoiceRef } from '../types';
import { InvoiceCard } from './InvoiceCard';

// ─── Filter Chip ─────────────────────────────────────
function FilterChip({
    label,
    isActive,
    onPress,
    colors,
}: {
    label: string;
    isActive: boolean;
    onPress: () => void;
    colors: typeof Colors.light;
}) {
    return (
        <TouchableOpacity
            style={[
                styles.filterChip,
                {
                    backgroundColor: isActive ? colors.primary : colors.inputBackground,
                    borderColor: isActive ? colors.primary : colors.inputBackground,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <ThemedText
                style={[styles.filterChipText, { color: isActive ? '#FFFFFF' : colors.text }]}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
}

// ─── Loading Skeleton ─────────────────────────────────
function LoadingSkeleton({ colors }: { colors: typeof Colors.light }) {
    return (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.background }]}>
                    <View style={styles.skeletonHeader}>
                        <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.inputBackground }]} />
                        <View style={[styles.skeletonBadge, { backgroundColor: colors.inputBackground }]} />
                    </View>
                    <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.inputBackground }]} />
                    <View style={[styles.skeletonLine, { width: '30%', backgroundColor: colors.inputBackground }]} />
                </View>
            ))}
        </View>
    );
}

// ─── Empty State ─────────────────────────────────────
function EmptyState({
    colors,
    hasFilters,
    statusFilter,
}: {
    colors: typeof Colors.light;
    hasFilters: boolean;
    statusFilter: string;
}) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.placeholder} />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                No invoices found
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                {hasFilters
                    ? 'No invoices match your search or filters'
                    : 'Invoices will appear here once you create them for prescriptions.'}
            </ThemedText>
        </View>
    );
}

// ─── Invoice Screen ─────────────────────────────────────
export function InvoiceScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Fetch invoices from API
    const { data: invoices = [], isLoading, refetch, isRefetching } = useInvoices({
        status: statusFilter !== 'all' ? statusFilter : undefined,
    });

    // Get unique statuses for filter chips
    const statusOptions = useMemo(() => {
        return [
            { value: 'all', label: 'All' },
            { value: 'awaiting_payment', label: 'Payment Due' },
            { value: 'paid', label: 'Paid' },
            { value: 'sent', label: 'Sent' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'draft', label: 'Draft' },
            { value: 'cancelled', label: 'Cancelled' },
        ];
    }, []);

    // Filter invoices based on search
    const filteredInvoices = useMemo(() => {
        if (!searchQuery.trim()) return invoices;
        const query = searchQuery.toLowerCase();
        return invoices.filter(
            (invoice) =>
                getInvoiceRef(invoice).toLowerCase().includes(query) ||
                (invoice.prescriptionRef || '').toLowerCase().includes(query) ||
                (invoice.patientName || '').toLowerCase().includes(query) ||
                (invoice.patientEmail || '').toLowerCase().includes(query)
        );
    }, [invoices, searchQuery]);

    // Count pending invoices
    const pendingCount = useMemo(() => {
        return invoices.filter(
            (i) => i.status === 'awaiting_payment' || i.status === 'overdue'
        ).length;
    }, [invoices]);

    const hasFilters = searchQuery.length > 0 || statusFilter !== 'all';

    const onRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleInvoicePress = useCallback(
        (invoice: Invoice) => {
            router.push({
                pathname: '/invoice/[id]',
                params: { id: invoice.id },
            });
        },
        [router]
    );

    const renderInvoice = useCallback(
        ({ item }: { item: Invoice }) => (
            <InvoiceCard invoice={item} onPress={() => handleInvoicePress(item)} />
        ),
        [handleInvoicePress]
    );

    const keyExtractor = useCallback((item: Invoice) => item.id, []);

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.headerTitle}>Invoices</ThemedText>
                <View style={styles.headerRight}>
                    {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
                </View>
            </View>

            {/* Alert Banner */}
            {pendingCount > 0 && !isLoading && (
                <View style={[styles.alertBanner, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                    <Ionicons name="receipt-outline" size={16} color="#D97706" />
                    <ThemedText style={[styles.alertText, { color: '#92400E' }]}>
                        You have <ThemedText style={styles.alertBold}>{pendingCount}</ThemedText> unpaid{' '}
                        {pendingCount === 1 ? 'invoice' : 'invoices'} awaiting payment.
                    </ThemedText>
                </View>
            )}

            {/* Search Bar */}
            <View style={[styles.filterSection, { backgroundColor: colors.background }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="search-outline" size={20} color={colors.placeholder} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by invoice, prescription, or patient..."
                        placeholderTextColor={colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterChipsContainer}>
                <FlatList
                    data={statusOptions}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterChipsList}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <FilterChip
                            label={item.label}
                            isActive={statusFilter === item.value}
                            onPress={() => setStatusFilter(item.value)}
                            colors={colors}
                        />
                    )}
                />
            </View>

            {/* Results Count */}
            {!isLoading && (
                <View style={styles.resultsContainer}>
                    <ThemedText style={[styles.resultsText, { color: colors.placeholder }]}>
                        Showing {filteredInvoices.length} of {invoices.length} invoices
                    </ThemedText>
                    {hasFilters && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                            }}
                        >
                            <ThemedText style={[styles.clearFilters, { color: colors.primary }]}>
                                Clear filters
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Invoice List */}
            {isLoading && !invoices.length ? (
                <LoadingSkeleton colors={colors} />
            ) : (
                <FlatList
                    data={filteredInvoices}
                    renderItem={renderInvoice}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <EmptyState colors={colors} hasFilters={hasFilters} statusFilter={statusFilter} />
                    }
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    headerRight: {
        width: 24,
        alignItems: 'center',
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    alertText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    alertBold: {
        fontWeight: '600',
    },
    filterSection: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    filterChipsContainer: {
        marginBottom: 8,
    },
    filterChipsList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    resultsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    resultsText: {
        fontSize: 13,
    },
    clearFilters: {
        fontSize: 13,
        fontWeight: '500',
    },
    listContent: {
        paddingTop: 4,
        paddingBottom: 24,
        flexGrow: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
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
        paddingHorizontal: 32,
    },
    skeletonContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },
    skeletonCard: {
        borderRadius: 12,
        padding: 16,
        gap: 10,
    },
    skeletonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skeletonLine: {
        height: 14,
        borderRadius: 4,
    },
    skeletonBadge: {
        width: 70,
        height: 24,
        borderRadius: 12,
    },
});
