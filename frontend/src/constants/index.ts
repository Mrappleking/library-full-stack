export const BookStatus = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  ON_HOLD: 'on_hold',
  LOST: 'lost',
  DAMAGED: 'damaged',
} as const

export const UserRole = {
  ADMIN: 'admin',
  READER: 'reader',
} as const

export const BorrowStatus = {
  ACTIVE: 'active',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
} as const

export const HoldStatus = {
  PENDING: 'pending',
  READY: 'ready',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
} as const

export const FineType = {
  OVERDUE: 'overdue',
  DAMAGE: 'damage',
  LOSS: 'loss',
} as const