# 表结构详解

## 1. patron_categories（用户类型）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户类型ID |
| name | VARCHAR(50) | NOT NULL | 用户类型名称 |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |

**数据示例**：

| id | name |
|----|------|
| 1 | 普通读者 |
| 2 | 教师 |
| 3 | 学生 |

## 2. item_types（物料类型）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 物料类型ID |
| name | VARCHAR(50) | NOT NULL | 物料类型名称 |
| loanDays | INT | NOT NULL DEFAULT 0 | 默认借阅天数 |
| fineRate | DECIMAL(10,2) | NOT NULL DEFAULT 0.00 | 默认罚款率 |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |

**数据示例**：

| id | name | loanDays | fineRate |
|----|------|----------|----------|
| 1 | 图书 | 14 | 0.50 |
| 2 | 期刊 | 7 | 0.30 |
| 3 | 音像资料 | 3 | 1.00 |

## 3. circulation_rules（借阅规则）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 规则ID |
| patronCategoryId | INT | NOT NULL | 用户类型ID |
| itemTypeId | INT | NOT NULL | 物料类型ID |
| maxBorrows | INT | NOT NULL DEFAULT 5 | 最大借阅数 |
| loanDays | INT | NOT NULL DEFAULT 30 | 借阅天数 |
| renewals | INT | NOT NULL DEFAULT 0 | 允许续借次数 |
| renewalDays | INT | NOT NULL DEFAULT 0 | 续借天数 |
| finePerDay | DECIMAL(10,2) | NOT NULL DEFAULT 0.00 | 日罚款金额 |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |

**唯一约束**：`uk_rule_patron_item (patronCategoryId, itemTypeId)`

## 4. users（用户）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（BCrypt哈希） |
| name | VARCHAR(100) | NOT NULL | 真实姓名 |
| role | VARCHAR(20) | NOT NULL DEFAULT 'reader' | 角色（admin/reader） |
| phone | VARCHAR(20) | NULL | 手机号 |
| email | VARCHAR(100) | NULL | 邮箱 |
| total_fines | DECIMAL(10,2) | NOT NULL DEFAULT 0.00 | 总罚款 |
| patronCategoryId | INT | NULL | 用户类型ID |
| token_version | INT | NOT NULL DEFAULT 0 | Token版本（用于注销） |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | NOT NULL DEFAULT NOW() | 更新时间 |

**唯一约束**：`uk_username (username)`

## 5. categories（分类）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 分类ID |
| name | VARCHAR(100) | NOT NULL | 分类名称 |
| desc | VARCHAR(500) | NULL | 分类描述 |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | NOT NULL DEFAULT NOW() | 更新时间 |

## 6. books（图书）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 图书ID |
| isbn | VARCHAR(20) | NOT NULL, UNIQUE | ISBN号 |
| title | VARCHAR(200) | NOT NULL | 书名 |
| author | VARCHAR(200) | NULL | 作者 |
| publisher | VARCHAR(200) | NULL | 出版社 |
| year | INT | NULL | 出版年份 |
| total | INT | NOT NULL DEFAULT 0 | 总副本数 |
| available | INT | NOT NULL DEFAULT 0 | 可借数量 |
| status | VARCHAR(20) | DEFAULT 'available' | 状态 |
| location | VARCHAR(200) | NULL | 存放位置 |
| cover | VARCHAR(500) | NULL | 封面URL |
| desc | TEXT | NULL | 简介 |
| clcNumber | VARCHAR(50) | NULL | 中图分类号 |
| physicalDesc | VARCHAR(200) | NULL | 物理描述 |
| language | VARCHAR(10) | DEFAULT 'chi' | 语言 |
| country | VARCHAR(10) | DEFAULT 'CN' | 国家 |
| categoryId | INT | NULL | 分类ID |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | NOT NULL DEFAULT NOW() | 更新时间 |

**唯一约束**：`uk_isbn (isbn)`

