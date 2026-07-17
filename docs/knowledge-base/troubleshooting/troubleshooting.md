# 故障排查指南

## 启动问题

### 数据库连接失败

**错误信息**：
```
com.mysql.cj.jdbc.exceptions.SQLError.createCommunicationsException
```

**排查步骤**：

1. **检查MySQL服务是否启动**：
   ```bash
   # Windows
   net start mysql

   # Linux
   systemctl status mysql
   ```

2. **检查数据库配置**：
   - 确认 `application-dev.yml` 中的数据库密码正确
   - 确认数据库 `library` 已创建
   - 确认端口号（默认3306）正确

3. **验证连接**：
   ```bash
   mysql -h127.0.0.1 -uroot -p library
   ```

4. **导入初始数据**：
   ```bash
   mysql -h127.0.0.1 -uroot -p library < seed.sql
   ```

### Redis连接失败

**错误信息**：
```
Cannot get Jedis connection; nested exception is redis.clients.jedis.exceptions.JedisConnectionException
```

**排查步骤**：

1. **检查Redis服务是否启动**：
   ```bash
   # Windows
   redis-server

   # Linux
   systemctl status redis
   ```

2. **检查Redis配置**：
   - 确认Redis端口（默认6379）正确
   - 确认Redis密码（如果有）正确

3. **验证连接**：
   ```bash
   redis-cli ping
   ```

### 端口被占用

**错误信息**：
```
Address already in use
```

**排查步骤**：

```bash
# Windows
netstat -ano | findstr :8080
taskkill /F /PID <进程ID>

# Linux
lsof -ti:8080
kill -9 $(lsof -ti:8080)
```

### 内存不足（OOM）

**错误信息**：
```
java.lang.OutOfMemoryError
```

**解决方案**：

- 不要使用 `mvn spring-boot:run` 启动
- 使用 `java -jar target/*.jar` 启动
- 可以调整JVM参数：
  ```bash
  java -Xms512m -Xmx1024m -jar target/*.jar
  ```

## 编译问题

### Java版本不兼容

**错误信息**：
```
release version 17 not supported
```

**解决方案**：

```bash
# Linux/WSL
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# 验证版本
java -version
```

### Maven依赖下载失败

**错误信息**：
```
Could not resolve dependencies
```

**解决方案**：

1. **清理缓存**：
   ```bash
   ./mvnw clean install -U
   ```

2. **检查网络代理**：

3. **使用国内镜像**：
   在 `settings.xml` 中配置阿里云镜像

### MyBatis映射错误

**错误信息**：
```
Mapped Statements collection already contains key
```

**解决方案**：

- 检查Mapper接口和XML文件是否重复定义了相同的statement
- 确保XML文件中的namespace与Mapper接口完全匹配

## 运行时问题

### SQL列名错误

**错误信息**：
```
Unknown column 'xxx' in 'field list'
```

**排查步骤**：

1. **确认实际数据库列名**：
   ```sql
   SHOW CREATE TABLE <表名>;
   ```

2. **常见列名对照**：
   | 表 | camelCase (Java) | snake_case (MySQL) |
   |----|------------------|--------------------|
   | users | patronCategoryId | total_fines, created_at, updated_at |
   | books | categoryId, clcNumber, physicalDesc | created_at, updated_at |
   | book_items | bookId, itemTypeId, callNumber | acquired_at, created_at, updated_at |

3. **修复XML映射文件**：
   - 使用正确的列名
   - 使用 `<resultMap>` 进行列名映射

### JWT认证失败

**错误信息**：
```
Unauthorized - Invalid or expired token
```

**排查步骤**：

1. **检查Token是否过期**：
   - Token有效期为24小时
   - 过期后需要重新登录

2. **检查Token格式**：
   ```
   Authorization: Bearer <token>
   ```

3. **检查密钥配置**：
   - 确认 `JWT_SECRET` 环境变量正确

### 事务问题

**错误信息**：
```
java.lang.IllegalStateException: No transaction aspect-managed TransactionStatus
```

**解决方案**：

- 确保方法使用了 `@Transactional` 注解
- 确保事务管理器配置正确
- 检查方法调用是否在Spring代理对象上

### 缓存一致性问题

**现象**：
- 修改数据后，前端显示旧数据

**解决方案**：

1. **检查缓存是否失效**：
   - 修改操作后应该删除对应缓存
   - 使用 `CacheService.delete(key)`

2. **检查缓存过期时间**：
   - 设置合理的过期时间（如5分钟）

3. **手动清除缓存**：
   ```bash
   curl -X POST http://localhost:8080/api/system/clear-cache
   ```

