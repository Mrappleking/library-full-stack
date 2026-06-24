<template>
  <n-card :bordered="false" style="width: 200px">
    <n-skeleton height="200px" width="160px" style="margin: 0 auto 8px" />
    <n-skeleton text :repeat="2" />
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSkeleton } from 'naive-ui'
</script>
