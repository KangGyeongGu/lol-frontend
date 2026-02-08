export interface PlayerRanking {
    rank: number;
    userId: string;
    nickname: string;
    score: number;
    tier: string;
}

export interface AlgorithmPickBanRate {
    algorithmId: string;
    name: string;
    pickRate: number;
    banRate: number;
}

export interface ListOfPlayerRankings {
    items: PlayerRanking[];
}

export interface ListOfAlgorithmPickBanRates {
    items: AlgorithmPickBanRate[];
}
