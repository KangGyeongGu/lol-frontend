import { defineStore } from 'pinia';
import { ref } from 'vue';
import { catalogApi } from '@/api/catalog';
import {
    toAlgorithmViewModel,
    toItemViewModel,
    toSpellViewModel,
    type AlgorithmViewModel,
    type ItemViewModel,
    type SpellViewModel,
} from '@/entities/catalog.model';

export const useCatalogStore = defineStore('catalog', () => {
    const algorithms = ref<AlgorithmViewModel[]>([]);
    const items = ref<ItemViewModel[]>([]);
    const spells = ref<SpellViewModel[]>([]);
    const isLoading = ref(false);

    async function fetchAlgorithms() {
        try {
            const response = await catalogApi.getAlgorithms();
            algorithms.value = response.items.map(toAlgorithmViewModel);
        } catch (error) {
            console.error('[CatalogStore] Fetch algorithms error:', error);
            throw error;
        }
    }

    async function fetchItems() {
        try {
            const response = await catalogApi.getItems();
            items.value = response.items.map(toItemViewModel);
        } catch (error) {
            console.error('[CatalogStore] Fetch items error:', error);
            throw error;
        }
    }

    async function fetchSpells() {
        try {
            const response = await catalogApi.getSpells();
            spells.value = response.items.map(toSpellViewModel);
        } catch (error) {
            console.error('[CatalogStore] Fetch spells error:', error);
            throw error;
        }
    }

    async function fetchAll() {
        isLoading.value = true;
        try {
            await Promise.all([fetchAlgorithms(), fetchItems(), fetchSpells()]);
        } finally {
            isLoading.value = false;
        }
    }

    function reset() {
        algorithms.value = [];
        items.value = [];
        spells.value = [];
        isLoading.value = false;
    }

    return {
        algorithms,
        items,
        spells,
        isLoading,
        fetchAlgorithms,
        fetchItems,
        fetchSpells,
        fetchAll,
        reset,
    };
});
