import { router } from 'expo-router';
import { storage } from '@/core/storage';
import type { Pharmacy } from '../types';

/**
 * Handles routing after successful login based on pharmacy verification status
 */
export const handlePostLoginFlow = async (
    pharmacy: Pharmacy,
    showToast?: (type: 'success' | 'info' | 'error', title: string, message: string) => void
): Promise<void> => {
    try {
        console.log('>>> EXECUTING POST-LOGIN FLOW FOR PHARMACY:', pharmacy.id, '<<<');

        // Check verification status
        const isFullyVerified = pharmacy.verificationStatus === 'approved' && pharmacy.isActive;
        const isPendingDocuments = pharmacy.verificationStatus === 'pending_documents' || !pharmacy.documentsSubmitted;
        const isPendingVerification = pharmacy.verificationStatus === 'pending';

        // Store verification status for app state
        await storage.setNeedsVerification(!isFullyVerified);

        // Route based on status
        if (isPendingDocuments) {
            console.log('>>> ROUTING TO DOCUMENTS: Documents not submitted <<<');
            showToast?.('info', 'Documents Required', 'Please submit your pharmacy documents to continue.');
            router.replace('/(auth)/validation');
            return;
        }

        if (isPendingVerification) {
            console.log('>>> ROUTING TO DASHBOARD: Pending verification <<<');
            showToast?.('info', 'Verification Pending', 'Your pharmacy is under review. You can still access the dashboard.');
            router.replace('/(tabs)');
            return;
        }

        if (!isFullyVerified) {
            console.log('>>> ROUTING TO DASHBOARD: Not fully verified <<<');
            showToast?.('info', 'Welcome', 'Your account is being processed.');
            router.replace('/(tabs)');
            return;
        }

        // Fully verified - go to dashboard
        console.log('>>> ROUTING TO DASHBOARD: Fully verified <<<');
        showToast?.('success', 'Welcome back!', `Hello ${pharmacy.pharmacyName}!`);
        router.replace('/(tabs)');

    } catch (error) {
        console.error('!!! ERROR IN POST-LOGIN FLOW !!!', error);
        // Fallback to dashboard
        router.replace('/(tabs)');
    }
};

/**
 * Handles routing after successful registration
 */
export const handlePostRegisterFlow = async (
    pharmacy: Pharmacy,
    showToast?: (type: 'success' | 'info' | 'error', title: string, message: string) => void
): Promise<void> => {
    try {
        console.log('>>> EXECUTING POST-REGISTER FLOW FOR PHARMACY:', pharmacy.id, '<<<');

        showToast?.('success', 'Registration Successful!', 'Please check your email to verify your account.');

        // After registration, go to login
        router.replace('/(auth)/login');

    } catch (error) {
        console.error('!!! ERROR IN POST-REGISTER FLOW !!!', error);
        router.replace('/(auth)/login');
    }
};
