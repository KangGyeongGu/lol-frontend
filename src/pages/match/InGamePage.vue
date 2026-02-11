<script setup lang="ts">
// InGamePage.vue: 인게임 플레이 단계 페이지
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/stores/useGameStore';
import { useRoomStore } from '@/stores/useRoomStore';
import { useCatalogStore } from '@/stores/useCatalogStore';
import { useChatStore } from '@/stores/useChatStore';
import { useGameSubscription } from './composables/useGameSubscription';
import { useServerClock } from '@/shared/composables/useServerClock';

import StreamRow from './components/StreamRow.vue';
import ProblemPanel from './components/ProblemPanel.vue';
import EditorPanel from './components/EditorPanel.vue';
import InventoryPanel from './components/InventoryPanel.vue';

import bgMainSrc from '@/assets/images/bg-main.jpg';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
const roomStore = useRoomStore();
const catalogStore = useCatalogStore();
const chatStore = useChatStore();
const serverClock = useServerClock();

const roomIdParam = route.params.roomId as string;
const gameId = route.params.gameId as string;

// --- 실시간 구독 (TOPICS.md § 3: IN_GAME subscribes to typing) ---
useGameSubscription(gameId, { roomId: roomIdParam, enableTyping: true });

// NOTE: 타이핑 상태는 chatStore.getTypingUsers(roomIdParam)로 접근 가능
// TypingStatusBar 컴포넌트 통합 시 해당 computed를 추가하여 props로 전달

// --- GAME_FINISHED 결과 표시 (WP-6) ---
const isNavigatingToResult = ref(false);

