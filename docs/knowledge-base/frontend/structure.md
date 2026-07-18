# 前端项目结构

## 目录结构

```
frontend/
├── src/
│   ├── api/                          # API调用模块
│   │   ├── index.ts                  # Axios配置与拦截器
│   │   ├── books.ts                  # 图书API
│   │   ├── borrows.ts                # 借阅API
│   │   ├── categories.ts             # 分类API
│   │   ├── fines.ts                  # 罚款API
│   │   ├── holds.ts                  # 预约API
│   │   ├── readers.ts                # 读者API
│   │   ├── stats.ts                  # 统计API
│   │   └── ...                       # 其他模块API
│   ├── components/                   # 公共组件
│   │   ├── AnimatedBackground.vue    # 动态背景
│   │   ├── BaseLayout.vue            # 基础布局
│   │   ├── BookCard.vue              # 图书卡片
│   │   ├── BookDetailSection.vue     # 图书详情
│   │   ├── BookGrid.vue              # 图书网格
│   │   ├── FacetPanel.vue            # 分类面板
│   │   ├── HoldingsTable.vue         # 副本表格
│   │   ├── SearchBar.vue             # 搜索栏
│   │   ├── StatusBadge.vue           # 状态标签
│   │   ├── ToastContainer.vue        # Toast容器
│   │   └── ...                       # 其他组件
│   ├── composables/                  # 组合式函数
│   │   ├── index.ts                  # 导出入口
│   │   └── useToast.ts               # Toast通知
│   ├── router/                       # 路由配置
│   │   └── index.ts                  # 路由定义
│   ├── stores/                       # Pinia状态管理
│   │   ├── auth.ts                   # 认证状态
│   │   ├── books.ts                  # 图书状态
│   │   └── theme.ts                  # 主题状态
│   ├── styles/                       # 样式文件
│   │   └── global.css                # 全局样式
│   ├── types/                        # 类型定义
│   │   └── api.ts                    # API接口类型
│   ├── utils/                        # 工具函数
│   │   └── errorMonitor.ts           # 错误监控
│   ├── views/                        # 页面视图
│   │   ├── admin/                    # 管理员页面
│   │   │   ├── Books.vue             # 图书管理
│   │   │   ├── Borrows.vue           # 借阅管理
│   │   │   ├── Categories.vue        # 分类管理
│   │   │   ├── Circulation.vue       # 流通管理
│   │   │   ├── Dashboard.vue         # 仪表盘
│   │   │   ├── Fines.vue             # 罚款管理
│   │   │   ├── Readers.vue           # 读者管理
│   │   │   ├── Settings.vue          # 设置页面
│   │   │   ├── Stats.vue             # 统计页面
│   │   │   └── Layout.vue            # 管理员布局
│   │   ├── public/                   # 公共页面
│   │   │   ├── BookDetail.vue        # 图书详情
│   │   │   ├── Login.vue             # 登录页面
│   │   │   └── Search.vue            # 搜索页面
│   │   └── reader/                   # 读者页面
│   │       ├── Books.vue             # 读者图书列表
│   │       ├── MyBorrows.vue         # 我的借阅
│   │       ├── Profile.vue           # 个人资料
│   │       └── Layout.vue            # 读者布局
│   ├── App.vue                       # 根组件
│   └── main.ts                       # 入口文件
├── .env                              # 环境变量
├── index.html                        # HTML模板
├── package.json                      # 依赖配置
├── tsconfig.json                     # TypeScript配置
├── tsconfig.node.json                # TypeScript Node配置
└── vite.config.ts                    # Vite配置
```

## 文件职责说明

### API层

| 文件 | 职责 |
|------|------|
| api/index.ts | Axios实例配置、请求/响应拦截器、统一错误处理 |
| api/books.ts | 图书相关API调用（列表、详情、创建、更新、删除） |
| api/borrows.ts | 借阅相关API调用（借阅、归还、续借、借阅记录） |
| api/categories.ts | 分类相关API调用（列表、创建、更新、删除） |
| api/fines.ts | 罚款相关API调用（列表、支付） |
| api/holds.ts | 预约相关API调用（创建、取消、兑现） |
| api/readers.ts | 读者相关API调用（列表、详情、编辑） |
| api/stats.ts | 统计相关API调用（概览、热门、月度） |

### 组件层

| 文件 | 职责 |
|------|------|
| AnimatedBackground.vue | 登录页动态背景动画 |
| BaseLayout.vue | 共享布局组件（消除admin/reader Layout代码重复） |
| BookCard.vue | 图书卡片组件（悬停显示详情按钮） |
| BookDetailSection.vue | 图书详情展示区域 |
| BookGrid.vue | 图书网格布局 |
| FacetPanel.vue | 分类筛选面板 |
| HoldingsTable.vue | 图书副本表格 |
| SearchBar.vue | 搜索栏组件 |
| StatusBadge.vue | 状态标签组件 |
| ToastContainer.vue | Toast通知容器 |

### 状态管理层

| 文件 | 职责 |
|------|------|
| stores/auth.ts | 用户认证状态（token、用户信息、登录/登出） |
| stores/books.ts | 图书相关状态（搜索条件、分页、选中图书） |
| stores/theme.ts | 主题状态（深色/浅色模式切换） |

### 视图层

| 文件 | 职责 |
|------|------|
| views/admin/Books.vue | 管理员图书管理页面 |
| views/admin/Borrows.vue | 管理员借阅管理页面 |
| views/admin/Categories.vue | 管理员分类管理页面 |
| views/admin/Circulation.vue | 管理员流通管理页面（条码扫描） |
| views/admin/Dashboard.vue | 管理员仪表盘（统计卡片、图表） |
| views/admin/Fines.vue | 管理员罚款管理页面 |
| views/admin/Readers.vue | 管理员读者管理页面 |
| views/admin/Settings.vue | 管理员设置页面（规则管理） |
| views/admin/Stats.vue | 管理员统计页面 |
| views/public/BookDetail.vue | 公共图书详情页面 |
| views/public/Login.vue | 登录页面 |
| views/public/Search.vue | 公共搜索页面 |
| views/reader/Books.vue | 读者图书浏览页面 |
| views/reader/MyBorrows.vue | 读者借阅记录页面 |
| views/reader/Profile.vue | 读者个人资料页面 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4+ | 前端框架 |
| Vite | 5.2+ | 构建工具 |
| Naive UI | 2.38+ | UI组件库 |
| Pinia | 2.1+ | 状态管理 |
| vue-router | 4.3+ | 路由管理 |
| Axios | 1.6+ | HTTP客户端 |
| TypeScript | 5.4+ | 类型安全 |
| ECharts | 5.5+ | 图表组件 |
| @vicons/ionicons5 | 0.12+ | 图标库 |

## 开发命令

```bash
# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 开发模式（端口5175）
npm run dev

# 生产构建
npm run build

# 类型检查
npx vue-tsc --noEmit
```

## 环境变量

```bash
# .env文件
VITE_APP_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=Library Management System
```

## 项目启动流程

```
1. 执行 npm install
2. 执行 npm run dev
3. Vite启动开发服务器（端口5175）
4. 请求代理到后端（/api -> :8080）
5. 前端加载main.ts -> App.vue -> router -> 对应页面
```