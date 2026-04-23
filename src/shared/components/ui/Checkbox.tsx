import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Checkbox as PaperCheckbox, Text } from 'react-native-paper';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { ThemedText } from '../themed-text';

interface CheckboxProps {
    checked: boolean;
    onToggle: () => void;
    label?: string;
    style?: ViewStyle;
}

export function Checkbox({ checked, onToggle, label, style }: CheckboxProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity
            onPress={onToggle}
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                },
                style,
            ]}
            activeOpacity={0.7}
        >
            <PaperCheckbox
                status={checked ? 'checked' : 'unchecked'}
                onPress={onToggle}
                color={colors.primary}
            />

            {label && (
                <ThemedText style={{ fontSize: 12 }}>
                    {label}
                </ThemedText>
            )}
        </TouchableOpacity>
    );
}