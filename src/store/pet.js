import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePetStore = defineStore('pet', () => {
  // State
  const petName = ref('Buddy');
  const needs = ref([
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
  const chatHistory = ref([]);

  // Computed
  const totalNeeds = computed(() => needs.value.length);
  const averageNeed = computed(() => {
    const total = needs.value.reduce((sum, n) => sum + n.value, 0);
    return Math.round(total / needs.value.length);
  });

  // Actions
  function updateNeed(needType, newValue) {
    const need = needs.value.find(n => n.type === needType);
    if (need) {
      need.value = Math.max(0, Math.min(need.max, newValue));
    }
  }

  function incrementNeed(needType, amount = 1) {
    const need = needs.value.find(n => n.type === needType);
    if (need) {
      need.value = Math.min(need.max, need.value + amount);
    }
  }

  function decrementNeed(needType, amount = 1) {
    const need = needs.value.find(n => n.type === needType);
    if (need) {
      need.value = Math.max(0, need.value - amount);
    }
  }

  function getNeedColor(need) {
    const percentage = (need.value / need.max) * 100;
    if (percentage < 30) return 'need-low';
    if (percentage < 70) return 'need-medium';
    return 'need-high';
  }

  function setChatHistory(messages) {
    chatHistory.value = messages;
  }

  function addChatMessage(message) {
    chatHistory.value.push(message);
  }

  function clearChatHistory() {
    chatHistory.value = [];
  }

  return {
    petName,
    needs,
    chatHistory,
    totalNeeds,
    averageNeed,
    updateNeed,
    incrementNeed,
    decrementNeed,
    getNeedColor,
    setChatHistory,
    addChatMessage,
    clearChatHistory
  };
});
