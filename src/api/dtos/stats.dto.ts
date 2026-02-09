/**
 * 플레이어 랭킹 정보
 */
export interface PlayerRanking {
    rank: number;
    userId: string;
    nickname: string;
    score: number;
    tier: string;
}

/**
 * 알고리즘 픽/밴 비율
 */
export interface AlgorithmPickBanRate {
    algorithmId: string;
    name: string;
    pickRate: number;
    banRate: number;
}

/**
 * 플레이어 랭킹 목록
 */
export interface ListOfPlayerRankings {
    items: PlayerRanking[];
}

/**
 * 알고리즘 픽/밴 비율 목록
 */
export interface ListOfAlgorithmPickBanRates {
    items: AlgorithmPickBanRate[];
}

/**
 * 유저 통계 정보
 */
export interface UserStats {
    totalGames: number;      // 총 게임 수
    totalWin: number;        // 총 승리 수
    totalLose: number;       // 총 패배 수
    totalDraw: number;       // 총 무승부 수
    avgRank: number;         // 평균 순위
    winRate: number;         // 승률 (0-100)
    solvedRate: number;      // 문제 해결률 (0-100)
}

/**
 * 매치 요약 정보
 * OPENAPI.yaml.md line 187-206
 */
export interface MatchSummary {
    matchId: string;
    roomName: string;
    gameType: 'RANKED' | 'NORMAL';
    result: 'WIN' | 'LOSE' | 'DRAW';
    finalPlayers: number;  // 게임 종료 시점 플레이어 수 (2-6)
    playedAt: string;      // ISO 8601
}

/**
 * 페이지 커서 정보
 * OPENAPI.yaml.md line 101-109
 */
export interface PageCursor {
    limit: number;
    nextCursor: string | null;
}

/**
 * 매치 히스토리 응답 (커서 기반 페이지네이션)
 * OPENAPI.yaml.md line 557-566
 */
export interface PagedMatchList {
    items: MatchSummary[];
    page: PageCursor;
}
