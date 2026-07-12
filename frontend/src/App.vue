<template>
  <n-config-provider :theme-overrides="themeStore.themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
          <ToastContainer />
        </n-notification-provider>
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html:not(.dark) {
  background-color: #f9fafb;
  color-scheme: light;
  color: #000000;
}

html.dark {
  background-color: #0f172a;
  color-scheme: dark;
  color: #f3f4f6;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}

* {
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(25px) scale(0.96);
  filter: blur(4px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-25px) scale(0.96);
  filter: blur(4px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}
</style>
