import axios from 'axios'
import type { LoginResponse, UserProfile } from '@/types/api'
import router from '@/router'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    // 登录接口 401 = 密码错误，不跳转，直接显示后端错误消息
    if (err.response?.status === 401 && err.config?.url !== '/auth/login') {
      clearAuth()
      router.push('/login')
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    const msg = err.response?.data?.error
      || (typeof err.response?.data === 'string' ? '服务器错误' : null)
      || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

export default api

export function setAuth(user: UserProfile, token: string) {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('token', token)
}
export function clearAuth() {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}
export function getUser(): UserProfile | null {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

// Auth
export function doLogin(username: string, password: string) {
  return api.post<LoginResponse>('/auth/login', { username, password })
}
export function doRegister(data: { username: string; password: string; name: string; phone?: string; email?: string }) {
  return api.post<LoginResponse>('/auth/register', data)
}
export function getMe() { return api.get<UserProfile>('/auth/me') }

export { bookApi } from './books'
