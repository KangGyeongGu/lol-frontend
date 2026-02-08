import { stompClient } from './StompClient';
import { useChatStore } from '@/stores/useChatStore';
import { useRoomStore } from '@/stores/useRoomStore';
import type { ChatSendPayload } from '@/api/dtos/chat.dto';

interface StompEventPayload {
    type: string;
    data: Record<string, unknown>;
}

function asEvent(payload: unknown): StompEventPayload {
    return payload as StompEventPayload;
}

/**
 * EventDispatcher routes incoming STOMP messages to relevant Pinia stores.
 * This ensures UI updates reactively to server-side changes.
 * Also provides send methods for outbound messages.
 */
export class EventDispatcher {
    /**
     * Initialize global subscriptions and listeners.
     */
    static async init() {
        // Global Topics
        await stompClient.subscribe('/topic/chat/global', (raw) => {
            const payload = asEvent(raw);
            const chatStore = useChatStore();
            if (payload.type === 'CHAT_MESSAGE') {
                const data = payload.data as { message: string; sender: { nickname: string } };
                chatStore.receiveMessage('global', data.message, data.sender.nickname);
            }
        });

        await stompClient.subscribe('/topic/rooms/list', (raw) => {
            const payload = asEvent(raw);
            const roomStore = useRoomStore();
            if (payload.type === 'ROOM_LIST_UPSERT') {
                roomStore.handleRoomUpsert(payload.data.room as import('@/entities/room.model').RoomSummaryViewModel);
            } else if (payload.type === 'ROOM_LIST_REMOVED') {
                roomStore.handleRoomRemoved(payload.data.roomId as string);
            }
        });
    }

    private static roomCallback: ((type: string, data: unknown) => void) | null = null;

    /**
     * Subscribe to room-specific topics when entering a lobby.
     */
    static async subscribeToRoom(roomId: string, onEvent?: (type: string, data: unknown) => void) {
        this.roomCallback = onEvent || null;
        const chatTopic = `/topic/rooms/${roomId}/chat`;
        const lobbyTopic = `/topic/rooms/${roomId}/lobby`;

        await stompClient.subscribe(chatTopic, (raw) => {
            const payload = asEvent(raw);
            const chatStore = useChatStore();
            if (payload.type === 'CHAT_MESSAGE') {
                const data = payload.data as { message: string; sender: { nickname: string } };
                chatStore.receiveMessage(roomId, data.message, data.sender.nickname);
            }
        });

        await stompClient.subscribe(lobbyTopic, (raw) => {
            const payload = asEvent(raw);
            if (this.roomCallback) {
                this.roomCallback(payload.type, payload.data);
            }

            const roomStore = useRoomStore();
            roomStore.handleLobbyEvent(payload.type, payload.data);
        });
    }

    /**
     * Cleanup room subscriptions when leaving.
     */
    static unsubscribeFromRoom(roomId: string) {
        this.roomCallback = null;
        stompClient.unsubscribe(`/topic/rooms/${roomId}/chat`);
        stompClient.unsubscribe(`/topic/rooms/${roomId}/lobby`);
    }

    /**
     * Send a chat message via WebSocket
     * @param channelId - 'global' for global chat, or roomId for room chat
     * @param content - message content
     */
    static sendChatMessage(channelId: string, content: string) {
        const isGlobal = channelId === 'global';
        const payload: ChatSendPayload = {
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
}
