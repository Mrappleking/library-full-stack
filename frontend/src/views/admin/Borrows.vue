<template>
  <div>
    <n-h1 prefix="bar" style="margin-bottom: 20px;">
      <n-text type="primary">借阅管理</n-text>
    </n-h1>

    <div style="margin-bottom: 12px; display: flex; gap: 8px;">
      <n-button @click="exportCsv" :loading="exporting" secondary type="info">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage, NTag, NButton, NPopconfirm, NIcon } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'
import api from '@/api'
import type { DataTableColumn } from 'naive-ui'

const message = useMessage()
const records = ref<any[]>([])
const loading = ref(false)
const exporting = ref(false)

const statusMap: Record<string, { type: 'success' | 'warning' | 'error' | 'info' | 'default'; label: string }> = {
  active: { type: 'success', label: '在借' },
  returned: { type: 'default', label: '已还' },
  overdue: { type: 'error', label: '逾期' }
}

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
      const s = statusMap[row.status] || { type: 'default' as const, label: row.status }
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
      if (row.status !== 'active') return ''
      return h(NPopconfirm, { onPositiveClick: () => handleReturn(row.id) }, {
        trigger: () => h(NButton, { size: 'small' }, () => '还书'),
        default: () => {
          const isOverdue = new Date(row.dueDate) < new Date()
          if (isOverdue) return h('span', {}, [h('span', { style: 'color:#ef4444;' }, '⚠ 此借阅已逾期'), h('br'), '确认还书？将会自动计算逾期罚金。'])
          return '确认还书？'
        }
      })
    }
  }
]

async function fetchRecords() {
  loading.value = true
  try {
    const { data } = await api.get('/borrows')
    records.value = data.borrows || []
  } catch { /* ignore */ }
  loading.value = false
}

async function handleReturn(id: number) {
  try { await api.post(`/borrows/return/${id}`); message.success('已还书'); fetchRecords() }
  catch (e: unknown) { message.error((e as Error).message) }
}

async function exportCsv() {
  exporting.value = true
  try {
    const resp = await api.get('/borrows', { params: { export: 'csv' }, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'borrows-all.csv'; a.click()
    window.URL.revokeObjectURL(url)
    message.success('导出成功')
  } catch { message.error('导出失败') }
  exporting.value = false
}

onMounted(() => fetchRecords())
</script>