### 文件上传失败

**错误信息**：
```
Invalid file type or content
```

**排查步骤**：

1. **检查文件类型**：
   - 只允许 `.jpg`, `.png`, `.jpeg`
   - 使用 `ImageIO.read()` 验证真实内容

2. **检查文件大小**：
   - 默认限制为10MB

3. **检查存储路径**：
   - 确保 `src/main/resources/static/covers/` 目录存在

## 前端问题

### API请求失败

**错误信息**：
```
Network Error
```

**排查步骤**：

1. **检查后端是否启动**：
   ```bash
   curl http://localhost:8080/api/health
   ```

2. **检查代理配置**：
   - Vite代理配置 `/api -> http://localhost:8080`

3. **检查CORS配置**：
   - 确认前端端口在允许列表中

### 登录后无法访问页面

**现象**：
- 登录成功后，页面跳转失败或显示空白

**排查步骤**：

1. **检查Token存储**：
   - 确认localStorage中存储了token

2. **检查路由守卫**：
   - 确认角色权限配置正确

3. **检查用户信息**：
   - 确认 `authStore.user` 包含正确的角色信息

### 深色模式不生效

**解决方案**：

1. **检查主题配置**：
   - 确认 `themeStore` 正确初始化
   - 检查系统主题检测逻辑

2. **检查CSS变量**：
   - 确认根元素CSS变量正确设置

## 测试问题

### 测试失败

**错误信息**：
```
java.lang.AssertionError
```

**排查步骤**：

1. **查看测试日志**：
   ```bash
   ./mvnw test -Dtest=<测试类名>
   ```

2. **检查Mock配置**：
   - 确认Mock对象返回正确数据
   - 确认测试数据准备完整

3. **运行单个测试**：
   ```bash
   ./mvnw test -Dtest=<测试类名>#<测试方法名>
   ```

### H2数据库问题

**错误信息**：
```
Table not found
```

**解决方案**：

- 确认 `schema-h2.sql` 包含所有表定义
- 确认 `seed-h2.sql` 包含测试数据

## 常见错误码对照表

| HTTP状态码 | 含义 | 可能原因 |
|------------|------|----------|
| 400 | 请求参数错误 | 缺少必填字段、格式错误、验证失败 |
| 401 | 未认证 | Token无效、过期或未提供 |
| 403 | 未授权 | 角色权限不足 |
| 404 | 资源不存在 | 请求的资源ID不存在 |
| 409 | 冲突 | 资源状态冲突（如重复借阅） |
| 429 | 请求过多 | 超过限流阈值 |
| 500 | 服务器错误 | 代码异常、数据库连接失败等 |

## 日志查看

### 后端日志

```bash
# 实时查看日志
tail -f logs/library.log

# 搜索错误日志
grep -E "ERROR|Exception" logs/library.log
```

### 前端日志

- 打开浏览器开发者工具（F12）
- 查看Console标签页
- 查看Network标签页中的API请求

## 性能问题

### 慢查询

**排查步骤**：

1. **启用SQL日志**：
   ```yaml
   mybatis:
     configuration:
       log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
   ```

2. **分析慢查询**：
   ```sql
   EXPLAIN SELECT * FROM books WHERE title LIKE '%关键词%';
   ```

3. **添加索引**：
   - 对常用查询字段添加索引
   - 避免在索引列上使用函数

### 内存泄漏

**排查步骤**：

1. **启用内存监控**：
   ```bash
   jstat -gcutil <PID> 1000
   ```

2. **分析堆转储**：
   ```bash
   jmap -dump:format=b,file=heap.hprof <PID>
   ```

3. **使用工具分析**：
   - VisualVM
   - MAT (Memory Analyzer Tool)

## 备份与恢复

### 数据库备份

```bash
mysqldump -h127.0.0.1 -uroot -p library > backup.sql
```

### 数据库恢复

```bash
mysql -h127.0.0.1 -uroot -p library < backup.sql
```

### 缓存备份

```bash
redis-cli SAVE
redis-cli BGSAVE
```

## 紧急处理流程

```
1. 发现问题
2. 查看日志定位原因
3. 评估影响范围
4. 采取临时措施（如重启服务、清除缓存）
5. 分析根本原因
6. 实施修复
7. 验证修复效果
8. 记录问题和解决方案
```

## 联系支持

如果以上方法无法解决问题，请提供以下信息：

- 完整的错误日志
- 复现步骤
- 环境信息（Java版本、MySQL版本、Redis版本）
- 相关代码片段