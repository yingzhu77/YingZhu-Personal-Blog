import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content: "这里只有期末周的一具尸体...",

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
