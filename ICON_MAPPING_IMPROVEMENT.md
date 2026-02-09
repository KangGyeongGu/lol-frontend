# iconKey 매핑 개선안

## 문제점
1. catalogStore에 iconKey → iconPath 매핑 테이블이 없음
2. 컴포넌트에서 매번 find()로 O(n) 조회
3. 백엔드 iconKey 값 검증 필요

## 개선안 1: catalogStore에 매핑 Map 추가

```typescript
// src/stores/useCatalogStore.ts
export const useCatalogStore = defineStore('catalog', () => {
    // 기존 배열
    const items = ref<ItemViewModel[]>([]);
    const spells = ref<SpellViewModel[]>([]);

    // 추가: iconKey → iconPath 매핑
    const itemIconMap = ref<Map<string, string>>(new Map());
    const spellIconMap = ref<Map<string, string>>(new Map());

    async function fetchItems() {
        const response = await catalogApi.getItems();
        items.value = response.items.map(toItemViewModel);

        // iconKey → iconPath 매핑 생성
        itemIconMap.value = new Map(
            items.value.map(item => [item.itemId, getItemIconPath(item.iconKey)])
        );
    }

    async function fetchSpells() {
        const response = await catalogApi.getSpells();
        spells.value = response.items.map(toSpellViewModel);

        // iconKey → iconPath 매핑 생성
        spellIconMap.value = new Map(
            spells.value.map(spell => [spell.spellId, getSpellIconPath(spell.iconKey)])
        );
    }

    // 헬퍼 함수: O(1) 조회
    function getItemIcon(itemId: string): string {
        return itemIconMap.value.get(itemId) || '/icons/items/default.png';
    }

    function getSpellIcon(spellId: string): string {
        return spellIconMap.value.get(spellId) || '/icons/spells/default.png';
    }

    return {
        // ...기존 exports,
        itemIconMap,
        spellIconMap,
        getItemIcon,
        getSpellIcon,
    };
});
```

## 개선안 2: 컴포넌트 수정

```vue
<!-- ShopPhase.vue -->
<div class="card-icon">
    <img :src="catalogStore.getItemIcon(item.itemId)" :alt="item.name" />
</div>

<!-- InventoryPanel.vue -->
const iconPath = catalogStore.getItemIcon(item.itemId);
```

## 백엔드 검증 필요사항

### DB ITEM 테이블 데이터 예시
| id | name | icon_key | price |
|---|---|---|---|
| uuid-1 | 해킹 | hacking | 220 |
| uuid-2 | 월식 | eclipse | 200 |
| uuid-3 | 탈진 | exhaust | 200 |
| uuid-4 | 지진 | earthquake | 150 |
| uuid-5 | 점화 | ignite | 220 |

### DB SPELL 테이블 데이터 예시
| id | name | icon_key | price |
|---|---|---|---|
| uuid-1 | 보호막 | barrier | 500 |
| uuid-2 | 정화 | cleanse | 550 |
| uuid-3 | 감시자 | watcher | 350 |

### 중요: icon_key 값 규칙
- ✅ 영문 소문자: `"hacking"`, `"eclipse"`, `"barrier"`
- ❌ 한글: `"해킹"`, `"월식"`, `"보호막"`
- ❌ 대문자: `"HACKING"`, `"ECLIPSE"`
- assetMapper.util.ts가 소문자로 정규화하므로 DB에도 소문자 저장 권장

## 성능 비교

### 현재 (find 방식)
- ShopPhase 렌더링: O(n) × 8회 = O(8n)
- InventoryPanel: O(n) × 슬롯 수

### 개선 후 (Map 방식)
- ShopPhase 렌더링: O(1) × 8회 = O(8)
- InventoryPanel: O(1) × 슬롯 수
- 초기 Map 생성: O(n) (1회만)

## 마이그레이션 체크리스트

- [ ] 백엔드 DB ITEM 테이블에 icon_key 컬럼 추가
- [ ] 백엔드 DB SPELL 테이블에 icon_key 컬럼 추가
- [ ] 백엔드 데이터 시딩: icon_key 값을 영문 소문자로 설정
- [ ] catalogStore에 Map 추가 및 헬퍼 함수 구현
- [ ] ShopPhase.vue 리팩토링
- [ ] InventoryPanel.vue 리팩토링
- [ ] 통합 테스트: 아이콘이 정상 표시되는지 확인
