# Library Full-Stack System (Spring Boot 版)

图书馆全栈管理系统。从原 TypeScript 版（Vue 3 + Fastify + Prisma）完整迁移，功能与画面完全对齐。

**技术栈：** Vue 3 + Naive UI · Spring Boot 3.x + MyBatis · MySQL 8.0 · Maven

---

## 快速开始

```bash
# 后端
./start.sh              # 构建 JAR + 启动 → localhost:8080

# 种子数据（首次需导入）
mysql -h127.0.0.1 -uroot -p library < seed.sql

# 前端
cd frontend
npm install --registry=https://registry.npmmirror.com
npm run dev             # → localhost:5175
```

### 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| 2023110101 | reader123 | 本科生读者 |
| 2022110201 | reader123 | 研究生读者 |

---

## 前端路由

| 路径 | 说明 | 权限 |
|------|------|------|
| `/books` | 图书浏览（卡片网格+分面搜索） | 公开 |
| `/books/:id` | 图书详情（封面+馆藏+借阅/预约） | 公开 |
| `/login` | 登录+注册 | 公开 |
| `/admin/*` | 管理员页面（9个） | admin |
| `/reader/*` | 读者页面（3个） | reader |

---

## 项目状态

| 指标 | 值 |
|------|-----|
| API 端点 | 45 |
| Java 文件 | 71 |
| Vue 文件 | 31 |
| XML Mapper | 8 |
| 测试 | 55 (51 service + 4 controller) ✅ |
| 前端构建 | vite build ✅ |
| 数据库表 | 11 张 |
| 种子数据 | 20 种图书 · 63 复本 · 23 条借阅 |

---

## 项目结构

```
├── pom.xml                       # Maven 构建
├── seed.sql                      # 种子数据
├── AGENTS.md                     # AI 代理规范（命令/API/架构/陷阱）
├── start.sh                      # 构建+启动脚本
├── .mvn/                         # Maven Wrapper
├── src/main/java/com/library/    # 后端 (Spring Boot)
│   ├── controller/   11 个
│   ├── service/       9 个
│   ├── mapper/       11 个接口
│   ├── entity/       11 个
│   ├── dto/          22 个
│   ├── config/        3 个
│   └── util/          1 个
├── src/main/resources/
│   ├── application.yml           # 公共配置
│   ├── application-dev.yml       # 开发环境
│   ├── application-prod.yml      # 生产环境
│   └── mappers/*.xml             # 8 个 MyBatis XML
├── frontend/                     # 前端 (Vue 3 + Vite)
│   └── src/
│       ├── components/  13 个    # 全部原版组件
│       ├── views/       17 个    # 全部页面
│       ├── api/         2 个
│       ├── stores/      2 个
│       └── router/      1 个
└── src/test/                     # 测试
    ├── service/  51 个单元测试
    └── controller/ 4 个集成测试
```

---

## 工程化改进（已完成）

| 优化 | 说明 |
|------|------|
| SQL → XML | 8 个 Mapper 的 SQL 从注解移到 XML，可读性翻倍 |
| Maven Wrapper | `./mvnw` 替代 `mvn`，无需全局安装 |
| JAR 启动 | `./start.sh` 用 `java -jar` 避免 OOM |
| 环境分离 | dev/prod 配置独立，密码不硬编码 |
| Controller 测试 | 新增 4 个端到端测试（H2 内存库） |

**AI 开发入口 → [AGENTS.md](AGENTS.md)**（完整命令、API 路由表、编码规范、架构决策、陷阱记录）
