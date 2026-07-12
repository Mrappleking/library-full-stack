<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        @click="removeToast(toast.id)"
      >
        <n-icon :component="iconMap[toast.type]" />
        <span>{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, AlertCircle, InfoCircle, WarningCircle } from '@vicons/ionicons5'
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: WarningCircle,
  info: InfoCircle,
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-width: 400px;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.toast-success {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
}

.toast-error {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  color: #c62828;
}

.toast-warning {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  color: #ef6c00;
}

.toast-info {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1565c0;
}

.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

html.dark .toast-success {
  background: linear-gradient(135deg, #1b2e1b, #1e4d23);
  color: #81c784;
}

html.dark .toast-error {
  background: linear-gradient(135deg, #3d1b1b, #4d1f1f);
  color: #ef9a9a;
}

html.dark .toast-warning {
  background: linear-gradient(135deg, #4a3728, #5d4e37);
  color: #ffca28;
}

html.dark .toast-info {
  background: linear-gradient(135deg, #1a2744, #1e3a5f);
  color: #64b5f6;
}
</style>