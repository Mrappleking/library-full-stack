# Library Full-Stack System — 项目总结

> 📅 生成日期: 2026-06-29 | 📌 版本: v0.4.0 | 🏷️ 分支: main

---

## 1. 项目概览

图书馆全栈管理系统，一个面向高校图书馆的业务管理系统，涵盖从书目管理、复本流通到借阅规则引擎的完整图书馆工作流。

| 维度 | 详情 |
|------|------|
| **项目类型** | 全栈 Web 应用 (Monorepo) |
| **技术栈** | TypeScript · Vue 3 + Naive UI · Fastify · Prisma 5 · MySQL |
| **仓库** | https://github.com/Mrappleking/library-full-stack |
| **架构** | 四层架构: 前端 → 路由 → 服务(pure functions) → 数据 |
| **业务深度** | 三层: 书目(Bibliographic) → 复本(Item/Holdings) → 规则引擎(Circulation Rules) |

---

## 2. 技术架构

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│   Vue 3 + Vite + Naive UI + Pinia + Vue Router  │
│   • 13 可复用组件                                │
│   • 3 角色视图: admin / reader / public          │
│   • Typed HTTP client (fetch, 无 axios)          │
│   • @vicons/ionicons5 SVG 图标                   │
│   • JsBarcode 条码打印                            │
└──────────────────────┬──────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────┐
│                   Backend                        │
│   Fastify 5 + JWT + CORS + Helmet + Rate-limit  │
│   • 10 路由文件 (≤30 LoC each)                   │
│   • 11 服务文件 (pure functions)                 │
│   • Zod 请求校验                                  │
│   • Swagger 自动文档                              │
└──────────────────────┬──────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────┐
│                   Database                       │
│   MySQL 8.0 · 12 模型 · 6 枚举 · 5 索引          │
│   • Prisma $transaction 保证数据完整性            │
│   • 字符集 utf8mb4                               │
└─────────────────────────────────────────────────┘
```

### 依赖清单

| 层 | 核心依赖 | 版本 |
|----|---------|------|
| 前端 | vue, vue-router, pinia, naive-ui, @vicons/ionicons5, jsbarcode | Vue 3.5 / Naive UI 2.44 |
| 前端构建 | vite, vitest, @vitejs/plugin-vue, vue-tsc, jsdom | Vite 8 / Vitest 4 |
| 后端 | fastify, @prisma/client, zod, bcryptjs, dotenv | Fastify 5 / Prisma 5.22 |
| 后端插件 | @fastify/jwt, @fastify/cors, @fastify/helmet, @fastify/rate-limit, @fastify/swagger | — |
| 后端工具 | vitest, eslint, prettier, husky, lint-staged, typescript | TS 6.0 |

---

## 3. 数据模型 (12 模型 + 6 枚举)

### 核心实体关系

```
User ──┬── BorrowRecord ──┬── Book ──── Category
       │                  │
       ├── Fine           ├── BookItem ── ItemType
       │                  │
       ├── Hold ──────────┤
       │                  │
       └── PatronCategory ┘
                          
CirculationRule ── PatronCategory + ItemType
AuditLog ── User
```

### 模型一览

| 模型 | 说明 | 关键字段 |
|------|------|---------|
| `User` | 用户(读者+管理员) | username, password(bcrypt), role, patronCategoryId, totalFines |
| `PatronCategory` | 读者类型 | 本科生/研究生/教师 |
| `Book` | 书目 | isbn, title, author, total, available, status, language, clcNumber |
| `BookItem` | 复本/馆藏项 | barcode, callNumber, campus, condition, status, requests |
| `Category` | 分类 | name, desc |
| `ItemType` | 资料类型 | 普通图书/新书速递/期刊/工具书, loanDays, fineRate |
| `BorrowRecord` | 借阅记录 | borrowDate, dueDate, returnDate, renewed, status |
| `Fine` | 罚款 | type(overdue/lost/damage), amount, paid |
| `Hold` | 预约 | status(pending/ready/fulfilled/cancelled/expired), expiresAt |
| `CirculationRule` | 流通规则 | patronCategory × itemType → maxBorrows, loanDays, renewals, finePerDay |
| `AuditLog` | 审计日志 | userId, action, target, detail |
| `BookCover` | 图书封面 | 虚拟字段(OpenLibrary CSS fallback) |

### 枚举

`UserRole`(admin/reader) · `BookStatus`(available/borrowed/removed) · `ItemCondition`(normal/damaged/repairing/lost/withdrawn) · `ItemStatus`(available/borrowed/repairing/lost/withdrawn/on_hold) · `FineType`(overdue/lost/damage) · `HoldStatus`(pending/ready/fulfilled/cancelled/expired)

---

## 4. API 全景 (45 端点)

| 模块 | 端点数 | 公开 | 需登录 | 需管理员 | 核心功能 |
|------|--------|------|--------|----------|---------|
| Auth | 5 | 2 | 1 | 2 | 注册·登录·JWT |
| Books | 9 | 5 | 0 | 4 | CRUD·搜索·分面·条码扫码·对账 |
| Categories | 4 | 1 | 0 | 3 | 分类管理 |
| Borrows | 6 | 0 | 4 | 2 | 借书·还书·续借·历史 |
| Holds | 6 | 1 | 3 | 2 | 预约·取消·履行 |
| Readers | 4 | 0 | 1 | 3 | 读者管理·自助编辑 |
| Fines | 3 | 0 | 1 | 2 | 罚款管理·缴纳 |
| Rules | 4 | 3 | 0 | 1 | 流通规则矩阵 |
| Stats | 3 | 0 | 0 | 3 | 概览·热门·月度趋势 |
| System | 1 | 1 | 0 | 0 | 健康检查 |

### 关键业务流程

**借书 (borrow)**: 校验规则(最大借阅数·罚款上限·复本可用) → `$transaction` 内更新 item 状态 + 创建 borrow + 审计

**还书 (return)**: 扫描逾期罚款 → `$transaction` 内更新 item 状态 + 创建 fine(如逾期) + 检查预约队列 → 如有预约则 item → on_hold(available 不变) + hold → ready

**预约 (hold)**: 仅 available=0 时可预约 → 还书时自动提升 pending → ready → 管理员 fulfill → 转为 borrow

---

## 5. 编码规范

### 四层架构铁律

```
Route (≤30 LoC) → Service (pure function) → Prisma → MySQL
   │                    │
   ├─ Zod 校验          ├─ prisma 为第一参数
   ├─ 仅调用 service     ├─ 所有业务逻辑在此
   └─ 仅 return/throw    └─ 事务操作在此
