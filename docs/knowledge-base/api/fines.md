# 罚款模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/fines | admin | 所有罚款（可按类型/是否已支付过滤） |
| GET | /api/fines/my | reader | 我的罚款 |
| POST | /api/fines/:id/pay | admin | 标记为已支付 |

## 数据结构

### FineResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 罚款ID |
| userId | Long | 用户ID |
| username | String | 用户名 |
| realName | String | 真实姓名 |
| borrowId | Long | 借阅记录ID |
| bookTitle | String | 书名 |
| amount | BigDecimal | 金额 |
| type | String | 类型（overdue/damaged/lost） |
| paid | Boolean | 是否已支付 |
| paidAt | String | 支付时间 |
| createdAt | String | 创建时间 |

## 接口详情

### GET /api/fines

**权限**：admin

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 否 | 类型（overdue/damaged/lost） |
| paid | Boolean | 否 | 是否已支付 |
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
                "id": 1,
                "userId": 2,
                "username": "reader1",
                "realName": "张三",
                "bookTitle": "算法导论",
                "amount": 5.00,
                "type": "overdue",
                "paid": false,
                "createdAt": "2026-07-15T10:00:00"
            }
        ],
        "totalElements": 2,
        "totalPages": 1
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/fines/my

**权限**：reader

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "bookTitle": "算法导论",
            "amount": 5.00,
            "type": "overdue",
            "paid": false,
            "createdAt": "2026-07-15T10:00:00"
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/fines/:id/pay

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "支付成功",
    "data": {
        "id": 1,
        "amount": 5.00,
        "paid": true,
        "paidAt": "2026-07-15T10:30:00"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

## 罚款类型

| 类型 | 说明 |
|------|------|
| overdue | 逾期罚款 |
| damaged | 损坏罚款 |
| lost | 丢失罚款 |

## 逾期罚款计算

逾期罚款由定时任务 `OverdueFineScheduler` 每日计算：

1. 查询所有逾期未还的借阅记录
2. 根据用户类型和图书类型查找对应的罚款规则
3. 计算逾期天数 × 日罚款金额
4. 创建罚款记录并更新用户总罚款