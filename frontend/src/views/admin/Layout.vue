<template>
  <BaseLayout title="图书馆管理" subtitle="ADMIN" :menu-options="menuOptions" />
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NIcon } from 'naive-ui'
import {
  GridOutline, BookOutline, PricetagsOutline, PeopleOutline,
  SwapHorizontalOutline, CashOutline, BarChartOutline, SettingsOutline,
  CameraOutline
} from '@vicons/ionicons5'
import BaseLayout from '@/components/BaseLayout.vue'
import type { MenuOption } from 'naive-ui'

const renderIcon = (icon: any) => () => h(NIcon, null, () => h(icon))

const menuOptions: MenuOption[] = [
  { label: '概览', key: '/admin/dashboard', icon: renderIcon(GridOutline) },
  { label: '图书管理', key: '/admin/books', icon: renderIcon(BookOutline) },
  { label: '分类管理', key: '/admin/categories', icon: renderIcon(PricetagsOutline) },
  { label: '读者管理', key: '/admin/readers', icon: renderIcon(PeopleOutline) },
  { label: '借阅管理', key: '/admin/borrows', icon: renderIcon(SwapHorizontalOutline) },
  { label: '罚款管理', key: '/admin/fines', icon: renderIcon(CashOutline) },
  { label: '统计报表', key: '/admin/stats', icon: renderIcon(BarChartOutline) },
  { label: '流通台', key: '/admin/circulation', icon: renderIcon(CameraOutline) },
  { label: '系统设置', key: '/admin/settings', icon: renderIcon(SettingsOutline) },
]
</script>
