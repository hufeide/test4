<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>聊天</h2>
      <button class="help-btn" @click="showNeedHelpModal = true" title="帮助">
        ?
      </button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in petStore.chatHistory" :key="message.id" class="chat-message">
        <div class="message-content">
          <span class="message-role">{{ message.role === 'user' ? '你' : '宠物' }}</span>
          <p class="message-text">{{ message.content }}</p>
        </div>
      </div>
      <div v-if="petStore.chatHistory.length === 0" class="empty-chat">
        <p>开始与宠物聊天吧！点击 "?" 按钮了解更多信息。</p>
      </div>
    </div>

    <div class="chat-input-area">
      <textarea
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="输入消息..."
        :disabled="isSending"
      ></textarea>
      <button @click="sendMessage" :disabled="!newMessage.trim() || isSending">
        发送
      </button>
    </div>

    <NeedHelpModal v-model:show="showNeedHelpModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import petStore, { addMessageToHistory, getFormattedHistory } from '../store/pet';
import { chatWithAI } from '../api/llm';
import NeedHelpModal from './NeedHelpModal.vue';

const messagesContainer = ref<HTMLElement | null>(null);
const newMessage = ref('');
const showNeedHelpModal = ref(false);
const isSending = ref(false);

/**
 * Scroll to bottom of chat messages
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

/**
 * Send a message to the chat
 */
const sendMessage = async () => {
  const content = newMessage.value.trim();
  if (!content || isSending.value) return;

  isSending.value = true;

  try {
    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: content,
      timestamp: Date.now(),
    };
    addMessageToHistory(userMessage);
    newMessage.value = '';
    scrollToBottom();

    // Get formatted history for API
    const history = getFormattedHistory();

    // Call AI API
    const response = await chatWithAI(history);

    // Add AI response
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: response,
      timestamp: Date.now(),
    };
    addMessageToHistory(aiMessage);
    scrollToBottom();
  } catch (error) {
    console.error('Failed to send message:', error);
    // Add error message
    const errorMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: `发送失败：${error instanceof Error ? error.message : '未知错误'}`,
      timestamp: Date.now(),
    };
    addMessageToHistory(errorMessage);
    scrollToBottom();
  } finally {
    isSending.value = false;
  }
};

onMounted(() => {
  // Load chat history from DB on mount
  import('../store/pet').then(({ loadChatHistory }) => {
    loadChatHistory();
  });
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #1890ff;
  color: white;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.help-btn {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.help-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  align-self: flex-start;
}

.message-content {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-role {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.message-text {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.empty-chat {
  text-align: center;
  color: #999;
  margin-top: 40px;
}

.chat-input-area {
  display: flex;
  padding: 16px;
  background-color: white;
  border-top: 1px solid #eee;
  gap: 12px;
}

.chat-input-area textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  min-height: 48px;
  max-height: 120px;
  transition: border-color 0.2s;
}

.chat-input-area textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.chat-input-area button {
  padding: 0 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 80px;
}

.chat-input-area button:hover:not(:disabled) {
  background-color: #40a9ff;
}

.chat-input-area button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
