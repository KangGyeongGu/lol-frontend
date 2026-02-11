<script setup lang="ts">
// EditorPanel.vue: 코드 에디터 패널 (Monaco Editor 통합)
import { ref, shallowRef, onMounted, onUnmounted, nextTick } from 'vue';
import * as monaco from 'monaco-editor';
import { MESSAGES } from '@/shared/constants/messages';
import ResultDrawer from './ResultDrawer.vue';

interface TestCase {
    id: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILURE';
    message: string;
}

const props = defineProps<{
    language: string;
    isGrading?: boolean;
}>();

const emit = defineEmits<{
    (e: 'submit', code: string, language: string): void;
    (e: 'earlyTerminate'): void;
}>();

const isResultOpen = ref(true);
const testCases = ref<TestCase[]>([
    { id: 1, status: 'PENDING', message: '' },
    { id: 2, status: 'PENDING', message: '' },
    { id: 3, status: 'PENDING', message: '' },
    { id: 4, status: 'PENDING', message: '' },
    { id: 5, status: 'PENDING', message: '' },
]);

// Monaco Editor 관련
const editorContainer = ref<HTMLElement | null>(null);
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);
const code = ref('');

// 언어 매핑 (UI 라벨 → Monaco 언어 ID)
const languageMap: Record<string, string> = {
    JAVA: 'java',
    PYTHON: 'python',
    JAVASCRIPT: 'javascript',
    CPP: 'cpp',
};

// 언어 표시명 매핑
const languageDisplayMap: Record<string, string> = {
    JAVA: 'JAVA',
    PYTHON: 'PYTHON',
    JAVASCRIPT: 'JS',
    CPP: 'C++',
};

// 언어별 기본 템플릿
const codeTemplates: Record<string, string> = {
    JAVA: `public class Main {
    public static void main(String[] args) {
        // 여기에 코드를 작성하세요
    }
}`,
    PYTHON: `# 여기에 코드를 작성하세요
def solution():
    pass

if __name__ == "__main__":
    solution()`,
    JAVASCRIPT: `// 여기에 코드를 작성하세요
function solution() {

}

solution();`,
    CPP: `#include <iostream>
using namespace std;

int main() {
    // 여기에 코드를 작성하세요
    return 0;
}`,
};

// 테마 및 폰트 크기 상태
const isDarkMode = ref(true);
const fontSize = ref(14);
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;

// 제출 핸들러
function handleSubmit() {
    if (editor.value) {
        const currentCode = editor.value.getValue();
        emit('submit', currentCode, props.language);
    }
}

// 조기 종료 핸들러
function handleEarlyTerminate() {
    emit('earlyTerminate');
}

// 다크모드 토글
function toggleTheme() {
    isDarkMode.value = !isDarkMode.value;
    if (editor.value) {
        monaco.editor.setTheme(isDarkMode.value ? 'vs-dark' : 'vs');
    }
}

// 폰트 크기 증가
function increaseFontSize() {
    if (fontSize.value < MAX_FONT_SIZE && editor.value) {
        fontSize.value += 2;
        editor.value.updateOptions({ fontSize: fontSize.value });
    }
}

// 폰트 크기 감소
function decreaseFontSize() {
    if (fontSize.value > MIN_FONT_SIZE && editor.value) {
        fontSize.value -= 2;
        editor.value.updateOptions({ fontSize: fontSize.value });
    }
}

// Monaco Editor 초기화
onMounted(async () => {
    await nextTick();
    if (editorContainer.value) {
        const monacoLang = languageMap[props.language];
        const template = codeTemplates[props.language];

        if (!monacoLang) {
            console.error(`[EditorPanel] Unsupported language: ${props.language}`);
            return;
        }

        editor.value = monaco.editor.create(editorContainer.value, {
            value: template || '',
            language: monacoLang,
            theme: isDarkMode.value ? 'vs-dark' : 'vs',
            fontSize: fontSize.value,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
            },
        });

        // 코드 변경 시 sync
        editor.value.onDidChangeModelContent(() => {
            code.value = editor.value?.getValue() || '';
        });

        // 초기 레이아웃 강제 실행
        setTimeout(() => {
            editor.value?.layout();
        }, 100);
    }
});

// 정리
onUnmounted(() => {
    if (editor.value) {
        editor.value.dispose();
    }
});
</script>

