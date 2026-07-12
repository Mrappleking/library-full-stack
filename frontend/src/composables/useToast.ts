import { ref } from 'vue'

export interface ToastMessage {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const toasts = ref<ToastMessage[]>([])
let toastId = 0

export function useToast() {
  const success = (message: string, duration = 3000) => {
    addToast('success', message, duration)
  }

  const error = (message: string, duration = 5000) => {
    addToast('error', message, duration)
  }

  const warning = (message: string, duration = 4000) => {
    addToast('warning', message, duration)
  }

  const info = (message: string, duration = 3000) => {
    addToast('info', message, duration)
  }

  const addToast = (type: ToastMessage['type'], message: string, duration: number) => {
    const id = ++toastId
    toasts.value.push({ id, type, message, duration })
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
  }
}