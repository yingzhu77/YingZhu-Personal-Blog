# 个人博客重构计划

> 基于 Firefly (Fuwari) 主题的二次开发 | Astro 6 + Svelte 5 + Tailwind CSS v4 + OKLCH 色彩系统
> 最后更新: 2026-05-16

---

## 一、项目概述

在 Firefly 博客主题基础上搭建个人博客，新增开源项目展示、兴趣分享等模块，替换所有演示内容为个人内容。

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Astro 6 (SSG) |
| 交互组件 | Svelte 5 (runes mode) |
| 样式 | Tailwind CSS v4 + OKLCH 色彩空间 |
| 包管理 | pnpm |
| 页面过渡 | Swup |
| 代码高亮 | Expressive Code |
| 内容 | MDX (Markdown + 组件) |

---

## 二、设计系统 (三步走)

### Step 1: 原始 Token 层 (Primitive Tokens)

基于品牌色定义基础值。

- **主色相**: 250° (蓝紫色) — 已完成
- **色相跟随**: 切换壁纸时色相自动匹配图片主色调 — 已完成
- **字体**: 参见 `src/config/fontConfig.ts`
- **间距**: 基于 4px/8px 增量 (Tailwind 默认)
- **圆角**: `--radius-*` 变量体系 (参见 `src/styles/variables.styl`)

### Step 2: 语义 Token 层 (Semantic Tokens)

将原始值映射为有意义的用途别名。

| Token | 用途 | 当前状态 |
|-------|------|----------|
| `--primary` | 主色调 | OKLCH 色相 250°, 跟随 `--hue` |
| `--page-bg` | 页面背景 | 亮/暗自适应 |
| `--card-bg` | 卡片背景 | 亮/暗自适应 |
| `--btn-regular-bg` | 按钮背景 | 亮/暗自适应 |
| `--btn-content` | 按钮文字 | 亮/暗自适应 |

> 完整变量体系见 `src/styles/variables.styl` (322行)

### Step 3: 组件 Token 层 (Component Tokens)

- 按钮: `--btn-*` 系列
- 卡片: `--card-*` 系列
- 导航栏: 毛玻璃效果 (`--navbar-glass-blur`)
- 标签: 色相跟随主色

---

## 三、模块规划

### 已完成: 品牌基础 (Phase 1)

- [x] **动态色相系统** — 壁纸切换时主色调跟随变化
  - 6 组壁纸 (night-purple, sky-marine, lavender-warm, ocean-deep, blue-mid, cyan-bright)
  - 图片名 → 色相映射: `{night-purple: 262, sky-marine: 240, lavender-warm: 320, ocean-deep: 263, blue-mid: 255, cyan-bright: 232}`
  - 用户可通过控制面板切换"跟随图片 / 固定色相"
  - 涉及文件: `backgroundWallpaper.ts`, `MainGridLayout.astro`, `DisplaySettingsIntegrated.svelte`, `setting-utils.ts`
- [x] **壁纸图片替换** — 6组桌面+移动端 AVIF 壁纸
- [x] **默认色相更新** — siteConfig.ts hue: 165 → 250
- [x] **樱花特效移除** — 删除无法正常展示的樱花特效、sakura-manager、控制面板开关及 i18n
- [x] **随机切换壁纸按钮** — 在控制面板中原樱花特效位置替换为随机切换壁纸按钮
- [x] **链接模块删除** — 删除导航栏"链接"下拉菜单 (GitHub/Gitee/QQ)

### 已完成: 约束合规修复

- [x] **开关组件动画优化** — 5 个 toggle switch 从 `transition-all` + `left` 动画改为 `transition-colors` / `transition-transform` + `translate-x`，符合"动画只能使用 transform 和 opacity 为主"的约束
- [x] **缩进修复** — 修复 DisplaySettingsIntegrated.svelte 中 `isHueFollowSwitchable`、`randomWallpaper()`、`$effect` 块、`handleRangeInput` 共 4 处缩进错误

### 已完成: 内容替换 (Phase 2)

