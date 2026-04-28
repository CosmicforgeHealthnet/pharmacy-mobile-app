import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { OnboardingColors } from "@/shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
    isLast: boolean;
    onNext: () => void;
    onSkip: () => void;
};

export default function OnboardingActions({ isLast, onNext, onSkip }: Props) {
    const handleSignUp = () => {
        onSkip(); // Mark onboarding as seen
        router.push('/(auth)/register' as any);
    };

    // Last slide: Show Sign Up button
    if (isLast) {
        return (
            <ThemedView style={styles.container} darkColor="transparent" lightColor="transparent">
                <TouchableOpacity
                    onPress={handleSignUp}
                    activeOpacity={0.85}
                    style={styles.signUpButton}
                >
                    <ThemedText style={styles.signUpText}>Sign Up</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    // Other slides: Show Continue and Skip
    return (
        <ThemedView style={styles.container} darkColor="transparent" lightColor="transparent">
            <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={styles.shadow}>
                <ThemedView style={styles.nextButton} darkColor={OnboardingColors.primary} lightColor={OnboardingColors.primary}>
                    <Ionicons
                        name="arrow-forward"
                        size={22}
                        color={OnboardingColors.text}
                    />
                </ThemedView>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSkip} activeOpacity={0.7} style={styles.skipButton}>
                <ThemedText style={styles.skipText} lightColor={OnboardingColors.textSubtle} darkColor={OnboardingColors.textSubtle}>
                    Skip
                </ThemedText>
                <Ionicons name="arrow-forward" size={14} color={OnboardingColors.textSubtle} />
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 28,
    },
    shadow: {
        shadowColor: OnboardingColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
        borderRadius: 28,
    },
    nextButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    skipButton: {
        position: "absolute",
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        padding: 8,
    },
    skipText: {
        fontSize: 14,
        fontWeight: "500",
    },
    signUpButton: {
        width: "100%",
        backgroundColor: OnboardingColors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: OnboardingColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
    },
    signUpText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
