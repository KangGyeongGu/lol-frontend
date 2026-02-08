import { onMounted, onUnmounted } from 'vue';
import { EventDispatcher } from '@/realtime/EventDispatcher';
import type { RoomEventData } from '@/api/dtos/room.dto';

/**
 * 대기실 페이지 전용 composable: 실시간 구독 관리
 * EventDispatcher를 사용하여 특정 방의 이벤트를 구독하고 해제합니다.
 */
export function useRoomSubscription(roomId: string, onUpdate: (type: string, data: RoomEventData) => void) {
    onMounted(() => {
        EventDispatcher.subscribeToRoom(roomId, onUpdate as (type: string, data: unknown) => void);
    });

    onUnmounted(() => {
        EventDispatcher.unsubscribeFromRoom(roomId);
    });
}
