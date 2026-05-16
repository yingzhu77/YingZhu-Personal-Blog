export interface Project {
	name: string;
	description: string;
	url: string;
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
		language: "TypeScript",
		tags: ["Vue3", "NestJS", "Prisma", "Electron", "Docker", "AI", "DeepSeek"],
	},
];
