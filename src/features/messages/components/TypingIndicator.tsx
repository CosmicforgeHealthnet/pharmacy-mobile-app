import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface TypingIndicatorProps {
    userName: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (dot: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, {
                        toValue: -8,
                        duration: 400,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animations = Animated.parallel([
            animate(dot1, 0),
            animate(dot2, 150),
            animate(dot3, 300),
        ]);

        animations.start();

        return () => animations.stop();
    }, [dot1, dot2, dot3]);

    return (
        <View style={styles.container}>
            <View style={[styles.bubble, { backgroundColor: colors.inputBackground }]}>
                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.placeholder, transform: [{ translateY: dot1 }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.placeholder, transform: [{ translateY: dot2 }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.placeholder, transform: [{ translateY: dot3 }] },
                        ]}
                    />
                </View>
            </View>
            <ThemedText style={[styles.text, { color: colors.placeholder }]}>
                {userName} is typing...
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        height: 40,
        justifyContent: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    text: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});
