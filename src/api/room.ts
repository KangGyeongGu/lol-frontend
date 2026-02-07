import { apiClient } from '@/api/core';
import type {
    CreateRoomRequest,
    RoomDetail,
    PagedRoomList,
    GameType,
    RoomLanguage,
    RoomStatus
} from '@/api/dtos/room.types';

export interface RoomFilterParams {
    roomName?: string;
    hostName?: string;
    language?: RoomLanguage;
    gameType?: GameType;
    roomStatus?: RoomStatus;
    cursor?: string;
    limit?: number;
}

export const roomApi = {
    /**
     * 방 목록 조회 (검색/필터/페이징)
     */
    getRooms: (params?: RoomFilterParams) => {
        return apiClient.get<any, PagedRoomList>('/rooms', { params });
    },

    /**
     * 방 생성
     */
    createRoom: (req: CreateRoomRequest) => {
        return apiClient.post<any, RoomDetail>('/rooms', req);
    },

    /**
     * 방 상세 조회 (대기실 스냅샷)
     */
    getRoomDetail: (roomId: string) => {
        return apiClient.get<any, RoomDetail>(`/rooms/${roomId}`);
    },

    /**
     * 방 참가
     */
    joinRoom: (roomId: string) => {
        return apiClient.post<any, RoomDetail>(`/rooms/${roomId}/join`);
    },

    /**
     * 방 나가기
     */
    leaveRoom: (roomId: string) => {
        return apiClient.post<any, void>(`/rooms/${roomId}/leave`);
    }
};
