<template>
  <div>
    <n-h1 prefix="bar" style="margin-bottom: 20px;"><n-text type="primary">系统设置</n-text></n-h1>

    <n-space vertical :size="24">
      <!-- 借阅规则 -->
      <n-card title="借阅规则">
        <n-data-table
          :columns="ruleColumns"
          :data="rules"
          :loading="loading"
          size="small"
          :row-key="(r: any) => r.id"
        />
      </n-card>

      <!-- 编辑规则弹窗 -->
      <n-modal v-model:show="showRuleModal" title="编辑借阅规则" preset="card" style="width: 500px;" :mask-closable="false">
        <n-form ref="ruleFormRef" :model="ruleForm" label-placement="left" label-width="100px">
          <n-form-item label="读者类型"><n-input :value="ruleForm.patronCategory?.name" disabled /></n-form-item>
          <n-form-item label="资料类型"><n-input :value="ruleForm.itemType?.name" disabled /></n-form-item>
          <n-form-item path="maxBorrows" label="借阅上限">
            <n-input-number v-model:value="ruleForm.maxBorrows" :min="1" :max="50" style="width:100%" />
          </n-form-item>
          <n-form-item path="loanDays" label="借阅天数">
            <n-input-number v-model:value="ruleForm.loanDays" :min="1" :max="365" style="width:100%" />
          </n-form-item>
          <n-form-item path="renewals" label="续借次数">
            <n-input-number v-model:value="ruleForm.renewals" :min="0" :max="10" style="width:100%" />
          </n-form-item>
          <n-form-item path="renewalDays" label="续借天数">
            <n-input-number v-model:value="ruleForm.renewalDays" :min="0" :max="365" style="width:100%" />
          </n-form-item>
          <n-form-item path="finePerDay" label="日罚金(¥)">
            <n-input-number v-model:value="ruleForm.finePerDay" :min="0" :max="999" :step="0.1" style="width:100%" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showRuleModal = false" quaternary>取消</n-button>
            <n-button type="primary" :loading="savingRule" @click="handleRuleSave">保存</n-button>
          </n-space>
        </template>
      </n-modal>

      <!-- 编辑读者类型弹窗 -->
      <n-modal v-model:show="showPatronModal" :title="patronForm.id ? '编辑读者类型' : '添加读者类型'" preset="card" style="width: 400px;" :mask-closable="false">
        <n-form :model="patronForm">
          <n-form-item label="名称" path="name">
            <n-input v-model:value="patronForm.name" placeholder="请输入读者类型名称" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showPatronModal = false" quaternary>取消</n-button>
            <n-button type="primary" :loading="savingPatron" @click="handlePatronSave">保存</n-button>
          </n-space>
        </template>
      </n-modal>

      <n-card title="读者类型">
        <template #header-extra>
          <n-button size="small" type="primary" @click="openPatronEdit()">添加</n-button>
        </template>
        <n-data-table
          :columns="patronColumns"
          :data="patronCategories"
          size="small"
          :row-key="(r: any) => r.id"
        />
      </n-card>

      <n-card title="资料类型">
        <n-data-table
          :columns="itemTypeColumns"
          :data="itemTypes"
          size="small"
          :row-key="(r: any) => r.id"
        />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage, NButton, useDialog } from 'naive-ui'
import type { DataTableColumn, FormInst } from 'naive-ui'
import type { CirculationRuleResponse, PatronCategoryResponse, ItemTypeResponse } from '@/types/api'

const message = useMessage()
const rules = ref<CirculationRuleResponse[]>([])
const patronCategories = ref<PatronCategoryResponse[]>([])
const itemTypes = ref<ItemTypeResponse[]>([])
const loading = ref(false)

const showRuleModal = ref(false)
const savingRule = ref(false)
const ruleFormRef = ref<FormInst | null>(null)
const ruleForm = ref<any>({
  id: null,
  patronCategory: null,
  itemType: null,
  maxBorrows: 5,
  loanDays: 30,
  renewals: 0,
  renewalDays: 0,
  finePerDay: 0
})

const showPatronModal = ref(false)
const savingPatron = ref(false)
const patronForm = ref<any>({
  id: null,
  name: ''
})