<template>
    <div class="editor-panel">
        <header class="editor-toolbar">
            <div class="left-tools">
                <div class="lang-selector">
                    <button
                        class="tool-btn lang-btn active"
                        disabled
                    >
                        {{ languageDisplayMap[language] || language }}
                    </button>
                </div>
                <div class="divider"></div>
                <div class="font-tools">
                    <button
                        class="tool-btn icon-btn"
                        @click="toggleTheme"
                        :title="isDarkMode ? MESSAGES.IN_GAME.LIGHT_MODE : MESSAGES.IN_GAME.DARK_MODE"
                    >
                        <span class="icon">◐</span>
                    </button>
                    <button
                        class="tool-btn icon-btn"
                        @click="decreaseFontSize"
                        :disabled="fontSize <= MIN_FONT_SIZE"
                        :title="MESSAGES.IN_GAME.FONT_DECREASE"
                    >
                        <span class="icon">-</span>
                    </button>
                    <button
                        class="tool-btn icon-btn"
                        @click="increaseFontSize"
                        :disabled="fontSize >= MAX_FONT_SIZE"
                        :title="MESSAGES.IN_GAME.FONT_INCREASE"
                    >
                        <span class="icon">+</span>
                    </button>
                </div>
            </div>

            <div class="right-tools">
                <button
                    class="action-btn secondary"
                    @click="handleEarlyTerminate"
                >
                    {{ MESSAGES.IN_GAME.EARLY_TERMINATE }}
                </button>
                <button
                    class="action-btn primary"
                    :class="{ grading: isGrading }"
                    :disabled="isGrading"
                    @click="handleSubmit"
                >
                    {{ isGrading ? MESSAGES.IN_GAME.JUDGING : MESSAGES.IN_GAME.SUBMIT_CODE }}
                </button>
            </div>
        </header>

        <div class="editor-body">
            <div ref="editorContainer" class="monaco-container"></div>
        </div>

        <ResultDrawer 
            :is-open="isResultOpen" 
            :test-cases="testCases"
            @toggle="isResultOpen = !isResultOpen"
        />
    </div>
</template>

<style scoped lang="scss">
.editor-panel {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    background: var(--color-bg-panelStrong);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    .editor-toolbar {
        height: calc(var(--gu) * 2.5);
        padding: 0 var(--space-2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(18, 16, 30, 0.98);
        border-bottom: 1px solid var(--color-border-subtle);
        z-index: 6;

        .left-tools {
            display: flex;
            align-items: center;
            gap: var(--space-2);
        }

        .right-tools {
            display: flex;
            align-items: center;
            gap: var(--space-2);
        }
    }

    .font-tools {
        display: flex;
        align-items: center;
        gap: var(--space-1);
    }

    .lang-selector {
        display: flex;
        gap: var(--space-1);
    }

    .tool-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--color-border-subtle);
        color: var(--color-text-secondary);
        font-family: var(--font-ui);
        padding: calc(var(--gu) * 0.1) calc(var(--gu) * 0.5);
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: calc(var(--gu) * 0.65);
        transition: all 0.2s;

        &:hover:not(:disabled) {
            border-color: var(--color-accent-cyan);
            color: var(--color-accent-cyan);
        }

        &.active {
            background: rgba(58, 242, 255, 0.1);
            border-color: var(--color-accent-cyan);
            color: var(--color-accent-cyan);
            box-shadow: var(--glow-weak);
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 1;

            &.active {
                background: rgba(58, 242, 255, 0.1);
                border-color: var(--color-accent-cyan);
                color: var(--color-accent-cyan);
                box-shadow: var(--glow-weak);
            }
        }

        &.icon-btn {
            width: calc(var(--gu) * 1.2);
            height: calc(var(--gu) * 1.2);
            min-width: calc(var(--gu) * 1.2);
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-sm);

            &:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }

            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: calc(var(--gu) * 0.7);
                pointer-events: none;
            }
        }
    }

    .divider {
        width: 1px;
        height: var(--space-3);
        background: var(--color-border-subtle);
    }

    .action-btn {
        height: calc(var(--gu) * 1.4);
        padding: 0 calc(var(--gu) * 0.7);
        min-width: fit-content;
        border-radius: var(--radius-sm);
        font-family: var(--font-ui);
        font-size: calc(var(--gu) * 0.6);
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.primary {
            background: var(--color-accent-yellow);
            border: 1px solid var(--color-border-yellow);
            color: var(--color-text-inverse);

            &:hover:not(:disabled) {
                box-shadow: var(--glow-yellow);
                transform: translateY(-1px);
            }

            &.grading {
                opacity: 0.7;
                cursor: not-allowed;
                filter: grayscale(0.5);
            }
        }

        &.secondary {
            background: transparent;
            border: 1px solid var(--color-accent-red);
            color: var(--color-accent-red);

            &:hover:not(:disabled) {
                background: rgba(255, 77, 109, 0.1);
                box-shadow: var(--glow-red);
                transform: translateY(-1px);
            }
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}

.editor-body {
    flex: 1;
    display: flex;
    background: #0d0b17;
    overflow: hidden;
    position: relative;
    min-height: 0;
    padding-bottom: calc(var(--gu) * 2.2); /* Result drawer header space synced with toolbar */
}

.monaco-container {
    flex: 1;
    width: 100%;
    height: 100%;
}
</style>
