# 路由配置

## 路由列表

### 公共路由（无需认证）

| 路径 | 组件 | 说明 |
|------|------|------|
| / | 重定向到 /books | 首页重定向 |
| /books | views/public/Search.vue | 图书搜索页面 |
| /books/:id | views/public/BookDetail.vue | 图书详情页面 |
| /login | views/public/Login.vue | 登录页面 |

### 管理员路由（role: admin）

| 路径 | 组件 | 说明 |
|------|------|------|
| /admin/dashboard | views/admin/Dashboard.vue | 仪表盘 |
| /admin/books | views/admin/Books.vue | 图书管理 |
| /admin/borrows | views/admin/Borrows.vue | 借阅管理 |
| /admin/categories | views/admin/Categories.vue | 分类管理 |
| /admin/circulation | views/admin/Circulation.vue | 流通管理 |
| /admin/fines | views/admin/Fines.vue | 罚款管理 |
| /admin/readers | views/admin/Readers.vue | 读者管理 |
| /admin/settings | views/admin/Settings.vue | 设置页面 |
| /admin/stats | views/admin/Stats.vue | 统计页面 |

### 读者路由（role: reader）

| 路径 | 组件 | 说明 |
|------|------|------|
| /reader/books | views/reader/Books.vue | 读者图书浏览 |
| /reader/my-borrows | views/reader/MyBorrows.vue | 我的借阅 |
| /reader/profile | views/reader/Profile.vue | 个人资料 |

### 404 路由

| 路径 | 组件 | 说明 |
|------|------|------|
| /:pathMatch(.*)* | 重定向到 /books | 404重定向 |

## 路由守卫

### 全局前置守卫

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 公共页面
  if (publicRoutes.includes(to.path)) {
    next()
    return
  }
  
  // 需要认证的页面
  if (!authStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 权限检查
  if (to.path.startsWith('/admin') && authStore.user?.role !== 'admin') {
    next('/reader/books')
    return
  }
  
  if (to.path.startsWith('/reader') && authStore.user?.role !== 'reader') {
    next('/admin/dashboard')
    return
  }
  
  next()
})
```

### 权限配置

| 角色 | 允许访问的路由 |
|------|---------------|
| admin | /admin/* |
| reader | /reader/* |
| 未登录 | /books/*, /login |

## 路由配置示例

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 公共路由
    {
      path: '/',
      redirect: '/books'
    },
    {
      path: '/books',
      name: 'Search',
      component: () => import('@/views/public/Search.vue')
    },
    {
      path: '/books/:id',
      name: 'BookDetail',
      component: () => import('@/views/public/BookDetail.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/public/Login.vue')
    },
    // 管理员路由
    {
      path: '/admin',
      redirect: '/admin/dashboard'
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/Dashboard.vue')
    },
    // 读者路由
    {
      path: '/reader',
      redirect: '/reader/books'
    },
    {
      path: '/reader/books',
      name: 'ReaderBooks',
      component: () => import('@/views/reader/Books.vue')
    },
    // 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/books'
    }
  ]
})
```

## 路由开发规范

### 命名规范

- 路由name使用 PascalCase
- 路径使用 kebab-case
- 动态路由参数使用 camelCase

### 组件懒加载

- 所有路由组件使用懒加载
- 使用 `() => import('@/views/xxx.vue')` 格式

### 权限控制

- 管理员路由路径以 `/admin` 开头
- 读者路由路径以 `/reader` 开头
- 公共路由无需权限检查

### 导航方式

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航到指定路由
router.push('/books')

// 导航到带参数的路由
router.push(`/books/${bookId}`)

// 编程式导航
router.push({ name: 'BookDetail', params: { id: bookId } })

// 返回上一页
router.back()
```

## 导航流程

```
1. 用户访问 /admin/dashboard
2. 全局前置守卫检查登录状态
3. 如果未登录，重定向到 /login
4. 如果已登录，检查角色权限
5. 如果角色不是admin，重定向到 /reader/books
6. 如果角色是admin，允许访问
7. 加载对应的组件
```