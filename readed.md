# 图书馆管理系统 — 开发者上手指南

> 目标读者：接手项目的新开发者。
> 如果找 AI 开发参考 → [AGENTS.md](AGENTS.md)；项目简介 → [README.md](README.md)。

---

## 目录

1. [环境准备](#1-环境准备)
2. [5 分钟快速启动](#2-5-分钟快速启动)
3. [按模块开发](#3-按模块开发)
4. [数据库操作](#4-数据库操作)
5. [API 调试](#5-api-调试)
6. [前端开发](#6-前端开发)
7. [测试](#7-测试)
8. [常见问题](#8-常见问题)
9. [项目结构一览](#9-项目结构一览)

---

## 1. 环境准备

| 工具 | 版本要求 | 验证命令 |
|------|----------|----------|
| **JDK** | 17 ~ 21（**Java 25 不兼容**） | `java -version` |
| **Maven** | 3.8+（项目自带 `./mvnw`） | `./mvnw --version` |
| **Node.js** | 18+ | `node -v` |
| **MySQL** | 8.0+ | `mysql --version` |
| **npm** | 9+ | `npm -v` |

**⚠ Java 版本陷阱：** WSL 默认 Java 25 与此项目不兼容。必须手动切到 Java 21：

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
# 建议写入 ~/.bashrc 或每次终端开 new session 时执行
```

---

## 2. 5 分钟快速启动

### 2.1 克隆并建库

```bash
git clone <repo-url>
cd library-full-stack

# 创建数据库
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

### 2.2 初始化数据

```bash
mysql -uroot -p library < seed.sql
```

### 2.3 启动后端（一键）

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
./start.sh
# → Spring Boot 启动在 http://localhost:8080
# 第一次启动会下载依赖，稍等 1-2 分钟
```

自定义数据库密码：

```bash
DB_PASSWORD=你的密码 ./start.sh
```

### 2.4 启动前端

```bash
cd frontend
npm install --registry=https://registry.npmmirror.com
npm run dev
# → 访问 http://localhost:5175
```

### 2.5 登录系统

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| 2023110101 | reader123 | 本科生读者 |
| 2022110201 | reader123 | 研究生读者 |

---

## 3. 按模块开发

### 3.1 后端分层（请求链路）

```
HTTP 请求
  → JwtAuthFilter（鉴权：检查 token、判断 public path）
  → Controller（参数校验 @Valid / 路由分发）
  → Service（@Transactional 业务逻辑）
  → Mapper（MyBatis @Mapper → XML SQL）
  → MySQL
```

### 3.2 关键路径：改代码 → 生效

**后端改 Java：** 保存后 `Ctrl+C` 停止 → 重新 `./start.sh` 或单独：

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
./mvnw compile spring-boot:run -DskipTests
```

**后端只编译不启动（检查编译错误）：**

```bash
./mvnw compile
```

**前端改 Vue：** Vite HMR 热更新，保存即生效，无需重启。

### 3.3 新增一个 API 端点（完整步骤）

```
① entity/     → 建 POJO（如果新表）
② mapper/     → 建 Mapper 接口 + mapper XML
③ service/    → 写 @Service 业务逻辑
④ dto/request/  → 建请求 DTO（含 @Valid 注解）
⑤ dto/response/ → 建响应 DTO
⑥ controller/ → 建 Controller 端点
⑦ JwtAuthFilter.isPublicPath()  → 如公开端点需注册
```

### 3.4 数据库列名提示

MyBatis 默认下划线转驼峰已开启（`map-underscore-to-camel-case: true`），但 **SQL 里的列名必须和数据库实际列名一致**：

```sql
-- 确认实际列名
SHOW CREATE TABLE books;
-- 如果实际列名是 userId（驼峰），SQL 中用 userId
-- 如果实际列名是 user_id（下划线），SQL 中用 user_id
```

`@Result(column = "...")` 注解中的 column 值也要和结果集的列名一致。

---

## 4. 数据库操作

### 4.1 重置数据

```bash
mysql -uroot -p -e "DROP DATABASE library; CREATE DATABASE library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -uroot -p library < seed.sql
```

### 4.2 查看表结构

```bash
mysql -uroot -p library -e "SHOW TABLES"
mysql -uroot -p library -e "SHOW CREATE TABLE books\G"
```

### 4.3 常用查询

```sql
-- 当前借出记录
SELECT b.title, br.borrow_date, br.due_date, u.username
FROM borrows br
JOIN book_items bi ON br.book_item_id = bi.id
JOIN books b ON bi.book_id = b.id
JOIN users u ON br.user_id = u.id
WHERE br.status = 'active';

-- 逾期图书
SELECT * FROM borrows WHERE due_date < NOW() AND status = 'active';
```

### 4.4 数据库凭证

| 配置 | 默认值 |
|------|--------|
| URL | `jdbc:mysql://127.0.0.1:3306/library` |
| 用户 | root |
| 密码 | 环境变量 `DB_PASSWORD`（dev 默认 `li200603`） |

生产环境必须通过环境变量传密码，**禁止硬编码**。

---

## 5. API 调试

### 5.1 用 curl 测试（无需前端启动）

先获取 token：

```bash
# 登录 → 拿到 token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo $TOKEN
```

然后测试各端点：

```bash
# 公开：图书列表
curl -s http://localhost:8080/api/books | head -c 500

# 需认证：我的借阅
curl -s http://localhost:8080/api/borrows/my -H "Authorization: Bearer $TOKEN"

# 管理员：所有用户
curl -s http://localhost:8080/api/auth/users -H "Authorization: Bearer $TOKEN"

# 管理员：统计数据
curl -s http://localhost:8080/api/stats -H "Authorization: Bearer $TOKEN"

# 公开：分类列表
curl -s http://localhost:8080/api/categories

# 公开：规则配置
curl -s http://localhost:8080/api/rules

# 健康检查
curl -s http://localhost:8080/api/health
```

### 5.2 用浏览器调试

启动前后端后直接访问 `http://localhost:5175`。打开浏览器开发者工具（F12）：

- **Network 标签** → 查看每个请求的 request/response
- **Console 标签** → 看前端报错
- **Vue DevTools** → 查看组件状态和 Pinia store 数据

### 5.3 查看后端日志

```bash
# 后端日志在容器输出中实时显示
# 如果 start.sh 在运行，直接看终端输出

# 单独看日志文件（如果配了 logging.file）
tail -f logs/spring.log
```

---

## 6. 前端开发

### 6.1 目录结构速览

```
frontend/src/
├── api/          # Axios 请求封装（index.ts 统一配置拦截器）
├── stores/       # Pinia 状态管理（auth.ts, books.ts）
├── router/       # vue-router 路由配置
├── types/        # TypeScript 类型定义
├── composables/  # 可组合函数（分页、防抖）
├── components/   # 公共组件（13 个）
├── views/        # 页面组件（17 个——按角色分 admin/public/reader）
├── App.vue       # 根组件
└── main.ts       # 入口
```

### 6.2 导入路径注意

`views/admin/Books.vue` 引用 `components/` 时需用 `../../components/XXX`（三级目录深）。新增文件后务必 `npm run build` 验证。

### 6.3 常用操作

```bash
# 开发运行（热更新）
npm run dev

# 构建生产包
npm run build

# 安装依赖（国内镜像）
npm install --registry=https://registry.npmmirror.com
```

### 6.4 前端端口

默认 `:5175`。如果端口被占用，Vite 会自动递增。CORS 配置已包含 `5173`、`5174`、`5175`。

---

## 7. 测试

### 7.1 后端测试（55 个）

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
./mvnw test
# 必须全部通过（0 failures）
```

单个测试类：

```bash
./mvnw test -Dtest=BookControllerTest
```

### 7.2 测试注意事项

- 后端测试使用 H2 内存数据库（`application-test.yml`），需安装 H2 依赖
- 前端暂无自动化测试

---

## 8. 常见问题

### 8.1 启动失败

| 症状 | 原因 | 解决 |
|------|------|------|
| `Unsupported class file major version 67` | Java 版本太高（25） | `export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64` |
| `Port 8080 already in use` | 端口被占用 | `kill -9 $(lsof -ti:8080)` |
| `java.lang.OutOfMemoryError` | Maven 反复重启耗尽内存 | 用 `./mvnw clean package -DskipTests -q && java -jar target/*.jar` 替代 `spring-boot:run` |
| `Unknown column 'b.category_id'` | SQL 列名不匹配 | `SHOW CREATE TABLE` 确认实际列名 |
| 前端请求报 403 CORS | 前端端口不在允许列表 | 后端 `WebConfig.java` 添加前端实际端口 |
| npm install 慢/失败 | 网络不通 | `--registry=https://registry.npmmirror.com` |
| 浏览器访问页面空白 | Vite HMR 未检出文件变更 | 重启 `npm run dev` |

### 8.2 关闭所有服务

```bash
kill -9 $(lsof -ti:8080) $(lsof -ti:5175)
```

---

## 9. 项目结构一览

```
library-full-stack/
├── src/                        # Spring Boot 后端
│   └── main/
│       ├── java/com/library/
│       │   ├── LibraryApplication.java    # 入口
│       │   ├── config/                    # JWT 鉴权过滤器 + CORS + 拦截器
│       │   ├── controller/                # 45 个 REST 端点（11 个文件）
│       │   ├── service/                   # @Transactional 业务层（9 个文件）
│       │   ├── mapper/                    # MyBatis 接口（11 个文件）
│       │   ├── entity/                    # POJO 实体（11 个文件）
│       │   ├── dto/request/               # 请求体 DTO（含校验注解）
│       │   ├── dto/response/              # 响应 DTO
│       │   ├── exception/                 # 统一异常处理
│       │   └── util/JwtUtil.java          # JWT 工具
│       └── resources/
│           ├── application.yml            # 通用配置
│           ├── application-dev.yml        # 开发环境配置
│           ├── application-prod.yml       # 生产环境配置
│           └── mapper/                    # MyBatis XML（9 个文件）
├── frontend/                   # Vue 3 前端
│   └── src/
│       ├── api/                # Axios API 封装
│       ├── stores/             # Pinia 状态管理
│       ├── router/             # 路由配置
│       ├── types/              # TS 类型
│       ├── composables/        # 组合式函数
│       ├── components/         # 13 个公共组件
│       └── views/              # 17 个页面
├── schema.sql                  # 数据库建表语句
├── seed.sql                    # 种子数据
├── start.sh                    # 一键启动脚本
├── pom.xml                     # Maven 构建配置
├── AGENTS.md                   # AI 开发参考
├── readed.md                   # ← 你正在看的这个文件
└── README.md                   # 项目简介
```

**计数：** 45 个 API 端点 · 71 个 Java 文件 · 31 个 Vue 文件 · 9 个 XML Mapper · 55 个测试
