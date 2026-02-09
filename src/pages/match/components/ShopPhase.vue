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

const MAX_ITEM_TYPES = 3;
const MAX_SPELL_TYPES = 2;

const balance = computed(() => gameStore.gameState?.coin ?? 0);

// 고정된 3칸 슬롯 (아이템)
const itemSlots = computed(() => {
    const slots: Array<{ itemId: string; name: string; quantity: number; iconUrl: string } | null> = [];
    const entries = Array.from(cartItems.value.entries());

    for (let i = 0; i < MAX_ITEM_TYPES; i++) {
        if (i < entries.length) {
            const entry = entries[i];
            if (entry) {
                const [itemId, quantity] = entry;
                const item = catalogStore.items.find(it => it.itemId === itemId);
                slots.push({
                    itemId,
                    name: item?.name ?? '',
                    quantity,
                    iconUrl: catalogStore.getItemIcon(itemId),
                });
            } else {
                slots.push(null);
            }
        } else {
            slots.push(null);
        }
    }
    return slots;
});

// 고정된 2칸 슬롯 (스펠)
const spellSlots = computed(() => {
    const slots: Array<{ spellId: string; name: string; quantity: number; iconUrl: string } | null> = [];
    const entries = Array.from(cartSpells.value.entries());

    for (let i = 0; i < MAX_SPELL_TYPES; i++) {
        if (i < entries.length) {
            const entry = entries[i];
            if (entry) {
                const [spellId, quantity] = entry;
                const spell = catalogStore.spells.find(sp => sp.spellId === spellId);
                slots.push({
                    spellId,
                    name: spell?.name ?? '',
                    quantity,
                    iconUrl: catalogStore.getSpellIcon(spellId),
                });
            } else {
                slots.push(null);
            }
        } else {
            slots.push(null);
        }
    }
    return slots;
});

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

    // 이미 있는 아이템이면 수량 증가
    if (next.has(itemId)) {
        next.set(itemId, (next.get(itemId) ?? 0) + 1);
    } else {
        // 새로운 아이템인 경우 최대 종류 제한 확인
        if (next.size >= MAX_ITEM_TYPES) {
            console.warn(`[ShopPhase] 최대 ${MAX_ITEM_TYPES}종류의 아이템만 선택할 수 있습니다.`);
            return;
        }
        next.set(itemId, 1);
    }

    cartItems.value = next;
}

function decreaseItem(itemId: string) {
    const next = new Map(cartItems.value);
    const current = next.get(itemId) ?? 0;

    if (current > 1) {
        next.set(itemId, current - 1);
    } else {
        next.delete(itemId);
    }

    cartItems.value = next;
}

function addSpell(spellId: string) {
    const next = new Map(cartSpells.value);

    // 이미 있는 스펠이면 수량 증가
    if (next.has(spellId)) {
        next.set(spellId, (next.get(spellId) ?? 0) + 1);
    } else {
        // 새로운 스펠인 경우 최대 종류 제한 확인
        if (next.size >= MAX_SPELL_TYPES) {
            console.warn(`[ShopPhase] 최대 ${MAX_SPELL_TYPES}종류의 스펠만 선택할 수 있습니다.`);
            return;
        }
        next.set(spellId, 1);
    }

    cartSpells.value = next;
}

