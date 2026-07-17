# 安全最佳实践

## 认证与授权

### JWT认证

**使用规范**：

1. 所有认证请求必须携带 `Authorization: Bearer <token>` 头
2. Token过期时间设置为24小时
3. 使用 `SecureRandom` 生成密钥，生产环境通过环境变量传入
4. Token中包含用户ID、用户名、角色等必要信息

**安全要点**：

- 禁止将敏感信息（如密码）放入Token
- 使用HTTPS传输Token，防止中间人攻击
- Token过期后立即清除客户端存储
- 支持Token版本管理，用户修改密码后使旧Token失效

### 角色权限

**权限分层**：

| 角色 | 访问范围 |
|------|----------|
| admin | 所有管理接口 |
| reader | 个人相关接口 |
| public | 公开接口 |

**权限检查**：

- 在Controller层使用 `@PreAuthorize` 或自定义拦截器进行权限检查
- 敏感操作（如删除、更新）必须验证操作人权限
- 读者只能访问自己的数据，不能访问其他读者信息

## 输入验证

### 参数校验

**使用 `@Valid` 注解**：

```java
@PostMapping("/books")
public ResponseEntity<ApiResponse<BookResponse>> createBook(
    @Valid @RequestBody BookCreateRequest request) {
    // ...
}
```

**验证规则**：

| 字段类型 | 验证注解 |
|----------|----------|
| 字符串 | @NotBlank, @Size, @Email, @Pattern |
| 数字 | @NotNull, @Min, @Max, @DecimalMin, @DecimalMax |
| 日期 | @NotNull, @Past, @Future |

**密码验证**：

- 长度至少8位
- 必须包含至少3种字符类型（大写/小写/数字/特殊字符）
- 使用正则表达式进行强密码验证

### SQL注入防护

**使用参数化查询**：

```xml
<!-- 正确：使用参数化查询 -->
SELECT * FROM books WHERE title LIKE CONCAT('%', #{keyword}, '%')

<!-- 错误：使用字符串拼接 -->
SELECT * FROM books WHERE title LIKE '%${keyword}%'
```

**禁止**：

- 在Java代码中拼接SQL字符串
- 使用 `$` 符号进行字符串替换
- 直接将用户输入拼接到SQL中

## 文件上传安全

### 验证流程

```
1. 检查文件名（禁止 .., /, \）
2. 检查扩展名（只允许 .jpg, .png, .jpeg）
3. 检查Content-Type（image/jpeg, image/png）
4. 使用 ImageIO.read() 验证真实图片内容
5. 重命名文件（UUID + 原始扩展名）
6. 存储到指定目录
```

### 存储规范

- 文件存储路径通过配置文件指定
- 禁止使用用户提供的文件名直接存储
- 文件大小限制为合理范围（如10MB）
- 使用UUID重命名文件，防止路径遍历攻击

## CORS配置

### 开发环境

```java
.addAllowedOriginPatterns("http://localhost:5175", "http://localhost:5173")
.addAllowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
.addAllowedHeaders("Authorization", "Content-Type", "Accept")
.setAllowCredentials(true)
```

### 生产环境

- 限制具体域名，禁止使用 `*`
- 允许的Headers必须显式列出
- 禁止使用 `addAllowedHeaders("*")`

## 限流

### 配置参数

| 参数 | 值 |
|------|-----|
| 时间窗口 | 1分钟 |
| 最大请求数 | 100次/分钟/IP |
| 限流Key | rate:limit:{ip} |

### 实现方式

使用Redis的INCR命令进行计数：

```java
public boolean checkRateLimit(String ip) {
    String key = "rate:limit:" + ip;
    Long count = redisTemplate.opsForValue().increment(key);
    if (count == 1) {
        redisTemplate.expire(key, 1, TimeUnit.MINUTES);
    }
    return count <= 100;
}
```

## 异常处理

### 错误响应格式

```json
{
    "code": 400,
    "message": "用户名或密码错误",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### 安全要点

- 生产环境禁止返回堆栈信息
- 禁止泄露数据库表名、字段名等敏感信息
- 所有错误消息使用中文，便于用户理解
- 统一异常处理，避免暴露系统内部信息

## 审计日志

### 记录内容

| 字段 | 说明 |
|------|------|
| action | 操作类型 |
| targetType | 目标类型 |
| targetId | 目标ID |
| userId | 操作用户ID |
| details | 操作详情（JSON格式） |
| createdAt | 创建时间 |

### 事务隔离

使用 `@Transactional(propagation = REQUIRES_NEW)` 确保：

- 主业务失败时，审计日志仍然记录
- 审计日志失败时，不影响主业务

## 密码安全

### 密码哈希

使用BCrypt进行密码哈希：

```java
// 注册时
String encodedPassword = passwordEncoder.encode(rawPassword);

// 登录验证时
boolean matches = passwordEncoder.matches(rawPassword, encodedPassword);
```

### 临时密码

管理员重置密码时使用 `SecureRandom` 生成随机临时密码：

```java
SecureRandom random = new SecureRandom();
byte[] bytes = new byte[8];
random.nextBytes(bytes);
String tempPassword = Base64.getEncoder().encodeToString(bytes);
```

## 缓存安全

### 缓存Key设计

```
book:{id}           # 图书详情
category:all        # 分类列表
rules:all           # 规则矩阵
rate:limit:{ip}     # 限流计数
user:token:{userId} # 用户Token
```

### 缓存失效策略

- 先更新数据库，再删除缓存
- 设置合理的过期时间，防止内存溢出
- 使用SCAN而非KEYS进行模式匹配删除

## 部署安全

### 环境变量

```bash
# 生产环境必须通过环境变量传入敏感配置
DB_PASSWORD=your-production-password
JWT_SECRET=your-production-jwt-secret
```

### 禁止硬编码

- 禁止在代码中硬编码密码
- 禁止在代码中硬编码密钥
- 禁止在代码中硬编码敏感配置

### HTTPS

- 生产环境必须使用HTTPS
- 配置SSL证书
- 强制HTTPS重定向

## 安全检查清单

- [ ] 所有输入参数使用 `@Valid` 验证
- [ ] SQL查询使用参数化查询
- [ ] 文件上传验证文件名和内容
- [ ] CORS配置限制具体域名
- [ ] 限流配置防止暴力攻击
- [ ] 错误响应不泄露敏感信息
- [ ] 密码使用BCrypt哈希
- [ ] 敏感配置通过环境变量传入
- [ ] 审计日志记录关键操作
- [ ] 权限检查覆盖所有敏感接口