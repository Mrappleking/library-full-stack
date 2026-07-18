import axios from 'axios'

interface ErrorLog {
  id: string
  timestamp: number
  type: 'vue' | 'api' | 'global' | 'unhandled' | 'data-mismatch'
  message: string
  stack?: string
  url?: string
  method?: string
  statusCode?: number
  component?: string
  props?: string
  userId?: number
  userRole?: string
  expectedType?: string
  actualType?: string
  expectedFields?: string[]
  missingFields?: string[]
  responseSample?: string
}

class ErrorMonitor {
  private logs: ErrorLog[] = []
  private isReporting = false
  private reportInterval: ReturnType<typeof setInterval> | null = null
  private readonly MAX_LOGS = 100
  private readonly REPORT_DELAY = 5000

  constructor() {
    this.startReportLoop()
    this.setupGlobalErrorHandler()
    this.setupUnhandledRejectionHandler()
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private startReportLoop(): void {
    this.reportInterval = setInterval(() => {
      if (this.logs.length > 0) {
        this.reportLogs()
      }
    }, this.REPORT_DELAY)
  }

  private setupGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
      this.log({
        type: 'global',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
      })
    })
  }

  private setupUnhandledRejectionHandler(): void {
    window.addEventListener('unhandledrejection', (event) => {
      this.log({
        type: 'unhandled',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
      })
    })
  }

  private getUserInfo(): { userId?: number; userRole?: string } {
    try {
      const user = localStorage.getItem('user')
      if (user) {
        const parsed = JSON.parse(user)
        return { userId: parsed.id, userRole: parsed.role }
      }
    } catch {
      // ignore
    }
    return {}
  }

  log(error: Omit<ErrorLog, 'id' | 'timestamp'>): void {
    const logEntry: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...error,
      ...this.getUserInfo(),
    }

    if (this.logs.length >= this.MAX_LOGS) {
      this.logs.shift()
    }
    this.logs.push(logEntry)

    console.error(`[ErrorMonitor] [${logEntry.type}] ${logEntry.message}`, logEntry)
  }

  logVueError(err: unknown, instance: any, info: string): void {
    this.log({
      type: 'vue',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      component: instance?.$options?.name || instance?.$options?._componentTag,
      props: instance?.$props ? JSON.stringify(instance.$props) : undefined,
    })
  }

  logApiError(url: string, method: string, statusCode: number, message: string): void {
    this.log({
      type: 'api',
      message,
      url,
      method,
      statusCode,
    })
  }

  checkResponseStructure(url: string, response: unknown, expectedFields: string[]): boolean {
    if (!response || typeof response !== 'object') {
      this.log({
        type: 'data-mismatch',
        message: `API响应不是对象类型: ${url}`,
        url,
        expectedType: 'object',
        actualType: typeof response,
        responseSample: JSON.stringify(response).substring(0, 200),
      })
      return false
    }

    const missingFields = expectedFields.filter(field => !(field in response))

    if (missingFields.length > 0) {
      this.log({
        type: 'data-mismatch',
        message: `API响应缺少预期字段: ${url}`,
        url,
        expectedFields,
        missingFields,
        responseSample: JSON.stringify(response).substring(0, 300),
      })
      return false
    }

    return true
  }

  validateArrayResponse(url: string, response: unknown, expectedItemFields?: string[]): boolean {
    if (!Array.isArray(response)) {
      this.log({
        type: 'data-mismatch',
        message: `API响应不是数组类型: ${url}`,
        url,
        expectedType: 'array',
        actualType: typeof response,
        responseSample: JSON.stringify(response).substring(0, 200),
      })
      return false
    }

    if (expectedItemFields && response.length > 0) {
      const firstItem = response[0]
      if (typeof firstItem === 'object' && firstItem !== null) {
        const missingFields = expectedItemFields.filter(field => !(field in firstItem))
        if (missingFields.length > 0) {
          this.log({
            type: 'data-mismatch',
            message: `API响应数组项缺少预期字段: ${url}`,
            url,
            expectedFields: expectedItemFields,
            missingFields,
            responseSample: JSON.stringify(firstItem).substring(0, 200),
          })
          return false
        }
      }
    }

    return true
  }

  private async reportLogs(): Promise<void> {
    if (this.isReporting) return
    this.isReporting = true

    const logsToReport = [...this.logs]
    this.logs = []

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      const token = localStorage.getItem('token')
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      await axios.post('/api/system/logs', { logs: logsToReport }, {
        headers,
        timeout: 10000,
      })
    } catch (e) {
      console.warn('[ErrorMonitor] Failed to report logs:', e)
      this.logs = [...logsToReport, ...this.logs]
    } finally {
      this.isReporting = false
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  destroy(): void {
    if (this.reportInterval) {
      clearInterval(this.reportInterval)
    }
  }
}

export const errorMonitor = new ErrorMonitor()

export function setupVueErrorHandler(app: any): void {
  app.config.errorHandler = (err: unknown, instance: any, info: string) => {
    errorMonitor.logVueError(err, instance, info)
  }
}
