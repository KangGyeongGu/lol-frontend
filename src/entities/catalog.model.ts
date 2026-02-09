import type { AlgorithmSummary, ItemSummary, SpellSummary } from '@/api/dtos/catalog.dto';

export interface AlgorithmViewModel {
    algorithmId: string;
    name: string;
}

export interface ItemViewModel {
    itemId: string;
    name: string;
    iconKey: string;
    description: string | null;
    durationSec: number;
    price: number;
}

export interface SpellViewModel {
    spellId: string;
    name: string;
    iconKey: string;
    description: string | null;
    durationSec: number;
    price: number;
}

export function toAlgorithmViewModel(dto: AlgorithmSummary): AlgorithmViewModel {
    return { ...dto };
}

export function toItemViewModel(dto: ItemSummary): ItemViewModel {
    return { ...dto };
}

export function toSpellViewModel(dto: SpellSummary): SpellViewModel {
    return { ...dto };
}
