<script setup lang="ts">
import { computed } from 'vue';
import { MESSAGES } from '@/shared/constants/messages';
import type { RoomSummaryViewModel } from '@/entities/room.model';

interface Props {
  rooms: RoomSummaryViewModel[];
  loading: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'join', roomId: string): void
}>();

// 항상 10개의 슬롯을 유지하기 위한 데이터 처리
const MAX_SLOTS = 10;
const filledSlots = computed(() => {
    const slots = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
        slots.push(props.rooms[i] || null);
    }
    return slots;
});
</script>

<template>
  <div class="room-list-container">
    <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
    </div>
    
    <div class="grid">
        <div 
            v-for="(room, index) in filledSlots" 
            :key="index" 
            class="slot-wrapper"
        >
            <div v-if="room" class="room-card">
                <!-- 1. 헤더: 게임 모드 및 언어 -->
                <div class="card-header">
                    <span class="room-type-badge" :class="room.gameType.toLowerCase()">{{ room.gameType }}</span>
                    <span class="lang-badge">{{ room.language || '?' }}</span>
                </div>
                
                <!-- 2. 본문: 방 제목 -->
                <h3 class="room-title">{{ room.roomName }}</h3>
                
                <!-- 3. 상태 정보 -->
                <div class="host-info">
                    <span class="label">STATUS</span>
                    <span class="name">{{ room.roomStatus }}</span>
                </div>

                <!-- 4. 참여 인원 표시 -->
                <div class="players-indicator">
                    <div class="slot filled" v-for="n in room.currentPlayers" :key="'fill-'+n"></div>
                    <div class="slot empty" v-for="n in (room.maxPlayers - room.currentPlayers)" :key="'empty-'+n"></div>
                    <span class="count">{{ room.currentPlayers }}/{{ room.maxPlayers }}</span>
                </div>
                
                <!-- 5. 참여 버튼 -->
                <button
                    class="join-btn"
                    :class="{ 'in-game': room.roomStatus === 'IN_GAME' }"
                    :disabled="!room.joinable"
                    @click="emit('join', room.roomId)"
                >
                    <template v-if="room.roomStatus === 'IN_GAME'">{{ MESSAGES.ROOM_STATUS.IN_GAME }}</template>
                    <template v-else-if="!room.joinable">{{ MESSAGES.ROOM_STATUS.FULL }}</template>
                    <template v-else>{{ MESSAGES.COMMON.JOIN }}</template>
                </button>
            </div>
            <!-- 빈 슬롯 가이드 -->
            <div v-else class="empty-slot">
                <div class="empty-pattern"></div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.room-list-container {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
}

.loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    background: rgba(11, 8, 20, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
}

.grid {
    display: grid;
    /* 5x2 고정 그리드 */
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: calc(var(--gu) * 1.25);
    min-height: calc(var(--gu) * 30); /* 최소 높이 확보로 납작해짐 방지 */
    max-height: calc(var(--gu) * 38); /* 최대 높이 제한으로 무한 확장 방지 */
    margin-bottom: auto;
}

.slot-wrapper {
    min-height: 0;
    height: 100%;
}

.room-card {
    background: rgba(18, 16, 30, 0.8);
    border: calc(var(--gu) * 0.0625) solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: calc(var(--gu) * 0.75);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    box-sizing: border-box;
    position: relative;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
    overflow: hidden; /* Prevent content from stretching the card vertically */
    
    &:hover {
        transform: translateY(-4px);
        border-color: var(--color-accent-cyan);
        box-shadow: 0 0 calc(var(--gu) * 1.5) rgba(58, 242, 255, 0.2);
    }
}

.empty-slot {
    height: 100%;
    border: 1px dashed rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.01);
    display: flex;
    align-items: center;
    justify-content: center;
    
    .empty-pattern {
        width: 30%;
        height: 1px;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: calc(var(--gu) * 0.25);
    
    .room-type-badge {
        background: rgba(58, 242, 255, 0.1);
        color: var(--color-accent-cyan);
        font-size: calc(var(--gu) * 0.65);
        font-weight: 800;
        padding: calc(var(--gu) * 0.1) calc(var(--gu) * 0.4);
        border-radius: calc(var(--gu) * 0.25);
        letter-spacing: 0.5px;
    }
    
    .lang-badge {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text-secondary);
        font-size: calc(var(--gu) * 0.65);
        font-weight: bold;
        padding: calc(var(--gu) * 0.1) calc(var(--gu) * 0.4);
        border-radius: calc(var(--gu) * 0.25);
        font-family: var(--font-mono);
    }
}

.room-title {
    font-size: calc(var(--gu) * 0.9);
    color: white;
    font-weight: 700;
    margin: calc(var(--gu) * 0.25) 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
}

.host-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: calc(var(--gu) * 0.7);
    
    .label {
        color: var(--color-text-muted);
        font-size: calc(var(--gu) * 0.6);
        font-weight: bold;
    }
    .name {
        color: var(--color-text-primary);
    }
}

.players-indicator {
    display: flex;
    align-items: center;
    gap: 3px;
    margin: calc(var(--gu) * 0.4) 0;
    
    .slot {
        width: calc(var(--gu) * 1);
        height: calc(var(--gu) * 0.25);
        border-radius: 1px;
        &.filled { background: var(--color-accent-cyan); box-shadow: 0 0 5px var(--color-accent-cyan); }
        &.empty { background: rgba(255, 255, 255, 0.1); }
    }
    
    .count {
        margin-left: auto;
        color: var(--color-text-muted);
        font-size: calc(var(--gu) * 0.7);
        font-family: var(--font-mono);
    }
}

.join-btn {
    margin-top: calc(var(--gu) * 0.4);
    background: var(--color-accent-cyan);
    color: #000;
    border: none;
    height: calc(var(--gu) * 1.6);
    border-radius: var(--radius-sm);
    font-size: calc(var(--gu) * 0.75);
    font-weight: 800;
    width: 100%;
    cursor: pointer;
    font-family: var(--font-display);
    letter-spacing: 0.5px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover:not(:disabled) {
        background: #fff;
        box-shadow: 0 0 calc(var(--gu) * 0.9) rgba(255, 255, 255, 0.5);
    }
    
    &:disabled {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text-muted);
        cursor: not-allowed;

        &.in-game {
            background: rgba(255, 79, 216, 0.1);
            color: var(--color-accent-magenta);
            border: 1px solid rgba(255, 79, 216, 0.3);
        }
    }
}

.spinner {
    width: calc(var(--gu) * 2.5);
    height: calc(var(--gu) * 2.5);
    border: 3px solid rgba(58, 242, 255, 0.1);
    border-radius: 50%;
    border-top-color: var(--color-accent-cyan);
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
