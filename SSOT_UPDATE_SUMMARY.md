# SSOT 업데이트 완료 요약

**작업 일시:** 2026-02-09
**작업자:** Claude Code
**빌드 상태:** ✅ 성공

---

## 📋 변경사항 요약

### 1. DTO/ViewModel 업데이트 (SSOT 반영)

#### 1.1 카탈로그 (ItemSummary, SpellSummary)
**파일:** `src/api/dtos/catalog.dto.ts`, `src/entities/catalog.model.ts`

```typescript
// 변경 전
interface ItemSummary {
  itemId: string;
  name: string;
  description: string | null;
  durationSec: number;
  price: number;
}

// 변경 후
interface ItemSummary {
  itemId: string;
  name: string;
  iconKey: string;  // ✅ 추가
  description: string | null;
  durationSec: number;
  price: number;
}
```

- ✅ `iconKey: string` 필드 추가 (ItemSummary, SpellSummary)

#### 1.2 매치 요약 (MatchSummary)
**파일:** `src/api/dtos/stats.dto.ts`, `src/entities/stats.model.ts`

```typescript
// 변경 전
interface MatchSummary {
  matchId: string;
  gameType: 'RANKED' | 'NORMAL';
  result: 'WIN' | 'LOSE' | 'DRAW';
  difficulty: string;
  playerCount: number;
  problemTitle: string;
  playedAt: string;
  rank: number;
}

// 변경 후
interface MatchSummary {
  matchId: string;
  roomName: string;         // ✅ 추가
  gameType: 'RANKED' | 'NORMAL';
  result: 'WIN' | 'LOSE' | 'DRAW';
  finalPlayers: number;     // ✅ playerCount → finalPlayers
  playedAt: string;
  // ❌ 제거: difficulty, problemTitle, rank
}
```

- ✅ `roomName` 추가
- ✅ `playerCount` → `finalPlayers` 변경
- ❌ `difficulty`, `problemTitle`, `rank` 제거

#### 1.3 게임 결과 (GameFinishedResult)
**파일:** `src/api/dtos/game.dto.ts`, `src/entities/game.model.ts`

```typescript
// 변경 전
interface GameFinishedResult {
  userId: string;
  nickname: string;
  result: 'WIN' | 'LOSE' | 'DRAW';
  rankInGame: number;
  scoreDelta: number;
  coinDelta: number;
  expDelta: number;
  finalScoreValue: number;
  solved: boolean;
}

// 변경 후
interface GameFinishedResult {
  userId: string;
  nickname: string;
  result: 'WIN' | 'LOSE' | 'DRAW';
  rankInGame: number;
  scoreDelta: number;
  coinBefore: number;   // ✅ 추가
  coinDelta: number;
  expBefore: number;    // ✅ 추가
  expDelta: number;
  finalScoreValue: number;
  solved: boolean;
}
```

- ✅ `coinBefore`, `expBefore` 추가

---

## 🎯 작업 1: catalogStore 성능 최적화

### 문제점
- 매번 `find()`로 배열 전체 순회 (O(n))
- ShopPhase: 8번 find() 호출
- InventoryPanel: 슬롯마다 find() 호출

### 해결 방법
**파일:** `src/stores/useCatalogStore.ts`

```typescript
// iconKey → iconPath 매핑 Map 추가 (O(1) 조회)
const itemIconMap = ref<Map<string, string>>(new Map());
const spellIconMap = ref<Map<string, string>>(new Map());

// 헬퍼 함수
function getItemIcon(itemId: string): string {
  return itemIconMap.value.get(itemId) || '/icons/items/default.png';
}

function getSpellIcon(spellId: string): string {
  return spellIconMap.value.get(spellId) || '/icons/spells/default.png';
}
```

### 성능 개선
| 구분 | 변경 전 | 변경 후 |
|---|---|---|
| ShopPhase | O(n) × 8 = O(8n) | O(1) × 8 = O(8) |
| InventoryPanel | O(n) × 슬롯 수 | O(1) × 슬롯 수 |
| 초기 Map 생성 | - | O(n) (1회만) |

### 변경된 컴포넌트
- ✅ `src/pages/match/components/ShopPhase.vue`
- ✅ `src/pages/match/components/InventoryPanel.vue`