```

### 关键约定

- **ESM**: imports 必须以 `.js` 结尾
- **错误处理**: 统一 `{ error, details }` 格式, Route 仅 `throw`, `setErrorHandler` 统一拦截
- **数据完整性**: borrow/return/payFine/cancelHold/fulfillHold 必须使用 `prisma.$transaction`
- **前端**: 无 axios, 无内联样式, 无 emoji, 使用 Naive UI + @vicons/ionicons5
- **Git**: 分支 `<type>/<YYYYMMDD>-<description>`, 提交 `<type>: <verb> <noun>`, PR → main

---

## 6. 质量指标

| 指标 | 数值 |
|------|------|
| 后端测试 | 106/106 PASS (52 service + 54 route) |
| 前端构建 | `vite build` ✅ |
| ESLint | 0 errors |
| 审计轮次 | 14 轮, 95 fixes |
| API 端点 | 45 |
| 种子数据 | 20 书 · 8 读者 · 23 借阅 · 2 罚款 · 3 预约 |
| 覆盖率 | Vitest coverage 已配置 |

---

## 7. 演示数据概览

| 类别 | 数量 | 详情 |
|------|------|------|
| 图书 | 20 | 5 分类, 3 校区(青岛/泰安/济南), 中/英/日文 |
| 读者 | 8 | 本科生/研究生/教师, 含逾期用户 |
| 借阅 | 23 | 跨 12 个月, 含活跃/已归还/逾期 |
| 罚款 | 2 | 已缴 + 未缴各 1 |
| 预约 | 3 | 2 pending + 1 ready |

### 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| 2023110101 | reader123 | 本科生(张三) |
| 2022110201 | reader123 | 研究生(李四, 有逾期) |
| T2023001 | reader123 | 教师(王五) |

---

## 8. 历史决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-06-23 | Monorepo 结构 | 小项目简化管理 |
| 2026-06-23 | Prisma 5 (非 7) | Prisma 7 不支持 MySQL |
| 2026-06-23 | Naive UI 替代 Element Plus | 原生 TypeScript 支持 |
| 2026-06-24 | 强制 `$transaction` | 防止库存漂移 |
| 2026-06-24 | 四层架构 | 路由仅分发, 服务持有逻辑 |
| 2026-06-24 | 服务为纯函数 | 可测试, 一致性 |
| 2026-06-24 | 预约预留系统 | OPAC 功能对等 |
| 2026-06-24 | 浅色主题 + 暗色侧栏 | 用户需求 |
| 2026-06-29 | R14 审计: 13 fixes | 竞态条件, 架构违规 |

---

## 9. 已知陷阱 (Lessons Learned)

1. **无 `.env.example`** → AI 编造错误环境变量 → 始终维护模板
2. **多种错误格式** → 前端解析混乱 → 统一 `setErrorHandler` + `throw`
3. **`Promise.all` 用于借还** → 库存记录不一致 → 始终用 `$transaction`
4. **Vue 内联样式** → 违反 AGENTS.md → 使用 Naive UI 组件
5. **Schema 变更不 generate** → TS 报错 → 及时运行 generate
6. **后端改动不 curl 验证** → 以为 OK 实际 500 → 始终验证
7. **路由直接调用 prisma** → 架构违规 → 委托给 service
8. **还书时 available 增减抵消** → 预约提升时净零 → 预约路径不改变 available
9. **事务外状态校验** → TOCTOU 竞态 → 在 `$transaction` 内校验

---

## 10. 快速启动

```bash
# 数据库
mysql -u root -p -e "CREATE DATABASE library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# 后端
cd backend && cp .env.example .env  # 编辑 DATABASE_URL + JWT_SECRET
npm install && npx prisma db push && npx prisma db seed && npm run dev

# 前端
cd frontend && npm install && npm run dev
```

---

> 📝 本文档基于项目源码、AGENTS.md 和 README.md 生成，供新加入的协作者快速了解项目全貌。
