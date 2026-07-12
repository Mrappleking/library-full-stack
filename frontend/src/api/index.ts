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
  res => {
    const apiResponse = res.data
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      // Unwrap ApiResponse: {code, message, data: T, timestamp} -> T
      return apiResponse.data
    }
    return res.data
  },
  err => {
    if (err.response?.status === 401 && err.config?.url !== '/auth/login') {
      clearAuth()
      router.push('/login')
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    if (!err.response && err.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('无法连接到服务器，请检查后端是否已启动'))
    }
    if (err.response?.status === 502) {
      return Promise.reject(new Error('后端服务未启动或无法连接，请先启动后端'))
    }
    const apiResponse = err.response?.data
    const msg = apiResponse?.error || apiResponse?.message
      || (typeof apiResponse === 'string' ? '服务器错误' : null)
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

export function doLogin(username: string, password: string) {
  return api.post<LoginResponse>('/auth/login', { username, password })
}
export function doRegister(data: { username: string; password: string; name: string; phone?: string; email?: string }) {
  return api.post<LoginResponse>('/auth/register', data)
}
export function getMe() { return api.get<UserProfile>('/auth/me') }

export { bookApi } from './books'
export { borrowApi } from './borrows'
export { readerApi } from './readers'
export { categoryApi } from './categories'
export { statsApi } from './stats'
export { fineApi } from './fines'
export { holdApi } from './holds'
