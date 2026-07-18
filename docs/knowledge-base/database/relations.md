# 表关系图

## 实体关系图（ERD）

```
patron_categories ───────┐
        │                │
        │ 1:N            │
        ▼                │
     users ◄─────────────┘
     │ │ │
     │ │ ├─ 1:N ──► borrow_records
     │ │ ├─ 1:N ──► fines
     │ │ └─ 1:N ──► holds
     │ │
     │ └─ patronCategoryId ───► patron_categories
     │
     └─ role: 'admin' / 'reader'

categories ───────────────┐
        │                 │
        │ 1:N             │
        ▼                 │
     books ◄──────────────┘
     │ │ │
     │ │ ├─ categoryId ───► categories
     │ │ ├─ 1:N ──► book_items
     │ │ ├─ 1:N ──► borrow_records
     │ │ └─ 1:N ──► holds
     │ │
     │ └─ available <= total
     │
     └─ status: 'available'

book_items ───────────────┐
        │                 │
        │ 1:N             │
        ▼                 │
     borrow_records ◄─────┘
     │ │
     │ ├─ bookItemId ───► book_items
     │ ├─ userId ───► users
     │ ├─ bookId ───► books
     │ │
     │ └─ status: 'active' / 'returned' / 'overdue'
     │
     └─ return_date IS NULL when active

holds ────────────────────┐
        │                 │
        │ 1:1 (ready)     │
        ▼                 │
     book_items ◄─────────┘
        │
        └─ status: 'pending' / 'ready' / 'fulfilled' / 'cancelled'

circulation_rules ────────┐
        │                 │
        │ N:N             │
        ▼                 │
     patron_categories ◄──┘
        │
        └─ item_types

fines ────────────────────┐
        │                 │
        │ 1:N             │
        ▼                 │
     borrow_records ◄─────┘
        │
        └─ type: 'overdue' / 'damaged' / 'lost'

audit_logs ───────────────┐
        │                 │
        │ N:1             │
        ▼                 │
     users ◄──────────────┘

error_logs ───────────────┐
        │                 │
        │ N:1             │
        ▼                 │
     users ◄──────────────┘
```

## 关系汇总

### 用户相关

| 主表 | 关联表 | 关联字段 | 关系 | 说明 |
|------|--------|----------|------|------|
| users | borrow_records | userId | 1:N | 一个用户可有多条借阅记录 |
| users | fines | userId | 1:N | 一个用户可有多个罚款 |
| users | holds | userId | 1:N | 一个用户可有多条预约 |
| users | audit_logs | userId | 1:N | 一个用户可有多条审计日志 |
| users | error_logs | user_id | 1:N | 一个用户可有多条错误日志 |
| patron_categories | users | patronCategoryId | 1:N | 一个用户类型可有多个用户 |

### 图书相关

| 主表 | 关联表 | 关联字段 | 关系 | 说明 |
|------|--------|----------|------|------|
| categories | books | categoryId | 1:N | 一个分类可有多本图书 |
| books | book_items | bookId | 1:N | 一本图书可有多个副本 |
| books | borrow_records | bookId | 1:N | 一本图书可有多个借阅记录 |
| books | holds | bookId | 1:N | 一本图书可有多个预约 |
| item_types | book_items | itemTypeId | 1:N | 一个物料类型可有多个副本 |

### 借阅相关

| 主表 | 关联表 | 关联字段 | 关系 | 说明 |
|------|--------|----------|------|------|
| book_items | borrow_records | bookItemId | 1:N | 一个副本可有多个借阅记录 |
| book_items | holds | bookItemId | 1:1 | 一个副本在ready状态时关联一个预约 |
| borrow_records | fines | borrowRecordId | 1:N | 一条借阅记录可有多个罚款 |

### 规则相关

| 主表 | 关联表 | 关联字段 | 关系 | 说明 |
|------|--------|----------|------|------|
| circulation_rules | patron_categories | patronCategoryId | N:1 | 一条规则关联一个用户类型 |
| circulation_rules | item_types | itemTypeId | N:1 | 一条规则关联一个物料类型 |

## 业务流程数据流转

### 借阅流程

```
1. 用户登录 → users表验证
2. 查询图书 → books表 + categories表
3. 借阅图书 → book_items表更新状态
              borrow_records表插入记录
              books表更新available
4. 归还图书 → book_items表更新状态
              borrow_records表更新return_date
              books表更新available
              如有pending hold → holds表更新状态为ready
5. 续借 → borrow_records表更新due_date和renewed
```

### 预约流程

```
1. 创建预约 → holds表插入记录(pending)
2. 归还图书(有pending hold) → holds表更新bookItemId, status=ready
                              book_items表更新status=on_hold
3. 取消预约(pending) → holds表更新status=cancelled
4. 取消预约(ready) → holds表更新status=cancelled
                     book_items表更新status=available
                     books表更新available
5. 兑现预约 → holds表更新status=fulfilled
              borrow_records表插入记录
              book_items表更新status=borrowed
```

### 罚款流程

```
1. 定时任务检查逾期 → borrow_records表查询
2. 计算罚款 → circulation_rules表查找规则
3. 创建罚款记录 → fines表插入记录
                  users表更新total_fines
4. 支付罚款 → fines表更新paid=1, paid_at
              users表更新total_fines
```

## 数据一致性保障

### 事务边界

| 操作 | 事务范围 | 涉及表 |
|------|----------|--------|
| borrow() | @Transactional | book_items, borrow_records, books |
| returnBook() | @Transactional | book_items, borrow_records, books, holds |
| renew() | @Transactional | borrow_records |
| payFine() | @Transactional | fines, users |
| cancelHold(ready) | @Transactional | holds, book_items, books |
| fulfillHold() | @Transactional | holds, book_items, borrow_records |

### 并发控制

| 场景 | 控制方式 |
|------|----------|
| 并发借阅 | @Transactional + 内部重查可用性 |
| 并发归还 | @Transactional |
| 预约状态变更 | SELECT FOR UPDATE 悲观锁 |

### 缓存一致性

| 操作 | 缓存处理 |
|------|----------|
| 创建/更新/删除图书 | 删除 book:{id}, books:list:* |
| 创建/更新/删除分类 | 删除 category:all, books:list:* |
| 更新规则 | 删除 rules:all |
| 借阅/归还 | 删除 book:{id} |
| 预约/取消预约 | 删除 book:{id} |