```vue
<!-- 변경 전 -->
<img :src="getItemIconPath(item.iconKey)" />

<!-- 변경 후 -->
<img :src="catalogStore.getItemIcon(item.itemId)" />
```

---

## 📊 작업 2: 마이페이지 대전기록 API 수정

### 2.1 API 파라미터 변경
**파일:** `src/api/stats.ts`

```typescript
// 변경 전
getMyMatches: (params?: { page?: number; size?: number }) => {
  return apiClient.get('/users/me/matches', { params });
}

// 변경 후
getMyMatches: (params?: { cursor?: string; limit?: number }) => {
  return apiClient.get('/users/me/matches', { params });
}
```

- ✅ `page, size` → `cursor, limit` 변경 (OPENAPI 스펙 준수)

### 2.2 응답 DTO 변경
**파일:** `src/api/dtos/stats.dto.ts`

```typescript
// 변경 전
interface PagedMatchList {
  items: MatchSummary[];
  total: number;
  page: number;
  size: number;
}

// 변경 후
interface PageCursor {
  limit: number;
  nextCursor: string | null;
}

interface PagedMatchList {
  items: MatchSummary[];
  page: PageCursor;
}
```

### 2.3 Store 변경
**파일:** `src/stores/useStatsStore.ts`

```typescript
// 커서 상태 추가
const matchesCursor = ref<string | null>(null);

// 함수 시그니처 변경
async function fetchMyMatches(cursor?: string, limit = 20) {
  const response = await statsApi.getMyMatches({ cursor, limit });
  myMatches.value = response.items.map(toMatchSummaryViewModel);
  matchesCursor.value = response.page.nextCursor;
}
```

### 2.4 대전기록 UI 수정
**파일:** `src/pages/user/components/MatchHistoryList.vue`

```vue
<!-- 변경 전: matchId 표시 -->
<div class="problem-title">{{ match.id.slice(0, 8) }}</div>

<!-- 변경 후: roomName 표시 -->
<div class="room-info">
  <span class="room-name">{{ match.title }}</span>
  <span class="game-type">{{ match.type === 'rank' ? '랭크' : '일반' }}</span>
</div>
```

**파일:** `src/pages/main/components/MyPagePanel.vue`

```typescript
// MatchHistoryList에 전달할 데이터 변환
const matchHistoryListData = computed(() => {
  return statsStore.myMatches.map(match => ({
    id: match.matchId,
    type: match.gameType === 'RANKED' ? 'rank' : 'normal',
    status: match.result,
    players: match.finalPlayers,
    title: match.roomName,  // ✅ roomName 매핑
    date: match.playedAt,
  }));
});
```

---

## ❌ 작업 3: users/me/activities API 제거

### 문제점
- 명세서(OPENAPI.yaml)에 없는 API 호출

### 제거 내역

#### 3.1 API 함수 제거
**파일:** `src/api/stats.ts`
```typescript
// ❌ 제거
getMyActivities: (params?: { from?: string; to?: string }) => {
  return apiClient.get<void, UserActivities>('/users/me/activities', { params });
}
```

#### 3.2 DTO 제거
**파일:** `src/api/dtos/stats.dto.ts`
```typescript
// ❌ 제거
interface DailyActivity { date: string; count: number; }
interface UserActivities { activities: DailyActivity[]; }
```

#### 3.3 ViewModel 제거
**파일:** `src/entities/stats.model.ts`
```typescript
// ❌ 제거
interface DailyActivityViewModel { date: string; count: number; }
function toDailyActivityViewModel(dto: DailyActivity): DailyActivityViewModel
```

#### 3.4 Store 함수 제거
**파일:** `src/stores/useStatsStore.ts`
```typescript
// ❌ 제거
const myActivities = ref<DailyActivityViewModel[]>([]);
async function fetchMyActivities(from?: string, to?: string)
```

#### 3.5 컴포넌트 수정
**파일:** `src/pages/main/components/MyPagePanel.vue`
```typescript
// ❌ 제거
statsStore.fetchMyActivities().catch(() => null)
```