const problem = ref({
    title: 'Two Sum',
    level: '쉬움',
    timeLimit: '165:40',
    description: '정수 배열 nums와 정수 target이 주어지면, 두 숫자의 합이 target이 되는 두 숫자의 인덱스를 반환하세요.\n각 입력값은 정확히 하나의 솔루션을 가지며, 동일한 요소를 두 번 사용할 수 없다고 가정합니다.\n정답은 어떤 순서로든 반환할 수 있습니다.',
    examples: [
        { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
        { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
        { input: 'nums = [3, 3], target: 6', output: '[0, 1]' }
    ]
});

const isSubmitting = ref(false);
const roomDetail = ref<{ language: string } | null>(null);

// 방 정보에서 언어 가져오기
const programmingLanguage = computed(() => {
    return roomDetail.value?.language || 'PYTHON';
});

// --- 타이머: 서버 시간 동기화 기반 (BanPickShopPage 패턴) ---
const displayTimer = ref('00:00');
let timerInterval: ReturnType<typeof setInterval> | null = null;

function updateTimer() {
    const deadline = gameStore.stageDeadlineAt;
    if (!deadline) {
        displayTimer.value = '00:00';
        return;
    }
    const remaining = serverClock.estimateRemainingMs(deadline);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.ceil((remaining % 60000) / 1000);
    displayTimer.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// --- 초기 데이터 로드 (BanPickShopPage 패턴) ---
async function initPage() {
    try {
        await Promise.all([
            gameStore.fetchGameState(gameId),
            catalogStore.fetchAll(),
        ]);

        // 방 정보 가져오기 (언어 정보 포함)
        if (roomIdParam) {
            const detail = await roomStore.getRoomDetail(roomIdParam);
            roomDetail.value = detail;
        }

        // 플레이어 닉네임 등록 (타이핑 상태 표시를 위해)
        if (gameStore.gameState?.players) {
            gameStore.gameState.players.forEach(player => {
                chatStore.registerNickname(player.userId, player.nickname);
            });
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[InGamePage] Init error:', error);
        }
    }
}

// --- gameResult watch: 게임 종료 시 결과 페이지로 전환 (WP-6) ---
watch(() => gameStore.gameResult, (result) => {
    if (result) {
        if (import.meta.env.DEV) {
            console.log('[InGamePage] Game finished, navigating to result page');
        }
        isNavigatingToResult.value = true;
        router.push({
            name: 'RESULT',
            params: { roomId: roomIdParam, gameId }
        });
    }
});

// --- Lifecycle ---
onMounted(() => {
    initPage();
    timerInterval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }
    // 결과 페이지로 전환 중이 아닐 때만 reset
    if (!isNavigatingToResult.value) {
        gameStore.reset();
    }
    catalogStore.reset();
    // 타이핑 상태 정리
    chatStore.clearTypingStatus(roomIdParam);
});

// --- 코드 제출 핸들러 (WP-8) ---
async function handleCodeSubmit(code: string, language: string) {
    const gameIdValue = gameStore.gameId;
    if (!gameIdValue) {
        if (import.meta.env.DEV) {
            console.error('[InGamePage] Game ID not found');
        }
        return;
    }

    isSubmitting.value = true;

    try {
        await gameStore.submitCode(gameIdValue, {
            language: language as 'JAVA' | 'PYTHON' | 'CPP' | 'JAVASCRIPT',
            sourceCode: code,
        });
        if (import.meta.env.DEV) {
            console.log('[InGamePage] Code submitted successfully');
        }
        // TODO: 제출 성공 피드백 표시
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[InGamePage] Failed to submit code:', error);
        }
        // TODO: 에러 피드백 표시
    } finally {
        isSubmitting.value = false;
    }
}

// 조기 종료 핸들러
async function handleEarlyTerminate() {
    const gameId = gameStore.gameId;
    if (!gameId) {
        if (import.meta.env.DEV) {
            console.error('[InGamePage] Game ID not found');
        }
        return;
    }

    try {
        // TODO: 실제 API 연동 - gameApi.terminateGame(gameId)
        if (import.meta.env.DEV) {
            console.log('[InGamePage] Early terminate:', { gameId });
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[InGamePage] Failed to terminate game:', error);
        }
    }
}
</script>

<template>
    <div class="in-game-page" :style="{ backgroundImage: `url(${bgMainSrc})` }">
        <div class="overlay"></div>

        <div class="scaling-container">
            <!-- Top Section: Stream Row -->
            <header class="top-layout">
                <StreamRow />
            </header>

            <!-- Main Content Area -->
            <main class="main-layout">
                <!-- Left: Problem Panel -->
                <section class="problem-column">
                    <ProblemPanel :problem="problem" />
                </section>

                <!-- Middle: Editor Panel -->
                <section class="editor-column">
                    <EditorPanel
                        :language="programmingLanguage"
                        :is-grading="isSubmitting"
                        @submit="handleCodeSubmit"
                        @early-terminate="handleEarlyTerminate"
                    />
                </section>

                <!-- Right: Inventory Panel -->
                <aside class="inventory-column">
                    <InventoryPanel />
                </aside>
            </main>
        </div>
    </div>
</template>

<style scoped lang="scss">
.in-game-page {
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

.scaling-container {
    position: relative;
    z-index: 2;
    // --gu is 1% of the 16:9 canvas width. Total width must be 100gu.
    width: calc(var(--gu) * 100);
    height: calc(var(--gu) * 100 * 9 / 16);
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    padding: calc(var(--gu) * 2) calc(var(--gu) * 4);
    gap: calc(var(--gu) * 1.5);
    box-sizing: border-box;
    pointer-events: auto;
}

.top-layout {
    height: calc(var(--gu) * 10);
    width: 100%;
}

.main-layout {
    flex: 1;
    display: grid;
    // Padding 4gu * 2 = 8gu. Remaining width = 92gu.
    // Left: 27gu, Middle: 1fr, Right: 11gu.
    grid-template-columns: calc(var(--gu) * 27) 1fr calc(var(--gu) * 11);
    grid-template-rows: 1fr;
    gap: calc(var(--gu) * 1.5);
    min-height: 0;
}

.problem-column,
.editor-column,
.inventory-column {
    min-width: 0;
    min-height: 0;
    height: 100%;
}
</style>


