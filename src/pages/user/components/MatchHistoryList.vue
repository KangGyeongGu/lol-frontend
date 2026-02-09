<script setup lang="ts">
import { MESSAGES } from '@/shared/constants/messages';

interface Match {
  id: string;
  type: string;
  status: string;
  players: number;
  title: string;
  date: string;
}

interface Props {
  matches: Match[];
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'view-result', matchId: string): void;
}>();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'WIN':
      return 'var(--color-accent-purple-alt)'; // Purple
    case 'LOSE':
      return 'var(--color-accent-red)'; // Red
    case 'DRAW':
      return 'var(--color-text-muted)'; // Gray
    default:
      return 'var(--color-accent-cyan)';
  }
};

const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return '방금 전';
  if (diffHour < 1) return `${diffMin}분 전`;
  if (diffDay < 1) return `${diffHour}시간 전`;
  if (diffMonth < 1) return `${diffDay}일 전`;
  return `${diffMonth}개월 전`;
};
</script>

<template>
  <div class="history-layout">
    <div class="match-list">
      <div
        v-for="match in matches"
        :key="match.id"
        class="match-row"
        :style="{ borderLeftColor: getStatusColor(match.status) }"
      >
        <div class="status" :style="{ color: getStatusColor(match.status) }">
          {{ match.status }}
        </div>
        <div class="room-info">
          <span class="room-name">{{ match.title }}</span>
          <span class="game-type">{{ match.type === 'rank' ? '랭크' : '일반' }}</span>
        </div>
        <div class="badges">
          <span class="badge players">{{ match.players }}인</span>
        </div>
        <div class="date">{{ getRelativeTime(match.date) }}</div>
        <button class="result-detail-btn" @click="emit('view-result', match.id)">
          {{ MESSAGES.MY_PAGE.MATCH_VIEW_RESULT }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.history-layout {
  flex-direction: column;
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

  .match-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .match-row {
    background: rgba(30, 26, 45, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-left: 5px solid var(--color-accent-cyan);
    border-radius: 5px;
    height: calc(var(--gu) * 6.5);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 16px;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.005);
      background: rgba(40, 35, 60, 0.8);
    }

    .status {
      font-family: var(--font-display);
      font-size: calc(var(--gu) * 1.5);
      font-style: italic;
      font-weight: 900;
      width: 60px;
    }

    .room-info {
      display: flex;
      align-items: center;
      gap: calc(var(--gu) * 0.8);
      flex: 1;

      .room-name {
        color: var(--color-text-primary);
        font-family: var(--font-mono);
        font-weight: 700;
        font-size: calc(var(--gu) * 0.9);
      }

      .game-type {
        color: var(--color-text-muted);
        font-family: var(--font-ui);
        font-weight: 600;
        font-size: calc(var(--gu) * 0.65);
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    }

    .badges {
      display: flex;
      gap: 6px;

      .badge {
        padding: 3px 8px;
        border-radius: 3px;
        font-size: calc(var(--gu) * 0.65);
        font-weight: 800;

        &.diff {
          background: rgba(58, 255, 159, 0.1);
          color: var(--color-accent-green-alt);
          border: 1px solid rgba(58, 255, 159, 0.3);
        }

        &.players {
          background: rgba(58, 242, 255, 0.1);
          color: var(--color-accent-cyan);
          border: 1px solid rgba(58, 242, 255, 0.3);
        }
      }
    }

    .date {
      color: var(--color-text-muted);
      font-size: calc(var(--gu) * 0.75);
      width: 80px;
      text-align: right;
    }

    .result-detail-btn {
      background: rgba(18, 16, 30, 0.8);
      border: 1px solid var(--color-accent-cyan);
      color: var(--color-accent-cyan);
      padding: 5px 12px;
      border-radius: 3px;
      cursor: pointer;
      font-size: calc(var(--gu) * 0.7);
      font-weight: 700;

      &:hover {
        background: var(--color-accent-cyan);
        color: black;
      }
    }
  }
}
</style>
