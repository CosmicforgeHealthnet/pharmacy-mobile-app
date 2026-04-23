import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

interface AlertProps {
    visible: boolean;
    title: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function AppAlert({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
}: AlertProps) {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Title>{title}</Dialog.Title>

                {message && (
                    <Dialog.Content>
                        <Text>{message}</Text>
                    </Dialog.Content>
                )}

                <Dialog.Actions>
                    <Button onPress={onCancel}>Cancel</Button>
                    <Button onPress={onConfirm}>OK</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}