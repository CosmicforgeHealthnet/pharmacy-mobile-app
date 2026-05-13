import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    usePrescriptionById,
    useStartProcessing,
    useProvideCosts,
    useMarkReady,
    useInitiateDispatch,
    useMarkDelivered,
    useCompletePrescription,
    useCancelPrescription,
    useConfirmAvailability,
} from '../hooks';
import type { PrescriptionDetail, PrescriptionMedication, FulfillmentHistoryItem, ProvideCostItem } from '../types';
import { getStatusColor, formatStatus, formatRelativeTime } from '../types';
import { useProfile } from '@/features/authentication/hooks/useAuth';

// ─── Section Header ────────────────────────────────────
function SectionHeader({ title, count, colors }: { title: string; count?: number; colors: typeof Colors.light }) {
    return (
        <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
            {count !== undefined && (
                <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                    <ThemedText style={styles.countText}>{count}</ThemedText>
                </View>
            )}
        </View>
    );
}

// ─── Info Row ────────────────────────────────────────────
function InfoRow({
    icon,
    label,
    value,
    colors,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    colors: typeof Colors.light;
}) {
    return (
        <View style={styles.infoRow}>
            <Ionicons name={icon} size={18} color={colors.placeholder} />
            <View style={styles.infoContent}>
                <ThemedText style={[styles.infoLabel, { color: colors.placeholder }]}>{label}</ThemedText>
                <ThemedText style={styles.infoValue}>{value}</ThemedText>
            </View>
        </View>
    );
}

// ─── Medication Item ────────────────────────────────────
function MedicationItem({ medication, colors }: { medication: PrescriptionMedication; colors: typeof Colors.light }) {
    return (
        <View style={[styles.medicationItem, { borderBottomColor: colors.inputBackground }]}>
            <View style={styles.medicationMain}>
                <ThemedText style={styles.medicationName}>{medication.name}</ThemedText>
                <View style={[styles.quantityBadge, { backgroundColor: `${colors.primary}15` }]}>
                    <ThemedText style={[styles.quantityText, { color: colors.primary }]}>
                        {medication.quantity}
                    </ThemedText>
                </View>
            </View>
            <ThemedText style={[styles.medicationDetails, { color: colors.placeholder }]}>
                {[medication.dosage, medication.frequency, medication.duration].filter(Boolean).join(' · ')}
            </ThemedText>
            {medication.notes && (
                <ThemedText style={[styles.medicationNotes, { color: colors.placeholder }]}>
                    Note: {medication.notes}
                </ThemedText>
            )}
        </View>
    );
}

// ─── Timeline Item ────────────────────────────────────────
function TimelineItem({
    item,
    isLast,
    colors,
}: {
    item: FulfillmentHistoryItem;
    isLast: boolean;
    colors: typeof Colors.light;
}) {
    return (
        <View style={styles.timelineItem}>
            <View style={styles.timelineDot}>
                <View
                    style={[
                        styles.dot,
                        { backgroundColor: isLast ? colors.primary : colors.inputBackground },
                    ]}
                />
                {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.inputBackground }]} />}
            </View>
            <View style={styles.timelineContent}>
                <ThemedText style={styles.timelineStatus}>{formatStatus(item.status)}</ThemedText>
                <ThemedText style={[styles.timelineDate, { color: colors.placeholder }]}>
                    {new Date(item.timestamp).toLocaleString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </ThemedText>
                {item.note && (
                    <ThemedText style={[styles.timelineNote, { color: colors.placeholder }]}>
                        {item.note}
                    </ThemedText>
                )}
            </View>
        </View>
    );
}

