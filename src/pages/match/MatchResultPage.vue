<script setup lang="ts">
// MatchResultPage.vue: 경기 결과 페이지
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/useGameStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { MESSAGES } from '@/shared/constants/messages';
import { getTierIconPath } from '@/shared/utils/assetMapper.util';
import bgMainSrc from '@/assets/images/bg-main.jpg';
import NumberCounter from '@/shared/components/NumberCounter.vue';

const router = useRouter();
const gameStore = useGameStore();
const authStore = useAuthStore();

// 백엔드 데이터 → UI 데이터 매핑
const resultData = computed(() => {
    const result = gameStore.gameResult;
    if (!result) return null;

    const players = result.results.map(r => ({
        // 백엔드 필드 매핑
        rank: r.rankInGame,
        nickname: r.nickname,
        tier: r.tier || 'IRON',  // 플레이어 티어 (기본값: IRON)
        points: r.finalScoreValue,
        coinBefore: r.coinBefore,
        coinDelta: r.coinDelta,
        expBefore: r.expBefore,
        expDelta: r.expDelta,
        scoreDelta: r.scoreDelta,
        result: r.result,  // WIN/LOSE/DRAW
        solved: r.solved,
        userId: r.userId,

        // 현재 사용자 식별
        isMe: authStore.user ? r.userId === authStore.user.userId : false
    }));

    // 현재 유저의 결과 찾기
    const myResult = players.find(p => p.isMe);

    return {
        gameId: result.gameId,
        roomId: result.roomId,
        finishedAt: result.finishedAt,
        playerCount: result.results.length,
        myGameResult: myResult?.result || 'DRAW',  // WIN/LOSE/DRAW
        players
    };
});

// 애니메이션 상태
const coinFrom = ref(0);
const coinTo = ref(0);
const expFrom = ref(0);
const expTo = ref(0);
const showDelta = ref(false);
const startAnimation = ref(false);

function startRewardAnimation() {
    if (!resultData.value) return;
    const me = resultData.value.players.find(p => p.isMe);
    if (!me) return;

    // coinBefore → coinBefore + coinDelta
    coinFrom.value = me.coinBefore;
    coinTo.value = me.coinBefore + me.coinDelta;

    // expBefore → expBefore + expDelta
    expFrom.value = Math.round(me.expBefore);
    expTo.value = Math.round(me.expBefore + me.expDelta);

    // 약간의 지연 후 애니메이션 시작
    setTimeout(() => {
        showDelta.value = true;
        startAnimation.value = true;
    }, 500);
}

// 에러 가드: gameResult 없으면 메인으로 리다이렉트
onMounted(() => {
    if (!gameStore.gameResult) {
        console.error('[MatchResultPage] No game result available, redirecting to main');
        router.replace({ name: 'MAIN' });
        return;
    }

    // 초기 값 설정
    const me = resultData.value?.players.find(p => p.isMe);
    if (me) {
        coinFrom.value = me.coinBefore;
        coinTo.value = me.coinBefore;
        expFrom.value = Math.round(me.expBefore);
        expTo.value = Math.round(me.expBefore);
    }

    // 애니메이션 시작
    startRewardAnimation();
});

// 결과 페이지 이탈 시 게임 상태 초기화
onUnmounted(() => {
    gameStore.reset();
});

function handleRetry() {
    router.replace({ name: 'MAIN' });
}

function handleGoMain() {
    router.replace({ name: 'MAIN' });
}
</script>

