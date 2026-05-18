<p align="center">
  <img src="public/assets/images/logo.webp" alt="yingzhu77 logo" width="120" />
</p>

<h1 align="center">yingzhu77 — 个人博客</h1>

<p align="center">
  基于 <a href="https://github.com/CuteLeaf/Firefly">Firefly</a> 主题二次开发
  <br/>
  Firefly 源自 <a href="https://github.com/saicaca/fuwari">Fuwari</a>
</p>

<p align="center">
  <strong>AI 编程 · 游戏 · 音乐 · 阅读</strong>
</p>

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Astro 6 (SSG) |
| 交互组件 | Svelte 5 (runes mode) |
| 样式 | Tailwind CSS v4 + OKLCH 色彩空间 |
| 页面过渡 | Swup |
| 代码高亮 | Expressive Code |
| 内容 | MDX |
| 搜索 | Pagefind |
| 包管理 | pnpm |

---

## 基于 Firefly 的二次开发

本项目在 Firefly 博客主题基础上进行了以下定制：

### 新增模块

**美图分享 (`/share/`)**
- 壁纸画廊展示，可自选哪些壁纸参与随机轮换池（localStorage 持久化）
- 阅读分享卡片：3:4 封面 + hover 浮层评价预览 + 详情弹窗
- 音乐多歌单切换：CD 唱片圆形卡片 + 播放中旋转动画
- 横向滚动歌单选择器，后台预加载封面

**项目展示 (`/projects/`)**
- Bento Grid 布局，首个项目占据大卡片
- 展示 GitHub 项目信息：语言、技术栈标签、Star 数

**收藏夹 (`/bookmarks/`)**
- 替代原番组计划模块，位于"我的"下拉菜单
- 按工具 / 教程 / 开源项目分类罗列链接

**首页三段式打字文案**
- 逐段打字 → 完整展示 → 删除 → 下一段，循环播放
- 首行偏左 / 次行偏右不对称排版
- 可通过 `backgroundWallpaper.ts` → `homeText.sections[]` 自由增减段落

### 功能增强

- **动态色相系统**：切换壁纸时主色调跟随图片主色变化，OKLCH 色彩空间
- **壁纸轮换池**：用户在分享页勾选壁纸卡片控制随机切换范围
- **壁纸轮播**：Ken Burns 缩放 + 淡入淡出过渡
- **Live2D / Spine 看板娘**：保留原 Firefly 功能

### 内容替换

- 移除全部 demo 文章，替换为 LangGraph 系列技术文章
- 个人化全部站点配置（标题、头像、签名、友链、关于等）
- 删除链接模块、樱花特效等不需要的功能

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm check

# 构建生产版本
pnpm build

# 代码格式化
pnpm lint
```

---

## 配置指南

所有站点配置集中在 `src/config/` 目录下：

| 文件 | 用途 |
|------|------|
| `siteConfig.ts` | 站点标题、描述、域名、导航栏、页面开关 |
| `profileConfig.ts` | 头像、昵称、签名、社交链接 |
| `backgroundWallpaper.ts` | 壁纸图片、首页文案、色相、轮播 |
| `navBarConfig.ts` | 导航栏链接与顺序 |
| `musicConfig.ts` | 音乐播放器 · 网易云歌单 |
| `readingConfig.ts` | 阅读分享 · 书评数据 |
| `projectsConfig.ts` | 项目展示 · Bento Grid 卡片 |
| `bookmarksConfig.ts` | 收藏夹 · 工具/教程/开源项目链接 |
| `galleryConfig.ts` | 相册 · 相册列表与元数据 |
| `friendsConfig.ts` | 友链 · 友情链接列表 |
| `announcementConfig.ts` | 公告栏内容 |
| `commentConfig.ts` | 评论系统配置 |

详细维护说明见 [`docs/MAINTENANCE_GUIDE.md`](./docs/MAINTENANCE_GUIDE.md)。

---

## 项目结构

```
src/
├── config/              # 所有配置文件
├── content/
│   ├── posts/           # 博客文章 (MDX)
│   └── spec/            # 特殊页面内容 (关于、友链、留言板)
├── layouts/             # 布局组件 (MainGridLayout, Layout)
├── components/
│   ├── common/          # 通用组件
│   ├── controls/        # 控制面板组件
│   ├── features/        # 功能组件 (音乐、Live2D、打字机)
│   ├── layout/          # 布局子组件 (导航、侧栏、页脚)
│   ├── pages/           # 页面组件 (收藏夹、项目、分享等)
│   └── widget/          # 侧栏小部件
├── pages/               # 路由页面
├── styles/              # 样式 (Tailwind + Stylus 变量)
├── i18n/                # 国际化 (中/英/日/俄/繁中)
├── utils/               # 工具函数
└── types/               # TypeScript 类型定义
```

---

## 相册模块重构建议

当前相册基于 CSS `column-count` 瀑布流，存在以下可改进点：

### 1. 图片加载优化
**现状**：所有照片在构建时通过 `fs.readdirSync` 扫描并全量渲染。  
**建议**：
- 使用 `client:visible` 懒加载 PhotoCard，折叠下方不阻塞首屏
- 引入 Astro Image 优化相册封面和首屏图片
- 对 `public/gallery/` 中原始图片做 AVIF/WebP 二次压缩

### 2. 瀑布流排序
**现状**：CSS `column-count` 排序为纵向优先（1→4→7 / 2→5→8 / 3→6→9）。  
**建议**：
- 改用 CSS Grid + `grid-row: auto / span N` 实现横向优先瀑布流
- 或使用轻量 Masonry 库（如 `masonry-layout`），保持横向阅读顺序

### 3. 图片预览
**现状**：相册内图片无点击放大/灯箱功能。  
**建议**：
- 复用项目中已有的 `@fancyapps/ui` (Fancybox) 实现灯箱
- 或在 `PhotoCard` 中添加点击事件，用现有 ImageWrapper 放大

### 4. 增量更新
**现状**：添加照片需要重新构建整个相册页。  
**建议**：
- 将相册数据改为内容集合（`src/content/gallery/`），支持增量构建
- 或在 `galleryConfig` 中标记相册 `partial: true`，只构建变更的相册

### 5. 移动端体验
**现状**：双列瀑布流在窄屏上照片过小。  
**建议**：
- 移动端自动切换为单列或大图滑动模式
- 增加触控友好的左右滑动浏览

---

## 致谢

- [Firefly](https://github.com/CuteLeaf/Firefly) — Astro 博客主题，提供完整的设计系统与功能框架
- [Fuwari](https://github.com/saicaca/fuwari) — Firefly 的上游主题
- 所有依赖的开源项目及其维护者

---

## License

[GPL-3.0](./LICENSE) © 2026 Ying Zhu
