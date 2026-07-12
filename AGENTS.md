# Library Full-Stack — AGENTS.md

> AI agent instruction file for the Java (Spring Boot) version.
> Must match the original TypeScript version (Fastify + Prisma + NaiveUI) feature-by-feature.
> For human-readable introduction see README.md.

## 1. Project Overview

图书馆全栈管理系统（Spring Boot 3 版）。四层架构：Vue3+NaiveUI（`frontend/`）→ Controller → Service → Mapper(MyBatis+XML) → MySQL。

Origin: https://github.com/Mrappleking/library-full-stack
Status: 45 API endpoints | 71 Java files | 31 Vue files | 9 XML mappers | 102 tests

## 2. Error Zone

| # | 错误的操作 | 后果 | 正确做法 |
|---|-----------|------|---------|
| 1 | `mvn spring-boot:run` 直接运行 | 被 OOM killer 杀 (exit 137) | 用 `./start.sh` 或 `java -jar target/*.jar` |
| 2 | DB 列名写成 snake_case | MyBatis 报 Unknown column | 对照 `SHOW CREATE TABLE` 确认实际列名（混合 camelCase/snake_case） |
| 3 | SQL 嵌在 Java 注解字符串中 | 超 5 行的动态 SQL 不可读不可调 | 抽到 `src/main/resources/mappers/*.xml` |
| 4 | `@Transactional` 缺失 | 并发 borrow 导致 available 变负数 | 所有多 DAO 写入操作加 `@Transactional` |
| 5 | 注解 SQL 和 XML 同时定义同一 statement | `Mapped Statements collection already contains key` | 移除 Java 注解中的 `@Select`/`@Insert`/`@Update`/`@Delete` |
| 6 | 数组 `transaction([])` 外部检查可用性 | 竞态条件下双借同一本 | `borrow()` 需在 `$transaction` 内重查可用性 |
| 7 | Mapper XML 中列名写成 camelCase 但数据库是 snake_case | `Unknown column` SQL 错误导致 `Internal Server Error` | 对照 `SHOW CREATE TABLE` 确认实际列名（如 `users` 表是 `total_fines` 不是 `totalFines`） |
| 8 | 后端错误消息用英文 | 中文用户看不懂报错信息 | 使用中文错误消息（如 "用户名或密码错误"） |
| 9 | WSL 默认 JDK 25 下 `mvn compile` | `release version 17 not supported` 编译失败 | 先 `export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64` 再编译 |
| 10 | `@EnableScheduling` 同时放在 `LibraryApplication.java` 和 `WebConfig.java` | 重复注解，启动时加载两次调度器 | 只保留 `LibraryApplication.java` 上的 `@EnableScheduling`，移除 `WebConfig.java` 上的 |

## 3. Architecture Decisions

先于所有规则。只追加不删旧记录。决策后立即写入。

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-29 | MyBatis over JPA | Course teaches MyBatis |
| 2026-06-29 | Custom JwtAuthFilter over Spring Security | Keep dependencies minimal |
| 2026-06-29 | @Transactional over Prisma $transaction | Declarative transactions cleaner |
| 2026-06-29 | Naive UI over Element Plus | Align with original version |
| 2026-06-29 | Axios over fetch() | Course teaches Axios |
| 2026-06-30 | CORS for 5175 (Java) + 5173 (original TS) | Migration coexistence (two frontends) |
| 2026-06-30 | seed.sql over Java CommandLineRunner | Reproducible, no recompile needed |
| 2026-06-30 | SQL from annotations to XML mappers | Readability + maintainability |
| 2026-06-30 | Maven Wrapper (./mvnw) | Consistent builds across env |
| 2026-06-30 | java -jar over mvn spring-boot:run | Avoids OOM killer |
| 2026-06-30 | application-dev/prod profiles | Password isolation |
| 2026-06-30 | H2 in-memory DB for tests | No MySQL dependency in CI |
| 2026-06-30 | 后端错误消息使用中文 | 目标用户为中文使用者 |
| 2026-06-30 | UserMapper.xml 列名 `totalFines` → `total_fines` | 对齐实际数据库 snake_case 列名 |

