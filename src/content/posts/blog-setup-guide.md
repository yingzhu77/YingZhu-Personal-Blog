---
title: "个人博客搭建指南：从零到上线的完整路线"
published: 2026-05-19
description: "记录使用 Firefly 主题搭建个人博客的完整流程，包括域名注册、主题部署、评论系统配置等。"
tags: [博客搭建, Firefly, Waline, 教程]
category: 技术分享
---

## 前言

本文记录了我搭建个人博客的完整过程，从域名注册到最终上线的所有参考资源和步骤。希望能为想要搭建自己博客的朋友提供参考。

## 一、域名注册

### 参考视频

- [B站视频教程](https://www.bilibili.com/video/BV1BEdCBsEEw?spm_id_from=333.788.videopod.sections&vd_source=88b801da333ec3891f69184c7df39ab4) - 域名注册流程详解

### 域名购买平台

- [Spaceship](https://www.spaceship.com/zh/) - 域名购买网站，价格实惠，支持支付宝

## 二、博客主题选择

### 主要参考

- [B站视频教程](https://www.bilibili.com/video/BV1hX9XBKEhm?spm_id_from=333.788.videopod.sections&vd_source=88b801da333ec3891f69184c7df39ab4) - Firefly 主题部署教程（第一次刷到的视频）

### 主题资源

- [Firefly 官方文档](https://docs-firefly.cuteleaf.cn/zh/) - 原项目详细文档
- [Firefly GitHub 仓库](https://github.com/CuteLeaf/Firefly) - 原项目链接

## 三、评论系统配置

### Waline 评论系统

- [Waline 官方文档](https://waline.js.org/) - 详细配置教程
- [B站视频教程](https://www.bilibili.com/video/BV1J2XuBtEGn/?spm_id_from=888.80997.embed_other.whitelist&bvid=BV1J2XuBtEGn&vd_source=88b801da333ec3891f69184c7df39ab4) - Waline 视频教程

### 配置要点

1. **部署后端**：在 Vercel 或其他平台部署 Waline 后端服务
2. **绑定域名**：建议使用子域名（如 `comment.yourdomain.com`）
3. **配置前端**：在博客配置文件中填入 Waline 服务地址
4. **登录模式**：可选匿名评论、强制登录或禁用登录

### Waline 数据库与 OAuth 登录配置

Waline 需要数据库存储评论，推荐使用 [Neon](https://neon.tech)（免费 PostgreSQL）：

1. **创建数据库**：Vercel 项目 → **Storage** → **Create Database** → 选择 **Neon**
2. **导入表结构**：在 Neon SQL Editor 执行 [waline.pgsql](https://github.com/walinejs/waline/blob/main/assets/waline.pgsql) 建表
3. **配置环境变量**（Vercel → Settings → Environment Variables）：
   - 数据库由 Vercel 自动注入，无需手动填 `PG_*`
   - `JWT_TOKEN`：随机字符串，用于管理员登录
   - `SITE_URL`：`https://你的域名`
   - `SECURE_DOMAINS`：`你的域名,vercel.app`
4. **部署 Auth 项目**：从 [walinejs/auth](https://github.com/walinejs/auth) 点击 Deploy with Vercel
5. **配置 OAuth 登录**（强制登录必配）：
   - 在 [GitHub OAuth Apps](https://github.com/settings/developers) 创建应用
   - **Homepage URL**：Auth 项目域名
   - **Authorization callback URL**：`https://xxx.vercel.app/github?redirect=&state=`
   - Auth 项目环境变量：`GITHUB_ID`、`GITHUB_SECRET`
   - 主项目环境变量：`OAUTH_URL = https://xxx.vercel.app`
6. **Redeploy**：两个项目分别重新部署后生效

## 四、部署上线

本博客使用 Cloudflare Workers 进行静态部署，推送代码到 GitHub 后自动构建部署。

## 五、总结

搭建个人博客的核心步骤：

1. 注册域名
2. 选择博客主题（推荐 Firefly）
3. 配置评论系统（推荐 Waline）
4. 部署上线

希望这篇指南对你有所帮助！如有问题，欢迎在评论区留言。

---

*本文由 AI 辅助生成，仅供参考。*
