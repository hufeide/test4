<template>
  <div v-if="show" class="need-help-modal-overlay" @click.self="handleClickOutside">
    <div class="need-help-modal">
      <div class="need-help-modal-header">
        <h3>帮助</h3>
        <button class="close-btn" @click="close">x</button>
      </div>
      <div class="need-help-modal-body">
        <p><strong>为什么需求值会降低？</strong></p>
        <ul>
          <li>与宠物互动较少</li>
          <li>长时间未登录应用</li>
          <li>宠物状态不佳时未及时照顾</li>
        </ul>

        <p><strong>如何提高需求值？</strong></p>
        <ul>
          <li>每天与宠物进行聊天互动</li>
          <li>给宠物发送 messages 表达关心</li>
          <li>保持每日登录，维持互动频率</li>
          <li>在需要时请求宠物的帮助</li>
        </ul>
      </div>
      <div class="need-help-modal-footer">
        <button @click="close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const close = () => {
  emit('update:show', false);
};

const handleClickOutside = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('need-help-modal-overlay')) {
    close();
  }
};
</script>

<style scoped>
.need-help-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.need-help-modal {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.need-help-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.need-help-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
}

.close-btn:hover {
  color: #333;
}

.need-help-modal-body {
  margin-bottom: 24px;
}

.need-help-modal-body p {
  margin: 16px 0 8px;
  line-height: 1.6;
}

.need-help-modal-body ul {
  margin: 8px 0 16px 20px;
  padding: 0;
}

.need-help-modal-body li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.need-help-modal-footer {
  display: flex;
  justify-content: flex-end;
}

.need-help-modal-footer button {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 24px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.need-help-modal-footer button:hover {
  background-color: #40a9ff;
}
</style>
