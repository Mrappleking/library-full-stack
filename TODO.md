# Library Full-Stack System — 未完成事项与优化清单

> 按 PLAN.md 7 模块对齐。M=A/B/C/D/E/F/G 标注归属模块。

## 一、DESIGN-TODO（15 项，应在 Module E 解决）

| # | 位置 | 决策点 | 归属 |
|---|------|--------|------|
| 1 | Dashboard | 借阅动态——列表 / 时序图 / 卡片？ | E |
| 2 | Stats | 热门书柱状图 + 月度折线图——ECharts / Chart.js / Naive UI？ | E |
| 3 | admin/Books 展开面板 | 复本展示方式——NCard / NDataTable / NList？条码号等宽字体？ | E |
| 4 | admin/Books 加复本 Modal | 批量条码——每行 input / +号动态加行 / Textarea 换行分隔？ | E |
| 5 | admin/Borrows 还书确认 | 逾期弹窗——显示逾期天数+金额再确认 / 直接还书后提示？ | E |
| 6 | reader/MyBorrows | 欠费总额——顶部统计卡片 / 列表行内 / 独立 Badge？ | E |
| 7 | admin/Fines | 页面设计——筛选顶/侧？列表+分页 / 卡片？ | E |
| 8 | admin/Settings | 规则矩阵编辑器——NSelect 交叉编辑 / 独立表单？可视化方式？ | E |
| 9 | 图书详情页 — 封面区 | 占位图——CSS渐变色+书名 / 纯色+图标 / 骨架屏？ | E |
| 10 | 图书详情页 — 复本状态 | 颜色——在架=绿/借出=橙/预约中=蓝？ | E |
| 11 | 图书详情页 — 底部区 | 相关推荐/读者评论/标签——要不要？放什么？ | E |
| 12 | 流通台 — 扫码框 | 焦点样式？placeholder？动画？ | F |
| 13 | 流通台 — 操作队列 | 卡片式 / 紧凑列表？借/还颜色区分？ | F |
| 14 | 流通台 — 声音反馈 | "嘀"/"叮"？Web Audio API？ | F |
| 15 | 流通台 — 读者信息 | 头像占位？ | F |

## 二、功能缺失（按 PLAN 模块排）

| # | 功能 | 归属 | 优先级 |
|---|------|------|--------|
| 1 | 封面服务（OpenLibrary + 豆瓣 fallback） | C | P0 |
| 2 | 分面搜索 API（4 维起步） | C | P0 |
| 3 | 前端 typed API + stores + composables | D | P0 |
| 4 | 11 个可复用 UI 组件 | D | P0 |
| 5 | 搜索页 + 详情页 | E | P0 |
| 6 | 流通台（收银模式） | F | P0 |
| 7 | 还书→预约联动 | G | P1 |
| 8 | 预约系统（Hold 表 + 6 API） | G | P1 |
| 9 | 操作审计日志（AuditLog 表） | 远期 | P1 |
| 10 | CSV/PDF 导出 | 远期 | P2 |
| 11 | 批量导入（MARC/CSV） | 远期 | P2 |
| 12 | 通知系统（站内+邮件） | 远期 | P2 |
| 13 | 多馆藏地 + 转库操作 | 远期 | P3 |
| 14 | 期刊管理 | 远期 | P3 |
| 15 | 读者自助（密码重置/在线缴费） | 远期 | P3 |
| 16 | 国际化 | 远期 | P3 |

## 三、性能优化

| # | 位置 | 现状 | 方案 | 归属 |
|---|------|------|------|------|
| 1 | stats/monthly | JS 内存分组 | 改用 `GROUP BY DATE_FORMAT()` | C |
| 2 | Naive UI bundle | 1.36MB 未 tree-shaking | 按需引入 | D |
| 3 | 缓存 | 仅文档写了策略 | GET /categories 加内存 Map 5min | D |
| 4 | borrows 列表 | 全量返回无分页 | 加 page/limit | A |
| 5 | Book 列表 | 每次 include + _count | 分类不变数据加缓存 | C |

## 四、安全加固

| # | 位置 | 现状 | 方案 |
|---|------|------|------|
| 1 | CORS | `origin: true` 全放 | 生产改为白名单 |
| 2 | 速率限制 | 无 | `@fastify/rate-limit` |
| 3 | JWT | 无 refresh | refresh token 轮换 |
| 4 | Helmet | 未安装 | `@fastify/helmet` |
| 5 | 前端权限 | 按钮纯前端控制 | 后端已校验，前端加固 |

