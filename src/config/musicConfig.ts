import type { MusicPlayerConfig } from "../types/config";

// 音乐播放器配置
export const musicPlayerConfig: MusicPlayerConfig = {
	// 禁用音乐播放器方法：
	// 模板默认侧边栏和导航栏两个都显示
	// 1. 侧边栏：在sidebarConfig.ts侧边栏配置把音乐组件enable设为false禁用即可
	// 2. 导航栏：在本配置文件把showInNavbar设为false禁用即可

	// 是否在导航栏显示音乐播放器入口
	showInNavbar: true,

	// 使用方式："meting" 使用 Meting API，"local" 使用本地音乐列表
	mode: "meting",

	// 默认音量 (0-1)
	volume: 0.7,

	// 播放模式：'list'=列表循环, 'one'=单曲循环, 'random'=随机播放
	playMode: "list",

	// 是否显启用歌词
	showLyrics: true,

	// Meting API 配置
	meting: {
		// Meting API 地址
		// 默认使用官方 API，也可以使用自定义 API
		api: "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r",
		// 音乐平台：netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
		server: "netease",
		// 类型：song=单曲, playlist=歌单, album=专辑, search=搜索, artist=艺术家
		type: "playlist",
		// 歌单/专辑/单曲 ID 或搜索关键词
		id: "10046455237",
		// 认证 token（可选）
		auth: "",
		// 备用 API 配置（当主 API 失败时使用）
		fallbackApis: [
			"https://api.injahow.cn/meting/?server=:server&type=:type&id=:id",
			"https://api.moeyao.cn/meting/?server=:server&type=:type&id=:id",
		],
	},

	// 本地音乐配置（当 mode 为 'local' 时使用）
	// 1. 支持传入歌词文件的路径
	// lrc: "/assets/music/lrc/使一颗心免于哀伤-哼唱.lrc",
	// 2. 或者直接填入歌词字符串内容
	// lrc: "[00:00.00]歌词内容...",
	local: {
		playlist: [
			{
				name: "使一颗心免于哀伤",
				artist: "知更鸟 / HOYO-MiX / Chevy",
				url: "/assets/music/使一颗心免于哀伤-哼唱.mp3",
				cover: "/assets/music/cover/109951169585655912.webp",
				lrc: "",
			},
		],
	},

	// 多歌单切换配置（可选）
	// 配置后在分享页展示横向滚动歌单选择器，不配置则沿用单歌单模式
	playlists: [
		{
			id: "yorushika-natsukusa",
			name: "夏草が邪魔をする",
			description: "言って。 / 雲と幽霊 / 靴の花火 — 夜鹿早期经典EP",
			cover: "",
			server: "netease",
			type: "album",
			id_meting: "35670522",
			default: true,
		},
		{
			id: "starrail-songs",
			name: "崩坏：星穹铁道",
			description: "知更鸟的歌，愿你能在银河中自由地歌唱。",
			cover: "",
			server: "netease",
			type: "playlist",
			id_meting: "10046455237",
			default: false,
		},
		{
			id: "yorushika-collection",
			name: "ヨルシカ · 全专辑收录",
			description:
				"だから僕は音楽を辞めた / エルマ / 盗作 / 幻燈 — 夜鹿经典全收录",
			cover: "",
			server: "netease",
			type: "playlist",
			id_meting: "8780955963",
			default: false,
		},
		{
			id: "yorushika-gento",
			name: "二人称",
			description: "《二人称》共收录22首作品，内容横跨ヨルシカ近年的代表创作与全新篇章，包括《太陽》《修羅》《忘れてください》等已发布曲目，同时特别收录重新录制版本的《ヒッチコック》，以及12首全新原创歌曲，呈现出极为完整且层次丰富的音乐叙事。",
			cover: "",
			server: "netease",
			type: "album",
			id_meting: "364564348",
			default: false,
		},
		{
			id: "avemujica",
			name: "Ave Mujica",
			description: "2025年1月にリリースされ、国内外で大きな話題を呼んだ、TVアニメ「BanG Dream! Ave Mujica」のオープニングテーマ「KiLLKiSS」と、エンディングテーマ「Georgette Me, Georgette You」の2曲を含む、全7曲を収録。",
			cover: "",
			server: "netease",
			type: "album",
			id_meting: "269138556",
			default: false,
		},
		{
			id: "togeari",
			name: "棘ナシ",
			description: "本年度最强新番「GIRLS BAND CRY」剧中少女乐队トゲナシトゲアリ 第二张专辑『棘ナシ』将于2024年8月28日正式发行。专辑收录了TV动画中的片头曲、片尾曲和多首插入歌曲，以及两首TV动画中未使用的全新歌曲，共计12首歌曲。",
			cover: "",
			server: "netease",
			type: "album",
			id_meting: "246241907",
			default: false,
		},
	],
};
