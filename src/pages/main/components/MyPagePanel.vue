<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { MESSAGES } from '@/shared/constants/messages';
import ProfileHeader from '@/pages/user/components/ProfileHeader.vue';
import AccountSettings from '@/pages/user/components/AccountSettings.vue';
import TierView from '@/pages/user/components/TierView.vue';
import StatView from '@/pages/user/components/StatView.vue';
import MatchHistoryList from '@/pages/user/components/MatchHistoryList.vue';

const emit = defineEmits<{
  (e: 'navigate', view: 'HUB'): void;
}>();

const authStore = useAuthStore();
const statsStore = useStatsStore();

// 탭 상태
const activeMainTab = ref<'info' | 'history'>('info');
const activeSubTab = ref<'tier' | 'stat'>('tier');

// 데이터 로드
onMounted(async () => {
    try {
        // UserProfile (language, exp, coin 포함) 조회
        await authStore.fetchUserProfile();

        // 통계 데이터 로드
        await Promise.all([
            statsStore.fetchMyStats().catch(() => null), // API 미구현 시 무시
            statsStore.fetchMyMatches().catch(() => null),
        ]);
    } catch (error) {
        console.error('[MyPagePanel] Data load error:', error);
    }
});

// Computed 데이터 (authStore.user 기반)
// authStore.user는 UserProfileViewModel (language, exp, coin 포함)
const profileData = computed(() => {
    const u = authStore.user as any; // UserProfileViewModel 타입
    return {
        nickname: u?.nickname ?? 'Unknown',
        language: u?.language ?? 'JAVA',
        coin: u?.coin ?? 0,
        exp: u?.exp ?? 0,
        rating: u?.score ?? 0,
        tier: u?.tier ?? 'UNRANKED',
    };
});

// statsStore 데이터 (API 미구현 대비 fallback)
const statsData = computed(() => ({
    totalGames: statsStore.myStats?.totalGames ?? 0,
    totalWin: statsStore.myStats?.totalWin ?? 0,
    totalLose: statsStore.myStats?.totalLose ?? 0,
    totalDraw: statsStore.myStats?.totalDraw ?? 0,
    winRate: statsStore.myStats?.winRate ?? 0,
    // avgRank, solvedRate는 OPENAPI spec에 없음 - 임시로 계산
    avgRank: 0, // TODO: 별도 API 제공 시 사용
    solvedRate: 0, // TODO: 별도 API 제공 시 사용
}));

// 계정 정보
const accountData = computed(() => {
    const u = authStore.user as any;
    return {
        provider: 'Kakao',
        email: u?.email ?? 'user@example.com', // TODO: UserProfile에 email 추가 시 사용
        joinDate: u?.joinDate ?? '2025-01-01', // TODO: UserProfile에 joinDate 추가 시 사용
    };
});

// MatchHistoryList 컴포넌트에 전달할 데이터 변환
const matchHistoryListData = computed(() => {
    return statsStore.myMatches.map(match => ({
        id: match.matchId,
        type: match.gameType === 'RANKED' ? 'rank' : 'normal',
        status: match.result,
        players: match.finalPlayers,
        title: match.roomName,
        date: match.playedAt,
    }));
});

// 이벤트 핸들러
function handleLogout() {
    authStore.logout();
    emit('navigate', 'HUB');
}

function handleEditNickname() {
    console.log('TODO: 닉네임 수정 모달');
}

function handleEditLanguage() {
    console.log('TODO: 언어 수정 모달');
}

function handleViewResult(matchId: string) {
    console.log('TODO: 매치 결과 상세', matchId);
}
</script>

<template>
    <div class="mypage-panel">
        <div class="panel-content">
            <ProfileHeader
                :nickname="profileData.nickname"
                :language="profileData.language"
                :coin="profileData.coin"
                :rating="profileData.rating"
                :total-games="statsData.totalGames"
                :total-win="statsData.totalWin"
                :avg-rank="statsData.avgRank"
                :active-tab="activeMainTab"
                @tab-change="activeMainTab = $event"
            />

            <main class="detail-section">
                <!-- 내정보 탭 -->
                <div v-if="activeMainTab === 'info'" class="tab-content info-layout">
                    <AccountSettings
                        :provider="accountData.provider"
                        :nickname="profileData.nickname"
                        :email="accountData.email"
                        :language="profileData.language"
                        :join-date="accountData.joinDate"
                        @logout="handleLogout"
                        @edit-nickname="handleEditNickname"
                        @edit-language="handleEditLanguage"
                    />

                    <div class="info-details">
                        <nav class="sub-tabs">
                            <button :class="{ active: activeSubTab === 'tier' }" @click="activeSubTab = 'tier'">
                                {{ MESSAGES.MY_PAGE.SUBTAB_TIER }}
                            </button>
                            <button :class="{ active: activeSubTab === 'stat' }" @click="activeSubTab = 'stat'">
                                {{ MESSAGES.MY_PAGE.SUBTAB_STAT }}
                            </button>
                        </nav>

                        <div class="sub-content">
                            <TierView
                                v-if="activeSubTab === 'tier'"
                                :tier="profileData.tier"
                                :score="profileData.rating"
                                :next-tier-progress="1"
                                :win-rate="statsData.winRate"
                                :solved-rate="statsData.solvedRate"
                            />
                            <StatView v-else />
                        </div>
                    </div>
                </div>

                <!-- 대전기록 탭 -->
                <MatchHistoryList
                    v-else
                    :matches="matchHistoryListData"
                    @view-result="handleViewResult"
                />
            </main>
        </div>
    </div>
</template>

<style scoped lang="scss">
.mypage-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.panel-content {
    flex: 1;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    min-height: 0;
}

.detail-section {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: var(--space-2);

    &::-webkit-scrollbar {
        width: 3px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-left: 1px solid rgba(255, 255, 255, 0.05);
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--color-accent-cyan);
        background-image: linear-gradient(
            180deg,
            var(--color-accent-cyan) 0%,
            var(--color-accent-cyan) 80%,
            transparent 80%,
            transparent 100%
        );
        background-size: 100% 10px;

        &:hover {
            background-color: #fff;
        }
    }
}

.tab-content {
    height: 100%;
    display: flex;
    gap: var(--space-6);
    min-height: 0;

    &.info-layout {
        display: flex;
    }
}

.info-details {
    flex: 1;
    background: rgba(30, 26, 45, 0.4);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.sub-tabs {
    display: flex;
    height: calc(var(--gu) * 3);
    background: rgba(0, 0, 0, 0.2);

    button {
        flex: 1;
        background: none;
        border: none;
        color: var(--color-text-muted);
        font-weight: 800;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        font-size: calc(var(--gu) * 0.8);

        &.active {
            color: var(--color-accent-cyan);
            border-bottom-color: var(--color-accent-cyan);
            background: rgba(58, 242, 255, 0.05);
        }
    }
}

.sub-content {
    flex: 1;
    padding: var(--space-6);
    overflow: hidden;
    min-height: 0;
}
</style>
