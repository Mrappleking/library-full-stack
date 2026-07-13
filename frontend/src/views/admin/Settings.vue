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

      <n-card title="读者类型">
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
import { useMessage, NButton } from 'naive-ui'
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
  { title: '名称', key: 'name' }
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
