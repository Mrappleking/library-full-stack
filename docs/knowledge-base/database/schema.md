# 数据库Schema设计

## 数据库概述

```
数据库名称: library
字符集: utf8mb4
排序规则: utf8mb4_unicode_ci
存储引擎: InnoDB
```

## 表关系图

```
patron_categories ────< users
       │                   │
       │                   ├──< borrow_records
       │                   ├──< fines
       │                   └──< holds
item_types ───────────────< book_items
       │                          │
       │                          ├──< borrow_records
       │                          └──< holds
circulation_rules ────(patronCategoryId, itemTypeId)
categories ──────────< books
books ───────────────< book_items
       │
       ├──< borrow_records
       └──< holds
```

## 表清单

| 序号 | 表名 | 说明 | 行数（初始） |
|------|------|------|-------------|
| 1 | patron_categories | 用户类型 | 3 |
| 2 | item_types | 物料类型 | 3 |
| 3 | circulation_rules | 借阅规则 | 9 |
| 4 | users | 用户 | 9 |
| 5 | categories | 分类 | 3 |
| 6 | books | 图书 | 20 |
| 7 | book_items | 图书副本 | 63 |
| 8 | borrow_records | 借阅记录 | 23 |
| 9 | fines | 罚款 | 2 |
| 10 | holds | 预约 | 3 |
| 11 | audit_logs | 审计日志 | 动态 |
| 12 | error_logs | 错误日志 | 动态 |

## 列名命名规范

数据库采用混合命名风格：

| 表 | camelCase列 | snake_case列 |
|----|-------------|--------------|
| users | patronCategoryId, token_version | total_fines, created_at, updated_at |
| books | categoryId, clcNumber, physicalDesc | created_at, updated_at |
| book_items | bookId, itemTypeId, callNumber | acquired_at, created_at, updated_at |
| borrow_records | userId, bookId, bookItemId | borrow_date, due_date, return_date, created_at, updated_at |
| fines | borrowRecordId, userId | paid_at, created_at |
| holds | userId, bookId, bookItemId | request_date, expiry_date, fulfilled_at, created_at |

> **重要**：编写SQL时必须对照 `SHOW CREATE TABLE` 确认实际列名，避免 `Unknown column` 错误。

## 索引设计

| 表 | 索引名 | 字段 | 类型 |
|----|--------|------|------|
| users | uk_username | username | UNIQUE |
| books | uk_isbn | isbn | UNIQUE |
| book_items | uk_barcode | barcode | UNIQUE |
| book_items | idx_bookId | bookId | INDEX |
| circulation_rules | uk_rule_patron_item | patronCategoryId, itemTypeId | UNIQUE |
| borrow_records | idx_userId | userId | INDEX |
| borrow_records | idx_bookId | bookId | INDEX |
| borrow_records | idx_status | status | INDEX |
| error_logs | idx_type | type | INDEX |
| error_logs | idx_user_id | user_id | INDEX |
| error_logs | idx_created_at | created_at | INDEX |

## 数据完整性约束

### 外键逻辑约束

虽然数据库未显式创建外键，但业务层应保证以下逻辑约束：

| 主表 | 子表 | 关联字段 | 约束 |
|------|------|----------|------|
| patron_categories | users | patronCategoryId | 删除用户类型前需检查是否有用户引用 |
| item_types | book_items | itemTypeId | 删除物料类型前需检查是否有副本引用 |
| categories | books | categoryId | 删除分类前需检查是否有图书引用 |
| books | book_items | bookId | 删除图书前需检查是否有副本和借阅记录 |
| books | borrow_records | bookId | - |
| books | holds | bookId | - |
| users | borrow_records | userId | - |
| users | fines | userId | - |
| users | holds | userId | - |
| book_items | borrow_records | bookItemId | - |
| book_items | holds | bookItemId | - |

### 业务约束

| 约束 | 说明 |
|------|------|
| book.available >= 0 | 图书可借数量不能为负 |
| borrow_records.return_date >= borrow_records.borrow_date | 归还日期不能早于借出日期 |
| fines.amount >= 0 | 罚款金额不能为负 |
| holds.status IN (pending, ready, fulfilled, cancelled) | 预约状态枚举值 |
| borrow_records.status IN (active, returned, overdue) | 借阅状态枚举值 |

## 初始化数据

初始化数据通过 `seed.sql` 文件导入：

```bash
mysql -h127.0.0.1 -uroot -p library < seed.sql
```

## 数据库迁移

当schema变更时，需执行迁移SQL：

```sql
-- 示例：添加新字段
ALTER TABLE users ADD COLUMN token_version INT NOT NULL DEFAULT 0;
```

## 备份策略

```bash
# 备份数据库
mysqldump -h127.0.0.1 -uroot -p library > library_backup.sql

# 恢复数据库
mysql -h127.0.0.1 -uroot -p library < library_backup.sql
```