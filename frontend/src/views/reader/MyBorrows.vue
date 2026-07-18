<template>
  <div>
    <h1 class="page-title">我的借阅</h1>
    <div style="margin-bottom: 12px; display: flex; gap: 8px;">
      <n-button @click="exportCsv" :loading="exporting" secondary type="info" size="small">
        <template #icon><n-icon><download-outline /></n-icon></template>
        导出借阅历史 CSV
      </n-button>
    </div>
    <n-alert v-if="totalFines > 0" type="error" :bordered="false" style="margin-bottom: 20px; border-radius: 10px;">
      <template #header>
        <span style="font-size:15px;font-weight:600">欠费提醒</span>
      </template>
      <n-text depth="2">您有未缴罚款：</n-text>
      <n-text type="error" strong style="font-size:18px">¥{{ totalFines.toFixed(2) }}</n-text>
    </n-alert>
    <n-tabs type="line" animated default-value="borrows" style="margin-bottom: 16px;">
      <n-tab-pane name="borrows" tab="当前借阅">
        <n-data-table
          :columns="columns"
          :data="records"
          :loading="loading"
          :row-key="(r: any) => r.id"
        />
      </n-tab-pane>
      <n-tab-pane name="holds" tab="我的预约">
        <n-data-table
          :columns="holdColumns"
          :data="holds"
          size="small"
          :row-key="(r: any) => r.id"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage, NTag, NButton, NPopconfirm, NIcon } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { borrowApi, holdApi } from '@/api'
import type { DataTableColumn } from 'naive-ui'
import type { BorrowRecordResponse, HoldResponse } from '@/types/api'
import { BorrowStatus, HoldStatus } from '@/constants'
import { getBorrowStatusTag, getHoldStatusTag } from '@/utils/statusTag'

const message = useMessage()
const auth = useAuthStore()
const records = ref<BorrowRecordResponse[]>([])
const holds = ref<HoldResponse[]>([])
const loading = ref(false)
const exporting = ref(false)
const totalFines = ref(0)

const columns: DataTableColumn<BorrowRecordResponse>[] = [
  { title: '图书', key: 'book.title', ellipsis: { tooltip: true } },
  { title: '作者', key: 'book.author', width: 100 },
  { title: '借阅日', key: 'borrowDate', width: 110, render: (r) => new Date(r.borrowDate).toLocaleDateString('zh-CN') },
  { title: '到期日', key: 'dueDate', width: 110, render: (r) => new Date(r.dueDate).toLocaleDateString('zh-CN') },
  {
    title: '状态', key: 'status', width: 80,
    render(row) {
      const s = getBorrowStatusTag(row.status)
      return h(NTag, { type: s.type, size: 'small' }, () => s.label)
    }
  },
  {
    title: '操作', key: 'actions', width: 100,
    render(row) {
      if (row.status !== BorrowStatus.ACTIVE && row.status !== BorrowStatus.OVERDUE) return ''
      return h('div', { style: 'display:flex;gap:6px' }, [
        h(NPopconfirm, { positiveText: '确定', negativeText: '取消', onPositiveClick: () => handleReturn(row.id) }, {
          trigger: () => h(NButton, { size: 'tiny', type: 'warning' }, () => '还书'),
          default: () => '确认还书？'
        }),
        row.status === BorrowStatus.ACTIVE && h(NButton, { size: 'tiny', onClick: () => handleRenew(row.id) }, () => '续借')
      ])
    }
  }
]

const holdColumns: DataTableColumn<HoldResponse>[] = [
  { title: '图书', key: 'book.title', ellipsis: { tooltip: true } },
  { title: '申请时间', key: 'requestDate', width: 160, render: (r) => new Date(r.requestDate).toLocaleString('zh-CN') },
  {
    title: '状态', key: 'status', width: 100,
    render(row) {
      const s = getHoldStatusTag(row.status)
      return h(NTag, { type: s.type, size: 'small' }, () => s.label)
    }
  },
  {
    title: '操作', key: 'actions', width: 80,
    render(row) {
      if (row.status !== HoldStatus.PENDING) return ''
      return h(NPopconfirm, { positiveText: '确定', negativeText: '取消', onPositiveClick: () => handleCancelHold(row.id) }, {
        trigger: () => h(NButton, { size: 'tiny', type: 'error' }, () => '取消'),
        default: () => '确认取消预约？'
      })
    }
  }
]

async function fetchData() {
  loading.value = true
  try {
    const [bRes, hRes] = await Promise.allSettled([
      borrowApi.getMyBorrows(),
      holdApi.getMyHolds()
    ])
    if (bRes.status === 'fulfilled') {
      records.value = bRes.value.borrows || []
    }
    if (hRes.status === 'fulfilled') {
      holds.value = hRes.value || []
    }
    totalFines.value = auth.user?.totalFines || 0
  } catch (e: unknown) {
    message.error((e as Error).message || '获取借阅记录失败')
    records.value = []
    holds.value = []
  }
  loading.value = false
}

async function handleReturn(id: number) {
  try { await borrowApi.returnBook(id); message.success('已还书'); fetchData() }
  catch (e: unknown) { message.error((e as Error).message) }
}

async function handleRenew(id: number) {
  try { await borrowApi.renew(id); message.success('已续借'); fetchData() }
  catch (e: unknown) { message.error((e as Error).message) }
}

async function handleCancelHold(id: number) {
  try { await holdApi.cancel(id); message.success('已取消预约'); fetchData() }
  catch (e: unknown) { message.error((e as Error).message) }
}

async function exportCsv() {
  exporting.value = true
  try {
    const resp = await borrowApi.getHistoryCsv()
    const url = window.URL.createObjectURL(new Blob([resp], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'borrows-my.csv'; a.click()
    window.URL.revokeObjectURL(url)
    message.success('导出成功')
  } catch { message.error('导出失败') }
  exporting.value = false
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 600; margin: 0 0 20px; }
</style>
