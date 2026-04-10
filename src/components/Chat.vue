<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-chat">
        <p>Start chatting with your pet!</p>
      </div>
      <div
        v-for="(msg, index) in messages"
        :key="msg.id || index"
        class="chat-message"
        :class="{ 'user-message': msg.sender === 'user', 'ai-message': msg.sender === 'ai' }"
      >
        <div class="message-content">{{ msg.text }}</div>
        <div class="message-meta">
          <span class="message-sender">{{ msg.sender === 'user' ? 'You' : 'AI' }}</span>
          <span class="message-time">{{ formatDate(msg.timestamp) }}</span>
        </div>
      </div>
      <div v-if="isLoading" class="chat-message ai-message loading-message">
        <span class="loading-indicator">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    </div>

    <div class="chat-input-area">
      <textarea
        ref="inputRef"
        v-model="inputText"
        @keydown="handleKeyDown"
        placeholder="Type your message..."
        class="chat-input"
      ></textarea>
      <button @click="sendMessage" :disabled="!inputText.trim() || isLoading" class="send-btn">
        <span v-if="isLoading">Sending...</span>
        <span v-else>Send</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { callLLM } from '../api/llm';
import { addChatMessageToDB, getChatMessagesFromDB } from '../services/memory';

export default {
  name: 'Chat',
  props: {
    petName: {
      type: String,
      default: 'Pet'
    },
    sessionId: {
      type: String,
      default: 'default'
    }
  },
  emits: ['message-sent', 'message-received'],
  setup(props, { emit }) {
    const messages = ref([]);
    const inputText = ref('');
    const isLoading = ref(false);
    const messagesContainer = ref(null);
    const inputRef = ref(null);

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const today = now.toDateString();

      if (date.toDateString() === today) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const scrollToBottom = () => {
      const container = messagesContainer.value;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    };

    const loadHistory = async () => {
      try {
        const history = await getChatMessagesFromDB(props.sessionId);
        messages.value = history;
        await nextTick();
        scrollToBottom();
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    const generateMessageId = () => {
      return `${props.sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const saveMessageToDB = async (message) => {
      try {
        await addChatMessageToDB({
          ...message,
          id: generateMessageId(),
          sessionId: props.sessionId
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    };

    const sendMessage = async () => {
      const text = inputText.value.trim();
      if (!text || isLoading.value) return;

      const now = Date.now();

      // Clear input immediately
      inputText.value = '';

      // Add user message
      const userMessage = {
        id: generateMessageId(),
        sender: 'user',
        text: text,
        timestamp: now
      };
      messages.value.push(userMessage);
      emit('message-sent', userMessage);

      // Save to DB immediately
      await saveMessageToDB(userMessage);

      // Show loading state
      isLoading.value = true;

      // Build conversation history for context (limit to last 10 messages)
      const conversationHistory = messages.value
        .slice(-10)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      try {
        // Call LLM API
        const responseText = await callLLM(text, conversationHistory);

        const aiMessage = {
          id: generateMessageId(),
          sender: 'ai',
          text: responseText,
          timestamp: Date.now()
        };

        messages.value.push(aiMessage);
        emit('message-received', aiMessage);

        // Save to DB
        await saveMessageToDB(aiMessage);
      } catch (error) {
        console.error('Error in chat:', error);
        // Add error message
        const errorMessage = {
          id: generateMessageId(),
          sender: 'ai',
          text: `I'm having trouble responding right now. Error: ${error.message}`,
          timestamp: Date.now()
        };
        messages.value.push(errorMessage);
        await saveMessageToDB(errorMessage);
      } finally {
        isLoading.value = false;
        await nextTick();
        scrollToBottom();
        inputRef.value?.focus();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    };

    onMounted(async () => {
      await loadHistory();
    });

    return {
      messages,
      inputText,
      isLoading,
      messagesContainer,
      inputRef,
      formatDate,
      sendMessage,
      handleKeyDown
    };
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.empty-chat {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 16px;
}

.chat-message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
}

.user-message {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message {
  align-self: flex-start;
  background-color: #e9ecef;
  color: #333;
  border-bottom-left-radius: 4px;
}

.loading-message {
  align-self: flex-start;
  background-color: #e9ecef;
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
}

.loading-indicator {
  display: inline-flex;
  gap: 4px;
  vertical-align: middle;
}

.loading-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #666;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.message-content {
  margin-bottom: 4px;
}

.message-meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  opacity: 0.8;
  margin-top: 4px;
}

.message-sender {
  font-weight: 600;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 16px;
  background-color: white;
  border-top: 1px solid #eee;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  resize: none;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.chat-input:focus {
  border-color: #007bff;
}

.chat-input::placeholder {
  color: #999;
}

.send-btn {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
