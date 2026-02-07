<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useChatStore } from '../model/useChatStore';
import BaseButton from '@/shared/ui/BaseButton.vue';

interface Props {
  channelId: string;
  nickname: string;
}

const props = defineProps<Props>();
const chatStore = useChatStore();
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const currentMessages = computed(() => chatStore.getMessages(props.channelId));

function handleSend() {
  if (!newMessage.value.trim()) return;
  chatStore.sendMessage(props.channelId, newMessage.value, props.nickname);
  newMessage.value = '';
  scrollToBottom();
}

async function scrollToBottom() {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="chat-panel">
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="msg in currentMessages" 
        :key="msg.id" 
        class="message-row"
        :class="{ 'is-me': msg.isMe }"
      >
        <span class="sender">{{ msg.sender }}:</span>
        <span class="content">{{ msg.content }}</span>
        <span class="time">{{ msg.timestamp }}</span>
      </div>
    </div>
    
    <div class="chat-input-area">
      <input 
        v-model="newMessage" 
        type="text" 
        placeholder="Type a message..." 
        @keyup.enter="handleSend"
      />
      <BaseButton variant="outline" size="sm" @click="handleSend">
        SEND
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(10, 10, 10, 0.5);
  border: calc(var(--gu) * 0.0625) solid var(--color-accent-yellow);
  border-radius: var(--radius-lg);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.chat-messages {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  
  &::-webkit-scrollbar {
    width: calc(var(--gu) * 0.25);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-accent-yellow);
    border-radius: 2px;
  }
}

.message-row {
  font-size: calc(var(--gu) * 0.8);
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
  
  .sender {
    color: var(--color-accent-cyan);
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .content {
    color: var(--color-text-primary);
    word-break: break-all;
  }
  
  .time {
    margin-left: auto;
    font-size: calc(var(--gu) * 0.6);
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
  
  &.is-me {
    .sender {
      color: var(--color-accent-magenta);
    }
  }
}

.chat-input-area {
  padding: var(--space-3);
  background: rgba(0, 0, 0, 0.4);
  border-top: calc(var(--gu) * 0.0625) solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: var(--space-2);
  
  input {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
    border: calc(var(--gu) * 0.0625) solid rgba(58, 242, 255, 0.3);
    border-radius: var(--radius-sm);
    padding: 0 var(--space-3);
    color: white;
    font-size: var(--fontSize-sm);
    height: calc(var(--gu) * 2.25);
    
    &:focus {
      outline: none;
      border-color: var(--color-accent-cyan);
    }
  }
}
</style>
