import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useHomeData } from '../hooks';
import { storage } from '@/core/storage';
import { useWalletSummary } from '@/features/wallet/hooks/useWallet';
import type { Prescription, ActiveOrder, DashboardActivityItem, PrescriptionStatus } from '../types';

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
interface ActivityProps {
    message: string;
    time: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    colors: typeof Colors.light;
}

interface CreateOrderFormData {
    patientName: string;
    prescriptionReference: string;
    numberOfMedications: string;
    priority: 'Routine' | 'Urgent' | 'Emergency';
    orderType: 'New' | 'Refill' | 'Transfer' | 'Compound';
}

// ─── Header Component ────────────────────────────────
function Header({
    colors,
    isSearchOpen,
    searchValue,
    onSearchToggle,
    onSearchChange
}: {
    colors: typeof Colors.light;
    isSearchOpen: boolean;
    searchValue: string;
    onSearchToggle: () => void;
    onSearchChange: (text: string) => void;
}) {
    const inputRef = React.useRef<TextInput>(null);

    React.useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchOpen]);

    return (
        <View style={[styles.header, { backgroundColor: colors.background }]}>
            {isSearchOpen ? (
                // Search Input Mode
                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputWrapper, { backgroundColor: colors.inputBackground }]}>
                        <Ionicons name="search-outline" size={20} color={colors.placeholder} />
                        <TextInput
                            ref={inputRef}
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search prescriptions, orders..."
                            placeholderTextColor={colors.placeholder}
                            value={searchValue}
                            onChangeText={onSearchChange}
                            returnKeyType="search"
                        />
                        {searchValue.length > 0 && (
                            <TouchableOpacity onPress={() => onSearchChange('')}>
                                <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={onSearchToggle} style={styles.cancelButton}>
                        <ThemedText style={[styles.cancelText, { color: colors.primary }]}>
                            Cancel
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            ) : (
                // Normal Header Mode
                <>
                    {/* Logo */}
                    <Image
                        source={require('@/assets/images/cosmic-log.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Right Icons */}
                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
                            onPress={onSearchToggle}
                        >
                            <Ionicons name="search-outline" size={22} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}>
                            <Ionicons name="notifications-outline" size={22} color={colors.text} />
                            {/* Notification badge */}
                            <View style={[styles.notificationBadge, { backgroundColor: '#EF4444' }]}>
                                <ThemedText style={styles.badgeText}>3</ThemedText>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}>
                            <Ionicons name="headset-outline" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

// ─── Stat Card Component ─────────────────────────────
function StatCard({ label, value, icon, colors }: StatCardProps) {
    return (
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name={icon} size={16} color={colors.primary} />
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

// ─── Wallet Balance Card ─────────────────────────────
function WalletBalanceCard({ colors, onPress }: { colors: typeof Colors.light; onPress: () => void }) {
    const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);
    
    const { data: walletSummary, isLoading } = useWalletSummary();
    const walletBalance = walletSummary?.availableBalance || 0;

    const formatCurrency = (amount: number) => {
        return `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <LinearGradient
                colors={['#272EA7', '#0F1241']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.walletCard}
            >
                <View style={styles.walletCardHeader}>
                    <View style={styles.walletIconContainer}>
                        <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
                    </View>
                    <TouchableOpacity onPress={onPress} style={styles.walletViewButton}>
                        <ThemedText style={styles.walletViewButtonText}>View Wallet</ThemedText>
                        <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.walletBalanceSection}>
                    <View style={styles.walletBalanceLabelRow}>
                        <ThemedText style={styles.walletBalanceLabel}>Available Balance</ThemedText>
                        <TouchableOpacity
                            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                                size={18}
                                color="rgba(255, 255, 255, 0.8)"
                            />
                        </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.walletBalanceAmount}>
                        {isLoading ? '₦••••••' : isBalanceVisible ? formatCurrency(walletBalance) : '₦••••••'}
                    </ThemedText>
                </View>

            </LinearGradient>
        </TouchableOpacity>
    );
}

// ─── Create Order Card ───────────────────────────────
function CreateOrderCard({ colors, onPress }: { colors: typeof Colors.light; onPress: () => void }) {
    return (
        <View style={[styles.createOrderCard, { backgroundColor: colors.background }]}>
            <View style={styles.createOrderHeader}>
                <ThemedText style={styles.createOrderTitle}>Create Order</ThemedText>
                <ThemedText style={[styles.createOrderSubtitle, { color: colors.placeholder }]}>
                    Quickly create a new order for your patients
                </ThemedText>
            </View>
            <TouchableOpacity
                style={[styles.createOrderButton, { backgroundColor: colors.primary }]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <ThemedText style={styles.createOrderButtonText}>Create New Order</ThemedText>
            </TouchableOpacity>
        </View>
    );
}

// ─── Recent Activity Item ────────────────────────────
function RecentActivityItem({ message, time, icon, iconColor, colors }: ActivityProps) {
    return (
        <View style={styles.activityItem}>
            <View style={[styles.activityIconContainer, { backgroundColor: `${iconColor}15` }]}>
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>
            <View style={styles.activityContent}>
                <ThemedText style={styles.activityMessage} numberOfLines={2}>
                    {message}
                </ThemedText>
                <ThemedText style={[styles.activityTime, { color: colors.placeholder }]}>
                    {time}
                </ThemedText>
            </View>
        </View>
    );
}

// ─── Select Option Component ─────────────────────────
function SelectOption({
    label,
    options,
    value,
    onSelect,
    colors
}: {
    label: string;
    options: string[];
    value: string;
    onSelect: (value: string) => void;
    colors: typeof Colors.light;
}) {
    return (
        <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{label}</ThemedText>
            <View style={styles.selectOptions}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.selectOption,
                            { borderColor: value === option ? colors.primary : colors.inputBackground },
                            value === option && { backgroundColor: `${colors.primary}15` }
                        ]}
                        onPress={() => onSelect(option)}
                    >
                        <ThemedText style={[
                            styles.selectOptionText,
                            { color: value === option ? colors.primary : colors.text }
                        ]}>
                            {option}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ─── Create Order Modal ──────────────────────────────
function CreateOrderModal({
    visible,
    onClose,
    colors
}: {
    visible: boolean;
    onClose: () => void;
    colors: typeof Colors.light;
}) {
    const [formData, setFormData] = React.useState<CreateOrderFormData>({
        patientName: '',
        prescriptionReference: `RX-${Date.now().toString().slice(-6)}`,
        numberOfMedications: '',
        priority: 'Routine',
        orderType: 'New',
    });

    const priorityOptions = ['Routine', 'Urgent', 'Emergency'];
    const orderTypeOptions = ['New', 'Refill', 'Transfer', 'Compound'];

    const handleReset = () => {
        setFormData({
            patientName: '',
            prescriptionReference: `RX-${Date.now().toString().slice(-6)}`,
            numberOfMedications: '',
            priority: 'Routine',
            orderType: 'New',
        });
    };

    const handleSubmit = () => {
        // Validate and submit
        if (!formData.patientName.trim()) {
            return;
        }
        console.log('Order submitted:', formData);
        handleReset();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Create New Order</ThemedText>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.modalBody}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Patient Name */}
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Patient Name</ThemedText>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    placeholder="Enter patient name"
                                    placeholderTextColor={colors.placeholder}
                                    value={formData.patientName}
                                    onChangeText={(text) => setFormData({ ...formData, patientName: text })}
                                />
                            </View>

                            {/* Prescription Reference */}
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Prescription Reference</ThemedText>
                                <View style={[styles.referenceContainer, { backgroundColor: colors.inputBackground }]}>
                                    <ThemedText style={[styles.referenceText, { color: colors.placeholder }]}>
                                        {formData.prescriptionReference}
                                    </ThemedText>
                                    <View style={[styles.autoGeneratedBadge, { backgroundColor: `${colors.primary}15` }]}>
                                        <ThemedText style={[styles.autoGeneratedText, { color: colors.primary }]}>
                                            Auto-generated
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>

                            {/* Number of Medications */}
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Number of Medications</ThemedText>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    placeholder="Enter number of medications"
                                    placeholderTextColor={colors.placeholder}
                                    keyboardType="numeric"
                                    value={formData.numberOfMedications}
                                    onChangeText={(text) => setFormData({ ...formData, numberOfMedications: text })}
                                />
                            </View>

                            {/* Priority */}
                            <SelectOption
                                label="Priority"
                                options={priorityOptions}
                                value={formData.priority}
                                onSelect={(value) => setFormData({ ...formData, priority: value as CreateOrderFormData['priority'] })}
                                colors={colors}
                            />

                            {/* Order Type */}
                            <SelectOption
                                label="Order Type"
                                options={orderTypeOptions}
                                value={formData.orderType}
                                onSelect={(value) => setFormData({ ...formData, orderType: value as CreateOrderFormData['orderType'] })}
                                colors={colors}
                            />
                        </ScrollView>

                        {/* Modal Footer */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.resetButton, { borderColor: colors.placeholder }]}
                                onPress={handleReset}
                            >
                                <ThemedText style={[styles.resetButtonText, { color: colors.text }]}>
                                    Reset
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                                onPress={handleSubmit}
                            >
                                <ThemedText style={styles.submitButtonText}>Create Order</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Helper Functions ─────────────────────────────────
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function getStatusColor(status: PrescriptionStatus): string {
    const statusColors: Record<PrescriptionStatus, string> = {
        new: '#3B82F6',
        pending: '#F59E0B',
        pharmacy_assigned: '#8B5CF6',
        under_review: '#6366F1',
        awaiting_payment: '#F97316',
        in_progress: '#3B82F6',
        ready_for_pickup: '#10B981',
        out_for_delivery: '#06B6D4',
        completed: '#10B981',
        cancelled: '#EF4444',
    };
    return statusColors[status] || '#6B7280';
}

function formatStatus(status: PrescriptionStatus): string {
    const statusLabels: Record<PrescriptionStatus, string> = {
        new: 'New',
        pending: 'Pending',
        pharmacy_assigned: 'Assigned',
        under_review: 'Under Review',
        awaiting_payment: 'Awaiting Payment',
        in_progress: 'In Progress',
        ready_for_pickup: 'Ready',
        out_for_delivery: 'Out for Delivery',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return statusLabels[status] || status;
}

function getActivityIcon(type: string): keyof typeof Ionicons.glyphMap {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
        prescription: 'document-text-outline',
        order: 'cube-outline',
        payment: 'card-outline',
        message: 'chatbubble-outline',
        status_change: 'checkmark-circle-outline',
        delivery: 'car-outline',
    };
    return iconMap[type] || 'notifications-outline';
}

function getActivityIconColor(type: string): string {
    const colorMap: Record<string, string> = {
        prescription: '#3B82F6',
        order: '#8B5CF6',
        payment: '#10B981',
        message: '#F59E0B',
        status_change: '#10B981',
        delivery: '#06B6D4',
    };
    return colorMap[type] || '#6B7280';
}

// ─── Home Screen ─────────────────────────────────────
export function HomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const [isCreateOrderModalVisible, setIsCreateOrderModalVisible] = React.useState(false);
    const [userName, setUserName] = React.useState('');

    // Fetch real API data
    const { stats, activities, prescriptions, orders, loading, refetch } = useHomeData();

    // Load user name from storage
    React.useEffect(() => {
        const loadUserName = async () => {
            const userData = await storage.getUserData();
            if (userData?.fullName) {
                setUserName(userData.fullName);
            } else if (userData?.pharmacyName) {
                setUserName(userData.pharmacyName);
            }
        };
        loadUserName();
    }, []);

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen);
        if (isSearchOpen) {
            setSearchValue('');
        }
    };

    const onRefresh = React.useCallback(async () => {
        await refetch();
    }, [refetch]);

    // Map API stats to display format
    const statsData = React.useMemo(() => [
        { label: 'Pending Requests', value: stats?.pendingPrescriptions ?? 0, icon: 'document-text-outline' as const },
        { label: 'Active Orders', value: stats?.activeOrders ?? 0, icon: 'pulse-outline' as const },
        { label: 'Completed Today', value: stats?.completedToday ?? 0, icon: 'checkmark-circle-outline' as const },
        { label: 'Total Revenue', value: stats?.totalRevenue ? `₦${stats.totalRevenue.toLocaleString()}` : '₦0', icon: 'trending-up-outline' as const },
    ], [stats]);

    // Map prescriptions to display format
    const prescriptionRequests = React.useMemo(() =>
        prescriptions.map((p: Prescription) => ({
            patientName: p.patient?.fullName || 'Unknown Patient',
            prescriptionId: p.reference || `RX-${p.id?.slice(-6) || '000000'}`,
            time: formatRelativeTime(p.createdAt),
        }))
    , [prescriptions]);

    // Map active orders to display format
    const activeOrdersList = React.useMemo(() =>
        orders.map((o: ActiveOrder) => ({
            patientName: o.patient?.fullName || 'Unknown Patient',
            orderId: o.reference || `ORD-${o.id?.slice(-6) || '000000'}`,
            status: formatStatus(o.status),
            statusColor: getStatusColor(o.status),
        }))
    , [orders]);

    // Map activities to display format
    const recentActivities = React.useMemo(() =>
        activities.map((a: DashboardActivityItem) => ({
            message: a.message,
            time: formatRelativeTime(a.timestamp),
            icon: getActivityIcon(a.type),
            iconColor: getActivityIconColor(a.type),
        }))
    , [activities]);

    const handleCreateOrder = () => {
        setIsCreateOrderModalVisible(true);
    };

    const handleWalletPress = () => {
        router.push('/wallet');
    };

    return (
        <ThemedView style={styles.container}>
            {/* Fixed Header */}
            <Header
                colors={colors}
                isSearchOpen={isSearchOpen}
                searchValue={searchValue}
                onSearchToggle={handleSearchToggle}
                onSearchChange={setSearchValue}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Greeting */}
                <View style={styles.greetingContainer}>
                    <ThemedText style={styles.greetingTitle}>
                        Hello {userName}
                    </ThemedText>
                    <ThemedText style={[styles.greetingSubtitle, { color: colors.placeholder }]}>
                        Let&apos;s handle your prescription
                    </ThemedText>
                </View>

                {/* Wallet Balance Card */}
                <View style={styles.walletSection}>
                    <WalletBalanceCard colors={colors} onPress={handleWalletPress} />
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {statsData.map((stat, index) => (
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
                        onSeeAll={() => router.push('/prescription-requests')}
                        colors={colors}
                    />
                    <View style={[styles.sectionCard, { backgroundColor: colors.background }]}>
                        {prescriptionRequests.length > 0 ? (
                            prescriptionRequests.map((request, index) => (
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
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <ThemedText style={[styles.emptyStateText, { color: colors.placeholder }]}>
                                    No new prescription requests
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Active Orders */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Active Orders"
                        onSeeAll={() => router.push('/active-orders')}
                        colors={colors}
                    />
                    <View style={[styles.sectionCard, { backgroundColor: colors.background }]}>
                        {activeOrdersList.length > 0 ? (
                            activeOrdersList.map((order, index) => (
                                <React.Fragment key={index}>
                                    <ActiveOrderItem
                                        patientName={order.patientName}
                                        orderId={order.orderId}
                                        status={order.status}
                                        statusColor={order.statusColor}
                                        colors={colors}
                                    />
                                    {index < activeOrdersList.length - 1 && (
                                        <View style={[styles.divider, { backgroundColor: colors.inputBackground }]} />
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <ThemedText style={[styles.emptyStateText, { color: colors.placeholder }]}>
                                    No active orders
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Create Order */}
                <View style={styles.section}>
                    <CreateOrderCard colors={colors} onPress={handleCreateOrder} />
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Recent Activity"
                        onSeeAll={() => router.push('/recent-activity')}
                        colors={colors}
                    />
                    <View style={[styles.sectionCard, { backgroundColor: colors.background }]}>
                        {recentActivities.length > 0 ? (
                            <>
                                <ThemedText style={[styles.activityDescription, { color: colors.placeholder }]}>
                                    See the recent activity here.
                                </ThemedText>
                                {recentActivities.map((activity, index) => (
                                    <React.Fragment key={index}>
                                        <RecentActivityItem
                                            message={activity.message}
                                            time={activity.time}
                                            icon={activity.icon}
                                            iconColor={activity.iconColor}
                                            colors={colors}
                                        />
                                        {index < recentActivities.length - 1 && (
                                            <View style={[styles.divider, { backgroundColor: colors.inputBackground }]} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <ThemedText style={[styles.emptyStateText, { color: colors.placeholder }]}>
                                    No recent activity
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Create Order Modal */}
            <CreateOrderModal
                visible={isCreateOrderModalVisible}
                onClose={() => setIsCreateOrderModalVisible(false)}
                colors={colors}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
    },
    logo: {
        width: 120,
        height: 32,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    cancelButton: {
        paddingVertical: 8,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
    },
    greetingContainer: {
        marginBottom: 16,
    },
    greetingTitle: {
        fontSize: 26,
        fontWeight: '700',
    },
    greetingSubtitle: {
        fontSize: 15,
        marginTop: 4,
    },
    walletSection: {
        marginBottom: 24,
    },
    walletCard: {
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    walletCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    walletIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletViewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    walletViewButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    walletBalanceSection: {
        marginBottom: 16,
    },
    walletBalanceLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    walletBalanceLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    walletBalanceAmount: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    walletActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    walletActionButton: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    walletActionIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletActionText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
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
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
    },
    statValue: {
        fontSize: 18,
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
    emptyState: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 14,
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
    createOrderCard: {
        borderRadius: 12,
        padding: 16,
    },
    createOrderHeader: {
        marginBottom: 16,
    },
    createOrderTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    createOrderSubtitle: {
        fontSize: 14,
    },
    createOrderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
    },
    createOrderButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    activityDescription: {
        fontSize: 13,
        marginBottom: 12,
        paddingHorizontal: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    activityIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        marginTop: 2,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingTop: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    modalInput: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 16,
    },
    referenceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    referenceText: {
        fontSize: 16,
    },
    autoGeneratedBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    autoGeneratedText: {
        fontSize: 12,
        fontWeight: '500',
    },
    selectOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    selectOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    selectOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 36,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
