<script setup lang="ts">
import { ref, computed } from 'vue';
import { MESSAGES } from '@/shared/constants/messages';
import BasePhaseHeader from './BasePhaseHeader.vue';
import { useCatalogStore } from '@/stores/useCatalogStore';
import { useGameStore } from '@/stores/useGameStore';

interface Props {
    timer: string | number;
    gameId: string;
}

const props = defineProps<Props>();

const catalogStore = useCatalogStore();
const gameStore = useGameStore();

// 장바구니: id → quantity
const cartItems = ref(new Map<string, number>());
const cartSpells = ref(new Map<string, number>());
const isPurchasing = ref(false);

const balance = computed(() => gameStore.gameState?.coin ?? 0);

const cartItemEntries = computed(() =>
    Array.from(cartItems.value.entries()).map(([itemId, quantity]) => {
        const item = catalogStore.items.find(i => i.itemId === itemId);
        return { itemId, name: item?.name ?? '', quantity };
    }),
);

const cartSpellEntries = computed(() =>
    Array.from(cartSpells.value.entries()).map(([spellId, quantity]) => {
        const spell = catalogStore.spells.find(s => s.spellId === spellId);
        return { spellId, name: spell?.name ?? '', quantity };
    }),
);

const totalCost = computed(() => {
    let cost = 0;
    for (const [itemId, qty] of cartItems.value) {
        const item = catalogStore.items.find(i => i.itemId === itemId);
        if (item) cost += item.price * qty;
    }
    for (const [spellId, qty] of cartSpells.value) {
        const spell = catalogStore.spells.find(s => s.spellId === spellId);
        if (spell) cost += spell.price * qty;
    }
    return cost;
});

const canPurchase = computed(() =>
    totalCost.value > 0 && totalCost.value <= balance.value && !isPurchasing.value,
);

function addItem(itemId: string) {
    const next = new Map(cartItems.value);
    next.set(itemId, (next.get(itemId) ?? 0) + 1);
    cartItems.value = next;
}

function removeItem(itemId: string) {
    const next = new Map(cartItems.value);
    next.delete(itemId);
    cartItems.value = next;
}

function addSpell(spellId: string) {
    const next = new Map(cartSpells.value);
    next.set(spellId, (next.get(spellId) ?? 0) + 1);
    cartSpells.value = next;
}

function removeSpell(spellId: string) {
    const next = new Map(cartSpells.value);
    next.delete(spellId);
    cartSpells.value = next;
}

async function confirmPurchase() {
    if (!canPurchase.value) return;
    isPurchasing.value = true;
    try {
        const promises: Promise<unknown>[] = [];
        for (const [itemId, quantity] of cartItems.value) {
            promises.push(gameStore.purchaseItem(props.gameId, { itemId, quantity }));
        }
        for (const [spellId, quantity] of cartSpells.value) {
            promises.push(gameStore.purchaseSpell(props.gameId, { spellId, quantity }));
        }
        await Promise.all(promises);
        cartItems.value = new Map();
        cartSpells.value = new Map();
    } catch (error) {
        console.error('[ShopPhase] Purchase error:', error);
    } finally {
        isPurchasing.value = false;
    }
}
</script>

<template>
    <div class="shop-phase">
        <BasePhaseHeader :timer="props.timer" :instruction="MESSAGES.MATCH.SHOP_INSTRUCTION">
            <template #extra>
                <div class="balance-display">
                    <span class="gold-icon"></span>
                    <span>{{ balance }}</span>
                </div>
            </template>
        </BasePhaseHeader>

        <div class="content-wrapper">
            <div class="shop-sections">
                <div class="section item-section">
                    <h3 class="section-title">{{ MESSAGES.MATCH.ITEMS_LABEL }}</h3>
                    <div class="item-grid">
                        <div
                            v-for="item in catalogStore.items"
                            :key="item.itemId"
                            class="shop-card"
                            @click="addItem(item.itemId)"
                        >
                            <div class="card-icon placeholder"></div>
                            <div class="card-info">
                                <span class="name">{{ item.name }}</span>
                                <span class="price"><i class="g-icon"></i> {{ item.price }}G</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section spell-section">
                    <h3 class="section-title">{{ MESSAGES.MATCH.SPELLS_LABEL }}</h3>
                    <div class="item-grid">
                        <div
                            v-for="spell in catalogStore.spells"
                            :key="spell.spellId"
                            class="shop-card"
                            @click="addSpell(spell.spellId)"
                        >
                            <div class="card-icon placeholder"></div>
                            <div class="card-info">
                                <span class="name">{{ spell.name }}</span>
                                <span class="price"><i class="g-icon"></i> {{ spell.price }}G</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="cart-area">
                <div class="cart-section">
                    <span class="cart-label">{{ MESSAGES.MATCH.SELECTED_ITEMS }}</span>
                    <div class="cart-slots">
                        <div v-for="entry in cartItemEntries" :key="entry.itemId" class="cart-slot" :class="{ 'has-badge': entry.quantity > 1 }">
                            {{ entry.name }}
                            <span v-if="entry.quantity > 1" class="count-badge">{{ entry.quantity }}</span>
                            <button class="remove-btn" @click="removeItem(entry.itemId)">&times;</button>
                        </div>
                    </div>
                </div>
                <div class="cart-section">
                    <span class="cart-label">{{ MESSAGES.MATCH.SELECTED_SPELLS }}</span>
                    <div class="cart-slots">
                        <div v-for="entry in cartSpellEntries" :key="entry.spellId" class="cart-slot" :class="{ 'has-badge': entry.quantity > 1 }">
                            {{ entry.name }}
                            <span v-if="entry.quantity > 1" class="count-badge">{{ entry.quantity }}</span>
                            <button class="remove-btn" @click="removeSpell(entry.spellId)">&times;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="actions">
            <span class="total-cost">{{ MESSAGES.MATCH.TOTAL_COST }} {{ totalCost }} <i class="g-icon"></i></span>
            <button
                class="purchase-btn"
                :disabled="!canPurchase"
                @click="confirmPurchase"
            >
                {{ MESSAGES.MATCH.PURCHASE }}
            </button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.shop-phase {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: calc(var(--gu) * 1.5);
}

