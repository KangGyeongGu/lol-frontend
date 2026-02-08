import { defineStore } from 'pinia';
import { ref } from 'vue';
import { statsApi } from '@/api/stats';
import {
    toPlayerRankingViewModel,
    toAlgorithmPickBanRateViewModel,
    type PlayerRankingViewModel,
    type AlgorithmPickBanRateViewModel
} from '@/entities/stats.model';

export const useStatsStore = defineStore('stats', () => {
    const playerRankings = ref<PlayerRankingViewModel[]>([]);
    const pickBanRates = ref<AlgorithmPickBanRateViewModel[]>([]);
    const isLoading = ref(false);

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

    return {
        playerRankings,
        pickBanRates,
        isLoading,
        fetchRankings,
        fetchPickBanRates
    };
});
