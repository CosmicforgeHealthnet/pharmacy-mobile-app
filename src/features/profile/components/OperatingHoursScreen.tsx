import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProfile, useUpdateProfile } from '@/features/authentication/hooks/useAuth';
import type { OperatingHours, DayOperatingHours } from '@/features/authentication/types';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type DayKey = typeof DAYS[number];

const DAY_LABELS: Record<DayKey, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};

const DEFAULT_HOURS: DayOperatingHours = {
    open: '09:00',
    close: '18:00',
    isOpen: true,
};

const CLOSED_HOURS: DayOperatingHours = {
    open: null,
    close: null,
    isOpen: false,
};

export function OperatingHoursScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { data: profileData, isLoading: loadingProfile } = useProfile();
    const updateProfile = useUpdateProfile();

    const profile = profileData?.pharmacy;

    const [isEditing, setIsEditing] = useState(false);
    const [hours, setHours] = useState<OperatingHours>({});

    useEffect(() => {
        if (profile?.operatingHours) {
            setHours(profile.operatingHours);
        }
    }, [profile]);

    const resetForm = () => {
        setHours(profile?.operatingHours ?? {});
    };

    const handleStartEditing = () => {
        resetForm();
        setIsEditing(true);
    };

    const handleCancel = () => {
        resetForm();
        setIsEditing(false);
    };

    const updateDay = (day: DayKey, field: keyof DayOperatingHours, value: any) => {
        setHours((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
                // If toggling isOpen to false, clear times
                ...(field === 'isOpen' && !value ? { open: null, close: null } : {}),
                // If toggling isOpen to true, set default times
                ...(field === 'isOpen' && value ? { open: '09:00', close: '18:00' } : {}),
            },
        }));
    };

    const applyToWeekdays = () => {
        const mondayHours = hours.monday ?? DEFAULT_HOURS;
        const weekdays: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const updated: OperatingHours = { ...hours };
        weekdays.forEach((day) => {
            updated[day] = { ...mondayHours };
        });
        setHours(updated);
    };

    const handleUpdate = async () => {
        try {
            await updateProfile.mutateAsync({ operatingHours: hours });
            Alert.alert('Success', 'Operating hours updated successfully');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update operating hours. Please try again.');
        }
    };

    if (loadingProfile && !profile) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
        );
    }

    const hasHours = profile?.operatingHours && Object.keys(profile.operatingHours).length > 0;

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Operating Hours</ThemedText>
                {!isEditing ? (
                    <TouchableOpacity
                        onPress={handleStartEditing}
                        style={[styles.editButton, { backgroundColor: `${colors.primary}15` }]}
                    >
                        <Ionicons name="pencil" size={18} color={colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isEditing ? (
                    <>
                        {/* Edit Mode */}
                        {/* Apply to Weekdays Button */}
                        <TouchableOpacity
                            style={[styles.applyButton, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}
                            onPress={applyToWeekdays}
                        >
                            <Ionicons name="copy-outline" size={18} color={colors.primary} />
                            <ThemedText style={[styles.applyButtonText, { color: colors.primary }]}>
                                Apply Monday hours to weekdays
                            </ThemedText>
                        </TouchableOpacity>

                        {/* Days List - Edit Mode */}
                        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            {DAYS.map((day) => {
                                const dayHours = hours[day] ?? CLOSED_HOURS;
                                return (
                                    <View
                                        key={day}
                                        style={[
                                            styles.dayRow,
                                            dayHours.isOpen
                                                ? { backgroundColor: `${colors.primary}08` }
                                                : { backgroundColor: colors.inputBackground },
                                        ]}
                                    >
                                        <View style={styles.dayHeader}>
                                            <ThemedText style={styles.dayName}>{DAY_LABELS[day]}</ThemedText>
                                            <View style={styles.switchRow}>
                                                <ThemedText style={[styles.switchLabel, { color: colors.placeholder }]}>
                                                    {dayHours.isOpen ? 'Open' : 'Closed'}
                                                </ThemedText>
                                                <Switch
                                                    value={dayHours.isOpen}
                                                    onValueChange={(checked) => updateDay(day, 'isOpen', checked)}
                                                    trackColor={{ false: '#E5E7EB', true: `${colors.primary}50` }}
                                                    thumbColor={dayHours.isOpen ? colors.primary : '#FFFFFF'}
                                                />
                                            </View>
                                        </View>

                                        {dayHours.isOpen && (
                                            <View style={styles.timeRow}>
                                                <View style={styles.timeField}>
                                                    <ThemedText style={[styles.timeLabel, { color: colors.placeholder }]}>
                                                        From
                                                    </ThemedText>
                                                    <TextInput
                                                        style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                                        value={dayHours.open ?? ''}
                                                        onChangeText={(val) => updateDay(day, 'open', val)}
                                                        placeholder="09:00"
                                                        placeholderTextColor={colors.placeholder}
                                                    />
                                                </View>
                                                <View style={styles.timeField}>
                                                    <ThemedText style={[styles.timeLabel, { color: colors.placeholder }]}>
                                                        To
                                                    </ThemedText>
                                                    <TextInput
                                                        style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                                        value={dayHours.close ?? ''}
                                                        onChangeText={(val) => updateDay(day, 'close', val)}
                                                        placeholder="18:00"
                                                        placeholderTextColor={colors.placeholder}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        {/* Hint */}
                        <View style={styles.hintContainer}>
                            <Ionicons name="information-circle-outline" size={18} color={colors.placeholder} />
                            <ThemedText style={[styles.hintText, { color: colors.placeholder }]}>
                                Enter times in 24-hour format (e.g., 09:00, 18:00)
                            </ThemedText>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                                onPress={handleCancel}
                                disabled={updateProfile.isPending}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.updateButton, { backgroundColor: colors.primary }]}
                                onPress={handleUpdate}
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Update</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        {/* View Mode */}
                        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            {!hasHours ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="time-outline" size={48} color={colors.placeholder} />
                                    <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                                        No operating hours set
                                    </ThemedText>
                                    <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                                        Tap the edit button to set your business hours.
                                    </ThemedText>
                                </View>
                            ) : (
                                DAYS.map((day) => {
                                    const dayHours = profile?.operatingHours?.[day];
                                    return (
                                        <View
                                            key={day}
                                            style={[
                                                styles.viewDayRow,
                                                dayHours?.isOpen
                                                    ? { backgroundColor: '#ECFDF5' }
                                                    : { backgroundColor: colors.inputBackground },
                                            ]}
                                        >
                                            <ThemedText style={styles.viewDayName}>{DAY_LABELS[day]}</ThemedText>
                                            {dayHours?.isOpen ? (
                                                <ThemedText style={[styles.viewDayTime, { color: '#059669' }]}>
                                                    {dayHours.open} - {dayHours.close}
                                                </ThemedText>
                                            ) : (
                                                <ThemedText style={[styles.viewDayTime, { color: colors.placeholder }]}>
                                                    Closed
                                                </ThemedText>
                                            )}
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: 60,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerSpacer: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
        paddingBottom: 40,
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    // View mode styles
    viewDayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    viewDayName: {
        fontSize: 15,
        fontWeight: '500',
    },
    viewDayTime: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    // Edit mode styles
    dayRow: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dayName: {
        fontSize: 16,
        fontWeight: '600',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    switchLabel: {
        fontSize: 13,
    },
    timeRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 16,
    },
    timeField: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    timeInput: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        borderWidth: 1,
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        gap: 8,
    },
    hintText: {
        fontSize: 13,
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
        marginTop: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    updateButton: {},
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
