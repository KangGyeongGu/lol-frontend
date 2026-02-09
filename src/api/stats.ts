import { apiClient } from '@/api/core';
import type {
    ListOfPlayerRankings,
    ListOfAlgorithmPickBanRates,
    UserStats,
    PagedMatchList
} from '@/api/dtos/stats.dto';

export const statsApi = {
    /**
     * 실시간 플레이어 점수 랭킹 조회
     */
    getPlayerRankings: () => {
        return apiClient.get<void, ListOfPlayerRankings>('/stats/realtime/player-rankings');
    },

    /**
     * 실시간 알고리즘 밴/픽률 조회
     */
    getAlgorithmPickBanRates: () => {
        return apiClient.get<void, ListOfAlgorithmPickBanRates>('/stats/realtime/algorithm-pick-ban-rates');
    },

    /**
     * 내 통계 조회
     * GET /users/me/stats
     */
    getMyStats: () => {
        return apiClient.get<void, UserStats>('/users/me/stats');
    },

    /**
     * 내 매치 히스토리 조회 (커서 기반 페이지네이션)
     * GET /users/me/matches
     * OPENAPI.yaml.md line 835-884
     */
    getMyMatches: (params?: { cursor?: string; limit?: number }) => {
        return apiClient.get<void, PagedMatchList>('/users/me/matches', { params });
    }
};