function openRuleEdit(row: any) {
  ruleForm.value = { ...row }
  showRuleModal.value = true
}

import api from '@/api'
async function handleRuleSave() {
  savingRule.value = true
  try {
    await api.put('/rules', {
      patronCategoryId: ruleForm.value.patronCategory?.id ?? ruleForm.value.patronCategoryId,
      itemTypeId: ruleForm.value.itemType?.id ?? ruleForm.value.itemTypeId,
      maxBorrows: ruleForm.value.maxBorrows,
      loanDays: ruleForm.value.loanDays,
      renewals: ruleForm.value.renewals,
      renewalDays: ruleForm.value.renewalDays,
      finePerDay: ruleForm.value.finePerDay
    })
    message.success('规则已更新')
    showRuleModal.value = false
    rules.value = (await api.get('/rules')) || []
  } catch (e: unknown) { message.error((e as Error).message) }
  savingRule.value = false
}

function openPatronEdit(row?: any) {
  patronForm.value = row ? { id: row.id, name: row.name } : { id: null, name: '' }
  showPatronModal.value = true
}

async function handlePatronSave() {
  savingPatron.value = true
  try {
    if (patronForm.value.id) {
      await api.put(`/rules/patron-categories/${patronForm.value.id}`, { name: patronForm.value.name })
      message.success('读者类型已更新')
    } else {
      await api.post('/rules/patron-categories', { name: patronForm.value.name })
      message.success('读者类型已添加')
    }
    showPatronModal.value = false
    patronCategories.value = (await api.get('/rules/patron-categories')) || []
  } catch (e: unknown) { message.error((e as Error).message) }
  savingPatron.value = false
}

const dialog = useDialog()

function handlePatronDelete(row: any) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除读者类型「${row.name}」吗？`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.delete(`/rules/patron-categories/${row.id}`)
        message.success('读者类型已删除')
        patronCategories.value = (await api.get('/rules/patron-categories')) || []
      } catch (e: unknown) { message.error((e as Error).message) }
    }
  })
}

const ruleColumns: DataTableColumn[] = [
  { title: '读者类型', key: 'patronCategory.name', width: 120 },
  { title: '资料类型', key: 'itemType.name', width: 120 },
  { title: '借阅上限', key: 'maxBorrows', width: 80 },
  { title: '借阅天数', key: 'loanDays', width: 80 },
  { title: '续借次数', key: 'renewals', width: 80 },
  { title: '续借天数', key: 'renewalDays', width: 80 },
  { title: '日罚金', key: 'finePerDay', width: 80, render: (r: any) => `¥${r.finePerDay}` },
  {
    title: '操作', key: 'actions', width: 60,
    render(row: any) {
      return h(NButton, { size: 'small', quaternary: true, onClick: () => openRuleEdit(row) }, () => '编辑')
    }
  }
]

const patronColumns: DataTableColumn[] = [
  { title: '名称', key: 'name' },
  {
    title: '操作', key: 'actions', width: 120,
    render(row: any) {
      return h('div', { style: 'display:flex;gap:6px;' }, [
        h(NButton, { size: 'small', quaternary: true, onClick: () => openPatronEdit(row) }, () => '编辑'),
        h(NButton, { size: 'small', type: 'error', onClick: () => handlePatronDelete(row) }, () => '删除')
      ])
    }
  }
]

const itemTypeColumns: DataTableColumn[] = [
  { title: '名称', key: 'name' },
  { title: '默认借期', key: 'loanDays', render: (r: any) => `${r.loanDays} 天` },
  { title: '日罚金', key: 'fineRate', render: (r: any) => `¥${r.fineRate}` }
]

onMounted(async () => {
  loading.value = true
  try {
    const [r, p, i] = await Promise.allSettled([
      api.get('/rules'),
      api.get('/rules/patron-categories'),
      api.get('/rules/item-types')
    ])
    rules.value = r.status === 'fulfilled' ? (r.value as any) : []
    patronCategories.value = p.status === 'fulfilled' ? (p.value as any) : []
    itemTypes.value = i.status === 'fulfilled' ? (i.value as any) : []
  } catch (e) { console.error('fetchSettings failed:', e) }
  loading.value = false
})
</script>
