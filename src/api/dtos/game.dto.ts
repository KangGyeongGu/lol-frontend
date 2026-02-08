import type { GameType, GameStage } from './room.dto';

export interface GamePlayer {
    userId: string;
    nickname: string;
    score: number;
}

export interface InventoryItem {
    itemId: string;
    quantity: number;
}

export interface InventorySpell {
    spellId: string;
    quantity: number;
}

export interface Inventory {
    items: InventoryItem[];
    spells: InventorySpell[];
}

export interface GameState {
    gameId: string;
    roomId: string;
    gameType: GameType;
    stage: GameStage;
    remainingMs: number;
    players: GamePlayer[];
    coin: number;
    inventory: Inventory;
}

export interface BanPickRequest {
    algorithmId: string;
}

export interface ShopItemRequest {
    itemId: string;
    quantity: number;
}

export interface ShopSpellRequest {
    spellId: string;
    quantity: number;
}

// --- Event Payloads (STOMP) ---

export interface GameStageChangedEvent {
    gameId: string;
    roomId: string;
    gameType: GameType;
    stage: GameStage;
    stageStartedAt: string;
    stageDeadlineAt: string;
    remainingMs: number;
}

export interface GameBanSubmittedEvent {
    gameId: string;
    roomId: string;
    userId: string;
    algorithmId: string;
    submittedAt: string;
}

export interface GamePickSubmittedEvent {
    gameId: string;
    roomId: string;
    userId: string;
    algorithmId: string;
    submittedAt: string;
}

export interface GameItemPurchasedEvent {
    gameId: string;
    roomId: string;
    userId: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    purchasedAt: string;
}

export interface GameSpellPurchasedEvent {
    gameId: string;
    roomId: string;
    userId: string;
    spellId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    purchasedAt: string;
}

export interface GameFinishedResult {
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

export interface GameFinishedEvent {
    gameId: string;
    roomId: string;
    finishedAt: string;
    results: GameFinishedResult[];
}
