<template>
  <div class="memory-container">
    <div class="memory-header">
      <h2 class="memory-title">Memory</h2>
      <div class="memory-controls">
        <button
          v-if="showSharingControls"
          @click="toggleSharing"
          :class="['sharing-toggle', { enabled: sharingEnabled }]"
        >
          <span class="sharing-icon">{{ sharingEnabled ? '💡' : '💤' }}</span>
          <span class="sharing-text">{{ sharingEnabled ? 'Auto-Share On' : 'Auto-Share Off' }}</span>
        </button>
        <button @click="clearMemory" class="clear-btn" title="Clear all memory">
          <span class="clear-icon">🗑️</span>
          <span class="clear-text">Clear</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <span class="loading-spinner"></span>
      <p class="loading-text">Loading memories...</p>
    </div>

    <div v-else-if="sessions.length === 0" class="empty-memory">
      <div class="empty-icon">📝</div>
      <p>No memories yet. Start chatting with your pet!</p>
    </div>

    <div v-else class="sessions-list">
      <div
        v-for="session in sessions"
        :key="session.date"
        class="session-group"
      >
        <div class="session-date">{{ session.date }}</div>
        <div class="session-messages">
          <div
            v-for="msg in session.messages"
            :key="msg.id"
            class="memory-message"
            :class="{ 'user-message': msg.sender === 'user', 'ai-message': msg.sender === 'ai' }"
          >
            <div class="message-content">{{ msg.text }}</div>
            <div class="message-meta">
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>
        </div>
        <div class="session-footer">
          <span class="message-count">{{ session.messageCount }} messages</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { getAllChatMessages, clearChatHistory } from '../services/memory';
import { isSharingEnabled, setSharingEnabled, getSharingStats, startSharingInterval } from '../services/sharing';

export default {
  name: 'Memory',
  props: {
    showSharingControls: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const sessions = ref([]);
    const loading = ref(true);
    const sharingEnabled = ref(true);
    const cleanupSharing = ref(null);

    const loadSessions = async () => {
      loading.value = true;
      try {
        const messages = await getAllChatMessages();
        const sessionsData = messages.reduce((acc, msg) => {
          const date = new Date(msg.timestamp).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(msg);
          return acc;
        }, {});

        sessions.value = Object.entries(sessionsData).map(([date, msgs]) => ({
          date,
          messages: msgs.sort((a, b) => a.timestamp - b.timestamp),
          messageCount: msgs.length
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (error) {
        console.error('Error loading memories:', error);
      } finally {
        loading.value = false;
      }
    };

    const clearMemory = async () => {
      if (confirm('Are you sure you want to clear all chat memories? This cannot be undone.')) {
        await clearChatHistory();
        await loadSessions();
      }
    };

    const toggleSharing = () => {
      const newEnabled = !sharingEnabled.value;
      setSharingEnabled(newEnabled);
      sharingEnabled.value = newEnabled;

      if (newEnabled) {
        startSharing((msg) => {
          console.log('Auto-share:', msg);
          // In a real app, you might add this to chat or show a notification
        });
      } else {
        if (cleanupSharing.value) {
          cleanupSharing.value();
          cleanupSharing.value = null;
        }
      }
    };

    const startSharing = (onShare) => {
      if (cleanupSharing.value) {
        cleanupSharing.value();
      }
      cleanupSharing.value = startSharingInterval(onShare);
    };

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    onMounted(async () => {
      sharingEnabled.value = isSharingEnabled();
      await loadSessions();

      if (sharingEnabled.value) {
        startSharing((msg) => {
          console.log('Auto-share:', msg);
        });
      }
    });

    onUnmounted(() => {
      if (cleanupSharing.value) {
        cleanupSharing.value();
      }
    });

    return {
      sessions,
      loading,
      sharingEnabled,
      clearMemory,
      toggleSharing,
      formatTime
    };
  }
};
</script>

<style scoped>
.memory-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
}

.memory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-bottom: 1px solid #eee;
}

.memory-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.memory-controls {
  display: flex;
  gap: 8px;
}

.sharing-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.sharing-toggle.enabled {
  background-color: #d4edda;
  color: #155724;
}

.sharing-toggle:hover {
  transform: scale(1.05);
}

.sharing-icon {
  font-size: 16px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #f8d7da;
  color: #721c24;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: #f5c6cb;
}

.clear-btn:hover .clear-icon {
  transform: scale(1.2);
}

.clear-icon {
  font-size: 16px;
  transition: transform 0.2s;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 14px;
}

.empty-memory {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-memory p {
  margin: 0;
  font-size: 14px;
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.session-group {
  margin-bottom: 24px;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.session-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.session-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.memory-message {
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 13px;
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

.message-content {
  margin-bottom: 4px;
}

.message-meta {
  font-size: 10px;
  opacity: 0.7;
  text-align: right;
}

.session-footer {
  display: flex;
  justify-content: center;
  padding-top: 8px;
  border-top: 1px dashed #eee;
}

.message-count {
  font-size: 11px;
  color: #999;
}
</style>
