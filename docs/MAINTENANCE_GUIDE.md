# 博客维护指南

> 快速查找添加/修改各类内容的位置与步骤。最后更新：2026-06-23  
> 项目变更记录统一维护在 [BLOG_REBUILD_PLAN.md](./BLOG_REBUILD_PLAN.md)，本指南不再重复记录历史变更。

---

## 1. 壁纸图片

### 当前壁纸（6 组）

| 文件名 | 色相 | 格式 |
|--------|------|------|
| night-purple | 262° | AVIF |
| fu-warm | 38° | JPEG |
| lavender-warm | 320° | AVIF |
| star-warm | 42° | JPEG |
| bea-purple | 280° | JPEG |
| cyan-bright | 232° | AVIF |

> 原始照片源文件已从 `docs/images/` 移除，壁纸唯一存放位置为 `src/assets/images/wallpapers/`。

### 添加新壁纸

1. 将图片放入 `src/assets/images/wallpapers/`（支持 `.avif` `.webp` `.jpg` `.jpeg` `.png`）
2. 编辑 `src/config/backgroundWallpaper.ts`：
   - `src.desktop[]` — 桌面版路径
   - `src.mobile[]` — 移动版路径
   - `wallpaperHue.imageHueMap` — 色相映射 `"图片名": 色相值`
3. 运行 `pnpm icons` 重新生成图标（如新增图标引用）
4. 新图片会自动出现在 `/share/all/` 全部图片页
5. 在 `/share/` 勾选壁纸卡片即可加入随机轮换池

### 轮换池机制

- 用户可在分享页通过开关选择壁纸加入/移出轮换池
- 最多 6 张，存入 `localStorage.wallpaperPool`
- 初始页面加载时优先从池中随机选取（`__getPoolIndices` 函数）
- 切换后立即生效，移除当前壁纸会自动切换到池中另一张

---

## 2. 文章内容

### 创建新文章

```bash
pnpm new-post -- <文件名>
```

文件创建在 `src/content/posts/`，编辑 frontmatter 后即可发布。

### Frontmatter 字段

```yaml
title: 文章标题
published: 2026-05-17
pinned: true        # true=置顶（只能有一篇置顶）
description: 摘要描述
tags: [标签1, 标签2]
category: 分类名称
```

### AI 内容提示

前 4 篇 LangGraph 文章正文首行有 `> **（以下内容由AI拉取最新文档生成，注意甄别）**` 提示，仅在文章详情页可见，不影响列表预览。

### 当前置顶

`src/content/posts/intro.md` — 引言（网站由来与定位）

### 图片引用

文章内图片使用相对路径引用 `src/assets/images/` 下的文件：

```markdown
![](../../assets/images/wallpapers/example.png)
```

---

## 3. 侧边栏系统

**配置文件**：`src/config/sidebarConfig.ts`

### 布局模式

| 模式 | 说明 |
|------|------|
| `left` | 仅显示左侧边栏 |
| `right` | 仅显示右侧边栏 |
| `both` | 双侧边栏，1280px+ 同时显示，769-1279px 根据 `tabletSidebar` 配置显示其中一侧 |

### 当前配置

**左侧边栏**：
- Profile（顶部）— 用户资料，带关闭按钮
- Announcement（顶部）— 公告
- Music（sticky）— 音乐播放器
- CategoryTag（sticky）— 分类+标签合并组件，Tab 切换

**右侧边栏**：
- Stats（顶部）— 站点统计
- Calendar（sticky）— 日历组件
- SidebarTOC（sticky）— 文章目录（仅文章页显示）

**移动端底部**：
- Profile — 用户资料
- CategoryTag — 分类+标签

### CategoryTag 组件

将分类（Categories）和标签（Tags）合并为一个组件，使用 Tab 切换：

- 默认显示「类别」Tab，点击切换到「标签」
- 半透明玻璃效果 Tab 栏，随背景色相变化
- 折叠阈值：当分类数量超过 6 个时自动折叠
- 配置：`responsive.collapseThreshold`

