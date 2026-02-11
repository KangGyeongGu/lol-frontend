import { defineStore } from 'pinia';
import { ref } from 'vue';
import { EventDispatcher } from '@/realtime/EventDispatcher';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ChatMessage } from '@/api/dtos/chat.dto';

/**
 * useChatStore manages chat messages for multiple channels.
 * - Stores messages per channel (global, room-specific)
 * - Sends messages via EventDispatcher (not direct WebSocket)
 * - Receives messages from EventDispatcher subscriptions
 * - Manages typing status for room channels
 */
export const useChatStore = defineStore('chat', () => {
    const messages = ref<Record<string, ChatMessage[]>>({});
    const typingUsers = ref<Record<string, Set<string>>>({});
    const userNicknames = ref<Record<string, string>>({}); // userId -> nickname mapping
    const processedEventIds = ref<Set<string>>(new Set());
    const authStore = useAuthStore();

    // --- Event Deduplication ---

    function shouldProcessEvent(eventId: string): boolean {
        if (processedEventIds.value.has(eventId)) {
            if (import.meta.env.DEV) {
                console.warn('[ChatStore] Duplicate event detected:', eventId);
            }
            return false;
        }

        processedEventIds.value.add(eventId);

        // Keep only recent 1000 IDs for memory management
        if (processedEventIds.value.size > 1000) {
            const iter = processedEventIds.value.values();
            const firstValue = iter.next().value;
            if (firstValue !== undefined) {
                processedEventIds.value.delete(firstValue);
            }
        }

        return true;
    }

    function getMessages(channelId: string) {
        const id = channelId === 'global' ? 'global' : channelId;
        if (!messages.value[id]) {
            messages.value[id] = [];
        }
        return messages.value[id];
    }

    /**
     * Send message to server via EventDispatcher
     */
    function publishMessage(channelId: string, content: string) {
        if (import.meta.env.DEV) {
            console.log('[ChatStore] publishMessage called:', { channelId, content });
        }
        EventDispatcher.sendChatMessage(channelId, content);
    }

    /**
     * Handle incoming message from WebSocket (called by EventDispatcher)
     * Accepts full CHAT_MESSAGE payload from server (messageId, message, sender, createdAt)
     */
    function receiveMessage(
        channelId: string,
        data: { messageId: string; message: string; sender: { userId: string; nickname: string }; createdAt: string },
        eventId: string
    ) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        const id = channelId === 'global' ? 'global' : channelId;
        if (import.meta.env.DEV) {
            console.log('[ChatStore] receiveMessage:', {
                channelId,
                normalizedId: id,
                messageId: data.messageId,
                content: data.message,
                sender: data.sender.nickname,
                createdAt: data.createdAt,
                currentUser: authStore.user?.nickname,
            });
        }
        const channelMessages = getMessages(id);

        // Format server timestamp (ISO-8601 UTC) to local time display
        const timestamp = new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newMessage: ChatMessage = {
            id: data.messageId, // Use server-provided messageId
            sender: data.sender.nickname,
            content: data.message,
            timestamp, // Use server createdAt formatted to local time
            isMe: authStore.user?.nickname === data.sender.nickname
        };

        channelMessages.push(newMessage);

        // Keep only last 50 messages
        if (channelMessages.length > 50) {
            channelMessages.shift();
        }

        if (import.meta.env.DEV) {
            console.log('[ChatStore] Message added. Total messages for', id, ':', channelMessages.length);
        }
    }

    function clearMessages(channelId: string) {
        messages.value[channelId] = [];
    }

    /**
     * Register nickname for a user (called when players list is loaded)
     */
    function registerNickname(userId: string, nickname: string) {
        userNicknames.value[userId] = nickname;
    }

    /**
     * Handle typing status update from WebSocket (called by EventDispatcher)
     */
    function handleTypingStatus(roomId: string, userId: string, isTyping: boolean, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        if (!typingUsers.value[roomId]) {
            typingUsers.value[roomId] = new Set();
        }

        // Don't show typing status for current user
        if (authStore.user?.userId === userId) {
            return;
        }

        if (isTyping) {
            typingUsers.value[roomId].add(userId);
        } else {
            typingUsers.value[roomId].delete(userId);
        }
    }

    /**
     * Get list of typing user nicknames for a room
     */
    function getTypingUsers(roomId: string): string[] {
        if (!typingUsers.value[roomId]) {
            return [];
        }
        return Array.from(typingUsers.value[roomId])
            .map(userId => userNicknames.value[userId] || userId)
            .filter(Boolean);
    }

    /**
     * Clear typing status for a room
     */
    function clearTypingStatus(roomId: string) {
        delete typingUsers.value[roomId];
    }

    return {
        messages,
        typingUsers,
        userNicknames,
        getMessages,
        publishMessage,
        receiveMessage,
        clearMessages,
        registerNickname,
        handleTypingStatus,
        getTypingUsers,
        clearTypingStatus
    };
});
