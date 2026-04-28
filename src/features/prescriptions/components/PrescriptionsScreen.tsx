import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────
interface Prescription {
    id: string;
    reference: string;
    patientName: string;
    doctorName: string;
    status: string;
    createdAt: string;
}

// ─── Status Colors ───────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    new: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    pending: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    in_progress: { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' },
    ready_for_pickup: { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' },
    completed: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    cancelled: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

function getStatusColor(status: string) {
    return STATUS_COLORS[status?.toLowerCase()] ?? { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
}

function formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

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
                    <ThemedText style={styles.patientName}>{prescription.patientName}</ThemedText>
                    <ThemedText style={[styles.reference, { color: colors.placeholder }]}>
                        {prescription.reference}
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
                        Dr. {prescription.doctorName}
                    </ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.placeholder} />
                    <ThemedText style={[styles.detailText, { color: colors.placeholder }]}>
                        {prescription.createdAt}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="eye-outline" size={18} color={colors.primary} />
                    <ThemedText style={[styles.actionText, { color: colors.primary }]}>
                        View Details
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
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
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    // Mock data - replace with actual API data
    const prescriptions: Prescription[] = [
        { id: '1', reference: 'RX-2024-001', patientName: 'John Doe', doctorName: 'Sarah Smith', status: 'new', createdAt: 'Today, 10:30 AM' },
        { id: '2', reference: 'RX-2024-002', patientName: 'Jane Smith', doctorName: 'Michael Brown', status: 'pending', createdAt: 'Today, 9:15 AM' },
        { id: '3', reference: 'RX-2024-003', patientName: 'Michael Brown', doctorName: 'Emily Chen', status: 'in_progress', createdAt: 'Yesterday' },
        { id: '4', reference: 'RX-2024-004', patientName: 'Sarah Wilson', doctorName: 'David Lee', status: 'ready_for_pickup', createdAt: 'Yesterday' },
        { id: '5', reference: 'RX-2024-005', patientName: 'David Lee', doctorName: 'Sarah Smith', status: 'completed', createdAt: '2 days ago' },
        { id: '6', reference: 'RX-2024-006', patientName: 'Emily Chen', doctorName: 'Michael Brown', status: 'cancelled', createdAt: '3 days ago' },
    ];

    const availableStatuses = ['all', ...new Set(prescriptions.map((p) => p.status))];

    const filteredPrescriptions = useMemo(() => {
        return prescriptions.filter((p) => {
            const matchesSearch =
                p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.reference.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [prescriptions, searchTerm, statusFilter]);

    const hasFilters = searchTerm.length > 0 || statusFilter !== 'all';

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const renderPrescription = ({ item }: { item: Prescription }) => (
        <PrescriptionCard
            prescription={item}
            colors={colors}
            onPress={() => {}}
        />
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.headerTitle}>Prescriptions</ThemedText>
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
            <View style={styles.resultsContainer}>
                <ThemedText style={[styles.resultsText, { color: colors.placeholder }]}>
                    Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                </ThemedText>
            </View>

            {/* Prescription List */}
            <FlatList
                data={filteredPrescriptions}
                renderItem={renderPrescription}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={<EmptyState colors={colors} hasFilters={hasFilters} />}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />
        </ThemedView>
    );
}

// ─── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
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
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    resultsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    resultsText: {
        fontSize: 13,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
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
        borderTopColor: '#F3F4F6',
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
});
