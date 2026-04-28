import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { AppAlert } from '@/shared/components/ui/Dialog';
import { Input } from '@/shared/components/ui/Input';
import { AppSnackbar } from '@/shared/components/ui/Snackbar';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Image as ExpoImage } from 'expo-image';
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

// ─── Google Icon ──────────────────────────────────────
function GoogleIcon() {
    return (
        <ExpoImage
            source={require('@/assets/icons/google-icon.svg')}
            style={{ width: 20, height: 20 }}
            contentFit="contain"
        />
    );
}

// ─── Or Divider ───────────────────────────────────────
function OrDivider() {
    return (
        <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>Or</ThemedText>
            <View style={styles.dividerLine} />
        </View>
    );
}

// ─── LOGIN SCREEN ─────────────────────────────────────
export function LoginScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ── Alert state ───────────────────────────────────
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    // ── Snackbar state ────────────────────────────────
    const [snackVisible, setSnackVisible] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const showSnack = (message: string) => {
        setSnackMessage(message);
        setSnackVisible(true);
    };

    // ── Handlers ─────────────────────────────────────
    const handleLogin = async () => {
        if (!email || !password) {
            showAlert('Error', 'Please enter your email and password.');
            return;
        }

        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            router.replace('/(tabs)');
        } catch {
            showSnack('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        showSnack('Google Sign-In coming soon!');
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

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="Enter email"
                            value={email}
                            onChangeText={setEmail}
                        />

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

                        <TouchableOpacity style={styles.forgotContainer}>
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

                    {/* <OrDivider /> */}

                    {/* Google
                    <TouchableOpacity
                        style={[
                            styles.googleButton,
                            { borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E5E7EB' },
                        ]}
                        onPress={handleGoogleLogin}
                    >
                        <GoogleIcon />
                        <ThemedText style={styles.googleButtonText}>
                            Continue with Google
                        </ThemedText>
                    </TouchableOpacity> */}

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

            {/* ── Alert ── */}
            <AppAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onConfirm={() => setAlertVisible(false)}
                onCancel={() => setAlertVisible(false)}
            />

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

    form: { gap: 4 },

    forgotContainer: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 12,
    },
    forgotText: { fontSize: 14 },

    spacer: { minHeight: 40 },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        gap: 10,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    dividerText: { fontSize: 13, color: '#8F90A4' },

    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 10,
    },
    googleButtonText: { fontSize: 16, fontWeight: '500' },

    signUpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signUpText: { fontSize: 14 },
    signUpLink: { fontSize: 14, fontWeight: '600' },
});