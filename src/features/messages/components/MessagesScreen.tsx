import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useMemo, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePharmacyContacts } from '../hooks';
import type { PharmacyContact } from '../types';
import { formatMessageTime, getInitials } from '../types';

// ─── Contact Item ────────────────────────────────────
function ContactItem({
    contact,
    onPress,
    colors,
}: {
    contact: PharmacyContact;
    onPress: () => void;
    colors: typeof Colors.light;
}) {
    const initials = getInitials(contact.patientName);

    return (
        <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.background }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <ThemedText style={styles.avatarText}>{initials}</ThemedText>
                </View>
                {contact.isOnline && (
                    <View style={[styles.onlineIndicator, { borderColor: colors.background }]} />
                )}
            </View>

            {/* Info */}
            <View style={styles.contactInfo}>
                <View style={styles.contactHeader}>
                    <ThemedText style={styles.contactName} numberOfLines={1}>
                        {contact.patientName}
                    </ThemedText>
                    {contact.lastMessageAt && (
                        <ThemedText style={[styles.contactTime, { color: colors.placeholder }]}>
                            {formatMessageTime(contact.lastMessageAt)}
                        </ThemedText>
                    )}
                </View>
                <ThemedText style={[styles.prescriptionRef, { color: colors.primary }]}>
                    {contact.prescriptionRef}
                </ThemedText>
                <View style={styles.contactFooter}>
                    <ThemedText
                        style={[styles.lastMessage, { color: colors.placeholder }]}
                        numberOfLines={1}
                    >
                        {contact.lastMessage || 'No messages yet'}
                    </ThemedText>
                    {(contact.unreadCount ?? 0) > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <ThemedText style={styles.unreadCount}>
                                {contact.unreadCount}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Loading Skeleton ─────────────────────────────────
function LoadingSkeleton({ colors }: { colors: typeof Colors.light }) {
    return (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={[styles.skeletonItem, { backgroundColor: colors.background }]}>
                    <View style={[styles.skeletonAvatar, { backgroundColor: colors.inputBackground }]} />
                    <View style={styles.skeletonInfo}>
                        <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.inputBackground }]} />
                        <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.inputBackground }]} />
                        <View style={[styles.skeletonLine, { width: '80%', backgroundColor: colors.inputBackground }]} />
                    </View>
                </View>
            ))}
        </View>
    );
}

// ─── Empty State ─────────────────────────────────────
function EmptyState({ colors, hasSearch }: { colors: typeof Colors.light; hasSearch: boolean }) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.placeholder} />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                {hasSearch ? 'No results found' : 'No conversations yet'}
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                {hasSearch
                    ? 'Try a different search term'
                    : 'Patient conversations will appear here once prescriptions are assigned.'}
            </ThemedText>
        </View>
    );
}

// ─── Messages Screen ─────────────────────────────────
export function MessagesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch contacts from API
    const { data: contacts = [], isLoading, refetch, isRefetching } = usePharmacyContacts();

    // Filter contacts based on search
    const filteredContacts = useMemo(() => {
        if (!searchTerm.trim()) return contacts;
        const query = searchTerm.toLowerCase();
        return contacts.filter(
            (c) =>
                c.patientName.toLowerCase().includes(query) ||
                c.prescriptionRef.toLowerCase().includes(query)
        );
    }, [contacts, searchTerm]);

    // Count total unread
    const totalUnread = useMemo(() => {
        return contacts.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
    }, [contacts]);

    const onRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleContactPress = useCallback(
        (contact: PharmacyContact) => {
            router.push({
                pathname: `/chat/${contact.prescriptionId}`,
                params: {
                    prescriptionId: contact.prescriptionId,
                    patientName: contact.patientName,
                    prescriptionRef: contact.prescriptionRef,
                },
            } as any);
        },
        [router]
    );

    const renderContact = useCallback(
        ({ item }: { item: PharmacyContact }) => (
            <ContactItem
                contact={item}
                onPress={() => handleContactPress(item)}
                colors={colors}
            />
        ),
        [colors, handleContactPress]
    );

    const keyExtractor = useCallback((item: PharmacyContact) => item.prescriptionId, []);

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <View style={styles.headerLeft}>
                    <ThemedText style={styles.headerTitle}>Messages</ThemedText>
                    {totalUnread > 0 && (
                        <View style={[styles.totalUnreadBadge, { backgroundColor: colors.primary }]}>
                            <ThemedText style={styles.totalUnreadText}>{totalUnread}</ThemedText>
                        </View>
                    )}
                </View>
                <View style={styles.headerRight}>
                    {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="search-outline" size={20} color={colors.placeholder} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by name or prescription..."
                        placeholderTextColor={colors.placeholder}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results Count */}
            {!isLoading && contacts.length > 0 && (
                <View style={styles.resultsContainer}>
                    <ThemedText style={[styles.resultsText, { color: colors.placeholder }]}>
                        {filteredContacts.length} conversation{filteredContacts.length !== 1 ? 's' : ''}
                    </ThemedText>
                </View>
            )}

            {/* Contacts List */}
            {isLoading && !contacts.length ? (
                <LoadingSkeleton colors={colors} />
            ) : (
                <FlatList
                    data={filteredContacts}
                    renderItem={renderContact}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <EmptyState colors={colors} hasSearch={searchTerm.length > 0} />
                    }
                    ItemSeparatorComponent={() => (
                        <View style={[styles.separator, { backgroundColor: colors.inputBackground }]} />
                    )}
                />
            )}
        </ThemedView>
    );
}

// ─── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    totalUnreadBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    totalUnreadText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    headerRight: {
        width: 24,
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    resultsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    resultsText: {
        fontSize: 13,
    },
    listContent: {
        flexGrow: 1,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22C55E',
        borderWidth: 2,
    },
    contactInfo: {
        flex: 1,
    },
    contactHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    contactTime: {
        fontSize: 12,
    },
    prescriptionRef: {
        fontSize: 12,
        marginTop: 2,
    },
    contactFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        marginLeft: 78,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    skeletonContainer: {
        paddingTop: 8,
    },
    skeletonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    skeletonAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    skeletonInfo: {
        flex: 1,
        gap: 6,
    },
    skeletonLine: {
        height: 12,
        borderRadius: 4,
    },
});
