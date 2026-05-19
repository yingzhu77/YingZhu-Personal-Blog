export interface Project {
	name: string;
	description: string;
	url: string;
	logo?: string; // 项目 logo URL，无 logo 则不显示
	stars?: number;
	language?: string;
	tags: string[];
}

export const projects: Project[] = [
	{
		name: "mINDCare Studio",
		description:
			"基于 Vue3、NestJS、Prisma、Docker 与 Electron 的 AI 心理健康管理平台。支持管理后台和用户端双角色，提供 AI 聊天、情绪日记、知识科普、数据看板，以及 Windows 桌面演示应用。",
		url: "https://github.com/yingzhu77/mINDCare-Studio",
		logo: "/assets/images/projects/mindcare-logo.png",
		language: "TypeScript",
		tags: ["Vue3", "NestJS", "Prisma", "Electron", "Docker", "AI", "DeepSeek"],
	},
	{
		name: "PrivAgent",
		description:
			"隐私优先的本地 AI Agent，数据不出本机。基于 Vue 3 + FastAPI + LangGraph + PostgreSQL/pgvector 构建，支持 LangGraph 6 节点状态图 Agent、7 个内置工具、MCP 协议扩展，350 个单元测试覆盖全链路。",
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
];
