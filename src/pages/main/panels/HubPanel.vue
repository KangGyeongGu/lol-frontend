<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import ChatPanel from '@/features/chat/ui/ChatPanel.vue';
import bannerLiveSrc from '@/assets/images/banner-live.png';

const authStore = useAuthStore();

// 허브 패널: 메인 대시보드 뷰
const emit = defineEmits<{
  (e: 'navigate', view: 'ROOM_LIST'): void;
  (e: 'create'): void;
}>();

// --- 탭 및 캐러셀 상태 ---
const statTab = ref<'BANNED' | 'PICKED'>('BANNED');
const statPage = ref(0);
const playerPage = ref(0);

const bannedStats = ref([
    { rank: 1, name: 'Graph', val: '8%' },
    { rank: 2, name: 'DP', val: '8%' },
    { rank: 3, name: 'String', val: '7%' },
    { rank: 4, name: 'DFS', val: '6%' },
    { rank: 5, name: 'Tree', val: '5%' },
    { rank: 6, name: 'Greedy', val: '4%' },
    { rank: 7, name: 'BFS', val: '4%' },
    { rank: 8, name: 'Stack', val: '3%' },
    { rank: 9, name: 'Queue', val: '2%' },
    { rank: 10, name: 'Hash', val: '1%' },
]);

const pickedStats = ref([
    { rank: 1, name: 'Array', val: '15%' },
    { rank: 2, name: 'Sort', val: '12%' },
    { rank: 3, name: 'Math', val: '10%' },
    { rank: 4, name: 'Impl', val: '9%' },
    { rank: 5, name: 'Brute', val: '8%' },
    { rank: 6, name: 'TwoPtr', val: '7%' },
    { rank: 7, name: 'Binary', val: '6%' },
    { rank: 8, name: 'Set', val: '5%' },
    { rank: 9, name: 'Map', val: '4%' },
    { rank: 10, name: 'Bit', val: '3%' },
]);

const topPlayers = ref([
    { rank: 1, name: 'gyeong', score: '3001' },
    { rank: 2, name: 'Alice', score: '2900' },
    { rank: 3, name: 'Bob', score: '2800' },
    { rank: 4, name: 'Charlie', score: '2700' },
    { rank: 5, name: 'David', score: '2600' },
    { rank: 6, name: 'Eve', score: '2500' },
    { rank: 7, name: 'Frank', score: '2400' },
    { rank: 8, name: 'Grace', score: '2300' },
    { rank: 9, name: 'Heidi', score: '2200' },
    { rank: 10, name: 'Ivan', score: '2100' },
]);

const visibleStats = computed(() => {
    const source = statTab.value === 'BANNED' ? bannedStats.value : pickedStats.value;
    const start = statPage.value * 5;
    return source.slice(start, start + 5);
});

const visiblePlayers = computed(() => {
    const start = playerPage.value * 5;
    return topPlayers.value.slice(start, start + 5);
});

let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
    timer = setInterval(() => {
        statPage.value = (statPage.value + 1) % 2;
        playerPage.value = (playerPage.value + 1) % 2;
    }, 5000); // 5초마다 교체
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>

<template>
    <div class="hub-content">
        <!-- 메인 콘텐츠 영역 -->
        <section class="main-section">
            <div class="hero-placeholder" :style="{ backgroundImage: `url(${bannerLiveSrc})` }">
                <div class="hero-content">
                    <h1>Global Algorithm Championship</h1>
                    <p>실시간 코딩 대전에 참여하고 글로벌 랭킹을 확인하세요</p>
                </div>
                <div class="hero-overlay"></div>
            </div>
            
            <div class="action-row">
                <button class="action-card create" @click="emit('create')">
                    <span class="label">대전 생성</span>
                </button>
                <button class="action-card find" @click="emit('navigate', 'ROOM_LIST')">
                    <span class="label">대전 찾기</span>
                </button>
            </div>

            <!-- 하단 고정 채팅 -->
            <div class="global-chat-dock">
                <ChatPanel 
                    channel-id="global"
                    :nickname="authStore.user?.nickname || 'Guest'" 
                />
            </div>
        </section>

        <!-- 오른쪽 사이드바 -->
        <aside class="side-section">
            <!-- 통계 패널 (Banned / Picked) -->
            <div class="ranking-panel">
                <div class="tabs">
                    <button 
                        :class="{ active: statTab === 'BANNED' }" 
                        @click="statTab = 'BANNED'; statPage = 0"
                    >
                        Most Banned
                    </button>
                    <button 
                        :class="{ active: statTab === 'PICKED' }" 
                        @click="statTab = 'PICKED'; statPage = 0"
                    >
                        Most Picked
                    </button>
                </div>
                <ul>
                    <li v-for="item in visibleStats" :key="item.rank">
                        <span class="rank">{{ item.rank }}</span> 
                        <span class="name">{{ item.name }}</span> 
                        <span class="pct">{{ item.val }}</span>
                    </li>
                </ul>
            </div>
            
            <!-- 상위 플레이어 패널 -->
             <div class="ranking-panel players">
                <h3>Top Players</h3>
                <ul>
                    <li v-for="player in visiblePlayers" :key="player.rank">
                        <span class="rank" :class="{ gold: player.rank===1, silver: player.rank===2 }">
                            {{ player.rank }}
                        </span> 
                        <span class="name">{{ player.name }}</span> 
                        <span class="score">{{ player.score }}</span>
                    </li>
                </ul>
            </div>
        </aside>
    </div>
