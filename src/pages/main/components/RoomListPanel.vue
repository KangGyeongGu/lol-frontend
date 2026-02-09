<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRoomStore } from '@/stores/useRoomStore';
import { MESSAGES } from '@/shared/constants/messages';
import RoomList from '@/widgets/RoomList.vue';
import type { RoomFilterParams } from '@/api/dtos/room.dto';
import type { GameType, Language, RoomStatus } from '@/entities/room.model';

const emit = defineEmits<{
  (e: 'navigate', view: 'HUB'): void;
  (e: 'create'): void;
}>();

const roomStore = useRoomStore();
const router = useRouter();

const currentPage = ref(1);
const roomsPerPage = 10;
const errorMessage = ref<string | null>(null);

const searchQuery = ref('');
const searchTarget = ref<'TITLE' | 'HOST'>('TITLE');
const selectedLanguage = ref<Language | 'ALL'>('ALL');
const selectedMode = ref<GameType | 'ALL'>('ALL');
const selectedStatus = ref<RoomStatus | 'ALL'>('ALL');
const activeDropdown = ref<'LANG' | 'MODE' | 'STATUS' | 'SEARCH_BY' | null>(null);

const languages: (Language | 'ALL')[] = ['ALL', 'JAVA', 'PYTHON', 'CPP', 'JAVASCRIPT'];
const modes: (GameType | 'ALL')[] = ['ALL', 'RANKED', 'NORMAL'];
const statuses: { label: string, value: RoomStatus | 'ALL' }[] = [
    { label: MESSAGES.FILTER.ALL_ROOMS, value: 'ALL' },
    { label: MESSAGES.FILTER.AVAILABLE, value: 'WAITING' },
    { label: MESSAGES.FILTER.IN_GAME, value: 'IN_GAME' }
];

function toggleDropdown(type: 'LANG' | 'MODE' | 'STATUS' | 'SEARCH_BY') {
    activeDropdown.value = activeDropdown.value === type ? null : type;
}

function resetFilters() {
    searchQuery.value = '';
    searchTarget.value = 'TITLE';
    selectedLanguage.value = 'ALL';
    selectedMode.value = 'ALL';
    selectedStatus.value = 'ALL';
}

const filteredRooms = computed(() => {
    return roomStore.rooms.filter(room => {
        // 검색어 필터
        const matchesSearch = searchTarget.value === 'TITLE'
            ? room.roomName.toLowerCase().includes(searchQuery.value.toLowerCase())
            : true;
        if (!matchesSearch) return false;

        // 언어 필터
        if (selectedLanguage.value !== 'ALL') {
             if (room.language !== selectedLanguage.value) {
                 return false;
             }
        }

        // 게임 타입 필터 (랭크/일반)
        if (selectedMode.value !== 'ALL' && room.gameType !== selectedMode.value) {
            return false;
        }

        // 상태 필터 (대기중/게임중)
        if (selectedStatus.value !== 'ALL' && room.roomStatus !== selectedStatus.value) {
            return false;
        }

        return true;
    });
});

const paginatedRooms = computed(() => {
    const start = (currentPage.value - 1) * roomsPerPage;
    return filteredRooms.value.slice(start, start + roomsPerPage);
});

const totalPages = computed(() => Math.ceil(filteredRooms.value.length / roomsPerPage));

function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}

// 방 목록 새로고침 (API 호출)
async function refreshRooms() {
    const params: RoomFilterParams = {
        limit: 20
    };

    if (searchQuery.value) {
        if (searchTarget.value === 'TITLE') {
            params.roomName = searchQuery.value;
        } else {
            params.hostName = searchQuery.value;
        }
    }

    if (selectedLanguage.value !== 'ALL') params.language = selectedLanguage.value as Language;
    if (selectedMode.value !== 'ALL') params.gameType = selectedMode.value as GameType;
    if (selectedStatus.value !== 'ALL') params.roomStatus = selectedStatus.value as RoomStatus;

    await roomStore.fetchRooms(params);
}

