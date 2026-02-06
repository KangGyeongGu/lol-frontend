import { defineStore } from 'pinia';
import { ref } from 'vue';
import { roomApi } from '@/api/room';
import type { RoomSummary, CreateRoomRequest } from '@/api/dtos/room.types';

export const useRoomStore = defineStore('room', () => {
    const rooms = ref<RoomSummary[]>([]);
    const isLoading = ref(false);

    async function fetchRooms() {
        isLoading.value = true;
        try {
            // MOCK DATA for now if API not ready
            // rooms.value = await roomApi.getRooms();
            await new Promise(r => setTimeout(r, 500)); // Simluate latency
            rooms.value = [
                { roomId: '1', hostId: 'h1', hostNickname: 'AlgoMaster', title: '초보자 환영', gameMode: 'SPEED', status: 'WAITING', currentPlayers: 1, maxPlayers: 4, roomType: 'NORMAL', language: 'PYTHON' },
                { roomId: '2', hostId: 'h2', hostNickname: 'JavaGosu', title: '자바 최적화 대결', gameMode: 'OPTIMIZATION', status: 'PLAYING', currentPlayers: 4, maxPlayers: 4, roomType: 'RANK', language: 'JAVA' },
                { roomId: '3', hostId: 'h3', hostNickname: 'CppWiz', title: 'C++ 전문가만 오세요', gameMode: 'SPEED', status: 'WAITING', currentPlayers: 2, maxPlayers: 8, roomType: 'RANK', language: 'CPP' },
                { roomId: '4', hostId: 'h4', hostNickname: 'RustLover', title: 'Memory Safe Battle', gameMode: 'OPTIMIZATION', status: 'WAITING', currentPlayers: 1, maxPlayers: 2, roomType: 'NORMAL', language: 'RUST' },
                { roomId: '5', hostId: 'h5', hostNickname: 'GoFan', title: 'Concurrency Challenge', gameMode: 'SPEED', status: 'WAITING', currentPlayers: 3, maxPlayers: 6, roomType: 'NORMAL', language: 'GO' },
                { roomId: '6', hostId: 'h6', hostNickname: 'JsNinja', title: 'Hoisting Mastery', gameMode: 'OPTIMIZATION', status: 'WAITING', currentPlayers: 1, maxPlayers: 4, roomType: 'RANK', language: 'JS' },
                { roomId: '7', hostId: 'h7', hostNickname: 'TsHardcore', title: 'Strict Type Only', gameMode: 'SPEED', status: 'WAITING', currentPlayers: 5, maxPlayers: 10, roomType: 'RANK', language: 'TS' },
                { roomId: '8', hostId: 'h8', hostNickname: 'RubyKing', title: 'Elegant Code Match', gameMode: 'OPTIMIZATION', status: 'WAITING', currentPlayers: 2, maxPlayers: 2, roomType: 'NORMAL', language: 'RUBY' },
                { roomId: '9', hostId: 'h9', hostNickname: 'SwiftDev', title: 'iOS Dev Showdown', gameMode: 'SPEED', status: 'WAITING', currentPlayers: 1, maxPlayers: 4, roomType: 'NORMAL', language: 'SWIFT' },
                { roomId: '10', hostId: 'h10', hostNickname: 'KotlinPro', title: 'Android Style Battle', gameMode: 'OPTIMIZATION', status: 'WAITING', currentPlayers: 3, maxPlayers: 4, roomType: 'RANK', language: 'KOTLIN' },
                { roomId: '11', hostId: 'h11', hostNickname: 'PhpGhost', title: 'Legacy code war', gameMode: 'SPEED', status: 'WAITING', currentPlayers: 1, maxPlayers: 6, roomType: 'NORMAL', language: 'PHP' },
                { roomId: '12', hostId: 'h12', hostNickname: 'DartFly', title: 'Flutter Coding', gameMode: 'OPTIMIZATION', status: 'WAITING', currentPlayers: 1, maxPlayers: 2, roomType: 'RANK', language: 'DART' }
            ];
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
        }
    }

    async function createRoom(req: CreateRoomRequest) {
        const room = await roomApi.createRoom(req);
        // After create, usually navigate to WaitingRoom
        return room;
    }

    return {
        rooms,
        isLoading,
        fetchRooms,
        createRoom
    };
});
