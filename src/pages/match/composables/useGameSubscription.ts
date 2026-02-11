import { onMounted, onUnmounted } from 'vue';
import { EventDispatcher } from '@/realtime/EventDispatcher';

/**
 * Game page composable: 게임 실시간 구독 관리
 * - /topic/games/{gameId} 구독/해제 (모든 게임 페이지)
 * - /topic/rooms/{roomId}/typing 구독/해제 (IN_GAME 페이지 전용, TOPICS.md § 3)
 * - User queue는 init()에서 1회 설정되므로 여기서 관리하지 않는다 (LIFECYCLE.md 2.1)
 */
export function useGameSubscription(gameId: string, options?: { roomId?: string; enableTyping?: boolean }) {
    onMounted(async () => {
        await EventDispatcher.subscribeToGame(gameId);

        // IN_GAME 페이지에서만 typing 구독
        if (options?.enableTyping && options?.roomId) {
            await EventDispatcher.subscribeToTyping(options.roomId);
        }
    });

    onUnmounted(() => {
        EventDispatcher.unsubscribeFromGame(gameId);

        // typing 구독 해제
        if (options?.enableTyping && options?.roomId) {
            EventDispatcher.unsubscribeFromTyping(options.roomId);
        }
    });
}
