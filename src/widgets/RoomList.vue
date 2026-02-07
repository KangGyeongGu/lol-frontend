<script setup lang="ts">
import type { RoomSummary } from '@/api/dtos/room.types';

interface Props {
  rooms: RoomSummary[];
  loading: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'join', roomId: string): void
}>();
</script>

<template>
  <div class="room-list-container">
    <div v-if="loading" class="empty-state">
        <div class="spinner"></div>
    </div>
    <div v-else-if="rooms.length === 0" class="empty-state">
        현재 대기 중인 방이 없습니다.
    </div>
    
    <div v-else class="grid">
        <div 
            v-for="room in rooms" 
            :key="room.roomId" 
            class="room-card"
        >   
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
                <template v-if="room.roomStatus === 'IN_GAME'">IN GAME</template>
                <template v-else-if="!room.joinable">FULL</template>
                <template v-else>JOIN</template>
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.room-list-container {
    padding: var(--space-4) 0;
    height: 100%;
}

.empty-state {
    color: var(--color-text-muted);
    text-align: center;
    padding: var(--space-8);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    margin-top: var(--space-8);
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--gu) * 17.5), 1fr));
    gap: var(--space-6);
}

.room-card {
    background: rgba(18, 16, 30, 0.8);
    border: calc(var(--gu) * 0.0625) solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    position: relative;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
    
    &:hover {
        transform: translateY(-4px);
        border-color: var(--color-accent-cyan);
        box-shadow: 0 calc(var(--gu) * 0.25) calc(var(--gu) * 1.25) rgba(58, 242, 255, 0.15);
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-1);
    
    .room-type-badge {
        background: rgba(58, 242, 255, 0.1);
        color: var(--color-accent-cyan);
        font-size: calc(var(--gu) * 0.75);
        font-weight: 800;
        padding: calc(var(--gu) * 0.25) calc(var(--gu) * 0.5);
        border-radius: calc(var(--gu) * 0.25);
        letter-spacing: calc(var(--gu) * 0.0625);
    }
    
    .lang-badge {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text-secondary);
        font-size: calc(var(--gu) * 0.75);
        font-weight: bold;
        padding: calc(var(--gu) * 0.25) calc(var(--gu) * 0.5);
        border-radius: calc(var(--gu) * 0.25);
        font-family: var(--font-mono);
    }
}

.room-title {
    font-size: calc(var(--gu) * 1.25);
    color: white;
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.host-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: calc(var(--gu) * 0.875);
    
    .label {
        color: var(--color-text-muted);
        font-size: calc(var(--gu) * 0.75);
        font-weight: bold;
    }
    .name {
        color: var(--color-text-primary);
    }
}

.players-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: var(--space-2);
    
    .slot {
        width: calc(var(--gu) * 1.5);
        height: calc(var(--gu) * 0.375);
        border-radius: calc(var(--gu) * 0.125);
        &.filled { background: var(--color-accent-cyan); box-shadow: 0 0 5px var(--color-accent-cyan); }
        &.empty { background: rgba(255, 255, 255, 0.1); }
    }
    
    .count {
        margin-left: auto;
        color: var(--color-text-muted);
        font-size: calc(var(--gu) * 0.875);
        font-family: var(--font-mono);
    }
}

.join-btn {
    margin-top: var(--space-3);
    background: var(--color-accent-cyan);
    color: #000;
    border: none;
    padding: calc(var(--gu) * 0.75);
    border-radius: var(--radius-sm);
    font-size: calc(var(--gu) * 0.9);
    font-weight: 800;
    width: 100%;
    cursor: pointer;
    font-family: var(--font-display);
    letter-spacing: 1px;
    transition: all 0.2s;
    
    &:hover {
        background: #fff;
        box-shadow: 0 0 calc(var(--gu) * 0.9375) rgba(255, 255, 255, 0.5);
    }
    
    &:active {
        transform: scale(0.98);
    }

    &:disabled {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text-muted);
        cursor: not-allowed;
        box-shadow: none;

        &.in-game {
            background: rgba(255, 79, 216, 0.1);
            color: var(--color-accent-magenta);
            border: calc(var(--gu) * 0.0625) solid rgba(255, 79, 216, 0.3);
        }
    }
}
</style>
