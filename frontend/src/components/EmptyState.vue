<template>
  <div class="empty-state">
    <n-empty :description="message" />
  </div>
</template>

<script setup lang="ts">
import { NEmpty } from 'naive-ui'
defineProps<{ message?: string }>()
</script>

<style scoped>
.empty-state { display: flex; align-items: center; justify-content: center; padding: 60px 0; }
</style>
