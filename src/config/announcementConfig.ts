import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content:
		"这时他领悟到那种缺憾的感觉从何而来。这是一种作为世间万物基础的烦愁，每样东西、每种现象里无所不在的烦愁，这烦愁自古以来绵绵不绝，它源于不能一下子把所有的事都弄明白。——《太古和其他的时间》",

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
