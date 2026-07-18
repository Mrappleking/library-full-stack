import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUser, setAuth, clearAuth } from '@/api'
import type { UserProfile } from '@/types/api'
import { UserRole } from '@/constants'

/**
 * 认证状态管理
 * 
 * 安全说明：
 * 1. Token存储在localStorage中，存在XSS攻击风险
 * 2. 若发生XSS攻击，攻击者可窃取token并冒充用户
 * 3. 使用约束：
 *    - 禁止使用v-html渲染用户输入
 *    - 严格的Content-Security-Policy已配置在index.html
 *    - 所有第三方脚本需经过安全审查
 *    - 考虑生产环境改用HttpOnly Cookie + SameSite=Strict
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(getUser())
  
  // Token存储：当前使用localStorage，注意安全风险（见上方注释）
  const token = ref<string | null>(localStorage.getItem('token'))
  
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN)

  function login(data: { user: UserProfile; token: string }) {
    setAuth(data.user, data.token)
    user.value = data.user
    token.value = data.token
  }

  function logout() {
    clearAuth()
    user.value = null
    token.value = null
  }

  function restore() {
    user.value = getUser()
    token.value = localStorage.getItem('token')
  }

  return { user, token, isLoggedIn, isAdmin, login, logout, restore }
})
