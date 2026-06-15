export interface Project {
	name: string;
	description: string;
	url: string;
	website?: string; // 项目官网 URL
	logo?: string; // 项目 logo URL，无 logo 则不显示
	stars?: number;
	language?: string;
	tags: string[];
}

export const projects: Project[] = [
	{
		name: "mINDCare Studio",
		description:
			"基于 Vue3、NestJS、Prisma、Docker 与 Electron 的 AI 心理健康管理平台（v2.6.0）。管理后台 + 用户端双角色，提供 AI 聊天（SSE 流式）、情绪日记与洞察（趋势/分布 ECharts 图表）、知识科普 CRUD + 文章审核修订、通知系统、数据看板、中英繁三语切换、Playwright E2E 测试，以及 Windows 桌面演示应用（NSIS + 便携版打包）。",
		url: "https://github.com/yingzhu77/mINDCare-Studio",
		logo: "/assets/images/projects/mindcare-logo.png",
		language: "TypeScript",
		tags: [
			"Vue3",
			"NestJS",
			"Prisma",
			"Electron",
			"Docker",
			"AI",
			"DeepSeek",
			"E2E",
		],
	},
	{
		name: "PrivAgent",
		description:
			"隐私优先的本地 AI Agent，数据不出本机。基于 Vue 3 + FastAPI + LangGraph + PostgreSQL/pgvector 构建，LangGraph 6 节点状态图驱动自主决策（Recall → Plan → Act → Observe → Decide → Summarize），6 个内置工具（知识库语义检索、联网搜索、深度研究、网页抓取等），MCP 协议扩展（stdio/SSE），Provider Profile 后端隔离存储，Docker 5 容器一键部署，369 个单元测试覆盖全链路。",
		url: "https://github.com/yingzhu77/Privagent",
		language: "Python",
		stars: 1,
		tags: [
			"Vue3",
			"FastAPI",
			"LangGraph",
			"PostgreSQL",
			"pgvector",
			"AI",
			"MCP",
			"Docker",
		],
	},
	{
		name: "YingZhu Personal Blog",
		description:
			"基于 Firefly 主题二次开发的个人博客。新增分享中心（壁纸画廊 Lightbox 预览 + 轮换池、阅读书评卡片、音乐多歌单切换）、音乐系统重构（MusicManager 单例 API、LRC 歌词同步、Meting 多节点容错）、首页三段式打字文案、动态色相系统（OKLCH 跟随壁纸主色）、Waline 评论集成、收藏夹与项目展示页。",
		url: "https://github.com/yingzhu77/YingZhu-Personal-Blog",
		language: "TypeScript",
		tags: ["Astro", "Svelte", "Tailwind CSS", "Waline", "Cloudflare"],
	},
	{
		name: "My Claude Code Skills",
		description:
			"Claude Code Skills 个人集合。当前包含 novel-writer——基于 180 章、114 万字符科幻网文实战经验提炼的 AI 长篇小说写作工作流 skill。四阶段流程（写作→审稿→一致性检查→修订）、结尾轮换表、身体反应备选库、8 种反模式识别，防止 AI 在长篇创作中犯系统性低级错误。",
		url: "https://github.com/yingzhu77/my-skills",
		language: "Markdown",
		tags: ["Claude Code", "Skill", "AI", "写作", "小说"],
	},
	{
		name: "吉他和弦速查",
		description:
			"面向吉他初学者的极简 uni-app 微信小程序。点击指板弦位快速查询单音和常见和弦，支持和弦识别与中文解释、内置 Standard/Drop D/半音降/DADGAD/Open G 五种调弦模式、自定义空弦音本地缓存，纯前端离线可用，无登录无后端。",
		url: "https://github.com/yingzhu77/guitar-chord-finder",
		language: "TypeScript",
		tags: ["uni-app", "Vue3", "Vite", "微信小程序", "Guitar"],
	},
	{
		name: "ACG Pulse",
		description:
			"AI 驱动的游戏/ACG 资讯聚合面板，自动采集多源内容，智能分类定级，实时推送情报。",
		url: "https://github.com/yingzhu77/ACG-Pulse",
		website: "https://acg.yingzhu.xyz/",
		logo: "/assets/images/projects/hot-monitor-logo.webp",
		language: "TypeScript",
		tags: ["AI", "ACG", "资讯聚合", "Docker", "TypeScript"],
	},
	{
		name: "AI Novel to Screenplay",
		description:
			"AI 驱动的小说转剧本工具。智能章节识别（中/英/Markdown）、DeepSeek V4 Flash 转换、SSE 流式逐章进度、角色关系图可视化、原文并排对比、YAML/JSON 双格式导出、S3 云端存储，支持 .txt/.md/.docx 多文件上传。",
		url: "https://github.com/yingzhu77/ai-novel-to-screenplay",
		website: "https://aiscreenplay.yingzhu.xyz/",
		logo: "/assets/images/projects/novel-to-screenplay-logo.webp",
		language: "TypeScript",
		tags: ["Next.js", "React", "Tailwind CSS", "DeepSeek", "AI", "SSE"],
	},
	{
		name: "VoiceCanvas",
		description:
			"语音驱动的 SVG 矢量绘图工具。语音指令经 ASR 转写后分解为结构化绘图计划，再执行为可编辑的 SVG 图元。支持混合解析（本地 + LLM 回退）、上下文感知编辑（\"把刚才那个矩形改成绿色\"）、13 种语义模板、自动布局（流程图/思维导图/时间线）、SVG/PNG 导出、撤销重做。",
		url: "https://github.com/yingzhu77/Voicecanvas",
		website: "https://draw.yingzhu.xyz",
		logo: "/assets/images/projects/voicecanvas-logo.webp",
		language: "TypeScript",
		tags: ["Next.js", "SVG", "Voice", "ASR", "AI", "MiMo"],
	},
];
