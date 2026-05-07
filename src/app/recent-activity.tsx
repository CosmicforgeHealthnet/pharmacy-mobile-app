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

interface Activity {
    id: string;
    message: string;
    time: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    type: 'prescription' | 'order' | 'payment' | 'message' | 'system';
}

function ActivityItem({
    activity,
    colors,
}: {
    activity: Activity;
    colors: typeof Colors.light;
}) {
    return (
        <View style={styles.activityItem}>
            <View style={[styles.activityIconContainer, { backgroundColor: `${activity.iconColor}15` }]}>
                <Ionicons name={activity.icon} size={20} color={activity.iconColor} />
            </View>
            <View style={styles.activityContent}>
                <ThemedText style={styles.activityMessage} numberOfLines={2}>
                    {activity.message}
                </ThemedText>
                <ThemedText style={[styles.activityTime, { color: colors.placeholder }]}>
                    {activity.time}
                </ThemedText>
            </View>
        </View>
    );
}

function ActivitySection({
    title,
    activities,
    colors,
}: {
    title: string;
    activities: Activity[];
    colors: typeof Colors.light;
}) {
    return (
        <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.placeholder }]}>
                {title}
            </ThemedText>
            <View style={[styles.sectionCard, { backgroundColor: colors.background }]}>
                {activities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                        <ActivityItem activity={activity} colors={colors} />
                        {index < activities.length - 1 && (
                            <View style={[styles.divider, { backgroundColor: colors.inputBackground }]} />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
}

export default function RecentActivityScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'prescription' | 'order' | 'payment'>('all');

    const todayActivities: Activity[] = [
        { id: '1', message: 'New prescription request from John Doe', time: '2 min ago', icon: 'document-text-outline', iconColor: '#3B82F6', type: 'prescription' },
        { id: '2', message: 'Order #ORD-001 marked as ready for pickup', time: '15 min ago', icon: 'checkmark-circle-outline', iconColor: '#10B981', type: 'order' },
        { id: '3', message: 'Payment received for prescription RX-2024-002', time: '1 hour ago', icon: 'card-outline', iconColor: '#8B5CF6', type: 'payment' },
        { id: '4', message: 'New message from patient Sarah Wilson', time: '2 hours ago', icon: 'chatbubble-outline', iconColor: '#F59E0B', type: 'message' },
        { id: '5', message: 'Prescription RX-2024-003 has been dispensed', time: '3 hours ago', icon: 'medical-outline', iconColor: '#10B981', type: 'prescription' },
    ];

    const yesterdayActivities: Activity[] = [
        { id: '6', message: 'Order #ORD-002 delivered successfully', time: 'Yesterday, 4:30 PM', icon: 'checkmark-done-outline', iconColor: '#10B981', type: 'order' },
        { id: '7', message: 'Payment of ₦25,000 received from David Lee', time: 'Yesterday, 2:15 PM', icon: 'card-outline', iconColor: '#8B5CF6', type: 'payment' },
        { id: '8', message: 'New prescription request from Emily Chen', time: 'Yesterday, 11:00 AM', icon: 'document-text-outline', iconColor: '#3B82F6', type: 'prescription' },
        { id: '9', message: 'Inventory alert: Low stock on Paracetamol', time: 'Yesterday, 9:30 AM', icon: 'alert-circle-outline', iconColor: '#EF4444', type: 'system' },
    ];

    const earlierActivities: Activity[] = [
        { id: '10', message: 'Weekly report generated successfully', time: '2 days ago', icon: 'document-outline', iconColor: '#6B7280', type: 'system' },
        { id: '11', message: 'Order #ORD-003 cancelled by patient', time: '2 days ago', icon: 'close-circle-outline', iconColor: '#EF4444', type: 'order' },
        { id: '12', message: 'Payment of ₦45,000 received from bulk order', time: '3 days ago', icon: 'card-outline', iconColor: '#8B5CF6', type: 'payment' },
        { id: '13', message: 'New prescription request from Robert Taylor', time: '3 days ago', icon: 'document-text-outline', iconColor: '#3B82F6', type: 'prescription' },
        { id: '14', message: 'System maintenance completed', time: '4 days ago', icon: 'settings-outline', iconColor: '#6B7280', type: 'system' },
    ];

    const filterActivities = (activities: Activity[]) => {
        if (filter === 'all') return activities;
        return activities.filter(a => a.type === filter);
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'prescription', label: 'Prescriptions' },
        { key: 'order', label: 'Orders' },
        { key: 'payment', label: 'Payments' },
    ] as const;

    const filteredToday = filterActivities(todayActivities);
    const filteredYesterday = filterActivities(yesterdayActivities);
    const filteredEarlier = filterActivities(earlierActivities);

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Recent Activity</ThemedText>
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

            {/* Activity List */}
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
                {filteredToday.length > 0 && (
                    <ActivitySection title="Today" activities={filteredToday} colors={colors} />
                )}
                {filteredYesterday.length > 0 && (
                    <ActivitySection title="Yesterday" activities={filteredYesterday} colors={colors} />
                )}
                {filteredEarlier.length > 0 && (
                    <ActivitySection title="Earlier" activities={filteredEarlier} colors={colors} />
                )}
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
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionCard: {
        borderRadius: 12,
        padding: 4,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    activityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityContent: {
        flex: 1,
    },
    activityMessage: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    activityTime: {
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        height: 1,
        marginHorizontal: 12,
    },
});
