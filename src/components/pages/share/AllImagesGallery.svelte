<script lang="ts">
  import { tick } from "svelte";
  import Icon from "@/components/common/Icon.svelte";

  interface WallpaperData {
    name: string; hue: number; desktopPath: string; mobilePath: string;
    thumbnailUrl: string; fullUrl: string; artist?: string;
  }

  let { wallpapers = [] }: { wallpapers: WallpaperData[] } = $props();
  const POOL_MAX = 6;
  let pool: string[] = $state([]);
  let lightboxItem: WallpaperData | null = $state(null);
  let imagesLoaded: Record<string, boolean> = $state({});
  let initialized = $state(false);
  let zoom = $state(1); let panX = $state(0); let panY = $state(0);
  let isDragging = $state(false); let dsx = 0; let dsy = 0; let psx = 0; let psy = 0;
  const Z_MAX = 5; const Z_MIN = 1; const Z_STEP = 0.5;

  function onImageLoad(name: string) { imagesLoaded[name] = true; }

  $effect(() => {
    if (initialized) return;
    try {
      const stored = localStorage.getItem("wallpaperPool");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validNames = wallpapers.map((w) => w.name);
          pool = parsed.filter((n: string) => validNames.includes(n));
        }
      }
    } catch { /* ignore */ }
    if (pool.length === 0) { pool = wallpapers.slice(0, POOL_MAX).map((w) => w.name); }
    initialized = true;
  });

  $effect(() => {
    if (!initialized) return;
    try { localStorage.setItem("wallpaperPool", JSON.stringify(pool)); } catch { /* ignore */ }
  });

  $effect(() => { return () => { document.body.style.overflow = ""; }; });

  function toggle(name: string) {
    if (pool.includes(name)) { if (pool.length <= 1) return; pool = pool.filter((n) => n !== name); }
    else { if (pool.length >= POOL_MAX) { pool = [...pool.slice(1), name]; } else { pool = [...pool, name]; } }
  }
  function isInPool(name: string): boolean { return pool.includes(name); }

  function openLightbox(item: WallpaperData) { lightboxItem = item; zoom = 1; panX = 0; panY = 0; document.body.style.overflow = "hidden"; }
  function closeLightbox() { lightboxItem = null; document.body.style.overflow = ""; }

  $effect(() => {
    if (lightboxItem) {
      tick().then(() => {
        const el = document.querySelector('.lb-backdrop');
        if (el && el.parentElement !== document.body) document.body.appendChild(el);
      });
    }
  });
</script>

<svelte:window onkeydown={(e) => { if (e.key === "Escape") closeLightbox(); }} />

