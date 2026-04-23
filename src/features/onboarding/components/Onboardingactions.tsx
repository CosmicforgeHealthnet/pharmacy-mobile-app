import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { OnboardingColors } from "@/shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type Props = {
    isLast: boolean;
    onNext: () => void;
    onSkip: () => void;
};

export default function OnboardingActions({ isLast, onNext, onSkip }: Props) {
    return (
        <ThemedView style={styles.container} darkColor="transparent" lightColor="transparent">
            <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={styles.shadow}>
                <ThemedView style={styles.nextButton} darkColor={OnboardingColors.primary} lightColor={OnboardingColors.primary}>
                    <Ionicons
                        name={isLast ? "checkmark" : "arrow-forward"}
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
});