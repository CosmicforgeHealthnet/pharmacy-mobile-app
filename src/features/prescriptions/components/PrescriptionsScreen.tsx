import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useMemo, useCallback } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { usePrescriptions } from '../hooks';
import type { Prescription, PrescriptionStatus } from '../types';
import { getStatusColor, formatStatus, formatRelativeTime } from '../types';

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
                style={[
                    styles.filterChipText,
                    { color: isActive ? '#FFFFFF' : colors.text },
                ]}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
}

// ─── Prescription Card ───────────────────────────────
function PrescriptionCard({
    prescription,
    colors,
    onPress,
}: {
    prescription: Prescription;
    colors: typeof Colors.light;
    onPress: () => void;
}) {
    const statusColors = getStatusColor(prescription.status);

    return (
        <TouchableOpacity
            style={[styles.prescriptionCard, { backgroundColor: colors.background }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <ThemedText style={styles.patientName}>
                        {prescription.patient?.fullName ?? 'Unknown Patient'}
                    </ThemedText>
                    <ThemedText style={[styles.reference, { color: colors.placeholder }]}>
                        {prescription.reference || `RX-${prescription.id?.slice(-6) || '000000'}`}
                    </ThemedText>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor: statusColors.bg,
                            borderColor: statusColors.border,
                        },
                    ]}
                >
                    <ThemedText style={[styles.statusText, { color: statusColors.text }]}>
                        {formatStatus(prescription.status)}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color={colors.placeholder} />
                    <ThemedText style={[styles.detailText, { color: colors.placeholder }]}>
                        {prescription.doctor?.fullName
                            ? `Dr. ${prescription.doctor.fullName}`
                            : 'Doctor not assigned'}
                    </ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.placeholder} />
                    <ThemedText style={[styles.detailText, { color: colors.placeholder }]}>
                        {formatRelativeTime(prescription.createdAt)}
                    </ThemedText>
                </View>
                {prescription.medications?.length > 0 && (
                    <View style={styles.detailRow}>
                        <Ionicons name="medical-outline" size={16} color={colors.placeholder} />
                        <ThemedText style={[styles.detailText, { color: colors.placeholder }]}>
                            {prescription.medications.length} medication{prescription.medications.length > 1 ? 's' : ''}
                        </ThemedText>
                    </View>
                )}
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.inputBackground }]}>
                <TouchableOpacity style={styles.actionButton} onPress={onPress}>
                    <Ionicons name="eye-outline" size={18} color={colors.primary} />
                    <ThemedText style={[styles.actionText, { color: colors.primary }]}>
                        View Details
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

// ─── Loading Skeleton ─────────────────────────────────
function LoadingSkeleton({ colors }: { colors: typeof Colors.light }) {
    return (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
                <View
                    key={i}
                    style={[styles.skeletonCard, { backgroundColor: colors.background }]}
                >
                    <View style={styles.skeletonHeader}>
                        <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.inputBackground }]} />
                        <View style={[styles.skeletonBadge, { backgroundColor: colors.inputBackground }]} />
                    </View>
                    <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.inputBackground }]} />
                    <View style={[styles.skeletonLine, { width: '50%', backgroundColor: colors.inputBackground }]} />
                </View>
            ))}
        </View>
    );
}

// ─── Empty State ─────────────────────────────────────
function EmptyState({ colors, hasFilters }: { colors: typeof Colors.light; hasFilters: boolean }) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.placeholder} />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                {hasFilters ? 'No results found' : 'No prescriptions yet'}
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                {hasFilters
                    ? 'Try adjusting your search or filters.'
                    : 'Prescription requests will appear here once received.'}
            </ThemedText>
        </View>
    );
}

// ─── Prescriptions Screen ────────────────────────────
export function PrescriptionsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch prescriptions from API
    const { data: prescriptions = [], isLoading, refetch, isRefetching } = usePrescriptions();

    // Get unique statuses from prescriptions
    const availableStatuses = useMemo(() => {
        const statuses = new Set(prescriptions.map((p) => p.status));
        return ['all', ...Array.from(statuses)];
    }, [prescriptions]);

    // Filter prescriptions based on search and status
    const filteredPrescriptions = useMemo(() => {
        return prescriptions.filter((p) => {
            const patientName = p.patient?.fullName?.toLowerCase() ?? '';
            const ref = (p.reference ?? p.id).toLowerCase();
            const matchesSearch =
                patientName.includes(searchTerm.toLowerCase()) ||
                ref.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [prescriptions, searchTerm, statusFilter]);

    const hasFilters = searchTerm.length > 0 || statusFilter !== 'all';

    const onRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handlePrescriptionPress = useCallback((prescription: Prescription) => {
        router.push({
            pathname: '/prescription/[id]' as any,
            params: { id: prescription.id }
        });
    }, [router]);

    const renderPrescription = useCallback(({ item }: { item: Prescription }) => (
        <PrescriptionCard
            prescription={item}
            colors={colors}
            onPress={() => handlePrescriptionPress(item)}
        />
    ), [colors, handlePrescriptionPress]);

    const keyExtractor = useCallback((item: Prescription) => item.id, []);

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.headerTitle}>Prescriptions</ThemedText>
                <View style={styles.headerRight}>
                    {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="search-outline" size={20} color={colors.placeholder} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by patient or ID..."
                        placeholderTextColor={colors.placeholder}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                <FlatList
                    data={availableStatuses}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <FilterChip
                            label={item === 'all' ? 'All' : formatStatus(item)}
                            isActive={statusFilter === item}
                            onPress={() => setStatusFilter(item)}
                            colors={colors}
                        />
                    )}
                />
            </View>

            {/* Results Count */}
            {!isLoading && (
                <View style={styles.resultsContainer}>
                    <ThemedText style={[styles.resultsText, { color: colors.placeholder }]}>
                        Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                    </ThemedText>
                    {hasFilters && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchTerm('');
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

            {/* Prescription List */}
            {isLoading && !prescriptions.length ? (
                <LoadingSkeleton colors={colors} />
            ) : (
                <FlatList
                    data={filteredPrescriptions}
                    renderItem={renderPrescription}
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
                    ListEmptyComponent={<EmptyState colors={colors} hasFilters={hasFilters} />}
                    ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                />
            )}
        </ThemedView>
    );
}

// ─── Styles ──────────────────────────────────────────
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
    searchContainer: {
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
        fontSize: 16,
    },
    filterContainer: {
        marginBottom: 8,
    },
    filterList: {
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
        paddingHorizontal: 16,
        paddingBottom: 24,
        flexGrow: 1,
    },
    prescriptionCard: {
        borderRadius: 12,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flex: 1,
        marginRight: 12,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
    },
    reference: {
        fontSize: 13,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardDetails: {
        gap: 6,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
    },
    cardFooter: {
        borderTopWidth: 1,
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    itemSeparator: {
        height: 12,
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
        width: 80,
        height: 24,
        borderRadius: 12,
    },
});