<template>
    <div class="result-page-container" :style="{ backgroundImage: `url(${bgMainSrc})` }">
        <div class="main-overlay"></div>
        
        <div class="scaling-container">
            <!-- 1. Header: Game Result -->
            <section class="header-section" v-if="resultData">
                <div
                    class="result-box"
                    :class="{
                        'result-win': resultData.myGameResult === 'WIN',
                        'result-lose': resultData.myGameResult === 'LOSE',
                        'result-draw': resultData.myGameResult === 'DRAW'
                    }"
                >
                    <h1 class="result-title">
                        <span v-if="resultData.myGameResult === 'WIN'">WIN</span>
                        <span v-else-if="resultData.myGameResult === 'LOSE'">LOST</span>
                        <span v-else>DRAW</span>
                    </h1>
                    <div class="result-subtitle">
                        {{ resultData.playerCount }}명 참가
                    </div>
                </div>
            </section>

            <!-- 2. Main Body: Player Result List -->
            <main class="result-list-container">
                <div v-if="!resultData" class="empty-state">
                    <p>결과를 불러오는 중...</p>
                </div>

                <div
                    v-else
                    v-for="player in resultData.players"
                    :key="player.rank"
                    class="player-result-row"
                    :class="{
                        'best-row': player.rank === 1,
                        'my-row': player.isMe,
                        'win-row': player.result === 'WIN',
                        'lose-row': player.result === 'LOSE'
                    }"
                >
                    <div class="rank-area">
                        <span class="rank-num">{{ player.rank }}</span>
                    </div>

                    <div class="profile-area">
                        <div class="tier-icon-box">
                            <img :src="getTierIconPath(player.tier)" :alt="player.tier" />
                            <div v-if="player.solved" class="check-mark">✓</div>
                        </div>
                        <div class="user-info">
                            <h2 class="nickname">
                                {{ player.nickname }}
                                <span v-if="player.isMe" class="me-badge">(ME)</span>
                            </h2>
                            <p class="tier-points">{{ player.points }} LP</p>
                        </div>
                    </div>


                    <div v-if="player.isMe" class="rewards-area">
                        <div class="reward-item coin">
                            <div class="value-box">
                                <NumberCounter
                                    v-if="startAnimation"
                                    :from="coinFrom"
                                    :to="coinTo"
                                    :duration="2000"
                                    :delay="0"
                                    :use-grouping="true"
                                    class="current-total"
                                />
                                <span v-else class="current-total">{{ coinFrom.toLocaleString() }}</span>
                                <Transition name="slide-up">
                                    <span v-if="showDelta && player.coinDelta !== 0" class="floating-delta">
                                        {{ player.coinDelta > 0 ? '+' : '' }}{{ player.coinDelta }}
                                    </span>
                                </Transition>
                            </div>
                            <span class="label">COIN</span>
                        </div>
                        <div class="reward-item xp">
                            <div class="value-box">
                                <NumberCounter
                                    v-if="startAnimation"
                                    :from="expFrom"
                                    :to="expTo"
                                    :duration="2000"
                                    :delay="100"
                                    :use-grouping="true"
                                    class="current-total"
                                />
                                <span v-else class="current-total">{{ expFrom.toLocaleString() }}</span>
                                <Transition name="slide-up">
                                    <span v-if="showDelta && player.expDelta !== 0" class="floating-delta">
                                        {{ player.expDelta > 0 ? '+' : '' }}{{ Math.round(player.expDelta) }}
                                    </span>
                                </Transition>
                            </div>
                            <span class="label">XP</span>
                        </div>
                    </div>
                </div>
            </main>

            <!-- 3. Footer: Actions -->
            <footer class="action-footer">
                <button class="action-btn retry-btn" @click="handleRetry">
                    {{ MESSAGES.RESULT.RETRY }}
                </button>
                <button class="action-btn main-btn" @click="handleGoMain">
                    {{ MESSAGES.RESULT.GO_MAIN }}
                </button>
            </footer>
        </div>
    </div>
</template>

<style scoped lang="scss">
.result-page-container {
    width: 100vw;
    height: 100vh;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-page);
}

.main-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(18, 16, 30, 0.4) 0%, rgba(11, 8, 20, 0.9) 100%);
    z-index: 1;
}

