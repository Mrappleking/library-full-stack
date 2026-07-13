<template>
  <n-layout has-sider style="display: flex; min-height: 100vh;">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :native-scrollbar="false" class="base-sider" :class="{ dark: isDark }">
      <div class="logo">
        <svg class="logo-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <line x1="8" y1="7" x2="16" y2="7"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
        <div>
          <n-text tag="div" style="font-size: 16px; font-weight: 600;">{{ title }}</n-text>
          <n-text tag="div" style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;">{{ subtitle }}</n-text>
        </div>
      </div>
      <div class="sider-divider" v-if="showDivider"></div>
      <n-menu
        :inverted="isDark"
        :value="activeKey"
        :options="menuOptions"
        :root-indent="rootIndent"
        :indent="12"
        @update:value="handleMenu"
      />
      <div class="footer">
        <n-button text @click="handleThemeToggle" style="width: 100%; margin-bottom: 8px;">
          <template #icon><n-icon><MoonOutline v-if="!isDark" /><SunnyOutline v-else /></n-icon></template>
          {{ isDark ? '浅色模式' : '深色模式' }}
        </n-button>
        <n-button text @click="handleLogout" style="width: 100%;">
          <template #icon><n-icon><LogOutOutline /></n-icon></template>
          退出登录
        </n-button>
      </div>
    </n-layout-sider>
    <n-layout-content class="content">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import { LogOutOutline, MoonOutline, SunnyOutline } from '@vicons/ionicons5'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import type { MenuOption } from 'naive-ui'

interface Props {
  title: string
  subtitle: string
  menuOptions: MenuOption[]
  showDivider?: boolean
  rootIndent?: number
}

const props = withDefaults(defineProps<Props>(), {
  showDivider: true,
  rootIndent: 16
})

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

const activeKey = computed(() => {
  const p = route.path
  return props.menuOptions.find(m => p.startsWith(m.key as string))?.key ?? null
})

function handleMenu(key: string) { router.push(key) }

function handleThemeToggle() { themeStore.toggleTheme() }

async function handleLogout() {
  try { await api.post('/auth/logout') } catch { /* best-effort */ }
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.base-sider {
  border-right: 1px solid var(--n-color-border);
}
.base-sider:not(.dark) {
  background: var(--n-color-base) !important;
}
.base-sider.dark {
  background: #16161e !important;
  border-right-color: rgba(255,255,255,0.06) !important;
}
.logo { display: flex; align-items: center; gap: 12px; padding: 20px 20px 16px; }
.logo-icon { width: 26px; height: 26px; color: var(--n-color-text-3); flex-shrink: 0; }
.sider-divider {
  height: 1px; background: var(--n-color-divider); margin: 0 16px 8px;
}
.content {
  padding: 28px 32px;
  min-height: 100vh;
  background: var(--n-color-body);
}
.footer {
  position: absolute; bottom: 0; width: 100%;
  padding: 16px 20px; border-top: 1px solid var(--n-color-divider);
}
</style>