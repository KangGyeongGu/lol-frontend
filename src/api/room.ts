import { apiClient } from '@/api/core';
import type {
    CreateRoomRequest,
    RoomDetail,
    PagedRoomList,
    RoomFilterParams
} from '@/api/dtos/room.dto';

export const roomApi = {
    /**
     * 방 목록 조회 (검색/필터/페이징)
     */
    getRooms: (params?: RoomFilterParams) => {
        return apiClient.get<void, PagedRoomList>('/rooms', { params });
    },

    /**
     * 방 생성
     */
    createRoom: (req: CreateRoomRequest) => {
        return apiClient.post<CreateRoomRequest, RoomDetail>('/rooms', req);
    },

    /**
     * 방 상세 조회 (대기실 스냅샷)
     */
    getRoomDetail: (roomId: string) => {
        return apiClient.get<void, RoomDetail>(`/rooms/${roomId}`);
    },

    /**
     * 방 참가
     */
    joinRoom: (roomId: string) => {
        return apiClient.post<void, RoomDetail>(`/rooms/${roomId}/join`);
    },

    /**
     * 방 나가기
     */
    leaveRoom: (roomId: string) => {
        return apiClient.post<void, void>(`/rooms/${roomId}/leave`);
    },

    /**
     * READY 상태 전환
     */
    ready: (roomId: string) => {
        return apiClient.post<void, RoomDetail>(`/rooms/${roomId}/ready`);
    },

    /**
     * UNREADY 상태 전환
     */
    unready: (roomId: string) => {
        return apiClient.post<void, RoomDetail>(`/rooms/${roomId}/unready`);
    },

    /**
     * 게임 시작 (방장 전용)
     */
    startGame: (roomId: string) => {
        return apiClient.post<void, import('@/api/dtos/room.dto').ActiveGame>(`/rooms/${roomId}/start`);
    },

    /**
     * 플레이어 강퇴 (방장 전용)
     */
    kickPlayer: (roomId: string, targetUserId: string) => {
        return apiClient.post<{ targetUserId: string }, RoomDetail>(`/rooms/${roomId}/kick`, { targetUserId });
    }
};
