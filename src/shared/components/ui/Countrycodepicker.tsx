import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import CountryPicker, {
    Country,
    CountryCode,
    CallingCode,
} from 'react-native-country-picker-modal';
import { Text } from 'react-native-paper';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CountryCodePickerValue {
    countryCode: CountryCode;
    callingCode: CallingCode; // e.g. "234"
}

interface CountryCodePickerProps {
    value: CountryCodePickerValue;
    onChange: (value: CountryCodePickerValue) => void;
    style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CountryCodePicker({ value, onChange, style }: CountryCodePickerProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';

    const [visible, setVisible] = useState(false);

    const handleSelect = (country: Country) => {
        onChange({
            countryCode: country.cca2,
            callingCode: country.callingCode[0],
        });
        setVisible(false);
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    // Uses inputBackground from your Colors constant — same as Input fields
                    backgroundColor: colors.inputBackground,
                    // Derive a subtle border from placeholder at low opacity
                    borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                },
                style,
            ]}
            onPress={() => setVisible(true)}
            activeOpacity={0.7}
        >
            <CountryPicker
                countryCode={value.countryCode}
                withFlag
                withCallingCode
                withFilter
                withAlphaFilter
                withEmoji
                onSelect={handleSelect}
                visible={visible}
                onClose={() => setVisible(false)}
                theme={{
                    // Modal sheet colours match your MD3 theme backgrounds
                    backgroundColor: colors.background,
                    primaryColor: colors.primary,
                    primaryColorVariant: colors.primary,
                    onBackgroundTextColor: colors.text,
                    fontSize: 15,
                    filterPlaceholderTextColor: colors.placeholder,
                    activeOpacity: 0.7,
                    itemHeight: 52,
                }}
                // Collapse the library's own button — we own the touchable
                containerButtonStyle={styles.hiddenLibraryButton}
            />

            <Text style={[styles.dialCode, { color: colors.text }]}>
                +{value.callingCode}
            </Text>

            {/* Chevron uses placeholder colour — consistent with Input icons */}
            <Text style={[styles.chevron, { color: colors.placeholder }]}>▾</Text>
        </TouchableOpacity>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 52,
        gap: 4,
    },
    // Zero out the library's internal button so it doesn't steal touches
    hiddenLibraryButton: {
        padding: 0,
        margin: 0,
    },
    dialCode: {
        fontSize: 14,
        fontWeight: '500',
    },
    chevron: {
        fontSize: 11,
        marginLeft: 2,
    },
});