# 预约模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/holds | reader | 创建预约 |
| GET | /api/holds/count | public | 待处理预约数量 |
| GET | /api/holds/my | reader | 我的预约 |
| GET | /api/holds | admin | 所有预约 |
| DELETE | /api/holds/:id | reader | 取消预约 |
| POST | /api/holds/:id/fulfill | admin | 兑现已就绪的预约 |

## 数据结构

### HoldRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| bookId | Long | 是 | 图书ID |

### HoldResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 预约ID |
| bookId | Long | 图书ID |
| bookTitle | String | 书名 |
| bookCover | String | 封面URL |
| userId | Long | 用户ID |
| username | String | 用户名 |
| realName | String | 真实姓名 |
| status | String | 状态（pending/ready/fulfilled/cancelled） |
| placedAt | String | 预约时间 |
| readyAt | String | 就绪时间 |
| fulfilledAt | String | 兑现时间 |

## 接口详情

### POST /api/holds

**权限**：reader

**请求体**：
```json
{
    "bookId": 1
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "预约成功",
    "data": {
        "id": 4,
        "bookId": 1,
        "bookTitle": "算法导论",
        "status": "pending",
        "placedAt": "2026-07-15T10:30:00"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（409）：
```json
{
    "code": 409,
    "message": "该图书有可用副本，请直接借阅",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/holds/count

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "pendingCount": 3
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/holds/my

**权限**：reader

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 4,
            "bookTitle": "算法导论",
            "status": "pending",
            "placedAt": "2026-07-15T10:30:00"
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/holds

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "content": [
            {
                "id": 4,
                "bookTitle": "算法导论",
                "username": "reader1",
                "status": "pending",
                "placedAt": "2026-07-15T10:30:00"
            }
        ],
        "totalElements": 3
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### DELETE /api/holds/:id

**权限**：reader（只能取消自己的）

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "预约取消成功",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（409）：
```json
{
    "code": 409,
    "message": "该预约已就绪，无法取消",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/holds/:id/fulfill

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "预约兑现成功",
    "data": {
        "id": 4,
        "bookTitle": "算法导论",
        "status": "fulfilled",
        "fulfilledAt": "2026-07-15T10:30:00"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

## 状态转换

```
创建预约 → pending
归还图书（有pending hold）→ on_hold → ready
取消预约（pending）→ cancelled
取消预约（ready）→ 释放副本到available
兑现预约（ready）→ fulfilled → borrowed
```