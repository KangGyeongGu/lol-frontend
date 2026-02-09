<script setup lang="ts">
// InventoryPanel.vue: 아이템 및 스펠 영역 (고정 슬롯 시스템)
import { computed } from 'vue';
import { MESSAGES } from '@/shared/constants/messages';
import { useGameStore } from '@/stores/useGameStore';
import { useCatalogStore } from '@/stores/useCatalogStore';

interface DisplayItem {
    id: string;
    name: string;
    count: number;
    iconPath: string;
    color: string;
    glow: string;
}

const gameStore = useGameStore();
const catalogStore = useCatalogStore();

// 아이템 슬롯 수: 3, 스펠 슬롯 수: 2
const ITEM_SLOT_COUNT = 3;
const SPELL_SLOT_COUNT = 2;

// 실제 인벤토리 데이터 조회
const inventoryItems = computed<(DisplayItem | null)[]>(() => {
    const inventory = gameStore.gameState?.inventory;
    const items = inventory?.items || [];

    return Array.from({ length: ITEM_SLOT_COUNT }, (_, i) => {
        const item = items[i];
        if (!item) return null;

        const meta = catalogStore.items.find((m) => m.itemId === item.itemId);
        const itemName = meta?.name || 'Unknown Item';
        const iconPath = catalogStore.getItemIcon(item.itemId);
        return {
            id: item.itemId,
            name: itemName,
            count: item.quantity,
            iconPath,
            color: 'linear-gradient(135deg, #3AF2FF, #120A2A)',
            glow: '0 0 15px rgba(58, 242, 255, 0.5)',
        };
    });
});

const inventorySpells = computed<(DisplayItem | null)[]>(() => {
    const inventory = gameStore.gameState?.inventory;
    const spells = inventory?.spells || [];

    return Array.from({ length: SPELL_SLOT_COUNT }, (_, i) => {
        const spell = spells[i];
        if (!spell) return null;

        const meta = catalogStore.spells.find((s) => s.spellId === spell.spellId);
        const spellName = meta?.name || 'Unknown Spell';
        const iconPath = catalogStore.getSpellIcon(spell.spellId);
        return {
            id: spell.spellId,
            name: spellName,
            count: spell.quantity,
            iconPath,
            color: 'radial-gradient(circle, #FFD248, #FF4D6D)',
            glow: '0 0 20px rgba(255, 210, 72, 0.6)',
        };
    });
});

function handleItemClick(itemId: string) {
    console.log('TODO: ITEM_USE command', { itemId });
}

function handleSpellClick(spellId: string) {
    console.log('TODO: SPELL_USE command', { spellId });
}
</script>

<template>
    <div class="inventory-panel">
        <section class="section items-section">
            <h2 class="section-title">{{ MESSAGES.IN_GAME.ITEMS }}</h2>
            <div class="slots-grid">
                <div
                    v-for="(item, index) in inventoryItems"
                    :key="index"
                    class="slot-item"
                    :class="{ empty: !item }"
                    :title="item?.name"
                    @click="item && handleItemClick(item.id)"
                >
                    <template v-if="item">
                        <div class="slot-badge">{{ item.count }}</div>
                        <div class="slot-icon" :style="{ boxShadow: item.glow }">
                            <img :src="item.iconPath" :alt="item.name" />
                        </div>
                    </template>
                </div>
            </div>
        </section>

        <section class="section spells-section">
            <h2 class="section-title">{{ MESSAGES.IN_GAME.SPELLS }}</h2>
            <div class="slots-grid">
                <div
                    v-for="(spell, index) in inventorySpells"
                    :key="index"
                    class="slot-item large"
                    :class="{ empty: !spell }"
                    :title="spell?.name"
                    @click="spell && handleSpellClick(spell.id)"
                >
                    <template v-if="spell">
                        <div class="slot-badge">{{ spell.count }}</div>
                        <div class="slot-icon" :style="{ boxShadow: spell.glow }">
                            <img :src="spell.iconPath" :alt="spell.name" />
                        </div>
                    </template>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped lang="scss">
.inventory-panel {
    width: 100%;
    height: 100%;
    background: var(--color-bg-panel);
    border: 1px solid var(--color-border-cyan);
    border-radius: var(--radius-xl);
    padding: var(--space-5) var(--space-2);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    box-shadow: var(--shadow-panel);
}

.section-title {
    font-family: var(--font-display);
    font-size: calc(var(--gu) * 0.9);
    color: var(--color-accent-cyan);
    text-align: center;
    margin-bottom: var(--space-4);
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.8;
}

.slots-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
}

.slot-item {
    position: relative;
    width: calc(var(--gu) * 4);
    height: calc(var(--gu) * 4);
    
    &.large {
        width: calc(var(--gu) * 5);
        height: calc(var(--gu) * 5);
    }

    &.empty {
        border: 1px dashed rgba(58, 242, 255, 0.3);
        border-radius: var(--radius-md);
        background: rgba(18, 16, 30, 0.3);
        cursor: default;
    }

    .slot-badge {
        position: absolute;
        top: calc(var(--gu) * -0.4);
        left: calc(var(--gu) * -0.4);
        width: calc(var(--gu) * 1.25);
        height: calc(var(--gu) * 1.25);
        background: var(--color-accent-green);
        border: calc(var(--gu) * 0.125) solid var(--color-bg-page);
        border-radius: 50%;
        color: var(--color-text-inverse);
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 0.6);
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        box-shadow: 0 0 calc(var(--gu) * 0.6) rgba(92, 255, 176, 0.5);
    }

    .slot-icon {
        width: 100%;
        height: 100%;
        border-radius: var(--radius-md);
        border: 1px solid rgba(255, 255, 255, 0.2);
        cursor: pointer;
        transition: all 0.2s;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        &:hover {
            transform: scale(1.05);
            border-color: white;
            box-shadow: var(--glow-weak);
        }
    }
}
</style>
