import { ThemedView } from "@/shared/components/themed-view";
import React from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
    total: number;
    scrollX: Animated.Value;
};

export default function DotIndicator({ total, scrollX }: Props) {
    return (
        <ThemedView style={styles.container} darkColor="transparent" lightColor="transparent">
            {Array.from({ length: total }).map((_, index) => {
                const inputRange = [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                ];

                const isActive = scrollX.interpolate({
                    inputRange,
                    outputRange: [0, 1, 0],
                    extrapolate: "clamp",
                });

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: isActive.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['#FFFFFF', '#272EA7'],
                                }),
                                transform: [
                                    {
                                        scaleX: isActive.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 1.5],
                                        })
                                    },
                                    {
                                        scaleY: isActive.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 1.5],
                                        })
                                    }
                                ]
                            }
                        ]}
                    />
                );
            })}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
    },
});