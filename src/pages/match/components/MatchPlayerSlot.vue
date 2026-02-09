<script setup lang="ts">
import { computed } from 'vue';
import { MESSAGES } from '@/shared/constants/messages';
import type { RoomPlayerViewModel } from '@/entities/room.model';
import type { GamePlayerViewModel } from '@/entities/game.model';
import { getTierIconPath } from '@/shared/utils/assetMapper.util';

interface Props {
  player: RoomPlayerViewModel | GamePlayerViewModel | null;
}

const props = defineProps<Props>();

// 플레이어 데이터 정규화 (두 가지 타입 모두 처리)
const normalizedPlayer = computed(() => {
  if (!props.player) return null;

  // RoomPlayerViewModel 타입인 경우
  if ('user' in props.player) {
    return {
      nickname: props.player.user.nickname,
      tier: props.player.user.tier,
      score: props.player.user.score,
    };
  }

  // GamePlayerViewModel 타입인 경우
  return {
    nickname: props.player.nickname,
    tier: props.player.tier || 'IRON', // tier가 없으면 최하위 티어 기본값
    score: props.player.score,
  };
});
</script>

<template>
  <div class="match-player-slot" :class="{ empty: !normalizedPlayer }">
    <template v-if="normalizedPlayer">
      <div class="player-tier-icon">
        <img
          :src="getTierIconPath(normalizedPlayer.tier)"
          :alt="normalizedPlayer.tier"
        />
      </div>
      <div class="player-name-section">
        <span class="nickname">{{ normalizedPlayer.nickname }}</span>
      </div>
      <div class="player-meta-section">
        <div class="tier-section">
          <span class="tier">{{ normalizedPlayer.tier }}</span>
        </div>
        <span class="score">{{ normalizedPlayer.score }}</span>
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

  .player-tier-icon {
    width: calc(var(--gu) * 3);
    height: calc(var(--gu) * 3);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 calc(var(--gu) * 0.5) rgba(255, 210, 72, 0.3));
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
    gap: calc(var(--gu) * 0.25);

    .tier-section {
      display: flex;
      align-items: center;
      gap: calc(var(--gu) * 0.5);

      .tier {
        font-size: calc(var(--gu) * 0.625);
        color: var(--color-text-muted);
        letter-spacing: 1px;
      }
    }

    .score {
      font-size: calc(var(--gu) * 0.625);
      background: var(--color-accent-yellow);
      color: black;
      padding: 0 calc(var(--gu) * 0.375);
      border-radius: calc(var(--gu) * 0.625);
      font-weight: 900;
      font-family: var(--font-mono);
    }
  }

  .empty-info {
    color: var(--color-text-muted);
    font-size: calc(var(--gu) * 0.625);
    letter-spacing: 2px;
  }
}
</style>
