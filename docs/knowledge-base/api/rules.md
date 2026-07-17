# 规则模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/rules | public | 规则矩阵 |
| GET | /api/rules/patron-categories | public | 用户类型列表 |
| GET | /api/rules/item-types | public | 物料类型列表 |
| PUT | /api/rules | admin | 批量更新规则 |

## 数据结构

### CirculationRule

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 规则ID |
| patronCategoryId | Long | 用户类型ID |
| patronCategoryName | String | 用户类型名称 |
| itemTypeId | Long | 物料类型ID |
| itemTypeName | String | 物料类型名称 |
| loanDays | Integer | 借阅天数 |
| maxLoans | Integer | 最大借阅数 |
| renewalsAllowed | Integer | 允许续借次数 |
| finePerDay | BigDecimal | 日罚款金额 |
| maxFine | BigDecimal | 最大罚款金额 |

### PatronCategory

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户类型ID |
| name | String | 用户类型名称 |
| description | String | 描述 |

### ItemType

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 物料类型ID |
| name | String | 物料类型名称 |
| description | String | 描述 |

### RuleUpsertRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| rules | CirculationRule[] | 是 | 规则列表 |

## 接口详情

### GET /api/rules

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "patronCategoryId": 1,
            "patronCategoryName": "普通读者",
            "itemTypeId": 1,
            "itemTypeName": "图书",
            "loanDays": 14,
            "maxLoans": 5,
            "renewalsAllowed": 1,
            "finePerDay": 0.50,
            "maxFine": 50.00
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/rules/patron-categories

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "name": "普通读者",
            "description": "普通借阅权限"
        },
        {
            "id": 2,
            "name": "教师",
            "description": "教师借阅权限"
        },
        {
            "id": 3,
            "name": "学生",
            "description": "学生借阅权限"
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/rules/item-types

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "name": "图书",
            "description": "纸质图书"
        },
        {
            "id": 2,
            "name": "期刊",
            "description": "期刊杂志"
        },
        {
            "id": 3,
            "name": "音像资料",
            "description": "光盘、磁带等"
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### PUT /api/rules

**权限**：admin

**请求体**：
```json
{
    "rules": [
        {
            "patronCategoryId": 1,
            "itemTypeId": 1,
            "loanDays": 21,
            "maxLoans": 10,
            "renewalsAllowed": 2,
            "finePerDay": 0.50,
            "maxFine": 50.00
        }
    ]
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "规则更新成功",
    "data": [
        {
            "id": 1,
            "patronCategoryName": "普通读者",
            "itemTypeName": "图书",
            "loanDays": 21,
            "maxLoans": 10
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

## 规则矩阵说明

规则矩阵是用户类型和物料类型的交叉组合：

| 用户类型 | 图书 | 期刊 | 音像资料 |
|----------|------|------|----------|
| 普通读者 | 规则1 | 规则2 | 规则3 |
| 教师 | 规则4 | 规则5 | 规则6 |
| 学生 | 规则7 | 规则8 | 规则9 |

每条规则定义了该组合的借阅参数。