<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-chat">
        <p>Start chatting with your pet!</p>
      </div>
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="chat-message"
        :class="{ 'user-message': msg.sender === 'user', 'ai-message': msg.sender === 'ai' }"
      >
        <div class="message-content">{{ msg.text }}</div>
        <div class="message-meta">
          <span class="message-sender">{{ msg.sender === 'user' ? 'You' : 'AI' }}</span>
          <span class="message-time">{{ msg.timestamp }}</span>
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
      <button @click="sendMessage" :disabled="!inputText.trim()" class="send-btn">
        Send
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  props: {
    petName: {
      type: String,
      default: 'Pet'
    }
  },
  data() {
    return {
      messages: [],
      inputText: '',
      isLoading: false,
      currentTime: () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    };
  },
  computed: {
    messagesContainer() {
      return this.$refs.messagesContainer;
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    }
  },
  methods: {
    scrollToBottom() {
      const container = this.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    handleKeyDown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    },
    sendMessage() {
      const text = this.inputText.trim();
      if (!text) return;

      // Fix: Clear input immediately
      this.inputText = '';

      // Fix: Add user message to chat history immediately
      const userMessage = {
        sender: 'user',
        text: text,
        timestamp: this.currentTime()
      };
      this.messages.push(userMessage);

      // Show loading state
      this.isLoading = true;

      // Simulate AI response (in real app, this would be an API call)
      setTimeout(() => {
        const aiMessage = {
          sender: 'ai',
          text: `I'm here, ${this.petName}! You said: "${text}"`,
          timestamp: this.currentTime()
        };
        this.messages.push(aiMessage);
        this.isLoading = false;
      }, 1000);
    }
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