## 4. Commands

```bash
# Backend
./mvnw compile                                          # compile
./mvnw test                                             # 102 tests, 0 failures required
./mvnw clean package -DskipTests                        # build JAR (skip tests)
./start.sh                                              # build + run -> :8080 (dev)
./start.sh prod                                         # build + run -> :8080 (prod)

# Seed database (prerequisite: CREATE DATABASE library; must exist first)
mysql -h127.0.0.1 -uroot -p library < seed.sql

# Frontend
cd frontend
npm install --registry=https://registry.npmmirror.com
npm run dev                      # -> :5175 (proxies /api -> :8080)
npm run build                    # production build to dist/

# Rebuild
./mvnw clean package -DskipTests        # 构建 JAR（跳过测试）
./mvnw test                              # 运行全部 102 测试

# Kill
kill -9 $(lsof -ti:8080)
kill -9 $(lsof -ti:5175)
```

## 5. Architecture

```
src/                             # Spring Boot + MyBatis + MySQL
main/java/com/library/
  LibraryApplication.java        # @SpringBootApplication
  config/    3 files             JwtAuthFilter, WebConfig (CORS), JwtAuthInterceptor
  controller/ 11 files           45 REST endpoints
  service/   9 files             @Transactional business logic
  mapper/    11 files            MyBatis @Mapper interfaces (SQL in XML)
  entity/    11 files            POJO matching MySQL tables
  dto/request/  6 files          @Valid request bodies
  dto/response/ 16 files         Response DTOs
  exception/  2 files            AppException + @RestControllerAdvice
  util/      1 file              JwtUtil

frontend/                        # Vue 3 + Vite + Naive UI
  src/
    api/      index.ts, books.ts  Axios + typed API
    stores/   auth.ts, books.ts   Pinia
    router/   index.ts            vue-router (matches original)
    types/    api.ts              TypeScript interfaces
    composables/  index.ts        usePagination, useDebounce
    components/  13 files         All original components ported
    views/       17 files
    App.vue
```
*Static resources:*
`src/main/resources/static/covers/` — 23 book cover images (local, no external CDN).
Seed data stores `cover` as `/covers/{id}-{title}.{ext}` (e.g. `/covers/1-算法导论.jpg`).
Spring Boot auto-serves via `:8080/covers/...`. Frontend renders via `<img :src="book.cover">` — no extra config needed.

## 6. API Route Table (45 endpoints)

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | public | Reader register |
| POST | /login | public | Returns JWT |
| GET | /me | auth | Current user profile |
| GET | /users | admin | All users |
| POST | /admin/create | admin | Create admin |

### Books (`/api/books`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | public | List + search + filters + sort + pagination |
| GET | /facets | public | Facet counts |
| GET | /:id | public | Detail + holdings |
| GET | /:id/items | public | Copy list |
| POST | / | admin | Create book |
| PUT | /:id | admin | Update |
| DELETE | /:id | admin | Delete (guarded) |
| POST | /:id/reconcile | admin | Fix available count |

### BookItems (`/api/book-items`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /:barcode | auth | Barcode lookup + current borrow |

### Categories (`/api/categories`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | public | List with book count |
| POST | / | admin | Create |
| PUT | /:id | admin | Update |
| DELETE | /:id | admin | Delete (refused if has books) |

### Borrows (`/api/borrows`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /my | reader | My borrows |
| GET | / | admin | All borrows |
| GET | /history | reader | My history |
| POST | /borrow | reader | Borrow (@Transactional) |
| POST | /return/:id | reader+admin | Return (hold promotion) |
| POST | /renew/:id | reader | Renew (once per borrow) |