**파일:** `src/pages/user/components/TierView.vue`
```typescript
// activities prop을 optional로 변경
interface Props {
  activities?: Activity[];  // Optional
}

const props = withDefaults(defineProps<Props>(), {
  activities: () => []  // 기본값: 빈 배열
});
```

---

## 🎨 작업 4: 게임 결과 애니메이션 개선

### 새로운 컴포넌트
**파일:** `src/shared/components/NumberCounter.vue`

```vue
<NumberCounter
  :from="coinBefore"
  :to="coinBefore + coinDelta"
  :duration="2000"
  :delay="0"
/>
```

- ✅ `coinBefore` → `coinBefore + coinDelta` 증가 애니메이션
- ✅ `expBefore` → `expBefore + expDelta` 증가 애니메이션
- ✅ easeOutExpo 이징으로 부드러운 감속
- ✅ 천 단위 구분자 지원

### 변경된 페이지
**파일:** `src/pages/match/MatchResultPage.vue`

```typescript
// before 값 사용
const coinFrom = ref(0);
const coinTo = ref(0);
const expFrom = ref(0);
const expTo = ref(0);

// before → before + delta 애니메이션
coinFrom.value = me.coinBefore;
coinTo.value = me.coinBefore + me.coinDelta;
expFrom.value = Math.round(me.expBefore);
expTo.value = Math.round(me.expBefore + me.expDelta);
```

---

## 🔍 작업 5: MyPagePanel 프로필 데이터 표시 수정

### 문제점
- MyPagePanel에서 language, coin, exp 값이 표시되지 않음
- login 시 받는 UserViewModel에는 language, coin, exp 필드가 없음
- /users/me API로 전체 프로필 조회 필요

### 해결 방법

#### 5.1 AuthStore 타입 확장
**파일:** `src/stores/useAuthStore.ts`

```typescript
// 변경 전
const user = ref<UserViewModel | null>(null);

// 변경 후
const user = ref<UserViewModel | UserProfileViewModel | null>(null);
```

- ✅ UserProfileViewModel 타입 추가 (language, coin, exp 포함)

#### 5.2 프로필 조회 호출
**파일:** `src/pages/main/components/MyPagePanel.vue`

```typescript
onMounted(async () => {
    try {
        // UserProfile (language, exp, coin 포함) 조회
        await authStore.fetchUserProfile();

        // 통계 데이터 로드
        await Promise.all([
            statsStore.fetchMyStats().catch(() => null),
            statsStore.fetchMyMatches().catch(() => null),
        ]);
    } catch (error) {
        console.error('[MyPagePanel] Data load error:', error);
    }
});
```

#### 5.3 Computed 데이터 수정
```typescript
const profileData = computed(() => {
    const u = authStore.user as any; // UserProfileViewModel 타입
    return {
        nickname: u?.nickname ?? 'Unknown',
        language: u?.language ?? 'JAVA',        // ✅ API 응답 사용
        coin: u?.coin ?? 0,                     // ✅ API 응답 사용
        exp: u?.exp ?? 0,                       // ✅ API 응답 사용
        rating: u?.score ?? 0,
        tier: u?.tier ?? 'UNRANKED',
    };
});
```

### 실제 API 응답
```json
{
  "userId": "28141053-00cd-4bea-b827-c9abed1c7968",
  "nickname": "테스터 1",
  "language": "JAVA",
  "tier": "Bronze IV",
  "score": 480,
  "exp": 620.0,
  "coin": 10700
}
```

---

## 🔧 iconKey 매핑 수정

### 백엔드 실제 응답 기준 변경

| 카테고리 | 이름 | 프론트(기존) | 백엔드(실제) | 변경 |
|---|---|---|---|---|
| 스펠 | 보호막 | barrier | **shield** | ✅ 파일명 변경 |
| 스펠 | 감시자 | watcher | **observer** | ✅ 파일명 변경 |
| 아이템 | 탈진 | exhaust | **exhaustion** | ✅ 파일명 변경 |

### 파일 변경
```bash
public/icons/spells/barrier.png → shield.png
public/icons/spells/watcher.png → observer.png
public/icons/items/exhaust.png → exhaustion.png
```

### assetMapper 업데이트
**파일:** `src/shared/utils/assetMapper.util.ts`