// ─── Cost Modal ────────────────────────────────────────────
function CostModal({
    visible,
    onClose,
    onSubmit,
    isLoading,
    colors,
    medications,
}: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (items: ProvideCostItem[], deliveryFee: number, paymentMethod: string) => void;
    isLoading: boolean;
    colors: typeof Colors.light;
    medications: PrescriptionMedication[];
}) {
    const [itemPrices, setItemPrices] = useState<Record<string, string>>({});
    const [deliveryFee, setDeliveryFee] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');

    const handleItemPriceChange = (medName: string, value: string) => {
        setItemPrices((prev) => ({ ...prev, [medName]: value }));
    };

    const handleSubmit = () => {
        const items: ProvideCostItem[] = medications.map((med) => ({
            name: med.name,
            unitPrice: Number(itemPrices[med.name]) || 0,
            quantity: med.quantity,
        }));
        onSubmit(items, Number(deliveryFee) || 0, paymentMethod);
    };

    const hasAtLeastOnePrice = Object.values(itemPrices).some((p) => Number(p) > 0);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <ThemedText style={styles.modalTitle}>Provide Cost Estimate</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollBody}>
                        <View style={styles.modalBody}>
                            <ThemedText style={[styles.inputLabel, { marginBottom: 8 }]}>
                                Medication Prices
                            </ThemedText>
                            {medications.map((med) => (
                                <View key={med.name} style={styles.inputGroup}>
                                    <ThemedText style={[styles.medPriceLabel, { color: colors.placeholder }]}>
                                        {med.name} (x{med.quantity})
                                    </ThemedText>
                                    <TextInput
                                        style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                        placeholder="Unit price"
                                        placeholderTextColor={colors.placeholder}
                                        keyboardType="numeric"
                                        value={itemPrices[med.name] || ''}
                                        onChangeText={(v) => handleItemPriceChange(med.name, v)}
                                    />
                                </View>
                            ))}

                            <View style={[styles.inputGroup, { marginTop: 16 }]}>
                                <ThemedText style={styles.inputLabel}>Delivery Fee</ThemedText>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.placeholder}
                                    keyboardType="numeric"
                                    value={deliveryFee}
                                    onChangeText={setDeliveryFee}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Payment Method</ThemedText>
                                <View style={styles.paymentMethodRow}>
                                    {['card', 'cash', 'transfer'].map((method) => (
                                        <TouchableOpacity
                                            key={method}
                                            style={[
                                                styles.paymentMethodOption,
                                                {
                                                    backgroundColor: paymentMethod === method ? colors.primary : colors.inputBackground,
                                                    borderColor: paymentMethod === method ? colors.primary : colors.inputBackground,
                                                },
                                            ]}
                                            onPress={() => setPaymentMethod(method)}
                                        >
                                            <ThemedText
                                                style={{
                                                    color: paymentMethod === method ? '#FFFFFF' : colors.text,
                                                    fontWeight: '500',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {method}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton, { borderColor: colors.inputBackground }]}
                            onPress={onClose}
                        >
                            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.primary }]}
                            onPress={handleSubmit}
                            disabled={isLoading || !hasAtLeastOnePrice}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Prescription Detail Screen ────────────────────────────
