import { ThemedText } from '@/shared/components/themed-text';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChatMessage } from '../types';

interface MessageBubbleProps {
    message: ChatMessage;
    isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    if (message.deletedAt) {
        return (
            <View style={[styles.container, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
                <View style={[styles.deletedBubble, { borderColor: colors.placeholder }]}>
                    <Ionicons name="trash-outline" size={14} color={colors.placeholder} />
                    <ThemedText style={[styles.deletedText, { color: colors.placeholder }]}>
                        This message was deleted
                    </ThemedText>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
            {!isOwnMessage && (
                <ThemedText style={[styles.senderName, { color: colors.primary }]}>
                    {message.senderName}
                </ThemedText>
            )}
            <View
                style={[
                    styles.bubble,
                    isOwnMessage
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.inputBackground },
                ]}
            >
                <ThemedText
                    style={[
                        styles.messageText,
                        { color: isOwnMessage ? '#FFFFFF' : colors.text },
                    ]}
                >
                    {message.content}
                </ThemedText>
                <View style={styles.footer}>
                    <ThemedText
                        style={[
                            styles.timestamp,
                            { color: isOwnMessage ? '#FFFFFF' : colors.placeholder },
                        ]}
                    >
                        {formatTime(message.timestamp)}
                    </ThemedText>
                    {message.isEdited && (
                        <ThemedText
                            style={[
                                styles.editedLabel,
                                { color: isOwnMessage ? '#FFFFFF' : colors.placeholder },
                            ]}
                        >
                            edited
                        </ThemedText>
                    )}
                    {isOwnMessage && (
                        <Ionicons
                            name={message.isRead ? 'checkmark-done' : 'checkmark'}
                            size={14}
                            color="#FFFFFF"
                            style={styles.readIcon}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    ownContainer: {
        alignItems: 'flex-end',
    },
    otherContainer: {
        alignItems: 'flex-start',
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        marginLeft: 12,
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        maxWidth: '75%',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    timestamp: {
        fontSize: 11,
    },
    editedLabel: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    readIcon: {
        marginLeft: 2,
    },
    deletedBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 6,
    },
    deletedText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
});