```typescript
// 변경 전
export const VALID_ITEM_IDS = ['hacking', 'ignite', 'earthquake', 'eclipse', 'exhaust'];
export const VALID_SPELL_IDS = ['barrier', 'cleanse', 'watcher'];

// 변경 후
export const VALID_ITEM_IDS = ['hacking', 'ignite', 'earthquake', 'eclipse', 'exhaustion'];
export const VALID_SPELL_IDS = ['shield', 'cleanse', 'observer'];
```

---

## ✅ 최종 검증

### 빌드 상태
```bash
vite v7.3.1 building client environment for production...
✓ 1412 modules transformed.
✓ built in 11.01s
```

### 타입 체크
- ✅ TypeScript 컴파일 성공 (vue-tsc -b)
- ✅ 모든 타입 에러 해결
- ✅ UserViewModel | UserProfileViewModel 타입 유니온 정상 동작

### 변경된 파일 목록
```
[DTO 레이어]
src/api/dtos/catalog.dto.ts          - iconKey 필드 추가
src/api/dtos/stats.dto.ts            - MatchSummary 수정, PageCursor 추가, Activities 제거
src/api/dtos/game.dto.ts             - coinBefore, expBefore 추가

[ViewModel 레이어]
src/entities/catalog.model.ts        - iconKey 반영
src/entities/stats.model.ts          - MatchSummary 변환 수정
src/entities/game.model.ts           - coinBefore, expBefore 반영

[API 클라이언트]
src/api/stats.ts                     - cursor/limit 파라미터 변경, activities API 제거

[Store 레이어]
src/stores/useAuthStore.ts           - UserViewModel | UserProfileViewModel 타입 유니온
src/stores/useCatalogStore.ts        - Map 기반 아이콘 조회 최적화
src/stores/useStatsStore.ts          - 커서 기반 페이지네이션, activities 제거

[컴포넌트]
src/pages/main/components/MyPagePanel.vue      - UserProfile 조회, 프로필 데이터 표시
src/pages/match/components/ShopPhase.vue       - Map 기반 아이콘 조회 사용
src/pages/match/components/InventoryPanel.vue  - Map 기반 아이콘 조회 사용
src/pages/match/MatchResultPage.vue            - NumberCounter 애니메이션 적용
src/pages/user/components/TierView.vue         - activities optional 처리
src/pages/user/components/MatchHistoryList.vue - roomName 표시

[신규 컴포넌트]
src/shared/components/NumberCounter.vue        - 숫자 증가 애니메이션 컴포넌트

[유틸리티]
src/shared/utils/assetMapper.util.ts           - iconKey 검증 배열 업데이트

[아이콘 파일]
public/icons/spells/barrier.png → shield.png
public/icons/spells/watcher.png → observer.png
public/icons/items/exhaust.png → exhaustion.png
```

---

## 📝 브라우저 테스트 체크리스트

모든 코드 수정이 완료되었으며 빌드가 성공했습니다. 아래 항목들을 브라우저에서 확인해주세요:

### 게임 내 기능
- [ ] **ShopPhase**: 아이템/스펠 아이콘 정상 표시 (shield, observer, exhaustion)
- [ ] **InventoryPanel**: 인벤토리 슬롯 아이콘 정상 표시
- [ ] **MatchResultPage**: 코인/경험치 증가 애니메이션 동작 (before → before+delta)

### 마이페이지
- [ ] **프로필 상단**: language, coin, exp, tier 정상 표시 (/users/me API 응답 반영)
- [ ] **대전기록 탭**: roomName 정상 표시 (matchId가 아닌 방 이름)
- [ ] **대전기록 탭**: 게임 타입 (랭크/일반) 표시
- [ ] **통계 탭**: 티어 정보 및 승률/해결률 표시

### 콘솔 확인
- [ ] Invalid iconKey 경고 없는지 확인
- [ ] API 호출 에러 없는지 확인 (users/me/activities 호출 제거됨)

---

**참고 문서:**
- `ICON_MAPPING_IMPROVEMENT.md` - catalogStore Map 최적화 상세
- `ICONKEY_MAPPING_VERIFICATION.md` - iconKey 매핑 검증 완료
