import api from './index'
import type { BookDetail, BookItemsResponse, FacetsResponse, BookListResponse, BookListParams } from '../types/api'

export const bookApi = {
  list: (params: BookListParams = {}) =>
    api.get<BookListResponse>('/books', { params }),

  getById: (id: number) =>
    api.get<BookDetail>(`/books/${id}`),

  getItems: (bookId: number) =>
    api.get<BookItemsResponse>(`/books/${bookId}/items`),

  getFacets: (params: BookListParams = {}) =>
    api.get<FacetsResponse>('/books/facets', { params }),

  create: (data: any) =>
    api.post('/books', data),

  update: (id: number, data: any) =>
    api.put(`/books/${id}`, data),

  delete: (id: number) =>
    api.delete(`/books/${id}`),

  reconcile: (id: number) =>
    api.post(`/books/${id}/reconcile`),
}