export function PrescriptionDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [showCostModal, setShowCostModal] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReadyModal, setShowReadyModal] = useState(false);
    const [dispatchNote, setDispatchNote] = useState('');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    // Fetch profile for pharmacistId
    const { data: profile } = useProfile();
    const pharmacistId = profile?.id ?? '';

    // Fetch prescription details
    const { data: prescription, isLoading, refetch } = usePrescriptionById(id);

    // Mutations
    const { mutate: startProcessing, isPending: isStarting } = useStartProcessing(id);
    const { mutate: provideCosts, isPending: isProvidingCosts } = useProvideCosts(id);
    const { mutate: markReady, isPending: isMarkingReady } = useMarkReady(id);
    const { mutate: dispatch, isPending: isDispatching } = useInitiateDispatch(id);
    const { mutate: markDelivered, isPending: isMarkingDelivered } = useMarkDelivered(id);
    const { mutate: complete, isPending: isCompleting } = useCompletePrescription(id);
    const { mutate: cancel, isPending: isCancelling } = useCancelPrescription(id);
    const { mutate: confirmAvailability, isPending: isConfirming } = useConfirmAvailability(id);

    const isAnyLoading = isStarting || isProvidingCosts || isMarkingReady || isDispatching || isMarkingDelivered || isCompleting || isCancelling || isConfirming;
    const hasDeliveryAddress = !!prescription?.deliveryAddress;

    const handleStartProcessing = () => {
        Alert.alert(
            'Start Processing',
            'Are you sure you want to start processing this prescription? This will notify the patient.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Start', onPress: () => startProcessing(pharmacistId) },
            ]
        );
    };

    const handleProvideCosts = (items: ProvideCostItem[], deliveryFee: number, paymentMethod: string) => {
        provideCosts(
            { items, deliveryFee, paymentMethod },
            {
                onSuccess: () => setShowCostModal(false),
            }
        );
    };

    const handleMarkReady = (readyType: 'delivery' | 'pickup') => {
        markReady(
            { readyType },
            {
                onSuccess: () => setShowReadyModal(false),
            }
        );
    };

    const handleDispatch = () => {
        dispatch(
            { note: dispatchNote || undefined, estimatedDelivery: estimatedDelivery || undefined },
            {
                onSuccess: () => {
                    setShowDispatchModal(false);
                    setDispatchNote('');
                    setEstimatedDelivery('');
                },
            }
        );
    };

    const handleMarkDelivered = () => {
        Alert.alert(
            'Mark as Delivered',
            'Confirm that the order has been successfully delivered to the patient.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => markDelivered() },
            ]
        );
    };

    const handleComplete = () => {
        Alert.alert(
            'Mark as Collected',
            'Confirm that the patient has collected their prescription in person.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => complete() },
            ]
        );
    };

    const handleCancelWithReason = () => {
        if (!cancelReason.trim()) return;
        cancel(cancelReason.trim(), {
            onSuccess: () => {
                setShowCancelModal(false);
                setCancelReason('');
            },
        });
    };

    const handleConfirmAvailability = () => {
        Alert.alert(
            'Confirm Availability',
            'Confirm that all medications are available.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => confirmAvailability() },
            ]
        );
    };

    // Render workflow actions based on status
    const renderWorkflowActions = () => {
        if (!prescription) return null;

        const { status } = prescription;

        switch (status) {
            case 'new':
            case 'pending':
            case 'pharmacy_assigned':
                return (
                    <>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={handleStartProcessing}
                            disabled={isAnyLoading}
                        >
                            {isStarting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
                                    <ThemedText style={styles.actionButtonText}>Start Processing</ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={handleConfirmAvailability}
                            disabled={isAnyLoading}
                        >
                            {isConfirming ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                                    <ThemedText style={styles.actionButtonText}>Confirm Availability</ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                );

            case 'under_review':
            case 'in_progress':
            case 'pharmacy_processing':
                return (
                    <>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={() => setShowCostModal(true)}
                            disabled={isAnyLoading}
                        >
                            <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
                            <ThemedText style={styles.actionButtonText}>Provide Cost Estimate</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.outlineButton, { borderColor: colors.primary }]}
                            onPress={() => setShowReadyModal(true)}
                            disabled={isAnyLoading}
                        >
                            {isMarkingReady ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <>
                                    <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                                    <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
                                        Mark as Ready
                                    </ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                );

            case 'awaiting_payment':
                return (
                    <View style={[styles.infoCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                        <Ionicons name="time-outline" size={20} color="#2563EB" />
                        <ThemedText style={[styles.infoCardText, { color: '#2563EB' }]}>
                            Awaiting patient payment before proceeding to fulfillment.
                        </ThemedText>
                    </View>
                );

            case 'ready_for_pickup':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#16A34A' }]}
                        onPress={handleComplete}
                        disabled={isAnyLoading}
                    >
                        {isCompleting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="bag-check-outline" size={20} color="#FFFFFF" />
                                <ThemedText style={styles.actionButtonText}>Mark as Collected</ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                );

            case 'ready_for_delivery':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => setShowDispatchModal(true)}
                        disabled={isAnyLoading}
                    >
                        <Ionicons name="car-outline" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.actionButtonText}>Dispatch Order</ThemedText>
                    </TouchableOpacity>
                );

            case 'out_for_delivery':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#16A34A' }]}
                        onPress={handleMarkDelivered}
                        disabled={isAnyLoading}
                    >
                        {isMarkingDelivered ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-done-circle-outline" size={20} color="#FFFFFF" />
                                <ThemedText style={styles.actionButtonText}>Mark as Delivered</ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                );

            case 'completed':
                return (
                    <View style={[styles.infoCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                        <ThemedText style={[styles.infoCardText, { color: '#16A34A' }]}>
                            This prescription has been successfully fulfilled.
                        </ThemedText>
                    </View>
                );

            case 'cancelled':
                return (
                    <View style={[styles.infoCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                        <Ionicons name="close-circle" size={20} color="#DC2626" />
                        <ThemedText style={[styles.infoCardText, { color: '#DC2626' }]}>
                            This prescription has been cancelled.
                        </ThemedText>
                    </View>
                );

            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText style={[styles.loadingText, { color: colors.placeholder }]}>
                    Loading prescription...
                </ThemedText>
            </ThemedView>
        );
    }

    if (!prescription) {
        return (
            <ThemedView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.placeholder} />
                <ThemedText style={styles.errorTitle}>Prescription not found</ThemedText>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.back()}
                >
                    <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    const statusColors = getStatusColor(prescription.status);

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <ThemedText style={styles.headerTitle}>Prescription Details</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: colors.placeholder }]}>
                        {prescription.reference || `RX-${prescription.id.slice(-6)}`}
                    </ThemedText>
                </View>
                <View
                    style={[
                        styles.headerBadge,
                        { backgroundColor: statusColors.bg, borderColor: statusColors.border },
                    ]}
                >
                    <ThemedText style={[styles.headerBadgeText, { color: statusColors.text }]}>
                        {formatStatus(prescription.status)}
                    </ThemedText>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Patient Info */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Patient Information" colors={colors} />
                    <InfoRow
                        icon="person-outline"
                        label="Patient Name"
                        value={prescription.patient?.fullName ?? 'Unknown'}
                        colors={colors}
                    />
                    {prescription.patient?.email && (
                        <InfoRow icon="mail-outline" label="Email" value={prescription.patient.email} colors={colors} />
                    )}
                    {prescription.deliveryAddress && (
                        <InfoRow
                            icon="location-outline"
                            label="Delivery Address"
                            value={prescription.deliveryAddress}
                            colors={colors}
                        />
                    )}
                </View>

                {/* Doctor Info */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Doctor Information" colors={colors} />
                    <InfoRow
                        icon="medkit-outline"
                        label="Doctor"
                        value={prescription.doctor?.fullName ? `Dr. ${prescription.doctor.fullName}` : 'Not assigned'}
                        colors={colors}
                    />
                    {prescription.doctor?.departmentSpecialty && (
                        <InfoRow
                            icon="medical-outline"
                            label="Specialty"
                            value={prescription.doctor.departmentSpecialty}
                            colors={colors}
                        />
                    )}
                    {prescription.diagnosis && (
                        <InfoRow icon="clipboard-outline" label="Diagnosis" value={prescription.diagnosis} colors={colors} />
                    )}
                </View>

                {/* Medications */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Medications" count={prescription.medications?.length ?? 0} colors={colors} />
                    {prescription.medications?.length > 0 ? (
                        prescription.medications.map((med, index) => (
                            <MedicationItem key={index} medication={med} colors={colors} />
                        ))
                    ) : (
                        <ThemedText style={[styles.emptyText, { color: colors.placeholder }]}>
                            No medications listed.
                        </ThemedText>
                    )}
                </View>

                {/* Payment Info */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Payment & Delivery" colors={colors} />
                    <View style={styles.paymentRow}>
                        <ThemedText style={[styles.paymentLabel, { color: colors.placeholder }]}>
                            Payment Status
                        </ThemedText>
                        <View
                            style={[
                                styles.paymentBadge,
                                {
                                    backgroundColor:
                                        prescription.paymentStatus === 'paid'
                                            ? '#F0FDF4'
                                            : prescription.paymentStatus === 'partial'
                                            ? '#FFFBEB'
                                            : '#FEF2F2',
                                    borderColor:
                                        prescription.paymentStatus === 'paid'
                                            ? '#BBF7D0'
                                            : prescription.paymentStatus === 'partial'
                                            ? '#FDE68A'
                                            : '#FECACA',
                                },
                            ]}
                        >
                            <ThemedText
                                style={[
                                    styles.paymentBadgeText,
                                    {
                                        color:
                                            prescription.paymentStatus === 'paid'
                                                ? '#16A34A'
                                                : prescription.paymentStatus === 'partial'
                                                ? '#D97706'
                                                : '#DC2626',
                                    },
                                ]}
                            >
                                {formatStatus(prescription.paymentStatus ?? 'unpaid')}
                            </ThemedText>
                        </View>
                    </View>
                    {prescription.deliveryFee !== undefined && (
                        <View style={styles.paymentRow}>
                            <ThemedText style={[styles.paymentLabel, { color: colors.placeholder }]}>
                                Delivery Fee
                            </ThemedText>
                            <ThemedText style={styles.paymentValue}>
                                ₦{Number(prescription.deliveryFee).toLocaleString()}
                            </ThemedText>
                        </View>
                    )}
                    {prescription.totalDue !== undefined && (
                        <View style={styles.paymentRow}>
                            <ThemedText style={[styles.paymentLabel, { color: colors.placeholder }]}>
                                Total Due
                            </ThemedText>
                            <ThemedText style={[styles.paymentValue, styles.totalDue]}>
                                ₦{Number(prescription.totalDue).toLocaleString()}
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Fulfillment History */}
                {prescription.fulfillmentHistory && prescription.fulfillmentHistory.length > 0 && (
                    <View style={[styles.card, { backgroundColor: colors.background }]}>
                        <SectionHeader title="Fulfillment History" colors={colors} />
                        {prescription.fulfillmentHistory.map((item, index) => (
                            <TimelineItem
                                key={index}
                                item={item}
                                isLast={index === prescription.fulfillmentHistory!.length - 1}
                                colors={colors}
                            />
                        ))}
                    </View>
                )}

                {/* Workflow Actions */}
                <View style={[styles.card, { backgroundColor: colors.background }]}>
                    <SectionHeader title="Actions" colors={colors} />
                    <View style={styles.actionsContainer}>{renderWorkflowActions()}</View>
                    {prescription.status !== 'completed' && prescription.status !== 'cancelled' && (
                        <TouchableOpacity
                            style={styles.cancelLink}
                            onPress={() => setShowCancelModal(true)}
                            disabled={isCancelling}
                        >
                            <ThemedText style={styles.cancelLinkText}>Cancel Prescription</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Cost Modal */}
            <CostModal
                visible={showCostModal}
                onClose={() => setShowCostModal(false)}
                onSubmit={handleProvideCosts}
                isLoading={isProvidingCosts}
                colors={colors}
                medications={prescription?.medications ?? []}
            />

            {/* Mark Ready Modal */}
            <Modal visible={showReadyModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Mark as Ready</ThemedText>
                            <TouchableOpacity onPress={() => setShowReadyModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <ThemedText style={[styles.cancelWarning, { color: colors.placeholder }]}>
                                How will the patient receive their prescription?
                            </ThemedText>
                            <View style={styles.readyTypeButtons}>
                                <TouchableOpacity
                                    style={[styles.readyTypeButton, { borderColor: colors.primary }]}
                                    onPress={() => handleMarkReady('pickup')}
                                    disabled={isMarkingReady}
                                >
                                    {isMarkingReady ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="storefront-outline" size={32} color={colors.primary} />
                                            <ThemedText style={[styles.readyTypeText, { color: colors.primary }]}>
                                                Pickup
                                            </ThemedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.readyTypeButton, { borderColor: colors.primary }]}
                                    onPress={() => handleMarkReady('delivery')}
                                    disabled={isMarkingReady}
                                >
                                    {isMarkingReady ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="car-outline" size={32} color={colors.primary} />
                                            <ThemedText style={[styles.readyTypeText, { color: colors.primary }]}>
                                                Delivery
                                            </ThemedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.inputBackground }]}
                                onPress={() => setShowReadyModal(false)}
                            >
                                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Dispatch Modal */}
            <Modal visible={showDispatchModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Dispatch Order</ThemedText>
                            <TouchableOpacity onPress={() => setShowDispatchModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Estimated Delivery (optional)</ThemedText>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    placeholder="e.g. Within 2 hours, by 5:00 PM"
                                    placeholderTextColor={colors.placeholder}
                                    value={estimatedDelivery}
                                    onChangeText={setEstimatedDelivery}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Note for driver (optional)</ThemedText>
                                <TextInput
                                    style={[styles.textInput, styles.textArea, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    placeholder="e.g. Handle with care, call patient before arriving"
                                    placeholderTextColor={colors.placeholder}
                                    value={dispatchNote}
                                    onChangeText={setDispatchNote}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.inputBackground }]}
                                onPress={() => setShowDispatchModal(false)}
                            >
                                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.primary }]}
                                onPress={handleDispatch}
                                disabled={isDispatching}
                            >
                                {isDispatching ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={styles.submitButtonText}>Confirm Dispatch</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Cancel Modal */}
            <Modal visible={showCancelModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Cancel Prescription</ThemedText>
                            <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <ThemedText style={[styles.cancelWarning, { color: colors.placeholder }]}>
                                Please provide a reason for cancellation. This action cannot be undone.
                            </ThemedText>
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Reason</ThemedText>
                                <TextInput
                                    style={[styles.textInput, styles.textArea, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    placeholder="e.g. Medication permanently out of stock"
                                    placeholderTextColor={colors.placeholder}
                                    value={cancelReason}
                                    onChangeText={setCancelReason}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.inputBackground }]}
                                onPress={() => setShowCancelModal(false)}
                            >
                                <ThemedText style={styles.cancelButtonText}>Back</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#DC2626' }]}
                                onPress={handleCancelWithReason}
                                disabled={!cancelReason.trim() || isCancelling}
                            >
                                {isCancelling ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={styles.submitButtonText}>Cancel Prescription</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

// ─── Styles ──────────────────────────────────────────
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        gap: 12,
    },
    headerBackButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    headerBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    headerBadgeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    card: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 8,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    medicationItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    medicationMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    medicationName: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    quantityBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
    },
    medicationDetails: {
        fontSize: 13,
        marginTop: 4,
    },
    medicationNotes: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    paymentLabel: {
        fontSize: 14,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    paymentBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    paymentBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    totalDue: {
        fontSize: 16,
        fontWeight: '700',
    },
    timelineItem: {
        flexDirection: 'row',
        gap: 12,
    },
    timelineDot: {
        alignItems: 'center',
        width: 14,
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginVertical: 4,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 16,
    },
    timelineStatus: {
        fontSize: 14,
        fontWeight: '500',
    },
    timelineDate: {
        fontSize: 12,
        marginTop: 2,
    },
    timelineNote: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
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
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
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
    cancelLink: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    cancelLinkText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '500',
    },
    bottomPadding: {
        height: 32,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalBody: {
        gap: 16,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    textInput: {
        height: 48,
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    cancelWarning: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    submitButton: {},
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    // Cost modal additional styles
    modalScrollBody: {
        maxHeight: 300,
    },
    medPriceLabel: {
        fontSize: 13,
        marginBottom: 4,
    },
    paymentMethodRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    paymentMethodOption: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    // Ready modal styles
    readyTypeButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    readyTypeButton: {
        flex: 1,
        paddingVertical: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    readyTypeText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
