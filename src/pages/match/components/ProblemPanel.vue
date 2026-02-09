<script setup lang="ts">
// ProblemPanel.vue: 문제 설명 패널
import { MESSAGES } from '@/shared/constants/messages';

interface Example {
    input: string;
    output: string;
}

interface Problem {
    title: string;
    level: string;
    timeLimit: string;
    description: string;
    examples: Example[];
}

defineProps<{
    problem: Problem;
}>();
</script>

<template>
    <div class="problem-panel">
        <header class="panel-header">
            <div class="title-group">
                <h1 class="title">{{ problem.title }}</h1>
                <span class="level">{{ problem.level }}</span>
            </div>
            <div class="timer">
                <span class="time">{{ problem.timeLimit }}</span>
            </div>
        </header>

        <div class="panel-body custom-scrollbar">
            <section class="description-section">
                <h2 class="section-title">{{ MESSAGES.IN_GAME.PROBLEM_DESCRIPTION }}</h2>
                <p class="description-text">
                    {{ problem.description }}
                </p>
            </section>

            <section class="examples-section">
                <h2 class="section-title">{{ MESSAGES.IN_GAME.PROBLEM_EXAMPLES }}</h2>
                <div v-for="(example, index) in problem.examples" :key="index" class="example-card">
                    <h3 class="example-title">{{ MESSAGES.IN_GAME.EXAMPLE_PREFIX }} {{ index + 1 }}</h3>
                    <div class="example-content">
                        <div class="io-row">
                            <span class="label">{{ MESSAGES.IN_GAME.INPUT_LABEL }}</span>
                            <code class="value">{{ example.input }}</code>
                        </div>
                        <div class="io-row">
                            <span class="label">{{ MESSAGES.IN_GAME.OUTPUT_LABEL }}</span>
                            <code class="value highlight">{{ example.output }}</code>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped lang="scss">
.problem-panel {
    width: 100%;
    height: 100%;
    background: var(--color-bg-panel);
    border: 1px solid var(--color-border-cyan);
    border-radius: var(--radius-xl);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: var(--shadow-panel);
}

.panel-header {
    height: calc(var(--gu) * 4.5);
    padding: 0 var(--space-5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(58, 242, 255, 0.2);
    background: rgba(58, 242, 255, 0.05);

    .title-group {
        display: flex;
        align-items: baseline;
        gap: var(--space-3);

        .title {
            font-family: var(--font-display);
            font-size: var(--fontSize-xl);
            color: var(--color-accent-cyan);
            margin: 0;
            line-height: 1;
        }

        .level {
            font-family: var(--font-ui);
            font-size: var(--fontSize-sm);
            color: var(--color-text-secondary);
        }
    }

    .timer {
        .time {
            font-family: var(--font-mono);
            font-size: var(--fontSize-xl);
            color: var(--color-text-primary);
            font-weight: 700;
        }
    }
}

.panel-body {
    flex: 1;
    padding: var(--space-5);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
}

.section-title {
    font-family: var(--font-display);
    font-size: var(--fontSize-md);
    color: var(--color-accent-cyan);
    margin-bottom: var(--space-3);
    border-left: calc(var(--gu) * 0.25) solid var(--color-accent-cyan);
    padding-left: var(--space-3);
}

.description-text {
    font-family: var(--font-ui);
    font-size: var(--fontSize-sm);
    line-height: var(--lineHeight-loose);
    color: var(--color-text-secondary);
    white-space: pre-line;
}

.example-card {
    background: rgba(18, 16, 30, 0.6);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin-bottom: var(--space-4);

    .example-title {
        font-family: var(--font-ui);
        font-size: var(--fontSize-sm);
        color: var(--color-text-primary);
        margin-bottom: var(--space-3);
    }
}

.example-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    .io-row {
        display: flex;
        gap: var(--space-3);
        align-items: flex-start;

        .label {
            font-family: var(--font-mono);
            font-size: var(--fontSize-xs);
            color: var(--color-text-muted);
            width: 40px;
        }

        .value {
            font-family: var(--font-mono);
            font-size: var(--fontSize-sm);
            color: var(--color-text-secondary);
            flex: 1;

            &.highlight {
                color: var(--color-accent-green);
            }
        }
    }
}

/* Custom Scrollbar */
.custom-scrollbar {
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(58, 242, 255, 0.2);
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: rgba(58, 242, 255, 0.4);
    }
}
</style>
