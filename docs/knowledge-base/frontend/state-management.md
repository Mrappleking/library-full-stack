# 状态管理

## Pinia Store 列表

| Store | 文件 | 职责 |
|-------|------|------|
| auth | stores/auth.ts | 用户认证状态管理 |
| books | stores/books.ts | 图书相关状态管理 |
| theme | stores/theme.ts | 主题状态管理 |

## auth Store

**职责**：管理用户认证状态，包括登录、登出、Token管理

### State

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| token | String | '' | JWT令牌 |
| user | UserProfile | null | 当前用户信息 |
| isLoggedIn | Boolean | false | 是否已登录 |

### Actions

| Action | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| login | LoginRequest | Promise\<LoginResponse\> | 用户登录 |
| logout | 无 | void | 用户登出 |
| getMe | 无 | Promise\<UserProfile\> | 获取当前用户信息 |
| setToken | token: String | void | 设置Token |
| clearToken | 无 | void | 清除Token |

### 使用示例

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 登录
const handleLogin = async () => {
  try {
    await authStore.login({
      username: 'admin',
      password: 'Admin@2024'
    })
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 登出
const handleLogout = () => {
  authStore.logout()
}

// 获取用户信息
const loadUser = async () => {
  await authStore.getMe()
}
</script>
```

### Token 存储机制

```
登录成功 → Token 存储到 localStorage
          ↓
每次请求 → 请求头携带 Authorization: Bearer <token>
          ↓
Token过期 → 后端返回401 → 前端清除Token并跳转登录页
```

## books Store

**职责**：管理图书相关状态，包括搜索条件、分页、选中图书

### State

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| searchKeyword | String | '' | 搜索关键词 |
| categoryId | Number | null | 分类筛选ID |
| currentPage | Number | 1 | 当前页码 |
| pageSize | Number | 20 | 每页数量 |
| sortBy | String | 'title' | 排序字段 |
| sortOrder | String | 'asc' | 排序方向 |
| selectedBook | BookResponse | null | 选中的图书 |

### Actions

| Action | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| setSearchKeyword | keyword: String | void | 设置搜索关键词 |
| setCategoryId | id: Number | void | 设置分类ID |
| setPage | page: Number | void | 设置页码 |
| setSelectedBook | book: BookResponse | void | 设置选中图书 |
| resetFilters | 无 | void | 重置筛选条件 |

### 使用示例

```vue
<script setup lang="ts">
import { useBooksStore } from '@/stores/books'

const booksStore = useBooksStore()

// 设置搜索关键词
booksStore.setSearchKeyword('算法')

// 设置分类筛选
booksStore.setCategoryId(1)

// 设置页码
booksStore.setPage(2)

// 重置筛选条件
booksStore.resetFilters()
</script>
```

## theme Store

**职责**：管理主题状态，支持深色/浅色模式切换

### State

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| isDark | Boolean | false | 是否深色模式 |

### Actions

| Action | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| toggle | 无 | void | 切换主题 |
| setDark | isDark: Boolean | void | 设置深色模式 |
| init | 无 | void | 初始化主题（读取系统偏好） |

### 使用示例

```vue
<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// 切换主题
themeStore.toggle()

// 设置为深色模式
themeStore.setDark(true)

// 初始化（在main.ts中调用）
themeStore.init()
</script>
```

### 主题初始化流程

```
1. 页面加载时调用 themeStore.init()
2. 检查 localStorage 中是否有主题偏好
3. 如果没有，检查系统主题偏好（window.matchMedia）
4. 设置 Naive UI 的主题
5. 更新 isDark 状态
```

## Store 开发规范

### 创建新 Store

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExampleStore = defineStore('example', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  
  // Computed
  const itemCount = computed(() => items.value.length)
  
  // Actions
  const fetchItems = async () => {
    loading.value = true
    // API调用
    loading.value = false
  }
  
  const addItem = (item) => {
    items.value.push(item)
  }
  
  return {
    items,
    loading,
    itemCount,
    fetchItems,
    addItem
  }
})
```

### 使用规范

- 使用 `defineStore` 定义 Store
- 使用 `ref` 定义 State
- 使用 `computed` 定义计算属性
- 使用 async/await 处理异步操作
- 在组件中使用 `useXXXStore()` 获取 Store 实例

### 持久化

- Token 使用 localStorage 持久化
- 主题偏好使用 localStorage 持久化
- 其他状态不持久化，页面刷新后重置