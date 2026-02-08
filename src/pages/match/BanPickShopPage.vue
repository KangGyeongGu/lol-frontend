<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { MESSAGES } from '@/shared/constants/messages';
import { useServerClock } from '@/shared/composables/useServerClock';

import { useAuthStore } from '@/stores/useAuthStore';
import { useGameStore } from '@/stores/useGameStore';
import { useCatalogStore } from '@/stores/useCatalogStore';
import { useGameSubscription } from './composables/useGameSubscription';

import AlgorithmSelectPhase from './components/AlgorithmSelectPhase.vue';
import ShopPhase from './components/ShopPhase.vue';
import MatchPlayerSlot from './components/MatchPlayerSlot.vue';
import ChatPanel from '@/features/chat/ui/ChatPanel.vue';

import bgMainSrc from '@/assets/images/bg-main.jpg';

type Phase = 'BAN' | 'PICK' | 'SHOP';
const phases: Phase[] = ['BAN', 'PICK', 'SHOP'];

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const gameStore = useGameStore();
const catalogStore = useCatalogStore();
const serverClock = useServerClock();

const roomId = route.params.roomId as string;
const gameId = route.params.gameId as string;
const isLoading = ref(true);

// --- 실시간 구독 ---
useGameSubscription(gameId);

// --- 서버 상태 기반 현재 단계 ---
const currentPhase = computed<Phase>(() => {
    const stage = gameStore.stage;
    if (stage === 'BAN' || stage === 'PICK' || stage === 'SHOP') return stage;
    return 'BAN';
});

// --- 타이머: 서버 시간 동기화 기반 ---
const displayTimer = ref('00');
const progress = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

function updateTimer() {
    const deadline = gameStore.stageDeadlineAt;
    if (!deadline) {
        displayTimer.value = '00';
        progress.value = 0;
        return;
    }
    const remaining = serverClock.estimateRemainingMs(deadline);
    displayTimer.value = String(Math.ceil(remaining / 1000)).padStart(2, '0');
    const totalMs = 10_000; // 10초 고정 (SSOT)
    const elapsed = totalMs - remaining;
    progress.value = Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
}

// --- 카탈로그 데이터 ---
const bannedAlgorithmIds = computed(() =>
    gameStore.bans.map(b => b.algorithmId)
);

const phaseLabels: Record<Phase, string> = {
    'BAN': MESSAGES.MATCH.PHASE_BAN,
    'PICK': MESSAGES.MATCH.PHASE_PICK,
    'SHOP': MESSAGES.MATCH.PHASE_SHOP,
};

// --- 초기 데이터 로드 ---
async function initPage() {
    isLoading.value = true;
    try {
        await Promise.all([
            gameStore.fetchGameState(gameId),
            catalogStore.fetchAll(),
        ]);
    } catch (error) {
        console.error('[BanPickShopPage] Init error:', error);
    } finally {
        isLoading.value = false;
    }
}

// --- 사용자 액션 ---
async function handleBan(algorithmId: string) {
    try {
        await gameStore.submitBan(gameId, { algorithmId });
    } catch (error) {
        console.error('[BanPickShopPage] Ban error:', error);
    }
}

async function handlePick(algorithmId: string) {
    try {
        await gameStore.submitPick(gameId, { algorithmId });
    } catch (error) {
        console.error('[BanPickShopPage] Pick error:', error);
    }
}

// --- PLAY 단계 전환 감지 ---
watch(() => gameStore.stage, (newStage) => {
    if (newStage === 'PLAY' || newStage === 'FINISHED') {
        router.push({ name: 'WAITING_ROOM', params: { roomId } });
    }
});

// --- Lifecycle ---
onMounted(() => {
    initPage();
    timerInterval = setInterval(updateTimer, 100);
});

onUnmounted(() => {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }
    gameStore.reset();
    catalogStore.reset();
});
</script>

