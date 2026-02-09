import { ref, readonly, type Ref } from 'vue';

interface OffsetSample {
    offset: number;
}

export interface ServerClockReturn {
    estimatedServerNow: () => number;
    estimateRemainingMs: (stageDeadlineAt: string) => number;
    feedSample: (serverTimeIso: string) => void;
    readonly offset: Ref<number>;
    dispose: () => void;
}

const MAX_SAMPLES = 10;

// 모듈 스코프 싱글턴 상태
const samples = ref<OffsetSample[]>([]);
const currentOffset = ref(0);

function updateBestOffset(): void {
    if (samples.value.length === 0) return;

    // 중앙값 사용 (이상치 필터링)
    const sorted = [...samples.value].sort((a, b) => a.offset - b.offset);
    const medianIndex = Math.floor(sorted.length / 2);
    const median = sorted[medianIndex];
    if (median) {
        currentOffset.value = median.offset;
    }
}

function feedSample(serverTimeIso: string): void {
    const clientReceiveTime = performance.now();
    const serverTimestamp = new Date(serverTimeIso).getTime();

    // TIME_SYNC는 서버 푸시 방식이므로 clientSendTime 없음
    // offset ≈ serverTime - clientReceiveTime (RTT=0 근사)
    const offset = serverTimestamp - clientReceiveTime;

    samples.value.push({ offset });

    if (samples.value.length > MAX_SAMPLES) {
        samples.value.shift();
    }

    updateBestOffset();
}

function estimatedServerNow(): number {
    if (samples.value.length === 0) {
        return Date.now(); // 보정 전 fallback (epoch 기반)
    }
    return performance.now() + currentOffset.value;
}

function estimateRemainingMs(stageDeadlineAt: string): number {
    const deadlineTimestamp = new Date(stageDeadlineAt).getTime();
    const remaining = deadlineTimestamp - estimatedServerNow();
    return remaining > 0 ? remaining : 0;
}

function dispose(): void {
    samples.value = [];
    currentOffset.value = 0;
}

const serverClock: ServerClockReturn = {
    estimatedServerNow,
    estimateRemainingMs,
    feedSample,
    offset: readonly(currentOffset),
    dispose,
};

/**
 * 서버 시간 동기화 싱글턴
 *
 * 모든 호출에서 동일한 인스턴스를 반환한다.
 * EventDispatcher에서 feedSample()로 오프셋을 갱신하고,
 * 페이지에서 estimateRemainingMs()로 남은 시간을 계산한다.
 *
 * 재동기화 주기는 서버가 제어한다 (기본 10초, BAN/PICK/SHOP 2초).
 */
export function useServerClock(): ServerClockReturn {
    return serverClock;
}
