<template>
  <div class="chart-container">
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
])

const props = defineProps<{
  data: Array<{ month: string; borrows: number }>
  isDark?: boolean
}>()

const chartOption = computed(() => {
  const months = props.data.map(d => d.month)
  const borrows = props.data.map(d => d.borrows)

  const bgColor = props.isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const borderColor = props.isDark ? '#4b5563' : '#e0e0e0'
  const textColor = props.isDark ? '#e5e7eb' : '#333'
  const axisLabelColor = props.isDark ? '#9ca3af' : '#666'
  const axisLineColor = props.isDark ? '#4b5563' : '#ddd'
  const splitLineColor = props.isDark ? '#374151' : '#f0f0f0'

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: bgColor,
      borderColor,
      borderWidth: 1,
      textStyle: { color: textColor },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
      axisLine: { lineStyle: { color: axisLineColor } },
      axisLabel: { color: axisLabelColor },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: axisLabelColor },
      splitLine: { lineStyle: { color: splitLineColor } },
    },
    series: [
      {
        name: '借阅量',
        type: 'line',
        smooth: true,
        data: borrows,
        lineStyle: { color: '#5e6ad2', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(94, 106, 210, 0.3)' },
              { offset: 1, color: 'rgba(94, 106, 210, 0.05)' },
            ],
          },
        },
        itemStyle: { color: '#5e6ad2' },
      },
    ],
  }
})
</script>

<style scoped>
.chart-container { width: 100%; height: 100%; }
.chart { width: 100%; height: 280px; }
</style>