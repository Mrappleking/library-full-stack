# B1 + B2 修复说明

## B1: fulfillHold 创建 BorrowRecord

**问题**: `hold.service.ts` 的 `fulfillHold` 函数在管理员履行预约时：
- 将 `BookItem.status` 从 `on_hold` 改为 `borrowed`
- 将 `Hold.status` 标记为 `fulfilled`
- **但没有创建 `BorrowRecord`**

这导致复本处于 `borrowed` 状态却没有对应的借阅记录，后续无法通过 `POST /borrows/return` 正常还书。

**修复**:
- 在 `$transaction` 内新增 `tx.borrowRecord.create()` 调用
- 通过 `getRule()` 计算正确的 `dueDate`（基于读者类型 × 资料类型规则）
- `book.available` 计数不变（预约路径下该值已在原始借阅时递减，还书+预约时未递增）

**改动文件**: `backend/src/services/hold.service.ts`
- 新增 `import { getRule } from './rules.js'`
- `fulfillHold` 函数重写：获取规则 → 计算到期日 → 事务内创建借阅记录

---

## B2: renew 续借竞态条件修复

**问题**: `borrow.service.ts` 的 `renew` 函数中：
- `renewed` 标志的检查在事务外执行
- `borrowRecord.update` 无事务包装

两个并发续借请求可以同时读到 `renewed=false`，双双成功续借，绕过"仅续一次"限制。

**修复**:
- 将续借逻辑包装进 `prisma.$transaction(async (tx) => {...})`
- 在事务内重新读取 `borrowRecord` 并检查 `renewed` 标志
- 在事务内执行 `borrowRecord.update`

**改动文件**: `backend/src/services/borrow.service.ts`
- `renew` 函数重构：事务内校验 + 更新

---

## 测试结果

| 层级 | 结果 |
|------|------|
| 服务层单元测试 (52) | ✅ 全部通过 |
| 路由集成测试 (54) | ⏭️ 需 MySQL（与本次修改无关） |
