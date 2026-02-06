import { apiClient } from '@/api/core';
import type { RoomSummary, CreateRoomRequest, JoinRoomResponse } from '@/api/dtos/room.types';

export const roomApi = {
    // Temporary: Fetch via HTTP until WebSocket listing is ready
    getRooms: () => {
        return apiClient.get<any, RoomSummary[]>('/rooms');
    },

    createRoom: (req: CreateRoomRequest) => {
        return apiClient.post<any, RoomSummary>('/rooms', req);
    },

    joinRoom: (roomId: string) => {
        return apiClient.post<any, JoinRoomResponse>(`/rooms/${roomId}/join`);
    }
};
