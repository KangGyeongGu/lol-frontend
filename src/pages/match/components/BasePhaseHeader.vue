<script setup lang="ts">
interface Props {
    timer: string | number;
    instruction: string;
}

defineProps<Props>();
</script>

<template>
    <div class="phase-header">
        <div class="phase-timer">{{ timer }}</div>
        <p class="phase-instruction">{{ instruction }}</p>
        <slot name="extra" />
    </div>
</template>

<style scoped lang="scss">
.phase-header {
    text-align: center;
    flex-shrink: 0;
    position: relative;

    .phase-timer {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 6);
        color: white;
        font-weight: 900;
        line-height: 1;
    }

    .phase-instruction {
        color: var(--color-text-muted);
        font-size: var(--fontSize-sm);
        margin-top: calc(var(--gu) * 0.5);
        letter-spacing: 1px;
    }
}
</style>