watch([searchQuery, searchTarget, selectedLanguage, selectedMode, selectedStatus], () => {
    currentPage.value = 1;
});

onMounted(() => {
    refreshRooms();
});

async function handleJoinRoom(roomId: string) {
    try {
        await roomStore.joinRoom(roomId);
        router.push({ name: 'WAITING_ROOM', params: { roomId } });
    } catch (e) {
        console.error('Join failed:', e);
        errorMessage.value = MESSAGES.ROOM.JOIN_FAILED;
        setTimeout(() => {
            errorMessage.value = null;
        }, 3000);
    }
}
</script>

<template>
  <div class="lobby-panel">
    <header class="lobby-header">
        <button class="back-btn" @click="emit('navigate', 'HUB')">
            <span class="btn-inner">←</span>
        </button>
        <h1 class="title">{{ MESSAGES.PAGE.BATTLE_ROOMS }}</h1>
        <div class="spacer"></div>
    </header>

    <div class="filter-bar">
        <div class="action-group">
            <button class="create-btn" @click="emit('create')">
                <span class="plus-icon">+</span>
                {{ MESSAGES.PAGE.CREATE_ROOM }}
            </button>
            <button class="refresh-btn" :title="MESSAGES.PAGE.REFRESH_ROOMS" @click="refreshRooms">
                <span class="refresh-icon" :class="{ rotating: roomStore.isLoading }">↻</span>
            </button>
        </div>

        <div class="filter-group">
            <div class="group-label">{{ MESSAGES.FILTER.FILTERS }}</div>

            <!-- 언어 필터 드롭다운 -->
            <div class="dropdown-wrapper">
                <button class="filter-pill" :class="{ active: activeDropdown === 'LANG' }" @click="toggleDropdown('LANG')">
                    {{ MESSAGES.FILTER.LANGUAGE }} {{ selectedLanguage }} <span>▼</span>
                </button>
                <Transition name="slide-fade">
                    <div v-if="activeDropdown === 'LANG'" class="dropdown-panel">
                        <button v-for="lang in languages" :key="lang" class="dropdown-item" :class="{ selected: selectedLanguage === lang }" @click="selectedLanguage = lang; activeDropdown = null">
                            {{ lang }}
                        </button>
                    </div>
                </Transition>
            </div>

            <!-- 게임 타입 필터 드롭다운 -->
            <div class="dropdown-wrapper">
                <button class="filter-pill" :class="{ active: activeDropdown === 'MODE' }" @click="toggleDropdown('MODE')">
                    {{ MESSAGES.FILTER.TYPE }} {{ selectedMode }} <span>▼</span>
                </button>
                <Transition name="slide-fade">
                    <div v-if="activeDropdown === 'MODE'" class="dropdown-panel">
                        <button v-for="m in modes" :key="m" class="dropdown-item" :class="{ selected: selectedMode === m }" @click="selectedMode = m; activeDropdown = null">
                            {{ m }}
                        </button>
                    </div>
                </Transition>
            </div>

            <!-- 상태 필터 드롭다운 -->
            <div class="dropdown-wrapper">
                <button class="filter-pill" :class="{ active: activeDropdown === 'STATUS' }" @click="toggleDropdown('STATUS')">
                    {{ MESSAGES.FILTER.STATUS }} {{ statuses.find(s => s.value === selectedStatus)?.label }} <span>▼</span>
                </button>
                <Transition name="slide-fade">
                    <div v-if="activeDropdown === 'STATUS'" class="dropdown-panel">
                        <button v-for="s in statuses" :key="s.value" class="dropdown-item" :class="{ selected: selectedStatus === s.value }" @click="selectedStatus = s.value; activeDropdown = null">
                            {{ s.label }}
                        </button>
                    </div>
                </Transition>
            </div>

            <!-- 필터 초기화 버튼 -->
            <button class="filter-reset-icon" title="Reset Filters" @click="resetFilters">
                <span class="icon">⟲</span>
            </button>
        </div>

        <div class="search-group">
            <div class="search-wrapper">
                <div class="search-target-dropdown dropdown-wrapper">
                    <button class="target-btn" @click="toggleDropdown('SEARCH_BY')">
                        {{ searchTarget }} <span>▼</span>
                    </button>
                    <Transition name="slide-fade">
                        <div v-if="activeDropdown === 'SEARCH_BY'" class="dropdown-panel small">
                            <button class="dropdown-item" :class="{ selected: searchTarget === 'TITLE' }" @click="searchTarget = 'TITLE'; activeDropdown = null">{{ MESSAGES.FILTER.TITLE }}</button>
                            <button class="dropdown-item" :class="{ selected: searchTarget === 'HOST' }" @click="searchTarget = 'HOST'; activeDropdown = null">{{ MESSAGES.FILTER.HOST }}</button>
                        </div>
                    </Transition>
                </div>
                <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="searchTarget === 'TITLE' ? 'Search by room title...' : 'Search by host name...'"
                />
            </div>
        </div>
    </div>

    <div class="pagination-container">
        <div class="page-indicator">
            <button class="page-nav prev" :disabled="currentPage === 1" @click="setPage(currentPage - 1)">PREV</button>
            <div class="page-dots">
                <span v-for="p in totalPages" :key="p" class="dot" :class="{ active: currentPage === p }" @click="setPage(p)"></span>
            </div>
            <button class="page-nav next" :disabled="currentPage === totalPages || totalPages === 0" @click="setPage(currentPage + 1)">NEXT</button>
        </div>
        <div class="room-count">
            Page <span class="highlight">{{ totalPages === 0 ? 0 : currentPage }}</span> of {{ totalPages }}
            <span class="divider">|</span>
            Found <span class="highlight">{{ filteredRooms.length }}</span> Matches
        </div>
    </div>

    <main class="room-grid-area">
        <p v-if="errorMessage" class="error-message-fixed">{{ errorMessage }}</p>
        <div v-if="filteredRooms.length === 0 && !roomStore.isLoading" class="no-results">
            {{ MESSAGES.EMPTY_STATE.NO_RESULTS }}
        </div>
        <RoomList v-else :rooms="paginatedRooms" :loading="roomStore.isLoading" @join="handleJoinRoom" />
    </main>
  </div>
