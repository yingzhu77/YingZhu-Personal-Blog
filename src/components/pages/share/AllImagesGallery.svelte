<script lang="ts">
import { tick } from "svelte";
import Icon from "@/components/common/Icon.svelte";

interface WallpaperData {
	name: string;
	hue: number;
	desktopPath: string;
	mobilePath: string;
	thumbnailUrl: string;
	fullUrl: string;
	artist?: string;
}

let { wallpapers = [] }: { wallpapers: WallpaperData[] } = $props();
let lightboxItem: WallpaperData | null = $state(null);
let imagesLoaded: Record<string, boolean> = $state({});
let zoom = $state(1);
let panX = $state(0);
let panY = $state(0);
let isDragging = $state(false);
let dsx = 0;
let dsy = 0;
let psx = 0;
let psy = 0;
let isCurrent: Record<string, boolean> = $state({});
const Z_MAX = 5;
const Z_MIN = 1;
const Z_STEP = 0.5;

function onImageLoad(name: string) {
	imagesLoaded[name] = true;
}

// 检测当前壁纸
function checkCurrentWallpaper(name: string): boolean {
	if (typeof window.__bannerDynamicWallpaper !== "undefined") {
		return window.__bannerDynamicWallpaper.name === name;
	}
	if (typeof window.__bannerRandomIndex === "undefined") return false;
	const container = document.getElementById("banner-images-container");
	if (!container) return false;
	const isDesktop = window.innerWidth >= 1024;
	try {
		const namesJson = isDesktop
			? container.dataset.desktopImageNames
			: container.dataset.mobileImageNames;
		if (!namesJson) return false;
		const names = JSON.parse(namesJson);
		const currentIdx = isDesktop
			? window.__bannerRandomIndex.desktop
			: window.__bannerRandomIndex.mobile;
		if (currentIdx === -1) return false;
		return names[currentIdx] === name;
	} catch {
		return false;
	}
}

// 定期刷新当前壁纸状态
$effect(() => {
	const interval = setInterval(() => {
		const newCurrent: Record<string, boolean> = {};
		for (const w of wallpapers) {
			newCurrent[w.name] = checkCurrentWallpaper(w.name);
		}
		isCurrent = newCurrent;
	}, 1000);
	return () => clearInterval(interval);
});

// 初始检测
$effect(() => {
	const newCurrent: Record<string, boolean> = {};
	for (const w of wallpapers) {
		newCurrent[w.name] = checkCurrentWallpaper(w.name);
	}
	isCurrent = newCurrent;
});

$effect(() => {
	return () => {
		document.body.style.overflow = "";
	};
});

function setAsCurrent(item: WallpaperData) {
	// 尝试按名称切换（配置壁纸走模板优化）
	const container = document.getElementById("banner-images-container");
	if (container) {
		try {
			const dNames = JSON.parse(container.dataset.desktopImageNames || "[]");
			const mNames = JSON.parse(container.dataset.mobileImageNames || "[]");
			if (dNames.includes(item.name) || mNames.includes(item.name)) {
				window.dispatchEvent(
					new CustomEvent("setSpecificWallpaper", {
						detail: { name: item.name },
					}),
				);
				return;
			}
		} catch {
			/* fallback */
		}
	}
	// 非配置壁纸走 URL 动态切换
	window.dispatchEvent(
		new CustomEvent("setSpecificWallpaperByUrl", {
			detail: { url: item.fullUrl, name: item.name, hue: item.hue },
		}),
	);
}

function openLightbox(item: WallpaperData) {
	lightboxItem = item;
	zoom = 1;
	panX = 0;
	panY = 0;
	document.body.style.overflow = "hidden";
}
function closeLightbox() {
	lightboxItem = null;
	document.body.style.overflow = "";
}

$effect(() => {
	if (lightboxItem) {
		tick().then(() => {
			const el = document.querySelector(".lb-backdrop");
			if (el && el.parentElement !== document.body)
				document.body.appendChild(el);
		});
	}
});
</script>

<svelte:window onkeydown={(e) => { if (e.key === "Escape") closeLightbox(); }} />

