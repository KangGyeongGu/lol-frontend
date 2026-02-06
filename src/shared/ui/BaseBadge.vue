<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'rank' | 'normal' | 'cyan' | 'host' | 'default';
  label?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const classes = computed(() => {
  return [
    'base-badge',
    `variant-${props.variant}`
  ];
});
</script>

<template>
  <span :class="classes">
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped lang="scss">
.base-badge {
  padding: 0.6vh 1.2vw;
  border-radius: 0.8vw;
  font-weight: 800;
  font-size: clamp(0.7rem, 1vw, 0.9rem);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: var(--lineHeight-normal);
  white-space: nowrap;

  // Variants
  &.variant-rank {
    background: linear-gradient(90deg, #FF4FD8 0%, #A855F7 100%);
    border: 1px solid rgba(255, 79, 216, 0.5);
    color: white;
  }

  &.variant-normal {
    background: linear-gradient(90deg, #3AF2FF 0%, #2AB6C1 100%);
    border: 1px solid rgba(58, 242, 255, 0.5);
    color: black;
  }

  &.variant-cyan {
    background: rgba(58, 242, 255, 0.1);
    border: 1px solid var(--color-accent-cyan);
    color: var(--color-accent-cyan);
    padding: 2px 8px;
    border-radius: 0.4vw;
  }

  &.variant-host {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--color-accent-yellow);
    color: var(--color-accent-yellow);
  }

  &.variant-default {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--color-border-subtle);
    color: var(--color-text-secondary);
  }
}
</style>
