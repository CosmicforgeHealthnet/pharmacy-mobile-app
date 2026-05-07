import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface PrescriptionRequest {
    id: string;
    patientName: string;
    prescriptionId: string;
    time: string;
    medications: number;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected';
    priority: 'normal' | 'urgent' | 'emergency';
}

function PrescriptionRequestItem({
    request,
    colors,
    onPress,
}: {
    request: PrescriptionRequest;
    colors: typeof Colors.light;
    onPress: () => void;
}) {
    const getStatusColor = (status: PrescriptionRequest['status']) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'reviewing': return '#3B82F6';
            case 'approved': return '#10B981';
            case 'rejected': return '#EF4444';
            default: return colors.placeholder;
        }
    };

    const getPriorityColor = (priority: PrescriptionRequest['priority']) => {
        switch (priority) {
            case 'emergency': return '#EF4444';
            case 'urgent': return '#F59E0B';
            case 'normal': return '#10B981';
            default: return colors.placeholder;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.requestItem, { backgroundColor: colors.background }]}
            onPress={onPress}
        >
            <View style={[styles.requestIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.requestContent}>
                <View style={styles.requestHeader}>
                    <ThemedText style={styles.patientName}>{request.patientName}</ThemedText>
                    <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(request.priority)}15` }]}>
                        <ThemedText style={[styles.priorityText, { color: getPriorityColor(request.priority) }]}>
                            {request.priority}
                        </ThemedText>
                    </View>
                </View>
                <ThemedText style={[styles.prescriptionId, { color: colors.placeholder }]}>
                    {request.prescriptionId} - {request.medications} medications
                </ThemedText>
                <View style={styles.requestFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}15` }]}>
                        <ThemedText style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                            {request.status}
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.timeText, { color: colors.placeholder }]}>
                        {request.time}
                    </ThemedText>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
        </TouchableOpacity>
    );
}

export default function PrescriptionRequestsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing'>('all');

    const prescriptionRequests: PrescriptionRequest[] = [
        { id: '1', patientName: 'John Doe', prescriptionId: 'RX-2024-001', time: '2 min ago', medications: 3, status: 'pending', priority: 'normal' },
        { id: '2', patientName: 'Jane Smith', prescriptionId: 'RX-2024-002', time: '15 min ago', medications: 2, status: 'pending', priority: 'urgent' },
        { id: '3', patientName: 'Michael Brown', prescriptionId: 'RX-2024-003', time: '1 hour ago', medications: 5, status: 'reviewing', priority: 'normal' },
        { id: '4', patientName: 'Sarah Wilson', prescriptionId: 'RX-2024-004', time: '2 hours ago', medications: 1, status: 'pending', priority: 'emergency' },
        { id: '5', patientName: 'David Lee', prescriptionId: 'RX-2024-005', time: '3 hours ago', medications: 4, status: 'reviewing', priority: 'normal' },
        { id: '6', patientName: 'Emily Chen', prescriptionId: 'RX-2024-006', time: '4 hours ago', medications: 2, status: 'approved', priority: 'normal' },
        { id: '7', patientName: 'Robert Taylor', prescriptionId: 'RX-2024-007', time: '5 hours ago', medications: 3, status: 'pending', priority: 'urgent' },
        { id: '8', patientName: 'Lisa Anderson', prescriptionId: 'RX-2024-008', time: 'Yesterday', medications: 6, status: 'rejected', priority: 'normal' },
    ];

    const filteredRequests = prescriptionRequests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const handleRequestPress = (request: PrescriptionRequest) => {
        console.log('Request pressed:', request.id);
    };

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'reviewing', label: 'Reviewing' },
    ] as const;

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Prescription Requests</ThemedText>
                <View style={styles.headerRight} />
            </View>

            {/* Filter Tabs */}
            <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.filterButton,
                                filter === f.key && { backgroundColor: colors.primary },
                            ]}
                            onPress={() => setFilter(f.key)}
                        >
                            <ThemedText
                                style={[
                                    styles.filterText,
                                    { color: filter === f.key ? '#FFFFFF' : colors.placeholder },
                                ]}
                            >
                                {f.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Requests List */}
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
                {filteredRequests.map((request, index) => (
                    <React.Fragment key={request.id}>
                        <PrescriptionRequestItem
                            request={request}
                            colors={colors}
                            onPress={() => handleRequestPress(request)}
                        />
                        {index < filteredRequests.length - 1 && (
                            <View style={[styles.divider, { backgroundColor: colors.inputBackground }]} />
                        )}
                    </React.Fragment>
                ))}
                <View style={{ height: 24 }} />
            </ScrollView>
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
    headerRight: {
        width: 36,
    },
    filterContainer: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    filterContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 8,
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    requestIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    requestContent: {
        flex: 1,
    },
    requestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    prescriptionId: {
        fontSize: 13,
        marginBottom: 8,
    },
    requestFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    timeText: {
        fontSize: 12,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
});
