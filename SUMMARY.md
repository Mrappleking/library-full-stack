# 今日工作总结 — 2026-06-24

## 完成事项

### 1. 联网修复
- SearXNG 搜索超时→3秒：禁用 sogou（每15秒超时拖慢全局），超时 8→15s
- 图片搜索恢复：80引擎中14个图片引擎可用
- web_search 工具恢复正常使用
- 山科大图书馆外景图片采集：7张照片下载到 `resources/sdust-library/`

### 2. 项目深度升级（v0.2.0 → v0.3.0）
- Prisma schema：10表（新增 BookItem/PatronCategory/ItemType/CirculationRule/Fine）
- 规则引擎：`getRule()` + `checkBorrowLimit()` 替代硬编码30天
- 罚款系统：自动计算逾期费 + Fine 表 + totalFines
- 复本追踪：BookItem（条码/索书号/馆藏地/品相），借书自动选复本
- 后端：新增 fines/rules 路由，borrows.ts 重构
- 前端：154→16页（新增 Settings/Fines 管理页，4页增强）

### 3. Git 管理
- WSL 仓库：`~/workplace/library-full-stack/`，4次提交
- Windows 仓库：`D:\workplace\Library Full-Stack Project\`，1次提交
- .gitignore 配置完成

### 4. 文档体系
| 文件 | 行数 | 内容 |
|------|------|------|
| README.md | 708 | 18章：架构+API+前端+迭代蓝图+SDUST联动 |
| AGENTS.md | 185 | 14条架构决策 + 完整路由表 + 核心服务 |
| TODO.md | 115 | 7类共45条未完成事项 |
| resources/sdust-library/README.md | — | 图片资源说明 |

### 5. 迭代蓝图（README.md 第十四-十八章）
- v0.4.0：图书详情页 + 流通台（零新表）
- v0.4.1：预约系统（Hold表 + 6 API）
- v0.4.2-3：通知系统（站内+邮件）
- v0.5.0：报表中心（ECharts）
- v0.6+：MARC编目/采访/支付/ES/期刊
- SDUST 联动三期方案

## 未完成（下次继续）

1. 校园网代理配置（WSL需走Windows VPN才能访问lib.sdust.edu.cn）
2. v0.4.0 代码实现（图书详情页+流通台）
3. 图片采集补充（图书馆内部/阅览室/OPAC界面截图）
