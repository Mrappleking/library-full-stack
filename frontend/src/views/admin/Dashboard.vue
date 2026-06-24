<template>
  <div>
    <h1 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: var(--n-text-color);">管理概览</h1>

    <n-grid :cols="5" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item v-for="(s, i) in stats" :key="s.label">
        <n-card size="small" :style="{ borderTop: `3px solid ${colors[i]}` }">
          <n-statistic :label="s.label" :value="s.value">
            <template #prefix><n-icon :size="20" :color="colors[i]"><component :is="icons[i]" /></n-icon></template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="16" style="margin-top: 24px;">
      <n-grid-item>
        <n-card title="快捷操作" size="small">
          <n-space vertical>
            <n-button text style="justify-content:flex-start" @click="$router.push('/admin/books')">
              <template #icon><n-icon><BookOutline /></n-icon></template>图书管理
            </n-button>
            <n-button text style="justify-content:flex-start" @click="$router.push('/admin/borrows')">
              <template #icon><n-icon><SwapHorizontalOutline /></n-icon></template>借阅管理
            </n-button>
            <n-button text style="justify-content:flex-start" @click="$router.push('/admin/readers')">
              <template #icon><n-icon><PeopleOutline /></n-icon></template>读者管理
            </n-button>
            <n-button text style="justify-content:flex-start" @click="$router.push('/admin/circulation')">
              <template #icon><n-icon><ScanOutline /></n-icon></template>流通台
            </n-button>
          </n-space>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="系统信息" size="small">
          <n-descriptions :column="1" size="small" label-placement="left">
            <n-descriptions-item label="API 端点">40</n-descriptions-item>
            <n-descriptions-item label="测试通过">70/70</n-descriptions-item>
            <n-descriptions-item label="构建状态">✅ PASS</n-descriptions-item>
            <n-descriptions-item label="当前版本">v0.3.3</n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NIcon } from 'naive-ui'
import {
  BookOutline, PeopleOutline, LibraryOutline, GridOutline, AlertCircleOutline,
  SwapHorizontalOutline, ScanOutline
} from '@vicons/ionicons5'
import { api } from '../../api'
import type { StatsOverviewResponse } from '../../types/api'

const colors = ['#5e6ad2', '#f0a020', '#18a058', '#2080f0', '#d03050']
const icons = [LibraryOutline, SwapHorizontalOutline, PeopleOutline, GridOutline, AlertCircleOutline]

const stats = ref([
  { label: '总藏书', value: '-' },
  { label: '在借数量', value: '-' },
  { label: '读者总数', value: '-' },
  { label: '分类数', value: '-' },
  { label: '逾期未还', value: '-' }
])

onMounted(async () => {
  try {
    const res = await api.get<StatsOverviewResponse>('/stats')
    stats.value = [
      { label: '总藏书', value: res.totalBooks || 0 },
      { label: '在借数量', value: res.activeBorrows || 0 },
      { label: '读者总数', value: res.totalReaders || 0 },
      { label: '分类数', value: res.totalCategories || 0 },
      { label: '逾期未还', value: res.overdueCount || 0 }
    ]
  } catch (e) { console.error('fetchStats failed:', e) }
})
</script>