### Holds (`/api/holds`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | / | reader | Create hold |
| GET | /count | public | Pending count |
| GET | /my | reader | My holds |
| GET | / | admin | All holds |
| DELETE | /:id | reader | Cancel hold |
| POST | /:id/fulfill | admin | Fulfill ready hold |

### Readers (`/api/readers`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | admin | Reader list |
| GET | /:id | admin | Detail + borrows |
| PUT | /:id | admin | Edit by admin |
| PUT | /profile | reader | Self-edit |

### Fines (`/api/fines`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | admin | All (filterable by type/paid) |
| GET | /my | reader | My fines |
| POST | /:id/pay | admin | Mark paid |

### Rules (`/api/rules`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | public | Rule matrix |
| GET | /patron-categories | public | Patron types |
| GET | /item-types | public | Material types |
| PUT | / | admin | Upsert rule |

### Stats (`/api/stats`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | admin | Overview (totalBooks, totalReaders, totalCategories, activeBorrows, overdueCount) |
| GET | /popular | admin | Top 20 (JOIN books + category) |
| GET | /monthly | admin | Monthly (12 months) |

### System

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | public | `{ status: 'ok' }` |

## 7. Frontend Routing

```
/                  -> redirect to /books (public)
/books             -> BookGrid + FacetPanel + SearchBar (no auth)
/books/:id         -> BookDetailSection + HoldingsTable + borrow/hold
/login             -> LoginBg + dark glassmorphism + register modal
/admin/*           -> admin layout (role:admin)
/admin/dashboard   -> stat cards + quick actions + system info
/admin/books       -> CRUD table + expandable items + add copy
/admin/borrows     -> borrow table + return with overdue warning
/admin/categories  -> CRUD table
/admin/circulation -> barcode scan + borrow/return queue
/admin/fines       -> filterable table + pay action
/admin/readers     -> expandable reader list + edit modal
/admin/settings    -> rules/patron types/item types tables
/admin/stats       -> top 20 popular + monthly stats tables
/reader/*          -> reader layout (role:reader)
/reader/books      -> search + category filter + borrow
/reader/my-borrows -> fine alert + holds tab + renew
/reader/profile    -> editable form
/:pathMatch(.*)*   -> 404 redirect to /books
```

## 8. Environment

Configuration split across profiles (`spring.profiles.active=dev` default):

| File | Scope | DB Password | JWT Secret |
|------|-------|-------------|------------|
| application.yml | All | — | — |
| application-dev.yml | Dev | `${DB_PASSWORD:li200603}` | `${JWT_SECRET:LibraryFullStack2024JWTSecretKeyForSpringBoot}` |
| application-prod.yml | Prod | `${DB_PASSWORD}` | `${JWT_SECRET}` |

> **JWT Secret**: The default secret in `application-dev.yml` is a dev-only placeholder. Production must use `${JWT_SECRET}` from environment variable — never hardcode secrets in committed config.

## 9. Error Handling

| Condition | HTTP Status |
|-----------|-------------|
| `@Valid` validation fails | 400 |
| `AppException.notFound()` | 404 |
| `AppException.conflict()` | 409 |
| JWT auth fail | 401 |
| Role mismatch | 403 |
| Other `AppException` | see code |
| Any other Exception | 500 |

## 10. Coding Conventions

### SQL (XML mappers only)
- All MyBatis SQL in `src/main/resources/mappers/*.xml`, NOT in Java annotations
- Use `<resultMap>` for `@Results` equivalent
- Dynamic SQL uses `<if>`, `<choose>`, `<where>` tags
- Column names in SQL must match actual DB column names (SHOW CREATE TABLE to verify)

### DB column naming hazard
Database has mixed naming: `categoryId` (camelCase) vs `created_at` (snake_case). Always verify actual column names before writing SQL.

