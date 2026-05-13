import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useChatMessages, useSendChatMessage, useMarkAsRead } from '../hooks';
import type { ChatMessage, MessageBubbleMessage } from '../types';
import { getInitials } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { chatSocket } from '@/core/socket/chatSocket';

export function ChatScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const flatListRef = useRef<FlatList>(null);
    const queryClient = useQueryClient();
    const [isPatientTyping, setIsPatientTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get contact info from route params
    const prescriptionId = (params.prescriptionId as string) || (params.id as string) || '';
    const patientName = (params.patientName as string) || 'Patient';
    const prescriptionRef = (params.prescriptionRef as string) || '';

    const initials = getInitials(patientName);

    // Fetch messages from API
    const { data: messages = [], isLoading } = useChatMessages(prescriptionId);

    // Mutations
    const { mutate: sendMessage, isPending: isSending } = useSendChatMessage(prescriptionId);
    const { mutate: markAsRead } = useMarkAsRead(prescriptionId);

    // Join the chat room when entering and leave when exiting
    useEffect(() => {
        if (!prescriptionId) return;

        chatSocket.joinRoom(prescriptionId);
        return () => {
            chatSocket.leaveRoom(prescriptionId);
        };
    }, [prescriptionId]);

    // Listen for real-time messages
    useEffect(() => {
        if (!prescriptionId) return;

        const handleNewMessage = (data: ChatMessage) => {
            // Only refetch if the message is for this prescription
            if (data?.prescriptionId === prescriptionId || (data as any)?.roomId === prescriptionId) {
                queryClient.invalidateQueries({ queryKey: ['chatMessages', prescriptionId] });
            }
        };

        chatSocket.onNewMessage(handleNewMessage);
        return () => {
            chatSocket.offNewMessage(handleNewMessage);
        };
    }, [prescriptionId, queryClient]);

    // Listen for typing indicators
    useEffect(() => {
        if (!prescriptionId) return;

        const handleTypingStart = (data: { roomId: string; user: any }) => {
            if (data.roomId === prescriptionId) {
                setIsPatientTyping(true);
                // Clear any existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                // Auto-hide typing after 3 seconds of no updates
                typingTimeoutRef.current = setTimeout(() => {
                    setIsPatientTyping(false);
                }, 3000);
            }
        };

        const handleTypingStop = (data: { roomId: string; user: any }) => {
            if (data.roomId === prescriptionId) {
                setIsPatientTyping(false);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
            }
        };

        chatSocket.onTypingStart(handleTypingStart);
        chatSocket.onTypingStop(handleTypingStop);
        return () => {
            chatSocket.offTypingStart(handleTypingStart);
            chatSocket.offTypingStop(handleTypingStop);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [prescriptionId]);

    // Mark messages as read when viewing
    useEffect(() => {
        if (prescriptionId) {
            markAsRead();
        }
    }, [prescriptionId, markAsRead]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleSendMessage = useCallback(
        (content: string) => {
            if (!content.trim() || isSending) return;

            sendMessage({
                message: content.trim(),
                senderType: 'pharmacy',
            });
        },
        [sendMessage, isSending]
    );

    const handleTypingStart = useCallback(() => {
        if (prescriptionId) {
            chatSocket.sendTypingStart(prescriptionId);
        }
    }, [prescriptionId]);

    const handleTypingStop = useCallback(() => {
        if (prescriptionId) {
            chatSocket.sendTypingStop(prescriptionId);
        }
    }, [prescriptionId]);

    const renderMessage = useCallback(
        ({ item }: { item: ChatMessage }) => {
            const bubbleMessage: MessageBubbleMessage = {
                id: item.id,
                roomId: prescriptionId,
                senderId: item.senderId,
                senderName: item.senderType === 'pharmacy' ? 'You' : patientName,
                content: item.message,
                timestamp: item.createdAt,
                isRead: true,
            };
            return (
                <MessageBubble
                    message={bubbleMessage}
                    isOwnMessage={item.senderType === 'pharmacy'}
                />
            );
        },
        [prescriptionId, patientName]
    );

    const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

    // Loading state
    if (isLoading && messages.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <ThemedText style={styles.avatarText}>{initials}</ThemedText>
                    </View>
                    <View style={styles.headerInfo}>
                        <ThemedText style={styles.headerName}>{patientName}</ThemedText>
                        <ThemedText style={[styles.headerSubtitle, { color: colors.placeholder }]}>
                            {prescriptionRef}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={[styles.loadingText, { color: colors.placeholder }]}>
                        Loading messages...
                    </ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <ThemedText style={styles.avatarText}>{initials}</ThemedText>
                    </View>
                    <View style={styles.headerInfo}>
                        <ThemedText style={styles.headerName}>{patientName}</ThemedText>
                        <ThemedText style={[styles.headerSubtitle, { color: colors.placeholder }]}>
                            {prescriptionRef}
                        </ThemedText>
                    </View>
                    <TouchableOpacity
                        style={styles.headerAction}
                        onPress={() => {
                            // Navigate to prescription detail
                            router.push({
                                pathname: '/prescription/[id]' as any,
                                params: { id: prescriptionId },
                            });
                        }}
                    >
                        <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={[
                        styles.messagesList,
                        messages.length === 0 && styles.emptyMessagesList,
                    ]}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-outline" size={48} color={colors.placeholder} />
                            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                                No messages yet
                            </ThemedText>
                            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                                Send a message to start the conversation
                            </ThemedText>
                        </View>
                    }
                />

                {/* Typing indicator */}
                {isPatientTyping && (
                    <View style={styles.typingIndicator}>
                        <ThemedText style={[styles.typingText, { color: colors.placeholder }]}>
                            {patientName} is typing...
                        </ThemedText>
                    </View>
                )}

                {/* Sending indicator */}
                {isSending && (
                    <View style={styles.sendingIndicator}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <ThemedText style={[styles.sendingText, { color: colors.placeholder }]}>
                            Sending...
                        </ThemedText>
                    </View>
                )}

                {/* Message Input */}
                <MessageInput
                    onSend={handleSendMessage}
                    onTypingStart={handleTypingStart}
                    onTypingStop={handleTypingStop}
                    disabled={isSending}
                    placeholder={`Message ${patientName}...`}
                />
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 60,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    headerAction: {
        padding: 8,
    },
    messagesList: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        flexGrow: 1,
    },
    emptyMessagesList: {
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
    },
    sendingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    sendingText: {
        fontSize: 12,
    },
    typingIndicator: {
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    typingText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});
