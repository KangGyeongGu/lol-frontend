<script setup lang="ts">
import { MESSAGES } from '@/shared/constants/messages';
import type { RoomPlayerViewModel } from '@/entities/room.model';

interface Props {
  player: RoomPlayerViewModel | null;
}

defineProps<Props>();
</script>

<template>
  <div class="match-player-slot" :class="{ empty: !player }">
    <template v-if="player">
      <div class="player-avatar">
        <div class="avatar-icon"></div>
      </div>
      <div class="player-name-section">
        <span class="nickname">{{ player.user.nickname }}</span>
      </div>
      <div class="player-meta-section">
        <span class="tier">{{ player.user.tier }}</span>
        <span class="score">{{ player.user.score }}</span>
      </div>
    </template>
    <div v-else class="empty-info">
      <span class="placeholder">{{ MESSAGES.MATCH.WAITING_FOR_PLAYER }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.match-player-slot {
  height: calc(var(--gu) * 4.5);
  background: rgba(18, 16, 30, 0.7);
  border: 1px solid var(--color-accent-cyan);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  padding: 0 calc(var(--gu) * 2);
  gap: calc(var(--gu) * 2);
  box-shadow: 0 0 10px rgba(58, 242, 255, 0.1);

  &.empty {
    border-style: dashed;
    border-color: rgba(58, 242, 255, 0.3);
    justify-content: center;
  }

  .player-avatar {
    width: calc(var(--gu) * 3);
    height: calc(var(--gu) * 3);
    border: 1px solid var(--color-accent-yellow);
    background: rgba(255, 210, 72, 0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    .avatar-icon {
      width: 80%;
      height: 80%;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23FFD248" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>') center/contain no-repeat;
    }
  }

  .player-name-section {
    flex: 1;
    .nickname {
      font-family: var(--font-display);
      font-size: var(--fontSize-md);
      color: var(--color-accent-cyan);
      font-weight: 700;
      text-transform: lowercase;
    }
  }

  .player-meta-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;

    .tier {
      font-size: 10px;
      color: var(--color-text-muted);
      letter-spacing: 1px;
    }

    .score {
      font-size: 10px;
      background: var(--color-accent-yellow);
      color: black;
      padding: 0 6px;
      border-radius: 10px;
      font-weight: 900;
      font-family: var(--font-mono);
    }
  }

  .empty-info {
    color: var(--color-text-muted);
    font-size: 10px;
    letter-spacing: 2px;
  }
}
</style>
