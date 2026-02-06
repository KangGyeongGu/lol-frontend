<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRoomStore } from '@/stores/useRoomStore';
import RoomList from '@/widgets/RoomList.vue';
import type { GameType, RoomLanguage } from '@/api/dtos/room.types';
import type { RoomFilterParams } from '@/api/room';

const emit = defineEmits<{
  (e: 'navigate', view: 'HUB'): void;
  (e: 'create'): void;
}>();

const roomStore = useRoomStore();
const router = useRouter();

// 페이지네이션 상태
const currentPage = ref(1);
const roomsPerPage = 10;

// 필터 상태
const searchQuery = ref('');
const searchTarget = ref<'TITLE' | 'HOST'>('TITLE');
const selectedLanguage = ref<string>('ALL');
const selectedMode = ref<string>('ALL'); 
const selectedStatus = ref<string>('ALL'); 
const activeDropdown = ref<'LANG' | 'MODE' | 'STATUS' | 'SEARCH_BY' | null>(null);

const languages = ['ALL', 'JAVA', 'PYTHON', 'CPP', 'JAVASCRIPT'];
const modes = ['ALL', 'RANKED', 'NORMAL'];
const statuses = [
    { label: 'ALL ROOMS', value: 'ALL' },
    { label: 'AVAILABLE', value: 'WAITING' },
    { label: 'IN-GAME', value: 'IN_GAME' }
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

// 클라이언트 사이드 필터링 및 페이지네이션 로직
// 참고: 실무에서는 API 파라미터를 통해 서버 사이드에서 처리하는 것이 일반적임
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
    const params: RoomFilterParams = {};
    if (searchQuery.value && searchTarget.value === 'TITLE') {
        params.roomName = searchQuery.value;
    }
    if (selectedLanguage.value !== 'ALL') params.language = selectedLanguage.value as RoomLanguage;
    if (selectedMode.value !== 'ALL') params.gameType = selectedMode.value as GameType;
    
    await roomStore.fetchRooms(params);
}

// 필터 변경 시 페이지 번호 초기화
watch([searchQuery, searchTarget, selectedLanguage, selectedMode, selectedStatus], () => {
    currentPage.value = 1;
});

onMounted(() => {
    refreshRooms();
});

// 방 참가 처리
async function handleJoinRoom(roomId: string) {
    try {
        const roomDetail = await roomStore.joinRoom(roomId);
        console.log('Joined room:', roomDetail);
        router.push({ name: 'WAITING_ROOM', params: { roomId } });
    } catch (e) {
        console.error('Join failed:', e);
        alert('방 참가에 실패했습니다.');
    }
}
</script>

<template>
  <div class="lobby-panel">
    <header class="lobby-header">
        <button class="back-btn" @click="emit('navigate', 'HUB')">
            <span class="btn-inner">←</span>
        </button>
        <h1 class="title">Battle Rooms</h1>
        <div class="spacer"></div>
    </header>
    
    <div class="filter-bar">
        <div class="action-group">
            <button class="create-btn" @click="emit('create')">
                <span class="plus-icon">+</span>
                Create Room
            </button> 
            <button class="refresh-btn" title="Refresh Rooms" @click="refreshRooms">
                <span class="refresh-icon" :class="{ rotating: roomStore.isLoading }">↻</span>
            </button>
        </div>

        <div class="filter-group">
            <div class="group-label">FILTERS</div>
            
            <!-- 언어 필터 드롭다운 -->
            <div class="dropdown-wrapper">
                <button class="filter-pill" :class="{ active: activeDropdown === 'LANG' }" @click="toggleDropdown('LANG')">
                    Language: {{ selectedLanguage }} <span>▼</span>
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
                    Type: {{ selectedMode }} <span>▼</span>
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
                    Status: {{ statuses.find(s => s.value === selectedStatus)?.label }} <span>▼</span>
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
                            <button class="dropdown-item" :class="{ selected: searchTarget === 'TITLE' }" @click="searchTarget = 'TITLE'; activeDropdown = null">TITLE</button>
                            <button class="dropdown-item" :class="{ selected: searchTarget === 'HOST' }" @click="searchTarget = 'HOST'; activeDropdown = null">HOST</button>
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
        <div v-if="filteredRooms.length === 0 && !roomStore.isLoading" class="no-results">
            검색 결과와 일치하는 방이 없습니다.
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
        width: 48px; height: 48px;
        border-radius: 12px;
        font-size: 1.5rem;
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
        font-size: 3rem;
        background: linear-gradient(135deg, #3AF2FF 0%, #FF4FD8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(58, 242, 255, 0.2);
        letter-spacing: -1px;
    }
    .spacer { flex: 1; }
}

.filter-bar {
    background: rgba(18, 16, 30, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: var(--space-4) var(--space-6);
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(20px);
    margin-bottom: var(--space-4);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05);
    z-index: 100;
    
    .action-group {
        display: flex;
        align-items: center;
        gap: var(--space-3);

        .create-btn {
            background: linear-gradient(135deg, var(--color-accent-cyan) 0%, #2AB6C1 100%);
            border: none;
            color: black;
            padding: 12px 28px;
            border-radius: 12px;
            font-family: var(--font-display);
            font-weight: 800;
            text-transform: uppercase;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
            
            .plus-icon { font-size: 1.2rem; margin-top: -2px; }
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
            width: 48px; height: 48px; border-radius: 12px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s;

            .refresh-icon {
                font-size: 1.8rem;
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
        padding: 6px 14px;
        border-radius: 14px;
        
        .group-label {
            font-size: 0.65rem;
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
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-family: var(--font-display);
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 6px;

    span { font-size: 0.5rem; opacity: 0.5; transition: 0.3s; }
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
    border-radius: 12px;
    padding: 6px;
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
        border-radius: 8px;
        font-family: var(--font-display);
        font-size: 0.8rem;
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
        border-radius: 12px;
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
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 0.7rem;
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
            padding: 10px 12px;
            color: white;
            width: 180px;
            font-family: var(--font-ui);
            font-size: 0.85rem;
            
            &::placeholder { color: rgba(255, 255, 255, 0.3); }
            &:focus { outline: none; width: 220px; }
        }
    }
}

.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: var(--space-4) 0;

    .page-indicator {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        background: rgba(255, 255, 255, 0.02);
        padding: 4px 12px;
        border-radius: 99px;
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
                width: 6px; height: 6px; background: rgba(255, 255, 255, 0.15); border-radius: 50%;
                cursor: pointer;
                &.active { background: var(--color-accent-cyan); box-shadow: 0 0 10px var(--color-accent-cyan); transform: scale(1.3); }
            }
        }
    }

    .room-count {
        position: absolute; right: 0;
        font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted);
        display: flex; align-items: center; gap: 8px;
        .highlight { color: var(--color-accent-cyan); font-family: var(--font-mono); }
    }
}

.room-grid-area {
    flex: 1; overflow: hidden; display: flex; flex-direction: column;
    .no-results {
        flex: 1; display: flex; align-items: center; justify-content: center;
        color: var(--color-text-muted); font-size: 1.1rem;
        background: rgba(255, 255, 255, 0.02); border-radius: 20px; border: 1px dashed rgba(255, 255, 255, 0.1);
    }
}

.slide-fade-enter-active { transition: all 0.2s ease-out; }
.slide-fade-leave-active { transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
