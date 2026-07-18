# 缓存策略

## 缓存架构

```
┌─────────────────────────────────────────────────────────────┐
│                      CacheService                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Redis操作封装                      │   │
│  └─────────────────────────────────────────────────────┘   │
│           │                    │                            │
│           ▼                    ▼                            │
│  ┌─────────────┐      ┌─────────────┐                       │
│  │   查询缓存   │      │   更新缓存   │                       │
│  │  get(key)   │      │  set(key,   │                       │
│  │             │      │   value)    │                       │
│  └──────┬──────┘      └──────┬──────┘                       │
└─────────┼────────────────────┼──────────────────────────────┘
          │                    │                               │
          ▼                    ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                      Redis缓存层                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐      │
│  │book:{id} │ │category  │ │rules     │ │user:token  │      │
│  │(30min)   │ │(1h)      │ │(1h)      │ │(30min)    │      │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 缓存Key设计

| Key模式 | 用途 | 过期时间 |
|---------|------|----------|
| `book:{id}` | 图书详情 | 30分钟 |
| `books:list:{hash}` | 图书列表 | 10分钟 |
| `category:all` | 分类列表 | 1小时 |
| `rules:all` | 规则矩阵 | 1小时 |
| `rules:{patronCat}:{itemType}` | 单条规则 | 1小时 |
| `user:token:{userId}` | 用户登录token | 与JWT过期时间一致 |
| `rate:limit:{ip}` | 限流计数 | 1分钟 |

## 缓存策略类型

### 1. 写穿策略（Write-Through）

适用于频繁读取、偶尔更新的数据（如分类、规则）

```
更新操作
    │
    ├── 更新数据库
    │
    └── 更新/删除缓存
```

### 2. 读穿策略（Read-Through）

适用于热点数据（如图书详情）

```
查询操作
    │
    ├── 检查缓存 → 命中则返回
    │
    └── 未命中 → 查询数据库 → 写入缓存 → 返回
```

### 3. 缓存失效策略

```
数据变更
    │
    ├── 更新数据库
    │
    └── 删除相关缓存（下次读取自动重建）
```

## 缓存一致性保障

### 更新缓存的时机

| 操作 | 缓存处理 |
|------|----------|
| 创建图书 | 删除 `books:list:*` |
| 更新图书 | 删除 `book:{id}`、`books:list:*` |
| 删除图书 | 删除 `book:{id}`、`books:list:*` |
| 创建分类 | 删除 `category:all`、`books:list:*` |
| 更新分类 | 删除 `category:all`、`books:list:*` |
| 更新规则 | 删除 `rules:all`、`rules:{patronCat}:{itemType}` |
| 借阅/归还 | 删除 `book:{id}` |
| 预约/取消预约 | 删除 `book:{id}` |

### 缓存失效顺序

```
1. 先更新数据库
2. 再删除缓存
3. 下次读取时重建缓存
```

**注意**：不采用"先删缓存再更新数据库"的方式，避免并发场景下的缓存脏数据问题。

## CacheService方法

| 方法 | 功能 | 参数 | 返回值 |
|------|------|------|--------|
| `get(String key)` | 获取缓存 | key | Object |
| `set(String key, Object value)` | 设置缓存（默认30分钟） | key, value | void |
| `set(String key, Object value, long minutes)` | 设置缓存（指定过期时间） | key, value, minutes | void |
| `delete(String key)` | 删除缓存 | key | void |
| `deletePattern(String pattern)` | 批量删除（使用SCAN） | pattern | void |
| `exists(String key)` | 检查缓存是否存在 | key | boolean |

## 使用示例

### 查询图书详情（带缓存）

```java
public BookDetailResponse getById(Long id) {
    String cacheKey = "book:" + id;
    BookDetailResponse cached = cacheService.get(cacheKey);
    if (cached != null) {
        return cached;
    }
    
    Book book = bookMapper.selectById(id);
    if (book == null) {
        throw AppException.notFound("图书不存在");
    }
    
    List<BookItem> items = bookItemMapper.selectByBookId(id);
    BookDetailResponse response = convertToDetailResponse(book, items);
    
    cacheService.set(cacheKey, response, 30);
    return response;
}
```

### 更新图书（删除缓存）

```java
@Transactional
public BookResponse update(Long id, BookUpdateRequest request) {
    Book book = bookMapper.selectById(id);
    if (book == null) {
        throw AppException.notFound("图书不存在");
    }
    
    bookMapper.update(id, request);
    
    cacheService.delete("book:" + id);
    cacheService.deletePattern("books:list:*");
    
    return convertToResponse(bookMapper.selectById(id));
}
```

## Redis配置

### 连接配置

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      timeout: 5000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 2
```

### 序列化配置

```java
@Bean
public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);
    
    Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    serializer.setObjectMapper(objectMapper);
    
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(serializer);
    template.setHashKeySerializer(new StringRedisSerializer());
    template.setHashValueSerializer(serializer);
    
    return template;
}
```

## 缓存监控

### 统计指标

| 指标 | 说明 |
|------|------|
| 缓存命中率 | 命中次数 / 总查询次数 |
| 缓存写入次数 | 数据库查询后写入缓存的次数 |
| 缓存删除次数 | 数据变更时删除缓存的次数 |
| Redis连接数 | 当前活跃连接数 |

### 监控接口

```
POST /api/system/clear-cache          # 清除所有缓存（admin）
POST /api/system/clear-cache/{key}    # 清除指定缓存（admin）
```

## 注意事项

1. **使用SCAN而非KEYS**：生产环境禁止使用 `KEYS` 命令，必须使用 `SCAN` 进行模式匹配删除
2. **设置过期时间**：所有缓存必须设置过期时间，防止内存溢出
3. **缓存空值**：对于查询不到的数据，也应该缓存空值，避免缓存穿透
4. **缓存雪崩**：不同类型的数据设置不同的过期时间，避免同时失效
5. **序列化兼容**：使用Jackson序列化时，确保所有DTO都有默认构造函数