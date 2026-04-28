import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    colors: typeof Colors.light;
}

interface PrescriptionRequestProps {
    patientName: string;
    prescriptionId: string;
    time: string;
    colors: typeof Colors.light;
}

interface ActiveOrderProps {
    patientName: string;
    orderId: string;
    status: string;
    statusColor: string;
    colors: typeof Colors.light;
}

// ─── Stat Card Component ─────────────────────────────
function StatCard({ label, value, icon, colors }: StatCardProps) {
    return (
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.statContent}>
                <ThemedText style={[styles.statLabel, { color: colors.placeholder }]}>
                    {label}
                </ThemedText>
                <ThemedText style={styles.statValue}>{value}</ThemedText>
            </View>
        </View>
    );
}

// ─── Prescription Request Item ───────────────────────
function PrescriptionRequestItem({ patientName, prescriptionId, time, colors }: PrescriptionRequestProps) {
    return (
        <TouchableOpacity style={[styles.requestItem, { backgroundColor: colors.background }]}>
            <View style={styles.requestInfo}>
                <ThemedText style={styles.requestPatient}>{patientName}</ThemedText>
                <ThemedText style={[styles.requestId, { color: colors.placeholder }]}>
                    {prescriptionId}
                </ThemedText>
            </View>
            <ThemedText style={[styles.requestTime, { color: colors.placeholder }]}>
                {time}
            </ThemedText>
        </TouchableOpacity>
    );
}

// ─── Active Order Item ───────────────────────────────
function ActiveOrderItem({ patientName, orderId, status, statusColor, colors }: ActiveOrderProps) {
    return (
        <TouchableOpacity style={[styles.orderItem, { backgroundColor: colors.background }]}>
            <View style={styles.orderInfo}>
                <ThemedText style={styles.orderPatient}>{patientName}</ThemedText>
                <ThemedText style={[styles.orderId, { color: colors.placeholder }]}>
                    {orderId}
                </ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }]}>
                <ThemedText style={[styles.statusText, { color: statusColor }]}>
                    {status}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );
}

// ─── Section Header ──────────────────────────────────
function SectionHeader({ title, onSeeAll, colors }: { title: string; onSeeAll?: () => void; colors: typeof Colors.light }) {
    return (
        <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll}>
                    <ThemedText style={[styles.seeAllText, { color: colors.primary }]}>
                        See All
                    </ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Home Screen ─────────────────────────────────────
export function HomeScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    // Mock data - replace with actual API data
    const stats = [
        { label: 'Pending Requests', value: 12, icon: 'document-text-outline' as const },
        { label: 'Active Orders', value: 8, icon: 'pulse-outline' as const },
        { label: 'Completed Today', value: 24, icon: 'checkmark-circle-outline' as const },
        { label: 'Total Revenue', value: '₦45,000', icon: 'trending-up-outline' as const },
    ];

    const prescriptionRequests = [
        { patientName: 'John Doe', prescriptionId: 'RX-2024-001', time: '2 min ago' },
        { patientName: 'Jane Smith', prescriptionId: 'RX-2024-002', time: '15 min ago' },
        { patientName: 'Michael Brown', prescriptionId: 'RX-2024-003', time: '1 hour ago' },
    ];

    const activeOrders = [
        { patientName: 'Sarah Wilson', orderId: 'ORD-001', status: 'In Progress', statusColor: '#3B82F6' },
        { patientName: 'David Lee', orderId: 'ORD-002', status: 'Ready', statusColor: '#10B981' },
        { patientName: 'Emily Chen', orderId: 'ORD-003', status: 'Pending', statusColor: '#F59E0B' },
    ];

    return (
        <ThemedView style={styles.container}>
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
                {/* Welcome Header */}
                <View style={[styles.welcomeCard, { backgroundColor: colors.background }]}>
                    <ThemedText style={styles.welcomeTitle}>Welcome back, Pharmacy</ThemedText>
                    <ThemedText style={[styles.welcomeSubtitle, { color: colors.placeholder }]}>
                        Here&apos;s what&apos;s happening at your pharmacy today.
                    </ThemedText>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            colors={colors}
                        />
                    ))}
                </View>

                {/* New Prescription Requests */}
                <View style={styles.section}>
                    <SectionHeader
                        title="New Prescription Requests"
                        onSeeAll={() => {}}
                        colors={colors}
                    />
                    <View style={[styles.sectionCard, { backgroundColor: colors.background }]}>
                        {prescriptionRequests.map((request, index) => (
                            <React.Fragment key={index}>
                                <PrescriptionRequestItem
                                    patientName={request.patientName}
                                    prescriptionId={request.prescriptionId}
                                    time={request.time}
                                    colors={colors}
                                />
                                {index < prescriptionRequests.length - 1 && (
                                    <View style={[styles.divider, { backgroundColor: colors.inputBackground }]} />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Active Orders */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Active Orders"
                        onSeeAll={() => {}}
                        colors={colors}
                    />
                    <View style={[styles.sectionCard, { backgroundColor: colors.background }]}>
                        {activeOrders.map((order, index) => (
                            <React.Fragment key={index}>
                                <ActiveOrderItem
                                    patientName={order.patientName}
                                    orderId={order.orderId}
                                    status={order.status}
                                    statusColor={order.statusColor}
                                    colors={colors}
                                />
                                {index < activeOrders.length - 1 && (
                                    <View style={[styles.divider, { backgroundColor: colors.inputBackground }]} />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

// ─── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 24,
    },
    welcomeCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    welcomeSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        flexGrow: 1,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    sectionCard: {
        borderRadius: 12,
        padding: 4,
    },
    requestItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    requestInfo: {
        flex: 1,
    },
    requestPatient: {
        fontSize: 15,
        fontWeight: '600',
    },
    requestId: {
        fontSize: 13,
        marginTop: 2,
    },
    requestTime: {
        fontSize: 12,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderPatient: {
        fontSize: 15,
        fontWeight: '600',
    },
    orderId: {
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
    divider: {
        height: 1,
        marginHorizontal: 12,
    },
});