- [x] **siteConfig.ts** — 标题 `yingzhu77`、副标题 `ai-coding, 游戏，音乐与书`、描述、关键词；site_url 暂用占位符 `https://yingzhu77.example.com`（域名未定）
- [x] **profileConfig.ts** — 头像 `assets/images/avatar.jpg`、昵称 `Ying Zhu`、签名 `萤烛 · ai-coding, 游戏，音乐与书`；社交链接保留 GitHub (`yingzhu77`) + RSS，已移除原 Firefly 作者 QQ/Email
- [x] **navbar 配置** — Logo 替换为 `assets/images/logo.webp`，alt `yingzhu77`；导航栏标题 `yingzhu77`
- [x] **footerConfig.ts** — 启用方案 A：`© 2026 Ying Zhu`；备案号注释已预留，后续备案可切换方案 C
- [x] **about page** (`src/content/spec/about.md`) — 作者 `萤烛 (Ying Zhu)`，简介 `AI 时代浮沉的旧人`；保留一行 Firefly + Fuwari 开源鸣谢
- [x] **sponsor page** — 清空赞助方式和赞助者列表，关闭赞助显示
- [x] **友链站点信息** — `friends.mdx` 中本站信息已更新（名称/描述/URL/头像）；友链列表本身暂不动
- [x] **demo 文章删除与替换** — 删除全部 12 篇 demo 文章及附带图片；新增 4 篇 LangGraph 技术文章：
  - `langgraph-core-concepts` — 底层原理：State / Nodes / Edges（**Elysia♪** 风格）
  - `langgraph-graph-grammar` — 图语法深度：StateGraph / 条件边 / Command / Send（**Bronya** 风格）
  - `langgraph-vs-langchain` — LangGraph 与 LangChain 关系与区别（**闭嘴** 风格）
  - `langgraph-hands-on` — 实战入门：含工具调用 + 持久化 + 人在回路（**Silver Wolf** 风格）

### 待完成: 内容替换 (剩余)

- [x] **横幅文字** — `backgroundWallpaper.ts` 中 `homeText.title` 改为 `"人生如梦，一尊还酹江月。"`（2026-05-17），副标题英文小诗暂时保留
- [ ] **友链列表** — `friendsConfig.ts` 中仍为 demo 友链（用户要求暂时不动）
- [ ] **留言板** — `guestbook.md` 内容已通用，但需配置评论系统 (`commentConfig.ts`) 后才能正常使用
- [ ] **域名** — `siteConfig.site_url` 仍为占位符，上线前需替换为真实域名

### 待完成: 新功能模块 (Phase 3)

- [x] **开源项目展示模块** (`/projects/`)
  - 设计: Bento Grid 卡片布局
  - 功能: 展示 GitHub 项目，含语言、简介、技术栈标签
  - 实现: 新建 `src/pages/projects/` 路由 + `src/config/projectsConfig.ts`
  - 首个项目: mINDCare Studio (Vue3 + NestJS AI 心理健康平台)
- [x] **兴趣分享模块** (阅读 + 音乐)
  - 设计: 标签分类 + 卡片/列表混合布局
  - 内容: 技术栈 / 书籍 / 工具 / 网站推荐
  - 实现: MDX 集合 + 自定义列表页
- [x] **分享/美图分享模块** (壁纸预览与切换)
  - 位置: 导航栏"归档"与"友链"之间
  - 功能: 预览所有背景壁纸缩略图，点击放大 / 自选轮换池（最少 1 张）
  - 实现: 新建 `src/pages/share/` 路由 + `src/components/pages/share/WallpaperGallery.svelte`
  - localStorage `wallpaperPool` 持久化，随机切换逻辑已适配
  - 依赖: 现有壁纸系统和色相跟随机制
- [x] **导航栏重构**
  - 新增"分享"、"项目"导航项
  - "关于"合并赞助为单链接（无下拉菜单）
  - `about.md` 新增赞助支持内容
  - 新顺序: 主页 / 归档 / 分享 / 项目 / 友链 / 留言 / 我的 / 关于

### 保持的现有功能 (Phase 4 配置)

- [x] 音乐播放器 (Meting API + 多歌单切换)
  - 4 组歌单/专辑: 崩坏：星穹铁道 / ヨルシカ全收录 / 二人称 / 夏草が邪魔をする
  - CD 唱片圆形卡片 + 播放中旋转动画 (7s)
  - 后台预加载封面（600ms 节流），不影响首屏性能
  - MusicManager 新增 `switchPlaylist()` / `fetchCover()` API
  - 新建 `PlaylistPicker.svelte` 横向滚动选择组件
  - 删除 `/share/music/` 独立音乐页，统一在分享页展示
- [x] Bangumi 追番 (编译时获取)
- [x] 相册 (Gallery)
- [x] 友链页面框架 (Friends)
- [x] Live2D / Spine 看板娘
- [x] 随机切换壁纸
- [ ] 评论系统 (Waline / Giscus / Artalk / Twikoo 多选一，未配置)
- [x] 搜索 (Pagefind — 生产模式正常工作，开发模式展示 mock 结果)
- [x] Favicon/Logo 修复 — `Layout.astro` 路径处理，子页面 favicon 不再 404
- [x] 壁纸池初始加载修复 — `MainGridLayout.astro` `__getPoolIndices` 前置

---

## 四、配置更新清单

### siteConfig.ts (核心配置)

```
title: "Firefly"          → "yingzhu77" ✓
subtitle: "Demo site"     → "ai-coding, 游戏，音乐与书" ✓
site_url: "..."           → 占位符，待域名确定后替换
description: "..."        → 个人描述 ✓
keywords: [...]           → 个人关键词 ✓
hue: 250                  → 已完成 ✓
```

