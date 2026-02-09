import { defineStore } from 'pinia';
import { ref } from 'vue';
import { statsApi } from '@/api/stats';
import {
    toPlayerRankingViewModel,
    toAlgorithmPickBanRateViewModel,
    toUserStatsViewModel,
    toMatchSummaryViewModel,
    type PlayerRankingViewModel,
    type AlgorithmPickBanRateViewModel,
    type UserStatsViewModel,
    type MatchSummaryViewModel
} from '@/entities/stats.model';

export const useStatsStore = defineStore('stats', () => {
    const playerRankings = ref<PlayerRankingViewModel[]>([]);
    const pickBanRates = ref<AlgorithmPickBanRateViewModel[]>([]);
    const isLoading = ref(false);

    // 유저 통계 관련 상태
    const myStats = ref<UserStatsViewModel | null>(null);
    const myMatches = ref<MatchSummaryViewModel[]>([]);
    const matchesCursor = ref<string | null>(null);
    const isLoadingStats = ref(false);
    const isLoadingMatches = ref(false);

    async function fetchRankings() {
        isLoading.value = true;
        try {
            const response = await statsApi.getPlayerRankings();
            playerRankings.value = response.items.map(toPlayerRankingViewModel);
        } catch (error) {
            console.error('[StatsStore] Fetch rankings error:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchPickBanRates() {
        isLoading.value = true;
        try {
            const response = await statsApi.getAlgorithmPickBanRates();
            pickBanRates.value = response.items.map(toAlgorithmPickBanRateViewModel);
        } catch (error) {
            console.error('[StatsStore] Fetch rates error:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchMyStats() {
        isLoadingStats.value = true;
        try {
            const response = await statsApi.getMyStats();
            myStats.value = toUserStatsViewModel(response);
        } catch (error) {
            console.error('[StatsStore] Fetch my stats error:', error);
            throw error;
        } finally {
            isLoadingStats.value = false;
        }
    }

    async function fetchMyMatches(cursor?: string, limit = 20) {
        isLoadingMatches.value = true;
        try {
            const response = await statsApi.getMyMatches({ cursor, limit });
            myMatches.value = response.items.map(toMatchSummaryViewModel);
            matchesCursor.value = response.page.nextCursor;
        } catch (error) {
            console.error('[StatsStore] Fetch my matches error:', error);
            throw error;
        } finally {
            isLoadingMatches.value = false;
        }
    }

    return {
        playerRankings,
        pickBanRates,
        isLoading,
        fetchRankings,
        fetchPickBanRates,
        myStats,
        myMatches,
        matchesCursor,
        isLoadingStats,
        isLoadingMatches,
        fetchMyStats,
        fetchMyMatches
    };
});
