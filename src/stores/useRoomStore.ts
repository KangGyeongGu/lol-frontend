import { defineStore } from 'pinia';
import { ref } from 'vue';
import { roomApi } from '@/api/room';
import type { CreateRoomRequest, RoomFilterParams } from '@/api/dtos/room.dto';
import {
    toRoomSummaryViewModel,
    toRoomDetailViewModel,
    toActiveGameViewModel,
    type RoomSummaryViewModel,
    type RoomDetailViewModel,
    type ActiveGameViewModel
} from '@/entities/room.model';

export const useRoomStore = defineStore('room', () => {
    const rooms = ref<RoomSummaryViewModel[]>([]);
    const totalRoomsCount = ref(0);
    const isLoading = ref(false);
    const listVersion = ref(0);
    const processedEventIds = ref<Set<string>>(new Set());

    // --- Event Deduplication ---

    function shouldProcessEvent(eventId: string): boolean {
        if (processedEventIds.value.has(eventId)) {
            if (import.meta.env.DEV) {
                console.warn('[RoomStore] Duplicate event detected:', eventId);
            }
            return false;
        }

        processedEventIds.value.add(eventId);

        // Keep only recent 1000 IDs for memory management
        if (processedEventIds.value.size > 1000) {
            const iter = processedEventIds.value.values();
            const firstValue = iter.next().value;
            if (firstValue !== undefined) {
                processedEventIds.value.delete(firstValue);
            }
        }

        return true;
    }

    async function fetchRooms(params?: RoomFilterParams) {
        isLoading.value = true;
        try {
            const response = await roomApi.getRooms(params);
            rooms.value = response.items.map(toRoomSummaryViewModel);
            listVersion.value = response.listVersion;
            // TODO: 필요한 경우 페이징 처리를 위한 전체 카운트 처리 추가
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] Fetch error:', error);
            }
        } finally {
            isLoading.value = false;
        }
    }

    async function createRoom(req: CreateRoomRequest): Promise<RoomDetailViewModel> {
        try {
            const dto = await roomApi.createRoom(req);
            return toRoomDetailViewModel(dto);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] Create error:', error);
            }
            throw error;
        }
    }

    async function joinRoom(roomId: string): Promise<RoomDetailViewModel> {
        try {
            const dto = await roomApi.joinRoom(roomId);
            return toRoomDetailViewModel(dto);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] Join error:', error);
            }
            throw error;
        }
    }

    async function getRoomDetail(roomId: string): Promise<RoomDetailViewModel> {
        try {
            const dto = await roomApi.getRoomDetail(roomId);
            return toRoomDetailViewModel(dto);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] GetRoomDetail error:', error);
            }
            throw error;
        }
    }

    async function leaveRoom(roomId: string) {
        try {
            await roomApi.leaveRoom(roomId);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] Leave error:', error);
            }
            throw error;
        }
    }

    async function ready(roomId: string): Promise<RoomDetailViewModel> {
        try {
            const dto = await roomApi.ready(roomId);
            return toRoomDetailViewModel(dto);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] Ready error:', error);
            }
            throw error;
        }
    }

    async function unready(roomId: string): Promise<RoomDetailViewModel> {
        try {
            const dto = await roomApi.unready(roomId);
            return toRoomDetailViewModel(dto);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] Unready error:', error);
            }
            throw error;
        }
    }

    async function startGame(roomId: string): Promise<ActiveGameViewModel> {
        try {
            const dto = await roomApi.startGame(roomId);
            return toActiveGameViewModel(dto);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] StartGame error:', error);
            }
            throw error;
        }
    }

    async function kickPlayer(roomId: string, userId: string) {
        try {
            await roomApi.kickPlayer(roomId, userId);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[RoomStore] Kick error:', error);
            }
            throw error;
        }
    }

    // --- Real-time Handlers ---

    function handleRoomUpsert(room: RoomSummaryViewModel, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        const index = rooms.value.findIndex(r => r.roomId === room.roomId);
        if (index !== -1) {
            rooms.value[index] = room;
        } else {
            rooms.value.unshift(room);
        }
    }

    function handleRoomRemoved(roomId: string, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        rooms.value = rooms.value.filter(r => r.roomId !== roomId);
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
        handleRoomRemoved
    };
});
