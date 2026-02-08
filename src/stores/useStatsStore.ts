import { defineStore } from 'pinia';
import { ref } from 'vue';
import { statsApi } from '@/api/stats';
import type { PlayerRanking, AlgorithmPickBanRate } from '@/api/dtos/stats.types';

export const useStatsStore = defineStore('stats', () => {
    const playerRankings = ref<PlayerRanking[]>([]);
    const pickBanRates = ref<AlgorithmPickBanRate[]>([]);
    const isLoading = ref(false);

    async function fetchRankings() {
        isLoading.value = true;
        try {
            const response = await statsApi.getPlayerRankings();
            playerRankings.value = response.items;
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
            pickBanRates.value = response.items;
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
