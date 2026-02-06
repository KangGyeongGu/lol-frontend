<script setup lang="ts">
import { ref } from 'vue';
import type { CreateRoomRequest } from '@/api/dtos/room.types';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', payload: CreateRoomRequest & { roomType: string, maxPlayers: number, language: string }): void;
}>();

const title = ref('');
const roomType = ref<'RANK' | 'NORMAL'>('RANK');
const maxPlayers = ref(4);
const language = ref('Python');

const participantOptions = [2, 3, 4, 5, 6];
const languageOptions = ['Python', 'Java', 'C++', 'JavaScript', 'Go', 'Rust'];

function submit() {
    if (!title.value) return;
    emit('create', {
        title: title.value,
        gameMode: 'SPEED', // Defaulting for now
        roomType: roomType.value,
        maxPlayers: maxPlayers.value,
        language: language.value
    } as any);
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container">
        <!-- Decoration: Diagonal Stripes Background -->
        <div class="stripes-bg"></div>

        <header class="modal-header">
            <h2 class="title">새 게임 생성</h2>
            <button class="close-icon-btn" @click="emit('close')">×</button>
        </header>
        
        <div class="modal-body">
            <!-- Field 1: Room Name -->
            <div class="form-section">
                <div class="section-header">
                    <label>방 이름</label>
                    <span class="char-count">{{ title.length }} / 30</span>
                </div>
                <div class="input-wrapper">
                    <input v-model="title" type="text" placeholder="배틀룸 이름을 입력하세요..." maxlength="30" />
                </div>
            </div>
            
            <!-- Field 2: Room Type -->
            <div class="mode-toggle-group">
                <button 
                    class="mode-btn rank" 
                    :class="{ active: roomType === 'RANK' }"
                    @click="roomType = 'RANK'"
                >
                    랭크 게임
                </button>
                <button 
                    class="mode-btn normal" 
                    :class="{ active: roomType === 'NORMAL' }"
                    @click="roomType = 'NORMAL'"
                >
                    일반 게임
                </button>
            </div>
            
            <!-- Field 3: Participant Count -->
            <div class="form-section">
                <label>참가 인원</label>
                <div class="pill-group">
                    <button 
                        v-for="count in participantOptions" 
                        :key="count"
                        class="pill-btn"
                        :class="{ active: maxPlayers === count }"
                        @click="maxPlayers = count"
                    >
                        {{ count }}명
                    </button>
                </div>
                <!-- Visual Indicator (Progress Bar Style) -->
                <div class="progress-track">
                    <div class="progress-fill" :style="{ width: `${((maxPlayers - 2) / 4) * 100}%` }"></div>
                </div>
            </div>

            <!-- Field 4: Language Selection -->
            <div class="form-section">
                <label>사용 언어</label>
                <div class="lang-grid">
                    <button 
                        v-for="lang in languageOptions" 
                        :key="lang"
                        class="lang-btn"
                        :class="{ active: language === lang }"
                        @click="language = lang"
                    >
                        {{ lang }}
                    </button>
                </div>
            </div>
        </div>

        <footer class="modal-footer">
            <button class="btn-footer cancel" @click="emit('close')">취소</button>
            <button class="btn-footer create" @click="submit" :disabled="!title">배틀룸 생성</button>
        </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal-container {
    position: relative;
    width: 800px;
    background: #12101E;
    border: 2px solid #3AF2FF;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 40px rgba(58, 242, 255, 0.2);
}

.stripes-bg {
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.02) 0px,
        rgba(255, 255, 255, 0.02) 1px,
        transparent 1px,
        transparent 10px
    );
    pointer-events: none;
}

.modal-header {
    padding: 32px 40px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;

    .title {
        color: #3AF2FF;
        font-family: var(--font-display);
        font-size: 2.2rem;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.5px;
    }

    .close-icon-btn {
        background: rgba(255, 255, 255, 0.05);
        color: var(--color-text-muted);
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        &:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
    }
}