</template>

<style scoped lang="scss">
.hub-content {
    flex: 1;
    display: grid;
    grid-template-columns: 3.5fr 1fr;
    gap: var(--space-6);
    height: 100%;
}

.main-section {
    grid-column: 1;
    display: grid;
    grid-template-rows: minmax(calc(var(--gu) * 18.75), 40%) calc(var(--gu) * 5) 1fr;
    gap: var(--space-6);
}

.side-section {
    grid-column: 2;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    height: 100%;
}

// 전체 채팅창 스타일
.global-chat-dock {
    height: 100%; 
    min-height: 0;
}

.hero-placeholder {
    background-size: cover;
    background-position: center;
    border: calc(var(--gu) * 0.0625) solid var(--color-border-cyan);
    border-radius: var(--radius-xl);
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 calc(var(--gu) * 1.25) rgba(58, 242, 255, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: var(--space-8);

    .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, transparent 100%);
        z-index: 1;
    }

    .hero-content {
        position: relative;
        z-index: 2;
        margin-top: var(--space-4);
    }
    
    h1 {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 3.5);
        color: var(--color-accent-cyan);
        text-shadow: 0 0 10px rgba(58, 242, 255, 0.5);
        margin-bottom: var(--space-2);
        max-width: 80%;
    }
    
    p {
        font-size: var(--fontSize-lg);
        color: var(--color-text-primary);
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    }
}

.action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
    
    .action-card {
        background: rgba(18, 16, 30, 0.6);
        border: calc(var(--gu) * 0.0625) solid var(--color-border-subtle);
        border-radius: var(--radius-lg);
        font-size: var(--fontSize-xl);
        font-weight: bold;
        color: var(--color-text-primary);
        cursor: pointer;
        transition: all 0.3s;
        backdrop-filter: blur(10px);
        width: 100%;
        height: 100%; 
        
        &:hover {
            transform: translateY(-5px);
            border-color: var(--color-accent-magenta);
            box-shadow: 0 0 15px rgba(255, 60, 174, 0.3);
        }
        
        &.create {
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);
        }
    }
}

.ranking-panel {
    background: rgba(11, 8, 20, 0.8);
    border: calc(var(--gu) * 0.125) solid #2d2445; 
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: 0 0 10px #7b2cbf40;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .tabs {
        display: flex;
        justify-content: center;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        width: 100%;
        
        button {
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            font-family: var(--font-display);
            font-size: var(--fontSize-md);
            padding-bottom: var(--space-2);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
            
            &.active {
                color: var(--color-accent-cyan);
                border-bottom-color: var(--color-accent-cyan);
                text-shadow: 0 0 10px rgba(58, 242, 255, 0.5);
            }
        }
    }
    
    h3 {
        font-family: var(--font-display);
        color: var(--color-accent-green);
        font-size: var(--fontSize-lg);
        margin-bottom: var(--space-4);
        text-shadow: 0 0 10px rgba(92, 255, 176, 0.5);
        text-align: center;
    }
    
    ul {
        list-style: none;
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        li {
            display: flex;
            align-items: center;
            flex: 1;
            padding: 0;
            border-bottom: calc(var(--gu) * 0.0625) solid rgba(255, 255, 255, 0.05);
            font-family: var(--font-display);
            font-size: var(--fontSize-md);
            
            &:last-child {
                border-bottom: none;
            }
            
            .rank {
                font-weight: bold;
                width: calc(var(--gu) * 1.5);
                flex-shrink: 0;
                color: var(--color-accent-cyan);
                text-align: left;
                
                &.gold { color: #FFD700; }
                &.silver { color: #C0C0C0; }
            }
            .name {
                flex: 1;
                margin-left: var(--space-2);
                color: var(--color-text-primary);
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .pct, .score {
                font-family: var(--font-mono);
                color: var(--color-text-muted);
                width: auto;
                min-width: 40px;
                text-align: right;
            }
        }
    }
}
</style>
