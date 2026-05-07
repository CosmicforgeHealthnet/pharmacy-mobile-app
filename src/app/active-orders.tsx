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

interface Order {
    id: string;
    patientName: string;
    orderId: string;
    status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
    medications: number;
    totalAmount: number;
    createdAt: string;
    estimatedDelivery?: string;
}

function OrderItem({
    order,
    colors,
    onPress,
}: {
    order: Order;
    colors: typeof Colors.light;
    onPress: () => void;
}) {
    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'in_progress': return '#3B82F6';
            case 'ready': return '#10B981';
            case 'delivered': return '#6B7280';
            case 'cancelled': return '#EF4444';
            default: return colors.placeholder;
        }
    };

    const getStatusIcon = (status: Order['status']): keyof typeof Ionicons.glyphMap => {
        switch (status) {
            case 'pending': return 'time-outline';
            case 'in_progress': return 'sync-outline';
            case 'ready': return 'checkmark-circle-outline';
            case 'delivered': return 'checkmark-done-outline';
            case 'cancelled': return 'close-circle-outline';
            default: return 'help-circle-outline';
        }
    };

    const formatCurrency = (amount: number) => {
        return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ');
    };

    return (
        <TouchableOpacity
            style={[styles.orderItem, { backgroundColor: colors.background }]}
            onPress={onPress}
        >
            <View style={[styles.orderIconContainer, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
                <Ionicons name={getStatusIcon(order.status)} size={22} color={getStatusColor(order.status)} />
            </View>
            <View style={styles.orderContent}>
                <View style={styles.orderHeader}>
                    <ThemedText style={styles.patientName}>{order.patientName}</ThemedText>
                    <ThemedText style={styles.orderAmount}>{formatCurrency(order.totalAmount)}</ThemedText>
                </View>
                <ThemedText style={[styles.orderId, { color: colors.placeholder }]}>
                    {order.orderId} - {order.medications} items
                </ThemedText>
                <View style={styles.orderFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
                        <ThemedText style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                            {formatStatus(order.status)}
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.timeText, { color: colors.placeholder }]}>
                        {order.createdAt}
                    </ThemedText>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
        </TouchableOpacity>
    );
}

export default function ActiveOrdersScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'ready'>('all');

    const orders: Order[] = [
        { id: '1', patientName: 'Sarah Wilson', orderId: 'ORD-001', status: 'in_progress', medications: 3, totalAmount: 15000, createdAt: '10 min ago' },
        { id: '2', patientName: 'David Lee', orderId: 'ORD-002', status: 'ready', medications: 2, totalAmount: 8500, createdAt: '30 min ago' },
        { id: '3', patientName: 'Emily Chen', orderId: 'ORD-003', status: 'pending', medications: 4, totalAmount: 22000, createdAt: '1 hour ago' },
        { id: '4', patientName: 'Robert Taylor', orderId: 'ORD-004', status: 'in_progress', medications: 1, totalAmount: 5000, createdAt: '2 hours ago' },
        { id: '5', patientName: 'Lisa Anderson', orderId: 'ORD-005', status: 'ready', medications: 5, totalAmount: 35000, createdAt: '3 hours ago' },
        { id: '6', patientName: 'James Wilson', orderId: 'ORD-006', status: 'pending', medications: 2, totalAmount: 12000, createdAt: '4 hours ago' },
        { id: '7', patientName: 'Maria Garcia', orderId: 'ORD-007', status: 'delivered', medications: 3, totalAmount: 18000, createdAt: 'Yesterday' },
        { id: '8', patientName: 'Thomas Brown', orderId: 'ORD-008', status: 'cancelled', medications: 1, totalAmount: 7500, createdAt: 'Yesterday' },
    ];

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const handleOrderPress = (order: Order) => {
        console.log('Order pressed:', order.id);
    };

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'ready', label: 'Ready' },
    ] as const;

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Active Orders</ThemedText>
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

            {/* Orders List */}
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
                {filteredOrders.map((order, index) => (
                    <React.Fragment key={order.id}>
                        <OrderItem
                            order={order}
                            colors={colors}
                            onPress={() => handleOrderPress(order)}
                        />
                        {index < filteredOrders.length - 1 && (
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
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    orderIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderContent: {
        flex: 1,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
    },
    orderAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    orderId: {
        fontSize: 13,
        marginBottom: 8,
    },
    orderFooter: {
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
