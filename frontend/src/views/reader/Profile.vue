<template>
  <div>
    <n-h1 prefix="bar" style="margin-bottom: 20px;"><n-text type="primary">个人信息</n-text></n-h1>
    <n-card style="max-width: 480px;">
      <n-spin :show="loading">
        <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
          <n-form-item label="用户名"><n-text>{{ form.username }}</n-text></n-form-item>
          <n-form-item label="角色"><n-tag :type="form.role === 'admin' ? 'error' : 'info'" size="small">{{ form.role === 'admin' ? '管理员' : '读者' }}</n-tag></n-form-item>
          <n-form-item label="姓名" path="name">
            <n-input v-model:value="form.name" placeholder="真实姓名" maxlength="20" show-count />
          </n-form-item>
          <n-form-item label="手机号" path="phone">
            <n-input v-model:value="form.phone" placeholder="11 位手机号" maxlength="11" />
          </n-form-item>
          <n-form-item label="邮箱" path="email">
            <n-input v-model:value="form.email" placeholder="example@mail.com" />
          </n-form-item>
          <n-form-item label="注册时间">
            <n-text depth="3">{{ form.createdAt ? new Date(form.createdAt).toLocaleString('zh-CN') : '-' }}</n-text>
          </n-form-item>
        </n-form>
        <n-button type="primary" :loading="saving" :disabled="!hasChanged" @click="handleSave" style="margin-top: 16px;">保存修改</n-button>
      </n-spin>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import api, { setAuth, getUser } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { UserProfile } from '@/types/api'

const message = useMessage()
const auth = useAuthStore()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const saving = ref(false)
const original = ref({ name: '', phone: '', email: '' })
const form = reactive({ username: '', role: '', name: '', phone: '', email: '', createdAt: '' })

const hasChanged = computed(() => {
  return form.name !== original.value.name
    || form.phone !== original.value.phone
    || form.email !== original.value.email
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 20, message: '姓名长度 1-20', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的 11 位手机号', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get<UserProfile>('/auth/me')
    Object.assign(form, data)
    original.value = { name: data.name, phone: data.phone || '', email: data.email || '' }
  } catch { message.error('获取信息失败') }
  loading.value = false
})

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch { return }
  saving.value = true
  try {
    const { data } = await api.put<UserProfile>('/readers/profile', {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null
    })
    // 同步更新 auth store 和 localStorage
    const user = getUser()
    if (user) {
      user.name = data.name
      user.phone = data.phone
      user.email = data.email
      setAuth(user, auth.token || localStorage.getItem('token') || '')
      auth.restore()
    }
    original.value = { name: data.name, phone: data.phone || '', email: data.email || '' }
    message.success('个人信息已保存')
  } catch (e: unknown) { message.error((e as Error).message) }
  saving.value = false
}
</script>
