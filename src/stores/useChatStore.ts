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
 */
export const useChatStore = defineStore('chat', () => {
    const messages = ref<Record<string, ChatMessage[]>>({});
    const authStore = useAuthStore();

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
        console.log('[ChatStore] publishMessage called:', { channelId, content });
        EventDispatcher.sendChatMessage(channelId, content);
    }

    /**
     * Handle incoming message from WebSocket (called by EventDispatcher)
     */
    function receiveMessage(channelId: string, content: string, sender: string) {
        const id = channelId === 'global' ? 'global' : channelId;
        console.log('[ChatStore] receiveMessage:', {
            channelId,
            normalizedId: id,
            content,
            sender,
            currentUser: authStore.user?.nickname,
        });
        const channelMessages = getMessages(id);

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: authStore.user?.nickname === sender
        };

        // Prevent duplicate local messages if the server echoes back (though we don't push locally on publish yet)
        channelMessages.push(newMessage);

        // Keep only last 50 messages
        if (channelMessages.length > 50) {
            channelMessages.shift();
        }

        console.log('[ChatStore] Message added. Total messages for', id, ':', channelMessages.length);
    }

    function clearMessages(channelId: string) {
        messages.value[channelId] = [];
    }

    return {
        messages,
        getMessages,
        publishMessage,
        receiveMessage,
        clearMessages
    };
});
