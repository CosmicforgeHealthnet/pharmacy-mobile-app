import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useInvoiceById, useSendInvoice, useMarkInvoicePaid, useCancelInvoice } from '../hooks';
import type { Invoice, InvoiceStatus } from '../types';
import { formatCurrency, formatInvoiceStatus, getInvoiceStatusColor, getInvoiceRef } from '../types';

export function InvoiceDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // Fetch invoice from API
    const { data: invoice, isLoading, refetch } = useInvoiceById(id);

    // Mutations
    const { mutate: sendInvoice, isPending: isSending } = useSendInvoice();
    const { mutate: markPaid, isPending: isMarkingPaid } = useMarkInvoicePaid();
    const { mutate: cancelInvoice, isPending: isCancelling } = useCancelInvoice();

    const isAnyLoading = isSending || isMarkingPaid || isCancelling;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: InvoiceStatus) => {
        const statusColors = getInvoiceStatusColor(status);
        return statusColors.text;
    };

    const handleSendInvoice = () => {
        Alert.alert(
            'Send Invoice',
            'Send this invoice to the patient?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: () => sendInvoice(id),
                },
            ]
        );
    };

    const handleMarkPaid = () => {
        Alert.alert(
            'Mark as Paid',
            'Confirm that this invoice has been paid?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => markPaid(id),
                },
            ]
        );
    };

    const handleCancelInvoice = () => {
        Alert.alert(
            'Cancel Invoice',
            'Are you sure you want to cancel this invoice? This action cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => cancelInvoice(id),
                },
            ]
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText style={[styles.loadingText, { color: colors.placeholder }]}>
                    Loading invoice...
                </ThemedText>
            </ThemedView>
        );
    }

    // Error state
    if (!invoice) {
        return (
            <ThemedView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.placeholder} />
                <ThemedText style={styles.errorTitle}>Invoice not found</ThemedText>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.back()}
                >
                    <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    const statusColors = getInvoiceStatusColor(invoice.status);
    const isPending = invoice.status === 'awaiting_payment' || invoice.status === 'overdue';
    const canSend = invoice.status === 'draft';
    const canMarkPaid = invoice.status === 'sent' || invoice.status === 'awaiting_payment';
    const canCancel = invoice.status !== 'paid' && invoice.status !== 'cancelled';

    const prescriptionSteps = [
        { label: 'Prescription received', done: true },
        { label: 'Pharmacy reviewing', done: true },
        { label: 'Invoice sent', done: invoice.status !== 'draft' },
        { label: 'Payment confirmed', done: invoice.status === 'paid', active: isPending },
        { label: 'Medication being prepared', done: false },
        { label: 'Ready / Out for delivery', done: false },
    ];

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    <ThemedText style={[styles.headerBackText, { color: colors.primary }]}>Back</ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Invoice Header Card */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <View style={styles.invoiceHeaderRow}>
                        <View style={styles.invoiceHeaderInfo}>
                            <View style={styles.titleRow}>
                                <ThemedText style={styles.invoiceTitle}>
                                    Invoice {getInvoiceRef(invoice)}
                                </ThemedText>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: statusColors.bg, borderColor: statusColors.border },
                                    ]}
                                >
                                    <ThemedText style={[styles.statusText, { color: statusColors.text }]}>
                                        {formatInvoiceStatus(invoice.status)}
                                    </ThemedText>
                                </View>
                            </View>
                            <ThemedText style={[styles.prescriptionRef, { color: colors.placeholder }]}>
                                Prescription:{' '}
                                <ThemedText style={[styles.prescriptionRefValue, { color: colors.text }]}>
                                    {invoice.prescriptionRef}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText style={[styles.patientName, { color: colors.placeholder }]}>
                                Patient:{' '}
                                <ThemedText style={[styles.patientNameValue, { color: colors.text }]}>
                                    {invoice.patientName || invoice.patientEmail || 'Unknown'}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText style={[styles.dateText, { color: colors.placeholder }]}>
                                Issued {formatDate(invoice.createdAt)}
                                {invoice.dueAt && <> · Due {formatDate(invoice.dueAt)}</>}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Status Alert */}
                {invoice.status === 'overdue' && (
                    <View style={[styles.alert, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                        <Ionicons name="alert-circle" size={16} color="#EF4444" />
                        <ThemedText style={[styles.alertText, { color: '#991B1B' }]}>
                            This invoice is overdue. Follow up with the patient to collect payment.
                        </ThemedText>
                    </View>
                )}

                {invoice.status === 'awaiting_payment' && (
                    <View style={[styles.alert, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                        <Ionicons name="time" size={16} color="#D97706" />
                        <ThemedText style={[styles.alertText, { color: '#92400E' }]}>
                            Awaiting payment from patient before medication dispatch.
                        </ThemedText>
                    </View>
                )}

                {invoice.status === 'paid' && (
                    <View style={[styles.alert, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                        <ThemedText style={[styles.alertText, { color: '#166534' }]}>
                            Payment received. Proceed with preparing the medication.
                        </ThemedText>
                    </View>
                )}

                {/* Medications Card */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="medkit-outline" size={16} color={colors.placeholder} />
                        <ThemedText style={styles.sectionTitle}>Medications</ThemedText>
                        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                            <ThemedText style={styles.countText}>{invoice.lineItems.length}</ThemedText>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    {invoice.lineItems.map((item, index) => (
                        <View key={item.id}>
                            <View style={styles.medicationItem}>
                                <View style={styles.medicationInfo}>
                                    <ThemedText style={styles.medicationName}>{item.medicationName}</ThemedText>
                                    {item.dosage && (
                                        <ThemedText style={[styles.medicationDosage, { color: colors.placeholder }]}>
                                            Dosage: {item.dosage}
                                        </ThemedText>
                                    )}
                                </View>
                                <View style={styles.medicationPricing}>
                                    <ThemedText style={[styles.medicationQuantity, { color: colors.text }]}>
                                        {item.quantity} × {formatCurrency(item.unitPrice)}
                                    </ThemedText>
                                    <ThemedText style={styles.medicationSubtotal}>
                                        {formatCurrency(item.subtotal)}
                                    </ThemedText>
                                </View>
                            </View>
                            {index < invoice.lineItems.length - 1 && <View style={styles.itemDivider} />}
                        </View>
                    ))}

                    {/* Totals */}
                    <View style={styles.divider} />
                    <View style={styles.totalsSection}>
                        <View style={styles.totalRow}>
                            <ThemedText style={[styles.totalLabel, { color: colors.placeholder }]}>
                                Subtotal
                            </ThemedText>
                            <ThemedText style={[styles.totalValue, { color: colors.text }]}>
                                {formatCurrency(invoice.subtotal)}
                            </ThemedText>
                        </View>
                        <View style={styles.totalRow}>
                            <ThemedText style={[styles.totalLabel, { color: colors.placeholder }]}>
                                Delivery fee
                            </ThemedText>
                            <ThemedText style={[styles.totalValue, { color: colors.text }]}>
                                {formatCurrency(invoice.deliveryFee)}
                            </ThemedText>
                        </View>
                        <View style={[styles.totalRow, styles.finalTotal]}>
                            <ThemedText style={styles.finalTotalLabel}>Total</ThemedText>
                            <ThemedText style={[styles.finalTotalValue, { color: colors.primary }]}>
                                {formatCurrency(invoice.totalAmount)}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Pharmacy Notes */}
                {invoice.notes && (
                    <View style={[styles.card, { backgroundColor: colors.background }]}>
                        <ThemedText style={[styles.notesLabel, { color: colors.placeholder }]}>
                            PHARMACY NOTES
                        </ThemedText>
                        <ThemedText style={[styles.notesText, { color: colors.text }]}>
                            {invoice.notes}
                        </ThemedText>
                    </View>
                )}

                {/* Payment Method */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <ThemedText style={[styles.notesLabel, { color: colors.placeholder }]}>
                        PAYMENT METHOD
                    </ThemedText>
                    <View style={styles.paymentMethodRow}>
                        <Ionicons name="card-outline" size={16} color={colors.placeholder} />
                        <ThemedText style={[styles.paymentMethodText, { color: colors.text }]}>
                            {invoice.paymentMethod === 'online' ? 'Online Payment' : 'Pay on Pickup'}
                        </ThemedText>
                    </View>
                </View>

                {/* Prescription Status */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text-outline" size={16} color={colors.placeholder} />
                        <ThemedText style={[styles.notesLabel, { color: colors.placeholder }]}>
                            PRESCRIPTION STATUS
                        </ThemedText>
                    </View>
                    <View style={styles.stepsContainer}>
                        {prescriptionSteps.map((step, index) => (
                            <View key={index} style={styles.stepRow}>
                                <View
                                    style={[
                                        styles.stepDot,
                                        {
                                            backgroundColor: step.done
                                                ? colors.primary
                                                : step.active
                                                ? '#FEF3C7'
                                                : colors.inputBackground,
                                            borderColor: step.done
                                                ? colors.primary
                                                : step.active
                                                ? '#F59E0B'
                                                : '#E5E7EB',
                                        },
                                    ]}
                                >
                                    {step.done && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                                </View>
                                <ThemedText
                                    style={[
                                        styles.stepLabel,
                                        {
                                            color: step.done ? colors.text : step.active ? '#D97706' : colors.placeholder,
                                            fontWeight: step.done || step.active ? '600' : '400',
                                        },
                                    ]}
                                >
                                    {step.label}
                                    {step.active && ' (Awaiting payment)'}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Actions */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <ThemedText style={[styles.notesLabel, { color: colors.placeholder }]}>
                        ACTIONS
                    </ThemedText>
                    <View style={styles.actionsContainer}>
                        {canSend && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                onPress={handleSendInvoice}
                                disabled={isAnyLoading}
                            >
                                {isSending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                                        <ThemedText style={styles.actionButtonText}>Send to Patient</ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {canMarkPaid && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#16A34A' }]}
                                onPress={handleMarkPaid}
                                disabled={isAnyLoading}
                            >
                                {isMarkingPaid ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                                        <ThemedText style={styles.actionButtonText}>Mark as Paid</ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {canCancel && (
                            <TouchableOpacity
                                style={styles.cancelLink}
                                onPress={handleCancelInvoice}
                                disabled={isAnyLoading}
                            >
                                {isCancelling ? (
                                    <ActivityIndicator size="small" color="#DC2626" />
                                ) : (
                                    <ThemedText style={styles.cancelLinkText}>Cancel Invoice</ThemedText>
                                )}
                            </TouchableOpacity>
                        )}

                        {invoice.status === 'cancelled' && (
                            <View style={[styles.infoCard, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
                                <Ionicons name="close-circle" size={18} color="#6B7280" />
                                <ThemedText style={[styles.infoCardText, { color: '#6B7280' }]}>
                                    This invoice has been cancelled.
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 16,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    header: {
        paddingHorizontal: 12,
        paddingTop: 60,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerBackText: {
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    card: {
        margin: 16,
        marginBottom: 0,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    invoiceHeaderRow: {
        gap: 12,
    },
    invoiceHeaderInfo: {
        gap: 6,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    invoiceTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    prescriptionRef: {
        fontSize: 14,
    },
    prescriptionRefValue: {
        fontWeight: '600',
    },
    patientName: {
        fontSize: 14,
    },
    patientNameValue: {
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
    },
    alert: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    alertText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    medicationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    medicationInfo: {
        flex: 1,
    },
    medicationName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    medicationDosage: {
        fontSize: 12,
    },
    medicationPricing: {
        alignItems: 'flex-end',
    },
    medicationQuantity: {
        fontSize: 13,
        marginBottom: 2,
    },
    medicationSubtotal: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#F9FAFB',
        marginVertical: 4,
    },
    totalsSection: {
        gap: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
    },
    totalValue: {
        fontSize: 14,
    },
    finalTotal: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    finalTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    finalTotalValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    notesLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    notesText: {
        fontSize: 14,
        lineHeight: 20,
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paymentMethodText: {
        fontSize: 14,
    },
    stepsContainer: {
        gap: 12,
        marginTop: 12,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stepDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepLabel: {
        flex: 1,
        fontSize: 12,
    },
    actionsContainer: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    cancelLink: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelLinkText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '500',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        gap: 10,
    },
    infoCardText: {
        flex: 1,
        fontSize: 14,
    },
});
