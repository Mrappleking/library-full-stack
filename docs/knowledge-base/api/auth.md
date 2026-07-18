# 认证模块 API

## 接口列表

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | public | 读者注册 |
| POST | /api/auth/login | public | 登录，返回JWT |
| GET | /api/auth/me | auth | 当前用户信息 |
| GET | /api/auth/users | admin | 所有用户列表 |
| POST | /api/auth/admin/create | admin | 创建管理员 |

## 数据结构

### RegisterRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名（3-50字符） |
| password | String | 是 | 密码（至少8位，3种字符类型） |
| email | String | 是 | 邮箱 |
| phone | String | 否 | 手机号 |
| realName | String | 是 | 真实姓名 |

### LoginRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

### LoginResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| token | String | JWT令牌 |
| tokenType | String | Bearer |
| expiresIn | Number | 过期时间（秒） |
| user | UserProfile | 用户信息 |

### UserProfile

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户ID |
| username | String | 用户名 |
| email | String | 邮箱 |
| phone | String | 手机号 |
| realName | String | 真实姓名 |
| role | String | 角色（admin/reader） |
| patronCategoryId | Long | 用户类型ID |
| totalFines | BigDecimal | 总罚款 |
| createdAt | String | 创建时间 |

## 接口详情

### POST /api/auth/register

**请求体**：
```json
{
    "username": "reader001",
    "password": "Reader@2024",
    "email": "reader001@example.com",
    "phone": "13800138000",
    "realName": "张三"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "注册成功",
    "data": {
        "id": 10,
        "username": "reader001",
        "email": "reader001@example.com",
        "phone": "13800138000",
        "realName": "张三",
        "role": "reader",
        "patronCategoryId": 1,
        "totalFines": 0.00,
        "createdAt": "2026-07-15T10:30:00"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（409）：
```json
{
    "code": 409,
    "message": "用户名已存在",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/auth/login

**请求体**：
```json
{
    "username": "admin",
    "password": "Admin@2024"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "tokenType": "Bearer",
        "expiresIn": 86400,
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@library.com",
            "realName": "管理员",
            "role": "admin"
        }
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

**失败响应**（400）：
```json
{
    "code": 400,
    "message": "用户名或密码错误",
    "data": null,
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/auth/me

**请求头**：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "username": "admin",
        "email": "admin@library.com",
        "realName": "管理员",
        "role": "admin"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

### GET /api/auth/users

**权限**：admin

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
            "username": "admin",
            "role": "admin"
        },
        {
            "id": 2,
            "username": "reader1",
            "role": "reader"
        }
    ],
    "timestamp": "2026-07-15T10:30:00"
}
```

### POST /api/auth/admin/create

**权限**：admin

**请求体**：
```json
{
    "username": "admin2",
    "password": "Admin@2024",
    "email": "admin2@library.com",
    "realName": "管理员2"
}
```

**成功响应**（200）：
```json
{
    "code": 200,
    "message": "管理员创建成功",
    "data": {
        "id": 11,
        "username": "admin2",
        "role": "admin"
    },
    "timestamp": "2026-07-15T10:30:00"
}
```

## 密码验证规则

1. 长度至少8位
2. 必须包含至少3种字符类型：
   - 大写字母（A-Z）
   - 小写字母（a-z）
   - 数字（0-9）
   - 特殊字符（!@#$%^&*等）