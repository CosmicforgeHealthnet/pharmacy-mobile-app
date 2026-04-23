import DotIndicator from "@/features/onboarding/components/Dotindicator";
import OnboardingSlide from "@/features/onboarding/components/Onboarding";
import OnboardingActions from "@/features/onboarding/components/Onboardingactions";
import { onboardingSlides } from "@/features/onboarding/data/onboardingData";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet
} from "react-native";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const { markAsSeen } = useOnboarding();

    const goToNext = () => {
        if (currentIndex < onboardingSlides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            markAsSeen();
        }
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#120E3C" />

            {/* Slides */}
            <ThemedView style={styles.slides}>
                <Animated.FlatList
                    ref={flatListRef}
                    data={onboardingSlides}
                    renderItem={({ item }) => <OnboardingSlide slide={item} />}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / width);
                        setCurrentIndex(index);
                    }}
                />
            </ThemedView>

            {/* Bottom Panel - Full screen gradient */}
            <LinearGradient
                colors={["#071540", "#21212100", "#22222200"]}
                locations={[0, 0, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.bottomPanel}
            >
                <DotIndicator total={onboardingSlides.length} scrollX={scrollX} />

                <ThemedView style={styles.textBlock}>
                    <ThemedText style={styles.title}>{onboardingSlides[currentIndex].title}</ThemedText>
                    <ThemedText style={styles.subtitle}>{onboardingSlides[currentIndex].subtitle}</ThemedText>
                </ThemedView>

                <OnboardingActions
                    isLast={currentIndex === onboardingSlides.length - 1}
                    onNext={goToNext}
                    onSkip={markAsSeen}
                />
            </LinearGradient>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    slides: {
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
    },
    bottomPanel: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "100%",
        paddingHorizontal: 28,
        paddingTop: 24,
        paddingBottom: 44,
        gap: 20,
        zIndex: 1,
        justifyContent: "flex-end",
    },
    textBlock: {
        gap: 10,
        backgroundColor: "transparent",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.6)",
        lineHeight: 22,
    },
});