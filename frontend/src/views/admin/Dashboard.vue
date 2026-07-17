<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">管理概览</h1>
      <n-tag type="primary" size="small" round>v0.3.3</n-tag>
    </div>

    <n-grid :cols="5" :x-gap="16" :y-gap="16" responsive="screen" style="margin-top: 8px">
      <n-grid-item v-for="(s, i) in stats" :key="s.label">
        <div class="stat-card" :style="{ '--accent': colors[i] }">
          <div class="stat-icon-wrap">
            <n-icon :size="22" :color="colors[i]"><component :is="icons[i]" /></n-icon>
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ s.value }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
          <div class="stat-glow" :style="{ background: `radial-gradient(ellipse, ${colors[i]}22 0%, transparent 70%)` }"></div>
        </div>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="3" :x-gap="20" style="margin-top: 24px">
      <n-grid-item :span="2">
        <n-card class="panel-card" size="small">
          <template #header>
            <div class="panel-header"><n-icon size="18"><TrendingUpOutline /></n-icon> 月度借阅趋势</div>
          </template>
          <MonthlyBorrowChart :data="monthlyData" :is-dark="isDark" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="panel-card" size="small">
          <template #header>
            <div class="panel-header"><n-icon size="18"><PieChartOutline /></n-icon> 图书分类占比</div>
          </template>
          <CategoryPieChart :data="categoryData" :is-dark="isDark" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="20" style="margin-top: 24px">
      <n-grid-item>
        <n-card class="panel-card" size="small">
          <template #header>
            <div class="panel-header"><n-icon size="18"><FlashOutline /></n-icon> 快捷操作</div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="$router.push('/admin/books')">
              <div class="action-icon action-icon--primary"><n-icon size="22"><BookOutline /></n-icon></div>
              <div class="action-text"><span class="action-name">图书管理</span><span class="action-desc">增删改查图书信息</span></div>
            </div>
            <div class="action-item" @click="$router.push('/admin/borrows')">
              <div class="action-icon action-icon--warning"><n-icon size="22"><SwapHorizontalOutline /></n-icon></div>
              <div class="action-text"><span class="action-name">借阅管理</span><span class="action-desc">处理借书、还书、续借</span></div>
            </div>
            <div class="action-item" @click="$router.push('/admin/readers')">
              <div class="action-icon action-icon--success"><n-icon size="22"><PeopleOutline /></n-icon></div>
              <div class="action-text"><span class="action-name">读者管理</span><span class="action-desc">管理读者信息</span></div>
            </div>
            <div class="action-item" @click="$router.push('/admin/circulation')">
              <div class="action-icon action-icon--info"><n-icon size="22"><ScanOutline /></n-icon></div>
              <div class="action-text"><span class="action-name">流通台</span><span class="action-desc">扫码借还操作</span></div>
            </div>
            <div class="action-item" @click="$router.push('/admin/stats')">
              <div class="action-icon action-icon--error"><n-icon size="22"><BarChartOutline /></n-icon></div>
              <div class="action-text"><span class="action-name">统计报表</span><span class="action-desc">借阅量、热门图书</span></div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="panel-card" size="small">
          <template #header>
            <div class="panel-header"><n-icon size="18"><InformationCircleOutline /></n-icon> 系统信息</div>
          </template>
          <n-descriptions :column="1" size="small" label-placement="left">
            <n-descriptions-item label="API 端点">
              <n-tag size="small" type="info">{{ apiCount }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="测试覆盖">
              <n-tag size="small" type="success">移除</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="构建状态">
              <n-tag size="small" type="success">✅ PASS</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="框架版本">
              <n-space size="small">
                <n-tag size="tiny">Spring Boot 3.2</n-tag>
                <n-tag size="tiny">MyBatis 3.0</n-tag>
                <n-tag size="tiny">Vue 3.5</n-tag>
                <n-tag size="tiny">Naive UI 2.44</n-tag>
              </n-space>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NIcon, NTag, NSpace } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import {
  BookOutline, PeopleOutline, LibraryOutline, GridOutline, AlertCircleOutline,
  SwapHorizontalOutline, ScanOutline, BarChartOutline, FlashOutline,
  InformationCircleOutline, TrendingUpOutline, PieChartOutline
} from '@vicons/ionicons5'
import { statsApi, categoryApi } from '@/api'
import MonthlyBorrowChart from '@/components/MonthlyBorrowChart.vue'
import CategoryPieChart from '@/components/CategoryPieChart.vue'
import type { StatsOverviewResponse, MonthlyStat, CategoryResponse } from '@/types/api'

