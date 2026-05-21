import { createRequire } from "node:module";
import type { GalleryAlbum } from "@/types/config";
import { url } from "@/utils/url-utils";

const _require = createRequire(import.meta.url);

function withBase(assetPath: string): string {
	if (!assetPath) return "";
	if (/^(https?:)?\/\//i.test(assetPath) || /^(data|blob):/i.test(assetPath)) {
		return assetPath;
	}
	const normalizedPath = assetPath.startsWith("/")
		? assetPath
		: `/${assetPath}`;
	const base = import.meta.env.BASE_URL || "/";
	if (base !== "/" && normalizedPath.startsWith(base)) {
		return normalizedPath;
	}
	return url(normalizedPath);
}

/**
 * 扫描相册目录中的所有图片文件
 * 仅在 Node.js 构建环境中运行，Cloudflare Workers 回退返回空数组
 */
export function scanAlbumPhotos(albumId: string): string[] {
	try {
		// 检测是否为 Node.js 环境（Cloudflare Workers 中 process.cwd 不可用）
		if (typeof process === "undefined" || typeof process.cwd !== "function") {
			return [];
		}
	} catch {
		return [];
	}

	let fs: typeof import("node:fs");
	let path: typeof import("node:path");
	try {
		// 使用 createRequire 兼容 Vite ESM 上下文
		fs = _require("node:fs");
		path = _require("node:path");
	} catch {
		return [];
	}

	const dir = path.join(process.cwd(), "public", "gallery", albumId);
	if (!fs.existsSync(dir)) return [];
	const files = fs
		.readdirSync(dir)
		.filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
		.sort();
	// 将 cover.* 排到第一位
	const coverIdx = files.findIndex((f) => /^cover\./i.test(f));
	if (coverIdx > 0) {
		const [coverFile] = files.splice(coverIdx, 1);
		files.unshift(coverFile);
	}
	const localPhotos = files.map((f) => withBase(`/gallery/${albumId}/${f}`));

	// 读取 urls.txt 中的远程图片 URL
	const urlsFile = path.join(dir, "urls.txt");
	let remotePhotos: string[] = [];
	if (fs.existsSync(urlsFile)) {
		remotePhotos = fs
			.readFileSync(urlsFile, "utf-8")
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#"));
	}

	return [...localPhotos, ...remotePhotos];
}

/**
 * 获取相册封面图
 * 优先级：手动指定 > cover.* 文件 > 第一张图片
 */
export function getAlbumCover(album: GalleryAlbum, photos: string[]): string {
	if (album.cover) return withBase(album.cover);
	const coverFile = photos.find((p) => /\/cover\./i.test(p));
	return coverFile || photos[0] || "";
}
