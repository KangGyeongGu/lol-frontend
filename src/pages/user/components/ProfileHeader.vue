<script setup lang="ts">
import { MESSAGES } from '@/shared/constants/messages';

interface Props {
  nickname: string;
  language: string;
  coin: number;
  rating: number;
  totalGames: number;
  totalWin: number;
  avgRank: number;
  activeTab: 'info' | 'history';
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'tab-change', tab: 'info' | 'history'): void;
}>();
</script>

<template>
  <header class="profile-header">
    <div class="header-main">
      <div class="avatar-group">
        <div class="avatar-frame">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=gyeong" alt="avatar" />
          <div class="status-dot"></div>
        </div>
        <div class="user-id-group">
          <h1 class="nickname">
            {{ nickname }} <span class="lang-tag">{{ language }}</span>
          </h1>
          <div class="summary-stats">
            <div class="stat">
              <span class="val yellow">{{ coin.toLocaleString() }}</span> {{ MESSAGES.MY_PAGE.STATS_COIN }}
            </div>
            <div class="stat">
              <span class="val cyan">{{ rating.toLocaleString() }}</span> {{ MESSAGES.MY_PAGE.STATS_RATING }}
            </div>
            <div class="stat">
              <span class="val green">{{ totalGames }}</span> {{ MESSAGES.MY_PAGE.STATS_TOTAL_GAMES }}
            </div>
            <div class="stat">
              <span class="val magenta">{{ totalWin }}</span> {{ MESSAGES.MY_PAGE.STATS_TOTAL_WIN }}
            </div>
            <div class="stat">
              <span class="val purple">{{ avgRank.toFixed(2) }}</span> {{ MESSAGES.MY_PAGE.STATS_AVG_RANK }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 탭 네비게이션 -->
    <nav class="main-tabs">
      <button :class="{ active: activeTab === 'info' }" @click="emit('tab-change', 'info')">
        {{ MESSAGES.MY_PAGE.TAB_INFO }}
      </button>
      <button :class="{ active: activeTab === 'history' }" @click="emit('tab-change', 'history')">
        {{ MESSAGES.MY_PAGE.TAB_HISTORY }}
      </button>
    </nav>
  </header>
</template>

<style scoped lang="scss">
.profile-header {
  background: rgba(18, 16, 30, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(20px);
  margin-bottom: calc(var(--gu) * 1.5);
  overflow: hidden;
  flex-shrink: 0;
}

.header-main {
  padding: calc(var(--gu) * 1.25) calc(var(--gu) * 2);
}

.avatar-group {
  display: flex;
  align-items: center;
  gap: calc(var(--gu) * 2);
}

.avatar-frame {
  position: relative;
  width: calc(var(--gu) * 6);
  height: calc(var(--gu) * 6);
  border-radius: 50%;
  border: 2px solid var(--color-accent-cyan);
  padding: 2px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--color-bg-panelStrong);
  }

  .status-dot {
    position: absolute;
    right: 5%;
    bottom: 5%;
    width: calc(var(--gu) * 1.2);
    height: calc(var(--gu) * 1.2);
    background: var(--color-accent-magenta);
    border-radius: 50%;
    border: 2px solid var(--color-bg-panelStrong);
  }
}

.nickname {
  font-family: var(--font-display);
  font-size: calc(var(--gu) * 1.8);
  color: var(--color-accent-cyan);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  .lang-tag {
    font-size: calc(var(--gu) * 0.75);
    padding: 1px 6px;
    background: rgba(58, 242, 255, 0.1);
    border-radius: 3px;
    border: 1px solid rgba(58, 242, 255, 0.3);
  }
}

.summary-stats {
  display: flex;
  gap: calc(var(--gu) * 2);
  margin-top: 6px;
  font-size: calc(var(--gu) * 0.75);
  font-weight: 700;

  .stat {
    color: var(--color-text-secondary);

    .val {
      font-family: var(--font-display);
      font-size: calc(var(--gu) * 1);
      font-style: italic;

      &.yellow {
        color: var(--color-accent-yellow);
      }

      &.cyan {
        color: var(--color-accent-cyan);
      }

      &.green {
        color: var(--color-accent-green-alt);
      }

      &.magenta {
        color: var(--color-accent-magenta);
      }

      &.purple {
        color: var(--color-accent-purple-alt);
      }
    }
  }
}

.main-tabs {
  display: flex;
  height: calc(var(--gu) * 3);
  background: rgba(0, 0, 0, 0.3);

  button {
    flex: 1;
    border: none;
    background: none;
    color: var(--color-text-muted);
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    font-size: calc(var(--gu) * 0.85);

    &.active {
      color: var(--color-accent-cyan);
      background: rgba(58, 242, 255, 0.05);
      border-bottom-color: var(--color-accent-cyan);
    }
  }
}
</style>
