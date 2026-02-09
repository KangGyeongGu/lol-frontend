export interface AlgorithmSummary {
    algorithmId: string;
    name: string;
}

export interface ItemSummary {
    itemId: string;
    name: string;
    iconKey: string;
    description: string | null;
    durationSec: number;
    price: number;
}

export interface SpellSummary {
    spellId: string;
    name: string;
    iconKey: string;
    description: string | null;
    durationSec: number;
    price: number;
}

export interface ListOfAlgorithms {
    items: AlgorithmSummary[];
}

export interface ListOfItems {
    items: ItemSummary[];
}

export interface ListOfSpells {
    items: SpellSummary[];
}
