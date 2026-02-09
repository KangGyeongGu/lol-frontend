<script setup lang="ts">
// TypingStatusBar.vue: 플레이어 타이핑 상태 표시
defineProps<{
    typingPlayers?: string[];
}>();
</script>

<template>
    <div class="typing-status-bar">
        <div class="status-content">
            <div class="typing-indicators">
                <span v-if="!typingPlayers?.length" class="idle-text">모든 플레이어가 대기 중...</span>
                <template v-else>
                    <div v-for="player in typingPlayers" :key="player" class="typing-badge">
                        <span class="dot"></span>
                        <span class="name">{{ player }} 타이핑 중...</span>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.typing-status-bar {
    width: 100%;
    height: 100%;
    background: var(--color-bg-panelStrong);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: 0 var(--space-4);
    display: flex;
    align-items: center;
}

.status-content {
    display: flex;
    align-items: center;
    width: 100%;
}

.typing-indicators {
    display: flex;
    gap: var(--space-4);
    align-items: center;
}

.idle-text {
    font-family: var(--font-ui);
    font-size: var(--fontSize-xs);
    color: var(--color-text-muted);
}

.typing-badge {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--fontSize-xs);
    color: var(--color-accent-cyan);

    .dot {
        width: 6px;
        height: 6px;
        background: var(--color-accent-cyan);
        border-radius: 50%;
        box-shadow: var(--glow-cyan);
        animation: blink 1s infinite;
    }
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}
</style>
