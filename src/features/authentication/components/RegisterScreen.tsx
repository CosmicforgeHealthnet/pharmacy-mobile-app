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
import { AppAlert } from '@/shared/components/ui/Dialog';
import { CountryCodePicker, CountryCodePickerValue } from '@/shared/components/ui/Countrycodepicker';

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
    const [loading, setLoading] = useState(false);

    // ── Alert ────────────────────────────────────────
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    // ── Validation ───────────────────────────────────
    const validateStep1 = (): boolean => {
        if (!fullName.trim()) {
            showAlert('Missing Field', 'Please enter your full name.');
            return false;
        }
        if (!phone.trim()) {
            showAlert('Missing Field', 'Please enter your phone number.');
            return false;
        }
        if (!email.trim()) {
            showAlert('Missing Field', 'Please enter your email address.');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAlert('Invalid Email', 'Please enter a valid email address.');
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        if (!pharmacyName.trim()) {
            showAlert('Missing Field', 'Please enter your pharmacy name.');
            return false;
        }
        if (!registrationNumber.trim()) {
            showAlert('Missing Field', 'Please enter your registration number.');
            return false;
        }
        if (!address.trim()) {
            showAlert('Missing Field', 'Please enter your address.');
            return false;
        }
        if (!preferredUsername.trim()) {
            showAlert('Missing Field', 'Please enter your preferred username.');
            return false;
        }
        if (!primaryContact.trim()) {
            showAlert('Missing Field', 'Please enter your primary contact number.');
            return false;
        }
        return true;
    };

    const validateStep3 = (): boolean => {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
            showAlert(
                'Weak Password',
                'Must be at least 8 characters, contain uppercase, lowercase, number and symbol.'
            );
            return false;
        }
        if (password !== confirmPassword) {
            showAlert('Password Mismatch', 'Passwords do not match.');
            return false;
        }
        if (!acceptedTerms) {
            showAlert('Terms Required', 'Please accept the Terms and Conditions.');
            return false;
        }
        return true;
    };

    // ── Handlers ─────────────────────────────────────
    const handleContinue = () => {
        if (step === 1) {
            if (validateStep1()) setStep(2);
        } else if (step === 2) {
            if (validateStep2()) setStep(3);
        } else {
            handleRegister();
        }
    };

    const handleRegister = async () => {
        if (!validateStep3()) return;
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            router.replace('/(tabs)');
        } catch {
            showAlert('Registration Failed', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
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
                                onChangeText={setFullName}
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
                                            onChangeText={setPhone}
                                            containerStyle={{ marginBottom: 0 }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <Input
                                label="Email Address"
                                placeholder="Enter email"
                                value={email}
                                onChangeText={setEmail}
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
                                onChangeText={setPharmacyName}
                            />

                            <Input
                                label="Registration Number"
                                placeholder="Enter registration number"
                                value={registrationNumber}
                                onChangeText={setRegistrationNumber}
                            />

                            <Input
                                label="Address"
                                placeholder="Enter address"
                                value={address}
                                onChangeText={setAddress}
                            />

                            <Input
                                label="Preferred Username"
                                placeholder="Enter username"
                                value={preferredUsername}
                                onChangeText={setPreferredUsername}
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
                                            onChangeText={setPrimaryContact}
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
                                onChangeText={setPassword}
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
                                onChangeText={setConfirmPassword}
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
                                    onToggle={() => setAcceptedTerms(p => !p)}
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

            {/* Alert */}
            <AppAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onConfirm={() => setAlertVisible(false)}
                onCancel={() => setAlertVisible(false)}
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

    sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 16 },

    form: { gap: 4 },

    inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 6 },

    phoneContainer: { marginBottom: 16 },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
