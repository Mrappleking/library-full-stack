<template>
  <div class="login-page" :class="{ dark: isDark }">
    <LoginBg />
    <div class="login-wrapper">
      <div class="theme-toggle" @click="toggleTheme">
        <n-icon><MoonOutline v-if="!isDark" /><SunnyOutline v-else /></n-icon>
      </div>
      <div class="login-card">
        <div class="back-bar">
          <div class="back-btn" @click="$router.push('/books')">
            <span class="back-arrow">←</span>
            <span class="back-text">浏览书目</span>
          </div>
        </div>
        <div class="logo-area">
          <img class="school-badge" src="https://www.sdust.edu.cn/web202504/images/xqlogo3.png" width="72" height="72" alt="山东科技大学" />
          <div class="brand-text">
            <h1 class="brand-title">图书馆管理系统</h1>
            <p class="brand-subtitle">SHANDONG UNIVERSITY OF SCIENCE AND TECHNOLOGY</p>
          </div>
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
        <n-button type="primary" block size="large" :loading="loading" @click="handleLogin" style="margin-top: 4px;">登录</n-button>
        <n-text depth="3" class="register-link" @click="showRegister = true">没有账号？<n-text type="primary" style="cursor:pointer">立即注册</n-text></n-text>
      </div>
      <n-modal v-model:show="showRegister" preset="card" title="读者注册" style="width:420px">
        <n-form ref="regFormRef" :model="reg" :rules="regRules" label-placement="top">
          <n-form-item path="username" label="用户名"><n-input v-model:value="reg.username" placeholder="用户名" /></n-form-item>
          <n-form-item path="password" label="密码">
            <n-input v-model:value="reg.password" type="password" placeholder="密码（至少6位）" />
          </n-form-item>
          <n-form-item path="confirmPassword" label="确认密码"><n-input v-model:value="reg.confirmPassword" type="password" placeholder="再次输入密码" /></n-form-item>
          <n-form-item path="name" label="真实姓名"><n-input v-model:value="reg.name" placeholder="真实姓名" /></n-form-item>
          <n-form-item path="phone" label="手机号"><n-input v-model:value="reg.phone" placeholder="手机号（可选）" maxlength="11" /></n-form-item>
        </n-form>
        <template #footer><n-space justify="end"><n-button @click="showRegister=false">取消</n-button><n-button type="primary" :loading="regLoading" @click="handleRegister">注册</n-button></n-space></template>
      </n-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NIcon, type FormInst } from 'naive-ui'
import { PersonOutline, LockClosedOutline, MoonOutline, SunnyOutline } from '@vicons/ionicons5'
import { doLogin, doRegister } from '../../api'
import LoginBg from '../../components/LoginBg.vue'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import type { LoginResponse } from '../../types/api'
import { UserRole } from '../../constants'

const router = useRouter(); const message = useMessage()
const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const form = ref({ username: '', password: '' }); const loading = ref(false)
const rules = { username: [{ required: true, message: '请输入用户名' }], password: [{ required: true, message: '请输入密码' }] }

function toggleTheme() {
  themeStore.toggleTheme()
  isDark.value = themeStore.isDark
}

async function handleLogin() {
  if (!form.value.username || !form.value.password) { message.warning('请输入用户名和密码'); return }
  loading.value = true
  try { const data = await doLogin(form.value.username, form.value.password); useAuthStore().login(data); message.success('登录成功'); router.push(data.user.role === UserRole.ADMIN ? '/admin/dashboard' : '/reader/books') }
  catch (e: unknown) { message.error((e as Error).message || '登录失败') } finally { loading.value = false }
}

