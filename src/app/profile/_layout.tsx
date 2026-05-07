import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="pharmacy-info" />
            <Stack.Screen name="operating-hours" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="account-settings" />
            <Stack.Screen name="staff" />
            <Stack.Screen name="pricing" />
            <Stack.Screen name="support" />
        </Stack>
    );
}
