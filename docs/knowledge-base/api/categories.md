# 分类模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/categories | public | 分类列表（含图书数量） |
| POST | /api/categories | admin | 创建分类 |
| PUT | /api/categories/:id | admin | 更新分类 |
| DELETE | /api/categories/:id | admin | 删除分类（有图书则拒绝） |

## 数据结构

### CategoryCreateRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 分类名称（2-50字符） |
| description | String | 否 | 分类描述 |

### CategoryUpdateRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 否 | 分类名称 |
| description | String | 否 | 分类描述 |

### CategoryResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 分类ID |
| name | String | 分类名称 |
| description | String | 分类描述 |
| bookCount | Integer | 图书数量 |
| createdAt | String | 创建时间 |

## 接口详情

### GET /api/categories

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "name": "计算机",
            "description": "计算机科学与技术相关书籍",
            "bookCount": 8
        },
        {
            "id": 2,
            "name": "文学",
            "description": "文学作品",
            "bookCount": 6
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/categories

**权限**：admin

**请求体**：
```json
{
    "name": "历史",
    "description": "历史类书籍"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "分类创建成功",
    "data": {
        "id": 4,
        "name": "历史",
        "description": "历史类书籍",
        "bookCount": 0
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（409）：
```json
{
    "code": 409,
    "message": "分类名称已存在",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### PUT /api/categories/:id

**权限**：admin

**请求体**：
```json
{
    "name": "计算机科学",
    "description": "更新描述"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "分类更新成功",
    "data": {
        "id": 1,
        "name": "计算机科学",
        "description": "更新描述"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### DELETE /api/categories/:id

**权限**：admin

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "分类删除成功",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（409）：
```json
{
    "code": 409,
    "message": "该分类下仍有图书，无法删除",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```