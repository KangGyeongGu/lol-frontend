<script setup lang="ts">
import { MESSAGES } from '@/shared/constants/messages';

interface Props {
  provider: string;
  nickname: string;
  email: string;
  language: string;
  joinDate: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'logout'): void;
  (e: 'edit-nickname'): void;
  (e: 'edit-language'): void;
}>();
</script>

<template>
  <aside class="account-settings">
    <h3 class="section-title">{{ MESSAGES.MY_PAGE.ACCOUNT_INFO }}</h3>
    <div class="settings-list">
      <div class="setting-item">
        <div class="label">{{ MESSAGES.MY_PAGE.LABEL_SOCIAL_LOGIN }}</div>
        <div class="val-row">
          {{ provider }} <button class="edit-btn">{{ MESSAGES.MY_PAGE.BTN_CHANGE }}</button>
        </div>
      </div>
      <div class="setting-item">
        <div class="label">{{ MESSAGES.MY_PAGE.LABEL_NICKNAME }}</div>
        <div class="val-row">
          {{ nickname }} <button class="edit-btn pink" @click="emit('edit-nickname')">{{ MESSAGES.MY_PAGE.BTN_EDIT }}</button>
        </div>
      </div>
      <div class="setting-item">
        <div class="label">{{ MESSAGES.MY_PAGE.LABEL_EMAIL }}</div>
        <div class="val-row">
          {{ email }} <span class="certified">{{ MESSAGES.MY_PAGE.CERTIFIED }}</span>
        </div>
      </div>
      <div class="setting-item">
        <div class="label">{{ MESSAGES.MY_PAGE.LABEL_LANGUAGE }}</div>
        <div class="val-row">
          {{ language }} <button class="edit-btn pink" @click="emit('edit-language')">{{ MESSAGES.MY_PAGE.BTN_EDIT }}</button>
        </div>
      </div>
      <div class="setting-item">
        <div class="label">{{ MESSAGES.MY_PAGE.LABEL_JOIN_DATE }}</div>
        <div class="val-row">{{ joinDate }}</div>
      </div>
    </div>
    <div class="account-actions">
      <button class="ghost-btn">{{ MESSAGES.MY_PAGE.BTN_WITHDRAW }}</button>
      <button class="logout-btn" @click="emit('logout')">{{ MESSAGES.MY_PAGE.BTN_LOGOUT }}</button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.account-settings {
  width: calc(var(--gu) * 28);
  background: rgba(30, 26, 45, 0.5);
  border-radius: var(--radius-lg);
  padding: calc(var(--gu) * 1.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title {
  font-family: var(--font-display);
  color: var(--color-accent-cyan);
  margin-bottom: 12px;
  font-size: calc(var(--gu) * 1.2);
}

.settings-list {
  flex: 1;
  overflow-y: auto;
  padding-right: calc(var(--gu) * 0.25);

  &::-webkit-scrollbar {
    width: calc(var(--gu) * 0.1875);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
  }

  .setting-item {
    margin-bottom: calc(var(--gu) * 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: calc(var(--gu) * 0.5);

    .label {
      color: var(--color-text-muted);
      font-size: calc(var(--gu) * 0.65);
      font-weight: 600;
      margin-bottom: calc(var(--gu) * 0.25);
    }

    .val-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: calc(var(--gu) * 0.75);
    }
  }
}

.edit-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-secondary);
  padding: calc(var(--gu) * 0.25) calc(var(--gu) * 0.75);
  border-radius: calc(var(--gu) * 0.25);
  cursor: pointer;
  font-size: calc(var(--gu) * 0.65);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.pink {
    border-color: rgba(255, 79, 216, 0.3);
    color: var(--color-accent-magenta);
  }
}

.certified {
  color: var(--color-accent-green-alt);
  font-size: calc(var(--gu) * 0.65);
  background: rgba(58, 255, 159, 0.1);
  padding: calc(var(--gu) * 0.125) calc(var(--gu) * 0.375);
  border-radius: calc(var(--gu) * 0.25);
}

.account-actions {
  display: flex;
  gap: calc(var(--gu) * 0.5);
  margin-top: calc(var(--gu) * 0.625);

  button {
    flex: 1;
    height: calc(var(--gu) * 2.5);
    border: none;
    border-radius: calc(var(--gu) * 0.25);
    font-weight: 800;
    cursor: pointer;
    font-size: calc(var(--gu) * 0.7);
  }

  .ghost-btn {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-muted);
  }

  .logout-btn {
    background: rgba(255, 79, 91, 0.15);
    border: 1px solid var(--color-accent-red);
    color: var(--color-accent-red);
  }
}
</style>
