<template>
  <div>
    <n-h1 prefix="bar" style="margin-bottom: 20px;"><n-text type="primary">个人信息</n-text></n-h1>
    <n-card style="max-width: 480px; margin-bottom: 20px;">
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

    <n-card title="修改密码" style="max-width: 480px;">
      <n-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-placement="top">
        <n-form-item path="oldPassword" label="原密码">
          <n-input v-model:value="pwdForm.oldPassword" type="password" placeholder="请输入原密码" show-password-on="click" />
        </n-form-item>
        <n-form-item path="newPassword" label="新密码">
          <n-input v-model:value="pwdForm.newPassword" type="password" placeholder="至少6位" show-password-on="click" />
        </n-form-item>
        <n-form-item path="confirmPassword" label="确认新密码">
          <n-input v-model:value="pwdForm.confirmPassword" type="password" placeholder="再次输入新密码" show-password-on="click" />
        </n-form-item>
      </n-form>
      <n-button type="primary" :loading="pwdSaving" @click="handleChangePassword">修改密码</n-button>
    </n-card>

    <n-card title="删除账户" style="max-width: 480px;">
      <n-text type="error" depth="3" style="margin-bottom: 12px; display: block;">
        删除后您的账户将被永久清除，此操作不可撤销。
      </n-text>
      <n-form-item label="请输入密码确认">
        <n-input v-model:value="cancelPwd" type="password" placeholder="输入当前密码" show-password-on="click" />
      </n-form-item>
      <n-button type="error" :loading="cancelling" @click="handleCancelAccount">删除账户</n-button>
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

// ===== 密码修改 =====
const pwdFormRef = ref<FormInst | null>(null)
const pwdSaving = ref(false)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '新密码至少6位' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: (_rule: any, value: string) => value === pwdForm.newPassword,
      message: '两次输入的密码不一致'
    }
  ]
}

async function handleChangePassword() {
  try {
    await pwdFormRef.value?.validate()
  } catch { return }
  pwdSaving.value = true
  try {
    await api.put('/auth/password', { oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    message.success('密码修改成功')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  } catch (e: unknown) { message.error((e as Error).message) }
  pwdSaving.value = false
}

// ===== 注销账户 =====
const cancelPwd = ref('')
const cancelling = ref(false)

async function handleCancelAccount() {
  if (!cancelPwd.value) { message.warning('请输入密码确认'); return }
  cancelling.value = true
  try {
    await api.post('/auth/cancel-account', { password: cancelPwd.value })
    message.success('账户已删除')
    useAuthStore().logout()
    window.location.href = '/login'
  } catch (e: unknown) { message.error((e as Error).message) }
  cancelling.value = false
}
</script>
