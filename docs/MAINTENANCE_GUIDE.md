# 博客维护指南

> 快速查找添加/修改各类内容的位置与步骤。最后更新：2026-05-16

---

## 1. 壁纸图片

### 添加新壁纸

**文件夹**：`src/assets/images/wallpapers/`

**步骤**：
1. 将图片放入上述文件夹（支持 `.avif` `.webp` `.jpg` `.jpeg` `.png`）
2. 如需参与首页横幅轮换，编辑 `src/config/backgroundWallpaper.ts`：
   - **第 44-49 行** `src.desktop[]` — 添加桌面版路径
   - **第 53-58 行** `src.mobile[]` — 添加移动版路径
   - **第 182-188 行** `wallpaperHue.imageHueMap` — 添加色相映射 `"图片名": 色相值`
3. 新图片会自动出现在 `/share/all/` 全部图片页
4. 在 `/share/` 或 `/share/all/` 勾选即可加入随机轮换池

### 设置画师署名

编辑 `src/pages/share/index.astro` **第 44 行**，在 `wallpaperItems` 中给对应壁纸加 `artist: "画师名或链接"`

---

## 2. 阅读分享

### 添加书籍

**配置文件**：`src/config/readingConfig.ts`

每个条目格式：
```ts
{
  title: "书名",
  author: "作者",
  cover: "/assets/reading/cover.jpg",  // public 目录路径
  review: "你的个人评价（支持点击展开查看完整内容）",
  link: "https://..."  // 可选链接
}
```

### 书籍封面

**文件夹**：`public/assets/reading/`

将封面图片放入此文件夹，路径填 `/assets/reading/xxx.jpg`

---

## 3. 音乐分享

### Meting API 模式（当前默认）

**配置文件**：`src/config/musicConfig.ts`

关键配置项：
- **第 14 行** `mode: "meting"` — 使用在线 API
- **第 27-42 行** `meting` — 平台/歌单 ID/备用 API
- `server: "netease"` — 网易云音乐
- `type: "playlist"` — 歌单模式
- `id: "10046455237"` — 歌单 ID

### 本地音乐模式

**配置文件**：`src/config/musicConfig.ts` 第 50-61 行

切换到本地模式：
1. 将 `mode` 改为 `"local"`
2. 音乐文件放入 `public/assets/music/`
3. 封面图片放入 `public/assets/music/cover/`
4. 歌词文件放入 `public/assets/music/lrc/`

**关于本地音乐的说明**：
- 支持格式：MP3 等浏览器原生支持的音频格式
- **无文件大小限制**，但大文件会增加用户加载时间
- 歌词支持两种方式：
  - LRC 文件路径：`lrc: "/assets/music/lrc/song.lrc"`
  - 直接内联字符串：`lrc: "[00:00.00]歌词内容..."`
- 歌词文件需为 LRC 格式（时间标签 + 歌词文本），不会自动从音频提取
- `public/` 目录下的文件不会被 Astro 优化，建议自行压缩 MP3

**示例配置**：
```ts
local: {
  playlist: [
    {
      name: "歌曲名",
      artist: "艺术家",
      url: "/assets/music/song.mp3",
      cover: "/assets/music/cover/song.webp",
      lrc: "/assets/music/lrc/song.lrc",
    },
  ],
}
```

---

## 4. 项目展示

**配置文件**：`src/config/projectsConfig.ts`

每行一个项目，添加新条目即可。首页首个项目占据 Bento Grid 大卡片。

---

## 5. 文章发布

```bash
pnpm new-post -- <文件名>
```

文件创建在 `src/content/posts/`，编辑 frontmatter 后即可发布。

---

## 6. 导航栏

**配置文件**：`src/config/navBarConfig.ts`

当前顺序：主页 / 归档 / 分享 / 项目 / 友链 / 留言 / 我的(相册/番组) / 关于

新增/修改导航项直接编辑此文件。

---

## 7. 站点基本信息

| 配置项 | 文件 | 行号 |
|--------|------|------|
| 站点标题/副标题/描述 | `src/config/siteConfig.ts` | 10-32 |
| 默认色相 | `src/config/siteConfig.ts` | 37 |
| 个人头像/昵称/签名 | `src/config/profileConfig.ts` | 9-16 |
| 社交链接 | `src/config/profileConfig.ts` | 23-36 |
| 页脚版权 | `src/config/footerConfig.ts` | — |
| 公告内容 | `src/config/sidebarConfig.ts` 中的 announcement 组件 | — |

---

## 8. 国际化（i18n）

**文件位置**：
- 键定义：`src/i18n/i18nKey.ts`
- 中文翻译：`src/i18n/languages/zh_CN.ts`
- 英文翻译：`src/i18n/languages/en.ts`
- 日文翻译：`src/i18n/languages/ja.ts`

---

## 9. 关键代码路径速查

| 模块 | 页面路由 | 组件 | 配置 |
|------|----------|------|------|
| 美图分享 | `src/pages/share/index.astro` | `src/components/pages/share/WallpaperGallery.svelte` | `src/config/backgroundWallpaper.ts` |
| 全部图片 | `src/pages/share/all.astro` | `src/components/pages/share/AllImagesGallery.svelte` | — (自动扫描文件夹) |
| 阅读分享 | `src/pages/share/reading.astro` | `src/components/pages/share/ReadingGallery.svelte` | `src/config/readingConfig.ts` |
| 音乐分享 | `src/pages/share/music.astro` | — | `src/config/musicConfig.ts` |
| 项目展示 | `src/pages/projects/index.astro` | — | `src/config/projectsConfig.ts` |
| 首页布局 | — | `src/layouts/MainGridLayout.astro` | — |

---

## 10. 本地开发命令

```bash
pnpm dev          # 启动开发服务器 http://localhost:4321
pnpm build        # 生产构建
pnpm check        # TypeScript 类型检查
pnpm lint         # 代码格式检查
pnpm icons        # 重新生成图标文件
pnpm new-post -- <name>  # 创建新文章
```
