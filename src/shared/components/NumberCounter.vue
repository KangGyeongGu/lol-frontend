<script setup lang="ts">
/**
 * NumberCounter.vue
 * 숫자 카운터 애니메이션 컴포넌트 (슬롯 머신/다이얼 스타일)
 * from → to로 부드럽게 증가하는 애니메이션
 */
import { ref, watch, onMounted } from 'vue';

interface Props {
    from: number;           // 시작 값
    to: number;             // 목표 값
    duration?: number;      // 애니메이션 지속 시간 (ms)
    delay?: number;         // 시작 지연 시간 (ms)
    useGrouping?: boolean;  // 천 단위 구분자 사용 여부
}

const props = withDefaults(defineProps<Props>(), {
    duration: 2000,
    delay: 0,
    useGrouping: true,
});

const currentValue = ref(0);
const isAnimating = ref(false);

// 카운터 애니메이션 (easeOutExpo)
function animateValue(start: number, end: number, duration: number) {
    if (start === end) {
        currentValue.value = end;
        isAnimating.value = false;
        return;
    }

    isAnimating.value = true;
    const startTime = performance.now();
    const delta = end - start;

    function step(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: easeOutExpo (빠르게 시작 → 천천히 감속)
        const ease = 1 - Math.pow(2, -10 * progress);
        const current = Math.round(ease * delta + start);

        currentValue.value = current;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            currentValue.value = end;
            isAnimating.value = false;
        }
    }
    requestAnimationFrame(step);
}

// from, to가 변경되면 애니메이션 시작
watch([() => props.from, () => props.to], ([newFrom, newTo]) => {
    if (props.delay > 0) {
        setTimeout(() => {
            animateValue(newFrom, newTo, props.duration);
        }, props.delay);
    } else {
        animateValue(newFrom, newTo, props.duration);
    }
}, { immediate: true });

onMounted(() => {
    currentValue.value = props.from;
});

// 천 단위 구분자 포맷팅
function formatNumber(num: number): string {
    if (props.useGrouping) {
        return num.toLocaleString();
    }
    return num.toString();
}
</script>

<template>
    <span class="number-counter" :class="{ animating: isAnimating }">
        {{ formatNumber(currentValue) }}
    </span>
</template>

<style scoped lang="scss">
.number-counter {
    display: inline-block;
    font-variant-numeric: tabular-nums;  // 고정 폭 숫자
    transition: transform 0.1s ease;

    &.animating {
        // 애니메이션 중 살짝 강조
        animation: pulse 0.2s ease infinite alternate;
    }
}

@keyframes pulse {
    from {
        transform: scale(1);
    }
    to {
        transform: scale(1.02);
    }
}
</style>
