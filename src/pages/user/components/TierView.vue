<script setup lang="ts">
import { computed } from 'vue';
import { MESSAGES } from '@/shared/constants/messages';
import { getTierIconPath } from '@/shared/utils/assetMapper.util';

interface Activity {
  date: string;
  count: number;
}

interface Props {
  tier: string;
  nextTierProgress: number;
  winRate: number;
  solvedRate: number;
  activities?: Activity[];  // Optional: API 미구현
}

const props = withDefaults(defineProps<Props>(), {
  activities: () => []
});

const tierIconPath = computed(() => getTierIconPath(props.tier));
</script>

<template>
  <div class="tier-view">
    <div class="tier-stats-row">
      <div class="tier-badge-large">
        <img :src="tierIconPath" :alt="tier" class="tier-icon-large" />
        <div class="tier-name">{{ tier }}</div>
      </div>

      <div class="tier-progress-group">
        <div class="circle-box">
          <div class="circle-svg cyan">
            <span class="pct">{{ nextTierProgress.toFixed(1) }}%</span>
          </div>
          <p class="lbl">{{ MESSAGES.MY_PAGE.NEXT_TIER }}</p>
        </div>
        <div class="circle-box">
          <div class="circle-svg pink">
            <span class="pct">{{ winRate.toFixed(1) }}%</span>
          </div>
          <p class="lbl">{{ MESSAGES.MY_PAGE.WIN_RATE }}</p>
        </div>
        <div class="circle-box">
          <div class="circle-svg green">
            <span class="pct">{{ solvedRate.toFixed(1) }}%</span>
          </div>
          <p class="lbl">{{ MESSAGES.MY_PAGE.SOLVED_RATE }}</p>
        </div>
      </div>
    </div>

    <!-- 잔디밭 (커뮤니티 활동 로그) -->
    <div class="grass-graph">
      <div class="months">
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
      </div>
      <div class="grid">
        <div
          v-for="(cell, index) in activities"
          :key="index"
          class="cell"
          :class="'level-' + cell.count"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tier-view {
  display: flex;
  flex-direction: column;
  height: 100%;

  .tier-stats-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--gu) * 4);
    margin-bottom: calc(var(--gu) * 1);
  }

  .tier-badge-large {
    text-align: center;

    .tier-icon-large {
      width: calc(var(--gu) * 8);
      height: calc(var(--gu) * 8);
      object-fit: contain;
      filter: drop-shadow(0 0 20px rgba(255, 210, 72, 0.3));
    }

    .tier-name {
      margin-top: 10px;
      font-family: var(--font-display);
      font-size: calc(var(--gu) * 1);
      color: var(--color-accent-cyan);
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
  }
}

.tier-progress-group {
  display: flex;
  gap: calc(var(--gu) * 3);

  .circle-box {
    text-align: center;

    .circle-svg {
      width: calc(var(--gu) * 5.5);
      height: calc(var(--gu) * 5.5);
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;

      .pct {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 0.9);
      }

      &.cyan {
        border-top-color: var(--color-accent-cyan);

        .pct {
          color: var(--color-accent-cyan);
        }
      }

      &.pink {
        border-top-color: var(--color-accent-magenta);

        .pct {
          color: var(--color-accent-magenta);
        }
      }

      &.green {
        border-color: var(--color-accent-green-alt);

        .pct {
          color: var(--color-accent-green-alt);
        }
      }
    }

    .lbl {
      font-size: calc(var(--gu) * 0.6);
      color: var(--color-text-muted);
      font-weight: 800;
    }
  }
}

.grass-graph {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  .months {
    display: flex;
    justify-content: space-between;
    font-size: 0.6rem;
    color: var(--color-text-muted);
    margin-bottom: 4px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(52, 1fr);
    grid-template-rows: repeat(7, 12px);
    gap: 3px;

    .cell {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 1px;

      &.level-1 {
        background: rgba(58, 242, 255, 0.2);
      }

      &.level-2 {
        background: rgba(58, 242, 255, 0.4);
      }

      &.level-3 {
        background: rgba(58, 242, 255, 0.6);
      }

      &.level-4 {
        background: var(--color-accent-cyan);
      }
    }
  }
}
</style>
