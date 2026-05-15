# 个人博客重构计划

> 基于 Firefly (Fuwari) 主题的二次开发 | Astro 6 + Svelte 5 + Tailwind CSS v4 + OKLCH 色彩系统
> 最后更新: 2026-05-15

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

### 已完成

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

### 待完成: 内容替换 (优先级: 高)

- [ ] **siteConfig.ts** — 替换站点标题/副标题/描述/URL/关键词
- [ ] **profileConfig.ts** — 替换头像/昵称/简介/社交链接
- [ ] **navbar 配置** — Logo、标题、导航菜单
- [ ] **footerConfig.ts** — 页脚版权/链接信息
- [ ] **about page** — 关于页面内容
- [ ] **friends page** — 友链页面
- [ ] **sponsor page** — 赞助页面
- [ ] **guestbook** — 留言板 (需配置评论系统)

### 待完成: 新功能模块 (优先级: 高)

- [ ] **开源项目展示模块**
  - 设计: Bento Grid 卡片布局 (2025 趋势)
  - 功能: 展示 GitHub 项目，含 star 数、语言、简介
  - 实现: 新建 `src/pages/projects/` 路由 + 数据配置
  - 可选: 编译时从 GitHub API 拉取 pin 项目数据
- [ ] **兴趣分享模块**
  - 设计: 标签分类 + 卡片/列表混合布局
  - 内容: 技术栈/书籍/工具/网站推荐
  - 实现: MDX 集合 + 自定义列表页
- [ ] **博客文章模块** (替换 demo 内容)
  - 写个人技术文章
  - 删除 demo 文章 (markdown-style-guide, draft 等)
- [ ] **分享模块** (壁纸预览与切换) `[Phase 3 新增]`
  - 位置: 导航栏"我的"与"留言板"之间，不改变原有排版
  - 功能: 预览所有背景壁纸缩略图，点击放大预览
  - 交互: 选择壁纸切换为当前背景 / 下载壁纸原图
  - 实现: 新建 `src/pages/share/` 路由，读取 backgroundWallpaper 配置中的图片列表
  - 依赖: 现有壁纸系统和色相跟随机制

### 保持的现有功能 (优先级: 低)

- [x] 音乐播放器 (Meting API)
- [x] Bangumi 追番 (编译时获取)
- [x] 相册 (Gallery)
- [x] 友链 (Friends)
- [x] Live2D/Spine 看板娘
- [x] 随机切换壁纸 (替代原有樱花特效位置)
- [x] 评论系统 (Waline/Giscus/Artalk/Twikoo 多选一)
- [x] 搜索 (Pagefind)

---

## 四、配置更新清单

### siteConfig.ts (核心配置)

```
title: "Firefly"          → 改为个人博客名
subtitle: "Demo site"     → 改为个人签名
site_url: "..."           → 改为个人域名
description: "..."        → 改为个人描述
keywords: [...]           → 改为个人关键词
hue: 250                  → 已完成
```

### profileConfig.ts (个人资料)

```
avatar: 替换为个人头像
name: "Firefly"           → 改为个人昵称
bio: "..."                → 改为个人简介
socialLinks: [...]        → 替换为个人社交链接
```

### backgroundWallpaper.ts

```
已完成:
- desktop/mobile 图片数组替换为新壁纸
- wallpaperHue 配置 (followImage, fixedHue, imageHueMap)
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
│   ├── siteConfig.ts         # 站点核心配置 ← 待修改
│   ├── profileConfig.ts      # 个人资料 ← 待修改
│   ├── backgroundWallpaper.ts # 壁纸配置 ← 已完成
│   ├── navBarConfig.ts       # 导航栏配置
│   ├── footerConfig.ts       # 页脚配置 ← 待修改
│   ├── musicConfig.ts        # 音乐播放器
│   ├── galleryConfig.ts      # 相册
│   ├── friendsConfig.ts      # 友链 ← 待修改
│   ├── sponsorConfig.ts      # 赞助
│   ├── commentConfig.ts      # 评论系统
│   └── sidebarConfig.ts      # 侧边栏布局
├── content/          # 文章内容 (MDX)
│   └── posts/               # 博客文章 ← 待替换
├── layouts/          # 布局组件
│   ├── Layout.astro          # 根布局
│   └── MainGridLayout.astro  # 主网格布局 ← 已修改(色相系统)
├── components/       # UI 组件
├── styles/           # 样式
│   ├── variables.styl        # CSS 变量体系 (322行)
│   └── main.css              # Tailwind + 组件样式
├── i18n/             # 国际化
├── utils/            # 工具函数
│   └── setting-utils.ts      # ← 已修改(FollowImageHue)
└── pages/            # 路由页面
```

---

## 七、执行顺序建议

```
Phase 1: 品牌基础 (已完成)
  ├── 壁纸图片替换
  ├── 默认色相设定
  ├── 动态色相系统
  ├── 樱花特效移除 + 随机壁纸按钮
  └── 链接模块删除

Phase 2: 内容替换 (当前)
  ├── siteConfig / profileConfig 个人化
  ├── 页脚 / 友链 / 赞助 内容替换
  ├── 删除 demo 文章，写个人文章
  └── 关于页面

Phase 3: 新模块开发
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
