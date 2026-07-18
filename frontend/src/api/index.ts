import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { LoginResponse, UserProfile } from '@/types/api'
import router from '@/router'
import { errorMonitor } from '@/utils/errorMonitor'

interface ApiRequestConfig extends InternalAxiosRequestConfig {
  __startTime?: number
}

const axiosInstance = axios.create({ baseURL: '/api' })

axiosInstance.interceptors.request.use((config: ApiRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token && !['/auth/login', '/auth/register'].includes(config.url || '')) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  config.__startTime = Date.now()
  return config
})

axiosInstance.interceptors.response.use(
  res => {
    const duration = Date.now() - ((res.config as ApiRequestConfig).__startTime || 0)
    if (duration > 5000) {
      console.warn(`[SlowAPI] ${res.config.method?.toUpperCase()} ${res.config.url} took ${duration}ms`)
    }

    const apiResponse = res.data
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      return apiResponse.data
    }
    return res.data
  },
  err => {
    errorMonitor.logApiError(
      err.config?.url || '',
      err.config?.method?.toUpperCase() || 'UNKNOWN',
      err.response?.status || 0,
      err.message || 'API request failed'
    )

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

const api = {
  get: <T>(url: string, config?: Partial<ApiRequestConfig>) =>
    axiosInstance.get<T>(url, config) as unknown as Promise<T>,
  post: <T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>) =>
    axiosInstance.post<T>(url, data, config) as unknown as Promise<T>,
  put: <T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>) =>
    axiosInstance.put<T>(url, data, config) as unknown as Promise<T>,
  delete: <T>(url: string, config?: Partial<ApiRequestConfig>) =>
    axiosInstance.delete<T>(url, config) as unknown as Promise<T>,
  getBlob: (url: string, config?: Partial<ApiRequestConfig>) =>
    axiosInstance.get<Blob>(url, { ...config, responseType: 'blob' }) as unknown as Promise<Blob>,
} as const

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
