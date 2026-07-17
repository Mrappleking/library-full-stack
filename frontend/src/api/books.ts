import api from './index'
import type { BookDetail, BookItemsResponse, FacetsResponse, BookListResponse, BookListParams, BookSummary } from '../types/api'

interface BookCreateData {
  isbn: string; title: string; author: string
  publisher?: string; year?: number
  clcNumber?: string; physicalDesc?: string; cover?: string
  language?: string; country?: string; categoryId: number
}

interface BookUpdateData {
  isbn?: string; title?: string; author?: string
  publisher?: string; year?: number
  clcNumber?: string; physicalDesc?: string; cover?: string
  language?: string; country?: string; categoryId?: number
}

export const bookApi = {
  list: (params: BookListParams = {}) =>
    api.get<BookListResponse>('/books', { params }),

  getById: (id: number) =>
    api.get<BookDetail>(`/books/${id}`),

  getItems: (bookId: number) =>
    api.get<BookItemsResponse>(`/books/${bookId}/items`),

  getFacets: (params: BookListParams = {}) =>
    api.get<FacetsResponse>('/books/facets', { params }),

  create: (data: BookCreateData) =>
    api.post<BookSummary>('/books', data),

  update: (id: number, data: BookUpdateData) =>
    api.put<BookSummary>(`/books/${id}`, data),

  delete: (id: number) =>
    api.delete(`/books/${id}`),

  reconcile: (id: number) =>
    api.post(`/books/${id}/reconcile`),
}