.balance-display {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--color-accent-cyan);
    padding: calc(var(--gu) * 0.6) calc(var(--gu) * 1.5);
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: calc(var(--gu) * 1);
    color: var(--color-accent-cyan);
    font-weight: 800;
    font-size: 11px;

    .gold-icon {
        width: 14px;
        height: 14px;
        background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="%233AF2FF" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>') center/contain no-repeat;
    }
}

.content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: calc(var(--gu) * 2);
    overflow: hidden;
}

.shop-sections {
    display: flex;
    gap: calc(var(--gu) * 2);
    .section {
        flex: 1;
        .section-title {
            color: var(--color-accent-cyan);
            border-bottom: 1px solid rgba(58, 242, 255, 0.15);
            font-family: var(--font-display);
            font-size: 11px;
            margin-bottom: calc(var(--gu) * 1);
            text-align: center;
            padding-bottom: 3px;
            letter-spacing: 2px;
        }
    }
}

.item-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: calc(var(--gu) * 0.8);
}

.shop-card {
    background: rgba(18, 16, 30, 0.4);
    border: 1px solid rgba(58, 242, 255, 0.1);
    border-radius: 2px;
    padding: calc(var(--gu) * 0.8);
    display: flex;
    align-items: center;
    gap: calc(var(--gu) * 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.2s;

    &::before, &::after {
        content: '';
        position: absolute;
        width: 6px;
        height: 6px;
        border: 1px solid transparent;
        transition: all 0.2s;
    }
    &::before {
        top: 0; left: 0;
        border-top-color: rgba(58, 242, 255, 0.3);
        border-left-color: rgba(58, 242, 255, 0.3);
    }
    &::after {
        bottom: 0; right: 0;
        border-bottom-color: rgba(58, 242, 255, 0.3);
        border-right-color: rgba(58, 242, 255, 0.3);
    }

    .card-stripes {
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.01) 0px,
            rgba(255, 255, 255, 0.01) 1px,
            transparent 1px,
            transparent 8px
        );
        pointer-events: none;
    }

    &:hover {
        border-color: rgba(58, 242, 255, 0.4);
        background: rgba(58, 242, 255, 0.05);
        &::before { border-top-color: var(--color-accent-cyan); border-left-color: var(--color-accent-cyan); }
        &::after { border-bottom-color: var(--color-accent-cyan); border-right-color: var(--color-accent-cyan); }
    }

    .card-icon {
      width: calc(var(--gu) * 2.8);
      height: calc(var(--gu) * 2.8);
      border: 1px solid rgba(58, 242, 255, 0.4);
      background: rgba(58, 242, 255, 0.1);
      z-index: 1;
    }

    .card-info {
      display: flex;
      flex-direction: column;
      z-index: 1;
      .name { font-weight: 700; color: white; font-size: 11px; }
      .price { color: var(--color-accent-yellow); font-size: 10px; display: flex; align-items: center; gap: 4px; }
    }
}

.cart-area {
    display: flex;
    gap: calc(var(--gu) * 1.5);
    background: rgba(0, 0, 0, 0.2);
    padding: calc(var(--gu) * 1);
    border-radius: 4px;
}

.cart-section {
    flex: 1;
    .cart-label {
        display: block;
        color: var(--color-accent-magenta);
        font-size: 9px;
        text-align: center;
        margin-bottom: calc(var(--gu) * 0.5);
        text-transform: uppercase;
        letter-spacing: 1px;
    }
}

.cart-slots {
    display: flex;
    gap: calc(var(--gu) * 0.8);
    justify-content: center;
    flex-wrap: wrap;
}

.cart-slot {
    background: rgba(18, 16, 30, 0.8);
    border: 1px solid rgba(255, 79, 216, 0.4);
    border-radius: 2px;
    padding: 3px calc(var(--gu) * 1);
    font-size: 10px;
    color: white;
    position: relative;
    min-width: calc(var(--gu) * 6);
    text-align: center;

    .remove-btn {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 12px;
        height: 12px;
        background: var(--color-accent-red);
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    &.has-badge {
      .count-badge {
        position: absolute;
        top: -5px;
        left: -5px;
        width: 14px;
        height: 14px;
        background: var(--color-accent-cyan);
        color: black;
        border-radius: 50%;
        font-size: 8px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
}

.actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--gu) * 0.5);
    padding-bottom: calc(var(--gu) * 0.5);
}

.total-cost {
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
}

.purchase-btn {
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

.g-icon {
  display: inline-block;
  width: 9px;
  height: 9px;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="%23FFD248" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>') center/contain no-repeat;
}
</style>
