<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'neutral' | 'danger';
  size?: 'md' | 'lg' | 'sm';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const classes = computed(() => {
  return [
    'base-button',
    `variant-${props.variant}`,
    `size-${props.size}`,
    { disabled: props.disabled }
  ];
});
</script>

<template>
  <button 
    :class="classes" 
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.base-button {
  font-family: var(--font-display);
  font-weight: 800;
  border-radius: calc(var(--gu) * 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: calc(var(--gu) * 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: calc(var(--gu) * 0.125) solid transparent; // 기본 border 영역 확보

  // Sizes
  &.size-md {
    font-size: calc(var(--gu) * 1.1);
    padding: calc(var(--gu) * 0.45) calc(var(--gu) * 2.5);
  }

  &.size-sm {
    font-size: var(--fontSize-sm);
    padding: calc(var(--gu) * 0.375) var(--gu);
    border-radius: var(--radius-sm);
    border-width: calc(var(--gu) * 0.0625);
  }

  // Variants
  &.variant-primary {
    background: var(--color-accent-yellow);
    border-color: var(--color-accent-yellow);
    color: black;
    
    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 0 calc(var(--gu) * 1.25) rgba(255, 210, 72, 0.4);
      filter: brightness(1.1);
    }
  }

  &.variant-secondary { // Magenta Outline (Back/Leave)
    background: transparent;
    border-color: var(--color-accent-magenta);
    color: var(--color-accent-magenta);

    &:not(:disabled):hover {
      background: rgba(255, 79, 216, 0.1);
    }
  }

  &.variant-outline { // Cyan Outline (Ready)
    background: transparent;
    border-color: var(--color-accent-cyan);
    color: var(--color-accent-cyan);

    &:not(:disabled):hover {
      background: rgba(58, 242, 255, 0.1);
    }

    &.active, &:active {
        background: var(--color-accent-cyan);
        color: black;
    }
  }

  &.variant-neutral {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--color-border-subtle);
    color: var(--color-text-secondary);

    &:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.2);
      color: var(--color-text-primary);
    }
  }

  &.variant-danger {
    background: rgba(255, 77, 109, 0.1);
    border-color: rgba(255, 77, 109, 0.3);
    color: var(--color-state-danger);

    &:not(:disabled):hover {
      background: rgba(255, 77, 109, 0.2);
    }
  }

  // Disabled State
  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
}
</style>
