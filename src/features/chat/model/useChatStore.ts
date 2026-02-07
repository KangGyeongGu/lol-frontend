import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isMe: boolean;
}

export const useChatStore = defineStore('chat', () => {
    const messages = ref<Record<string, ChatMessage[]>>({});

    function getMessages(channelId: string) {
        if (!messages.value[channelId]) {
            messages.value[channelId] = [];
        }
        return messages.value[channelId];
    }

    function sendMessage(channelId: string, content: string, sender: string) {
        const channelMessages = getMessages(channelId);
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };
        channelMessages.push(newMessage);
    }

    function receiveMessage(channelId: string, content: string, sender: string) {
        const channelMessages = getMessages(channelId);
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false
        };
        channelMessages.push(newMessage);
    }

    function clearMessages(channelId: string) {
        messages.value[channelId] = [];
    }

    return {
        messages,
        getMessages,
        sendMessage,
        receiveMessage,
        clearMessages
    };
});
