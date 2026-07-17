# 统计模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/stats | admin | 概览统计 |
| GET | /api/stats/popular | admin | 热门图书TOP20 |
| GET | /api/stats/monthly | admin | 月度统计（12个月） |

## 数据结构

### StatsOverviewResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| totalBooks | Integer | 图书总数 |
| totalReaders | Integer | 读者总数 |
| totalCategories | Integer | 分类总数 |
| activeBorrows | Integer | 当前借阅数 |
| overdueCount | Integer | 逾期数 |

### PopularBookDTO

| 字段 | 类型 | 说明 |
|------|------|------|
| bookId | Long | 图书ID |
| title | String | 书名 |
| author | String | 作者 |
| cover | String | 封面URL |
| borrowCount | Integer | 借阅次数 |
| categoryName | String | 分类名称 |

### MonthlyStatsDTO

| 字段 | 类型 | 说明 |
|------|------|------|
| month | String | 月份（YYYY-MM） |
| borrowCount | Integer | 借阅次数 |
| returnCount | Integer | 归还次数 |
| newReaderCount | Integer | 新增读者数 |

## 接口详情

### GET /api/stats

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "totalBooks": 20,
        "totalReaders": 8,
        "totalCategories": 3,
        "activeBorrows": 15,
        "overdueCount": 2
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/stats/popular

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "bookId": 1,
            "title": "算法导论",
            "author": "Thomas H. Cormen",
            "cover": "/covers/1-算法导论.jpg",
            "borrowCount": 12,
            "categoryName": "计算机"
        },
        {
            "bookId": 2,
            "title": "深入理解计算机系统",
            "author": "Randal E. Bryant",
            "borrowCount": 10,
            "categoryName": "计算机"
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/stats/monthly

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "month": "2026-01",
            "borrowCount": 45,
            "returnCount": 42,
            "newReaderCount": 2
        },
        {
            "month": "2026-02",
            "borrowCount": 52,
            "returnCount": 48,
            "newReaderCount": 3
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```