.scaling-container {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    max-width: calc(var(--gu) * 100);
    max-height: calc(var(--gu) * 56.25);
    aspect-ratio: 16 / 9;
    padding: calc(var(--gu) * 3.75);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

/* Header Section */
.header-section {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: calc(var(--gu) * 3);

    .result-box {
        width: 100%;
        max-width: calc(var(--gu) * 40);
        background: rgba(18, 16, 30, 0.6);
        border-radius: var(--radius-lg);
        padding: calc(var(--gu) * 2) calc(var(--gu) * 3);
        text-align: center;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &.result-win {
            border: 2px solid var(--color-accent-green);
            box-shadow:
                0 0 calc(var(--gu) * 3) rgba(77, 255, 136, 0.4),
                inset 0 0 calc(var(--gu) * 4) rgba(77, 255, 136, 0.1);
        }

        &.result-lose {
            border: 2px solid var(--color-accent-red);
            box-shadow:
                0 0 calc(var(--gu) * 3) rgba(255, 77, 109, 0.4),
                inset 0 0 calc(var(--gu) * 4) rgba(255, 77, 109, 0.1);
        }

        &.result-draw {
            border: 2px solid var(--color-accent-yellow);
            box-shadow:
                0 0 calc(var(--gu) * 3) rgba(255, 210, 72, 0.4),
                inset 0 0 calc(var(--gu) * 4) rgba(255, 210, 72, 0.1);
        }
    }

    .result-title {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 4);
        font-weight: 900;
        margin: 0;
        letter-spacing: calc(var(--gu) * 0.2);
        text-transform: uppercase;

        .result-win & {
            color: var(--color-accent-green);
            text-shadow:
                0 0 calc(var(--gu) * 1.5) rgba(77, 255, 136, 0.8),
                0 0 calc(var(--gu) * 3) rgba(77, 255, 136, 0.4);
        }

        .result-lose & {
            color: var(--color-accent-red);
            text-shadow:
                0 0 calc(var(--gu) * 1.5) rgba(255, 77, 109, 0.8),
                0 0 calc(var(--gu) * 3) rgba(255, 77, 109, 0.4);
        }

        .result-draw & {
            color: var(--color-accent-yellow);
            text-shadow:
                0 0 calc(var(--gu) * 1.5) rgba(255, 210, 72, 0.8),
                0 0 calc(var(--gu) * 3) rgba(255, 210, 72, 0.4);
        }
    }

    .result-subtitle {
        font-family: var(--font-ui);
        font-size: calc(var(--gu) * 1);
        color: var(--color-text-secondary);
        margin-top: calc(var(--gu) * 0.5);
        opacity: 0.8;
    }
}

/* Result List */
.result-list-container {
    flex: 1;
    width: 100%;
    max-width: calc(var(--gu) * 65);
    display: flex;
    flex-direction: column;
    gap: calc(var(--gu) * 1.25);

    .empty-state {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-primary);
        font-size: calc(var(--gu) * 1.25);
    }
}

.player-result-row {
    height: calc(var(--gu) * 6.5);
    background: rgba(20, 18, 30, 0.7);
    border: 1.5px solid rgba(255, 210, 72, 0.4); // Gold border from mockup
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    padding: 0 calc(var(--gu) * 2.5);
    box-shadow: inset 0 0 calc(var(--gu) * 2.5) rgba(255, 210, 72, 0.05);

    // 현재 사용자 강조
    &.my-row {
        border-color: var(--color-accent-cyan);
        box-shadow: inset 0 0 calc(var(--gu) * 2.5) rgba(58, 242, 255, 0.15);
    }

    // 승리/패배 스타일
    &.win-row {
        border-color: var(--color-accent-green);
        background: rgba(77, 255, 136, 0.05);
    }

    &.lose-row {
        border-color: var(--color-accent-red);
        background: rgba(255, 77, 109, 0.05);
    }
}

.rank-area {
    width: calc(var(--gu) * 3.75);
    .rank-num {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 2.5);
        font-style: italic;
        color: var(--color-accent-cyan);
        text-shadow: 0 0 calc(var(--gu) * 0.6) var(--color-accent-cyan);
    }
}

