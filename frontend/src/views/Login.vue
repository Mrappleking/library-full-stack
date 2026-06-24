<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="logo-area">
        <div class="logo-icon">📚</div>
        <h1>图书馆管理系统</h1>
        <p>山东科技大学</p>
      </div>
      <n-form ref="formRef" :model="form" :rules="rules" size="large">
        <n-form-item path="username">
          <n-input v-model:value="form.username" placeholder="用户名" clearable>
            <template #prefix><n-icon><PersonOutline /></n-icon></template>
          </n-input>
        </n-form-item>
        <n-form-item path="password">
          <n-input v-model:value="form.password" type="password" placeholder="密码" show-password-on="click">
            <template #prefix><n-icon><LockClosedOutline /></n-icon></template>
          </n-input>
        </n-form-item>
      </n-form>
      <n-button type="primary" block size="large" :loading="loading" @click="handleLogin" style="margin-top: 4px;">
        登录
      </n-button>
      <n-text depth="3" class="register-link" @click="showRegister = true">
        没有账号？<n-text type="primary" style="cursor:pointer">立即注册</n-text>
      </n-text>
    </div>

    <n-modal v-model:show="showRegister" preset="card" title="读者注册" style="width: 420px;">
      <n-form ref="regFormRef" :model="reg" :rules="regRules" label-placement="top">
        <n-form-item path="username" label="用户名">
          <n-input v-model:value="reg.username" placeholder="用户名" />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input v-model:value="reg.password" type="password" placeholder="密码（至少6位）" />
        </n-form-item>
        <n-form-item path="name" label="真实姓名">
          <n-input v-model:value="reg.name" placeholder="真实姓名" />
        </n-form-item>
        <n-form-item path="phone" label="手机号">
          <n-input v-model:value="reg.phone" placeholder="手机号（可选）" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRegister = false">取消</n-button>
          <n-button type="primary" :loading="regLoading" @click="handleRegister">注册</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NIcon } from 'naive-ui'
import { PersonOutline, LockClosedOutline } from '@vicons/ionicons5'
import { api, setAuth } from '../api'

const router = useRouter()
const message = useMessage()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
}

async function handleLogin() {
  if (!form.value.username || !form.value.password) { message.warning('请输入用户名和密码'); return }
  loading.value = true
  try {
    const res = await api.login(form.value.username, form.value.password)
    setAuth(res.user, res.token)
    message.success('登录成功')
    router.push(res.user.role === 'admin' ? '/admin/dashboard' : '/reader/books')
  } catch (e: unknown) {
    message.error((e as Error).message || '登录失败')
  } finally {
    loading.value = false
  }
}

const showRegister = ref(false)
const regLoading = ref(false)
const reg = ref({ username: '', password: '', name: '', phone: '' })
const regRules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, min: 6, message: '密码至少6位' }],
  name: [{ required: true, message: '请输入姓名' }]
}

async function handleRegister() {
  if (!reg.value.username || !reg.value.password || !reg.value.name) {
    message.warning('请填写必填项'); return
  }
  regLoading.value = true
  try {
    const res = await api.register(reg.value)
    setAuth(res.user, res.token)
    showRegister.value = false
    message.success('注册成功')
    router.push('/reader/books')
  } catch (e: unknown) {
    message.error((e as Error).message || '注册失败')
  } finally {
    regLoading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex; align-items: center; justify-content: center; min-height: 100vh;
  background: linear-gradient(135deg, #0a0b0f 0%, #13151d 50%, #191c26 100%);
}
.login-card {
  width: 400px; padding: 40px 36px 32px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px; backdrop-filter: blur(20px);
}
.logo-area { text-align: center; margin-bottom: 28px; }
.logo-icon { font-size: 48px; margin-bottom: 8px; }
.logo-area h1 { margin: 0; font-size: 20px; font-weight: 600; color: var(--n-text-color); }
.logo-area p { margin: 4px 0 0; font-size: 13px; color: var(--n-text-color-3); }
.register-link { display: block; text-align: center; margin-top: 18px; font-size: 13px; cursor: pointer; }
</style>
