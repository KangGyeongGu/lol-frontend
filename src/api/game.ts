import { apiClient } from '@/api/core';
import type {
    GameState,
    BanPickRequest,
    ShopItemRequest,
    ShopSpellRequest,
} from '@/api/dtos/game.dto';

export const gameApi = {
    /**
     * 게임 상태 조회
     */
    getGameState: (gameId: string) => {
        return apiClient.get<void, GameState>(`/games/${gameId}/state`);
    },

    /**
     * 밴 제출
     */
    submitBan: (gameId: string, req: BanPickRequest) => {
        return apiClient.post<BanPickRequest, GameState>(`/games/${gameId}/ban`, req);
    },

    /**
     * 픽 제출
     */
    submitPick: (gameId: string, req: BanPickRequest) => {
        return apiClient.post<BanPickRequest, GameState>(`/games/${gameId}/pick`, req);
    },

    /**
     * 아이템 구매
     */
    purchaseItem: (gameId: string, req: ShopItemRequest) => {
        return apiClient.post<ShopItemRequest, GameState>(`/games/${gameId}/shop/items`, req);
    },

    /**
     * 스펠 구매
     */
    purchaseSpell: (gameId: string, req: ShopSpellRequest) => {
        return apiClient.post<ShopSpellRequest, GameState>(`/games/${gameId}/shop/spells`, req);
    },
};
