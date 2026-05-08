import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Invoice, getInvoiceRef } from '../types';

interface InvoiceCardProps {
    invoice: Invoice;
    onPress: () => void;
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const getStatusColor = (status: Invoice['status']) => {
        switch (status) {
            case 'paid':
                return '#10B981';
            case 'awaiting_payment':
                return '#F59E0B';
            case 'sent':
                return '#3B82F6';
            case 'viewed':
                return '#8B5CF6';
            case 'overdue':
                return '#EF4444';
            case 'cancelled':
            case 'draft':
                return '#6B7280';
            default:
                return colors.placeholder;
        }
    };

    const getStatusIcon = (status: Invoice['status']): any => {
        switch (status) {
            case 'paid':
                return 'checkmark-circle';
            case 'awaiting_payment':
                return 'time';
            case 'sent':
                return 'send';
            case 'viewed':
                return 'eye';
            case 'overdue':
                return 'alert-circle';
            case 'cancelled':
                return 'close-circle';
            case 'draft':
                return 'document-text-outline';
            default:
                return 'help-circle';
        }
    };

    const statusLabel: Record<Invoice['status'], string> = {
        draft: 'Draft',
        sent: 'Sent',
        viewed: 'Viewed',
        awaiting_payment: 'Payment Due',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
    };

    const formatCurrency = (amount: number) => {
        return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isPending = invoice.status === 'awaiting_payment' || invoice.status === 'overdue';

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.background }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="receipt-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.headerInfo}>
                    <View style={styles.titleRow}>
                        <ThemedText style={styles.invoiceRef}>
                            Invoice {getInvoiceRef(invoice)}
                        </ThemedText>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(invoice.status)}15` }]}>
                            <Ionicons
                                name={getStatusIcon(invoice.status)}
                                size={12}
                                color={getStatusColor(invoice.status)}
                            />
                            <ThemedText style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
                                {statusLabel[invoice.status]}
                            </ThemedText>
                        </View>
                    </View>
                    <ThemedText style={[styles.prescriptionRef, { color: colors.placeholder }]}>
                        Prescription ref: {invoice.prescriptionRef} · {invoice.lineItems.length} {invoice.lineItems.length === 1 ? 'item' : 'items'}
                    </ThemedText>
                    <ThemedText style={[styles.dateText, { color: colors.placeholder }]}>
                        Issued {formatDate(invoice.createdAt)}
                        {invoice.dueAt && invoice.status !== 'paid' && (
                            <> · Due {formatDate(invoice.dueAt)}</>
                        )}
                        {invoice.paidAt && (
                            <> · Paid {formatDate(invoice.paidAt)}</>
                        )}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.amountSection}>
                    <ThemedText style={[styles.totalAmount, { color: colors.text }]}>
                        {formatCurrency(invoice.totalAmount)}
                    </ThemedText>
                    {isPending && (
                        <ThemedText style={[styles.payNowText, { color: '#F59E0B' }]}>
                            Pay now
                        </ThemedText>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    headerInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        flexWrap: 'wrap',
        gap: 8,
    },
    invoiceRef: {
        fontSize: 15,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    prescriptionRef: {
        fontSize: 12,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 11,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    amountSection: {
        flex: 1,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    payNowText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