### profileConfig.ts (个人资料)

```
avatar: 旧 GIF            → assets/images/avatar.jpg ✓
name: "Firefly"           → "Ying Zhu" ✓
bio: "..."                → "萤烛 · ai-coding, 游戏，音乐与书" ✓
socialLinks: [...]        → GitHub (yingzhu77) + RSS ✓
```

### backgroundWallpaper.ts

```
已完成:
- desktop/mobile 图片数组替换为新壁纸 ✓
- wallpaperHue 配置 (followImage, fixedHue, imageHueMap) ✓
待完成:
- homeText.title / subtitle 仍为原文（暂时不改）
```

---

## 五、设计趋势应用 (2025)

| 趋势 | 应用场景 | 状态 |
|------|----------|------|
| Bento Grid | 项目展示页、首页卡片 | 计划中 |
| 毛玻璃效果 | 导航栏 (已实现) | 已完成 |
| 暗色模式 | 全局 (已实现) | 已完成 |
| 动态色相 | 壁纸跟随 (已实现) | 已完成 |
| 微交互 | 按钮/卡片 hover 效果 | 部分完成 |
| Ken Burns 动画 | Banner 轮播缩放 | 已完成 |
| 打字机效果 | 首页副标题 | 已完成 |

---

## 六、文件结构参考

```
src/
├── config/           # 所有配置文件
│   ├── siteConfig.ts         # 站点核心配置 ← 已完成
│   ├── profileConfig.ts      # 个人资料 ← 已完成
│   ├── backgroundWallpaper.ts # 壁纸配置 ← 已完成 (横幅文字待改)
│   ├── navBarConfig.ts       # 导航栏配置 ← 已完成
│   ├── footerConfig.ts       # 页脚配置 ← 已完成
│   ├── musicConfig.ts        # 音乐播放器
│   ├── galleryConfig.ts      # 相册
│   ├── friendsConfig.ts      # 友链 ← 友链列表待替换
│   ├── sponsorConfig.ts      # 赞助 ← 已清空
│   ├── commentConfig.ts      # 评论系统 ← 待配置
│   └── sidebarConfig.ts      # 侧边栏布局
├── content/          # 文章内容 (MDX)
│   ├── posts/               # 博客文章 ← 4篇 LangGraph 文章已完成
│   └── spec/                # 特殊页面内容
│       ├── about.md         # 关于页面 ← 已完成
│       ├── friends.mdx      # 友链页面 ← 站点信息已完成，列表待替换
│       └── guestbook.md     # 留言板 ← 内容通用，待配评论系统
├── layouts/          # 布局组件
│   ├── Layout.astro          # 根布局
│   └── MainGridLayout.astro  # 主网格布局 ← 已修改 (色相系统)
├── components/       # UI 组件
│   └── controls/
│       └── DisplaySettingsIntegrated.svelte ← 已修改 (动画修复+缩进修复)
├── styles/           # 样式
│   ├── variables.styl        # CSS 变量体系 (322行)
│   └── main.css              # Tailwind + 组件样式
├── i18n/             # 国际化
├── utils/            # 工具函数
│   └── setting-utils.ts      # ← 已修改 (FollowImageHue)
└── pages/            # 路由页面
```

---

## 七、执行顺序建议

```
Phase 1: 品牌基础 (已完成 ✓)
  ├── 壁纸图片替换
  ├── 默认色相设定
  ├── 动态色相系统
  ├── 樱花特效移除 + 随机壁纸按钮
  └── 链接模块删除

Phase 2: 内容替换 (基本完成，剩余 4 项可后续处理)
  ├── ✅ siteConfig / profileConfig 个人化
  ├── ✅ 页脚 / 赞助 内容替换
  ├── ✅ 删除 demo 文章，写 4 篇 LangGraph 文章
  ├── ✅ 关于页面
  ├── ⬜ 横幅文字 (暂时不改)
  ├── ⬜ 友链列表 (暂时不动)
  ├── ⬜ 留言板评论系统 (待配置)
  └── ⬜ 域名 (待确定)

Phase 3: 新模块开发 (下一步)
  ├── 开源项目展示 (Bento Grid)
  ├── 兴趣分享模块
  └── 分享模块 (壁纸预览/切换/下载)

Phase 4: 润色上线
  ├── 配置评论系统
  ├── 配置统计分析
  ├── SEO / OG 图像
  └── 部署
```

---

## 八、运行命令

```bash
pnpm dev          # 启动开发服务器 (http://localhost:4321)
pnpm build        # 构建生产版本
pnpm preview      # 预览构建版本
pnpm new-post     # 创建新文章
pnpm check        # Astro 类型检查
pnpm lint         # Biome 格式化+lint
```
