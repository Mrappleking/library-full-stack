import api from './index'
import type { FineResponse } from '../types/api'

export const fineApi = {
  getAll: (params: { type?: string; paid?: boolean } = {}) =>
    api.get<{ fines: FineResponse[]; total: number; page: number; limit: number; pages: number }>('/fines', { params }),

  getMyFines: () =>
    api.get<FineResponse[]>('/fines/my'),

  payFine: (id: number) =>
    api.post(`/fines/${id}/pay`),
}