</template>

<style scoped lang="scss">
.lobby-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.lobby-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-2);

    .back-btn {
        background: rgba(58, 242, 255, 0.05);
        border: 1px solid rgba(58, 242, 255, 0.3);
        color: var(--color-accent-cyan);
        width: calc(var(--gu) * 3); height: calc(var(--gu) * 3);
        border-radius: calc(var(--gu) * 0.75);
        font-size: calc(var(--gu) * 1.5);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            background: rgba(58, 242, 255, 0.15);
            border-color: var(--color-accent-cyan);
            box-shadow: 0 0 15px rgba(58, 242, 255, 0.3);
            transform: scale(1.05);
        }
        .btn-inner { margin-top: -2px; }
    }

    .title {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 3);
        background: linear-gradient(135deg, #3AF2FF 0%, #FF4FD8 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 calc(var(--gu) * 1.875) rgba(58, 242, 255, 0.2);
        letter-spacing: calc(var(--gu) * -0.06);
    }
    .spacer { flex: 1; }
}

.filter-bar {
    background: rgba(18, 16, 30, 0.4);
    border: calc(var(--gu) * 0.0625) solid rgba(255, 255, 255, 0.08);
    border-radius: calc(var(--gu) * 1.25);
    padding: calc(var(--gu) * 0.75) var(--space-6);
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(20px);
    margin-bottom: var(--space-3);
    box-shadow: 0 calc(var(--gu) * 0.5) calc(var(--gu) * 2) rgba(0, 0, 0, 0.4), inset 0 calc(var(--gu) * 0.0625) calc(var(--gu) * 0.0625) rgba(255, 255, 255, 0.05);
    z-index: 100;

    .action-group {
        display: flex;
        align-items: center;
        gap: var(--space-3);

        .create-btn {
            background: linear-gradient(135deg, var(--color-accent-cyan) 0%, #2AB6C1 100%);
            border: none;
            color: black;
            padding: calc(var(--gu) * 0.75) calc(var(--gu) * 1.75);
            border-radius: calc(var(--gu) * 0.75);
            font-family: var(--font-display);
            font-weight: 800;
            text-transform: uppercase;
            font-size: calc(var(--gu) * 0.9);
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;

            .plus-icon { font-size: calc(var(--gu) * 1.2); margin-top: calc(var(--gu) * -0.125); }
            &:hover {
               transform: translateY(-2px);
               box-shadow: 0 0 20px rgba(58, 242, 255, 0.4);
               filter: brightness(1.1);
            }
        }

        .refresh-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--color-text-secondary);
            width: calc(var(--gu) * 3); height: calc(var(--gu) * 3); border-radius: calc(var(--gu) * 0.75);
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s;

            .refresh-icon {
                font-size: calc(var(--gu) * 1.8);
                display: inline-block;
                &.rotating { animation: spin 1s linear infinite; }
            }

            &:hover {
                color: var(--color-accent-cyan);
                border-color: var(--color-accent-cyan);
                box-shadow: 0 0 10px rgba(58, 242, 255, 0.2);
            }
        }

        }

    .filter-group {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        background: rgba(0, 0, 0, 0.2);
        padding: calc(var(--gu) * 0.375) calc(var(--gu) * 0.875);
        border-radius: calc(var(--gu) * 0.875);

        .group-label {
            font-size: calc(var(--gu) * 0.65);
            font-weight: 800;
            color: var(--color-text-muted);
            letter-spacing: 1.5px;
            margin-right: var(--space-2);
        }

        .filter-reset-icon {
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            font-size: 1.1rem;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 4px;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            padding-left: 12px;
            transition: color 0.3s;

            .icon {
                display: flex;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            &:hover {
                color: var(--color-accent-red);
                text-shadow: 0 0 10px rgba(255, 77, 109, 0.5);
                .icon { transform: rotate(-180deg); }
            }

            &:active {
                .icon {
                    transform: rotate(-360deg);
                    transition: transform 0.2s;
                }
            }
        }
    }
}

