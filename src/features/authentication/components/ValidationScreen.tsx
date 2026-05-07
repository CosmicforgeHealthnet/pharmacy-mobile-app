import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Button } from '@/shared/components/ui/Button';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppSnackbar } from '@/shared/components/ui/Snackbar';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadDocuments } from '../hooks';
import type { DocumentFile } from '../types';

export function ValidationScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [pharmacyLicense, setPharmacyLicense] = useState<DocumentFile | null>(null);
    const [governmentId, setGovernmentId] = useState<DocumentFile | null>(null);
    const [apiError, setApiError] = useState('');

    const [snackVisible, setSnackVisible] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    const { mutateAsync: uploadDocuments, isPending: isUploading } = useUploadDocuments();

    const showSnack = (message: string) => {
        setSnackMessage(message);
        setSnackVisible(true);
    };

    const pickDocument = async (setFile: React.Dispatch<React.SetStateAction<DocumentFile | null>>) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png'],
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                
                // Validate size (5MB)
                if (asset.size && asset.size > 5 * 1024 * 1024) {
                    setApiError('File must be under 5MB.');
                    return;
                }

                setFile({
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType ?? 'application/octet-stream',
                    size: asset.size,
                });
                setApiError('');
            }
        } catch (err) {
            console.error('Document picker error:', err);
            setApiError('Failed to pick document.');
        }
    };

    const handleSubmit = async () => {
        if (!pharmacyLicense || !governmentId) {
            setApiError('Please select both documents before uploading.');
            return;
        }

        setApiError('');

        try {
            await uploadDocuments({
                files: [pharmacyLicense, governmentId],
                documentTypes: ['pharmacy_license', 'government_id'],
                documentNames: ['Pharmacy License Document', 'Government ID of Account Owner'],
            });

            showSnack('Documents uploaded successfully!');
            
            // Navigate to tabs/home after successful upload
            setTimeout(() => {
                router.replace('/(tabs)' as any);
            }, 1500);
        } catch (error: any) {
            console.error('Upload failed:', error);
            const errorMessage = error?.message || 'Failed to upload documents. Please try again.';
            setApiError(errorMessage);
        }
    };

    const isFormValid = !!pharmacyLicense && !!governmentId;

    return (
        <ThemedView style={styles.root}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back */}
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Heading */}
                    <ThemedText type="title" style={styles.heading}>
                        Verify Pharmacy
                    </ThemedText>
                    <ThemedText style={styles.subheading}>
                        Please upload required documents to complete your verification.
                    </ThemedText>

                    {/* API Error */}
                    {apiError ? (
                        <View style={styles.apiErrorContainer}>
                            <ThemedText style={styles.apiErrorText}>{apiError}</ThemedText>
                        </View>
                    ) : null}

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color={colors.primary} />
                        <ThemedText style={styles.infoText}>
                            Each document will be processed separately and verified by our team.
                        </ThemedText>
                    </View>

                    <View style={styles.form}>
                        <ThemedText style={styles.sectionLabel}>
                            1. Pharmacy License Document
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.uploadBox, { borderColor: pharmacyLicense ? colors.primary : '#E5E7EB' }]}
                            onPress={() => pickDocument(setPharmacyLicense)}
                            disabled={isUploading}
                        >
                            <Ionicons 
                                name={pharmacyLicense ? "document-text" : "cloud-upload-outline"} 
                                size={32} 
                                color={pharmacyLicense ? colors.primary : colors.placeholder} 
                            />
                            <ThemedText style={[styles.uploadText, { color: pharmacyLicense ? colors.primary : colors.placeholder }]}>
                                {pharmacyLicense ? pharmacyLicense.name : 'Tap to select PDF, JPEG, or PNG'}
                            </ThemedText>
                        </TouchableOpacity>

                        <ThemedText style={[styles.sectionLabel, { marginTop: 20 }]}>
                            2. Government ID of Account Owner
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.uploadBox, { borderColor: governmentId ? colors.primary : '#E5E7EB' }]}
                            onPress={() => pickDocument(setGovernmentId)}
                            disabled={isUploading}
                        >
                            <Ionicons 
                                name={governmentId ? "document-text" : "cloud-upload-outline"} 
                                size={32} 
                                color={governmentId ? colors.primary : colors.placeholder} 
                            />
                            <ThemedText style={[styles.uploadText, { color: governmentId ? colors.primary : colors.placeholder }]}>
                                {governmentId ? governmentId.name : 'Tap to select PDF, JPEG, or PNG'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.spacer} />

                    {/* Submit */}
                    <Button
                        title={isFormValid ? "Upload Documents" : "Select Both Documents"}
                        onPress={handleSubmit}
                        variant="primary"
                        size="large"
                        loading={isUploading}
                        disabled={!isFormValid || isUploading}
                    />

                </ScrollView>
            </KeyboardAvoidingView>

            <AppSnackbar
                visible={snackVisible}
                message={snackMessage}
                onDismiss={() => setSnackVisible(false)}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 32,
    },
    backButton: { marginBottom: 16, alignSelf: 'flex-start' },
    heading: { marginBottom: 4 },
    subheading: { fontSize: 14, marginBottom: 24 },
    apiErrorContainer: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    apiErrorText: {
        color: '#DC2626',
        fontSize: 13,
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 13,
        color: '#1E40AF',
        marginLeft: 8,
        flex: 1,
    },
    form: { gap: 8 },
    sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    uploadBox: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    spacer: { minHeight: 32 },
});
