<template>
  <div class="books-page">
    <div class="page-header">
      <n-h1 prefix="bar" style="margin-bottom: 8px;"><n-text type="primary">图书浏览</n-text></n-h1>
      <p class="page-subtitle">共 {{ pagination.itemCount }} 本图书</p>
    </div>

    <n-space justify="space-between" align="center" style="margin-bottom: 24px;">
      <n-space align="center">
        <n-input
          v-model:value="search"
          placeholder="搜索书名/作者/ISBN"
          clearable
          style="width: 280px;"
          @keyup.enter="fetchBooks"
        >
          <template #prefix><n-icon><SearchOutline /></n-icon></template>
        </n-input>
        <n-select
          v-model:value="filterCategory"
          placeholder="全部分类"
          clearable
          :options="catOptions"
          style="width: 160px;"
          @update:value="fetchBooks"
        />
        <n-button @click="fetchBooks" secondary>搜索</n-button>
      </n-space>
    </n-space>

    <div v-if="loading" class="skeleton-grid">
      <n-skeleton v-for="i in 8" :key="i" class="skeleton-card" />
    </div>

    <div v-else class="book-grid">
      <div
        v-for="book in books"
        :key="book.id"
        class="book-card"
        @click="goToDetail(book.id)"
      >
        <div class="cover-wrapper">
          <img v-if="book.cover" :src="book.cover" class="cover-img" />
          <div v-else class="cover-placeholder">
            <span class="cover-letter">{{ book.title?.[0] || '?' }}</span>
          </div>
          <div v-if="book.available === 0" class="cover-overlay">
            <n-tag type="warning" size="small">已借完</n-tag>
          </div>
        </div>
        <div class="book-info">
          <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
          <n-space size="small" class="book-meta">
            <n-tag size="tiny" type="info">{{ book.category?.name }}</n-tag>
            <n-tag size="tiny" :type="book.available > 0 ? 'success' : 'error'">
              {{ book.available }}/{{ book.total }}
            </n-tag>
          </n-space>
          <div class="book-footer">
            <n-button
              v-if="book.available > 0"
              size="small"
              type="primary"
              @click.stop="handleBorrow(book)"
            >
              <template #icon><n-icon><BookOutline /></n-icon></template>
              借阅
            </n-button>
            <n-button
              v-else
              size="small"
              type="warning"
              @click.stop="handleHold(book)"
            >
              <template #icon><n-icon><TimeOutline /></n-icon></template>
              预约
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && books.length === 0" class="empty-state">
      <n-icon size="48" color="#8a8f98"><BookOutline /></n-icon>
      <p>未找到相关图书</p>
    </div>

    <n-pagination
      v-if="!loading && pagination.itemCount > 0"
      v-model:page="pagination.page"
      :page-count="Math.max(1, Math.ceil(pagination.itemCount / pagination.pageSize))"
      :page-size="pagination.pageSize"
      :show-size-picker="true"
      :page-sizes="[12, 24, 48]"
      style="justify-content: center; margin-top: 32px;"
      @update:page="fetchBooks"
      @update:page-size="onPageSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useMessage, NTag, NButton, NIcon, NSkeleton } from 'naive-ui'
import { SearchOutline, BookOutline, TimeOutline } from '@vicons/ionicons5'
import { bookApi, categoryApi, borrowApi, holdApi } from '@/api'
import type { BookSummary, CategoryResponse } from '@/types/api'

const message = useMessage()
const books = ref<BookSummary[]>([])
const loading = ref(false)
const search = ref('')
const filterCategory = ref<number | null>(null)
const catOptions = ref<{ label: string; value: number }[]>([])
const pagination = reactive({ page: 1, pageSize: 12, itemCount: 0 })

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function debounceSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    pagination.page = 1
    fetchBooks()
  }, 300)
}

async function fetchBooks() {
  loading.value = true
  try {
    const data = await bookApi.list({
      page: pagination.page,
      limit: pagination.pageSize,
      search: search.value || undefined,
      categoryId: filterCategory.value ?? undefined,
    })
    books.value = data.books || []
    pagination.itemCount = data.total || 0
  } catch { /* ignore */ }
  loading.value = false
}

async function fetchCategories() {
  try {
    const data = await categoryApi.getAll()
    catOptions.value = (data || []).map((c: CategoryResponse) => ({ label: c.name, value: c.id }))
  } catch { /* ignore */ }
}

function onPageSizeChange(size: number) {
  pagination.pageSize = size
  pagination.page = 1
  fetchBooks()
}

function goToDetail(id: number) {
  window.open(`/books/${id}`, '_blank')
}

async function handleBorrow(book: BookSummary) {
  try {
    await borrowApi.borrow(book.id)
    message.success(`已借阅《${book.title}》`)
    fetchBooks()
  } catch (e: unknown) { message.error((e as Error).message) }
}

async function handleHold(book: BookSummary) {
  try {
    await holdApi.create(book.id)
    message.success(`已预约《${book.title}》`)
    fetchBooks()
  } catch (e: unknown) { message.error((e as Error).message) }
}

onMounted(() => {
  fetchCategories()
  fetchBooks()
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.books-page { padding: 24px; max-width: 1400px; margin: 0 auto; }

.page-header { margin-bottom: 8px; }
.page-subtitle { margin: 0; font-size: 14px; color: var(--lib-text-tertiary); }

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.skeleton-card {
  height: 380px;
  border-radius: 12px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.book-card {
  background: var(--lib-bg-card);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid var(--lib-divider);
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: var(--lib-primary);
}

.cover-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5e6ad2 0%, #7c6fdb 100%);
}

.cover-letter {
  font-size: 60px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.cover-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
}

.book-info {
  padding: 16px;
}

.book-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--lib-text-tertiary);
}

.book-meta {
  margin-bottom: 12px;
}

.book-footer {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--lib-text-tertiary);
}

.empty-state p {
  margin-top: 16px;
  font-size: 16px;
}
</style>