.dropdown-wrapper {
    position: relative;
}

.filter-pill {
    background: rgba(255, 79, 216, 0.05);
    border: 1px solid rgba(255, 79, 216, 0.2);
    color: var(--color-accent-magenta);
    padding: calc(var(--gu) * 0.5) calc(var(--gu) * 0.875);
    border-radius: calc(var(--gu) * 0.625);
    font-size: calc(var(--gu) * 0.75);
    font-family: var(--font-display);
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 6px;

    span { font-size: calc(var(--gu) * 0.5); opacity: 0.5; transition: 0.3s; }
    &.active {
        background: rgba(255, 79, 216, 0.15);
        box-shadow: 0 0 15px rgba(255, 79, 216, 0.3);
        span { transform: rotate(180deg); }
    }
    &:hover { border-color: var(--color-accent-magenta); }
}

.dropdown-panel {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 140px;
    background: rgba(20, 18, 30, 0.95);
    border: 1px solid rgba(255, 79, 216, 0.2);
    border-radius: calc(var(--gu) * 0.75);
    padding: calc(var(--gu) * 0.375);
    backdrop-filter: blur(20px);
    z-index: 200;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);

    &.small { min-width: 100px; }

    .dropdown-item {
        width: 100%;
        text-align: left;
        background: transparent;
        border: none;
        color: var(--color-text-secondary);
        padding: 8px 12px;
        border-radius: calc(var(--gu) * 0.5);
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 0.8);
        cursor: pointer;
        transition: 0.2s;

        &:hover { background: rgba(255, 255, 255, 0.05); color: white; }
        &.selected {
            background: rgba(255, 79, 216, 0.1);
            color: var(--color-accent-magenta);
            font-weight: 800;
        }
    }
}

