import { onMounted, onUnmounted } from 'vue';
import { EventDispatcher } from '@/realtime/EventDispatcher';

/**
 * BAN/PICK/SHOP 페이지 전용 composable: 게임 실시간 구독 관리
 * - /topic/games/{gameId} 구독/해제
 * - User queue는 init()에서 1회 설정되므로 여기서 관리하지 않는다 (LIFECYCLE.md 2.1)
 */
export function useGameSubscription(gameId: string) {
    onMounted(async () => {
        await EventDispatcher.subscribeToGame(gameId);
    });

    onUnmounted(() => {
        EventDispatcher.unsubscribeFromGame(gameId);
    });
}