<div>
  <div class="masonry-container">
    {#each wallpapers as wallpaper}
      <div class="masonry-item group" class:is-active={isCurrent[wallpaper.name]}>
        <button class="masonry-thumb-wrapper" onclick={() => openLightbox(wallpaper)} aria-label="预览壁纸">
          {#if wallpaper.thumbnailUrl}
            {#if !imagesLoaded[wallpaper.name]}<div class="masonry-skeleton"></div>{/if}
            <img src={wallpaper.thumbnailUrl} alt="壁纸" class="masonry-thumb" class:loaded={imagesLoaded[wallpaper.name]} loading="lazy" onload={() => onImageLoad(wallpaper.name)} />
          {:else}
            <div class="masonry-placeholder"><Icon icon="material-symbols:image-outline" class="text-[2rem] opacity-30" /></div>
          {/if}
          <div class="masonry-overlay">
            {#if isCurrent[wallpaper.name]}
              <Icon icon="material-symbols:check-circle-rounded" class="text-[1.25rem] text-white" />
            {:else}
              <Icon icon="material-symbols:zoom-in-rounded" class="text-[1.5rem] text-white" />
            {/if}
          </div>
        </button>
        <div class="masonry-info">
          {#if isCurrent[wallpaper.name]}
            <span class="current-badge">
              <Icon icon="material-symbols:wallpaper-rounded" class="text-[0.75rem]" />
              当前
            </span>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

{#if lightboxItem}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="lb-backdrop" onclick={closeLightbox} onkeydown={(e) => { if (e.key==="Escape") closeLightbox(); if (e.key==="+"||e.key==="=") { zoom=Math.min(zoom+Z_STEP,Z_MAX); } if (e.key==="-") { zoom=Math.max(zoom-Z_STEP,Z_MIN); if(zoom===1){panX=0;panY=0;} } if (e.key==="0") { zoom=1;panX=0;panY=0; } }} role="dialog" aria-modal="true" aria-label="壁纸预览">
    <div class="lb-content">
      <button class="lb-close" onclick={closeLightbox} aria-label="关闭"><Icon icon="material-symbols:close-rounded" class="text-[1.5rem]" /></button>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="lb-zoom-canvas" class:dragging={isDragging}
        onmousedown={(e) => { if(zoom<=1)return; isDragging=true; dsx=e.clientX; dsy=e.clientY; psx=panX; psy=panY; }}
        onmousemove={(e) => { if(!isDragging)return; const dx=e.clientX-dsx; const dy=e.clientY-dsy; if(Math.abs(dx)<3&&Math.abs(dy)<3)return; panX=psx+dx; panY=psy+dy; }}
        onmouseup={() => isDragging=false} onmouseleave={() => isDragging=false}
        ontouchstart={(e) => { if(zoom<=1||e.touches.length!==1)return; isDragging=true; dsx=e.touches[0].clientX; dsy=e.touches[0].clientY; psx=panX; psy=panY; }}
        ontouchmove={(e) => { if(!isDragging||e.touches.length!==1)return; panX=psx+e.touches[0].clientX-dsx; panY=psy+e.touches[0].clientY-dsy; }}
        ontouchend={() => isDragging=false}
        onclick={(e) => e.stopPropagation()}
        style="cursor: {zoom>1?(isDragging?'grabbing':'grab'):'default'}">
        <img src={lightboxItem.fullUrl} alt="壁纸预览" class="lb-image" loading="eager" draggable="false" style="transform: translate({panX}px,{panY}px) scale({zoom}); transition: {isDragging?'none':'transform 0.25s ease-out'}" />
      </div>

      <!-- 设为当前壁纸按钮 — 左下角气泡 -->
      <div class="lb-action-ctrl" onclick={(e) => e.stopPropagation()}>
        {#if isCurrent[lightboxItem.name]}
          <div class="lb-current-indicator" aria-label="当前壁纸">
            <Icon icon="material-symbols:check-circle-rounded" class="text-[1.25rem]" />
            <span class="lb-action-label">当前壁纸</span>
          </div>
        {:else}
          <button class="lb-action-btn" onclick={() => setAsCurrent(lightboxItem)} aria-label="设为当前壁纸" title="设为当前壁纸">
            <Icon icon="material-symbols:wallpaper-rounded" class="text-[1.25rem]" />
            <span class="lb-action-label">设为壁纸</span>
          </button>
        {/if}
      </div>

      <!-- 缩放控件 — 右下角气泡 -->
      <div class="lb-zoom-ctrl" onclick={(e) => e.stopPropagation()}>
        <button class="lb-zbtn" onclick={() => { zoom=Math.min(zoom+Z_STEP,Z_MAX); }} disabled={zoom>=Z_MAX} aria-label="放大" title="放大"><Icon icon="material-symbols:add-rounded" class="text-[1.25rem]" /></button>
        <span class="lb-zlabel">{Math.round(zoom*100)}%</span>
        <button class="lb-zbtn" onclick={() => { zoom=Math.max(zoom-Z_STEP,Z_MIN); if(zoom===1){panX=0;panY=0;} }} disabled={zoom<=Z_MIN} aria-label="缩小" title="缩小"><Icon icon="material-symbols:remove-rounded" class="text-[1.25rem]" /></button>
        {#if zoom > 1}
          <button class="lb-zbtn" onclick={() => { zoom=1;panX=0;panY=0; }} aria-label="重置" title="重置"><Icon icon="material-symbols:fit-screen-outline" class="text-[1.25rem]" /></button>
        {/if}
      </div>
      {#if lightboxItem.artist}
        <div class="lb-caption" onclick={(e) => e.stopPropagation()}><span class="lb-artist">{lightboxItem.artist}</span></div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .masonry-container { column-count: 2; column-gap: 0.75rem; }
  @media (min-width: 768px) { .masonry-container { column-count: 3; column-gap: 1rem; } }
  @media (min-width: 1280px) { .masonry-container { column-count: 4; column-gap: 1rem; } }
  .masonry-item { break-inside: avoid; margin-bottom: 0.75rem; border-radius: var(--radius-large, 0.75rem); overflow: hidden; background: var(--card-bg, #fff); border: 2px solid var(--line-divider, transparent); transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease; }
  .masonry-item:hover { border-color: oklch(from var(--primary) l c h / 0.25); transform: translateY(-1px); }
  .masonry-item.is-active { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary), 0 4px 16px oklch(from var(--primary) l c h / 0.2); }
  .masonry-thumb-wrapper { display: block; width: 100%; aspect-ratio: 16 / 10; border: none; background: none; padding: 0; cursor: pointer; position: relative; overflow: hidden; }
  .masonry-thumb { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease, opacity 0.3s ease; opacity: 0; }
  .masonry-thumb.loaded { opacity: 1; }
  .masonry-item:hover .masonry-thumb { transform: scale(1.03); }
  .masonry-skeleton { position: absolute; inset: 0; background: linear-gradient(90deg, var(--btn-regular-bg, #e0e0e0) 25%, oklch(from var(--primary) l c h / 0.08) 50%, var(--btn-regular-bg, #e0e0e0) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; z-index: 1; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .masonry-placeholder { width: 100%; aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; background: var(--btn-regular-bg, #f0f0f0); }
  .masonry-overlay { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .masonry-item.is-active .masonry-overlay { background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%); }
  .masonry-overlay :global(svg) { opacity: 0; transition: opacity 0.2s ease; }
  .masonry-item.is-active .masonry-overlay :global(svg) { opacity: 1; }
  .masonry-info { display: flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.625rem; }
  .current-badge { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.625rem; color: var(--primary); font-weight: 500; }

  /* Lightbox */
  .lb-backdrop { position: fixed; inset: 0; z-index: 1001; background: rgba(0,0,0,0.28); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 2rem; animation: lb-fade-in 0.2s ease; }
  :global(.dark) .lb-backdrop { background: rgba(0,0,0,0.35); }
  .lb-content { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: default; }
  .lb-zoom-canvas { width: 100%; height: 100%; max-width: 85vw; max-height: calc(100vh - 7rem); display: flex; align-items: center; justify-content: center; overflow: hidden; user-select: none; -webkit-user-select: none; }
  .lb-zoom-canvas.dragging { cursor: grabbing !important; }
  .lb-image { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 0.375rem; box-shadow: 0 4px 24px rgba(0,0,0,0.35); pointer-events: none; will-change: transform; }
  .lb-close { position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.4); border: none; color: #fff; width: 2.75rem; height: 2.75rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s ease, transform 0.15s ease; z-index: 10; }
  .lb-close:hover { background: rgba(0,0,0,0.6); transform: scale(1.1); }
  .lb-close:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 2px; }

  /* 设为壁纸 — 左下角毛玻璃气泡 */
  .lb-action-ctrl { position: absolute; bottom: 1rem; left: 1rem; display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); padding: 0.5rem 0.75rem; border-radius: 2rem; box-shadow: 0 2px 16px rgba(0,0,0,0.35); }
  .lb-action-btn { min-width: 2.5rem; min-height: 2.5rem; border-radius: 2rem; border: none; background: rgba(255,255,255,0.15); color: #fff; display: flex; align-items: center; justify-content: center; gap: 0.375rem; cursor: pointer; transition: background 0.15s ease, transform 0.12s ease; padding: 0.5rem 0.875rem; }
  .lb-action-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.05); }
  .lb-action-btn:active { transform: scale(0.95); }
  .lb-action-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 2px; }
  .lb-action-label { font-size: 0.75rem; color: rgba(255,255,255,0.9); font-weight: 500; white-space: nowrap; }
  .lb-current-indicator { display: flex; align-items: center; gap: 0.375rem; min-height: 2.5rem; padding: 0.5rem 0.875rem; border-radius: 2rem; background: rgba(255,255,255,0.08); }
  .lb-current-indicator :global(svg) { color: rgba(255,255,255,0.7); }
  .lb-current-indicator .lb-action-label { color: rgba(255,255,255,0.7); }

  /* 缩放控件 — 右下角气泡 */
  .lb-zoom-ctrl { position: absolute; bottom: 1rem; right: 1rem; display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); padding: 0.5rem 0.75rem; border-radius: 2rem; box-shadow: 0 2px 16px rgba(0,0,0,0.35); }
  .lb-zbtn { width: 2.5rem; height: 2.5rem; border-radius: 50%; border: none; background: rgba(255,255,255,0.15); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s ease, transform 0.12s ease; }
  .lb-zbtn:hover:not(:disabled) { background: rgba(255,255,255,0.3); transform: scale(1.1); }
  .lb-zbtn:active:not(:disabled) { transform: scale(0.92); }
  .lb-zbtn:disabled { opacity: 0.25; cursor: not-allowed; }
  .lb-zbtn:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 2px; }
  .lb-zlabel { font-size: 0.75rem; color: rgba(255,255,255,0.9); min-width: 2.75rem; text-align: center; font-variant-numeric: tabular-nums; font-weight: 500; }
  .lb-caption { position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); padding: 0.375rem 0.875rem; border-radius: 0.375rem; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); pointer-events: none; }
  .lb-artist { font-size: 0.75rem; color: rgba(255,255,255,0.8); }
  @keyframes lb-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .lb-backdrop { animation: none; } .lb-image { transition: none !important; } .masonry-skeleton { animation: none; background: var(--btn-regular-bg, #e0e0e0); } .masonry-thumb { transition: none; } .masonry-item:hover .masonry-thumb { transform: none; } }
  @media (max-width: 640px) {
    .lb-action-ctrl { bottom: 4.5rem; left: 0.5rem; padding: 0.375rem 0.5rem; }
    .lb-action-btn { min-width: 2.25rem; min-height: 2.25rem; padding: 0.375rem 0.625rem; }
    .lb-action-label { font-size: 0.6875rem; }
    .lb-zoom-ctrl { bottom: 0.5rem; right: 0.5rem; }
  }
</style>