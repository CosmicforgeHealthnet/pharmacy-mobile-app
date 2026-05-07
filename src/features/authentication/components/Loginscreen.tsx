import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Input } from '@/shared/components/ui/Input';
import { AppSnackbar } from '@/shared/components/ui/Snackbar';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { storage } from '@/core/storage';
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
import { useLogin } from '../hooks';
import { handlePostLoginFlow } from '../utils/postLoginFlow';
import { validateLoginForm, hasErrors, LoginFormErrors } from '../utils/validation';

// ─── LOGIN SCREEN ─────────────────────────────────────
export function LoginScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const { mutateAsync: loginMutation, isPending: loading } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    // ── Form errors ───────────────────────────────────
    const [errors, setErrors] = useState<LoginFormErrors>({});
    const [apiError, setApiError] = useState('');

    // ── Snackbar state ────────────────────────────────
    const [snackVisible, setSnackVisible] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    const showSnack = (message: string) => {
        setSnackMessage(message);
        setSnackVisible(true);
    };

    // Clear field error when user types
    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
        if (apiError) setApiError('');
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
        if (apiError) setApiError('');
    };

    // ── Handlers ─────────────────────────────────────
    const handleLogin = async () => {
        // Validate form
        const validationErrors = validateLoginForm({ email, password });
        setErrors(validationErrors);

        if (hasErrors(validationErrors)) {
            return;
        }

        setApiError('');

        try {
            const deviceFingerprint = await storage.getDeviceFingerprint();

            const response = await loginMutation({
                email: email.trim().toLowerCase(),
                password,
                deviceFingerprint,
            });

            // Handle post-login flow
            await handlePostLoginFlow(response.pharmacy, (type, title, message) => {
                showSnack(message);
            });

        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error?.message || 'Invalid credentials. Please try again.';
            setApiError(errorMessage);
        }
    };

    const handleForgotPassword = () => {
        showSnack('Forgot password feature coming soon!');
    };

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
                        Log In!
                    </ThemedText>
                    <ThemedText style={styles.subheading}>
                        Welcome back.
                    </ThemedText>

                    {/* API Error */}
                    {apiError ? (
                        <View style={styles.apiErrorContainer}>
                            <ThemedText style={styles.apiErrorText}>{apiError}</ThemedText>
                        </View>
                    ) : null}

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="Enter email"
                            value={email}
                            onChangeText={handleEmailChange}
                            error={errors.email}
                            // keyboardType="email-address"
                            // autoCapitalize="none"
                            // autoComplete="email"
                        />

                        <Input
                            label="Password"
                            placeholder="Enter Password"
                            value={password}
                            onChangeText={handlePasswordChange}
                            error={errors.password}
                            secureTextEntry={!showPassword}
                            rightIcon={
                                <Text style={{ color: colors.placeholder, fontSize: 13 }}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </Text>
                            }
                            onRightIconPress={() => setShowPassword(p => !p)}
                        />

                        <TouchableOpacity style={styles.forgotContainer} onPress={handleForgotPassword}>
                            <ThemedText
                                type="link"
                                style={[styles.forgotText, { color: colors.primary }]}
                            >
                                Forgot Password?
                            </ThemedText>
                        </TouchableOpacity>

                        <Checkbox
                            checked={keepLoggedIn}
                            onToggle={() => setKeepLoggedIn(p => !p)}
                            label="Keep me logged In"
                        />
                    </View>

                    <View style={styles.spacer} />

                    {/* Login Button */}
                    <Button
                        title="Log In"
                        onPress={handleLogin}
                        variant="primary"
                        size="large"
                        loading={loading}
                        disabled={loading}
                    />

                    {/* Sign Up */}
                    <View style={styles.signUpRow}>
                        <ThemedText style={[styles.signUpText, { color: colors.placeholder }]}>
                            Don&apos;t have an account?{' '}
                        </ThemedText>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                            <ThemedText
                                type="link"
                                style={[styles.signUpLink, { color: colors.primary }]}
                            >
                                Sign Up
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Snackbar ── */}
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

    logoContainer: { alignItems: 'center', marginBottom: 28 },
    logo: { width: 170, height: 48 },

    heading: { marginBottom: 4 },
    subheading: { fontSize: 14, marginBottom: 28 },

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

    form: { gap: 4 },

    forgotContainer: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 12,
    },
    forgotText: { fontSize: 14 },

    spacer: { minHeight: 40 },

    signUpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signUpText: { fontSize: 14 },
    signUpLink: { fontSize: 14, fontWeight: '600' },
});
