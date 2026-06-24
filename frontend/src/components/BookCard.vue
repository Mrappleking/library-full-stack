<template>
  <n-card :bordered="false" hoverable class="book-card" @click="$emit('click')">
    <div class="cover-wrap">
      <img v-if="book.cover" :src="book.cover" class="cover-img" />
      <div v-else class="cover-placeholder">{{ book.title[0] }}</div>
    </div>
    <div class="info">
      <n-ellipsis style="max-width: 100%">
        <span class="title">{{ book.title }}</span>
      </n-ellipsis>
      <span class="author">{{ book.author }}</span>
      <div class="meta">
        <StatusBadge :status="book.available > 0 ? 'available' : 'borrowed'" />
        <span class="avail">{{ book.available }}/{{ book.total }}可借</span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NEllipsis } from 'naive-ui'
import StatusBadge from './StatusBadge.vue'
import type { BookSummary } from '../types/api'

defineProps<{ book: BookSummary }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.book-card { cursor: pointer; width: 200px; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.book-card:hover { transform: translateY(-2px); }
.cover-wrap { width: 160px; height: 200px; margin: 0 auto 8px; border-radius: 6px; overflow: hidden; }
.cover-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s ease; }
.book-card:hover .cover-img { transform: scale(1.05); }
.cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #5e6ad2, #7170ff); color: #fff; font-size: 48px; font-weight: bold; }
.info { text-align: center; }
.title { font-size: 14px; font-weight: 600; color: var(--n-text-color); }
.author { font-size: 12px; color: var(--n-text-color-3); display: block; margin: 4px 0; }
.meta { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; }
.avail { font-size: 11px; color: var(--n-text-color-3); }
</style>
