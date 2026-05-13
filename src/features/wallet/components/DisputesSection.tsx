import { ThemedText } from '@/shared/components/themed-text';
import { formatCurrency } from '@/shared/constants/currency';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useWalletDisputes } from '../hooks/useWallet';

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function getStatusStyle(status: string): { bg: string; text: string; label: string } {
    switch (status) {
        case 'open':
            return { bg: '#FEF2F2', text: '#DC2626', label: 'OPEN' };
        case 'under_review':
            return { bg: '#FFFBEB', text: '#D97706', label: 'UNDER REVIEW' };
        case 'resolved':
            return { bg: '#F0FDF4', text: '#16A34A', label: 'RESOLVED' };
        case 'escalated':
            return { bg: '#FFF7ED', text: '#EA580C', label: 'ESCALATED' };
        default:
            return { bg: '#F9FAFB', text: '#6B7280', label: status.toUpperCase() };
    }
}

// ─── Dispute Card ─────────────────────────────────────────
interface DisputeCardProps {
    dispute: any;
    colors: typeof Colors.light;
    onRespond: (id: string) => void;
}

function DisputeCard({ dispute, colors, onRespond }: DisputeCardProps) {
    const statusStyle = getStatusStyle(dispute.status);
    const canRespond = dispute.status === 'open' || dispute.status === 'under_review';

    return (
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {/* Header row */}
            <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.txIdRow}>
                        <ThemedText style={styles.txId}>#{dispute.transactionId}</ThemedText>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                                {statusStyle.label}
                            </ThemedText>
                        </View>
                    </View>
                    <ThemedText style={[styles.dateText, { color: colors.placeholder }]}>
                        {formatDate(dispute.createdAt)}
                    </ThemedText>
                </View>
                <View style={styles.cardHeaderRight}>
                    <ThemedText style={styles.amountText}>
                        {formatCurrency(dispute.amount, dispute.currency)}
                    </ThemedText>
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

            {/* Pharmacy Response */}
            {dispute.response && (
                <View style={[styles.responseBox, { borderTopColor: colors.border }]}>
                    <View style={styles.responseHeader}>
                        <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                        <ThemedText style={[styles.responseLabel, { color: colors.primary }]}>
                            YOUR RESPONSE
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.responseText, { color: colors.text }]}>
                        {dispute.response}
                    </ThemedText>
                </View>
            )}

            {/* Actions */}
            <View style={styles.cardActions}>
                {canRespond && (
                    <TouchableOpacity
                        style={[styles.respondButton, { backgroundColor: colors.primary }]}
                        onPress={() => onRespond(dispute.id)}
                    >
                        <ThemedText style={styles.respondButtonText}>Respond</ThemedText>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.detailsButton, { borderColor: colors.border }]}
                >
                    <ThemedText style={[styles.detailsButtonText, { color: colors.text }]}>
                        View Details
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Component ──────────────────────────────────────
export function DisputesSection() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { data, isLoading } = useWalletDisputes();
    const disputes: any[] = Array.isArray(data) ? data : (data?.disputes ?? []);

    const [respondModalOpen, setRespondModalOpen] = React.useState(false);
    const [selectedDisputeId, setSelectedDisputeId] = React.useState<string | null>(null);
    const [responseMessage, setResponseMessage] = React.useState('');

    const handleOpenRespond = (id: string) => {
        setSelectedDisputeId(id);
        setResponseMessage('');
        setRespondModalOpen(true);
    };

    const handleSubmitResponse = () => {
        if (!selectedDisputeId || !responseMessage.trim()) return;
        // TODO: call respond mutation
        setRespondModalOpen(false);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
                <ThemedText style={[styles.loadingText, { color: colors.placeholder }]}>
                    Loading disputes...
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <ThemedText style={styles.pageTitle}>Wallet Disputes</ThemedText>
                <View style={[styles.countBadge, { borderColor: colors.inputBackground }]}>
                    <ThemedText style={[styles.countText, { color: colors.placeholder }]}>
                        {disputes.length} Total
                    </ThemedText>
                </View>
            </View>

            {/* Dispute cards */}
            {disputes.length === 0 ? (
                <View style={[styles.emptyCard, { borderColor: colors.border }]}>
                    <Ionicons name="alert-circle-outline" size={40} color={colors.border} />
                    <ThemedText style={[styles.emptyText, { color: colors.placeholder }]}>
                        No disputes found.
                    </ThemedText>
                    <ThemedText style={[styles.emptySubText, { color: colors.placeholder }]}>
                        Disputes will appear here if patients report issues with their orders.
                    </ThemedText>
                </View>
            ) : (
                disputes.map((d) => (
                    <DisputeCard
                        key={d.id}
                        dispute={d}
                        colors={colors}
                        onRespond={handleOpenRespond}
                    />
                ))
            )}

            {/* Respond Modal */}
            <Modal
                visible={respondModalOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setRespondModalOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <ThemedText style={styles.modalTitle}>Respond to Dispute</ThemedText>
                        <ThemedText style={[styles.modalDesc, { color: colors.placeholder }]}>
                            Provide a detailed explanation or evidence to resolve this dispute.
                        </ThemedText>
                        <TextInput
                            style={[styles.textarea, {
                                backgroundColor: colors.inputBackground,
                                color: colors.text,
                                borderColor: colors.border,
                            }]}
                            placeholder="Type your response here..."
                            placeholderTextColor={colors.placeholder}
                            value={responseMessage}
                            onChangeText={setResponseMessage}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                                onPress={() => setRespondModalOpen(false)}
                            >
                                <ThemedText style={{ color: colors.text }}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sendBtn,
                                    { backgroundColor: responseMessage.trim() ? colors.primary : colors.inputBackground },
                                ]}
                                onPress={handleSubmitResponse}
                                disabled={!responseMessage.trim()}
                            >
                                <ThemedText style={[
                                    styles.sendBtnText,
                                    { color: responseMessage.trim() ? '#FFFFFF' : colors.placeholder },
                                ]}>
                                    Send Response
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 24,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    countBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    countText: {
        fontSize: 12,
        fontWeight: '500',
    },
    // Dispute card
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        gap: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardHeaderLeft: {
        flex: 1,
        gap: 4,
    },
    txIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    txId: {
        fontSize: 15,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    dateText: {
        fontSize: 12,
    },
    cardHeaderRight: {
        alignItems: 'flex-end',
        gap: 2,
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
    },
    reasonText: {
        fontSize: 11,
    },
    descriptionBox: {
        borderRadius: 10,
        padding: 12,
    },
    descriptionText: {
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    responseBox: {
        borderTopWidth: 1,
        paddingTop: 12,
        gap: 6,
        borderStyle: 'dashed',
    },
    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    responseLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    responseText: {
        fontSize: 13,
        lineHeight: 20,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'flex-end',
    },
    respondButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    respondButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    detailsButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    detailsButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
    // Empty state
    emptyCard: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 14,
        padding: 40,
        alignItems: 'center',
        gap: 8,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 13,
        textAlign: 'center',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        gap: 14,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalDesc: {
        fontSize: 13,
        lineHeight: 20,
    },
    textarea: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        minHeight: 120,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    sendBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    sendBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
