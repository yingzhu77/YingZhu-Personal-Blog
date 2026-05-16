import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";
// 根据页面开关动态生成导航栏配置
const getDynamicNavBarConfig = (): NavBarConfig => {
	// 基础导航栏链接
	const links: (NavBarLink | LinkPreset)[] = [
		// 主页
		LinkPreset.Home,

		// 归档
		LinkPreset.Archive,

		// 分享（直接硬编码中文名，避免与 i18n/siteConfig 产生循环依赖）
		{
			name: "分享",
			url: "/share/",
			icon: "material-symbols:wallpaper",
		},

		// 项目
		{
			name: "项目",
			url: "/projects/",
			icon: "material-symbols:code-blocks",
		},

		// 友链
		LinkPreset.Friends,

		// 留言板
		LinkPreset.Guestbook,

		// 我的及其子菜单
		{
			name: "我的",
			url: "/my/",
			icon: "material-symbols:person",
			children: [
				// 根据配置决定是否添加相册
				...(siteConfig.pages.gallery ? [LinkPreset.Gallery] : []),

				// 根据配置决定是否添加番组计划
				...(siteConfig.pages.bangumi ? [LinkPreset.Bangumi] : []),
			],
		},

		// 关于（单链接，无下拉）
		LinkPreset.About,
	];

	// 仅返回链接，其它导航搜索相关配置在模块顶层常量中独立导出
	return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