**已知列名对照**（`SHOW CREATE TABLE` 验证）：
| 表 | camelCase 列 | snake_case 列 |
|----|-------------|---------------|
| users | `patronCategoryId` | `total_fines`, `created_at`, `updated_at` |
| books | `categoryId`, `clcNumber`, `physicalDesc` | `created_at`, `updated_at` |
| book_items | `bookId`, `itemTypeId`, `callNumber` | `acquired_at`, `created_at`, `updated_at` |

> ⚠️ `UserMapper.xml` 中的列名必须全部使用 snake_case（如 `total_fines`），否则 INSERT/UPDATE 会报 `Unknown column` 错误。

### Java
- Services: `@Service`, constructor injection, `@Transactional` for multi-DAO writes
- Controllers: `@RestController`, thin dispatch, no Mapper calls
- Mappers: interface only, SQL in XML via namespace
- All POST/PUT use `@Valid` DTOs
- Use `AppException` with descriptive messages

### Data Integrity
- `borrow()` / `returnBook()` / `payFine()` / `cancelHold()` / `fulfillHold()` MUST be `@Transactional`
- `returnBook` when hold exists: item goes `borrowed -> on_hold`, available unchanged
- Cancel hold when ready: release item to available, increment book count
- Book delete: check copies+borrows before allowing
- Concurrent borrow: must recheck availability inside `@Transactional` (not outside)

**Hold/Borrow state machine:**
```
borrow() → available → borrowed
returnBook() WITH pending hold → borrowed → on_hold (→ ready after admin fulfills)
returnBook() WITHOUT hold → borrowed → available
cancelHold(ready) → on_hold → available (item released)
cancelHold(pending) → pending hold cancelled, no item state change
fulfillHold(ready) → on_hold → borrowed (reader picks up the held item)
```

### Frontend
- UI: Naive UI (`n-data-table`, `n-button`, etc.)
- Icons: `@vicons/ionicons5`
- API: Axios via `api/index.ts`
- Auth: Pinia store + localStorage JWT
- Routing: matches original exactly (public /books, /admin/*, /reader/*)
- No emoji - use SVG icons

### Tests
- Service layer: `@ExtendWith(MockitoExtension.class)`, mock all mappers
- Controller layer: `@SpringBootTest` + `@AutoConfigureMockMvc` + `@ActiveProfiles("test")`
  - Controllers use `@MockBean` for services — no real DB needed
  - No `application-test.yml` exists yet; if integration tests (real DB) are added later, create `src/test/resources/application-test.yml` with H2 config
- 102 total tests across 22 test files (10 service + 12 controller)

## 11. Database Tables (11 tables)

patron_categories, item_types, categories, circulation_rules, users, books, book_items, borrow_records, fines, holds, audit_logs.

Seed data via `seed.sql`: 3 patron types, 3 item types, 9 rules, 9 users, 20 books, 63 items, 23 borrows, 2 fines, 3 holds.

## 12. Build & Startup

`./mvnw` in project root. No global Maven install needed. Java 17 (`export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64` 前先执行，WSL 默认 JDK 25 不兼容)。

Startup: `./start.sh` builds JAR then runs `java -jar target/*.jar`. Avoid `mvn spring-boot:run` (OOM risk).

> 数据库密码通过环境变量传入：`DB_PASSWORD=yourpwd ./start.sh` 或 `DB_PASSWORD=yourpwd java -jar target/*.jar`

---

## Data Verification (每次变更后运行)

```bash
# API endpoints
grep -rn '@\(GetMapping\|PostMapping\|PutMapping\|DeleteMapping\)' src/main/java/com/library/controller/ | wc -l
# Test count
grep -rn '@Test' src/test/ --include='*.java' | wc -l
# Java files
find src/main -name '*.java' | wc -l
# Vue files
find frontend/src -name '*.vue' | wc -l
# XML mappers
find src -name '*.xml' -path '*/mappers/*' | wc -l
```
注意：- **提交前跑测试。** `./mvnw test`（102 个测试全部通过再提交），可以拓展测试集，但要保证适用性和通用性。
