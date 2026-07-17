import api from './index'
import type { ReaderResponse, UserProfile } from '../types/api'

export const readerApi = {
  getAllReaders: (params: { page?: number; limit?: number; keyword?: string; patronCategoryId?: number; sortBy?: string; sortDir?: string } = {}) =>
    api.get<{ data: ReaderResponse[]; total: number; page: number; limit: number; pages: number }>('/readers', { params }),

  getById: (id: number) =>
    api.get<ReaderResponse>(`/readers/${id}`),

  update: (id: number, data: Partial<UserProfile>) =>
    api.put<UserProfile>(`/readers/${id}`, data),

  updateProfile: (data: { name: string; phone?: string | null; email?: string | null }) =>
    api.put<UserProfile>('/readers/profile', data),

  updatePassword: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) =>
    api.put('/auth/password', data),

  cancelAccount: (password: string) =>
    api.post('/auth/cancel-account', { password }),
}