<template>
    <div class="ban-pick-shop-page" :style="{ backgroundImage: `url(${bgMainSrc})` }">
        <div class="overlay"></div>

        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
        </div>

        <div v-else class="scaling-container">
            <!-- Phase Navigator -->
            <nav class="phase-navigator">
                <div
                    v-for="phase in phases"
                    :key="phase"
                    class="phase-segment"
                    :class="[phase.toLowerCase(), { active: currentPhase === phase }]"
                >
                    <div class="segment-bg"></div>
                    <div class="progress-fill" :style="{ width: currentPhase === phase ? progress + '%' : '0%' }"></div>
                    <span class="phase-name">{{ phaseLabels[phase] }}</span>
                    <div class="diagonal-divider"></div>
                </div>
            </nav>

            <main class="main-layout">
                <!-- Column 1: Sidebar -->
                <aside class="sidebar-column">
                    <MatchPlayerSlot :player="gameStore.gameState?.players?.length ? null : null" />
                    <div class="chat-wrapper">
                        <ChatPanel
                            :channel-id="`room-${roomId}`"
                            :nickname="authStore.user?.nickname || 'Guest'"
                        />
                    </div>
                </aside>

                <!-- Column 2: Phase Content -->
                <section class="content-column">
                    <div class="phase-content-wrapper" :class="currentPhase.toLowerCase()">
                        <AlgorithmSelectPhase
                            v-if="currentPhase === 'BAN'"
                            mode="ban"
                            :algorithms="catalogStore.algorithms"
                            :banned-algorithm-ids="bannedAlgorithmIds"
                            :timer="displayTimer"
                            @select="handleBan"
                        />
                        <AlgorithmSelectPhase
                            v-if="currentPhase === 'PICK'"
                            mode="pick"
                            :algorithms="catalogStore.algorithms"
                            :banned-algorithm-ids="bannedAlgorithmIds"
                            :timer="displayTimer"
                            @select="handlePick"
                        />
                        <ShopPhase
                            v-if="currentPhase === 'SHOP'"
                            :timer="displayTimer"
                            :game-id="gameId"
                        />
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<style scoped lang="scss">
.ban-pick-shop-page {
    width: 100vw;
    height: 100vh;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-text-primary);
    overflow: hidden;

    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(6, 6, 12, 0.9);
        z-index: 1;
    }
}

.loading-state {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.scaling-container {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    max-width: calc(var(--gu) * 160);
    max-height: calc(var(--gu) * 90);
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    padding: calc(var(--gu) * 2) calc(var(--gu) * 4);
    gap: calc(var(--gu) * 2);
    box-sizing: border-box;
}

.phase-navigator {
    display: flex;
    height: calc(var(--gu) * 5);
    width: 100%;
    background: rgba(18, 16, 30, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    overflow: hidden;

    .phase-segment {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;

        &.ban {
            clip-path: polygon(0 0, 85% 0, 100% 100%, 0 100%);
            z-index: 3;
            .diagonal-divider { background: var(--color-accent-red); }
        }
        &.pick {
            margin-left: -5%;
            clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%);
            z-index: 2;
            .diagonal-divider { background: var(--color-accent-cyan); }
        }
        &.shop {
            margin-left: -5%;
            clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
            z-index: 1;
            .diagonal-divider { background: var(--color-accent-yellow); }
        }

        .diagonal-divider {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 3px;
            opacity: 0.3;
            z-index: 5;
        }

        .segment-bg {
            position: absolute;
            inset: 0;
            z-index: 0;
        }

        .progress-fill {
            position: absolute;
            inset: 0;
            z-index: 1;
            transition: width 0.5s linear;
        }

        &.ban.active {
            .segment-bg { background: rgba(255, 77, 109, 0.15); border-right: 2px solid var(--color-accent-red); }
            .progress-fill { background: var(--color-accent-red); opacity: 0.5; }
            .phase-name { color: white; font-weight: 900; }
            .diagonal-divider { opacity: 1; width: 4px; }
        }
        &.pick.active {
            .segment-bg { background: rgba(58, 242, 255, 0.15); border-right: 2px solid var(--color-accent-cyan); }
            .progress-fill { background: var(--color-accent-cyan); opacity: 0.5; }
            .phase-name { color: white; font-weight: 900; }
            .diagonal-divider { opacity: 1; width: 4px; }
        }
        &.shop.active {
            .segment-bg { background: rgba(255, 210, 72, 0.15); border-right: 2px solid var(--color-accent-yellow); }
            .progress-fill { background: var(--color-accent-yellow); opacity: 0.5; }
            .phase-name { color: white; font-weight: 900; }
            .diagonal-divider { opacity: 1; width: 4px; }
        }

        background-image: linear-gradient(to bottom right, transparent 50%, rgba(255,255,255,0.1) 50.5%, transparent 51%);
        background-repeat: no-repeat;
        background-position: right;
        background-size: 2px 100%;

        .phase-name {
            position: relative;
            z-index: 2;
            font-family: var(--font-display);
            font-size: var(--fontSize-md);
            color: rgba(255, 255, 255, 0.4);
            letter-spacing: 2px;
            padding-left: 15px;
        }
    }
}

.main-layout {
    flex: 1;
    display: grid;
    grid-template-columns: calc(var(--gu) * 28) 1fr;
    gap: calc(var(--gu) * 2);
    min-height: 0;
}

.sidebar-column {
    display: flex;
    flex-direction: column;
    gap: calc(var(--gu) * 2);
    min-height: 0;
}

.chat-wrapper {
    flex: 1;
    min-height: 0;
    border: 1px solid rgba(255, 210, 72, 0.3);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.content-column {
    min-height: 0;
    display: flex;
    justify-content: center;
}

.phase-content-wrapper {
    width: 100%;
    max-width: calc(var(--gu) * 110);
    height: 100%;
    padding: calc(var(--gu) * 2.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-sm);
    background: rgba(18, 16, 30, 0.6);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &.ban { border-color: var(--color-accent-red); }
    &.pick { border-color: var(--color-accent-cyan); }
    &.shop { border-color: var(--color-accent-yellow); }
}
</style>
