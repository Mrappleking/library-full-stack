<template>
  <BaseLayout title="图书馆" subtitle="READER" :menu-options="menuOptions" :root-indent="20" />
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NIcon } from 'naive-ui'
import { BookOutline, ClipboardOutline, PersonOutline } from '@vicons/ionicons5'
import BaseLayout from '@/components/BaseLayout.vue'
import type { MenuOption } from 'naive-ui'

const renderIcon = (icon: any) => () => h(NIcon, null, () => h(icon))

const menuOptions: MenuOption[] = [
  { label: '图书浏览', key: '/reader/books', icon: renderIcon(BookOutline) },
  { label: '我的借阅', key: '/reader/my-borrows', icon: renderIcon(ClipboardOutline) },
  { label: '个人信息', key: '/reader/profile', icon: renderIcon(PersonOutline) },
]
</script>
