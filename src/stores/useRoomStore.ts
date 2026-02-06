import { defineStore } from 'pinia';
import { ref } from 'vue';
import { roomApi, type RoomFilterParams } from '@/api/room';
import type { RoomSummary, CreateRoomRequest } from '@/api/dtos/room.types';

export const useRoomStore = defineStore('room', () => {
    const rooms = ref<RoomSummary[]>([]);
    const totalRoomsCount = ref(0);
    const isLoading = ref(false);
    const listVersion = ref(0);

    async function fetchRooms(params?: RoomFilterParams) {
        isLoading.value = true;
        try {
            const response = await roomApi.getRooms(params);
            rooms.value = response.items;
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

    return {
        rooms,
        isLoading,
        listVersion,
        totalRoomsCount,
        fetchRooms,
        createRoom,
        joinRoom
    };
});
