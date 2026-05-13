// CreateInvoiceModal - Modal for selecting prescriptions and creating invoices
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { formatCurrency } from '@/shared/constants/currency';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePrescriptions } from '@/features/prescriptions/hooks';
import { useCreateInvoice, useSendInvoice } from '../hooks';
import type { Prescription, PrescriptionMedication } from '@/features/prescriptions/types';

interface CreateInvoiceModalProps {
    visible: boolean;
    onClose: () => void;
}

type Step = 'select' | 'pricing' | 'review';

interface LineItem {
    name: string;
    dosage?: string;
    quantity: number;
    unitPrice: number;
}

export function CreateInvoiceModal({ visible, onClose }: CreateInvoiceModalProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // State
    const [step, setStep] = useState<Step>('select');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [deliveryFee, setDeliveryFee] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'pay_on_pickup'>('online');
    const [notes, setNotes] = useState('');

    // Fetch prescriptions ready for invoicing
    const { data: prescriptions = [], isLoading } = usePrescriptions({
        status: 'awaiting_payment',
    });

    // Mutations
    const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();
    const { mutate: sendInvoice, isPending: isSending } = useSendInvoice();

    const isSubmitting = isCreating || isSending;

    // Filter prescriptions by search
    const filteredPrescriptions = useMemo(() => {
        if (!searchQuery.trim()) return prescriptions;
        const query = searchQuery.toLowerCase();
        return prescriptions.filter(
            (p) =>
                p.reference.toLowerCase().includes(query) ||
                (p.patient?.fullName || '').toLowerCase().includes(query) ||
                p.medications.some((m) => m.name.toLowerCase().includes(query))
        );
    }, [prescriptions, searchQuery]);

    const handleSelectPrescription = useCallback((prescription: Prescription) => {
        setSelectedPrescription(prescription);
        // Initialize line items from prescription medications
        const items: LineItem[] = prescription.medications.map((med) => ({
            name: med.name,
            dosage: med.dosage,
            quantity: med.quantity || 1,
            unitPrice: 0,
        }));
        setLineItems(items);
        setStep('pricing');
    }, []);

    const updateLineItem = useCallback((index: number, field: keyof LineItem, value: string | number) => {
        setLineItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const calculateSubtotal = useCallback(() => {
        return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    }, [lineItems]);

    const calculateTotal = useCallback(() => {
        return calculateSubtotal() + (parseFloat(deliveryFee) || 0);
    }, [calculateSubtotal, deliveryFee]);

    const hasValidPricing = useMemo(() => {
        return lineItems.some((item) => item.unitPrice > 0);
    }, [lineItems]);

    const handleCreateInvoice = useCallback(() => {
        if (!selectedPrescription) return;

        const payload = {
            prescriptionId: selectedPrescription.id,
            lineItems: lineItems.map((item) => ({
                medicationName: item.name,
                dosage: item.dosage,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
            })),
            deliveryFee: parseFloat(deliveryFee) || 0,
            paymentMethod,
            notes: notes.trim() || undefined,
        };

        createInvoice(payload, {
            onSuccess: (response) => {
                const invoiceId = (response as any)?.id;
                if (invoiceId) {
                    // Send the invoice immediately
                    sendInvoice(invoiceId, {
                        onSuccess: () => {
                            Alert.alert('Success', 'Invoice created and sent to patient!');
                            handleReset();
                            onClose();
                        },
                        onError: () => {
                            Alert.alert('Invoice Created', 'Invoice created but not sent. You can send it later.');
                            handleReset();
                            onClose();
                        },
                    });
                } else {
                    Alert.alert('Success', 'Invoice created successfully!');
                    handleReset();
                    onClose();
                }
            },
            onError: () => {
                Alert.alert('Error', 'Failed to create invoice. Please try again.');
            },
        });
    }, [selectedPrescription, lineItems, deliveryFee, paymentMethod, notes, createInvoice, sendInvoice, onClose]);

    const handleReset = useCallback(() => {
        setStep('select');
        setSearchQuery('');
        setSelectedPrescription(null);
        setLineItems([]);
        setDeliveryFee('');
        setPaymentMethod('online');
        setNotes('');
    }, []);

    const handleClose = useCallback(() => {
        handleReset();
        onClose();
    }, [handleReset, onClose]);

    const renderSelectStep = () => (
        <>
            <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Select Prescription</ThemedText>
                <TouchableOpacity onPress={handleClose}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="search-outline" size={20} color={colors.placeholder} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search by patient, reference, or medication..."
                    placeholderTextColor={colors.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                    </TouchableOpacity>
                )}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : filteredPrescriptions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={48} color={colors.placeholder} />
                    <ThemedText style={[styles.emptyText, { color: colors.placeholder }]}>
                        {searchQuery
                            ? 'No prescriptions match your search'
                            : 'No prescriptions ready for invoicing'}
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredPrescriptions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.prescriptionCard, { backgroundColor: colors.background, borderColor: colors.inputBackground }]}
                            onPress={() => handleSelectPrescription(item)}
                        >
                            <View style={styles.prescriptionHeader}>
                                <View style={[styles.refBadge, { backgroundColor: `${colors.primary}15` }]}>
                                    <ThemedText style={[styles.refText, { color: colors.primary }]}>
                                        {item.reference}
                                    </ThemedText>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
                            </View>
                            <ThemedText style={styles.patientName}>
                                {item.patient?.fullName || 'Unknown Patient'}
                            </ThemedText>
                            <ThemedText style={[styles.medsSummary, { color: colors.placeholder }]}>
                                {item.medications.slice(0, 2).map((m) => m.name).join(', ')}
                                {item.medications.length > 2 && ` +${item.medications.length - 2} more`}
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                />
            )}
        </>
    );

    const renderPricingStep = () => (
        <>
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setStep('select')} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Set Prices</ThemedText>
                <TouchableOpacity onPress={handleClose}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ThemedText style={[styles.sectionLabel, { color: colors.placeholder }]}>
                    MEDICATIONS
                </ThemedText>
                {lineItems.map((item, index) => (
                    <View key={index} style={[styles.lineItemCard, { backgroundColor: colors.background, borderColor: colors.inputBackground }]}>
                        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                        {item.dosage && (
                            <ThemedText style={[styles.itemDosage, { color: colors.placeholder }]}>
                                {item.dosage}
                            </ThemedText>
                        )}
                        <View style={styles.priceRow}>
                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.inputLabel, { color: colors.placeholder }]}>Qty</ThemedText>
                                <TextInput
                                    style={[styles.smallInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    keyboardType="number-pad"
                                    value={String(item.quantity)}
                                    onChangeText={(v) => updateLineItem(index, 'quantity', parseInt(v) || 0)}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <ThemedText style={[styles.inputLabel, { color: colors.placeholder }]}>Unit Price (₦)</ThemedText>
                                <TextInput
                                    style={[styles.priceInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    keyboardType="decimal-pad"
                                    placeholder="0.00"
                                    placeholderTextColor={colors.placeholder}
                                    value={item.unitPrice ? String(item.unitPrice) : ''}
                                    onChangeText={(v) => updateLineItem(index, 'unitPrice', parseFloat(v) || 0)}
                                />
                            </View>
                            <View style={styles.subtotalContainer}>
                                <ThemedText style={[styles.inputLabel, { color: colors.placeholder }]}>Subtotal</ThemedText>
                                <ThemedText style={styles.subtotalValue}>
                                    {formatCurrency(item.quantity * item.unitPrice)}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                ))}

                <ThemedText style={[styles.sectionLabel, { color: colors.placeholder, marginTop: 20 }]}>
                    DELIVERY FEE
                </ThemedText>
                <TextInput
                    style={[styles.fullInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.placeholder}
                    value={deliveryFee}
                    onChangeText={setDeliveryFee}
                />

                <ThemedText style={[styles.sectionLabel, { color: colors.placeholder, marginTop: 20 }]}>
                    PAYMENT METHOD
                </ThemedText>
                <View style={styles.paymentOptions}>
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            { borderColor: paymentMethod === 'online' ? colors.primary : colors.inputBackground },
                            paymentMethod === 'online' && { backgroundColor: `${colors.primary}10` },
                        ]}
                        onPress={() => setPaymentMethod('online')}
                    >
                        <Ionicons name="card-outline" size={20} color={paymentMethod === 'online' ? colors.primary : colors.text} />
                        <ThemedText style={[styles.paymentText, paymentMethod === 'online' && { color: colors.primary }]}>
                            Online Payment
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            { borderColor: paymentMethod === 'pay_on_pickup' ? colors.primary : colors.inputBackground },
                            paymentMethod === 'pay_on_pickup' && { backgroundColor: `${colors.primary}10` },
                        ]}
                        onPress={() => setPaymentMethod('pay_on_pickup')}
                    >
                        <Ionicons name="storefront-outline" size={20} color={paymentMethod === 'pay_on_pickup' ? colors.primary : colors.text} />
                        <ThemedText style={[styles.paymentText, paymentMethod === 'pay_on_pickup' && { color: colors.primary }]}>
                            Pay on Pickup
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedText style={[styles.sectionLabel, { color: colors.placeholder, marginTop: 20 }]}>
                    NOTES (OPTIONAL)
                </ThemedText>
                <TextInput
                    style={[styles.notesInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                    placeholder="Add notes for the patient..."
                    placeholderTextColor={colors.placeholder}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                />

                {/* Totals */}
                <View style={[styles.totalsCard, { backgroundColor: colors.inputBackground }]}>
                    <View style={styles.totalRow}>
                        <ThemedText style={[styles.totalLabel, { color: colors.placeholder }]}>Subtotal</ThemedText>
                        <ThemedText style={styles.totalValue}>{formatCurrency(calculateSubtotal())}</ThemedText>
                    </View>
                    <View style={styles.totalRow}>
                        <ThemedText style={[styles.totalLabel, { color: colors.placeholder }]}>Delivery Fee</ThemedText>
                        <ThemedText style={styles.totalValue}>{formatCurrency(parseFloat(deliveryFee) || 0)}</ThemedText>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                        <ThemedText style={styles.grandTotalLabel}>Total</ThemedText>
                        <ThemedText style={[styles.grandTotalValue, { color: colors.primary }]}>
                            {formatCurrency(calculateTotal())}
                        </ThemedText>
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.primary }, !hasValidPricing && styles.disabledButton]}
                    onPress={handleCreateInvoice}
                    disabled={!hasValidPricing || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="send-outline" size={20} color="#FFFFFF" />
                            <ThemedText style={styles.createButtonText}>Create & Send Invoice</ThemedText>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <ThemedView style={styles.container}>
                {step === 'select' && renderSelectStep()}
                {step === 'pricing' && renderPricingStep()}
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        padding: 4,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    prescriptionCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    prescriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    refBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    refText: {
        fontSize: 12,
        fontWeight: '600',
    },
    patientName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    medsSummary: {
        fontSize: 13,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginTop: 16,
        marginBottom: 8,
    },
    lineItemCard: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 10,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
    },
    itemDosage: {
        fontSize: 12,
        marginTop: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 12,
        gap: 12,
    },
    inputGroup: {
        gap: 4,
    },
    inputLabel: {
        fontSize: 11,
    },
    smallInput: {
        width: 60,
        height: 40,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 14,
        textAlign: 'center',
    },
    priceInput: {
        height: 40,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    subtotalContainer: {
        alignItems: 'flex-end',
        gap: 4,
    },
    subtotalValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    fullInput: {
        height: 48,
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    paymentOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    paymentOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 2,
        gap: 8,
    },
    paymentText: {
        fontSize: 13,
        fontWeight: '500',
    },
    notesInput: {
        height: 80,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingTop: 12,
        fontSize: 14,
        textAlignVertical: 'top',
    },
    totalsCard: {
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    totalLabel: {
        fontSize: 14,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    grandTotalRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    grandTotalValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
