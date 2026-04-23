import React from 'react';
import { Snackbar } from 'react-native-paper';

interface SnackProps {
    visible: boolean;
    message: string;
    onDismiss: () => void;
}

export function AppSnackbar({ visible, message, onDismiss }: SnackProps) {
    return (
        <Snackbar
            visible={visible}
            onDismiss={onDismiss}
            duration={3000}
            action={{
                label: 'Close',
                onPress: onDismiss,
            }}
        >
            {message}
        </Snackbar>
    );
}