<div>
  <div class="pool-bar">
    <Icon icon="material-symbols:shuffle-rounded" class="text-[1rem] text-(--primary)" />
    <span class="text-xs text-neutral-500 dark:text-neutral-400">当前轮换池：{pool.length} / {POOL_MAX} 张（上限 6 张）· 勾选图片加入或移出</span>
  </div>

  <div class="masonry-container">
    {#each wallpapers as wallpaper}
      <div class="masonry-item group">
        <button class="masonry-thumb-wrapper" onclick={() => openLightbox(wallpaper)} aria-label="预览壁纸">
          {#if wallpaper.thumbnailUrl}
            {#if !imagesLoaded[wallpaper.name]}<div class="masonry-skeleton"></div>{/if}
            <img src={wallpaper.thumbnailUrl} alt="壁纸" class="masonry-thumb" class:loaded={imagesLoaded[wallpaper.name]} loading="lazy" onload={() => onImageLoad(wallpaper.name)} />
          {:else}
            <div class="masonry-placeholder"><Icon icon="material-symbols:image-outline" class="text-[2rem] opacity-30" /></div>
          {/if}
          <div class="masonry-overlay"><Icon icon="material-symbols:zoom-in-rounded" class="text-[1.5rem] text-white" /></div>
        </button>
        <div class="masonry-info">
          <span class="hue-mini" style="background-color: oklch(0.6 0.2 {wallpaper.hue})"></span>
          <span class="hue-text">H:{wallpaper.hue}°</span>
          <span class="flex-1"></span>
          <button class="pool-toggle" class:active={isInPool(wallpaper.name)} class:disabled={isInPool(wallpaper.name) && pool.length <= 1}  onclick={() => toggle(wallpaper.name)} disabled={isInPool(wallpaper.name) && pool.length <= 1} aria-label={isInPool(wallpaper.name) ? "从轮换池移除" : pool.length >= POOL_MAX ? "池满，点击替换" : "加入轮换池"} title={isInPool(wallpaper.name) ? "轮换池中" : pool.length >= POOL_MAX ? "轮换池已满，点击将替换最旧项" : "加入轮换池"}>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </button>
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
  .pool-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.75rem; border-radius: 0.5rem; background: var(--btn-regular-bg, #f5f5f5); margin-bottom: 1rem; }
  .masonry-container { column-count: 2; column-gap: 0.75rem; }
  @media (min-width: 768px) { .masonry-container { column-count: 3; column-gap: 1rem; } }
  @media (min-width: 1280px) { .masonry-container { column-count: 4; column-gap: 1rem; } }
  .masonry-item { break-inside: avoid; margin-bottom: 0.75rem; border-radius: var(--radius-large, 0.75rem); overflow: hidden; background: var(--card-bg, #fff); border: 1px solid var(--line-divider, transparent); transition: border-color 0.2s ease, transform 0.2s ease; }
  .masonry-item:hover { border-color: oklch(from var(--primary) l c h / 0.25); transform: translateY(-1px); }
  .masonry-thumb-wrapper { display: block; width: 100%; border: none; background: none; padding: 0; cursor: pointer; position: relative; overflow: hidden; }
  .masonry-thumb { width: 100%; height: auto; display: block; transition: transform 0.3s ease, opacity 0.3s ease; opacity: 0; }
  .masonry-thumb.loaded { opacity: 1; }
  .masonry-item:hover .masonry-thumb { transform: scale(1.03); }
  .masonry-skeleton { position: absolute; inset: 0; background: linear-gradient(90deg, var(--btn-regular-bg, #e0e0e0) 25%, oklch(from var(--primary) l c h / 0.08) 50%, var(--btn-regular-bg, #e0e0e0) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; z-index: 1; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .masonry-placeholder { width: 100%; aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; background: var(--btn-regular-bg, #f0f0f0); }
  .masonry-overlay { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0); opacity: 0; transition: opacity 0.2s ease, background 0.2s ease; }
  .masonry-item:hover .masonry-overlay { opacity: 1; background: rgba(0,0,0,0.3); }
  .masonry-info { display: flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.625rem; }
  .hue-mini { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.1); }
  .hue-text { font-size: 0.625rem; color: var(--color-text-muted, #999); }
  .pool-toggle { display: inline-flex; align-items: center; cursor: pointer; border: none; background: none; padding: 2px; border-radius: 999px; transition: opacity 0.15s ease; }
  .pool-toggle.disabled { opacity: 0.35; cursor: not-allowed; }
  .toggle-track { width: 32px; height: 18px; border-radius: 999px; background: var(--btn-regular-bg, #e0e0e0); position: relative; transition: background-color 0.2s ease; }
  .pool-toggle.active .toggle-track { background: var(--primary); }
  .toggle-thumb { position: absolute; top: 1.5px; left: 1.5px; width: 15px; height: 15px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: transform 0.2s ease; }
  .pool-toggle.active .toggle-thumb { transform: translateX(14px); }
  /* Lightbox */
  .lb-backdrop { position: fixed; inset: 0; z-index: 1001; background: rgba(0,0,0,0.28); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 2rem; animation: lb-fade-in 0.2s ease; }
  :global(.dark) .lb-backdrop { background: rgba(0,0,0,0.35); }
  .lb-content { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: default; }
  .lb-zoom-canvas { width: 100%; height: 100%; max-width: 85vw; max-height: calc(100vh - 7rem); display: flex; align-items: center; justify-content: center; overflow: hidden; user-select: none; -webkit-user-select: none; }
  .lb-zoom-canvas.dragging { cursor: grabbing !important; }
  .lb-image { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 0.375rem; box-shadow: 0 4px 24px rgba(0,0,0,0.35); pointer-events: none; will-change: transform; }
  .lb-close { position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.4); border: none; color: #fff; width: 2.75rem; height: 2.75rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s ease, transform 0.15s ease; z-index: 10; }
  .lb-close:hover { background: rgba(0,0,0,0.6); transform: scale(1.1); }
  .lb-zoom-ctrl { position: absolute; bottom: 1rem; right: 1rem; display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); padding: 0.5rem 0.75rem; border-radius: 2rem; box-shadow: 0 2px 16px rgba(0,0,0,0.35); }
  .lb-zbtn { width: 2.5rem; height: 2.5rem; border-radius: 50%; border: none; background: rgba(255,255,255,0.15); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s ease, transform 0.12s ease; }
  .lb-zbtn:hover:not(:disabled) { background: rgba(255,255,255,0.3); transform: scale(1.1); }
  .lb-zbtn:active:not(:disabled) { transform: scale(0.92); }
  .lb-zbtn:disabled { opacity: 0.25; cursor: not-allowed; }
  .lb-zlabel { font-size: 0.75rem; color: rgba(255,255,255,0.9); min-width: 2.75rem; text-align: center; font-variant-numeric: tabular-nums; font-weight: 500; }
  .lb-caption { position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); padding: 0.375rem 0.875rem; border-radius: 0.375rem; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); pointer-events: none; }
  .lb-artist { font-size: 0.75rem; color: rgba(255,255,255,0.8); }
  @keyframes lb-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .lb-backdrop { animation: none; } .lb-image { transition: none !important; } .masonry-skeleton { animation: none; background: var(--btn-regular-bg, #e0e0e0); } .masonry-thumb { transition: none; } .masonry-item:hover .masonry-thumb { transform: none; } }
</style>