## 7. book_items（图书副本）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 副本ID |
| barcode | VARCHAR(50) | NOT NULL, UNIQUE | 条码 |
| callNumber | VARCHAR(50) | NULL | 索书号 |
| location | VARCHAR(200) | NULL | 存放位置 |
| condition | VARCHAR(20) | DEFAULT 'normal' | 状况（normal/damaged/lost） |
| status | VARCHAR(20) | DEFAULT 'available' | 状态（available/borrowed/on_hold/maintenance） |
| price | DECIMAL(10,2) | NULL | 价格 |
| acquired_at | DATETIME | NULL | 入库时间 |
| notes | VARCHAR(500) | NULL | 备注 |
| campus | VARCHAR(50) | NULL | 校区 |
| requests | INT | NOT NULL DEFAULT 0 | 请求次数 |
| bookId | INT | NOT NULL | 图书ID |
| itemTypeId | INT | NOT NULL DEFAULT 1 | 物料类型ID |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | NOT NULL DEFAULT NOW() | 更新时间 |

**唯一约束**：`uk_barcode (barcode)`

**索引**：`idx_bookId (bookId)`

## 8. borrow_records（借阅记录）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 借阅记录ID |
| userId | INT | NOT NULL | 用户ID |
| bookId | INT | NOT NULL | 图书ID |
| bookItemId | INT | NOT NULL | 副本ID |
| borrow_date | DATETIME | NULL | 借出日期 |
| due_date | DATETIME | NULL | 应还日期 |
| return_date | DATETIME | NULL | 实际归还日期 |
| renewed | TINYINT(1) | DEFAULT 0 | 是否已续借 |
| status | VARCHAR(20) | DEFAULT 'active' | 状态（active/returned/overdue） |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | NOT NULL DEFAULT NOW() | 更新时间 |

**索引**：`idx_userId (userId)`, `idx_bookId (bookId)`, `idx_status (status)`

## 9. fines（罚款）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 罚款ID |
| borrowRecordId | INT | NULL | 关联借阅记录ID |
| userId | INT | NOT NULL | 用户ID |
| amount | DECIMAL(10,2) | NOT NULL DEFAULT 0.00 | 金额 |
| type | VARCHAR(20) | DEFAULT 'overdue' | 类型（overdue/damaged/lost） |
| paid | TINYINT(1) | DEFAULT 0 | 是否已支付 |
| paid_at | DATETIME | NULL | 支付时间 |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |

## 10. holds（预约）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 预约ID |
| userId | INT | NOT NULL | 用户ID |
| bookId | INT | NOT NULL | 图书ID |
| bookItemId | INT | NULL | 关联副本ID（ready后有值） |
| status | VARCHAR(20) | DEFAULT 'pending' | 状态（pending/ready/fulfilled/cancelled） |
| request_date | DATETIME | NULL | 预约时间 |
| expiry_date | DATETIME | NULL | 过期时间 |
| fulfilled_at | DATETIME | NULL | 兑现时间 |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |

## 11. audit_logs（审计日志）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 日志ID |
| userId | INT | NULL | 操作用户ID |
| action | VARCHAR(100) | NULL | 操作类型 |
| target | VARCHAR(100) | NULL | 目标类型 |
| detail | TEXT | NULL | 操作详情（JSON） |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |

## 12. error_logs（错误日志）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 日志ID |
| log_id | VARCHAR(50) | NULL | 日志标识 |
| type | VARCHAR(20) | NULL | 错误类型（vue/axios/global/promise） |
| message | TEXT | NULL | 错误消息 |
| stack | TEXT | NULL | 堆栈信息 |
| url | VARCHAR(500) | NULL | 请求URL |
| method | VARCHAR(10) | NULL | 请求方法 |
| status_code | INT | NULL | HTTP状态码 |
| component | VARCHAR(100) | NULL | Vue组件名 |
| props | TEXT | NULL | 组件props（JSON） |
| user_id | INT | NULL | 用户ID |
| user_role | VARCHAR(20) | NULL | 用户角色 |
| timestamp | DATETIME | NULL | 错误发生时间 |
| created_at | DATETIME | NOT NULL DEFAULT NOW() | 创建时间 |

**索引**：`idx_type (type)`, `idx_user_id (user_id)`, `idx_created_at (created_at)`