# Library Full-Stack 项目知识库

> 图书馆管理系统全栈项目的技术文档中心，包含架构设计、API接口、数据库设计、开发规范等内容。

## 目录结构

```
docs/knowledge-base/
├── README.md                    # 知识库入口（本文件）
├── architecture/                # 架构设计文档
│   ├── overview.md              # 系统架构总览
│   ├── layers.md                # 四层架构详解
│   ├── security-architecture.md # 安全架构
│   └── cache-strategy.md        # 缓存策略
├── api/                         # API接口文档
│   ├── auth.md                  # 认证模块
│   ├── books.md                 # 图书模块
│   ├── borrows.md               # 借阅模块
│   ├── readers.md               # 读者模块
│   ├── categories.md            # 分类模块
│   ├── fines.md                 # 罚款模块
│   ├── holds.md                 # 预约模块
│   ├── rules.md                 # 规则模块
│   └── stats.md                 # 统计模块
├── database/                    # 数据库设计文档
│   ├── schema.md                # 数据库Schema设计
│   ├── tables.md                # 表结构详解
│   ├── relations.md             # 表关系图
│   └── seed-data.md             # 初始化数据说明
├── frontend/                    # 前端开发文档
│   ├── structure.md             # 前端项目结构
│   ├── components.md            # 组件说明
│   ├── state-management.md      # 状态管理
│   ├── routing.md               # 路由配置
│   └── api-client.md            # API调用规范
├── backend/                     # 后端开发文档
│   ├── project-structure.md     # 后端项目结构
│   ├── controller.md            # Controller层规范
│   ├── service.md               # Service层规范
│   ├── mapper.md                # Mapper层规范
│   ├── dto-design.md            # DTO设计规范
│   └── testing.md               # 测试规范
└── security/                    # 安全与运维文档
    ├── security-best-practices.md # 安全最佳实践
    ├── error-handling.md        # 错误处理规范
    ├── troubleshooting.md       # 故障排查指南
    └── deployment.md            # 部署指南
```

## 快速导航

### 架构设计
- [系统架构总览](architecture/overview.md)
- [四层架构详解](architecture/layers.md)
- [安全架构](architecture/security-architecture.md)
- [缓存策略](architecture/cache-strategy.md)

### API接口
- [认证模块](api/auth.md)
- [图书模块](api/books.md)
- [借阅模块](api/borrows.md)
- [读者模块](api/readers.md)
- [分类模块](api/categories.md)
- [罚款模块](api/fines.md)
- [预约模块](api/holds.md)
- [规则模块](api/rules.md)
- [统计模块](api/stats.md)

### 数据库设计
- [数据库Schema设计](database/schema.md)
- [表结构详解](database/tables.md)
- [表关系图](database/relations.md)
- [初始化数据说明](database/seed-data.md)

### 前端开发
- [前端项目结构](frontend/structure.md)
- [组件说明](frontend/components.md)
- [状态管理](frontend/state-management.md)
- [路由配置](frontend/routing.md)
- [API调用规范](frontend/api-client.md)

### 后端开发
- [后端项目结构](backend/project-structure.md)
- [Controller层规范](backend/controller.md)
- [Service层规范](backend/service.md)
- [Mapper层规范](backend/mapper.md)
- [DTO设计规范](backend/dto-design.md)
- [测试规范](backend/testing.md)

### 安全与运维
- [安全最佳实践](security/security-best-practices.md)
- [错误处理规范](security/error-handling.md)
- [故障排查指南](security/troubleshooting.md)
- [部署指南](security/deployment.md)

## 项目概览

| 项目 | 技术栈 | 版本 |
|------|--------|------|
| 后端 | Spring Boot | 3.2.x |
| 后端 | MyBatis | 3.0.x |
| 后端 | MySQL | 8.0+ |
| 后端 | Redis | 7.0+ |
| 前端 | Vue | 3.4+ |
| 前端 | Vite | 5.2+ |
| 前端 | Naive UI | 2.38+ |
| 前端 | Pinia | 2.1+ |

## 快速开始

```bash
# 后端启动
./start.sh

# 前端启动
cd frontend
npm install
npm run dev
```

## 重要提示

- 所有数据库列名必须对照 `SHOW CREATE TABLE` 确认实际名称
- 所有多DAO写入操作必须添加 `@Transactional`
- 前端API调用必须使用统一的 `ApiResponse<T>` 响应格式
- 提交代码前必须运行 `./mvnw test` 确保所有测试通过