## 五、工程化

| # | 位置 | 现状 | 方案 | 归属 |
|---|------|------|------|------|
| 1 | 自动化测试 | 零测试 | vitest + inject + @vue/test-utils | A-G |
| 2 | CI/CD | 无 | GitHub Actions: lint→test→build | 远期 |
| 3 | 数据库迁移 | 只用 db push | Schema 稳定后切 migrate dev | B |
| 4 | 前后端类型共享 | 各自定义 | 抽 shared/types.ts | A |
| 5 | 错误处理统一 | 文档写了路由未全改 | setErrorHandler 统一拦截 | A |
| 6 | 前端错误粒度 | message.error(e.message) | 字段级绑定 NForm | D |
| 7 | 日志结构化 | pino 无自定义字段 | 加 requestId 追踪 | A |
| 8 | BorrowRecord.status | String 无枚举 | 改为 enum | 远期 |
| 9 | .env.example | 要求但未创建 | 创建 backend/.env.example | **立即** |
| 10 | vitest 安装 | 未安装 | `npm i -D vitest @vitest/coverage-v8` | **立即** |

## 五-B、测试任务（按模块）

| # | 文件 | 用例数 | 归属 |
|---|------|--------|------|
| 1 | `__tests__/helpers.ts` | — (工具) | A |
| 2 | `__tests__/setup.ts` | — (工具) | A |
| 3 | `__tests__/services/auth.service.test.ts` | 6 | A |
| 4 | `__tests__/services/book.service.test.ts` | 7 | A→C(增量) |
| 5 | `__tests__/services/borrow.service.test.ts` | 10 | A |
| 6 | `__tests__/services/category.service.test.ts` | 4 | A |
| 7 | `__tests__/services/user.service.test.ts` | 4 | A |
| 8 | `__tests__/services/stats.service.test.ts` | 3 | A |
| 9 | `__tests__/services/fine.service.test.ts` | 3 | A |
| 10 | `__tests__/services/rule.service.test.ts` | 3 | A |
| 11 | `__tests__/routes/auth.test.ts` | 6 | A |
| 12 | `__tests__/routes/books.test.ts` | 7 | A |
| 13 | `__tests__/routes/borrows.test.ts` | 6 | A |
| 14 | `__tests__/services/cover.service.test.ts` | 3 | C |
| 15 | `__tests__/components/BookCard.test.ts` | 3 | D |
| 16 | `__tests__/components/FacetPanel.test.ts` | 2 | D |
| 17 | `__tests__/components/HoldingsTable.test.ts` | 2 | D |
| 18 | `__tests__/components/StatusBadge.test.ts` | 4 | D |
| 19 | `__tests__/stores/auth.test.ts` | 4 | D |
| 20 | `__tests__/stores/books.test.ts` | 3 | D |
| 21 | `__tests__/composables/usePagination.test.ts` | 3 | D |
| 22 | `__tests__/composables/useDebounce.test.ts` | 2 | D |

**合计**: 22 个测试文件，~90 个测试用例

## 六、数据完整性

| # | 位置 | 问题 | 方案 |
|---|------|------|------|
| 1 | Book.total/available | 冗余计数器可能不一致 | 周期性校验 |
| 2 | 删除图书 | 有活跃借阅时外键报错 | 加前置检查 |
| 3 | 还书 status | isOverdue 在事务外计算 | 还书 query 中 MySQL 直接算 |

## 七、种子数据增强（Module B）

| # | 内容 | 说明 |
|---|------|------|
| 1 | 3 种读者类型 | 本科生(5×30) / 研究生(10×60) / 教师(20×180) |
| 2 | 3 种资料类型 | 普通图书 / 新书速递(7天) / 工具书(不外借) |
| 3 | 9 条 CirculationRule | 3×3 矩阵 |
| 4 | SDUST 一期联动 | 馆藏地用山科大真实名称、读者 username=学号格式 |
| 5 | 示例借阅+罚款 | ≥1 条逾期记录 |

## 八、Git 管理

| 项目 | 状态 |
|------|------|
| WSL 开发仓库 | ✅ |
| Windows 交付仓库 | ✅ |
| .gitignore | ✅ |
| 分支规范 | `feature/YYYYMMDD-description` |

---

> P0 = 当前 PLAN 模块内必须完成。P1 = 下个迭代。P2/P3 = 远期。
> 每完成一项从此清单删除。