function decreaseSpell(spellId: string) {
    const next = new Map(cartSpells.value);
    const current = next.get(spellId) ?? 0;

    if (current > 1) {
        next.set(spellId, current - 1);
    } else {
        next.delete(spellId);
    }

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

        // 구매 성공 시 장바구니 유지 (실제 인벤토리는 서버에서 업데이트)
        // 필요시 장바구니를 비우려면 아래 주석 해제
        // cartItems.value = new Map();
        // cartSpells.value = new Map();
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
                            <div class="card-icon">
                                <img :src="catalogStore.getItemIcon(item.itemId)" :alt="item.name" />
                            </div>
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
                            <div class="card-icon">
                                <img :src="catalogStore.getSpellIcon(spell.spellId)" :alt="spell.name" />
                            </div>
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
                        <div
                            v-for="(slot, index) in itemSlots"
                            :key="index"
                            class="cart-slot"
                            :class="{ 'empty-slot': !slot, 'filled-slot': slot }"
                        >
                            <template v-if="slot">
                                <div class="slot-icon">
                                    <img :src="slot.iconUrl" :alt="slot.name" />
                                </div>
                                <span class="slot-name">{{ slot.name }}</span>
                                <span v-if="slot.quantity > 1" class="quantity-badge">{{ slot.quantity }}</span>
                                <button class="decrease-btn" @click="decreaseItem(slot.itemId)">−</button>
                            </template>
                            <span v-else class="empty-label">Empty</span>
                        </div>
                    </div>
                </div>
                <div class="cart-section">
                    <span class="cart-label">{{ MESSAGES.MATCH.SELECTED_SPELLS }}</span>
                    <div class="cart-slots">
                        <div
                            v-for="(slot, index) in spellSlots"
                            :key="index"
                            class="cart-slot"
                            :class="{ 'empty-slot': !slot, 'filled-slot': slot }"
                        >
                            <template v-if="slot">
                                <div class="slot-icon">
                                    <img :src="slot.iconUrl" :alt="slot.name" />
                                </div>
                                <span class="slot-name">{{ slot.name }}</span>
                                <span v-if="slot.quantity > 1" class="quantity-badge">{{ slot.quantity }}</span>
                                <button class="decrease-btn" @click="decreaseSpell(slot.spellId)">−</button>
                            </template>
                            <span v-else class="empty-label">Empty</span>
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
      border-radius: 2px;
      z-index: 1;
      position: relative;
      overflow: hidden;

      // Fallback gradient for loading state
      background: rgba(58, 242, 255, 0.05);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      // 이미지 위에 subtle overlay 효과
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(58, 242, 255, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }
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
    padding: calc(var(--gu) * 1.2);
    border-radius: 4px;
    min-height: calc(var(--gu) * 10);
}

.cart-section {
    flex: 1;
    display: flex;
    flex-direction: column;

    .cart-label {
        display: block;
        color: var(--color-accent-magenta);
        font-size: calc(var(--gu) * 0.56);
        text-align: center;
        margin-bottom: calc(var(--gu) * 0.8);
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 800;
    }
}

.cart-slots {
    display: flex;
    gap: calc(var(--gu) * 0.8);
    justify-content: center;
    align-items: center;
}

.cart-slot {
    position: relative;
    border-radius: 4px;
    transition: all 0.2s;

    // 빈 슬롯
    &.empty-slot {
        width: calc(var(--gu) * 6);
        height: calc(var(--gu) * 6);
        background: rgba(18, 16, 30, 0.3);
        border: 1px dashed rgba(255, 79, 216, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;

        .empty-label {
            font-size: calc(var(--gu) * 0.5);
            color: rgba(255, 79, 216, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    }

    // 채워진 슬롯
    &.filled-slot {
        width: calc(var(--gu) * 6);
        height: calc(var(--gu) * 6);
        background: rgba(18, 16, 30, 0.9);
        border: 1px solid rgba(255, 79, 216, 0.6);
        box-shadow: 0 0 calc(var(--gu) * 0.8) rgba(255, 79, 216, 0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: calc(var(--gu) * 0.3);
        padding: calc(var(--gu) * 0.4);

        .slot-icon {
            width: calc(var(--gu) * 2.5);
            height: calc(var(--gu) * 2.5);
            flex-shrink: 0;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
            }
        }

        .slot-name {
            font-size: calc(var(--gu) * 0.5);
            color: white;
            font-weight: 700;
            text-align: center;
            line-height: 1;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .quantity-badge {
            position: absolute;
            top: calc(var(--gu) * 0.3);
            left: calc(var(--gu) * 0.3);
            width: calc(var(--gu) * 1.2);
            height: calc(var(--gu) * 1.2);
            background: var(--color-accent-cyan);
            color: black;
            border-radius: 50%;
            font-size: calc(var(--gu) * 0.56);
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .decrease-btn {
            position: absolute;
            bottom: calc(var(--gu) * 0.3);
            right: calc(var(--gu) * 0.3);
            width: calc(var(--gu) * 1.4);
            height: calc(var(--gu) * 1.4);
            background: var(--color-accent-red);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: calc(var(--gu) * 0.8);
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                background: #ff2d5f;
                transform: scale(1.1);
            }
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
