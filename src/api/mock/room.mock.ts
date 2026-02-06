import { registerMock } from './registry';
import type { PagedRoomList, RoomDetail } from '../dtos/room.types';

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

// Mock 핸들러 등록
registerMock('GET', '/rooms', () => mockRooms);

registerMock('POST', '/rooms', (config: any) => {
    const body = JSON.parse(config.data);
    return {
        ...body,
        roomId: `new-room-${Math.random().toString(36).substr(2, 9)}`,
        players: [
            {
                user: { userId: 'me', nickname: 'MySelf', tier: 'GOLD', score: 1500 },
                state: 'READY',
                isHost: true
            }
        ]
    } as RoomDetail;
});

registerMock('GET', '/rooms/{roomId}', (config: any) => {
    return {
        roomId: config.url?.split('/').pop() || 'room-001',
        roomName: 'Mocked Room Detail',
        gameType: 'NORMAL',
        language: 'PYTHON',
        maxPlayers: 4,
        players: [
            {
                user: { userId: 'host', nickname: 'MockHost', tier: 'PLATINUM', score: 2000 },
                state: 'READY',
                isHost: true
            }
        ]
    } as RoomDetail;
});

registerMock('POST', '/rooms/{roomId}/join', () => {
    return {
        roomId: 'joined-room',
        roomName: 'Joined via Mock',
        gameType: 'NORMAL',
        language: 'PYTHON',
        maxPlayers: 4,
        players: []
    } as RoomDetail;
});
