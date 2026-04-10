<template>
  <div class="app">
    <h1 class="app-title">Pet Care Companion</h1>

    <div class="needs-container">
      <h2 class="section-title">Needs</h2>
      <div class="needs-list">
        <div
          v-for="need in needs"
          :key="need.type"
          class="need-item"
        >
          <div class="need-info">
            <span class="need-icon">{{ need.icon }}</span>
            <span class="need-label">{{ need.label }}</span>
            <span class="need-value">{{ need.value }}/{{ need.max }}</span>
          </div>
          <div class="need-bar">
            <div
              class="need-fill"
              :style="{ width: (need.value / need.max) * 100 + '%' }"
              :class="getBarColorClass(need.value, need.max)"
            ></div>
          </div>
          <button
            class="need-help-btn"
            @click="showHelp(need.type)"
            title="Help"
          >
            ?
          </button>
        </div>
      </div>
    </div>

    <div class="tabs-container">
      <button
        :class="['tab-btn', { active: currentTab === 'chat' }]"
        @click="currentTab = 'chat'"
      >
        💬 Chat
      </button>
      <button
        :class="['tab-btn', { active: currentTab === 'memory' }]"
        @click="currentTab = 'memory'"
      >
        📝 Memory
      </button>
    </div>

    <div class="tab-content">
      <div v-if="currentTab === 'chat'" class="chat-section">
        <Chat :pet-name="petName" :session-id="currentSessionId" ref="chat" />
      </div>
      <div v-if="currentTab === 'memory'" class="memory-section">
        <Memory :show-sharing-controls="true" />
      </div>
    </div>

    <NeedHelpModal
      :show="showHelpModal"
      :need-type="currentHelpNeed"
      @close="closeHelpModal"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import Chat from './components/Chat.vue';
import NeedHelpModal from './components/NeedHelpModal.vue';
import Memory from './components/Memory.vue';

export default {
  name: 'App',
  components: {
    Chat,
    NeedHelpModal,
    Memory
  },
  setup() {
    const petName = ref('Buddy');
    const showHelpModal = ref(false);
    const currentHelpNeed = ref('');
    const currentTab = ref('chat');
    const currentSessionId = ref('default');

    const needs = computed(() => [
      { type: 'happiness', label: 'Happiness', icon: '❤️', value: 80, max: 100 },
      { type: 'hunger', label: 'Hunger', icon: '🍗', value: 60, max: 100 },
      { type: 'health', label: 'Health', icon: '❤️', value: 90, max: 100 },
      { type: 'energy', label: 'Energy', icon: '⚡', value: 70, max: 100 },
      { type: 'sleep', label: 'Sleep', icon: '💤', value: 40, max: 100 },
      { type: 'play', label: 'Play', icon: '⚽', value: 50, max: 100 },
      { type: 'love', label: 'Love', icon: '💖', value: 85, max: 100 },
      { type: 'chat', label: 'Chat', icon: '💬', value: 30, max: 100 },
      { type: 'knowledge', label: 'Knowledge', icon: '📚', value: 45, max: 100 }
    ]);

    const getBarColorClass = (value, max) => {
      const percentage = (value / max) * 100;
      if (percentage < 30) return 'need-low';
      if (percentage < 70) return 'need-medium';
      return 'need-high';
    };

    const showHelp = (needType) => {
      currentHelpNeed.value = needType;
      showHelpModal.value = true;
    };

    const closeHelpModal = () => {
      showHelpModal.value = false;
      currentHelpNeed.value = '';
    };

    return {
      petName,
      needs,
      showHelpModal,
      currentHelpNeed,
      currentTab,
      currentSessionId,
      getBarColorClass,
      showHelp,
      closeHelpModal
    };
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.app-title {
  text-align: center;
  color: #333;
  margin-bottom: 24px;
  font-size: 28px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #007bff;
}

.needs-container {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.needs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.need-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.need-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.need-icon {
  font-size: 20px;
}

.need-label {
  font-weight: 500;
  color: #333;
  flex: 1;
}

.need-value {
  font-size: 14px;
  color: #666;
  min-width: 60px;
  text-align: right;
}

.need-bar {
  flex: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.need-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.need-low {
  background-color: #dc3545;
}

.need-medium {
  background-color: #ffc107;
}

.need-high {
  background-color: #28a745;
}

.need-help-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.need-help-btn:hover {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 10px 20px;
  background-color: #e9ecef;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn.active {
  background-color: #007bff;
  color: white;
}

.tab-btn:hover:not(.active) {
  background-color: #dee2e6;
}

.tab-content {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.chat-section {
  height: 500px;
}

.memory-section {
  height: 500px;
}
</style>
