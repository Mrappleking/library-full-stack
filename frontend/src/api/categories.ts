import api from './index'
import type { CategoryResponse } from '../types/api'

export const categoryApi = {
  getAll: () =>
    api.get<CategoryResponse[]>('/categories'),

  create: (data: { name: string; desc?: string }) =>
    api.post<CategoryResponse>('/categories', data),

  update: (id: number, data: { name: string; desc?: string }) =>
    api.put<CategoryResponse>(`/categories/${id}`, data),

  delete: (id: number) =>
    api.delete(`/categories/${id}`),
}
