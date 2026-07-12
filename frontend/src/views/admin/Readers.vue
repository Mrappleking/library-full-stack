<template>
  <div>
    <n-h1 prefix="bar" style="margin-bottom: 20px;"><n-text type="primary">读者管理</n-text></n-h1>

    <!-- Search Bar -->
    <n-space style="margin-bottom: 16px;" align="center">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索用户名、姓名、手机号"
        clearable
        style="width: 280px;"
        @keyup.enter="doSearch"
      />
      <n-select
        v-model:value="searchCategory"
        :options="categoryOptions"
        placeholder="读者类型"
        clearable
        style="width: 160px;"
      />
      <n-button type="primary" @click="doSearch">搜索</n-button>
      <n-button @click="resetSearch">重置</n-button>
    </n-space>

    <n-data-table
      :columns="columns"
      :data="readers"
      :loading="loading"
      :row-key="(r: any) => r.id"
      :expanded-row-keys="expandedKeys"
      @update:expanded-row-keys="onExpand"
      :pagination="pagination"
      @update:page="onPageChange"
      @update:page-size="onPageSizeChange"
      @update:sorter="handleSorterChange"
      :bordered="true"
    />

    <n-modal v-model:show="showModal" title="编辑读者" preset="card" style="width: 420px;">
      <n-form :model="form">
        <n-form-item label="姓名"><n-input v-model:value="form.name" /></n-form-item>
        <n-form-item label="手机号"><n-input v-model:value="form.phone" /></n-form-item>
        <n-form-item label="邮箱"><n-input v-model:value="form.email" /></n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useMessage, NButton, NTag, useDialog, type DataTableColumn } from 'naive-ui'
import { readerApi } from '@/api'
import type { ReaderResponse } from '@/types/api'

const message = useMessage()
const dialog = useDialog()
const readers = ref<ReaderResponse[]>([])
const loading = ref(false)
const expandedKeys = ref<number[]>([])

const searchKeyword = ref('')
const searchCategory = ref<number | null>(null)
const categoryOptions = ref<Array<{ label: string; value: number }>>([])
const categoryMap = ref<Record<number, string>>({})

const sortBy = ref('createdAt')
const sortDir = ref('desc')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [5, 10, 20, 50],
  itemCount: 0,
  prefix: (info: any) => `共 ${info.itemCount} 条`
})

const columns = computed<DataTableColumn[]>(() => [
  { type: 'expand' as any, renderExpand: (row: any) => h(ExpandPanel, { readerId: row.id }) },
  {
    title: '用户名', key: 'username', width: 120,
    sorter: true,
    sortOrder: sortBy.value === 'username' ? (sortDir.value === 'asc' ? 'ascend' : 'descend') : false
  },
  {
    title: '姓名', key: 'name', width: 100,
    sorter: true,
    sortOrder: sortBy.value === 'name' ? (sortDir.value === 'asc' ? 'ascend' : 'descend') : false
  },
  { title: '手机', key: 'phone', width: 130 },
  { title: '邮箱', key: 'email', ellipsis: { tooltip: true } },
  {
    title: '读者类型', key: 'patronCategoryId', width: 90,
    render: (r: any) => r.patronCategoryId ? (categoryMap.value[r.patronCategoryId] || `类型#${r.patronCategoryId}`) : '-',
    sorter: true,
    sortOrder: sortBy.value === 'patronCategoryId' ? (sortDir.value === 'asc' ? 'ascend' : 'descend') : false
  },
  {
    title: '注册时间', key: 'createdAt', width: 100,
    render: (r: any) => new Date(r.createdAt).toLocaleDateString('zh-CN'),
    sorter: true,
    sortOrder: sortBy.value === 'createdAt' ? (sortDir.value === 'asc' ? 'ascend' : 'descend') : false
  },
  {
    title: '操作', key: 'actions', width: 240,
    render(row: any) {
      return h('span', { style: 'display:flex;gap:6px;' }, [
        h(NButton, { size: 'small', onClick: () => openEdit(row) }, () => '编辑'),
        h(NButton, { size: 'small', onClick: () => handleResetPassword(row) }, () => '重置密码'),
        h(NButton, { size: 'small', type: 'error', onClick: () => handleAdminDelete(row) }, () => '强制删除')
      ])
    }
  }
])

