<script setup lang="ts">
import { ref } from 'vue';
import { MESSAGES } from '@/shared/constants/messages';
import BasePhaseHeader from './BasePhaseHeader.vue';
import type { AlgorithmViewModel } from '@/entities/catalog.model';

interface Props {
    mode: 'ban' | 'pick';
    algorithms: AlgorithmViewModel[];
    bannedAlgorithmIds: string[];
    timer: string | number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'select', algorithmId: string): void;
}>();

const selectedId = ref<string | null>(null);

const instruction = props.mode === 'ban'
    ? MESSAGES.MATCH.BAN_INSTRUCTION
    : MESSAGES.MATCH.PICK_INSTRUCTION;

function selectAlgorithm(algorithmId: string) {
    if (props.bannedAlgorithmIds.includes(algorithmId)) return;
    selectedId.value = algorithmId;
}

function confirmSelect() {
    if (selectedId.value !== null) {
        emit('select', selectedId.value);
    }
}
</script>

<template>
    <div class="algorithm-select-phase">
        <BasePhaseHeader :timer="props.timer" :instruction="instruction" />

        <div class="scrollable-area">
            <div class="algorithm-grid">
                <div
                    v-for="algo in props.algorithms"
                    :key="algo.algorithmId"
                    class="algorithm-card"
                    :class="{
                        selected: selectedId === algo.algorithmId,
                        banned: props.bannedAlgorithmIds.includes(algo.algorithmId)
                    }"
                    @click="selectAlgorithm(algo.algorithmId)"
                >
                    <div class="card-stripes"></div>
                    <div class="card-type">ALGORITHM</div>
                    <div class="card-name">{{ algo.name }}</div>
                    <div v-if="props.bannedAlgorithmIds.includes(algo.algorithmId)" class="banned-overlay">BANNED</div>
                </div>
            </div>
        </div>

        <div class="actions">
            <button
                class="select-btn"
                :disabled="!selectedId"
                @click="confirmSelect"
            >
                {{ MESSAGES.MATCH.SELECT }}
            </button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.algorithm-select-phase {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: calc(var(--gu) * 1.5);
    align-items: center;
    position: relative;
}

.scrollable-area {
    flex: 1;
    width: 100%;
    min-height: 0;
    overflow-y: auto;
    padding: calc(var(--gu) * 1);

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
    }
    &::-webkit-scrollbar-thumb {
        background: var(--color-accent-cyan);
        border-radius: 4px;
        opacity: 0.3;
    }
}

.algorithm-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: calc(var(--gu) * 1);
}

.algorithm-card {
    aspect-ratio: 16 / 9;
    background: rgba(18, 16, 30, 0.4);
    border: 1px solid rgba(58, 242, 255, 0.1);
    border-radius: 2px;
    padding: calc(var(--gu) * 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    overflow: hidden;

    &::before, &::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
        border: 1.5px solid transparent;
        transition: all 0.2s;
    }
    &::before {
        top: 0; left: 0;
        border-top-color: rgba(58, 242, 255, 0.4);
        border-left-color: rgba(58, 242, 255, 0.4);
    }
    &::after {
        bottom: 0; right: 0;
        border-bottom-color: rgba(58, 242, 255, 0.4);
        border-right-color: rgba(58, 242, 255, 0.4);
    }

    .card-stripes {
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.02) 0px,
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px,
            transparent 8px
        );
        pointer-events: none;
    }

    &:hover:not(.banned) {
        border-color: rgba(255, 210, 72, 0.3);
        background: rgba(255, 210, 72, 0.05);
        &::before { border-top-color: var(--color-accent-yellow); border-left-color: var(--color-accent-yellow); }
        &::after { border-bottom-color: var(--color-accent-yellow); border-right-color: var(--color-accent-yellow); }
    }

    &.selected {
        border-color: var(--color-accent-yellow);
        box-shadow: 0 0 15px rgba(255, 210, 72, 0.2);
        background: rgba(255, 210, 72, 0.1);
        &::before { border-top-color: var(--color-accent-yellow); border-left-color: var(--color-accent-yellow); }
        &::after { border-bottom-color: var(--color-accent-yellow); border-right-color: var(--color-accent-yellow); }
        .card-name { color: var(--color-accent-yellow); }
    }

    &.banned {
        opacity: 0.3;
        cursor: not-allowed;
        &::before, &::after { display: none; }
    }

    .card-type {
        position: absolute;
        top: 6px;
        font-size: 8px;
        color: var(--color-accent-cyan);
        letter-spacing: 1px;
    }

    .card-name {
        text-align: center;
        font-family: var(--font-display);
        font-size: clamp(0.6rem, 0.75vw, 0.85rem);
        font-weight: 800;
        color: white;
        line-height: 1.1;
        z-index: 1;
    }

    .banned-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: var(--font-display);
        font-size: var(--fontSize-md);
        font-weight: 800;
        letter-spacing: 2px;
        z-index: 2;
    }
}

.actions {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: calc(var(--gu) * 1);
    padding-bottom: calc(var(--gu) * 0.5);
}

.select-btn {
    background: rgba(255, 210, 72, 0.05);
    border: 2px solid var(--color-accent-yellow);
    color: var(--color-accent-yellow);
    padding: calc(var(--gu) * 0.8) calc(var(--gu) * 6);
    font-size: var(--fontSize-md);
    font-weight: 900;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: var(--color-accent-yellow);
        color: black;
        box-shadow: 0 0 10px var(--color-accent-yellow);
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
}
</style>
