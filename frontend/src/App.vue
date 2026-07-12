<template>
  <n-config-provider :theme-overrides="themeStore.themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
        <ToastContainer />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { zhCN, dateZhCN } from 'naive-ui'
import { useThemeStore } from './stores/theme'
import ToastContainer from './components/ToastContainer.vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.loadTheme()
})
</script>

<style>
html.dark {
  background-color: #1a1a1a;
}

html:not(.dark) {
  background-color: #f5f5f5;
}

* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