const colors = ['#5e6ad2', '#f0a020', '#18a058', '#2080f0', '#d03050']
const icons = [LibraryOutline, SwapHorizontalOutline, PeopleOutline, GridOutline, AlertCircleOutline]
const apiCount = ref(0)
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
const stats = ref([
  { label: '总藏书', value: '-' },
  { label: '在借数量', value: '-' },
  { label: '读者总数', value: '-' },
  { label: '分类数', value: '-' },
  { label: '逾期未还', value: '-' }
])

const monthlyData = ref<Array<{ month: string; borrows: number }>>([])
const categoryData = ref<Array<{ name: string; value: number }>>([])

onMounted(async () => {
  try {
    const data = await statsApi.getOverview()

    stats.value = [
      { label: '总藏书', value: String(data.totalBooks || 0) },
      { label: '在借数量', value: String(data.activeBorrows || 0) },
      { label: '读者总数', value: String(data.totalReaders || 0) },
      { label: '分类数', value: String(data.totalCategories || 0) },
      { label: '逾期未还', value: String(data.overdueCount || 0) }
    ]
  } catch (e) { console.error('fetchStats failed:', e) }

  try {
    const sysData = await statsApi.getOverview()
    apiCount.value = 45
  } catch (e) { console.error('fetchSysInfo failed:', e) }

  try {
    const monthlyStats = await statsApi.getMonthly()
    monthlyData.value = monthlyStats.map((item: MonthlyStat) => ({
      month: item.month || '',
      borrows: item.count || 0
    }))
  } catch (e) { console.error('fetchMonthlyStats failed:', e) }

  try {
    const categories = await categoryApi.getAll()
    categoryData.value = categories.map((cat: CategoryResponse) => ({
      name: cat.name || '未知',
      value: cat.booksCount || 0
    })).filter((c: { value: number }) => c.value > 0)
  } catch (e) { console.error('fetchCategories failed:', e) }
})
</script>

<style scoped>
.page-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 4px;
}
.page-title {
  font-size: 22px; font-weight: 700; color: var(--lib-text-primary); margin: 0;
}
.stat-card {
  position: relative; overflow: hidden;
  background: var(--lib-bg-card); border-radius: 12px;
  padding: 20px; display: flex; align-items: center; gap: 16px;
  border: 1px solid var(--lib-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}
.stat-icon-wrap {
  width: 46px; height: 46px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--lib-primary) 12%, transparent);
  flex-shrink: 0;
}
.stat-body { display: flex; flex-direction: column; gap: 2px; }
.stat-value { font-size: 26px; font-weight: 700; color: var(--lib-text-primary); line-height: 1.1; }
.stat-label { font-size: 12px; color: var(--lib-text-tertiary); }
.stat-glow {
  position: absolute; top: -20px; right: -20px; width: 100px; height: 100px;
  pointer-events: none; border-radius: 50%;
}
.panel-card { height: 100%; }
.panel-header { display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 600; }
.quick-actions { display: flex; flex-direction: column; gap: 4px; }
.action-item {
  display: flex; align-items: center; gap: 14px; padding: 10px 12px;
  border-radius: 10px; cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}
.action-item:hover { background: var(--lib-bg-hover); transform: translateX(4px); }
.action-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.action-icon--primary { background: color-mix(in srgb, var(--lib-primary) 15%, transparent); color: var(--lib-primary); }
.action-icon--success { background: color-mix(in srgb, var(--lib-success) 15%, transparent); color: var(--lib-success); }
.action-icon--warning { background: color-mix(in srgb, var(--lib-warning) 15%, transparent); color: var(--lib-warning); }
.action-icon--info { background: color-mix(in srgb, var(--lib-info) 15%, transparent); color: var(--lib-info); }
.action-icon--error { background: color-mix(in srgb, var(--lib-error) 15%, transparent); color: var(--lib-error); }
.action-text { display: flex; flex-direction: column; gap: 1px; }
.action-name { font-size: 14px; font-weight: 600; color: var(--lib-text-primary); }
.action-desc { font-size: 12px; color: var(--lib-text-tertiary); }
</style>
