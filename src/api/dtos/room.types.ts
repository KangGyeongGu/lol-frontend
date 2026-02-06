export type GameType = 'NORMAL' | 'RANKED';
export type RoomLanguage = 'JAVA' | 'PYTHON' | 'CPP' | 'JAVASCRIPT';
export type RoomStatus = 'WAITING' | 'IN_GAME';

export interface PageCursor {
    limit: number;
    nextCursor: string | null;
}

export interface RoomSummary {
    roomId: string;
    roomName: string;
    gameType: GameType;
    language: RoomLanguage;
    maxPlayers: number;
    currentPlayers: number;
    roomStatus: RoomStatus;
    joinable: boolean;
    updatedAt: string;
}

export interface PagedRoomList {
    items: RoomSummary[];
    page: PageCursor;
    listVersion: number;
}

export interface CreateRoomRequest {
    roomName: string;
    gameType: GameType;
    language: RoomLanguage;
    maxPlayers: number;
}

export interface RoomPlayer {
    user: {
        userId: string;
        nickname: string;
        tier: string;
        score: number;
    };
    state: 'READY' | 'UNREADY' | 'DISCONNECTED';
    isHost: boolean;
}

export interface RoomDetail {
    roomId: string;
    roomName: string;
    gameType: GameType;
    language: RoomLanguage;
    maxPlayers: number;
    players: RoomPlayer[];
}
