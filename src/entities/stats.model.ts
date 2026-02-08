import type { PlayerRanking, AlgorithmPickBanRate } from '@/api/dtos/stats.dto';

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

// DTO → ViewModel 변환 함수
export function toPlayerRankingViewModel(dto: PlayerRanking): PlayerRankingViewModel {
    return { ...dto };
}

export function toAlgorithmPickBanRateViewModel(dto: AlgorithmPickBanRate): AlgorithmPickBanRateViewModel {
    return { ...dto };
}
