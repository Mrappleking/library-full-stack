import { BorrowStatus, FineType, BookStatus, HoldStatus } from '@/constants'

export interface StatusTagConfig {
  type: 'success' | 'warning' | 'error' | 'info' | 'default'
  label: string
}

export function getBorrowStatusTag(status: string): StatusTagConfig {
  const map: Record<string, StatusTagConfig> = {
    [BorrowStatus.ACTIVE]: { type: 'success', label: '在借' },
    [BorrowStatus.RETURNED]: { type: 'default', label: '已还' },
    [BorrowStatus.OVERDUE]: { type: 'error', label: '逾期' },
  }
  return map[status] || { type: 'default', label: status }
}

export function getFineTypeTag(type: string): StatusTagConfig {
  const map: Record<string, StatusTagConfig> = {
    [FineType.OVERDUE]: { type: 'error', label: '逾期' },
    [FineType.LOSS]: { type: 'warning', label: '遗失' },
    [FineType.DAMAGE]: { type: 'info', label: '破损' },
  }
  return map[type] || { type: 'default', label: type }
}

export function getBookStatusTag(status: string): StatusTagConfig {
  const map: Record<string, StatusTagConfig> = {
    [BookStatus.AVAILABLE]: { type: 'success', label: '可借' },
    [BookStatus.BORROWED]: { type: 'warning', label: '借出' },
    [BookStatus.ON_HOLD]: { type: 'info', label: '预约中' },
    [BookStatus.LOST]: { type: 'error', label: '遗失' },
    [BookStatus.DAMAGED]: { type: 'warning', label: '破损' },
  }
  return map[status] || { type: 'default', label: status }
}

export function getHoldStatusTag(status: string): StatusTagConfig {
  const map: Record<string, StatusTagConfig> = {
    [HoldStatus.PENDING]: { type: 'info', label: '等待中' },
    [HoldStatus.READY]: { type: 'success', label: '可取' },
    [HoldStatus.FULFILLED]: { type: 'default', label: '已履约' },
    [HoldStatus.CANCELLED]: { type: 'default', label: '已取消' },
  }
  return map[status] || { type: 'default', label: status }
}