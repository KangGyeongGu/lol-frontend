import { registerMock, mockRegistry } from './registry';
import type { PagedRoomList, RoomDetail } from '../dtos/room.types';
import type { AxiosRequestConfig } from 'axios';

// 방 목록 Mock 데이터
const mockRooms: PagedRoomList = {
    items: [
        {
            roomId: 'room-001',
            roomName: '입문자 환영 - 파이썬 기초',
            gameType: 'NORMAL',
            language: 'PYTHON',
            maxPlayers: 4,
            currentPlayers: 1,
            roomStatus: 'WAITING',
            joinable: true,
            updatedAt: new Date().toISOString()
        },
        {
            roomId: 'room-002',
            roomName: '자바 최적화 끝판왕 (랭크)',
            gameType: 'RANKED',
            language: 'JAVA',
            maxPlayers: 2,
            currentPlayers: 2,
            roomStatus: 'IN_GAME',
            joinable: false,
            updatedAt: new Date().toISOString()
        },
        {
            roomId: 'room-003',
            roomName: 'C++ 고수들만 오세요',
            gameType: 'NORMAL',
            language: 'CPP',
            maxPlayers: 6,
            currentPlayers: 3,
            roomStatus: 'WAITING',
            joinable: true,
            updatedAt: new Date().toISOString()
        },
        {
            roomId: 'room-004',
            roomName: '자바스크립트 클로저 마스터',
            gameType: 'NORMAL',
            language: 'JAVASCRIPT',
            maxPlayers: 4,
            currentPlayers: 1,
            roomStatus: 'WAITING',
            joinable: true,
            updatedAt: new Date().toISOString()
        }
    ],
    page: {
        limit: 20,
        nextCursor: null
    },
    listVersion: 1
};

registerMock('GET', '/rooms', () => mockRooms);

registerMock('POST', '/rooms', (config: AxiosRequestConfig) => {
    const body = JSON.parse(config.data);
    return {
        ...body,
        roomId: `new-room-${Math.random().toString(36).substr(2, 9)}`,
        players: [
            {
                user: { userId: 'host-user-01', nickname: 'DevHost', tier: 'GOLD', score: 1200 },
                state: 'READY',
                isHost: true
            }
        ]
    } as RoomDetail;
});

registerMock('GET', '/rooms/{roomId}', (config: AxiosRequestConfig) => {
    const roomId = config.url?.split('/').pop() || 'room-001';

    const rooms: Record<string, RoomDetail> = {
        'room-001': {
            roomId: 'room-001',
            roomName: '입문자 환영 - 파이썬 기초',
            gameType: 'NORMAL',
            language: 'PYTHON',
            maxPlayers: 4,
            players: [
                { user: { userId: 'host-1', nickname: 'PyHost', tier: 'PLATINUM', score: 2100 }, state: 'READY', isHost: true },
                { user: { userId: 'host-user-01', nickname: 'DevHost', tier: 'GOLD', score: 1200 }, state: 'READY', isHost: false }
            ]
        },
        'room-002': {
            roomId: 'room-002',
            roomName: '자바 최적화 끝판왕 (랭크)',
            gameType: 'RANKED',
            language: 'JAVA',
            maxPlayers: 2,
            players: [
                { user: { userId: 'master', nickname: 'JavaMaster', tier: 'CHALLENGER', score: 3500 }, state: 'READY', isHost: true },
                { user: { userId: 'host-user-01', nickname: 'DevHost', tier: 'GOLD', score: 1200 }, state: 'READY', isHost: false }
            ]
        },
        'room-003': {
            roomId: 'room-003',
            roomName: 'C++ 고수들만 오세요',
            gameType: 'NORMAL',
            language: 'CPP',
            maxPlayers: 6,
            players: [
                { user: { userId: 'host-3', nickname: 'CppGod', tier: 'DIAMOND', score: 2800 }, state: 'READY', isHost: true },
                { user: { userId: 'p2', nickname: 'MemoryLeak', tier: 'SILVER', score: 800 }, state: 'READY', isHost: false },
                { user: { userId: 'host-user-01', nickname: 'DevHost', tier: 'GOLD', score: 1200 }, state: 'READY', isHost: false }
            ]
        },
        'room-004': {
            roomId: 'room-004',
            roomName: '자바스크립트 클로저 마스터',
            gameType: 'NORMAL',
            language: 'JAVASCRIPT',
            maxPlayers: 4,
            players: [
                { user: { userId: 'host-4', nickname: 'ClosureKing', tier: 'PLATINUM', score: 2300 }, state: 'READY', isHost: true },
                { user: { userId: 'host-user-01', nickname: 'DevHost', tier: 'GOLD', score: 1200 }, state: 'READY', isHost: false }
            ]
        }
    };

    return rooms[roomId] || rooms['room-001'];
});

registerMock('POST', '/rooms/{roomId}/join', (config: AxiosRequestConfig) => {
    const pathParts = config.url?.split('/').filter(Boolean) || [];
    const roomId = pathParts[pathParts.length - 2] || 'room-001';

    // 조인 시에는 해당 방 정보를 그대로 반환 (사용자가 포함된 상태로 가정)
    const getRegistry = mockRegistry.GET || {};
    const mockHandler = getRegistry[`/rooms/${roomId}`];
    if (typeof mockHandler === 'function') return mockHandler(config);
    return mockHandler || { roomId, roomName: 'Joined Room', gameType: 'NORMAL', language: 'PYTHON', maxPlayers: 6, players: [] };
});

registerMock('POST', '/rooms/{roomId}/leave', () => {
    return { success: true };
});
