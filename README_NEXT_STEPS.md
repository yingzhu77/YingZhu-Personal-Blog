# personal-firefly-blog

这是为 Firefly / Astro 主博客预留的本地项目目录。

当前环境检查结果：

- Git：已安装，`git version 2.53.0.windows.2`
- Node.js：已安装，`v24.12.0`
- pnpm：已通过 Corepack 可用，`11.1.1`
- Firefly 源码：已放入本目录根目录。
- 依赖安装：已完成。
- 项目检查：`corepack pnpm run check` 已通过，0 errors / 0 warnings。
- 项目构建：`corepack pnpm run build` 已通过，已生成 `dist/`。
- Git 状态：当前不是 Git 仓库，因为源码来自 ZIP 解压。

## 当前目录结构

现在 `personal-firefly-blog` 根目录已经包含：

- `package.json`
- `astro.config.mjs`
- `src/`
- `public/`
- `docs/`
- `pnpm-lock.yaml`

这就是正确的 Astro / Firefly 项目结构。

## 本地预览

```powershell
cd personal-firefly-blog
corepack pnpm run dev --host 127.0.0.1
```

打开：

```text
http://localhost:4321
```

## 常用命令

```powershell
corepack pnpm run check
corepack pnpm run build
corepack pnpm run preview
```

## 后续建议

下一步先不要大规模改源码，优先修改 `src/config/` 下的配置文件。

你需要准备：

- 站点名称
- 作者昵称
- 头像图片
- 个人简介
- GitHub / 邮箱 / 社交链接
- 导航栏栏目
- 友链列表
- 音乐或歌单链接
- 相册图片
- 首批 5 篇文章标题
- Agentic 助手项目介绍
- AI 心理健康管理平台项目介绍

## 我可以继续处理

你提供以上素材后，可以继续让我做：

- 检查项目结构是否完整。
- 按计划修改 `src/config/`。
- 新建首批文章和项目展示页。
- 配置音乐、相册、友链、评论入口。
- 执行 `pnpm check`、`pnpm build`、`pnpm preview`。
