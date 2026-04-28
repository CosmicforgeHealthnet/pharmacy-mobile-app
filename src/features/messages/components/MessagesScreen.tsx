import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Input } from '@/shared/components/ui/Input';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────
interface Contact {
    id: string;
    patientName: string;
    prescriptionRef: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    avatar?: string;
}

interface ContactItemProps {
    contact: Contact;
    isSelected: boolean;
    onPress: () => void;
    colors: typeof Colors.light;
}

// ─── Contact Item ────────────────────────────────────
function ContactItem({ contact, isSelected, onPress, colors }: ContactItemProps) {
    return (
        <TouchableOpacity
            style={[
                styles.contactItem,
                { backgroundColor: isSelected ? `${colors.primary}10` : colors.background },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.avatarText}>
                    {contact.patientName.charAt(0).toUpperCase()}
                </ThemedText>
            </View>
            <View style={styles.contactInfo}>
                <View style={styles.contactHeader}>
                    <ThemedText style={styles.contactName} numberOfLines={1}>
                        {contact.patientName}
                    </ThemedText>
                    <ThemedText style={[styles.contactTime, { color: colors.placeholder }]}>
                        {contact.time}
                    </ThemedText>
                </View>
                <View style={styles.contactFooter}>
                    <ThemedText
                        style={[styles.lastMessage, { color: colors.placeholder }]}
                        numberOfLines={1}
                    >
                        {contact.lastMessage}
                    </ThemedText>
                    {contact.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <ThemedText style={styles.unreadCount}>
                                {contact.unreadCount}
                            </ThemedText>
                        </View>
                    )}
                </View>
                <ThemedText style={[styles.prescriptionRef, { color: colors.placeholder }]}>
                    {contact.prescriptionRef}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );
}

// ─── Empty State ─────────────────────────────────────
function EmptyState({ colors }: { colors: typeof Colors.light }) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.placeholder} />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                No conversations yet
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                Start a conversation with your patients
            </ThemedText>
        </View>
    );
}

// ─── Messages Screen ─────────────────────────────────
export function MessagesScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Mock data - replace with actual API data
    const contacts: Contact[] = [
        {
            id: '1',
            patientName: 'John Doe',
            prescriptionRef: 'RX-2024-001',
            lastMessage: 'Is my prescription ready for pickup?',
            time: '2m',
            unreadCount: 2,
        },
        {
            id: '2',
            patientName: 'Jane Smith',
            prescriptionRef: 'RX-2024-002',
            lastMessage: 'Thank you for the quick service!',
            time: '1h',
            unreadCount: 0,
        },
        {
            id: '3',
            patientName: 'Michael Brown',
            prescriptionRef: 'RX-2024-003',
            lastMessage: 'Can I get a refill on my medication?',
            time: '3h',
            unreadCount: 1,
        },
        {
            id: '4',
            patientName: 'Sarah Wilson',
            prescriptionRef: 'RX-2024-004',
            lastMessage: 'What are the side effects?',
            time: '1d',
            unreadCount: 0,
        },
        {
            id: '5',
            patientName: 'David Lee',
            prescriptionRef: 'RX-2024-005',
            lastMessage: 'I need to update my address',
            time: '2d',
            unreadCount: 0,
        },
    ];

    const filteredContacts = contacts.filter(
        (c) =>
            c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.prescriptionRef.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContact = ({ item }: { item: Contact }) => (
        <ContactItem
            contact={item}
            isSelected={selectedContact?.id === item.id}
            onPress={() => setSelectedContact(item)}
            colors={colors}
        />
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.headerTitle}>Messages</ThemedText>
                <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="create-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="search-outline" size={20} color={colors.placeholder} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search conversations..."
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

            {/* Contacts List */}
            <FlatList
                data={filteredContacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<EmptyState colors={colors} />}
                ItemSeparatorComponent={() => (
                    <View style={[styles.separator, { backgroundColor: colors.inputBackground }]} />
                )}
            />
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
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    headerAction: {
        padding: 4,
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
    contactFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
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
    prescriptionRef: {
        fontSize: 12,
        marginTop: 2,
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
});
