import { createApp } from 'vue';
import Chat from './components/Chat.vue';
import petStore, { loadChatHistory } from './store/pet';

// Initialize the app
const app = createApp(Chat);

// Load chat history before mounting
loadChatHistory().then(() => {
  app.mount('#app');
});

// Export for potential use in other modules
export { app, petStore };
