import api from './index'
import type { HoldResponse } from '../types/api'

export const holdApi = {
  create: (bookId: number) =>
    api.post<HoldResponse>('/holds', { bookId }),

  getCount: () =>
    api.get<{ count: number }>('/holds/count'),

  getMyHolds: () =>
    api.get<HoldResponse[]>('/holds/my'),

  getAllHolds: (params: { page?: number; limit?: number } = {}) =>
    api.get<{ holds: HoldResponse[]; total: number; page: number; limit: number; pages: number }>('/holds', { params }),

  cancel: (id: number) =>
    api.delete(`/holds/${id}`),

  fulfill: (id: number) =>
    api.post(`/holds/${id}/fulfill`),
}
