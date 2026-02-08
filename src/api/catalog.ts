import { apiClient } from '@/api/core';
import type { ListOfAlgorithms, ListOfItems, ListOfSpells } from '@/api/dtos/catalog.dto';

export const catalogApi = {
    /**
     * 알고리즘 목록 조회
     */
    getAlgorithms: () => {
        return apiClient.get<void, ListOfAlgorithms>('/catalog/algorithms');
    },

    /**
     * 아이템 목록 조회
     */
    getItems: () => {
        return apiClient.get<void, ListOfItems>('/catalog/items');
    },

    /**
     * 스펠 목록 조회
     */
    getSpells: () => {
        return apiClient.get<void, ListOfSpells>('/catalog/spells');
    },
};
