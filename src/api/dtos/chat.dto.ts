/**
 * Chat-related data transfer objects and view models
 */

/**
 * ViewModel for a single chat message
 */
export interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isMe: boolean;
}

/**
 * Payload for sending a chat message via WebSocket
 */
export interface ChatSendPayload {
    type: 'CHAT_SEND';
    data: {
        channelType: 'GLOBAL' | 'INGAME';
        roomId: string | null;
        message: string;
        clientMessageId: string;
    };
}
