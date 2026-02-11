import type { GameType, GameStage } from './room.dto';
import type { CommandMeta } from '@/shared/types/realtime.types';

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

/**
 * 코드 제출 요청
 * OPENAPI.yaml.md line 1687-1717
 */
export interface SubmissionRequest {
    language: 'JAVA' | 'PYTHON' | 'CPP' | 'JAVASCRIPT';
    sourceCode: string;
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
    tier?: string; // 플레이어 티어 (IRON, BRONZE, SILVER, GOLD, etc.)
    score?: number; // 플레이어 현재 점수 (티어 아이콘 계산용)
    result: 'WIN' | 'LOSE' | 'DRAW';
    rankInGame: number;
    scoreDelta: number;
    coinBefore: number;
    coinDelta: number;
    expBefore: number;
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

/**
 * 타이핑 상태 변경 이벤트
 * EVENTS.md line 288-298
 */
export interface TypingStatusChangedEvent {
    roomId: string;
    userId: string;
    isTyping: boolean;
    updatedAt: string;
}

/**
 * 아이템 효과 적용 이벤트
 * EVENTS.md line 300-314
 */
export interface ItemEffectAppliedEvent {
    effectId: string;
    gameId: string;
    itemId: string;
    fromUserId: string;
    toUserId: string;
    durationSec: number;
    startedAt: string;
    expiresAt: string;
}

/**
 * 스펠 효과 적용 이벤트
 * EVENTS.md line 316-328
 */
export interface SpellEffectAppliedEvent {
    effectId: string;
    gameId: string;
    spellId: string;
    userId: string;
    durationSec: number;
    startedAt: string;
    expiresAt: string;
}

/**
 * 아이템 효과 차단 이벤트
 * EVENTS.md line 330-342
 */
export interface ItemEffectBlockedEvent {
    effectId: string;
    gameId: string;
    itemId: string;
    fromUserId: string;
    toUserId: string;
    blockedBySpellId: string;
    blockedAt: string;
}

/**
 * 효과 제거 이벤트
 * EVENTS.md line 344-355
 */
export interface EffectRemovedEvent {
    effectId: string;
    gameId: string;
    effectType: 'ITEM' | 'SPELL';
    targetUserId: string;
    reason: 'EXPIRED' | 'DISPELLED' | 'CONSUMED';
    removedAt: string;
}

// --- Command Payloads (STOMP) ---

/**
 * TYPING_UPDATE Command
 * CONVENTIONS.md § 3.2, COMMANDS.md § 2.2
 * Destination: /app/rooms/{roomId}/typing
 */
export interface TypingUpdatePayload {
    type: 'TYPING_UPDATE';
    data: {
        isTyping: boolean;
    };
    meta: CommandMeta;
}

/**
 * ITEM_USE Command
 * CONVENTIONS.md § 3.2, COMMANDS.md § 2.3
 * Destination: /app/games/{gameId}/items.use
 */
export interface ItemUsePayload {
    type: 'ITEM_USE';
    data: {
        itemId: string;
        targetUserId: string;
    };
    meta: CommandMeta;
}

/**
 * SPELL_USE Command
 * CONVENTIONS.md § 3.2, COMMANDS.md § 2.4
 * Destination: /app/games/{gameId}/spells.use
 */
export interface SpellUsePayload {
    type: 'SPELL_USE';
    data: {
        spellId: string;
    };
    meta: CommandMeta;
}
