# 图书模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/books | public | 图书列表（搜索+过滤+排序+分页） |
| GET | /api/books/facets | public | 分类统计 |
| GET | /api/books/:id | public | 图书详情+副本列表 |
| GET | /api/books/:id/items | public | 副本列表 |
| POST | /api/books | admin | 创建图书 |
| PUT | /api/books/:id | admin | 更新图书 |
| DELETE | /api/books/:id | admin | 删除图书（有借阅则禁止） |
| POST | /api/books/:id/reconcile | admin | 修复可用数量 |
| POST | /api/books/:id/items | admin | 添加副本 |

## 数据结构

### BookListRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| search | String | 否 | 搜索关键词 |
| categoryId | Long | 否 | 分类ID |
| page | Integer | 否 | 页码（默认1） |
| pageSize | Integer | 否 | 每页数量（默认20） |
| sortBy | String | 否 | 排序字段（title/author/publishedYear） |
| sortOrder | String | 否 | 排序方向（asc/desc） |

### BookCreateRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 是 | 书名 |
| author | String | 是 | 作者 |
| isbn | String | 否 | ISBN |
| publisher | String | 否 | 出版社 |
| publishedYear | Integer | 否 | 出版年份 |
| categoryId | Long | 是 | 分类ID |
| description | String | 否 | 简介 |
| clcNumber | String | 否 | 中图分类号 |
| physicalDesc | String | 否 | 物理描述 |

### BookUpdateRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 否 | 书名 |
| author | String | 否 | 作者 |
| isbn | String | 否 | ISBN |
| publisher | String | 否 | 出版社 |
| publishedYear | Integer | 否 | 出版年份 |
| categoryId | Long | 否 | 分类ID |
| description | String | 否 | 简介 |
| clcNumber | String | 否 | 中图分类号 |
| physicalDesc | String | 否 | 物理描述 |

### BookResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 图书ID |
| title | String | 书名 |
| author | String | 作者 |
| isbn | String | ISBN |
| publisher | String | 出版社 |
| publishedYear | Integer | 出版年份 |
| categoryId | Long | 分类ID |
| categoryName | String | 分类名称 |
| cover | String | 封面URL |
| available | Integer | 可借数量 |
| totalCopies | Integer | 总副本数 |
| description | String | 简介 |
| createdAt | String | 创建时间 |

### BookDetailResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 图书ID |
| title | String | 书名 |
| author | String | 作者 |
| isbn | String | ISBN |
| publisher | String | 出版社 |
| publishedYear | Integer | 出版年份 |
| category | CategoryRef | 分类信息 |
| cover | String | 封面URL |
| available | Integer | 可借数量 |
| totalCopies | Integer | 总副本数 |
| items | BookItemRef[] | 副本列表 |
| description | String | 简介 |
| clcNumber | String | 中图分类号 |
| physicalDesc | String | 物理描述 |
| createdAt | String | 创建时间 |

### BookItemRef

| 字段 | 类型 | 说明 |
|------|------|------|
| barcode | String | 条码 |
| status | String | 状态（available/borrowed/on_hold/maintenance） |
| callNumber | String | 索书号 |
| acquiredAt | String | 入库时间 |

### FacetsDTO

| 字段 | 类型 | 说明 |
|------|------|------|
| categories | CategoryFacet[] | 分类统计 |

### CategoryFacet

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 分类ID |
| name | String | 分类名称 |
| count | Integer | 图书数量 |

## 接口详情

### GET /api/books

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| search | String | 否 | 搜索关键词 |
| categoryId | Long | 否 | 分类ID |
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
                "title": "算法导论",
                "author": "Thomas H. Cormen",
                "cover": "/covers/1-算法导论.jpg",
                "available": 3,
                "totalCopies": 5
            }
        ],
        "totalElements": 20,
        "totalPages": 1,
        "currentPage": 1
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/books/facets

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "categories": [
            { "id": 1, "name": "计算机", "count": 8 },
            { "id": 2, "name": "文学", "count": 6 },
            { "id": 3, "name": "历史", "count": 3 }
        ]
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/books/:id

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "title": "算法导论",
        "author": "Thomas H. Cormen",
        "isbn": "978-7-111-40701-0",
        "publisher": "机械工业出版社",
        "publishedYear": 2012,
        "category": {
            "id": 1,
            "name": "计算机"
        },
        "cover": "/covers/1-算法导论.jpg",
        "available": 3,
        "totalCopies": 5,
        "items": [
            { "barcode": "BK001", "status": "available", "callNumber": "TP301.6/C62" },
            { "barcode": "BK002", "status": "borrowed", "callNumber": "TP301.6/C62" }
        ],
        "description": "本书是算法领域的经典教材...",
        "clcNumber": "TP301.6",
        "createdAt": "2026-07-01T09:00:00"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（404）：
```json
{
    "code": 404,
    "message": "图书不存在",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/books

**权限**：admin

**请求体**：
```json
{
    "title": "深度学习",
    "author": "Ian Goodfellow",
    "isbn": "978-7-115-41737-4",
    "publisher": "人民邮电出版社",
    "publishedYear": 2017,
    "categoryId": 1,
    "description": "全面介绍深度学习的理论与实践"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "图书创建成功",
    "data": {
        "id": 21,
        "title": "深度学习",
        "author": "Ian Goodfellow",
        "available": 0,
        "totalCopies": 0
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### PUT /api/books/:id

**权限**：admin

**请求体**：
```json
{
    "title": "算法导论（第三版）",
    "description": "更新简介"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "图书更新成功",
    "data": {
        "id": 1,
        "title": "算法导论（第三版）",
        "author": "Thomas H. Cormen"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### DELETE /api/books/:id

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "图书删除成功",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（409）：
```json
{
    "code": 409,
    "message": "该图书仍有副本或借阅记录，无法删除",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/books/:id/items

**权限**：admin

**请求体**：
```json
{
    "count": 3,
    "callNumber": "TP301.6/C62"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "添加副本成功",
    "data": {
        "id": 1,
        "title": "算法导论",
        "available": 6,
        "totalCopies": 8
    },
    "timestamp": "2026-07-15T10:30:00"
}
```