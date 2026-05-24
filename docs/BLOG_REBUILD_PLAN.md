# 项目变更日志

> 基于 [Firefly](https://github.com/CuteLeaf/Firefly) (源自 [Fuwari](https://github.com/saicaca/fuwari)) 的二次开发记录  
> 详细维护指南：[MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md)

## 2026-05-22 最新

- 新增博文：「小满，对于永恒的一些思考」+「AI Coding 总结的部分经验与复盘」
- 相册功能：新增「人生得闲」相册（`public/gallery/ren-sheng-de-xian/`），支持标签筛选 + 三列网格布局
- 音乐歌单：新增 avemujica（Completeness）+ togeari（棘ナシ），共 6 组歌单，默认切换为夏草が邪魔をする
- 项目展示：新增「吉他和弦速查」小程序项目，mINDCare 添加 Logo，共 4 个项目
- 收藏夹：新增 MSST WebUI（AI 人声分离工具），共 6 项
- 全部壁纸页（`/share/all/`）：三列瀑布流布局
- 公告更新：`(Agent)正在开发中...... Token用完，我就会死。`

## 2026-05-19

- 域名绑定：**[yingzhu.xyz](https://yingzhu.xyz/)**
- Cloudflare Workers 部署：`wrangler.toml` + `[assets]` 静态资源
- 公告更新：`(Agent)正在开发中......`
- README 重写：项目介绍 + 二次开发模块 + 配置指南
- 清理 `BLOG_REBUILD_PLAN.md` 为变更日志，删除 `README_NEXT_STEPS.md`

## 2026-05-10 ~ 2026-05-18 已完成

### 品牌与配置
- 色相系统 250° + 壁纸跟随动态色相
- 6 组自定义壁纸 (AVIF/JPEG)
- 全站个人信息替换（标题/头像/签名/社交/友链/关于/赞助）
- Logo + Favicon 修复

### 内容
- 删除 12 篇 demo 文章
- 新增 5 篇 LangGraph 技术文章（含 AI 生成提示）
- 新增引言文章 (intro.md)
- 阅读分享：6 本书评

### 新模块
- **分享页** (`/share/`)：壁纸画廊 + 阅读卡片 + 音乐多歌单切换
- **项目展示** (`/projects/`)：Bento Grid 布局
- **收藏夹** (`/bookmarks/`)：替代原番组计划
- **首页三段式打字文案**：逐段循环 + 不对称排版

### 删除的模块
- 番组计划 (Bangumi) 完整移除
- 樱花特效、链接模块
- 分享页独立音乐路由 (`/share/music/`)

### 技术改进
- 壁纸轮换池 (localStorage)
- Banner 轮播 Ken Burns 动画
- 音乐多歌单切换 + CD 唱片视觉
- Biome lint/format 合规
