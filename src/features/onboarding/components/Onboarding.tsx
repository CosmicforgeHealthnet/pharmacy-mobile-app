import type { OnboardingSlide as SlideType } from "@/features/onboarding/data/onboardingData";
import { ThemedView } from "@/shared/components/themed-view";
import { OnboardingColors } from "@/shared/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, ImageBackground, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
    slide: SlideType;
};

export default function OnboardingSlide({ slide }: Props) {
    return (
        <ThemedView style={styles.container} darkColor={OnboardingColors.background} lightColor={OnboardingColors.background}>
            <ImageBackground
                source={slide.image}
                style={styles.image}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={OnboardingColors.gradientOverlay}
                    style={styles.gradient}
                    locations={[0.3, 0.65, 1]}
                />
            </ImageBackground>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
    },
    image: {
        flex: 1,
        width: "100%",
    },
    gradient: {
        flex: 1,
    },
});
