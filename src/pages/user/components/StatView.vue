<script setup lang="ts">
// 추후 확장 가능
// interface Props {
//   radarData?: unknown;
// }
// defineProps<Props>();
</script>

<template>
  <div class="stat-view">
    <div class="radar-placeholder">
      <div class="radar-bg"></div>
      <div class="radar-polygon"></div>
      <span class="label top">Breadth-First Search</span>
      <span class="label top-right">Depth-First Search</span>
      <span class="label bottom-right">Graph</span>
      <span class="label bottom">Dynamic Programming</span>
      <span class="label bottom-left">Array</span>
      <span class="label top-left">Stack</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .radar-placeholder {
    position: relative;
    width: calc(var(--gu) * 25);
    height: calc(var(--gu) * 25);

    .radar-bg {
      width: 100%;
      height: 100%;
      border: 1px solid rgba(58, 242, 255, 0.2);
      clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
      background: repeating-radial-gradient(
        circle,
        transparent,
        transparent 15%,
        rgba(58, 242, 255, 0.05) 16%
      );
    }

    .radar-polygon {
      position: absolute;
      inset: 15%;
      background: rgba(58, 242, 255, 0.2);
      border: 2px solid var(--color-accent-cyan);
      clip-path: polygon(50% 10%, 85% 30%, 80% 80%, 40% 90%, 20% 70%, 15% 40%);
    }

    .label {
      position: absolute;
      font-size: calc(var(--gu) * 0.7);
      font-weight: 800;
      color: var(--color-accent-cyan);
      white-space: nowrap;

      &.top {
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
      }

      &.top-right {
        top: 15%;
        right: -40px;
      }

      &.bottom-right {
        bottom: 15%;
        right: -25px;
      }

      &.bottom {
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
      }

      &.bottom-left {
        bottom: 15%;
        left: -25px;
      }

      &.top-left {
        top: 15%;
        left: -25px;
      }
    }
  }
}
</style>
