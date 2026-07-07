# CONTRIBUTING.md — 开发者协作指南

欢迎为 Library Full-Stack 贡献代码！本文档帮助你快速上手并了解协作规范。

## 1. 环境要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Java | JDK 17+（推荐 21） | 注意：Java 25 不兼容，编译前需设置 `JAVA_HOME` |
| MySQL | 8.0 | 本地 `127.0.0.1:3306`，数据库名 `library` |
| Node.js | 18+ | 前端构建 |
| npm | 随 Node | 建议使用国内镜像：`npm config set registry https://registry.npmmirror.com` |

## 2. 克隆与运行

```bash
# 克隆仓库
git clone https://github.com/Mrappleking/library-full-stack.git
cd library-full-stack

# === 后端 ===
# 创建数据库并导入种子数据
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS library"
mysql -uroot -p library < seed.sql

# 设置 Java 版本（Windows 示例：D:\Java17\jdk）
export JAVA_HOME=/path/to/jdk-21

# 编译测试
./mvnw compile
./mvnw test          # 需全部通过

# 启动后端（端口 8080）
./start.sh           # 开发模式
./start.sh prod      # 生产模式

# === 前端 ===
cd frontend
npm install
npm run dev          # 启动开发服务器（端口 5175）
```

> Windows 用户：使用 `mvnw.cmd` 代替 `./mvnw`，使用 `start.bat` 代替 `./start.sh`。

## 3. Git 分支策略

```
main                    # 生产主分支，只接受 PR 合并
  └── feature/xxx       # 功能分支，从 main 切出
  └── fix/xxx           # 修复分支
  └── docs/xxx          # 文档分支
```

- **永远不要在 `main` 上直接提交代码**
- 从 `main` 创建新分支，命名格式：`feature/<描述>` 或 `fix/<描述>`
- 完成后向 `main` 发起 Pull Request

## 4. Commit 信息规范

使用语义化提交格式：

```
<type>: <简短描述>

<详细说明（可选）>
```

**Type 类型：**

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档变更 |
| `refactor` | 重构（不改变功能） |
| `test` | 测试相关 |
| `chore` | 构建、依赖等杂项 |

**示例：**
```
feat: 添加借阅历史 CSV 导出功能

- 管理员端：GET /api/borrows?export=csv
- 读者端：GET /api/borrows/history?export=csv
```

## 5. 代码风格

### Java 后端

- 注解驱动：`@Service`、`@RestController`、`@Mapper`
- 构造器注入（禁止字段 `@Autowired`）
- 多 DAO 写操作必须加 `@Transactional`
- SQL 全部写在 `mappers/*.xml`，**禁止在 Java 中用 `@Select` / `@Insert` 写 SQL**
- 列名：INSERT/UPDATE 用实际 DB 列名（`snake_case`），MyBatis 查询映射会自动转 `camelCase`
- 错误处理：统一使用 `AppException`，消息用中文
- 更多约定参见 [AGENTS.md](./AGENTS.md)

### Vue 3 前端

- UI 组件库：Naive UI，图标使用 `@vicons/ionicons5`
- 状态管理：Pinia Store
- API 调用：通过 `@/api` 的 Axios 实例，拦截器自动注入 JWT
- 模板中禁止硬编码字符串，复杂逻辑抽到 composables 或 store

### 通用

- 格式化：使用 IDE 默认格式化即可，保持文件末尾空行
- 命名：Java 使用 camelCase，SQL 表/列使用 snake_case，Vue 文件使用 PascalCase

## 6. 测试要求

- 所有 Service 和 Controller 必须有对应单元测试
- Service 测试用 Mockito Mock 所有 Mapper
- Controller 测试用 `@SpringBootTest + @AutoConfigureMockMvc`
- 提交前务必运行 `./mvnw test` 确保全部通过

## 7. Pull Request 流程

1. **创建分支**：从 `main` 切出功能分支
2. **开发**：编写代码 + 测试
3. **自检**：`./mvnw test` 全部通过，前端 `npm run build` 无报错
4. **提交**：遵循 Commit 信息规范
5. **推送**：`git push origin <branch-name>`
6. **创建 PR**：在 GitHub 发起 Pull Request
   - 标题简洁明了
   - 描述包含：改动内容、测试情况
7. **Code Review**：至少 1 人 Review 通过后合并
8. **关闭**：PR 合并后自动关闭关联 Issue

## 8. 项目结构速览

```
library-full-stack/
├── src/main/java/com/library/    # 后端源码
│   ├── controller/                # REST 控制器
│   ├── service/                   # 业务逻辑（@Transactional）
│   ├── mapper/                    # MyBatis Mapper 接口
│   ├── entity/                    # 数据库实体
│   └── dto/                       # 请求/响应 DTO
├── src/main/resources/mappers/    # Mapper XML（SQL 语句）
├── frontend/src/                  # 前端源码
│   ├── api/                       # Axios API 封装
│   ├── views/                     # 页面组件（admin/reader/public）
│   ├── components/                # 通用组件
│   ├── stores/                    # Pinia 状态管理
│   └── types/                     # TypeScript 类型定义
├── schema.sql                     # 数据库结构
├── seed.sql                       # 种子数据
└── AGENTS.md                      # AI Agent 指令文件
```

## 9. 常见问题

| 问题 | 解决 |
|------|------|
| `release version 17 not supported` | 设置 `JAVA_HOME` 为 JDK 17/21 |
| `Unknown column 'xxx'` | 检查 INSERT/UPDATE 列名是否为实际 DB 列名 |
| `Mapped Statements collection already contains key` | 移除 Java 注解中的重复 `@Select` |
| 前端 500 错误 | 确认 `vite.config.ts` 中 proxy target 端口为 8080 |
| 测试失败 | 确保 MySQL 在运行，测试用 H2 内存数据库 |