.profile-area {
    display: flex;
    align-items: center;
    gap: calc(var(--gu) * 1.25);
    flex: 1;

    .tier-icon-box {
        width: calc(var(--gu) * 3.2);
        height: calc(var(--gu) * 3.2);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }

        .check-mark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(var(--gu) * 1.5);
            height: calc(var(--gu) * 1.5);
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #FFD248, #FF8D48);
            clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
            box-shadow: 0 0 calc(var(--gu) * 0.9) rgba(255, 210, 72, 0.5);
            color: black;
            font-weight: 800;
            font-size: calc(var(--gu) * 0.9);
            z-index: 1;
        }
    }

    .user-info {
        .nickname {
            font-family: var(--font-display);
            font-size: calc(var(--gu) * 1.125);
            color: white;
            margin: 0;

            .me-badge {
                font-size: calc(var(--gu) * 0.6);
                color: var(--color-accent-cyan);
                margin-left: calc(var(--gu) * 0.3);
                font-weight: 800;
            }
        }
        .tier-points {
            font-family: var(--font-ui);
            font-size: calc(var(--gu) * 0.6);
            color: var(--color-text-secondary);
            margin: 1px 0 0;
            opacity: 0.8;
        }
    }
}


.rewards-area {
    display: flex;
    flex-direction: row;
    gap: calc(var(--gu) * 2.5);
    align-items: center;

    .reward-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: calc(var(--gu) * 0.2);
        min-width: calc(var(--gu) * 8);

        .value-box {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .current-total {
            font-family: var(--font-display);
            font-size: calc(var(--gu) * 1.5);
            font-weight: 800;
            font-style: italic;
            letter-spacing: 1px;
            color: white;
            text-shadow: 0 0 calc(var(--gu) * 0.8) rgba(255, 255, 255, 0.2);
        }

        .floating-delta {
            position: absolute;
            top: calc(var(--gu) * -1.2);
            right: calc(var(--gu) * -1.5);
            font-family: var(--font-mono);
            font-size: calc(var(--gu) * 0.7);
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            white-space: nowrap;
        }

        .label {
            font-size: calc(var(--gu) * 0.6);
            font-weight: 900;
            font-family: var(--font-ui);
            opacity: 0.6;
            letter-spacing: 1px;
        }

        &.coin {
            .current-total { color: var(--color-accent-yellow); }
            .floating-delta { 
                color: var(--color-accent-yellow);
                border: 1px solid rgba(255, 210, 72, 0.3);
                box-shadow: 0 0 calc(var(--gu) * 1) rgba(255, 210, 72, 0.2);
            }
        }
        &.xp {
            .current-total { color: var(--color-accent-cyan); }
            .floating-delta { 
                color: var(--color-accent-cyan);
                border: 1px solid rgba(58, 242, 255, 0.3);
                box-shadow: 0 0 calc(var(--gu) * 1) rgba(58, 242, 255, 0.2);
            }
        }
    }
}

/* Transitions */
.slide-up-enter-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter-from {
    opacity: 0;
    transform: translateY(10px) scale(0.8);
}
.slide-up-enter-to {
    opacity: 1;
    transform: translateY(0) scale(1);
}

/* Footer Section */
.action-footer {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: calc(var(--gu) * 1.5);
    margin-top: auto;
}

.action-btn {
    width: calc(var(--gu) * 15);
    height: calc(var(--gu) * 3.2);
    border-radius: var(--radius-md);
    font-family: var(--font-display);
    font-size: calc(var(--gu) * 0.9);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;

    &.retry-btn {
        background: rgba(18, 16, 30, 0.6);
        border: 1px solid var(--color-accent-cyan);
        color: var(--color-accent-cyan);

        &:hover {
            background: rgba(58, 242, 255, 0.15);
            box-shadow: 0 0 calc(var(--gu) * 1.25) rgba(58, 242, 255, 0.3);
            transform: translateY(-2px);
        }
    }

    &.main-btn {
        background: rgba(18, 16, 30, 0.6);
        border: 1px solid var(--color-accent-magenta);
        color: var(--color-accent-magenta);

        &:hover {
            background: rgba(255, 79, 216, 0.15);
            box-shadow: 0 0 calc(var(--gu) * 1.25) rgba(255, 79, 216, 0.3);
            transform: translateY(-2px);
        }
    }
}
</style>
