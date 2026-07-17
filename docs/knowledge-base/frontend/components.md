# 组件说明

## 组件列表

| 组件 | 路径 | 用途 |
|------|------|------|
| AnimatedBackground | components/AnimatedBackground.vue | 登录页动态背景 |
| BaseLayout | components/BaseLayout.vue | 共享布局组件 |
| BookCard | components/BookCard.vue | 图书卡片 |
| BookDetailSection | components/BookDetailSection.vue | 图书详情区域 |
| BookGrid | components/BookGrid.vue | 图书网格布局 |
| CategoryPieChart | components/CategoryPieChart.vue | 分类占比饼图 |
| EmptyState | components/EmptyState.vue | 空状态展示 |
| FacetPanel | components/FacetPanel.vue | 分类筛选面板 |
| HoldingsTable | components/HoldingsTable.vue | 副本表格 |
| LoginBg | components/LoginBg.vue | 登录背景 |
| MonthlyBorrowChart | components/MonthlyBorrowChart.vue | 月度借阅趋势图 |
| SearchBar | components/SearchBar.vue | 搜索栏 |
| SkeletonCard | components/SkeletonCard.vue | 骨架卡片 |
| StatusBadge | components/StatusBadge.vue | 状态标签 |
| ToastContainer | components/ToastContainer.vue | Toast通知容器 |

## 核心组件详解

### BookCard.vue

**功能**：展示图书卡片，悬停显示查看详情按钮

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| book | BookResponse | 是 | 图书数据 |

**Events**：

| Event | 说明 |
|-------|------|
| click | 点击卡片时触发 |
| view-detail | 点击查看详情按钮时触发 |

**使用示例**：

```vue
<BookCard 
  :book="book" 
  @click="handleBookClick"
  @view-detail="handleViewDetail"
/>
```

### BookGrid.vue

**功能**：图书网格布局，支持分页

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| books | BookResponse[] | 是 | 图书列表 |
| loading | Boolean | 否 | 加载状态 |
| total | Number | 否 | 总数 |

**Events**：

| Event | 说明 |
|-------|------|
| page-change | 页码变化时触发 |

### FacetPanel.vue

**功能**：分类筛选面板

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| categories | CategoryResponse[] | 是 | 分类列表 |
| selectedCategory | Number | 否 | 选中的分类ID |

**Events**：

| Event | 说明 |
|-------|------|
| select-category | 选择分类时触发 |

### HoldingsTable.vue

**功能**：图书副本表格

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| items | BookItemRef[] | 是 | 副本列表 |

### SearchBar.vue

**功能**：搜索栏组件

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| modelValue | String | 是 | 搜索关键词（v-model） |

**Events**：

| Event | 说明 |
|-------|------|
| 'update:modelValue' | 值变化时触发 |
| search | 点击搜索时触发 |

### StatusBadge.vue

**功能**：状态标签组件

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | String | 是 | 状态值 |
| type | String | 否 | 标签类型 |

**支持的状态**：

| 状态 | 显示文本 | 样式 |
|------|----------|------|
| available | 可借 | 绿色 |
| borrowed | 在借 | 蓝色 |
| on_hold | 预约中 | 橙色 |
| maintenance | 维护中 | 灰色 |
| pending | 待处理 | 蓝色 |
| ready | 已就绪 | 绿色 |
| fulfilled | 已兑现 | 灰色 |
| cancelled | 已取消 | 红色 |
| active | 进行中 | 蓝色 |
| returned | 已归还 | 绿色 |
| overdue | 逾期 | 红色 |

### ToastContainer.vue

**功能**：全局Toast通知容器

**使用方式**：

```vue
<template>
  <ToastContainer />
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const toast = useToast()

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败')

// 警告提示
toast.warning('请注意')

// 信息提示
toast.info('提示信息')
</script>
```

### BaseLayout.vue

**功能**：共享布局组件，消除admin/reader Layout代码重复

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 是 | 页面标题 |
| role | String | 是 | 用户角色 |

**Slots**：

| Slot | 说明 |
|------|------|
| default | 主内容区域 |
| sidebar | 侧边栏内容 |

### EmptyState.vue

**功能**：空状态展示组件

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 否 | 标题 |
| description | String | 否 | 描述 |

### SkeletonCard.vue

**功能**：骨架卡片，加载时显示

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| count | Number | 否 | 显示数量，默认4 |

### CategoryPieChart.vue

**功能**：分类占比饼图（使用ECharts）

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| data | { name: string; value: number }[] | 是 | 图表数据 |

### MonthlyBorrowChart.vue

**功能**：月度借阅趋势图（使用ECharts）

**Props**：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| data | MonthlyStatsDTO[] | 是 | 月度统计数据 |

## 组件开发规范

### 命名规范

- 组件名使用 PascalCase
- 文件名为组件名 + `.vue`
- Props 使用 camelCase
- Events 使用 kebab-case

### Props 规范

- 必须定义类型
- 建议添加默认值
- 复杂类型使用 interface 定义

### 样式规范

- 使用 scoped style
- 响应式设计使用 Naive UI 的响应式系统
- 深色模式适配使用 CSS 变量或 Naive UI 的主题系统

### 性能优化

- 列表渲染使用 `v-for` 时添加 `:key`
- 复杂计算使用 `computed`
- 大量数据使用虚拟列表
- 组件懒加载使用 `defineAsyncComponent`