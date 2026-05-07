import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Input } from '@/shared/components/ui/Input';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppSnackbar } from '@/shared/components/ui/Snackbar';
import { CountryCodePicker, CountryCodePickerValue } from '@/shared/components/ui/Countrycodepicker';
import { useRegister } from '../hooks';
import { handlePostRegisterFlow } from '../utils/postLoginFlow';
import type { PharmacyRegisterRequest } from '../types';
import {
    validateRegisterStep1,
    validateRegisterStep2,
    validateRegisterStep3,
    hasErrors,
    RegisterStep1Errors,
    RegisterStep2Errors,
    RegisterStep3Errors,
} from '../utils/validation';

// ─── Step Indicator ──────────────────────────────────
function StepIndicator({
    currentStep,
    totalSteps,
    primary,
    inactive,
}: {
    currentStep: number;
    totalSteps: number;
    primary: string;
    inactive: string;
}) {
    return (
        <View style={styles.stepIndicatorRow}>
            {Array.from({ length: totalSteps }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.stepDot,
                        {
                            backgroundColor: i + 1 <= currentStep ? primary : inactive,
                            width: i + 1 === currentStep ? 24 : 8,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

// ─── REGISTER SCREEN ─────────────────────────────────
const TOTAL_STEPS = 3;

export function RegisterScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // ── Step 1 - Personal Information ────────────────
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState<CountryCodePickerValue>({
        countryCode: 'NG',
        callingCode: '234',
    });

    // ── Step 2 - Pharmacy Information ────────────────
    const [pharmacyName, setPharmacyName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [address, setAddress] = useState('');
    const [preferredUsername, setPreferredUsername] = useState('');
    const [primaryContact, setPrimaryContact] = useState('');
    const [primaryContactCountry, setPrimaryContactCountry] = useState<CountryCodePickerValue>({
        countryCode: 'NG',
        callingCode: '234',
    });

    // ── Step 3 - Password & Terms ────────────────────
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [step, setStep] = useState(1);
    const { mutateAsync: registerMutation, isPending: loading } = useRegister();

    // ── Form errors ──────────────────────────────────
    const [step1Errors, setStep1Errors] = useState<RegisterStep1Errors>({});
    const [step2Errors, setStep2Errors] = useState<RegisterStep2Errors>({});
    const [step3Errors, setStep3Errors] = useState<RegisterStep3Errors>({});
    const [apiError, setApiError] = useState('');

    // ── Snackbar ─────────────────────────────────────
    const [snackVisible, setSnackVisible] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    const showSnack = (message: string) => {
        setSnackMessage(message);
        setSnackVisible(true);
    };

    // ── Clear errors on input change ─────────────────
    const clearStep1Error = (field: keyof RegisterStep1Errors) => {
        if (step1Errors[field]) setStep1Errors(prev => ({ ...prev, [field]: undefined }));
        if (apiError) setApiError('');
    };

    const clearStep2Error = (field: keyof RegisterStep2Errors) => {
        if (step2Errors[field]) setStep2Errors(prev => ({ ...prev, [field]: undefined }));
        if (apiError) setApiError('');
    };

    const clearStep3Error = (field: keyof RegisterStep3Errors) => {
        if (step3Errors[field]) setStep3Errors(prev => ({ ...prev, [field]: undefined }));
        if (apiError) setApiError('');
    };

    // ── Handlers ─────────────────────────────────────
    const handleContinue = () => {
        if (step === 1) {
            const errors = validateRegisterStep1({ fullName, phone, email });
            setStep1Errors(errors);
            if (!hasErrors(errors)) setStep(2);
        } else if (step === 2) {
            const errors = validateRegisterStep2({
                pharmacyName,
                registrationNumber,
                address,
                preferredUsername,
                primaryContact,
            });
            setStep2Errors(errors);
            if (!hasErrors(errors)) setStep(3);
        } else {
            handleRegister();
        }
    };

    const handleRegister = async () => {
        const errors = validateRegisterStep3({ password, confirmPassword, acceptedTerms });
        setStep3Errors(errors);

        if (hasErrors(errors)) return;

        setApiError('');

        try {
            // Format phone numbers with country code
            const formattedPhone = `+${country.callingCode}${phone.replace(/^0+/, '')}`;
            const formattedPrimaryContact = `+${primaryContactCountry.callingCode}${primaryContact.replace(/^0+/, '')}`;

            const registerData: PharmacyRegisterRequest = {
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
                pharmacyName: pharmacyName.trim(),
                registrationNumber: registrationNumber.trim(),
                address: address.trim(),
                phone: formattedPhone,
                primaryContactPerson: formattedPrimaryContact,
                preferredUsername: preferredUsername.trim().toLowerCase(),
            };

            const response = await registerMutation(registerData);

            // Handle post-register flow
            await handlePostRegisterFlow(response.pharmacy, (type, title, message) => {
                showSnack(message);
            });

        } catch (error: any) {
            console.error('Registration error:', error);
            const errorMessage = error?.message || 'Registration failed. Please try again.';
            setApiError(errorMessage);
        }
    };

    const inactiveDot = colorScheme === 'dark' ? '#3A3A3A' : '#E5E7EB';

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
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => (step > 1 ? setStep(s => s - 1) : router.back())}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/cosmic-log.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Heading */}
                    <ThemedText type="title" style={styles.heading}>
                        Welcome!
                    </ThemedText>
                    <ThemedText style={styles.subheading}>
                        Start your journey with us.
                    </ThemedText>

                    {/* Step dots */}
                    <StepIndicator
                        currentStep={step}
                        totalSteps={TOTAL_STEPS}
                        primary={colors.primary}
                        inactive={inactiveDot}
                    />

                    {/* API Error */}
                    {apiError ? (
                        <View style={styles.apiErrorContainer}>
                            <ThemedText style={styles.apiErrorText}>{apiError}</ThemedText>
                        </View>
                    ) : null}

                    {/* ── STEP 1 – Personal Information ── */}
                    {step === 1 && (
                        <View style={styles.form}>
                            <ThemedText style={styles.sectionLabel}>
                                1. Personal Information
                            </ThemedText>

                            <Input
                                label="Full Name"
                                placeholder="Enter name"
                                value={fullName}
                                onChangeText={(text) => { setFullName(text); clearStep1Error('fullName'); }}
                                error={step1Errors.fullName}
                                // autoCapitalize="words"
                            />

                            {/* Phone row */}
                            <View style={styles.phoneContainer}>
                                <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
                                <View style={styles.phoneRow}>
                                    <CountryCodePicker
                                        value={country}
                                        onChange={setCountry}
                                    />
                                    <View style={styles.phoneFlex}>
                                        <Input
                                            placeholder="e.g. 8057735987"
                                            value={phone}
                                            onChangeText={(text) => { setPhone(text); clearStep1Error('phone'); }}
                                            error={step1Errors.phone}
                                            // keyboardType="phone-pad"
                                            containerStyle={{ marginBottom: 0 }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <Input
                                label="Email Address"
                                placeholder="Enter email"
                                value={email}
                                onChangeText={(text) => { setEmail(text); clearStep1Error('email'); }}
                                error={step1Errors.email}
                                // keyboardType="email-address"
                                // autoCapitalize="none"
                                // autoComplete="email"
                            />
                        </View>
                    )}

                    {/* ── STEP 2 – Pharmacy Information ── */}
                    {step === 2 && (
                        <View style={styles.form}>
                            <ThemedText style={styles.sectionLabel}>
                                2. Pharmacy Information
                            </ThemedText>

                            <Input
                                label="Pharmacy Name"
                                placeholder="Enter pharmacy name"
                                value={pharmacyName}
                                onChangeText={(text) => { setPharmacyName(text); clearStep2Error('pharmacyName'); }}
                                error={step2Errors.pharmacyName}
                            />

                            <Input
                                label="Registration Number"
                                placeholder="Enter registration number"
                                value={registrationNumber}
                                onChangeText={(text) => { setRegistrationNumber(text); clearStep2Error('registrationNumber'); }}
                                error={step2Errors.registrationNumber}
                            />

                            <Input
                                label="Address"
                                placeholder="Enter address"
                                value={address}
                                onChangeText={(text) => { setAddress(text); clearStep2Error('address'); }}
                                error={step2Errors.address}
                            />

                            <Input
                                label="Preferred Username"
                                placeholder="Enter username"
                                value={preferredUsername}
                                onChangeText={(text) => { setPreferredUsername(text); clearStep2Error('preferredUsername'); }}
                                error={step2Errors.preferredUsername}
                                // autoCapitalize="none"
                            />

                            {/* Primary Contact row */}
                            <View style={styles.phoneContainer}>
                                <ThemedText style={styles.inputLabel}>Primary Contact Number</ThemedText>
                                <View style={styles.phoneRow}>
                                    <CountryCodePicker
                                        value={primaryContactCountry}
                                        onChange={setPrimaryContactCountry}
                                    />
                                    <View style={styles.phoneFlex}>
                                        <Input
                                            placeholder="e.g. 8057735987"
                                            value={primaryContact}
                                            onChangeText={(text) => { setPrimaryContact(text); clearStep2Error('primaryContact'); }}
                                            error={step2Errors.primaryContact}
                                            // keyboardType="phone-pad"
                                            containerStyle={{ marginBottom: 0 }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* ── STEP 3 – Password & Terms ── */}
                    {step === 3 && (
                        <View style={styles.form}>
                            <ThemedText style={styles.sectionLabel}>
                                3. Create Password
                            </ThemedText>

                            <Input
                                label="Password"
                                placeholder="Enter Password"
                                value={password}
                                onChangeText={(text) => { setPassword(text); clearStep3Error('password'); }}
                                error={step3Errors.password}
                                secureTextEntry={!showPassword}
                                rightIcon={
                                    <Text style={{ color: colors.placeholder, fontSize: 13 }}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                }
                                onRightIconPress={() => setShowPassword(p => !p)}
                            />

                            <Input
                                label="Confirm Password"
                                placeholder="Re-enter Password"
                                value={confirmPassword}
                                onChangeText={(text) => { setConfirmPassword(text); clearStep3Error('confirmPassword'); }}
                                error={step3Errors.confirmPassword}
                                secureTextEntry={!showConfirm}
                                rightIcon={
                                    <Text style={{ color: colors.placeholder, fontSize: 13 }}>
                                        {showConfirm ? 'Hide' : 'Show'}
                                    </Text>
                                }
                                onRightIconPress={() => setShowConfirm(p => !p)}
                            />

                            <ThemedText style={[styles.hint, { color: colors.placeholder }]}>
                                Must be at least 8 characters, contain uppercase, lowercase,{'\n'}
                                number and symbol.
                            </ThemedText>

                            {/* Terms */}
                            <View style={styles.termsRow}>
                                <Checkbox
                                    checked={acceptedTerms}
                                    onToggle={() => { setAcceptedTerms(p => !p); clearStep3Error('acceptedTerms'); }}
                                />
                                <View style={styles.termsTextRow}>
                                    <ThemedText style={[styles.termsText, { color: colors.placeholder }]}>
                                        I agree to the{' '}
                                    </ThemedText>
                                    <TouchableOpacity>
                                        <ThemedText
                                            type="link"
                                            style={[styles.termsLink, { color: colors.primary }]}
                                        >
                                            Terms and Conditions
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {step3Errors.acceptedTerms && (
                                <ThemedText style={styles.termsError}>{step3Errors.acceptedTerms}</ThemedText>
                            )}
                        </View>
                    )}

                    <View style={styles.spacer} />

                    {/* CTA */}
                    <Button
                        title={step === TOTAL_STEPS ? 'Create Account' : 'Continue'}
                        onPress={handleContinue}
                        variant="primary"
                        size="large"
                        loading={loading}
                        disabled={loading}
                    />

                    {/* Login link */}
                    <View style={styles.loginRow}>
                        <ThemedText style={[styles.loginText, { color: colors.placeholder }]}>
                            Already have an account?{' '}
                        </ThemedText>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText
                                type="link"
                                style={[styles.loginLink, { color: colors.primary }]}
                            >
                                Log In
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Snackbar */}
            <AppSnackbar
                visible={snackVisible}
                message={snackMessage}
                onDismiss={() => setSnackVisible(false)}
            />
        </ThemedView>
    );
}

// ─── Styles ───────────────────────────────────────────
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

    logoContainer: { alignItems: 'center', marginBottom: 28 },
    logo: { width: 170, height: 48 },

    heading: { marginBottom: 4 },
    subheading: { fontSize: 14, marginBottom: 16 },

    stepIndicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    stepDot: { height: 8, borderRadius: 4 },

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

    sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 16 },

    form: { gap: 4 },

    inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 6 },

    phoneContainer: { marginBottom: 16 },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    phoneFlex: { flex: 1 },

    hint: { fontSize: 12, marginTop: 4, marginBottom: 8, lineHeight: 18 },

    termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
    termsTextRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        flex: 1,
        marginLeft: 4,
    },
    termsText: { fontSize: 13 },
    termsLink: { fontSize: 13, fontWeight: '600' },
    termsError: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 28 },

    spacer: { minHeight: 32 },

    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: { fontSize: 14 },
    loginLink: { fontSize: 14, fontWeight: '600' },
});
