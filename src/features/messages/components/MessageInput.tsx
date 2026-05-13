import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface MessageInputProps {
    onSend: (message: string) => void;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export function MessageInput({
    onSend,
    onTypingStart,
    onTypingStop,
    placeholder = 'Type a message...',
    disabled = false,
}: MessageInputProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const handleChangeText = (text: string) => {
        setMessage(text);

        // Typing indicator logic
        if (text.length > 0 && !isTyping) {
            setIsTyping(true);
            onTypingStart?.();
        }

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Set new timeout to stop typing indicator after 2 seconds of inactivity
        const timeout = setTimeout(() => {
            setIsTyping(false);
            onTypingStop?.();
        }, 2000);

        setTypingTimeout(timeout);
    };

    const handleSend = () => {
        if (message.trim().length === 0) return;

        onSend(message.trim());
        setMessage('');
        setIsTyping(false);
        onTypingStop?.();

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={message}
                        onChangeText={handleChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={colors.placeholder}
                        multiline
                        maxLength={1000}
                        editable={!disabled}
                    />
                    {message.trim().length > 0 ? (
                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: colors.primary }]}
                            onPress={handleSend}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="send" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.attachButton}>
                            <Ionicons name="camera-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 6,
        gap: 8,
    },
    attachButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
