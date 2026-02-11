import type {
    PlayerRanking,
    AlgorithmPickBanRate,
    UserStats,
    MatchSummary
} from '@/api/dtos/stats.dto';

// ViewModel 타입 정의
export interface PlayerRankingViewModel {
    rank: number;
    userId: string;
    nickname: string;
    score: number;
    tier: string;
}

export interface AlgorithmPickBanRateViewModel {
    algorithmId: string;
    name: string;
    pickRate: number;
    banRate: number;
}

/**
 * 유저 통계 ViewModel
 * UI에서 사용하기 편한 필드명 사용
 */
export interface UserStatsViewModel {
    totalGames: number;   // games → totalGames (UI friendly)
    totalWin: number;     // wins → totalWin (UI friendly)
    totalLose: number;    // losses → totalLose (UI friendly)
    totalDraw: number;    // draws → totalDraw (UI friendly)
    winRate: number;      // 승률 (0-100)
    // avgRank, solvedRate는 OPENAPI spec에 없음 - 필요시 별도 API로 제공
}

/**
 * 매치 요약 ViewModel
 */
export interface MatchSummaryViewModel {
    matchId: string;
    roomName: string;
    gameType: 'RANKED' | 'NORMAL';
    result: 'WIN' | 'LOSE' | 'DRAW';
    finalPlayers: number;  // 게임 종료 시점 플레이어 수 (2-6)
    playedAt: string;      // ISO 8601
}

// DTO → ViewModel 변환 함수
export function toPlayerRankingViewModel(dto: PlayerRanking): PlayerRankingViewModel {
    return { ...dto };
}

export function toAlgorithmPickBanRateViewModel(dto: AlgorithmPickBanRate): AlgorithmPickBanRateViewModel {
    return { ...dto };
}

/**
 * UserStats DTO를 ViewModel로 변환
 * DTO 필드명 → UI 친화적 필드명 변환
 */
export function toUserStatsViewModel(dto: UserStats): UserStatsViewModel {
    return {
        totalGames: dto.games,
        totalWin: dto.wins,
        totalLose: dto.losses,
        totalDraw: dto.draws,
        winRate: dto.winRate
    };
}

/**
 * MatchSummary DTO를 ViewModel로 변환
 */
export function toMatchSummaryViewModel(dto: MatchSummary): MatchSummaryViewModel {
    return { ...dto };
}
