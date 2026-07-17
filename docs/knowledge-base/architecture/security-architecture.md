# 安全架构

## 安全体系

```
┌─────────────────────────────────────────────────────────────┐
│                        安全层                               │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐  │
│  │  RateLimit   │ │  JwtAuth     │ │     CORS            │  │
│  │   Filter     │ │   Filter     │ │  WebMvcConfigurer   │  │
│  └──────┬───────┘ └──────┬───────┘ └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┴─────────────────────┘             │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐              │
│         ▼                  ▼                  ▼              │
│  ┌───────────┐    ┌──────────────┐    ┌─────────────┐       │
│  │ 限流防护  │    │ 认证与授权    │    │ 跨域防护    │       │
│  │ (暴力攻击)│    │ (JWT+角色)   │    │ (Origin限制)│       │
│  └───────────┘    └──────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 认证机制

### JWT认证流程

```
登录请求
    │
    ▼
POST /api/auth/login
    │
    ├── AuthService.login(request)
    │       ├── UserMapper.selectByUsername(username)
    │       ├── BCrypt.verify(password)
    │       └── JwtUtil.generateToken(user)
    │
    └── 返回 { token: "eyJhbGciOiJIUzI1NiIs...", user: {...} }

后续请求
    │
    ▼
JwtAuthFilter.doFilterInternal(request, response, chain)
    │
    ├── 提取 Authorization: Bearer <token>
    │
    ├── JwtUtil.verifyToken(token) → 无效则401
    │
    ├── UserMapper.selectById(userId) → 获取用户信息
    │
    ├── SecurityContextHolder.setAuthentication(auth)
    │
    └── chain.doFilter(request, response) → 继续处理
```

### JWT Token结构

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
    "sub": "1",                    // 用户ID
    "username": "admin",           // 用户名
    "role": "admin",               // 用户角色
    "exp": 1719859200000,          // 过期时间
    "iat": 1719855600000           // 签发时间
}
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### 角色权限

| 角色 | 路径模式 | 说明 |
|------|----------|------|
| admin | /api/auth/admin/**, /api/books/**, /api/categories/**, /api/borrows/, /api/readers/**, /api/fines/**, /api/holds/, /api/rules/**, /api/stats/**, /api/system/** | 管理员权限，可访问所有接口 |
| reader | /api/auth/me, /api/borrows/my, /api/borrows/history, /api/borrows/borrow, /api/borrows/return/**, /api/borrows/renew/**, /api/holds/, /api/holds/my, /api/fines/my, /api/readers/profile | 读者权限，仅限个人操作 |
| public | /api/auth/register, /api/auth/login, /api/books/, /api/books/facets, /api/books/**/items, /api/categories/, /api/health, /api/rules/ | 公开接口，无需认证 |

## 限流机制

### RateLimitFilter

```
1. 获取客户端IP
2. 构建限流key: "rate:limit:{ip}"
3. Redis INCR key
4. 如果计数 == 1 → 设置过期时间 1分钟
5. 如果计数 > 100 → 返回429错误
6. 否则继续处理请求
```

### 限流配置

| 参数 | 值 | 说明 |
|------|-----|------|
| 时间窗口 | 1分钟 | 统计周期 |
| 最大请求数 | 100次/分钟 | 超过则拒绝 |
| Redis Key | rate:limit:{ip} | 按IP限流 |

## 密码安全

### 密码验证规则

1. 长度至少8位
2. 必须包含至少3种字符类型（大写/小写/数字/特殊字符）

### 密码哈希

```java
// 注册时
String encodedPassword = passwordEncoder.encode(rawPassword);

// 登录验证时
boolean matches = passwordEncoder.matches(rawPassword, encodedPassword);
```

### 临时密码生成

管理员重置密码时使用 `SecureRandom` 生成随机临时密码：

```java
SecureRandom random = new SecureRandom();
byte[] bytes = new byte[8];
random.nextBytes(bytes);
String tempPassword = Base64.getEncoder().encodeToString(bytes);
```

## 文件上传安全

### 验证流程

```
上传请求
    │
    ├── 检查文件名（禁止 .., /, \）
    │
    ├── 检查扩展名（只允许 .jpg, .png, .jpeg）
    │
    ├── 检查Content-Type（image/jpeg, image/png）
    │
    ├── ImageIO.read(inputStream) → 验证真实图片内容
    │
    └── 重命名文件（UUID + 原始扩展名）
```

### 存储路径

```
src/main/resources/static/covers/
├── {UUID}-{title}.jpg
├── {UUID}-{title}.png
└── ...
```

## CORS配置

### 允许的Origin

```java
.addAllowedOriginPatterns("http://localhost:5175", "http://localhost:5173")
.addAllowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
.addAllowedHeaders("Authorization", "Content-Type", "Accept")
.setAllowCredentials(true)
```

### 安全注意事项

- 生产环境必须限制具体域名，禁止使用 `*`
- 允许的Headers必须显式列出，禁止使用 `*`
- 必须设置 `setAllowCredentials(true)` 以支持JWT认证

## 审计日志

### 记录内容

| 字段 | 说明 |
|------|------|
| action | 操作类型（borrow, return, renew, hold, cancelHold等） |
| targetType | 目标类型（book, user, borrow等） |
| targetId | 目标ID |
| userId | 操作用户ID |
| details | 操作详情（JSON格式） |
| createdAt | 创建时间 |

### 事务隔离

审计日志使用 `@Transactional(propagation = REQUIRES_NEW)` 确保：
- 主业务失败时，审计日志仍然记录
- 审计日志失败时，不影响主业务

## SQL注入防护

### 参数化查询

MyBatis使用参数化查询，自动防止SQL注入：

```xml
<!-- 安全 -->
SELECT * FROM books WHERE title LIKE CONCAT('%', #{keyword}, '%')

<!-- 不安全 -->
SELECT * FROM books WHERE title LIKE '%${keyword}%'
```

### 禁止使用字符串拼接

- 禁止在Java代码中拼接SQL
- 必须使用XML动态SQL标签

## 异常处理安全

### 错误响应格式

```json
{
    "code": 400,
    "message": "用户名或密码错误",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### 安全注意事项

- 生产环境禁止返回堆栈信息
- 禁止泄露数据库表名、字段名等敏感信息
- 所有错误消息使用中文，便于用户理解