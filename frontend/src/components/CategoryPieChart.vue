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
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])

const props = defineProps<{
  data: Array<{ name: string; value: number }>
}>()

const colors = ['#5e6ad2', '#f0a020', '#18a058', '#2080f0', '#d03050', '#722ed1', '#eb2f96', '#13c2c2']

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    textStyle: {
      color: '#333',
    },
    formatter: '{b}: {c} 本 ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: {
      color: '#666',
    },
  },
  series: [
    {
      name: '图书分类',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold',
          formatter: '{b}\n{d}%',
        },
      },
      labelLine: {
        show: false,
      },
      data: props.data.map((item, index) => ({
        ...item,
        itemStyle: {
          color: colors[index % colors.length],
        },
      })),
    },
  ],
}))
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 280px;
}
</style>