async function fetchReaders() {
  loading.value = true
  try {
    const res = await readerApi.getAllReaders({
      page: pagination.page,
      limit: pagination.pageSize
    })
    readers.value = res.readers || []
    pagination.itemCount = res.total || 0
  } catch { /* ignore */ }
  loading.value = false
}

function doSearch() {
  pagination.page = 1
  fetchReaders()
}

function resetSearch() {
  searchKeyword.value = ''
  searchCategory.value = null
  pagination.page = 1
  fetchReaders()
}

function onPageChange(page: number) {
  pagination.page = page
  fetchReaders()
}

function onPageSizeChange(size: number) {
  pagination.pageSize = size
  pagination.page = 1
  fetchReaders()
}

function handleSorterChange(sorter: { columnKey: string; order: string } | null) {
  if (sorter && sorter.order) {
    sortBy.value = sorter.columnKey
    sortDir.value = sorter.order === 'ascend' ? 'asc' : 'desc'
  } else {
    sortBy.value = 'createdAt'
    sortDir.value = 'desc'
  }
  pagination.page = 1
  fetchReaders()
}

import api from '@/api'
async function loadCategories() {
  try {
    const data = await api.get('/rules/patron-categories')
    categoryOptions.value = data.map((c: any) => ({ label: c.name, value: c.id }))
    const map: Record<number, string> = {}
    data.forEach((c: any) => { map[c.id] = c.name })
    categoryMap.value = map
  } catch { /* ignore */ }
}

function onExpand(keys: number[]) { expandedKeys.value = keys }

const showModal = ref(false)
const saving = ref(false)
const form = reactive<{ id: number | null; name: string; phone: string; email: string }>({ id: null, name: '', phone: '', email: '' })

function openEdit(row: any) {
  Object.assign(form, { id: row.id, name: row.name, phone: row.phone, email: row.email })
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    await readerApi.update(form.id!, { name: form.name, phone: form.phone, email: form.email })
    message.success('已更新')
    showModal.value = false
    fetchReaders()
  } catch (e: unknown) { message.error((e as Error).message) }
  saving.value = false
}

function handleResetPassword(row: any) {
  dialog.warning({
    title: '确认重置密码',
    content: `确定要将用户「${row.name}」(${row.username}) 的密码重置为默认密码 "reader123" 吗？`,
    positiveText: '确定重置',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.put(`/readers/${row.id}/reset-password`)
        message.success(`已重置用户「${row.name}」的密码`)
      } catch (e: unknown) { message.error((e as Error).message) }
    }
  })
}

async function handleAdminDelete(row: any) {
  dialog.warning({
    title: '确认强制删除',
    content: `确定要永久删除用户「${row.name}」(${row.username}) 吗？此操作不可撤销。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.post(`/auth/admin/delete-user/${row.id}`)
        message.success(`已删除用户「${row.name}」`)
        fetchReaders()
      } catch (e: unknown) { message.error((e as Error).message) }
    }
  })
}

const ExpandPanel = {
  props: { readerId: Number },
  setup(props: any) {
    const records = ref<any[]>([])
    const load = async () => {
      try {
        const data = await readerApi.getById(props.readerId)
        records.value = data.borrowRecords || []
      } catch { /* ignore */ }
    }
    onMounted(() => { load() })
    return () => records.value.length === 0
      ? h('div', { style: 'padding:12px;color:#8a8f98;' }, '暂无借阅记录')
      : h('div', { style: 'padding:8px 0;' },
          records.value.map((r: any) =>
            h('div', { style: 'display:flex;gap:16px;padding:6px 12px;font-size:13px;color:#d0d6e0;' }, [
              h('span', r.book?.title || '未知'),
              h('span', { style: 'color:#8a8f98;' }, new Date(r.borrowDate).toLocaleDateString('zh-CN')),
              h(NTag, { size: 'tiny', type: r.status === 'active' ? 'success' : 'default' }, () => r.status === 'active' ? '在借' : '已还')
            ])
          )
        )
  }
}

onMounted(() => {
  loadCategories()
  fetchReaders()
})
</script>
