import { stompClient } from './StompClient';
import { useChatStore } from '@/features/chat/model/useChatStore';
import { useRoomStore } from '@/stores/useRoomStore';

/**
 * EventDispatcher routes incoming STOMP messages to relevant Pinia stores.
 * This ensures UI updates reactively to server-side changes.
 */
export class EventDispatcher {
    /**
     * Initialize global subscriptions and listeners.
     */
    static async init() {
        // Global Topics
        await stompClient.subscribe('/topic/chat/global', (payload) => {
            const chatStore = useChatStore();
            if (payload.type === 'CHAT_MESSAGE') {
                chatStore.receiveMessage('global', payload.data.message, payload.data.sender.nickname);
            }
        });

        await stompClient.subscribe('/topic/rooms/list', (payload) => {
            const roomStore = useRoomStore();
            if (payload.type === 'ROOM_LIST_UPSERT') {
                roomStore.handleRoomUpsert(payload.data.room);
            } else if (payload.type === 'ROOM_LIST_REMOVED') {
                roomStore.handleRoomRemoved(payload.data.roomId);
            }
        });
    }

    private static roomCallback: ((type: string, data: any) => void) | null = null;

    /**
     * Subscribe to room-specific topics when entering a lobby.
     */
    static async subscribeToRoom(roomId: string, onEvent?: (type: string, data: any) => void) {
        this.roomCallback = onEvent || null;
        const chatTopic = `/topic/rooms/${roomId}/chat`;
        const lobbyTopic = `/topic/rooms/${roomId}/lobby`;

        await stompClient.subscribe(chatTopic, (payload) => {
            const chatStore = useChatStore();
            if (payload.type === 'CHAT_MESSAGE') {
                chatStore.receiveMessage(roomId, payload.data.message, payload.data.sender.nickname);
            }
        });

        await stompClient.subscribe(lobbyTopic, (payload) => {
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
}
