/**
 * 아이템, 스펠, 티어 ID를 아이콘 경로로 변환하는 유틸리티
 *
 * 모든 함수는 ID를 소문자로 정규화하여 파일명과 매칭합니다.
 * 존재하지 않는 ID에 대해서는 기본 fallback 이미지를 반환합니다.
 */

/**
 * 아이템 ID를 아이콘 경로로 변환
 *
 * @param itemId - API에서 받은 아이템 ID (예: "HACKING", "hacking")
 * @returns 아이콘 이미지 경로
 *
 * @example
 * getItemIconPath('HACKING') // '/icons/items/hacking.png'
 * getItemIconPath('ignite') // '/icons/items/ignite.png'
 */
export function getItemIconPath(itemId: string): string {
  if (!itemId || itemId.trim() === '') {
    return '/icons/items/default.png';
  }

  const normalizedId = itemId.toLowerCase().trim();

  // 유효성 검증: VALID_ITEM_IDS에 없는 ID는 경고 + fallback
  if (!VALID_ITEM_IDS.includes(normalizedId as ValidItemId)) {
    if (import.meta.env.DEV) {
      console.warn(`[assetMapper] Invalid itemId: "${itemId}" (normalized: "${normalizedId}")`);
    }
    return '/icons/items/default.png';
  }

  return `/icons/items/${normalizedId}.png`;
}

/**
 * 스펠 ID를 아이콘 경로로 변환
 *
 * @param spellId - API에서 받은 스펠 ID (예: "BARRIER", "barrier")
 * @returns 아이콘 이미지 경로
 *
 * @example
 * getSpellIconPath('BARRIER') // '/icons/spells/barrier.png'
 * getSpellIconPath('cleanse') // '/icons/spells/cleanse.png'
 */
export function getSpellIconPath(spellId: string): string {
  if (!spellId || spellId.trim() === '') {
    return '/icons/spells/default.png';
  }

  const normalizedId = spellId.toLowerCase().trim();

  // 유효성 검증: VALID_SPELL_IDS에 없는 ID는 경고 + fallback
  if (!VALID_SPELL_IDS.includes(normalizedId as ValidSpellId)) {
    if (import.meta.env.DEV) {
      console.warn(`[assetMapper] Invalid spellId: "${spellId}" (normalized: "${normalizedId}")`);
    }
    return '/icons/spells/default.png';
  }

  return `/icons/spells/${normalizedId}.png`;
}

/**
 * 티어를 아이콘 경로로 변환
 *
 * @param tier - 티어 문자열 (예: "BRONZE", "GOLD")
 * @returns 아이콘 이미지 경로
 *
 * @example
 * getTierIconPath('BRONZE') // '/icons/tiers/bronze.png'
 * getTierIconPath('master') // '/icons/tiers/master.png'
 */
export function getTierIconPath(tier: string): string {
  if (!tier || tier.trim() === '') {
    return '/icons/tiers/iron.png';
  }

  const normalizedTier = tier.toLowerCase().trim();

  // 유효성 검증: VALID_TIERS에 없는 tier는 경고 + fallback
  if (!VALID_TIERS.includes(normalizedTier as ValidTier)) {
    if (import.meta.env.DEV) {
      console.warn(`[assetMapper] Invalid tier: "${tier}" (normalized: "${normalizedTier}")`);
    }
    return '/icons/tiers/iron.png';
  }

  return `/icons/tiers/${normalizedTier}.png`;
}

/**
 * 유효한 아이템 ID 목록
 * 유효성 검증이나 자동완성에 사용 가능
 */
export const VALID_ITEM_IDS = [
  'hacking',
  'ignite',
  'earthquake',
  'eclipse',
  'exhaustion',
] as const;

/**
 * 유효한 스펠 ID 목록
 * 유효성 검증이나 자동완성에 사용 가능
 */
export const VALID_SPELL_IDS = [
  'shield',
  'cleanse',
  'observer',
] as const;

/**
 * 유효한 티어 목록
 * 유효성 검증이나 자동완성에 사용 가능
 */
export const VALID_TIERS = [
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'master',
  'grandmaster',
  'challenger',
] as const;

export type ValidItemId = typeof VALID_ITEM_IDS[number];
export type ValidSpellId = typeof VALID_SPELL_IDS[number];
export type ValidTier = typeof VALID_TIERS[number];

/**
 * 점수(score)를 기반으로 티어를 계산합니다.
 *
 * @param score - 사용자 점수
 * @returns 계산된 티어 (ValidTier)
 *
 * @example
 * calculateTierFromScore(500) // 'iron'
 * calculateTierFromScore(2500) // 'silver'
 * calculateTierFromScore(9000) // 'challenger'
 */
export function calculateTierFromScore(score: number): ValidTier {
  if (score < 1000) return 'iron';
  if (score < 2000) return 'bronze';
  if (score < 3000) return 'silver';
  if (score < 4000) return 'gold';
  if (score < 5000) return 'platinum';
  if (score < 6000) return 'diamond';
  if (score < 7000) return 'master';
  if (score < 8000) return 'grandmaster';
  return 'challenger';
}
