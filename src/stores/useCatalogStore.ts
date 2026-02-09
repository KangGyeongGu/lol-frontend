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
import { getItemIconPath, getSpellIconPath } from '@/shared/utils/assetMapper.util';

export const useCatalogStore = defineStore('catalog', () => {
    const algorithms = ref<AlgorithmViewModel[]>([]);
    const items = ref<ItemViewModel[]>([]);
    const spells = ref<SpellViewModel[]>([]);
    const isLoading = ref(false);

    // 성능 최적화: iconKey → iconPath 매핑 (O(1) 조회)
    const itemIconMap = ref<Map<string, string>>(new Map());
    const spellIconMap = ref<Map<string, string>>(new Map());

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

            // iconKey → iconPath 매핑 생성
            itemIconMap.value = new Map(
                items.value.map(item => [item.itemId, getItemIconPath(item.iconKey)])
            );
        } catch (error) {
            console.error('[CatalogStore] Fetch items error:', error);
            throw error;
        }
    }

    async function fetchSpells() {
        try {
            const response = await catalogApi.getSpells();
            spells.value = response.items.map(toSpellViewModel);

            // iconKey → iconPath 매핑 생성
            spellIconMap.value = new Map(
                spells.value.map(spell => [spell.spellId, getSpellIconPath(spell.iconKey)])
            );
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
        itemIconMap.value.clear();
        spellIconMap.value.clear();
        isLoading.value = false;
    }

    // 헬퍼 함수: O(1) 아이콘 경로 조회
    function getItemIcon(itemId: string): string {
        return itemIconMap.value.get(itemId) || '/icons/items/default.png';
    }

    function getSpellIcon(spellId: string): string {
        return spellIconMap.value.get(spellId) || '/icons/spells/default.png';
    }

    return {
        algorithms,
        items,
        spells,
        isLoading,
        itemIconMap,
        spellIconMap,
        fetchAlgorithms,
        fetchItems,
        fetchSpells,
        fetchAll,
        reset,
        getItemIcon,
        getSpellIcon,
    };
});
