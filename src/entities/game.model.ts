import type {
    GamePlayer,
    InventoryItem,
    InventorySpell,
    Inventory,
    GameState,
    GameStageChangedEvent,
    GameBanSubmittedEvent,
    GamePickSubmittedEvent,
    GameItemPurchasedEvent,
    GameSpellPurchasedEvent,
    GameFinishedEvent,
    GameFinishedResult,
} from '@/api/dtos/game.dto';
import type { GameType, GameStage } from '@/api/dtos/room.dto';

export type { GameType, GameStage };

export interface GamePlayerViewModel {
    userId: string;
    nickname: string;
    score: number;
}

export interface InventoryItemViewModel {
    itemId: string;
    quantity: number;
}

export interface InventorySpellViewModel {
    spellId: string;
    quantity: number;
}

export interface InventoryViewModel {
    items: InventoryItemViewModel[];
    spells: InventorySpellViewModel[];
}

export interface GameStateViewModel {
    gameId: string;
    roomId: string;
    gameType: GameType;
    stage: GameStage;
    remainingMs: number;
    players: GamePlayerViewModel[];
    coin: number;
    inventory: InventoryViewModel;
}

export function toGamePlayerViewModel(dto: GamePlayer): GamePlayerViewModel {
    return { ...dto };
}

export function toInventoryItemViewModel(dto: InventoryItem): InventoryItemViewModel {
    return { ...dto };
}

export function toInventorySpellViewModel(dto: InventorySpell): InventorySpellViewModel {
    return { ...dto };
}

export function toInventoryViewModel(dto: Inventory): InventoryViewModel {
    return {
        items: dto.items.map(toInventoryItemViewModel),
        spells: dto.spells.map(toInventorySpellViewModel),
    };
}

export function toGameStateViewModel(dto: GameState): GameStateViewModel {
    return {
        gameId: dto.gameId,
        roomId: dto.roomId,
        gameType: dto.gameType,
        stage: dto.stage,
        remainingMs: dto.remainingMs,
        players: dto.players.map(toGamePlayerViewModel),
        coin: dto.coin,
        inventory: toInventoryViewModel(dto.inventory),
    };
}

// --- Event ViewModels ---

export interface StageChangedViewModel {
    gameId: string;
    roomId: string;
    gameType: GameType;
    stage: GameStage;
    stageStartedAt: string;
    stageDeadlineAt: string;
    remainingMs: number;
}

export interface BanSubmittedViewModel {
    gameId: string;
    userId: string;
    algorithmId: string;
}

export interface PickSubmittedViewModel {
    gameId: string;
    userId: string;
    algorithmId: string;
}

export interface ItemPurchasedViewModel {
    gameId: string;
    userId: string;
    itemId: string;
    quantity: number;
    totalPrice: number;
}

export interface SpellPurchasedViewModel {
    gameId: string;
    userId: string;
    spellId: string;
    quantity: number;
    totalPrice: number;
}

export interface GameResultViewModel {
    userId: string;
    nickname: string;
    result: 'WIN' | 'LOSE' | 'DRAW';
    rankInGame: number;
    scoreDelta: number;
    coinDelta: number;
    expDelta: number;
    finalScoreValue: number;
    solved: boolean;
}

export interface GameFinishedViewModel {
    gameId: string;
    roomId: string;
    finishedAt: string;
    results: GameResultViewModel[];
}

export function toStageChangedViewModel(dto: GameStageChangedEvent): StageChangedViewModel {
    return { ...dto };
}

export function toBanSubmittedViewModel(dto: GameBanSubmittedEvent): BanSubmittedViewModel {
    return { gameId: dto.gameId, userId: dto.userId, algorithmId: dto.algorithmId };
}

export function toPickSubmittedViewModel(dto: GamePickSubmittedEvent): PickSubmittedViewModel {
    return { gameId: dto.gameId, userId: dto.userId, algorithmId: dto.algorithmId };
}

export function toItemPurchasedViewModel(dto: GameItemPurchasedEvent): ItemPurchasedViewModel {
    return {
        gameId: dto.gameId,
        userId: dto.userId,
        itemId: dto.itemId,
        quantity: dto.quantity,
        totalPrice: dto.totalPrice,
    };
}

export function toSpellPurchasedViewModel(dto: GameSpellPurchasedEvent): SpellPurchasedViewModel {
    return {
        gameId: dto.gameId,
        userId: dto.userId,
        spellId: dto.spellId,
        quantity: dto.quantity,
        totalPrice: dto.totalPrice,
    };
}

export function toGameResultViewModel(dto: GameFinishedResult): GameResultViewModel {
    return { ...dto };
}

export function toGameFinishedViewModel(dto: GameFinishedEvent): GameFinishedViewModel {
    return {
        gameId: dto.gameId,
        roomId: dto.roomId,
        finishedAt: dto.finishedAt,
        results: dto.results.map(toGameResultViewModel),
    };
}
