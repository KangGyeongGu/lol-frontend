import type { UserSummary } from './auth.dto';

export type GameType = 'NORMAL' | 'RANKED';
export type Language = 'JAVA' | 'PYTHON' | 'CPP' | 'JAVASCRIPT';
export type PlayerState = 'READY' | 'UNREADY' | 'DISCONNECTED';
export type GameStage = 'LOBBY' | 'BAN' | 'PICK' | 'SHOP' | 'PLAY' | 'FINISHED';
export type RoomStatus = 'WAITING' | 'IN_GAME';
export type PageRoute = 'WAITING_ROOM' | 'BAN_PICK_SHOP' | 'IN_GAME';
export type MatchResult = 'WIN' | 'LOSE' | 'DRAW';

export interface PageCursor {
    limit: number;
    nextCursor: string | null;
}

// Re-export UserSummary from auth.dto to avoid duplication
export type { UserSummary };

export interface RoomSummary {
    roomId: string;
    roomName: string;
    gameType: GameType;
    language: Language;
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
    language: Language;
    maxPlayers: number;
}

export interface RoomPlayer {
    user: UserSummary;
    state: PlayerState;
    isHost: boolean;
}

export interface RoomDetail {
    roomId: string;
    roomName: string;
    gameType: GameType;
    language: Language;
    maxPlayers: number;
    players: RoomPlayer[];
    stage: GameStage;
    pageRoute: PageRoute;
}

export interface ActiveGame {
    gameId: string;
    roomId: string;
    stage: GameStage;
    pageRoute: PageRoute;
    gameType: GameType;
    remainingMs: number | null;
}

export interface RoomGameStartedEvent {
    roomId: string;
    gameId: string;
    gameType: GameType;
    stage: GameStage;
    pageRoute: PageRoute;
    stageStartedAt: string;
    stageDeadlineAt: string;
    remainingMs: number;
}

export interface RoomEventData {
    pageRoute?: PageRoute;
    stage?: GameStage;
    [key: string]: unknown;
}

export interface RoomFilterParams {
    roomName?: string;
    hostName?: string;
    language?: Language;
    gameType?: GameType;
    roomStatus?: RoomStatus;
    cursor?: string;
    limit?: number;
}
