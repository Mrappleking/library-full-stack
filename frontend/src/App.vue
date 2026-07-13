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
import { zhCN, dateZhCN } from 'naive-ui'
import { useThemeStore } from './stores/theme'
import ToastContainer from './components/ToastContainer.vue'

const themeStore = useThemeStore()
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
  background-color: #f3f4f6;
  color-scheme: light;
  --theme-text-color: #111827;
  --theme-text-color-2: #374151;
  --theme-text-color-3: #6b7280;
  --theme-bg-color: #ffffff;
  --theme-body-bg: #f3f4f6;
}

html.dark {
  background-color: #111827;
  color-scheme: dark;
  --theme-text-color: #f9fafb;
  --theme-text-color-2: #e5e7eb;
  --theme-text-color-3: #d1d5db;
  --theme-bg-color: #1f2937;
  --theme-body-bg: #111827;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  min-height: 100vh;
  color: var(--theme-text-color);
  background-color: var(--theme-body-bg);
}

#app {
  min-height: 100vh;
  color: var(--theme-text-color);
}

* {
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
}

html:not(.dark) .n-layout-content {
  background: #ffffff !important;
  color: #111827 !important;
}

html.dark .n-layout-content {
  background: #1f2937 !important;
  color: #f9fafb !important;
}

html:not(.dark) .n-layout {
  background: #f3f4f6 !important;
}

html.dark .n-layout {
  background: #111827 !important;
}

html:not(.dark) h1,
html:not(.dark) h2,
html:not(.dark) h3,
html:not(.dark) h4,
html:not(.dark) h5,
html:not(.dark) h6 {
  color: #111827 !important;
}

html.dark h1,
html.dark h2,
html.dark h3,
html.dark h4,
html.dark h5,
html.dark h6 {
  color: #f9fafb !important;
}

html:not(.dark) .n-descriptions {
  --n-color-card: #ffffff;
  --n-color-text: #111827;
}

html.dark .n-descriptions {
  --n-color-card: #1f2937;
  --n-color-text: #f9fafb;
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
