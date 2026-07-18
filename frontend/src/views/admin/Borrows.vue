<template>
  <div>
    <n-h1 prefix="bar" style="margin-bottom: 20px;">
      <n-text type="primary">借阅管理</n-text>
    </n-h1>

    <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
      <n-input v-model:value="searchQuery" placeholder="搜索读者名/用户名/书名" clearable style="width: 260px;" @keyup.enter="fetchRecords">
        <template #prefix><n-icon><search-outline /></n-icon></template>
      </n-input>
      <n-select v-model:value="filterCategory" :options="categoryOptions" placeholder="全部分类" clearable style="width: 140px;" @update:value="fetchRecords" />
      <n-select v-model:value="filterStatus" :options="statusOptions" placeholder="全部状态" clearable style="width: 120px;" @update:value="fetchRecords" />
      <n-button @click="fetchRecords" secondary>搜索</n-button>
      <n-button @click="resetFilters" secondary type="warning">重置</n-button>
      <n-button @click="exportCsv" :loading="exporting" secondary type="info" style="margin-left: auto;">
        <template #icon><n-icon><download-outline /></n-icon></template>
        导出 CSV
      </n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="records"
      :loading="loading"
      :row-key="(r: any) => r.id"
    />
    <n-pagination
      v-if="total > 0"
      v-model:page="page"
      :page-count="totalPages"
      :page-size="20"
      style="justify-content: center; margin-top: 16px;"
      @update:page="fetchRecords"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage, NTag, NButton, NPopconfirm, NIcon } from 'naive-ui'
import { DownloadOutline, SearchOutline } from '@vicons/ionicons5'
import { borrowApi, categoryApi } from '@/api'
import type { BorrowRecordResponse, CategoryResponse } from '@/types/api'
import type { DataTableColumn } from 'naive-ui'
import { BorrowStatus } from '@/constants'
import { getBorrowStatusTag } from '@/utils/statusTag'

const message = useMessage()
const records = ref<BorrowRecordResponse[]>([])
const loading = ref(false)
const exporting = ref(false)
const page = ref(1)
const total = ref(0)
const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref<number | null>(null)
const categories = ref<CategoryResponse[]>([])

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / 20)))

const categoryOptions = computed(() => [
  { label: '全部分类', value: null },
  ...categories.value.map(c => ({ label: c.name, value: c.id }))
])

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '在借', value: BorrowStatus.ACTIVE },
  { label: '已还', value: BorrowStatus.RETURNED },
  { label: '逾期', value: BorrowStatus.OVERDUE }
]

const columns: DataTableColumn[] = [
  { title: '读者', key: 'user.name', width: 100 },
  { title: '书名', key: 'book.title', ellipsis: { tooltip: true } },
  { title: '条码', key: 'bookItem.barcode', width: 130, render: (r: any) => r.bookItem?.barcode || '-' },
  { title: '借阅日', key: 'borrowDate', width: 110, render: (r: any) => new Date(r.borrowDate).toLocaleDateString('zh-CN') },
  { title: '到期日', key: 'dueDate', width: 110, render: (r: any) => new Date(r.dueDate).toLocaleDateString('zh-CN') },
  { title: '归还日', key: 'returnDate', width: 110, render: (r: any) => r.returnDate ? new Date(r.returnDate).toLocaleDateString('zh-CN') : '-' },
  {
    title: '状态', key: 'status', width: 70,
    render(row: any) {
      const s = getBorrowStatusTag(row.status)
      return h(NTag, { type: s.type, size: 'small' }, () => s.label)
    }
  },
  {
    title: '罚款', key: 'fines', width: 90,
    render(row: any) {
      if (!row.fines || row.fines.length === 0) return ''
      const total = row.fines.reduce((sum: number, f: any) => sum + (f.paid ? 0 : f.amount), 0)
      return h(NTag, { type: 'error', size: 'small' }, () => `¥${total}`)
    }
  },
  {
    title: '操作', key: 'actions', width: 80,
    render(row: any) {
      if (row.status !== BorrowStatus.ACTIVE) return ''
      return h(NPopconfirm, { positiveText: '确定', negativeText: '取消', onPositiveClick: () => handleReturn(row.id) }, {
        trigger: () => h(NButton, { size: 'small' }, () => '还书'),
        default: () => {
          const isOverdue = new Date(row.dueDate) < new Date()
          if (isOverdue) return '⚠ 此借阅已逾期\n确认还书？将会自动计算逾期罚金。'
          return '确认还书？'
        }
      })
    }
  }
]

async function fetchRecords() {
  loading.value = true
  try {
    const res = await borrowApi.getAllBorrows({ 
      page: page.value, 
      limit: 20,
      search: searchQuery.value || undefined,
      status: filterStatus.value || undefined,
      categoryId: filterCategory.value || undefined
    })
    records.value = res.borrows || []
    total.value = res.total || 0
  } catch (e: unknown) {
    message.error((e as Error).message || '获取借阅记录失败')
    records.value = []
  }
  loading.value = false
}

function resetFilters() {
  searchQuery.value = ''
  filterStatus.value = ''
  filterCategory.value = null
  page.value = 1
  fetchRecords()
}

async function handleReturn(id: number) {
  try { await borrowApi.returnBook(id); message.success('已还书'); fetchRecords() }
  catch (e: unknown) { message.error((e as Error).message) }
}

async function exportCsv() {
  exporting.value = true
  try {
    const resp = await borrowApi.getAllBorrowsCsv()
    const url = window.URL.createObjectURL(new Blob([resp], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'borrows-all.csv'; a.click()
    window.URL.revokeObjectURL(url)
    message.success('导出成功')
  } catch { message.error('导出失败') }
  exporting.value = false
}

async function loadCategories() {
  try {
    const res = await categoryApi.getAll()
    categories.value = res || []
  } catch {
    categories.value = []
  }
}

onMounted(async () => {
  await loadCategories()
  fetchRecords()
})
</script>
