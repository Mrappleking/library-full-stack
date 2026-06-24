# 山科大图书馆 OPAC 数据采集报告

> 采集时间: 2026-06-24 | 方式: CDP + Chrome | 站点通过校园 WebVPN 代理访问
>
> **⚠️ 重要：本报告仅供设计参考，不集成任何外部 API。**
> 所有 API 端点（findsdust.libsp.cn/find/*）和封面服务（cover01.chaoxing.com）
> 为山科大/超星封闭系统，需要授权。本项目完全自建，不依赖外部 OPAC。

## 一、站点信息

| 项目 | 值 |
|------|-----|
| 新门户 URL | https://sklib.sdust.edu.cn/ |
| VPN 入口 | https://webvpn.sdust.edu.cn/ |
| OPAC 检索系统 | https://findsdust.libsp.cn/ (超星智慧图书馆 SuperLib/LibStar) |
| 技术栈 | React SPA + Ant Design + CSS Modules (webpack) |
| 封面服务 | https://cover01.chaoxing.com/cover/permc/s/<hash> |
| 静态资源 | https://static12.libsp.cn/static/ |

## 二、检索系统

### 检索类型及 URL

| 类型 | URL | 说明 |
|------|-----|------|
| 馆藏检索 | `findsdust.libsp.cn/#/searchListExternal/01/<query>/01` | 主力检索 |
| 发现 | zhizhen.com | 超星发现 |
| 外文 | 162.105.139.168/index.php? | CALIS |
| 读秀 | duxiu.com | 超星读秀 |
| 闻道科学导航 | sdust.libsp.net | 学科导航 |

### 检索参数

URL 模式: `#/searchListExternal/<searchType>/<encodedQuery>/<matchType>`

- searchType: 01 = 馆藏检索
- encodedQuery: URL-encoded 搜索词
- matchType: 01 = 任意匹配

搜索框: `<input class="search-inp bder-theme" placeholder="请输入检索词">`
搜索下拉: 全部检索 / 任意匹配
二次检索: 结果中检索

## 三、搜索结果页

### 列表结构 (`.ant-list-item`)

每本书目包含:
- 封面缩略图 (90x120px, 来自 cover01.chaoxing.com)
- 序号 + [资料类型] + 标题 (`.infotit___Rp8Zx`)
- 作者
- 索书号 (纸本书)
- 出版社
- 出版年
- ISBN
- 格式/状态: 电子(n) / 纸本(n) / 可借(n) / 已订购未到馆

详情链接: `#/searchList/bookDetails/<bookId>`

### 聚类/分面 (左侧边栏)

| 分面类别 | 选项示例 (搜"计算机") |
|----------|---------------------|
| 资料类型 | 图书(35833), 期刊(30), 中文非书资料(15) |
| 资源类型 | 纸质资源(29751), 电子资源(5898) |
| 核心收录 | 中国科学引文数据库(1) |
| 校区/地区 | 青岛校区(22373), 泰安东校区(6893), 济南校区(5812) |
| 馆藏地 | 青岛8楼阅览区(9414), 青岛7楼阅览区(7153), 济南自科借阅区(4974) |
| 出版/发行日期 | 日期范围选择器 |
| 教育部学科 | 工学(30737), 经济学(1862), 管理学(1186) |
| 责任者 | 全国计算机(345), 北京兆迪科技(261), 胡仁喜(242) |
| 出版社 | 清华大学出版社(5528), 机械工业出版社(4471), 电子工业出版社(3445) |
| 语种 | 汉语(35749), 英语(127), 日语(2) |
| 国别 | 中国(35762), 美国(115), 日本(1) |

### 分页

- 组件: `<ul class="ant-pagination">`
- 格式: `1 2 3 4 5 ••• 1000`
- 页容量: 10条/页 (可选)
- 快捷跳转: 跳至 页
- 总页数: 1000页 (35833条)

## 四、图书详情页

### 页面结构

```
标题: 【图书】<书名>
标签页: 基本信息 | 元数据(MARC)
评分: 0.0分（0人评分）

基本信息:
  【题名/责任者】   <title> / <author>
  【出版发行项】     <publisher>, <year>
  【载体形态项】     <pages>
  【中图法分类号】   <CLC number>

我的评分: ★★★★★ (需登录)

馆藏信息:
  标签: 馆藏信息详细书目 | 电子馆藏
  电子书链接: 汇雅电子书 (超星电子书)
  
馆藏列表 (需登录):
  序号 | 索书号 | 校区 | 馆藏地 | 可借复本 | 当前请求数
  委托: 需登录后发起
```

### 详情页路由

`#/searchList/bookDetails/<bookId>`

## 五、API 端点 (发现的)

| 端点 | 用途 |
|------|------|
| `findsdust.libsp.cn/find/findConfig/getMenuList` | 获取导航菜单 |
| `findsdust.libsp.cn/find/findConfig/getCustomFindMenu` | 自定义菜单 |
| `findsdust.libsp.cn/find/findConfig/getFindConfig` | 检索配置 |
| `findsdust.libsp.cn/find/findConfig/getDatabasePara` | 数据库参数 |
| `findsdust.libsp.cn/find/webSite/getWebSiteList` | 网站列表 |
| `findsdust.libsp.cn/find/homePage/getGroupCode` | 分组代码 |
| `findsdust.libsp.cn/find/groupResource/dict` | 分组资源字典 |
| `findsdust.libsp.cn/find/eleLog/addEleVisits` | 访问日志 |

## 六、关键设计参考

### 对 Library Full-Stack 项目的启发

1. **搜索策略**: 分面搜索是 OPAC 核心，我们的项目至少需要支持:
   - 资料类型过滤
   - 馆藏地/校区过滤
   - 出版年份范围
   - 主题/分类过滤

2. **图书详情字段对齐**:
   - 我们的 Book 表已有: title, author, isbn, publisher, year
   - 需补充: 索书号(callNumber, 已在 BookItem), 中图法分类号(clcNumber), 载体形态(pages)

3. **馆藏展示**: 
   - OPAC 用表格展示馆藏地+可借数量
   - 我们的 BookItem 表已覆盖: 索书号/馆藏地/校区
   - 需在详情页整合展示

4. **封面服务**: 
   - 超星封面 API 仅供设计参考（需授权，学生项目不可用）
   - 我们使用 OpenLibrary Covers（免费无认证）+ CSS 渐变色占位

## 七、截图文件

| 文件 | 内容 |
|------|------|
| /tmp/opac_library.png | 图书馆首页 (sklib.sdust.edu.cn) |
| /tmp/opac_results.png | 搜索结果页 ("计算机", 35833条) |
| /tmp/opac_book_detail.png | 图书详情页 (电子书) |
