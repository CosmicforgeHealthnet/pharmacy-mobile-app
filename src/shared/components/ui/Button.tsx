import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
}: ButtonProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // SIZE CONFIG
    const getSizeStyle = () => {
        switch (size) {
            case 'small':
                return {
                    height: 36,
                    paddingHorizontal: 16,
                };
            case 'large':
                return {
                    height: 56,
                    paddingHorizontal: 24,
                };
            case 'medium':
            default:
                return {
                    height: 44,
                    paddingHorizontal: 20,
                };
        }
    };

    // VARIANT CONFIG
    const getVariantProps = () => {
        switch (variant) {
            case 'primary':
                return {
                    mode: 'contained' as const,
                    buttonColor: disabled ? '#E5E5E5' : colors.primary,
                    textColor: disabled ? '#9CA3AF' : '#FFFFFF',
                };

            case 'secondary':
                return {
                    mode: 'contained' as const,
                    buttonColor: disabled ? '#F5F5F5' : '#F5F5F5',
                    textColor: disabled ? '#9CA3AF' : colors.primary,
                };

            case 'outline':
                return {
                    mode: 'outlined' as const,
                    buttonColor: 'transparent',
                    textColor: disabled ? '#9CA3AF' : colors.primary,
                };
        }
    };

    const sizeStyle = getSizeStyle();
    const variantProps = getVariantProps();

    return (
        <PaperButton
            mode={variantProps.mode}
            onPress={onPress}
            disabled={disabled || loading}
            loading={loading}
            buttonColor={variantProps.buttonColor}
            textColor={variantProps.textColor}
            style={[
                {
                    borderRadius: 8,
                    justifyContent: 'center',
                },
                sizeStyle,
                style,
            ]}
            labelStyle={[
                {
                    fontSize:
                        size === 'small'
                            ? 14
                            : size === 'large'
                                ? 18
                                : 16,
                    fontWeight: '600',
                },
                textStyle,
            ]}
        >
            {title}
        </PaperButton>
    );
}