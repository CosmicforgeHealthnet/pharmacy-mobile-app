import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useChatMessages, useSendChatMessage, useMarkAsRead } from '../hooks';
import type { ChatMessage } from '../types';
import { formatChatTime, getInitials } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const flatListRef = useRef<FlatList>(null);

    // Get contact info from route params
    const prescriptionId = (params.prescriptionId as string) || (params.id as string) || '';
    const patientName = (params.patientName as string) || 'Patient';
    const prescriptionRef = (params.prescriptionRef as string) || '';

    const initials = getInitials(patientName);

    // Fetch messages from API
    const { data: messages = [], isLoading, refetch } = useChatMessages(prescriptionId);

    // Mutations
    const { mutate: sendMessage, isPending: isSending } = useSendChatMessage(prescriptionId);
    const { mutate: markAsRead } = useMarkAsRead(prescriptionId);

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
        // TODO: Implement WebSocket typing indicator
    }, []);

    const handleTypingStop = useCallback(() => {
        // TODO: Implement WebSocket typing indicator
    }, []);

    const renderMessage = useCallback(
        ({ item }: { item: ChatMessage }) => (
            <MessageBubble
                message={{
                    id: item.id,
                    roomId: prescriptionId,
                    senderId: item.senderId,
                    senderName: item.senderType === 'pharmacy' ? 'You' : patientName,
                    content: item.message,
                    timestamp: item.createdAt,
                    isRead: true,
                }}
                isOwnMessage={item.senderType === 'pharmacy'}
            />
        ),
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
});
