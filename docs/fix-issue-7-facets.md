# Fix: getFacets 返回空对象，补全分面筛选

> Issue: #7 — StatsService.getFacets() 返回空对象，统计面板的分类筛选功能不完整

## 问题分析

1. **前端 `onFacetSelect`** 只将 `campus` 传递到 API，`language`、`subject`、`yearRange`、`location` 分面点击后不生效
2. **后端 `GET /api/books/facets`** 路由只接收 `search` 和 `categoryId` 参数，忽略其他过滤条件
3. **后端 `getFacets` 服务** 的 where 子句未应用 `campus`、`language`、`yearMin`/`yearMax`、`location` 过滤

## 修复内容

### 前端 `Search.vue` — onFacetSelect
- 从所有 `activeFilters` 构建 `BookListParams`
- `subject` → `categoryId`（数字转换）
- `yearRange`（如 "2020s"）→ `yearMin`/`yearMax`
- 点击分面后同时调用 `updateFacets` 刷新分面面板

### 后端 `books.ts` 路由 — GET /facets
- 新增接收 `campus`、`language`、`yearMin`、`yearMax`、`location` 参数
- 完整传递给 `bookService.getFacets()`

### 后端 `book.service.ts` — getFacets
- `where` 子句新增 `language`、`yearMin`/`yearMax` 过滤
- `itemWhere` 子句新增 `campus`、`location` 过滤
- 分面计数会随用户选择的过滤条件联动更新

## 改动文件

| 文件 | 改动 |
|------|------|
| `frontend/src/views/public/Search.vue` | onFacetSelect 补全所有分面参数映射 |
| `backend/src/routes/books.ts` | facets 路由接收完整过滤参数 |
| `backend/src/services/book.service.ts` | getFacets 服务应用全部过滤条件 |

## 测试结果

- 服务层单元测试: 52/52 ✅
- 路由集成测试: 需 MySQL（非本次修改影响）
