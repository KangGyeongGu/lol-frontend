<script setup lang="ts">
import type { RoomPlayer } from '@/api/dtos/room.types';
import BaseBadge from '@/shared/ui/BaseBadge.vue';

interface Props {
  player: RoomPlayer | null;
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
        <BaseBadge v-if="player.isHost" variant="host" class="host-badge-pos">HOST</BaseBadge>
        <BaseBadge v-if="player.state === 'READY'" variant="default" class="ready-badge-pos">READY</BaseBadge>
      </div>
    </template>
    <template v-else>
      <div class="empty-content">
        <span class="placeholder-text">Waiting for player...</span>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.player-slot {
  border-radius: var(--gu);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0, 0, 0, 0.2);
  height: 100%;
  
  &.occupied {
    background: rgba(23, 19, 42, 0.95);
    border: calc(var(--gu) * 0.125) solid rgba(255, 255, 255, 0.2);
    
    &.ready {
      background: linear-gradient(135deg, rgba(23, 19, 42, 0.95) 0%, rgba(255, 210, 72, 0.15) 100%);
      border-color: var(--color-accent-yellow);
      box-shadow: 0 0 calc(var(--gu) * 1.25) rgba(255, 210, 72, 0.15);
    }
    
    .slot-content {
      padding: calc(var(--gu) * 1.5);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .player-header {
      display: flex;
      align-items: center;
      gap: calc(var(--gu) * 0.8);

      .avatar-icon {
        width: calc(var(--gu) * 2.8); height: calc(var(--gu) * 2.8);
        background: rgba(255, 210, 72, 0.1) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="%23FFD248" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>') no-repeat center;
        background-size: 60%;
        border: 1px solid var(--color-accent-yellow);
        border-radius: calc(var(--gu) * 0.5);
      }

      .nickname {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 1.1);
        color: var(--color-accent-yellow);
        font-weight: 800;
      }
    }

    .tier-info {
      .tier-name {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 1.4);
        font-weight: 900;
        display: block;
        color: white;
      }
      .score-badge {
        display: inline-block;
        margin-top: 0.5vh;
        background: rgba(255, 255, 255, 0.08);
        padding: calc(var(--gu) * 0.1) calc(var(--gu) * 0.8);
        border-radius: calc(var(--gu) * 0.4);
        font-family: var(--font-mono);
        color: var(--color-accent-yellow);
        font-size: calc(var(--gu) * 0.75);
      }
    }

    .host-badge-pos {
      position: absolute;
      top: calc(var(--gu) * 0.56); right: var(--gu);
      font-size: calc(var(--gu) * 0.6) !important;
      padding: calc(var(--gu) * 0.125) calc(var(--gu) * 0.375) !important;
    }

    .ready-badge-pos {
      position: absolute;
      bottom: calc(var(--gu) * 0.84); right: var(--gu);
      background: var(--color-accent-yellow) !important;
      color: black !important;
      border: none !important;
      box-shadow: 0 0 calc(var(--gu) * 0.9) rgba(255, 210, 72, 0.4);
    }
  }

  &.empty {
    border: calc(var(--gu) * 0.125) dashed rgba(58, 242, 255, 0.15);
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
