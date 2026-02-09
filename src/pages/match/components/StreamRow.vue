<script setup lang="ts">
// StreamRow.vue: 상단 타 플레이어 화면 공유 영역
import type { GamePlayerViewModel } from '@/entities/game.model';

defineProps<{
    players?: GamePlayerViewModel[];
}>();
</script>

<template>
    <section class="stream-row">
        <div v-for="n in 6" :key="n" class="webrtc-tile">
            <div class="placeholder">
                <span class="player-name">Player {{ n }}</span>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.stream-row {
    display: flex;
    gap: var(--space-3);
    width: 100%;
    height: 100%;
}

.webrtc-tile {
    flex: 1;
    height: 100%;
    background: rgba(18, 16, 30, 0.4);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
        border-color: var(--color-border-cyan);
        box-shadow: var(--glow-weak);
    }

    .placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(58, 242, 255, 0.05) 0%, transparent 100%);

        .player-name {
            font-family: var(--font-ui);
            font-size: var(--fontSize-xs);
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    }
}
</style>
