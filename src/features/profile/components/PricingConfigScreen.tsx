import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePricing, useSetPricing, useDeletePricing, useProfile } from '@/features/authentication/hooks/useAuth';
import { CURRENCY_SYMBOLS } from '@/shared/constants/currency';
import type { PricingItem } from '@/features/authentication/types';

// Fallback currency options if no location-based currency is set
const CURRENCY_OPTIONS = [
    { value: 'NGN', label: 'NGN', symbol: '₦' },
    { value: 'USD', label: 'USD', symbol: '$' },
];

export function PricingConfigScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { data: profile } = useProfile();
    const { data: pricing = [], isLoading, refetch, isRefetching } = usePricing();
    const setPricing = useSetPricing();
    const deletePricing = useDeletePricing();

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<PricingItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Form state
    const [feeType, setFeeType] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('NGN');

    // Use the pharmacy's default currency (set based on location during registration)
    const lockedCurrency = profile?.pharmacy?.defaultCurrency ?? null;

    const resetForm = () => {
        setFeeType('');
        setPrice('');
        setCurrency(lockedCurrency || 'NGN');
        setEditingItem(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsAddModalVisible(true);
    };

    const openEditModal = (item: PricingItem) => {
        setEditingItem(item);
        setFeeType(item.feeType);
        setPrice(item.price.toString());
        setCurrency(item.currency);
        setIsAddModalVisible(true);
    };

    const handleSave = async () => {
        if (!feeType.trim()) {
            Alert.alert('Error', 'Fee type is required');
            return;
        }

        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue < 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        try {
            await setPricing.mutateAsync({
                feeType: feeType.trim(),
                price: priceValue,
                currency: lockedCurrency || currency,
            });
            Alert.alert('Success', editingItem ? 'Pricing updated successfully' : 'Pricing added successfully');
            setIsAddModalVisible(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to save pricing. Please try again.');
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await deletePricing.mutateAsync(itemToDelete);
            Alert.alert('Success', 'Pricing deleted successfully');
            setItemToDelete(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to delete pricing. Please try again.');
            setItemToDelete(null);
        }
    };

    const renderPricingItem = ({ item }: { item: PricingItem }) => (
        <View style={[styles.pricingCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.pricingInfo}>
                <ThemedText style={styles.feeType}>{item.feeType}</ThemedText>
                <ThemedText style={[styles.priceValue, { color: colors.primary }]}>
                    {CURRENCY_SYMBOLS[item.currency] || item.currency} {item.price.toLocaleString()}
                </ThemedText>
            </View>
            <View style={styles.pricingActions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
                    onPress={() => openEditModal(item)}
                >
                    <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => setItemToDelete(item.feeType)}
                    disabled={deletePricing.isPending && itemToDelete === item.feeType}
                >
                    {deletePricing.isPending && itemToDelete === item.feeType ? (
                        <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={64} color={colors.placeholder} />
            <ThemedText style={styles.emptyTitle}>No pricing configured</ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                Add your first pricing item to get started.
            </ThemedText>
            <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={openAddModal}
            >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <ThemedText style={styles.emptyButtonText}>Add Pricing</ThemedText>
            </TouchableOpacity>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Pricing Configuration</ThemedText>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={openAddModal}
                >
                    <Ionicons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Locked Currency Notice */}
            {lockedCurrency && (
                <View style={[styles.currencyNotice, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
                    <Ionicons name="lock-closed" size={16} color={colors.primary} />
                    <ThemedText style={[styles.currencyNoticeText, { color: colors.primary }]}>
                        Currency set to {lockedCurrency} ({CURRENCY_SYMBOLS[lockedCurrency]}) based on your location
                    </ThemedText>
                </View>
            )}

            {/* Pricing List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={[styles.loadingText, { color: colors.placeholder }]}>
                        Loading pricing...
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={pricing}
                    renderItem={renderPricingItem}
                    keyExtractor={(item) => item.id || item.feeType}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={() => refetch()}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}

            {/* Add/Edit Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => {
                    setIsAddModalVisible(false);
                    resetForm();
                }}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>
                                {editingItem ? 'Edit Pricing' : 'Add New Pricing'}
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsAddModalVisible(false);
                                    resetForm();
                                }}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Fee Type</ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.inputBackground, color: colors.text },
                                    editingItem && { opacity: 0.6 },
                                ]}
                                value={feeType}
                                onChangeText={setFeeType}
                                placeholder="e.g. markup, delivery, base_service"
                                placeholderTextColor={colors.placeholder}
                                editable={!editingItem}
                            />
                            {editingItem && (
                                <ThemedText style={[styles.fieldHint, { color: colors.placeholder }]}>
                                    Fee type cannot be changed
                                </ThemedText>
                            )}
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Price / Value</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.modalField}>
                            <ThemedText style={[styles.label, { color: colors.placeholder }]}>Currency</ThemedText>
                            {lockedCurrency ? (
                                <View style={[styles.lockedCurrency, { backgroundColor: colors.inputBackground }]}>
                                    <Ionicons name="lock-closed" size={16} color={colors.placeholder} />
                                    <ThemedText style={{ color: colors.text }}>
                                        {lockedCurrency} ({CURRENCY_SYMBOLS[lockedCurrency]}) - Based on location
                                    </ThemedText>
                                </View>
                            ) : (
                                <View style={styles.currencyOptions}>
                                    {CURRENCY_OPTIONS.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.currencyOption,
                                                {
                                                    backgroundColor:
                                                        currency === option.value
                                                            ? colors.primary
                                                            : colors.inputBackground,
                                                    borderColor:
                                                        currency === option.value
                                                            ? colors.primary
                                                            : colors.border,
                                                },
                                            ]}
                                            onPress={() => setCurrency(option.value)}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.currencyOptionText,
                                                    { color: currency === option.value ? '#FFFFFF' : colors.text },
                                                ]}
                                            >
                                                {option.symbol} {option.label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.outlineButton, { borderColor: colors.border, flex: 1 }]}
                                onPress={() => {
                                    setIsAddModalVisible(false);
                                    resetForm();
                                }}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]}
                                onPress={handleSave}
                                disabled={setPricing.isPending}
                            >
                                {setPricing.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>
                                        {editingItem ? 'Update' : 'Create'}
                                    </ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={!!itemToDelete}
                animationType="fade"
                transparent
                onRequestClose={() => setItemToDelete(null)}
            >
                <View style={styles.confirmModalContainer}>
                    <View style={[styles.confirmModalContent, { backgroundColor: colors.background }]}>
                        <Ionicons name="warning-outline" size={48} color="#DC2626" />
                        <ThemedText style={styles.confirmTitle}>Delete Pricing</ThemedText>
                        <ThemedText style={[styles.confirmDescription, { color: colors.placeholder }]}>
                            Are you sure you want to delete this pricing item? This action cannot be undone.
                        </ThemedText>
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.outlineButton, { borderColor: colors.border, flex: 1 }]}
                                onPress={() => setItemToDelete(null)}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#DC2626', flex: 1 }]}
                                onPress={handleConfirmDelete}
                                disabled={deletePricing.isPending}
                            >
                                {deletePricing.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>Delete</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontWeight: '600',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencyNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    currencyNoticeText: {
        fontSize: 13,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    pricingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    pricingInfo: {
        flex: 1,
    },
    feeType: {
        fontSize: 16,
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
    },
    pricingActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
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
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
        gap: 8,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    modalField: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    fieldHint: {
        fontSize: 11,
        marginTop: 4,
    },
    lockedCurrency: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    currencyOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    currencyOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    currencyOptionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    // Confirm modal styles
    confirmModalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    confirmModalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    confirmDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
});
