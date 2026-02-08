import { defineStore } from 'pinia';
import { ref } from 'vue';
import { stompClient } from '@/api/realtime/StompClient';
import { useAuthStore } from '@/stores/useAuthStore';

export interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isMe: boolean;
}

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
     * Send message to server via WebSocket
     */
    function publishMessage(channelId: string, content: string) {
        const isGlobal = channelId === 'global';
        const payload = {
            type: 'CHAT_SEND',
            data: {
                channelType: isGlobal ? 'GLOBAL' : 'INGAME',
                roomId: isGlobal ? null : channelId.replace('room-', ''),
                message: content,
                clientMessageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
        };

        stompClient.send('/app/chat.send', payload);
    }

    /**
     * Handle incoming message from WebSocket
     */
    function receiveMessage(channelId: string, content: string, sender: string) {
        const id = channelId === 'global' ? 'global' : channelId;
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
