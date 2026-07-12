<template>
  <n-config-provider :theme-overrides="themeStore.themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
        <ToastContainer />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { zhCN, dateZhCN } from 'naive-ui'
import { useThemeStore } from './stores/theme'
import ToastContainer from './components/ToastContainer'

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
</style>
