import { stompClient } from './StompClient';
import { useChatStore } from '@/stores/useChatStore';
import { useRoomStore } from '@/stores/useRoomStore';
import { useGameStore } from '@/stores/useGameStore';
import { useServerClock } from '@/shared/composables/useServerClock';
import type { StompEventEnvelope } from '@/shared/types/realtime.types';
import type { ChatSendPayload } from '@/api/dtos/chat.dto';
import type {
    GameStageChangedEvent,
    GameBanSubmittedEvent,
    GamePickSubmittedEvent,
    GameItemPurchasedEvent,
    GameSpellPurchasedEvent,
    GameFinishedEvent,
    Inventory,
} from '@/api/dtos/game.dto';

function asEnvelope(payload: unknown): StompEventEnvelope {
    return payload as StompEventEnvelope;
}

/**
 * 모든 이벤트의 meta.serverTime을 serverClock에 피딩한다.
 * TIME_SYNC뿐 아니라 모든 이벤트에서 오프셋을 갱신하여 정밀도를 높인다.
 */
function feedServerTime(envelope: StompEventEnvelope): void {
    if (envelope.meta?.serverTime) {
        const serverClock = useServerClock();
        serverClock.feedSample(envelope.meta.serverTime);
    }
}

/**
 * EventDispatcher routes incoming STOMP messages to relevant Pinia stores.
 * This ensures UI updates reactively to server-side changes.
 * Also provides send methods for outbound messages.
 */
export class EventDispatcher {
    /**
     * Initialize user queue subscriptions and global topic subscriptions.
     * LIFECYCLE.md 2.1: 로그인 완료 후 기본 구독 설정 (1회)
     */
    static async init() {
        // --- User Queues (LIFECYCLE.md 2.1) ---

        await stompClient.subscribe('/user/queue/errors', (raw) => {
            const envelope = asEnvelope(raw);
            feedServerTime(envelope);
            if (envelope.type === 'ERROR') {
                const data = envelope.data as { code: string; message: string };
                console.error('[EventDispatcher] Server error:', data.code, data.message);
            }
        });

        await stompClient.subscribe('/user/queue/time', (raw) => {
            const envelope = asEnvelope(raw);
            // TIME_SYNC의 목적이 오프셋 갱신이므로 feedServerTime으로 처리
            feedServerTime(envelope);
        });

        await stompClient.subscribe('/user/queue/rooms', (raw) => {
            const envelope = asEnvelope(raw);
            feedServerTime(envelope);
            if (envelope.type === 'ROOM_KICKED') {
                const data = envelope.data as { roomId: string };
                console.warn('[EventDispatcher] Kicked from room:', data.roomId);
                // TODO: roomStore.handleKicked(data.roomId) 구현 후 연결
            }
        });

        await stompClient.subscribe('/user/queue/inventory', (raw) => {
            const envelope = asEnvelope(raw);
            feedServerTime(envelope);
            if (envelope.type === 'INVENTORY_SYNC') {
                const gameStore = useGameStore();
                gameStore.handleInventorySync(
                    (envelope.data as { inventory: Inventory }).inventory,
                );
            }
        });

        // --- Global Topics ---

        await stompClient.subscribe('/topic/chat/global', (raw) => {
            const envelope = asEnvelope(raw);
            feedServerTime(envelope);
            if (envelope.type === 'CHAT_MESSAGE') {
                const chatStore = useChatStore();
                const data = envelope.data as { message: string; sender: { nickname: string } };
                chatStore.receiveMessage('global', data.message, data.sender.nickname);
            }
        });

        await stompClient.subscribe('/topic/rooms/list', (raw) => {
            const envelope = asEnvelope(raw);
            feedServerTime(envelope);
            const roomStore = useRoomStore();
            if (envelope.type === 'ROOM_LIST_UPSERT') {
                roomStore.handleRoomUpsert(
                    (envelope.data as { room: import('@/entities/room.model').RoomSummaryViewModel }).room,
                );
            } else if (envelope.type === 'ROOM_LIST_REMOVED') {
                roomStore.handleRoomRemoved(
                    (envelope.data as { roomId: string }).roomId,
                );
            }
        });
    }

    private static roomCallback: ((type: string, data: unknown) => void) | null = null;

    /**
     * Subscribe to room-specific topics when entering a lobby.
     */
    static async subscribeToRoom(roomId: string, onEvent?: (type: string, data: unknown) => void) {
        this.roomCallback = onEvent || null;

        await stompClient.subscribe(`/topic/rooms/${roomId}/chat`, (raw) => {
            const envelope = asEnvelope(raw);
            feedServerTime(envelope);
            if (envelope.type === 'CHAT_MESSAGE') {
                const chatStore = useChatStore();
                const data = envelope.data as { message: string; sender: { nickname: string } };
                chatStore.receiveMessage(roomId, data.message, data.sender.nickname);
            }
        });

        await stompClient.subscribe(`/topic/rooms/${roomId}/lobby`, (raw) => {
            const envelope = asEnvelope(raw);
            feedServerTime(envelope);
            if (this.roomCallback) {
                this.roomCallback(envelope.type, envelope.data);
            }
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
     * Subscribe to game topic when entering BAN/PICK/SHOP or IN_GAME page.
     */
    static async subscribeToGame(gameId: string) {
        await stompClient.subscribe(`/topic/games/${gameId}`, (raw) => {
            const envelope = asEnvelope(raw);
            feedServerTime(envelope);
            const gameStore = useGameStore();

            switch (envelope.type) {
                case 'GAME_STAGE_CHANGED':
                    gameStore.handleStageChanged(envelope.data as GameStageChangedEvent);
                    break;
                case 'GAME_BAN_SUBMITTED':
                    gameStore.handleBanSubmitted(envelope.data as GameBanSubmittedEvent);
                    break;
                case 'GAME_PICK_SUBMITTED':
                    gameStore.handlePickSubmitted(envelope.data as GamePickSubmittedEvent);
                    break;
                case 'GAME_ITEM_PURCHASED':
                    gameStore.handleItemPurchased(envelope.data as GameItemPurchasedEvent);
                    break;
                case 'GAME_SPELL_PURCHASED':
                    gameStore.handleSpellPurchased(envelope.data as GameSpellPurchasedEvent);
                    break;
                case 'GAME_FINISHED':
                    gameStore.handleGameFinished(envelope.data as GameFinishedEvent);
                    break;
            }
        });
    }

    /**
     * Cleanup game subscriptions when leaving.
     */
    static unsubscribeFromGame(gameId: string) {
        stompClient.unsubscribe(`/topic/games/${gameId}`);
    }

    /**
     * Send a chat message via WebSocket.
     */
    static sendChatMessage(channelId: string, content: string) {
        const isGlobal = channelId === 'global';
        const payload: ChatSendPayload = {
            type: 'CHAT_SEND',
            data: {
                channelType: isGlobal ? 'GLOBAL' : 'INGAME',
                roomId: isGlobal ? null : channelId.replace('room-', ''),
                message: content,
                clientMessageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
        };

        stompClient.send('/app/chat.send', payload);
    }
}
