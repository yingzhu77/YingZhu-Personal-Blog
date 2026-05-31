export interface Bookmark {
	title: string;
	url: string;
	description: string;
	category: "工具" | "教程" | "开源项目";
}

export const bookmarks: Bookmark[] = [
	{
		title: "mirrorchyan",
		url: "https://mirrorchyan.com/zh/projects?source=maaplus-download",
		description: "神秘二游护肝项目工具导航页，整合 MAA 等自动化工具资源。",
		category: "工具",
	},
	{
		title: "B站 UP: 免费分享 GTP 谱",
		url: "https://space.bilibili.com/108592513",
		description: "免费分享 Guitar Pro 谱子，多 ACG 曲目。",
		category: "工具",
	},
	{
		title: "B站 UP: 官方 GTP 谱分享",
		url: "https://space.bilibili.com/1118971428",
		description: "分享官方 Guitar Pro 谱子，多夜鹿曲目。",
		category: "工具",
	},
	{
		title: "Claude Code 教程",
		url: "https://claudecode.tangshuang.net/",
		description: "讲解 Claude Code 使用比较清晰的教程站。",
		category: "教程",
	},
	{
		title: "guitarChord",
		url: "https://github.com/youngdro/guitarChord",
		description: "吉他指板算法——和弦指法计算与可视化开源项目。",
		category: "开源项目",
	},
	{
		title: "MSST WebUI",
		url: "https://doc.msst.fun/",
		description: "AI 分离人声/伴奏/乐器轨，不求人，亲测好用。",
		category: "工具",
	},
	{
		title: "ECC (Everything Claude Code)",
		url: "https://github.com/affaan-m/ECC",
		description:
			"Claude Code 等 AI 编程工具的增强系统，提供 249 个技能、63 个子代理、记忆持久化与安全扫描。",
		category: "开源项目",
	},
];
