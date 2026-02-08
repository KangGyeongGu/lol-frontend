import { apiClient } from '@/api/core';
import type { ListOfPlayerRankings, ListOfAlgorithmPickBanRates } from '@/api/dtos/stats.types';

export const statsApi = {
    /**
     * 실시간 플레이어 점수 랭킹 조회
     */
    getPlayerRankings: () => {
        return apiClient.get<any, ListOfPlayerRankings>('/stats/realtime/player-rankings');
    },

    /**
     * 실시간 알고리즘 밴/픽률 조회
     */
    getAlgorithmPickBanRates: () => {
        return apiClient.get<any, ListOfAlgorithmPickBanRates>('/stats/realtime/algorithm-pick-ban-rates');
    }
};
