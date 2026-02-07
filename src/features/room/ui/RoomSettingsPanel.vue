<script setup lang="ts">
import type { RoomDetail } from '@/api/dtos/room.types';
import BaseBadge from '@/shared/ui/BaseBadge.vue';

interface Props {
  room: RoomDetail;
}

defineProps<Props>();
</script>

<template>
  <div class="settings-panel">
    <h3 class="panel-title">방 설정</h3>
    <div class="settings-list">
      <div class="setting-item">
        <span class="label">게임 유형:</span>
        <BaseBadge variant="cyan" :label="room.gameType" />
      </div>
      <div class="setting-item">
        <span class="label">최대 인원:</span>
        <BaseBadge variant="cyan" :label="`${room.maxPlayers}명`" />
      </div>
      <div class="setting-item">
        <span class="label">제한 시간:</span>
        <BaseBadge variant="cyan" label="60분" />
      </div>
      <div class="setting-item">
        <span class="label">언어:</span>
        <BaseBadge variant="cyan" :label="room.language" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings-panel {
  background: var(--color-bg-panel);
  border-radius: calc(var(--gu) * 1.2);
  padding: 2vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: calc(var(--gu) * 0.125) solid var(--color-border-cyan);

  .panel-title {
    font-family: var(--font-display);
    font-size: calc(var(--gu) * 1.0);
    margin-top: 0;
    margin-bottom: 1.5vh;
    color: white;
    font-weight: 800;
  }
  
  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 1vh;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: calc(var(--gu) * 0.8);
    color: var(--color-text-secondary);
  }
}
</style>
