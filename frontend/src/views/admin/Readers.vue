<template>
  <div>
    <n-h1 prefix="bar" style="margin-bottom: 20px;"><n-text type="primary">读者管理</n-text></n-h1>

    <n-data-table
      :columns="columns"
      :data="readers"
      :loading="loading"
      :row-key="(r: any) => r.id"
      :expanded-row-keys="expandedKeys"
      @update:expanded-row-keys="onExpand"
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
import { ref, reactive, onMounted, h } from 'vue'
import { useMessage, NButton, NTag, useDialog } from 'naive-ui'
import api from '@/api'
import type { DataTableColumn } from 'naive-ui'

const message = useMessage()
const dialog = useDialog()
const readers = ref<any[]>([])
const loading = ref(false)
const expandedKeys = ref<number[]>([])

const columns: DataTableColumn[] = [
  { type: 'expand' as any, renderExpand: (row: any) => h(ExpandPanel, { readerId: row.id }) },
  { title: '用户名', key: 'username', width: 120 },
  { title: '姓名', key: 'name', width: 100 },
  { title: '手机', key: 'phone', width: 130 },
  { title: '邮箱', key: 'email', ellipsis: { tooltip: true } },
  { title: '注册时间', key: 'createdAt', width: 160, render: (r: any) => new Date(r.createdAt).toLocaleDateString('zh-CN') },
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
]

async function fetchReaders() {
  loading.value = true
  try {
    const { data } = await api.get('/readers')
    readers.value = data || []
  } catch { /* ignore */ }
  loading.value = false
}

function onExpand(keys: number[]) { expandedKeys.value = keys }

const showModal = ref(false)
const saving = ref(false)
const form = reactive<{ id: number | null; name: string; phone: string; email: string }>({ id: null, name: '', phone: '', email: '' })

function openEdit(row: any) { Object.assign(form, { id: row.id, name: row.name, phone: row.phone, email: row.email }); showModal.value = true }

async function handleSave() {
  saving.value = true
  try {
    await api.put(`/readers/${form.id}`, { name: form.name, phone: form.phone, email: form.email })
    message.success('已更新')
    showModal.value = false; fetchReaders()
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
        const { data } = await api.get(`/readers/${props.readerId}`)
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

onMounted(() => fetchReaders())
</script>
