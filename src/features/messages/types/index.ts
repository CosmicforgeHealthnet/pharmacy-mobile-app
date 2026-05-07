// Message types for the pharmacy messaging feature

// Contact from pharmacy contacts endpoint
export interface PharmacyContact {
    patientId: string;
    patientName: string;
    prescriptionId: string;
    prescriptionRef: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount?: number;
    isOnline?: boolean;
}

// Chat message from prescription.chatMessages
export interface ChatMessage {
    id: string;
    senderType: 'pharmacy' | 'patient';
    senderId: string;
    message: string;
    createdAt: string;
}

// Send message payload
export interface SendMessagePayload {
    message: string;
    senderType: 'pharmacy' | 'patient';
}

// Typing indicator for real-time
export interface TypingIndicator {
    roomId: string;
    odUserId: string;
    userName: string;
    isTyping: boolean;
}

// Legacy types for backwards compatibility
export interface Contact {
    id: string;
    patientName: string;
    prescriptionRef: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    avatar?: string;
}

export interface AppointmentChat {
    id: string;
    appointmentId: string;
    participants: string[];
    createdAt: string;
    endedAt?: string;
    status: 'active' | 'ended';
}

// Helper functions
export function formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export function formatChatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}