.modal-body {
    padding: 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    position: relative;
    z-index: 1;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 12px;

    label {
        font-size: 0.95rem;
        font-weight: 700;
        color: white;
        letter-spacing: 0.5px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .char-count {
        font-size: 0.75rem;
        color: var(--color-text-muted);
    }
}

.input-wrapper {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 2px;
    transition: all 0.3s;
    
    &:focus-within {
        border-color: #3AF2FF;
        box-shadow: 0 0 15px rgba(58, 242, 255, 0.2);
    }

    input {
        width: 100%;
        background: transparent;
        border: none;
        padding: 14px 18px;
        color: white;
        font-size: 1rem;
        &::placeholder {
            color: rgba(255, 255, 255, 0.2);
        }
        &:focus { outline: none; }
    }
}

.mode-toggle-group {
    display: flex;
    gap: 16px;

    .mode-btn {
        flex: 1;
        background: rgba(20, 18, 30, 0.6);
        border: 2px solid rgba(255, 255, 255, 0.08);
        color: #B8C4E3;
        padding: 16px;
        border-radius: 14px;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s;

        &.rank.active {
            border-color: var(--color-accent-magenta);
            color: var(--color-accent-magenta);
            background: rgba(255, 79, 216, 0.05);
            box-shadow: inset 0 0 15px rgba(255, 79, 216, 0.1);
        }

        &.normal.active {
            border-color: var(--color-accent-yellow);
            color: var(--color-accent-yellow);
            background: rgba(255, 210, 72, 0.05);
            box-shadow: inset 0 0 15px rgba(255, 210, 72, 0.1);
        }

        &:hover:not(.active) {
            border-color: rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
        }
    }
}

.pill-group {
    display: flex;
    justify-content: center;
    gap: 12px;

    .pill-btn {
        background: rgba(58, 242, 255, 0.05);
        border: 1px solid rgba(58, 242, 255, 0.3);
        color: #3AF2FF;
        padding: 6px 16px;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;

        &.active {
            background: #FFD248;
            border-color: #FFD248;
            color: black;
            box-shadow: 0 0 15px rgba(255, 210, 72, 0.4);
        }
    }
}

.progress-track {
    height: 12px;
    background: rgba(58, 242, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    margin-top: 8px;
    overflow: hidden;
    position: relative;

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #FFD248, #2AB6C1);
        transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
}

.lang-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .lang-btn {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: var(--color-text-secondary);
        padding: 14px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &.active {
            border-color: #3AF2FF;
            color: #3AF2FF;
            background: rgba(58, 242, 255, 0.05);
            box-shadow: 0 0 15px rgba(58, 242, 255, 0.1);
        }

        &:hover:not(.active) {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.15);
        }
        
        // Mock nonavailable styles for the others
        &:nth-child(n+4):not(.active) {
            opacity: 0.3;
        }
    }
}

.modal-footer {
    padding: 10px 40px 40px;
    display: flex;
    gap: 16px;
    position: relative;
    z-index: 1;

    .btn-footer {
        flex: 1;
        padding: 16px;
        border-radius: 12px;
        font-family: var(--font-display);
        font-weight: 800;
        font-size: 1rem;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s;
        
        &.cancel {
            background: transparent;
            border: 2px solid #3AF2FF;
            color: #3AF2FF;
            &:hover {
                background: rgba(58, 242, 255, 0.1);
                box-shadow: 0 0 15px rgba(58, 242, 255, 0.2);
            }
        }

        &.create {
            background: rgba(255, 210, 72, 0.1);
            border: 2px solid #FFD248;
            color: #FFD248;
            &:hover:not(:disabled) {
                background: rgba(255, 210, 72, 0.2);
                box-shadow: 0 0 20px rgba(255, 210, 72, 0.3);
            }
            &:disabled {
                opacity: 0.3;
                cursor: not-allowed;
                border-color: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.2);
            }
        }
    }
}
</style>
