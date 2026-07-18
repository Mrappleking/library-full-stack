<template>
  <n-card :bordered="false" hoverable class="book-card" @click="$emit('click')">
    <div class="cover-wrap">
      <div class="cover-glow"></div>
      <img v-if="book.cover" :src="book.cover" class="cover-img" loading="lazy" />
      <div v-else class="cover-placeholder">
        <span class="cover-letter">{{ book.title?.[0] || '?' }}</span>
      </div>
      <div class="cover-overlay">
        <div class="overlay-content">
          <n-icon size="28">
            <eye-outline />
          </n-icon>
          <span class="view-text">查看详情</span>
        </div>
      </div>
    </div>
    <div class="info">
      <n-ellipsis style="max-width: 100%; line-height: 1.3;">
        <span class="title">{{ book.title }}</span>
      </n-ellipsis>
      <span class="author">{{ book.author }}</span>
      <div class="meta">
        <StatusBadge :status="book.status" />
        <span class="avail">{{ book.available }}/{{ book.total }}可借</span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NEllipsis, NIcon } from 'naive-ui'
import { EyeOutline } from '@vicons/ionicons5'
import StatusBadge from './StatusBadge.vue'
import type { BookSummary } from '../types/api'

defineProps<{ book: BookSummary }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.book-card {
  cursor: pointer; width: 190px;
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
  border-radius: 16px !important;
  overflow: visible !important;
  position: relative;
}
.book-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(79,70,229,0.15), 0 8px 24px rgba(0,0,0,0.08);
}
.cover-wrap {
  width: 156px; height: 200px; margin: 0 auto 12px;
  border-radius: 12px; overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.cover-glow {
  position: absolute; inset: -20px;
  /* 硬编码: 封面悬停发光效果使用品牌主色，与主题无关 */
  background: radial-gradient(circle at 30% 30%, rgba(79,70,229,0.3), transparent 60%);
  opacity: 0; transition: opacity 0.3s ease;
  z-index: 1; pointer-events: none;
}
.book-card:hover .cover-glow { opacity: 1; }
.cover-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.3, 1), filter 0.3s ease; }
.book-card:hover .cover-img { transform: scale(1.12); filter: brightness(1.05); }
.cover-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  /* 硬编码: 封面占位符使用品牌渐变色，与主题无关 */
  background: linear-gradient(145deg, #4f46e5, #7c3aed, #ec4899);
  border-radius: 12px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
}
.cover-letter { font-size: 56px; font-weight: 800; color: rgba(255,255,255,0.95); text-shadow: 0 4px 15px rgba(0,0,0,0.25); }
.cover-overlay {
  position: absolute; inset: 0;
  /* 硬编码: 覆盖层使用深色渐变以确保文字可读性，与主题无关 */
  background: linear-gradient(to top, rgba(15,23,42,0.85), transparent 50%);
  display: flex; align-items: flex-end; justify-content: center;
  padding-bottom: 20px; opacity: 0; transition: opacity 0.3s ease;
  z-index: 2;
}
.book-card:hover .cover-overlay { opacity: 1; }
.overlay-content {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  transform: translateY(10px);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.book-card:hover .overlay-content { transform: translateY(0); }
.view-text {
  /* 硬编码: 在深色覆盖层上必须使用白色文字 */
  color: white; font-size: 12px; font-weight: 500;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.info { text-align: center; padding: 0 4px; }
.title { 
  font-size: 14px; font-weight: 700; color: var(--lib-text-primary); 
  line-height: 1.35; display: block;
}
.author { 
  font-size: 12.5px; color: var(--lib-text-secondary); 
  display: block; margin: 4px 0 8px; line-height: 1.25; font-weight: 500;
}
.meta { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; }
.avail { font-size: 11.5px; color: var(--lib-text-tertiary); font-weight: 500; }
</style>
