# Library Full-Stack System (Spring Boot 版)

图书馆全栈管理系统。从原版 TypeScript（Fastify + Prisma + NaiveUI）完整迁移，功能画面完全对齐。

**技术栈：** Vue 3 + Naive UI · Spring Boot 3.x + MyBatis · MySQL 8.0 · Maven

---

## 快速开始

```bash
# 后端（构建JAR + 启动 → :8080）
./start.sh

# 种子数据（首次需要）
mysql -h127.0.0.1 -uroot -p library < seed.sql

# 前端（→ :5175）
cd frontend
npm install --registry=https://registry.npmmirror.com
npm run dev
```

### 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| 2023110101 | reader123 | 本科生读者 |
| 2022110201 | reader123 | 研究生读者 |

---

## 开发规范

### 新增一个功能的标准流程

```
① Issue → ② Fork / 建分支 → ③ 实现 → ④ 自测 → ⑤ PR → ⑥ Review → ⑦ 合并
```

**① 提 Issue**：描述需求/问题，明确预期结果和验收标准。见 GitHub Issues 模板。

**② 分支命名**：`fix/xxx`（修复）、`feat/xxx`（新功能）、`refactor/xxx`（重构）。

**③ 实现检查清单**：

| 检查项 | 说明 |
|--------|------|
| 数据库列名 | 用 `SHOW CREATE TABLE 表名` 确认实际列名（驼峰/下划线混用）**
| 新增 API | Controller 参数用 `@RequestParam` 收集，禁止直接 `HttpServletRequest` |
| 错误消息 | 全部中文，格式与 `AppException` 全局处理一致 |
| 权限 | 写操作必须有鉴权，区分管理员/读者角色 |
| 事务 | 多 DAO 写入必须加 `@Transactional` |
| MyBatis SQL | 复杂动态 SQL 写到 XML 文件，不要嵌在注解字符串里 |

**④ 自测标准**：

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
./mvnw test    # 全量测试必须通过
```

- 新增 >50 行功能代码：必须附带单元测试
- 新增 >20 行：强烈建议加测试
- 至少覆盖：正常路径 + 边界条件 + 错误路径

**⑤ PR 编写**：

```text
PR 标题: <type>: <简短描述> (closes #N)
PR 正文: 
  - 改了什么（逐条）
  - 关联 issue 编号
  - 测试结果截图/日志
```

**⑥ Review 标准**：

Reviewer 必须逐条对照 issue 原文验证，不可凭"扫视觉得没问题"就合并。详见 GitHub Projects 看板中的审查清单。

**⑦ 合并**：squash merge，保持 main 历史干净。

---

### 多维度查询设计规范（重要）

当新增多个同层级查询（如多个 facet 维度、多个统计聚合）时，**必须列出维度覆盖矩阵**逐格验证参数穿透，禁止凭直觉逐个写 SQL。

正确做法示例（以 facet 查询为例）：

```
                 search  categoryId  language  yearMin  yearMax  campus  location
language facet     ✅        ✅                  ✅       ✅
subject facet      ✅                   ✅      ✅       ✅
yearRange facet    ✅        ✅        ✅      ✅       ✅
campus facet       ✅        ✅        ✅      ✅       ✅        —        ✅
location facet     ✅        ✅        ✅      ✅       ✅        ✅        —
```

矩阵完成后，每个 `❌` 必须有一个设计理由（为什么这个维度不需要这个参数），否则就是遗漏。

### 代码风格

| 项 | 规范 |
|----|------|
| Java | Spring Boot 3 + MyBatis 标准三层 |
| 前端 | Vue 3 Composition API + TypeScript |
| 数据库列名 | 新表统一全小写下划线（`created_at`），与 MyBatis `map-underscore-to-camel-case` 配合 |
| 错误消息 | 全中文，`AppException` 统一抛出 |
| 测试 | Mockito + JUnit 5，service 层测试继承 `AbstractServiceTest` |
| 提交信息 | `type: 中文描述`（type: fix/feat/refactor/docs/chore/test） |

### 提交流程速查

```bash
# 假设在功能分支上
git add -A
git commit -m "fix: 修复XXX问题"
git push origin <分支名>
# → GitHub 上开 PR，关联 issue
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `JAVA_HOME` | 必设 | WSL 必须指向 Java 21 |
| `DB_PASSWORD` | `li200603` | 数据库密码（dev profile） |
| `JWT_SECRET` | 内置默认 | 仅开发用，生产必须改 |

**安全：** 禁止在注释、commit message、seed.sql 中写密码。禁止提交含密码的配置文件。

---

## 项目状态

45 API endpoints · 71 Java files · 31 Vue files · 8 XML mappers · 55 tests ✅

---

## 开发注意事项

### 后端

- **SQL 只写 XML。** MyBatis SQL 全部在 `src/main/resources/mappers/*.xml`，不要在 Java 注解里写 SQL（历史教训：注解 SQL 和 XML 同时定义同一 statement 会报 `Mapped Statements collection already contains key`）
- **列名陷阱。** 数据库列名混合 `categoryId`（camelCase）和 `created_at`（snake_case），写 SQL 前必须 `SHOW CREATE TABLE` 确认实际列名
- **事务覆盖。** `borrow()` / `returnBook()` / `payFine()` 等多 DAO 写入必须加 `@Transactional`，缺少会因并发导致数据不一致
- **启动方式。** 用 `./start.sh`，不要 `mvn spring-boot:run`（OOM 问题）
- **创建数据库（如果尚未创建）**
mysql -h127.0.0.1 -uroot -p -e "CREATE DATABASE IF NOT EXISTS library;"
- **导入种子数据**
mysql -h127.0.0.1 -uroot -p library < seed.sql
### 前端

- **镜像源。** 始终用 `npm install --registry=https://registry.npmmirror.com`
- **组件库。** Naive UI（`n-data-table`、`n-button` 等） + `@vicons/ionicons5` 图标
- **无 emoji。** 用 SVG 线条图标替代 emoji
- **API 代理。** 前端开发服务器 :5175 自动代理 `/api` → 后端 :8080
- **CORS。** 后端配置了两个允许来源 5173 和 5175，两版前端可同时运行对比

### 全栈

- **提交前跑测试。** `./mvnw test`（55 个测试全部通过再提交）

---

## 文档导航

| 文件 | 用途 |
|------|------|
| [AGENTS.md](AGENTS.md) | AI 开发参考 — 命令/API 路由表/编码规范/架构决策/错误陷阱 |
| seed.sql | 种子数据（3 类读者 · 20 种书 · 63 复本 · 23 借阅） |
