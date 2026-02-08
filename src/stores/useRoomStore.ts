import { defineStore } from 'pinia';
import { ref } from 'vue';
import { roomApi } from '@/api/room';
import type { CreateRoomRequest, RoomFilterParams } from '@/api/dtos/room.dto';
import {
    toRoomSummaryViewModel,
    toRoomDetailViewModel,
    type RoomSummaryViewModel,
    type RoomDetailViewModel
} from '@/entities/room.model';

export const useRoomStore = defineStore('room', () => {
    const rooms = ref<RoomSummaryViewModel[]>([]);
    const totalRoomsCount = ref(0);
    const isLoading = ref(false);
    const listVersion = ref(0);

    async function fetchRooms(params?: RoomFilterParams) {
        isLoading.value = true;
        try {
            const response = await roomApi.getRooms(params);
            rooms.value = response.items.map(toRoomSummaryViewModel);
            listVersion.value = response.listVersion;
            // TODO: 필요한 경우 페이징 처리를 위한 전체 카운트 처리 추가
        } catch (error) {
            console.error('[RoomStore] Fetch error:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function createRoom(req: CreateRoomRequest) {
        try {
            const roomDetail = await roomApi.createRoom(req);
            return roomDetail;
        } catch (error) {
            console.error('[RoomStore] Create error:', error);
            throw error;
        }
    }

    async function joinRoom(roomId: string) {
        try {
            const roomDetail = await roomApi.joinRoom(roomId);
            return roomDetail;
        } catch (error) {
            console.error('[RoomStore] Join error:', error);
            throw error;
        }
    }

    async function getRoomDetail(roomId: string): Promise<RoomDetailViewModel> {
        try {
            const dto = await roomApi.getRoomDetail(roomId);
            return toRoomDetailViewModel(dto);
        } catch (error) {
            console.error('[RoomStore] GetRoomDetail error:', error);
            throw error;
        }
    }

    async function leaveRoom(roomId: string) {
        try {
            await roomApi.leaveRoom(roomId);
        } catch (error) {
            console.error('[RoomStore] Leave error:', error);
            throw error;
        }
    }

    async function ready(roomId: string): Promise<RoomDetailViewModel> {
        try {
            const dto = await roomApi.ready(roomId);
            return toRoomDetailViewModel(dto);
        } catch (error) {
            console.error('[RoomStore] Ready error:', error);
            throw error;
        }
    }

    async function unready(roomId: string): Promise<RoomDetailViewModel> {
        try {
            const dto = await roomApi.unready(roomId);
            return toRoomDetailViewModel(dto);
        } catch (error) {
            console.error('[RoomStore] Unready error:', error);
            throw error;
        }
    }

    async function startGame(roomId: string) {
        try {
            await roomApi.startGame(roomId);
        } catch (error) {
            console.error('[RoomStore] StartGame error:', error);
            throw error;
        }
    }

    async function kickPlayer(roomId: string, userId: string) {
        try {
            await roomApi.kickPlayer(roomId, userId);
        } catch (error) {
            console.error('[RoomStore] Kick error:', error);
            throw error;
        }
    }

    // --- Real-time Handlers ---

    function handleRoomUpsert(room: RoomSummaryViewModel) {
        const index = rooms.value.findIndex(r => r.roomId === room.roomId);
        if (index !== -1) {
            rooms.value[index] = room;
        } else {
            rooms.value.unshift(room);
        }
    }

    function handleRoomRemoved(roomId: string) {
        rooms.value = rooms.value.filter(r => r.roomId !== roomId);
    }

    function handleLobbyEvent(_type: string, _data: unknown) {
        // 실제 인게임 진입 등 중요한 상태 변화는 페이지에서 처리
    }

    return {
        rooms,
        isLoading,
        listVersion,
        totalRoomsCount,
        fetchRooms,
        getRoomDetail,
        createRoom,
        joinRoom,
        leaveRoom,
        ready,
        unready,
        startGame,
        kickPlayer,
        handleRoomUpsert,
        handleRoomRemoved,
        handleLobbyEvent
    };
});