### 响应式行为

- **< 768px**：隐藏侧边栏，显示 Mobile Bottom 组件
- **769-1279px**：根据 `tabletSidebar` 配置显示一侧边栏
  - 文章页优先显示右侧栏（TOC）
- **≥ 1280px**：显示双侧边栏

### Profile 关闭按钮

- 位置：右下角
- 行为：会话级别，刷新页面后重新显示
- 实现：直接隐藏 DOM，不使用 localStorage

---

## 4. 阅读分享

**配置文件**：`src/config/readingConfig.ts`

每本书一个条目：
```ts
{
  title: "书名",
  author: "作者",
  cover: "",           // 图片 URL 或 public 路径
  review: "你的评价",   // 光标悬停预览，点击弹窗完整阅读
  link: "https://..."  // 可选了解更多链接
}
```

**组件**：`src/components/pages/share/ReadingGallery.svelte`
- 3:4 封面卡片 + hover 底部黑色半透明浮层显示评价片段
- 点击弹出详情弹窗

---

## 4. 音乐分享

### 多歌单切换（当前模式）

**配置文件**：`src/config/musicConfig.ts` → `playlists[]`

每个歌单条目：
```ts
{
  id: "unique-id",           // 唯一标识，用于 DOM/事件
  name: "歌单名称",
  description: "短文案",      // hover 浮层展示
  cover: "",                 // 留空，自动从 API 获取首个 track 封面
  server: "netease",
  type: "playlist",          // playlist | album | song
  id_meting: "网易云ID",
  default: true,             // true = 初始默认播放
}
```

**当前歌单**（6 组）：

| ID | 名称 | 类型 | 网易云 ID | 默认 |
|----|------|------|-----------|------|
| yorushika-natsukusa | 夏草が邪魔をする | album | 35670522 | ✓ |
| starrail-songs | 崩坏：星穹铁道 | playlist | 10046455237 | |
| yorushika-collection | ヨルシカ · 全专辑收录 | playlist | 8780955963 | |
| yorushika-gento | 二人称 | album | 364564348 | |
| avemujica | Completeness | album | 269138556 | |
| togeari | 棘ナシ | album | 246241907 | |

**添加新歌单**：在网易云音乐找到歌单/专辑页，URL 中 `id=` 后的数字即为 `id_meting`。

### 封面自动加载

- 默认歌单：初始加载时自动获取封面
- 非默认歌单：页面空闲后后台逐张预加载（600ms 节流），滚动可见时封面已就绪
- 封面优先使用 API 首个 track 的 `pic`（带 auth，不被 ORB 拦截）

### CD 唱片视觉

**组件**：`src/components/pages/share/PlaylistPicker.svelte`
- 圆形唱片卡片，封面铺满外圈
- 半透明沟槽纹理叠加 + 中心圆孔（spindle）
- 播放中自动旋转（7s / 360°），`prefers-reduced-motion` 停止
- 活跃卡片 `--primary` 三圈光环
- hover 显示 EQ 跳动 + 描述浮层

### 技术架构

| 组件 | 文件 | 职责 |
|------|------|------|
| MusicManager | `src/components/features/MusicManager.astro` | 单例：fetch / switchPlaylist / fetchCover / 事件广播 |
| MusicPlayer | `src/components/features/MusicPlayer.astro` | 播放器 UI：进度/音量/歌词/播放列表抽屉 |
| PlaylistPicker | `src/components/pages/share/PlaylistPicker.svelte` | 歌单选择卡片（`client:idle`） |

**事件流**：`fm:playlist-switching` → fetch → `fm:playlist-switched` → MusicPlayer 更新抽屉

### 本地音乐模式

`mode: "local"` 时使用 `local.playlist[]`，音频文件放入 `public/assets/music/`。详见配置注释。

---

## 5. 项目展示

**配置文件**：`src/config/projectsConfig.ts`

每行一个项目，首页首个占据 Bento Grid 大卡片。

### 配置字段