const showRegister = ref(false); const regLoading = ref(false)
const regFormRef = ref<FormInst | null>(null)
const reg = ref({ username: '', password: '', name: '', phone: '', confirmPassword: '' })
const regRules = { username: [{ required: true, message: '请输入用户名' }], password: [{ required: true, min: 6, message: '密码至少6位' }], name: [{ required: true, message: '请输入姓名' }], phone: [{ pattern: /^(1[3-9]\d{9})?$/, message: '请输入有效的11位手机号', trigger: 'blur' }], confirmPassword: [{ required: true, message: '请确认密码' }, { validator: (_rule: any, value: string) => value === reg.value.password, message: '两次输入的密码不一致', trigger: 'blur' }] }

async function handleRegister() {
  try { await regFormRef.value?.validate() } catch { return }
  regLoading.value = true
  try { const data = await doRegister({ username: reg.value.username, password: reg.value.password, name: reg.value.name, phone: reg.value.phone }); useAuthStore().login(data); showRegister.value = false; message.success('注册成功'); router.push('/reader/books') }
  catch (e: unknown) { message.error((e as Error).message || '注册失败') } finally { regLoading.value = false }
}
</script>

<style scoped>
.login-wrapper { display: flex; align-items: center; justify-content: center; min-height: 100vh; position: relative; }
.theme-toggle {
  position: absolute; top: 24px; right: 24px;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
}
.theme-toggle:hover {
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.15);
}
.login-page:not(.dark) .theme-toggle {
  color: rgba(0,0,0,0.5);
  background: rgba(255,255,255,0.7);
  border-color: rgba(0,0,0,0.1);
}
.login-page:not(.dark) .theme-toggle:hover {
  color: rgba(0,0,0,0.8);
  background: rgba(255,255,255,0.9);
}
.login-card {
  width: 420px; padding: 44px 40px 36px;
  background: rgba(15,16,22,0.75);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  backdrop-filter: blur(28px);
  box-shadow: 0 12px 50px rgba(0,0,0,0.5);
  position: relative; z-index: 1;
}
.login-page:not(.dark) .login-card {
  background: rgba(255,255,255,0.85);
  border-color: rgba(0,0,0,0.08);
  box-shadow: 0 12px 50px rgba(0,0,0,0.15);
}
.logo-area {
  display: flex; align-items: center; gap: 18px;
  margin-bottom: 32px; text-align: left;
}
.school-badge { flex-shrink: 0; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3)); }
.login-page:not(.dark) .school-badge { filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15)); }
.brand-text { display: flex; flex-direction: column; gap: 4px; }
.brand-title {
  margin: 0; font-size: 24px; font-weight: 700;
  background: linear-gradient(135deg, #e8e8f0 0%, #c8c8e0 50%, #a8a8d0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1.5px;
}
.login-page:not(.dark) .brand-title {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%);
}
.brand-subtitle {
  margin: 0; font-size: 11px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 2.5px;
  font-weight: 300;
}
.login-page:not(.dark) .brand-subtitle {
  color: rgba(0,0,0,0.35);
}
.register-link { display: block; text-align: center; margin-top: 18px; font-size: 13px; cursor: pointer; }
.back-bar {
  display: flex; justify-content: flex-start; margin-bottom: 4px;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 16px 7px 12px; border-radius: 100px;
  cursor: pointer; user-select: none;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.25s ease;
  backdrop-filter: blur(12px);
}
.login-page:not(.dark) .back-btn {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.08);
}
.back-btn:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.15);
  transform: translateX(-3px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.login-page:not(.dark) .back-btn:hover {
  background: rgba(0,0,0,0.08);
  border-color: rgba(0,0,0,0.12);
}
.back-arrow {
  display: inline-block; font-size: 18px; line-height: 1;
  color: rgba(255,255,255,0.6);
  transition: transform 0.25s ease;
}
.login-page:not(.dark) .back-arrow {
  color: rgba(0,0,0,0.5);
}
.back-btn:hover .back-arrow { transform: translateX(-4px); }
.back-text {
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.5px;
}
.login-page:not(.dark) .back-text {
  color: rgba(0,0,0,0.6);
}
</style>