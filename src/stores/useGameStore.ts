import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { gameApi } from '@/api/game';
import { useServerClock } from '@/shared/composables/useServerClock';
import type {
    BanPickRequest,
    ShopItemRequest,
    ShopSpellRequest,
    SubmissionRequest,
} from '@/api/dtos/game.dto';
import {
    toGameStateViewModel,
    toStageChangedViewModel,
    toBanSubmittedViewModel,
    toPickSubmittedViewModel,
    toItemPurchasedViewModel,
    toSpellPurchasedViewModel,
    toGameFinishedViewModel,
    toInventoryViewModel,
    type GameStateViewModel,
    type GameFinishedViewModel,
} from '@/entities/game.model';
import type { GameStage } from '@/api/dtos/room.dto';
import type {
    GameStageChangedEvent,
    GameBanSubmittedEvent,
    GamePickSubmittedEvent,
    GameItemPurchasedEvent,
    GameSpellPurchasedEvent,
    GameFinishedEvent,
    Inventory,
    ItemEffectAppliedEvent,
    SpellEffectAppliedEvent,
    ItemEffectBlockedEvent,
    EffectRemovedEvent,
} from '@/api/dtos/game.dto';

export interface BanPickEntry {
    userId: string;
    algorithmId: string;
}

export const useGameStore = defineStore('game', () => {
    const gameState = ref<GameStateViewModel | null>(null);
    const stageDeadlineAt = ref<string | null>(null);
    const bans = ref<BanPickEntry[]>([]);
    const picks = ref<BanPickEntry[]>([]);
    const gameResult = ref<GameFinishedViewModel | null>(null);
    const isLoading = ref(false);
    const processedEventIds = ref<Set<string>>(new Set());

    const stage = computed<GameStage | null>(() => gameState.value?.stage ?? null);
    const gameId = computed<string | null>(() => gameState.value?.gameId ?? null);
    const roomId = computed<string | null>(() => gameState.value?.roomId ?? null);

    // --- Event Deduplication ---

    function shouldProcessEvent(eventId: string): boolean {
        if (processedEventIds.value.has(eventId)) {
            if (import.meta.env.DEV) {
                console.warn('[GameStore] Duplicate event detected:', eventId);
            }
            return false;
        }

        processedEventIds.value.add(eventId);

        // Keep only recent 1000 IDs for memory management
        if (processedEventIds.value.size > 1000) {
            const iter = processedEventIds.value.values();
            const firstValue = iter.next().value;
            if (firstValue !== undefined) {
                processedEventIds.value.delete(firstValue);
            }
        }

        return true;
    }

    // --- REST Actions ---

    async function fetchGameState(id: string) {
        isLoading.value = true;
        try {
            const dto = await gameApi.getGameState(id);
            gameState.value = toGameStateViewModel(dto);
            // remainingMs로 stageDeadlineAt 역산 (WS GAME_STAGE_CHANGED 도착 전 부트스트랩)
            if (dto.remainingMs > 0) {
                const serverClock = useServerClock();
                stageDeadlineAt.value = new Date(
                    serverClock.estimatedServerNow() + dto.remainingMs,
                ).toISOString();
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[GameStore] Fetch state error:', error);
            }
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function submitBan(id: string, req: BanPickRequest): Promise<GameStateViewModel> {
        try {
            const dto = await gameApi.submitBan(id, req);
            gameState.value = toGameStateViewModel(dto);
            return gameState.value;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[GameStore] Submit ban error:', error);
            }
            throw error;
        }
    }

    async function submitPick(id: string, req: BanPickRequest): Promise<GameStateViewModel> {
        try {
            const dto = await gameApi.submitPick(id, req);
            gameState.value = toGameStateViewModel(dto);
            return gameState.value;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[GameStore] Submit pick error:', error);
            }
            throw error;
        }
    }

    async function purchaseItem(id: string, req: ShopItemRequest): Promise<GameStateViewModel> {
        try {
            const dto = await gameApi.purchaseItem(id, req);
            gameState.value = toGameStateViewModel(dto);
            return gameState.value;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[GameStore] Purchase item error:', error);
            }
            throw error;
        }
    }

    async function purchaseSpell(id: string, req: ShopSpellRequest): Promise<GameStateViewModel> {
        try {
            const dto = await gameApi.purchaseSpell(id, req);
            gameState.value = toGameStateViewModel(dto);
            return gameState.value;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[GameStore] Purchase spell error:', error);
            }
            throw error;
        }
    }

    async function submitCode(id: string, req: SubmissionRequest): Promise<GameStateViewModel> {
        try {
            const dto = await gameApi.submitCode(id, req);
            gameState.value = toGameStateViewModel(dto);
            return gameState.value;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[GameStore] Submit code error:', error);
            }
            throw error;
        }
    }

    // --- Real-time Event Handlers ---

    function handleStageChanged(data: GameStageChangedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        const vm = toStageChangedViewModel(data);
        stageDeadlineAt.value = vm.stageDeadlineAt;

        if (gameState.value) {
            gameState.value = {
                ...gameState.value,
                stage: vm.stage,
                gameType: vm.gameType,
                remainingMs: vm.remainingMs,
            };
        }

        // 새 단계 진입 시 밴/픽 목록 초기화
        if (vm.stage === 'BAN') {
            bans.value = [];
        } else if (vm.stage === 'PICK') {
            picks.value = [];
        }
    }

    function handleBanSubmitted(data: GameBanSubmittedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        const vm = toBanSubmittedViewModel(data);
        bans.value = [...bans.value, { userId: vm.userId, algorithmId: vm.algorithmId }];
    }

    function handlePickSubmitted(data: GamePickSubmittedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        const vm = toPickSubmittedViewModel(data);
        picks.value = [...picks.value, { userId: vm.userId, algorithmId: vm.algorithmId }];
    }

    function handleItemPurchased(data: GameItemPurchasedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        const vm = toItemPurchasedViewModel(data);
        // NOTE: Coin is NOT updated here (server-authoritative principle).
        // Coin updates come from REST responses only:
        // 1. fetchGameState() - GET /games/{id}/state
        // 2. purchaseItem() - POST /games/{id}/shop/items (already updates gameState)
        // See: FE_STATE_RULES.md § 5
        if (import.meta.env.DEV) {
            console.log('[GameStore] Item purchased:', vm);
        }
    }

    function handleSpellPurchased(data: GameSpellPurchasedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        const vm = toSpellPurchasedViewModel(data);
        // NOTE: Coin is NOT updated here (server-authoritative principle).
        // Coin updates come from REST responses only:
        // 1. fetchGameState() - GET /games/{id}/state
        // 2. purchaseSpell() - POST /games/{id}/shop/spells (already updates gameState)
        // See: FE_STATE_RULES.md § 5
        if (import.meta.env.DEV) {
            console.log('[GameStore] Spell purchased:', vm);
        }
    }

    function handleInventorySync(inventory: Inventory, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        if (gameState.value) {
            gameState.value = {
                ...gameState.value,
                inventory: toInventoryViewModel(inventory),
            };
        }
    }

    function handleGameFinished(data: GameFinishedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        gameResult.value = toGameFinishedViewModel(data);
        if (gameState.value) {
            gameState.value = { ...gameState.value, stage: 'FINISHED' };
        }
    }

    function handleItemEffectApplied(data: ItemEffectAppliedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        if (import.meta.env.DEV) {
            console.log('[GameStore] Item effect applied:', data);
        }
        // TODO: 이펙트 UI 표시 로직 (추후 activeEffects 상태 추가 가능)
    }

    function handleSpellEffectApplied(data: SpellEffectAppliedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        if (import.meta.env.DEV) {
            console.log('[GameStore] Spell effect applied:', data);
        }
        // TODO: 이펙트 UI 표시 로직
    }

    function handleItemEffectBlocked(data: ItemEffectBlockedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        if (import.meta.env.DEV) {
            console.log('[GameStore] Item effect blocked:', data);
        }
        // TODO: 차단 피드백 표시
    }

    function handleEffectRemoved(data: EffectRemovedEvent, eventId: string) {
        if (!shouldProcessEvent(eventId)) {
            return;
        }

        if (import.meta.env.DEV) {
            console.log('[GameStore] Effect removed:', data);
        }
        // TODO: 이펙트 UI 제거
    }

    function reset() {
        gameState.value = null;
        stageDeadlineAt.value = null;
        bans.value = [];
        picks.value = [];
        gameResult.value = null;
        isLoading.value = false;
        processedEventIds.value.clear();
    }

    return {
        // State
        gameState,
        stageDeadlineAt,
        bans,
        picks,
        gameResult,
        isLoading,

        // Computed
        stage,
        gameId,
        roomId,

        // REST Actions
        fetchGameState,
        submitBan,
        submitPick,
        purchaseItem,
        purchaseSpell,
        submitCode,

        // Event Handlers
        handleStageChanged,
        handleBanSubmitted,
        handlePickSubmitted,
        handleItemPurchased,
        handleSpellPurchased,
        handleInventorySync,
        handleGameFinished,
        handleItemEffectApplied,
        handleSpellEffectApplied,
        handleItemEffectBlocked,
        handleEffectRemoved,

        // Cleanup
        reset,
    };
});
