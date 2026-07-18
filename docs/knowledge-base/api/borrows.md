# 借阅模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/borrows/my | reader | 我的借阅列表 |
| GET | /api/borrows | admin | 所有借阅记录 |
| GET | /api/borrows/history | reader | 我的借阅历史 |
| POST | /api/borrows/borrow | reader | 借阅图书（@Transactional） |
| POST | /api/borrows/return/:id | reader+admin | 归还图书（预约升级） |
| POST | /api/borrows/renew/:id | reader | 续借（每次借阅限一次） |

## 数据结构

### BorrowRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| bookId | Long | 是 | 图书ID |
| targetItemId | Long | 否 | 指定副本ID（可选） |

### BorrowRecordResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 借阅记录ID |
| bookId | Long | 图书ID |
| bookTitle | String | 书名 |
| bookCover | String | 封面URL |
| barcode | String | 副本条码 |
| borrowerId | Long | 借阅者ID |
| borrowerName | String | 借阅者姓名 |
| checkoutDate | String | 借出日期 |
| dueDate | String | 应还日期 |
| returnDate | String | 实际归还日期（null表示未还） |
| renewed | Boolean | 是否已续借 |
| status | String | 状态（borrowed/returned/overdue） |

### BorrowDetailResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 借阅记录ID |
| book | BookRef | 图书信息 |
| item | BookItemRef | 副本信息 |
| borrower | UserRef | 借阅者信息 |
| checkoutDate | String | 借出日期 |
| dueDate | String | 应还日期 |
| returnDate | String | 实际归还日期 |
| renewed | Boolean | 是否已续借 |
| status | String | 状态 |

## 接口详情

### GET /api/borrows/my

**权限**：reader

**请求头**：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "bookId": 1,
            "bookTitle": "算法导论",
            "bookCover": "/covers/1-算法导论.jpg",
            "barcode": "BK001",
            "checkoutDate": "2026-07-01T10:00:00",
            "dueDate": "2026-07-15T10:00:00",
            "returnDate": null,
            "renewed": false,
            "status": "borrowed"
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/borrows

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
                "id": 1,
                "bookTitle": "算法导论",
                "borrowerName": "张三",
                "checkoutDate": "2026-07-01T10:00:00",
                "dueDate": "2026-07-15T10:00:00",
                "status": "borrowed"
            }
        ],
        "totalElements": 23,
        "totalPages": 2
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/borrows/history

**权限**：reader

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 5,
            "bookTitle": "深入理解计算机系统",
            "checkoutDate": "2026-06-01T10:00:00",
            "dueDate": "2026-06-15T10:00:00",
            "returnDate": "2026-06-14T15:00:00",
            "status": "returned"
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/borrows/borrow

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
    "message": "借阅成功",
    "data": {
        "id": 24,
        "bookId": 1,
        "bookTitle": "算法导论",
        "barcode": "BK003",
        "checkoutDate": "2026-07-15T10:30:00",
        "dueDate": "2026-07-29T10:30:00",
        "status": "borrowed"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（409）：
```json
{
    "code": 409,
    "message": "该图书暂无可用副本",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/borrows/return/:id

**权限**：reader（只能还自己的）/ admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "归还成功",
    "data": {
        "id": 1,
        "bookTitle": "算法导论",
        "returnDate": "2026-07-15T10:30:00",
        "status": "returned"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（404）：
```json
{
    "code": 404,
    "message": "借阅记录不存在",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/borrows/renew/:id

**权限**：reader（只能续借自己的）

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "续借成功",
    "data": {
        "id": 1,
        "bookTitle": "算法导论",
        "dueDate": "2026-08-01T10:30:00",
        "renewed": true
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（409）：
```json
{
    "code": 409,
    "message": "该借阅已续借过一次，无法再次续借",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

## 状态转换

```
borrow() → available → borrowed
returnBook() WITH pending hold → borrowed → on_hold
returnBook() WITHOUT hold → borrowed → available
renew() → dueDate + 借阅期限
```