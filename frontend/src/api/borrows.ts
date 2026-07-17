import api from './index'
import type { BorrowRecordResponse } from '../types/api'

export const borrowApi = {
  getMyBorrows: () =>
    api.get<{ borrows: BorrowRecordResponse[] }>('/borrows/my'),

  getAllBorrows: (params: { page?: number; limit?: number } = {}) =>
    api.get<{ borrows: BorrowRecordResponse[]; total: number; page: number; limit: number; pages: number }>('/borrows', { params }),

  getAllBorrowsCsv: () =>
    api.getBlob('/borrows', { params: { export: 'csv' } }),

  getMyHistory: (params: { export?: string } = {}) =>
    api.get('/borrows/history', { params }),

  getHistoryCsv: () =>
    api.getBlob('/borrows/history', { params: { export: 'csv' } }),

  borrow: (bookId: number) =>
    api.post('/borrows/borrow', { bookId }),

  returnBook: (id: number) =>
    api.post(`/borrows/return/${id}`),

  renew: (id: number) =>
    api.post(`/borrows/renew/${id}`),
}
