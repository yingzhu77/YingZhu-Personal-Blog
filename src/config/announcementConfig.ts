import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content: "今日反思：惜涓滴于将竭，失江海于自流。 （Agent）持续开发中...",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "去看看",
		// 链接 URL
		url: "https://acg.yingzhu.xyz/",
		// 外部链接
		external: true,
	},
};
