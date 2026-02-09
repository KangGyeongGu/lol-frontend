<script setup lang="ts">
// ResultDrawer.vue: 하단 채점 결과 서랍
import { MESSAGES } from '@/shared/constants/messages';

interface TestCase {
    id: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILURE';
    message: string;
}

defineProps<{
    isOpen: boolean;
    testCases: TestCase[];
}>();

defineEmits<{
    toggle: [];
}>();

// 채점 상태 문구 매핑
const statusTextMap: Record<TestCase['status'], string> = {
    PENDING: MESSAGES.IN_GAME.STATUS_PENDING,
    SUCCESS: MESSAGES.IN_GAME.STATUS_SUCCESS,
    FAILURE: MESSAGES.IN_GAME.STATUS_FAILURE,
};

const getStatusText = (status: TestCase['status']) => statusTextMap[status];
</script>

<template>
    <div class="result-drawer" :class="{ open: isOpen }">
        <header class="drawer-header">
            <h2 class="title">{{ MESSAGES.IN_GAME.JUDGE_RESULT }}</h2>
            <div class="header-actions">
                <button class="toggle-btn" @click="$emit('toggle')">
                    <svg viewBox="0 0 24 24" class="icon-svg">
                        <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                    </svg>
                </button>
            </div>
        </header>

        <div class="drawer-body custom-scrollbar">
            <div v-for="test in testCases" :key="test.id" class="result-row">
                <div class="test-info">
                    <span class="test-id">{{ MESSAGES.IN_GAME.TEST_CASE_PREFIX }} #{{ test.id }}</span>
                </div>
                <div class="status-indicator">
                    <div class="dots">
                        <span v-for="n in 8" :key="n" class="dot" :class="test.status.toLowerCase()"></span>
                    </div>
                    <span class="status-text" :class="test.status.toLowerCase()">
                        {{ getStatusText(test.status) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.result-drawer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(var(--gu) * 2.2); /* Header only when closed */
    background: var(--color-bg-panelStrong);
    border-top: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    z-index: 5;

    &.open {
        height: calc(var(--gu) * 15);
    }

    overflow: hidden;
}

.drawer-header {
    height: calc(var(--gu) * 2.2);
    padding: 0 var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(58, 242, 255, 0.1);
    cursor: pointer;

    .title {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 0.85);
        color: var(--color-accent-cyan);
        margin: 0;
        letter-spacing: 0.1gu;
    }

    .toggle-btn {
        background: rgba(58, 242, 255, 0.05);
        border: 1px solid rgba(58, 242, 255, 0.2);
        border-radius: var(--radius-sm);
        color: var(--color-accent-cyan);
        cursor: pointer;
        padding: calc(var(--gu) * 0.2);
        width: calc(var(--gu) * 1.4);
        height: calc(var(--gu) * 1.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
            background: rgba(58, 242, 255, 0.15);
            border-color: var(--color-accent-cyan);
            box-shadow: 0 0 calc(var(--gu) * 0.5) rgba(58, 242, 255, 0.3);
        }
        
        .icon-svg {
            width: 100%;
            height: 100%;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    }
}

.result-drawer.open .toggle-btn .icon-svg {
    transform: rotate(180deg);
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.result-row {
    background: rgba(18, 16, 30, 0.4);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    height: calc(var(--gu) * 2.5);
    padding: 0 var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .test-id {
        font-family: var(--font-ui);
        font-size: var(--fontSize-xs);
        color: var(--color-text-primary);
    }
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-4);

    .dots {
        display: flex;
        gap: 4px;

        .dot {
            width: calc(var(--gu) * 0.35);
            height: calc(var(--gu) * 0.35);
            border-radius: 50%;
            background: var(--color-text-muted);

            &.pending {
                background: var(--color-accent-yellow);
                box-shadow: 0 0 calc(var(--gu) * 0.35) var(--color-accent-yellow);
                animation: pulse 1s infinite alternate;
            }
            &.success { background: var(--color-accent-green); }
            &.failure { background: var(--color-accent-red); }
        }
    }

    .status-text {
        font-family: var(--font-ui);
        font-size: var(--fontSize-xs);
        min-width: 50px;
        text-align: right;

        &.pending { color: var(--color-accent-yellow); }
        &.success { color: var(--color-accent-green); }
        &.failure { color: var(--color-accent-red); }
    }
}

@keyframes pulse {
    from { opacity: 0.4; }
    to { opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar { width: calc(var(--gu) * 0.3); }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(58, 242, 255, 0.2); border-radius: calc(var(--gu) * 0.15); }
</style>
