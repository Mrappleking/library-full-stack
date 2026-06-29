# Library Full-Stack System

图书馆全栈管理系统。四层架构（前端→路由→服务→数据），三层业务深度（书目→复本→规则引擎）。

**技术栈：** TypeScript · Vue 3 + Naive UI · Fastify · Prisma 5 · MySQL

---

## 快速开始

```bash
# 1. 数据库
mysql -u root -p -e "CREATE DATABASE library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# 2. 后端
cd backend
cp .env.example .env   # 编辑 DATABASE_URL + JWT_SECRET
npm install
npx prisma db push
npx prisma db seed
npm run dev             # → localhost:3000

# 3. 前端
cd frontend
npm install
npm run dev             # → localhost:5173
```

默认账号：admin / admin123；读者：2023110101 / reader123（张三·本科生）

---

## 项目状态

| 指标 | 值 |
|------|-----|
| 版本 | v0.4.0 (14 轮审计, 95 fixes) |
| API 端点 | 40 |
| 测试 | 106/106 PASS (52 service + 54 route) |
| 前端构建 | vite build ✅ |
| ESLint | 0 errors |
| 仓库 | https://github.com/Mrappleking/library-full-stack |

---

## 架构与规范

全部开发规范、API 路由表、架构决策、错误处理、测试策略等见 [AGENTS.md](AGENTS.md)（AI 代理和开发者共用入口）。