```ts
{
  name: "项目名称",
  description: "项目描述",
  url: "https://github.com/...",
  logo: "/assets/images/projects/xxx.png",  // 可选，无 logo 则不显示
  language: "TypeScript",                    // 可选
  stars: 1,                                  // 可选
  tags: ["Vue3", "FastAPI", "Docker"],       // 必填
}
```

### 项目 Logo

- Logo 文件存放在 `public/assets/images/projects/` 目录
- 推荐尺寸：120x120px 或更大，正方形
- 支持格式：PNG、WebP、SVG
- 无 logo 的项目可省略 `logo` 字段，卡片将不显示 logo 区域

### 添加新项目

1. 将项目 logo 放入 `public/assets/images/projects/`（可选）
2. 在 `projectsConfig.ts` 的 `projects` 数组中添加条目
3. 按需调整 `tags` 数组的技术栈标签

---

## 6. 收藏夹

**配置文件**：`src/config/bookmarksConfig.ts`

每行一个链接，按 category 分组（工具 / 教程 / 开源项目）：

```ts
{
  title: "链接名称",
  url: "https://...",
  description: "简短描述",
  category: "工具",   // "工具" | "教程" | "开源项目"
}
```

**当前收藏夹**（7 项）：mirrorchyan、B站 GTP 谱分享 ×2、Claude Code 教程、guitarChord、MSST WebUI、ECC

**页面**：`src/pages/bookmarks/index.astro` — 卡片列表，按分类分组展示。

---

## 7. 相册

**配置文件**：`src/config/galleryConfig.ts`

相册图片存放在 `public/gallery/<相册ID>/` 目录下，支持 jpg/png/webp/avif/gif 格式。

### 配置字段

```ts
{
  id: "album-id",           // 唯一标识，对应 public/gallery/ 下的子目录名
  name: "相册名称",
  description: "相册描述",
  date: "2026-05-20",       // YYYY-MM-DD，用于排序和显示
  tags: ["日常"],           // 标签，用于页面筛选
  cover: "",                // 可选，不填则自动使用 cover.* 或第一张图片
  location: "",             // 可选，拍摄地点
  password: "",             // 可选，访问密码
  passwordHint: "",         // 可选，密码提示
}
```

### 当前相册（1 个）

| ID | 名称 | 日期 | 标签 | 图片数 |
|----|------|------|------|--------|
| ren-sheng-de-xian | 人生得闲 | 2026-05-20 | 日常 | 1 |

### 添加新相册

1. 在 `public/gallery/` 下创建以 `id` 命名的子目录，放入图片
2. 在 `galleryConfig.ts` 的 `albums` 数组中添加配置条目
3. 可选：放入 `cover.*` 文件作为封面图，否则自动使用第一张

### 页面

- **相册列表**：`/gallery/` — 三列网格卡片，支持标签筛选
- **相册详情**：`/gallery/<id>/` — 瀑布流展示照片（移动端 2 列，640px+ 自动列宽），支持 Lightbox 预览
- **全部壁纸**：`/share/all/` — 自动扫描 `src/assets/images/wallpapers/` 目录，三列瀑布流布局

### 图片路径说明

| 用途 | 存放位置 | 说明 |
|------|----------|------|
| 相册照片 | `public/gallery/<id>/` | 静态资源，不经 Astro 优化 |
| 壁纸轮换 | `src/assets/images/wallpapers/` | 经 Astro 优化，出现在 `/share/` 和 `/share/all/` |
| 文章图片 | `public/assets/images/posts/` | 文章内引用的图片 |
| 项目 Logo | `public/assets/images/projects/` | 项目展示页 Logo |

---

## 8. 导航栏

**配置文件**：`src/config/navBarConfig.ts`

当前顺序：主页 / 归档 / 分享 / 项目 / 友链 / 留言 / 我的 / 关于

"我的"下拉：相册 / 收藏夹

---

## 9. 站点基本信息

