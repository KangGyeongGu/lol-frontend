import type {
    RoomSummary,
    RoomDetail,
    RoomPlayer,
    ActiveGame,
    GameType,
    GameStage,
    Language,
    PageRoute,
    RoomStatus,
    PlayerState
} from '@/api/dtos/room.dto';
import { toUserViewModel, type UserViewModel } from './auth.model';

// Re-export types
export type { GameType, GameStage, Language, PageRoute, RoomStatus, PlayerState };

// ViewModel 타입 정의
export interface RoomSummaryViewModel {
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

export interface RoomPlayerViewModel {
    user: UserViewModel;
    state: PlayerState;
    isHost: boolean;
}

export interface RoomDetailViewModel {
    roomId: string;
    roomName: string;
    gameType: GameType;
    language: Language;
    maxPlayers: number;
    players: RoomPlayerViewModel[];
    stage: GameStage;
    pageRoute: PageRoute;
}

// DTO → ViewModel 변환 함수
export function toRoomSummaryViewModel(dto: RoomSummary): RoomSummaryViewModel {
    return { ...dto };
}

export function toRoomPlayerViewModel(dto: RoomPlayer): RoomPlayerViewModel {
    return {
        user: toUserViewModel(dto.user),
        state: dto.state,
        isHost: dto.isHost
    };
}

export function toRoomDetailViewModel(dto: RoomDetail): RoomDetailViewModel {
    return {
        roomId: dto.roomId,
        roomName: dto.roomName,
        gameType: dto.gameType,
        language: dto.language,
        maxPlayers: dto.maxPlayers,
        players: dto.players.map(toRoomPlayerViewModel),
        stage: dto.stage,
        pageRoute: dto.pageRoute
    };
}

export interface ActiveGameViewModel {
    gameId: string;
    roomId: string;
    stage: GameStage;
    pageRoute: PageRoute;
    gameType: GameType;
    remainingMs: number | null;
}

export function toActiveGameViewModel(dto: ActiveGame): ActiveGameViewModel {
    return { ...dto };
}
