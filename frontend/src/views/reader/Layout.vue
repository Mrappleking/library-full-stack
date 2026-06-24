<template>
  <n-layout has-sider style="display: flex; min-height: 100vh;">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :native-scrollbar="false">
      <div class="logo">
        <div class="logo-icon">📚</div>
        <div>
          <n-text tag="div" depth="1" style="font-size: 16px; font-weight: 600;">图书馆</n-text>
          <n-text tag="div" depth="3" style="font-size: 12px;">读者</n-text>
        </div>
      </div>

      <n-menu
        :value="activeKey"
        :options="menuOptions"
        :root-indent="20"
        :indent="12"
        @update:value="handleMenu"
      />

      <div class="footer">
        <n-button text @click="handleLogout" style="width: 100%; color: var(--n-text-color-3);">
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
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import { BookOutline, ClipboardOutline, PersonOutline, LogOutOutline } from '@vicons/ionicons5'
import { clearAuth } from '../../api'
import type { MenuOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()

const renderIcon = (icon: any) => () => h(NIcon, null, () => h(icon))

const menuOptions: MenuOption[] = [
  { label: '图书浏览', key: '/reader/books', icon: renderIcon(BookOutline) },
  { label: '我的借阅', key: '/reader/my-borrows', icon: renderIcon(ClipboardOutline) },
  { label: '个人信息', key: '/reader/profile', icon: renderIcon(PersonOutline) },
]

const activeKey = computed(() => {
  const p = route.path
  return menuOptions.find(m => p.startsWith(m.key as string))?.key ?? null
})

function handleMenu(key: string) { router.push(key) }
function handleLogout() { clearAuth(); router.push('/login') }
</script>

<style scoped>
.logo { display: flex; align-items: center; gap: 12px; padding: 18px 20px 14px; }
.logo-icon { font-size: 28px; line-height: 1; }
.content { padding: 28px 32px; min-height: 100vh; }
.footer { position: absolute; bottom: 0; width: 100%; padding: 16px 20px; border-top: 1px solid var(--n-border-color); }
</style>