| 配置项 | 文件 |
|--------|------|
| 标题/副标题/描述/关键词 | `src/config/siteConfig.ts` |
| 导航栏 Logo | `src/config/siteConfig.ts` → `navbar.logo` |
| Favicon | `src/config/siteConfig.ts` → `favicon[]`，文件在 `public/assets/images/logo.webp` |
| 默认色相 250° | `src/config/siteConfig.ts` |
| 首页横幅文字 | `src/config/backgroundWallpaper.ts` → `common.homeText.sections[]`（三段式逐段打字循环） |
| 首页文案 sections | 每段 `{ title, subtitle }`，支持数组随机选取，打字速度在 `typewriter` 中配置 |
| 个人头像/昵称/签名 | `src/config/profileConfig.ts` |
| 社交链接 | `src/config/profileConfig.ts` |
| 页脚版权 | `src/config/footerConfig.ts` |
| 公告 | `src/config/announcementConfig.ts`（当前："(Agent)正在开发中...... Token用完，我就会死。"） |

---

## 10. 关键代码路径速查

| 模块 | 页面 | 组件 | 配置 |
|------|------|------|------|
| 分享主页 | `src/pages/share/index.astro` | WallpaperGallery / ReadingGallery / PlaylistPicker | backgroundWallpaper / readingConfig / musicConfig |
| 全部壁纸 | `src/pages/share/all.astro` | AllImagesGallery（三列瀑布流） | —（自动扫描 `src/assets/images/wallpapers/`） |
| 阅读详情 | `src/pages/share/reading.astro` | ReadingGallery | readingConfig |
| 项目展示 | `src/pages/projects/index.astro` | — | projectsConfig |
| 收藏夹 | `src/pages/bookmarks/index.astro` | — | bookmarksConfig |
| 相册列表 | `src/pages/gallery/index.astro` | AlbumCard（三列网格 + 标签筛选） | galleryConfig |
| 相册详情 | `src/pages/gallery/[album].astro` | 瀑布流 + Lightbox | —（扫描 `public/gallery/<id>/`） |
| 首页布局 | `src/layouts/MainGridLayout.astro` | Navbar / Footer / SideBar / Live2D | 全部 config |
| 根布局 | `src/layouts/Layout.astro` | — | favicon / SEO |

> `src/pages/share/music.astro` 已删除，音乐功能统一在 `/share/` 页展示。

---

## 11. 本地开发

```bash
pnpm dev          # 开发服务器 http://localhost:4321
pnpm build        # 生产构建（含 Pagefind 索引）
pnpm check        # TypeScript 类型检查
pnpm lint         # Biome 格式化 + lint
pnpm icons        # 重新生成图标常量文件
pnpm new-post     # 创建新文章
```

### 部署

**域名**：[yingzhu.xyz](https://yingzhu.xyz/)

**平台**：Cloudflare Workers（通过 `wrangler.toml` 配置 `[assets]` 静态部署）

**推送即部署**：`git push` 到 `master` 分支后 Cloudflare 自动构建。

**构建命令**：`pnpm build`（标准 Astro SSG + Pagefind 搜索索引）

### 搜索测试

- **开发模式**：显示 mock 结果（Pagefind 需要构建产物）
- **生产模式**：`pnpm build` 后 Pagefind 自动索引，`/search/?q=关键词` 可检索

---

## 12. 设计约束速查

- 色相系统：`--hue` CSS 变量 → OKLCH 全局主题色
- 壁纸色相跟随：`backgroundWallpaper.wallpaperHue.followImage`
- 动画限制：仅 `transform` / `opacity`，尊重 `prefers-reduced-motion`
- 客户端指令：`client:idle`（低优先级）/ `client:visible`（折叠下方）/ `client:load`（首屏必需）
- 正文约束：≥16px，行高 1.5-1.75，桌面行宽 60-75 字符
- 所有交互控件 ≥44×44px，hover/focus-visible/active/disabled 四态

---

## 13. 已知问题

- 本地开发时主页图标偶尔不显示（远程正常，疑似缓存问题）
- 5.30.1.md 文件为待发布文章占位