.search-group {
    .search-wrapper {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: calc(var(--gu) * 0.75);
        display: flex;
        align-items: center;
        padding-left: 4px;
        transition: 0.3s;

        &:focus-within {
            border-color: var(--color-accent-cyan);
            box-shadow: 0 0 15px rgba(58, 242, 255, 0.15);
        }

        .search-target-dropdown {
            .target-btn {
                background: rgba(255, 255, 255, 0.05);
                border: none;
                color: var(--color-text-muted);
                padding: calc(var(--gu) * 0.375) calc(var(--gu) * 0.75);
                border-radius: calc(var(--gu) * 0.5);
                font-size: calc(var(--gu) * 0.7);
                font-weight: 800;
                cursor: pointer;
                display: flex; align-items: center; gap: 4px;
                margin-right: 4px;
                &:hover { color: white; background: rgba(255, 255, 255, 0.1); }
            }
        }

        input {
            background: transparent;
            border: none;
            padding: calc(var(--gu) * 0.625) calc(var(--gu) * 0.75);
            color: white;
            width: calc(var(--gu) * 11.25);
            font-family: var(--font-ui);
            font-size: calc(var(--gu) * 0.85);

            &::placeholder { color: rgba(255, 255, 255, 0.3); }
            &:focus { outline: none; width: calc(var(--gu) * 13.75); }
        }
    }
}

.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: var(--space-2) 0;

    .page-indicator {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        background: rgba(255, 255, 255, 0.02);
        padding: calc(var(--gu) * 0.25) calc(var(--gu) * 0.75);
        border-radius: calc(var(--gu) * 6.18);
        border: 1px solid rgba(255, 255, 255, 0.05);

        .page-nav {
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            font-family: var(--font-display);
            font-size: 0.7rem;
            font-weight: 800;
            cursor: pointer;
            padding: 8px;
            &:not(:disabled):hover { color: var(--color-accent-cyan); text-shadow: 0 0 8px var(--color-accent-cyan); }
            &:disabled { opacity: 0.2; cursor: not-allowed; }
        }

        .page-dots {
            display: flex; gap: 8px;
            .dot {
                width: calc(var(--gu) * 0.375); height: calc(var(--gu) * 0.375); background: rgba(255, 255, 255, 0.15); border-radius: 50%;
                cursor: pointer;
                &.active { background: var(--color-accent-cyan); box-shadow: 0 0 10px var(--color-accent-cyan); transform: scale(1.3); }
            }
        }
    }

    .room-count {
        position: absolute; right: 0;
        font-size: calc(var(--gu) * 0.7); font-weight: 600; color: var(--color-text-muted);
        display: flex; align-items: center; gap: 8px;
        .highlight { color: var(--color-accent-cyan); font-family: var(--font-mono); }
    }
}

.room-grid-area {
    flex: 1;
    min-height: 0; 
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;

    .error-message-fixed {
        position: absolute;
        top: calc(var(--gu) * 1);
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        color: var(--color-accent-red);
        font-size: calc(var(--gu) * 0.9);
        text-align: center;
        padding: calc(var(--gu) * 0.75) calc(var(--gu) * 1.5);
        background: rgba(255, 77, 109, 0.15);
        border: calc(var(--gu) * 0.0625) solid var(--color-accent-red);
        border-radius: var(--radius-md);
        animation: shake 0.3s ease-in-out;
        box-shadow: 0 calc(var(--gu) * 0.5) calc(var(--gu) * 2) rgba(0, 0, 0, 0.5);
    }

    .no-results {
        flex: 1; display: flex; align-items: center; justify-content: center;
        color: var(--color-text-muted); font-size: calc(var(--gu) * 1.1);
        background: rgba(255, 255, 255, 0.02); border-radius: calc(var(--gu) * 1.25); border: calc(var(--gu) * 0.0625) dashed rgba(255, 255, 255, 0.1);
    }
}

.slide-fade-enter-active { transition: all 0.2s ease-out; }
.slide-fade-leave-active { transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@keyframes shake {
    0%, 100% { transform: translateX(-50%); }
    25% { transform: translateX(calc(-50% - 5px)); }
    75% { transform: translateX(calc(-50% + 5px)); }
}
</style>
