# 读者模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/readers | admin | 读者列表 |
| GET | /api/readers/:id | admin | 读者详情+借阅记录 |
| PUT | /api/readers/:id | admin | 管理员编辑读者 |
| PUT | /api/readers/profile | reader | 读者自编辑 |

## 数据结构

### ReaderUpdateRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | String | 否 | 邮箱 |
| phone | String | 否 | 手机号 |
| realName | String | 否 | 真实姓名 |
| patronCategoryId | Long | 否 | 用户类型ID（仅admin可改） |

### ReaderResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户ID |
| username | String | 用户名 |
| email | String | 邮箱 |
| phone | String | 手机号 |
| realName | String | 真实姓名 |
| role | String | 角色 |
| patronCategoryId | Long | 用户类型ID |
| patronCategoryName | String | 用户类型名称 |
| totalFines | BigDecimal | 总罚款 |
| createdAt | String | 创建时间 |

### ReaderDetailResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户ID |
| username | String | 用户名 |
| email | String | 邮箱 |
| phone | String | 手机号 |
| realName | String | 真实姓名 |
| role | String | 角色 |
| patronCategoryId | Long | 用户类型ID |
| totalFines | BigDecimal | 总罚款 |
| borrowRecords | BorrowRecordResponse[] | 借阅记录 |
| createdAt | String | 创建时间 |

## 接口详情

### GET /api/readers

**权限**：admin

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页数量 |

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "content": [
            {
                "id": 2,
                "username": "reader1",
                "realName": "张三",
                "patronCategoryName": "普通读者",
                "totalFines": 0.00
            }
        ],
        "totalElements": 8,
        "totalPages": 1
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/readers/:id

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 2,
        "username": "reader1",
        "email": "reader1@example.com",
        "realName": "张三",
        "patronCategoryId": 1,
        "totalFines": 5.00,
        "borrowRecords": [
            {
                "id": 1,
                "bookTitle": "算法导论",
                "checkoutDate": "2026-07-01T10:00:00",
                "dueDate": "2026-07-15T10:00:00",
                "status": "borrowed"
            }
        ],
        "createdAt": "2026-07-01T09:00:00"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### PUT /api/readers/:id

**权限**：admin

**请求体**：
```json
{
    "email": "newemail@example.com",
    "phone": "13900139000",
    "realName": "李四",
    "patronCategoryId": 2
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "读者信息更新成功",
    "data": {
        "id": 2,
        "username": "reader1",
        "email": "newemail@example.com",
        "realName": "李四"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### PUT /api/readers/profile

**权限**：reader（只能编辑自己）

**请求体**：
```json
{
    "email": "mynewemail@example.com",
    "phone": "13800138000",
    "realName": "张三"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "个人信息更新成功",
    "data": {
        "id": 2,
        "username": "reader1",
        "email": "mynewemail@example.com"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

## 权限说明

- `/api/readers` 和 `/api/readers/:id` 需要 admin 权限
- `/api/readers/profile` 需要 reader 权限，且只能编辑当前登录用户