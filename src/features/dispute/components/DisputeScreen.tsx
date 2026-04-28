import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Button } from '@/shared/components/ui/Button';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────
interface Dispute {
    id: string;
    transactionId: string;
    amount: number;
    reason: string;
    description: string;
    status: 'open' | 'under_review' | 'resolved';
    createdAt: string;
    response?: string;
}

// ─── Status Badge ────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const getStatusStyle = () => {
        switch (status) {
            case 'open':
                return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
            case 'under_review':
                return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
            case 'resolved':
                return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
            default:
                return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
        }
    };

    const style = getStatusStyle();

    return (
        <View style={[styles.statusBadge, { backgroundColor: style.bg, borderColor: style.border }]}>
            <ThemedText style={[styles.statusText, { color: style.text }]}>
                {status.replace('_', ' ').toUpperCase()}
            </ThemedText>
        </View>
    );
}

// ─── Dispute Card ────────────────────────────────────
function DisputeCard({
    dispute,
    colors,
    onRespond,
    onViewDetails,
}: {
    dispute: Dispute;
    colors: typeof Colors.light;
    onRespond: () => void;
    onViewDetails: () => void;
}) {
    const formatCurrency = (amount: number) => {
        return `₦${amount.toLocaleString()}`;
    };

    return (
        <View style={[styles.disputeCard, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.transactionRow}>
                        <ThemedText style={styles.transactionId}>#{dispute.transactionId}</ThemedText>
                        <StatusBadge status={dispute.status} />
                    </View>
                    <ThemedText style={[styles.dateText, { color: colors.placeholder }]}>
                        {dispute.createdAt}
                    </ThemedText>
                </View>
                <View style={styles.cardHeaderRight}>
                    <ThemedText style={styles.amountText}>{formatCurrency(dispute.amount)}</ThemedText>
                    <ThemedText style={[styles.reasonText, { color: colors.placeholder }]}>
                        {dispute.reason}
                    </ThemedText>
                </View>
            </View>

            {/* Description */}
            <View style={[styles.descriptionBox, { backgroundColor: colors.inputBackground }]}>
                <ThemedText style={[styles.descriptionText, { color: colors.text }]}>
                    "{dispute.description}"
                </ThemedText>
            </View>

            {/* Response (if exists) */}
            {dispute.response && (
                <View style={styles.responseSection}>
                    <View style={styles.responseHeader}>
                        <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                        <ThemedText style={[styles.responseLabel, { color: colors.primary }]}>
                            YOUR RESPONSE
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.responseText, { color: colors.placeholder }]}>
                        {dispute.response}
                    </ThemedText>
                </View>
            )}

            {/* Actions */}
            <View style={styles.cardActions}>
                {(dispute.status === 'open' || dispute.status === 'under_review') && (
                    <TouchableOpacity
                        style={[styles.respondButton, { backgroundColor: colors.primary }]}
                        onPress={onRespond}
                    >
                        <ThemedText style={styles.respondButtonText}>Respond</ThemedText>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.detailsButton, { borderColor: colors.placeholder }]}
                    onPress={onViewDetails}
                >
                    <ThemedText style={[styles.detailsButtonText, { color: colors.text }]}>
                        View Details
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Empty State ─────────────────────────────────────
function EmptyState({ colors }: { colors: typeof Colors.light }) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.placeholder} />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                No disputes found
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                Any wallet disputes will appear here.
            </ThemedText>
        </View>
    );
}

// ─── Response Modal ──────────────────────────────────
function ResponseModal({
    visible,
    onClose,
    onSubmit,
    colors,
}: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (message: string) => void;
    colors: typeof Colors.light;
}) {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (message.trim()) {
            onSubmit(message);
            setMessage('');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <ThemedText style={styles.modalTitle}>Respond to Dispute</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <ThemedText style={[styles.modalDescription, { color: colors.placeholder }]}>
                        Provide a detailed explanation or evidence to resolve this dispute.
                    </ThemedText>
                    <TextInput
                        style={[
                            styles.textArea,
                            {
                                backgroundColor: colors.inputBackground,
                                color: colors.text,
                                borderColor: colors.inputBackground,
                            },
                        ]}
                        placeholder="Type your response here..."
                        placeholderTextColor={colors.placeholder}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: colors.placeholder }]}
                            onPress={onClose}
                        >
                            <ThemedText style={{ color: colors.text }}>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: message.trim() ? colors.primary : colors.placeholder },
                            ]}
                            onPress={handleSubmit}
                            disabled={!message.trim()}
                        >
                            <ThemedText style={styles.submitButtonText}>Send Response</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Dispute Screen ──────────────────────────────────
export function DisputeScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

    // Mock data - replace with actual API data
    const disputes: Dispute[] = [
        {
            id: '1',
            transactionId: 'TXN-001',
            amount: 15000,
            reason: 'Wrong Amount',
            description: 'I was charged more than the agreed price for my medication.',
            status: 'open',
            createdAt: 'Today, 2:30 PM',
        },
        {
            id: '2',
            transactionId: 'TXN-002',
            amount: 8500,
            reason: 'Service Not Received',
            description: 'I paid for delivery but never received my order.',
            status: 'under_review',
            createdAt: 'Yesterday',
            response: 'We are investigating this issue and will update you shortly.',
        },
        {
            id: '3',
            transactionId: 'TXN-003',
            amount: 22000,
            reason: 'Duplicate Charge',
            description: 'I was charged twice for the same order.',
            status: 'resolved',
            createdAt: '3 days ago',
            response: 'Refund has been processed. Please allow 3-5 business days.',
        },
    ];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const handleRespond = (dispute: Dispute) => {
        setSelectedDispute(dispute);
        setModalVisible(true);
    };

    const handleSubmitResponse = (message: string) => {
        console.log('Response submitted:', message);
        setModalVisible(false);
        setSelectedDispute(null);
    };

    const renderDispute = ({ item }: { item: Dispute }) => (
        <DisputeCard
            dispute={item}
            colors={colors}
            onRespond={() => handleRespond(item)}
            onViewDetails={() => {}}
        />
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.headerTitle}>Disputes</ThemedText>
                <View style={[styles.badge, { backgroundColor: colors.inputBackground }]}>
                    <ThemedText style={[styles.badgeText, { color: colors.placeholder }]}>
                        {disputes.length} Total
                    </ThemedText>
                </View>
            </View>

            {/* Dispute List */}
            <FlatList
                data={disputes}
                renderItem={renderDispute}
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
                ListEmptyComponent={<EmptyState colors={colors} />}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />

            {/* Response Modal */}
            <ResponseModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmitResponse}
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
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    disputeCard: {
        borderRadius: 12,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flex: 1,
    },
    cardHeaderRight: {
        alignItems: 'flex-end',
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    transactionId: {
        fontSize: 16,
        fontWeight: '700',
    },
    dateText: {
        fontSize: 12,
        marginTop: 4,
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
    },
    reasonText: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    descriptionBox: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    responseSection: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        borderStyle: 'dashed',
        paddingTop: 12,
        marginBottom: 12,
    },
    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    responseLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    responseText: {
        fontSize: 13,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    respondButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    respondButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    detailsButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    detailsButtonText: {
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalDescription: {
        fontSize: 14,
        marginBottom: 16,
    },
    textArea: {
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        minHeight: 120,
        borderWidth: 1,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
