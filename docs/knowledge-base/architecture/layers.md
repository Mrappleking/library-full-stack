# 四层架构详解

## 架构分层

### 第一层：Controller层

**职责**：接收HTTP请求，参数校验，调用Service，返回统一响应

**位置**：`src/main/java/com/library/controller/`

**控制器列表**：

| 控制器 | 路径前缀 | 功能 |
|--------|----------|------|
| AuthController | /api/auth | 用户认证与注册 |
| BookController | /api/books | 图书CRUD |
| BookItemController | /api/book-items | 图书副本管理 |
| BorrowController | /api/borrows | 借阅管理 |
| CategoryController | /api/categories | 分类管理 |
| FineController | /api/fines | 罚款管理 |
| HoldController | /api/holds | 预约管理 |
| ReaderController | /api/readers | 读者管理 |
| RuleController | /api/rules | 规则管理 |
| StatsController | /api/stats | 统计数据 |
| SystemController | /api/system | 系统管理 |
| UploadController | /api/upload | 文件上传 |
| HealthController | /api/health | 健康检查 |

**设计规范**：
- 使用 `@RestController` 注解
- 参数校验使用 `@Valid` 注解
- 返回 `ResponseEntity<ApiResponse<T>>`
- 不直接调用Mapper，只调用Service
- 异常由全局异常处理器处理

### 第二层：Service层

**职责**：业务逻辑处理，事务管理，数据转换

**位置**：`src/main/java/com/library/service/`

**服务列表**：

| 服务 | 功能 |
|------|------|
| AuthService | 认证逻辑（登录、注册、密码验证） |
| BookService | 图书业务（CRUD、搜索、库存管理） |
| BorrowService | 借阅业务（借阅、归还、续借） |
| HoldService | 预约业务（创建、取消、兑现） |
| FineService | 罚款业务（计算、支付） |
| UserService | 用户管理（查询、编辑） |
| CategoryService | 分类管理 |
| RuleService | 规则管理（借阅规则配置） |
| StatsService | 统计数据 |
| CacheService | Redis缓存操作 |
| AuditService | 审计日志 |
| MonitorService | 监控服务 |
| OverdueFineScheduler | 逾期罚款定时任务 |

**设计规范**：
- 使用 `@Service` 注解
- 使用构造函数注入依赖
- 多DAO写入操作使用 `@Transactional`
- 返回DTO而非Entity
- 使用 `AppException` 抛出业务异常

### 第三层：Mapper层

**职责**：数据库访问，SQL执行

**位置**：`src/main/java/com/library/mapper/` 和 `src/main/resources/mappers/`

**Mapper列表**：

| Mapper | XML文件 | 对应表 |
|--------|---------|--------|
| UserMapper | UserMapper.xml | users |
| BookMapper | BookMapper.xml | books |
| BookItemMapper | BookItemMapper.xml | book_items |
| BorrowRecordMapper | BorrowRecordMapper.xml | borrow_records |
| CategoryMapper | CategoryMapper.xml | categories |
| HoldMapper | HoldMapper.xml | holds |
| FineMapper | FineMapper.xml | fines |
| CirculationRuleMapper | CirculationRuleMapper.xml | circulation_rules |
| PatronCategoryMapper | (无XML) | patron_categories |
| ItemTypeMapper | (无XML) | item_types |
| AuditLogMapper | (无XML) | audit_logs |
| ErrorLogMapper | ErrorLogMapper.xml | error_logs |

**设计规范**：
- 使用 `@Mapper` 注解
- SQL必须写在XML文件中，禁止在Java注解中写SQL
- 使用 `<resultMap>` 进行结果映射
- 动态SQL使用 `<if>`, `<choose>`, `<where>` 标签
- 列名必须与数据库实际列名一致

### 第四层：Entity层

**职责**：数据库表映射，POJO

**位置**：`src/main/java/com/library/entity/`

**Entity列表**：

| Entity | 表名 | 说明 |
|--------|------|------|
| User | users | 用户表 |
| Book | books | 图书表 |
| BookItem | book_items | 图书副本表 |
| BorrowRecord | borrow_records | 借阅记录表 |
| Category | categories | 分类表 |
| Hold | holds | 预约表 |
| Fine | fines | 罚款表 |
| CirculationRule | circulation_rules | 借阅规则表 |
| PatronCategory | patron_categories | 用户类型表 |
| ItemType | item_types | 物料类型表 |
| AuditLog | audit_logs | 审计日志表 |
| ErrorLog | error_logs | 错误日志表 |

**设计规范**：
- 使用 `@Data` 注解（Lombok）
- 字段名与数据库列名一致
- 主键使用 `@Id` 注解
- 时间字段使用 `LocalDateTime`

## 请求处理流程

```
HTTP Request
    │
    ▼
┌──────────────────────────┐
│    RateLimitFilter       │  ← 限流检查
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│     JwtAuthFilter        │  ← JWT认证
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│      Controller          │  ← 参数校验，调用Service
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│       Service            │  ← 业务逻辑，事务管理
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│       Mapper             │  ← SQL执行
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│       MySQL              │  ← 数据库操作
└──────────────────────────┘
```

## 数据流转示例

### 查询图书详情

```
GET /api/books/1
    │
    ▼
BookController.getById(id)
    │
    ▼
BookService.getById(id)
    │
    ├── CacheService.get("book:1") → 缓存命中返回
    │
    └── BookMapper.selectById(id) → 缓存未命中
            │
            ▼
        BookMapper.xml
        SELECT * FROM books WHERE id = #{id}
            │
            ▼
        CacheService.set("book:1", book) → 写入缓存
            │
            ▼
        BookDetailResponse DTO
```

### 创建借阅

```
POST /api/borrows/borrow
    │
    ▼
BorrowController.borrow(request)
    │
    ▼
BorrowService.borrow(request)  @Transactional
    │
    ├── UserMapper.selectById(userId)
    ├── BookMapper.selectById(bookId)
    ├── BookItemMapper.selectAvailable(bookId)
    │
    ├── BookItemMapper.updateStatus(borrowed)
    ├── BorrowRecordMapper.insert(record)
    ├── BookMapper.decrementAvailable(bookId)
    │
    └── AuditService.log("borrow", ...) @Transactional(REQUIRES_NEW)
```