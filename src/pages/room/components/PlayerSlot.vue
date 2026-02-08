<script setup lang="ts">
import { MESSAGES } from '@/shared/constants/messages';
import type { RoomPlayerViewModel } from '@/entities/room.model';
import BaseBadge from '@/shared/ui/BaseBadge.vue';

interface Props {
  player: RoomPlayerViewModel | null;
  isHostView?: boolean;
}

defineProps<Props>();
</script>

<template>
  <div 
    class="player-slot"
    :class="{ 
      occupied: !!player, 
      empty: !player,
      ready: player?.state === 'READY'
    }"
  >
    <template v-if="player">
      <div class="slot-content">
        <div class="player-header">
          <div class="avatar-icon"></div>
          <span class="nickname">{{ player.user.nickname }}</span>
        </div>
        <div class="tier-info">
          <span class="tier-name">{{ player.user.tier }}</span>
          <span class="score-badge">{{ player.user.score }}</span>
        </div>
        <BaseBadge v-if="player.isHost" variant="host" class="host-badge-pos">{{ MESSAGES.ROOM_STATUS.HOST }}</BaseBadge>
        <BaseBadge v-if="player.state === 'READY'" variant="default" class="ready-badge-pos">{{ MESSAGES.ROOM_STATUS.READY }}</BaseBadge>
      </div>
    </template>
    <template v-else>
      <div class="empty-content">
        <span class="placeholder-text">{{ MESSAGES.ROOM_STATUS.WAITING_PLAYER }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.player-slot {
  border-radius: 1vw;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0, 0, 0, 0.2);
  height: 100%;
  
  &.occupied {
    background: rgba(23, 19, 42, 0.95);
    border: 2px solid rgba(255, 255, 255, 0.2);
    
    &.ready {
      background: linear-gradient(135deg, rgba(23, 19, 42, 0.95) 0%, rgba(255, 210, 72, 0.15) 100%);
      border-color: var(--color-accent-yellow);
      box-shadow: 0 0 20px rgba(255, 210, 72, 0.15);
    }
    
    .slot-content {
      padding: 1.5vw;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .player-header {
      display: flex;
      align-items: center;
      gap: 0.8vw;

      .avatar-icon {
        width: 2.8vw; height: 2.8vw;
        background: rgba(255, 210, 72, 0.1) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="%23FFD248" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>') no-repeat center;
        background-size: 60%;
        border: 1px solid var(--color-accent-yellow);
        border-radius: 0.5vw;
      }

      .nickname {
        font-family: var(--font-display);
        font-size: clamp(0.9rem, 1.2vw, 1.2rem);
        color: var(--color-accent-yellow);
        font-weight: 800;
      }
    }

    .tier-info {
      .tier-name {
        font-family: var(--font-display);
        font-size: clamp(1.1rem, 1.6vw, 1.5rem);
        font-weight: 900;
        display: block;
        color: white;
      }
      .score-badge {
        display: inline-block;
        margin-top: 0.5vh;
        background: rgba(255, 255, 255, 0.08);
        padding: 0.2vh 0.8vw;
        border-radius: 0.4vw;
        font-family: var(--font-mono);
        color: var(--color-accent-yellow);
        font-size: clamp(0.65rem, 0.8vw, 0.9rem);
      }
    }

    .host-badge-pos {
      position: absolute;
      top: 1vh; right: 1vw;
      font-size: 0.6vw !important;
      padding: 2px 6px !important;
    }

    .ready-badge-pos {
      position: absolute;
      bottom: 1.5vh; right: 1vw;
      background: var(--color-accent-yellow) !important;
      color: black !important;
      border: none !important;
      box-shadow: 0 0 15px rgba(255, 210, 72, 0.4);
    }
  }

  &.empty {
    border: 2px dashed rgba(58, 242, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    
    .placeholder-text {
      color: var(--color-text-muted);
      font-size: clamp(0.7rem, 0.9vw, 1rem);
      opacity: 0.5;
    }
  }
}
</style>
