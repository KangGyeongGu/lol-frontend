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
 */
export interface UserStatsViewModel {
    totalGames: number;
    totalWin: number;
    totalLose: number;
    totalDraw: number;
    avgRank: number;
    winRate: number;
    solvedRate: number;
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
 */
export function toUserStatsViewModel(dto: UserStats): UserStatsViewModel {
    return { ...dto };
}

/**
 * MatchSummary DTO를 ViewModel로 변환
 */
export function toMatchSummaryViewModel(dto: MatchSummary): MatchSummaryViewModel {
    return { ...dto };
}
