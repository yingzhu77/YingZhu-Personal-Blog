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

  let pool: string[] = $state([]);
  let lightboxImage: WallpaperData | null = $state(null);
  let initialized = $state(false);
  let imagesLoaded: Record<string, boolean> = $state({});
  const POOL_MAX = 6;

  // Lightbox zoom & pan state
  let zoom = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isDragging = $state(false);
  let dragStartX = 0;
  let dragStartY = 0;
  let panStartX = 0;
  let panStartY = 0;
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 5;
  const ZOOM_STEP = 0.5;
  const DRAG_THRESHOLD = 5;

  // 图片加载完成回调
  function onImageLoad(name: string) {
    imagesLoaded[name] = true;
  }

  // 初始化：从 localStorage 读取或默认全选
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
    } catch {
      // 忽略
    }
    if (pool.length === 0) {
      pool = wallpapers.slice(0, POOL_MAX).map((w) => w.name);
    }
    initialized = true;
  });

  // 同步到 localStorage
  $effect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem("wallpaperPool", JSON.stringify(pool));
    } catch {
      // 忽略
    }
  });

  // 组件销毁时恢复 body 滚动
  $effect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  });

  function toggle(name: string) {
    if (pool.includes(name)) {
      if (pool.length <= 1) return;
      pool = pool.filter((n) => n !== name);
    } else {
      if (pool.length >= POOL_MAX) {
        // 池满时自动替换最旧项（FIFO）
        pool = [...pool.slice(1), name];
      } else {
        pool = [...pool, name];
      }
    }
  }

  function isInPool(name: string): boolean {
    return pool.includes(name);
  }

  function closeLightbox() {
    lightboxImage = null;
    document.body.style.overflow = "";
  }

  // 将灯箱 DOM 提升到 body 级别，避免祖级 CSS transform 破坏 position:fixed 定位
  $effect(() => {
    if (lightboxImage) {
      tick().then(() => {
        const backdrop = document.querySelector('.lightbox-backdrop');
        if (backdrop && backdrop.parentElement !== document.body) {
          document.body.appendChild(backdrop);
        }
      });
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") { closeLightbox(); }
  }

  function keyHandler(e: KeyboardEvent) {
    if (e.key === "Escape") { closeLightbox(); return; }
    if (e.key === "+" || e.key === "=") { zoomIn(); return; }
    if (e.key === "-") { zoomOut(); return; }
    if (e.key === "0") { resetZoom(); return; }
    if (e.key === "ArrowLeft") { panX = Math.max(panX - 40, -(zoom - 1) * 300); }
    if (e.key === "ArrowRight") { panX = Math.min(panX + 40, (zoom - 1) * 300); }
    if (e.key === "ArrowUp") { panY = Math.max(panY - 40, -(zoom - 1) * 300); }
    if (e.key === "ArrowDown") { panY = Math.min(panY + 40, (zoom - 1) * 300); }
  }

  function zoomIn() { setZoom(Math.min(zoom + ZOOM_STEP, ZOOM_MAX)); }
  function zoomOut() { setZoom(Math.max(zoom - ZOOM_STEP, ZOOM_MIN)); }
  function resetZoom() { zoom = ZOOM_MIN; panX = 0; panY = 0; }

  function setZoom(newZoom: number) {
    if (newZoom === ZOOM_MIN) { panX = 0; panY = 0; }
    zoom = newZoom;
  }

  // Drag handlers (mouse)
  function startDrag(e: MouseEvent) {
    if (zoom <= 1) return;
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = panX;
    panStartY = panY;
  }

  function doDrag(e: MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    panX = panStartX + dx;
    panY = panStartY + dy;
  }

  function endDrag() { isDragging = false; }

  // Drag handlers (touch)
  function startDragTouch(e: TouchEvent) {
    if (zoom <= 1 || e.touches.length !== 1) return;
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    panStartX = panX;
    panStartY = panY;
  }

  function doDragTouch(e: TouchEvent) {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;
    if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    panX = panStartX + dx;
    panY = panStartY + dy;
  }

  // 重置缩放状态
  function openLightbox(item: WallpaperData) {
    lightboxImage = item;
    zoom = ZOOM_MIN;
    panX = 0;
    panY = 0;
    document.body.style.overflow = "hidden";
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="wallpaper-gallery">
  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
    {#each wallpapers as wallpaper}
      <div class="wallpaper-card group">
        <!-- 缩略图 -->
        <button
          class="wallpaper-thumbnail-wrapper"
          onclick={() => openLightbox(wallpaper)}
          aria-label="预览壁纸"
        >
          {#if wallpaper.thumbnailUrl}
            <!-- 骨架加载动画 -->
            {#if !imagesLoaded[wallpaper.name]}
              <div class="skeleton-loader"></div>
            {/if}
            <img
              src={wallpaper.thumbnailUrl}
              alt="壁纸"
              class="wallpaper-thumbnail"
              class:loaded={imagesLoaded[wallpaper.name]}
              width="320"
              height="180"
              loading="lazy"
              onload={() => onImageLoad(wallpaper.name)}
            />
          {:else}
            <div class="wallpaper-thumbnail-placeholder">
              <Icon icon="material-symbols:image-outline" class="text-[2rem] opacity-30" />
            </div>
          {/if}
          <!-- hover 放大图标 -->
          <div class="thumbnail-overlay">
            <Icon icon="material-symbols:zoom-in-rounded" class="text-[1.5rem] text-white" />
          </div>
        </button>

        <!-- 卡片底部：仅色相 + 开关 -->
        <div class="card-info">
          <span
            class="hue-dot"
            style="background-color: oklch(0.6 0.2 {wallpaper.hue})"
            title="色相 {wallpaper.hue}°"
          ></span>
          <span class="hue-label">H: {wallpaper.hue}°</span>
          <span class="flex-1"></span>
          <button
            class="pool-toggle"
            class:active={isInPool(wallpaper.name)}
            class:disabled={isInPool(wallpaper.name) && pool.length <= 1}
            onclick={() => toggle(wallpaper.name)}
            disabled={isInPool(wallpaper.name) && pool.length <= 1}
            aria-label={isInPool(wallpaper.name) ? "从轮换池移除" : pool.length >= POOL_MAX ? "池满，点击替换" : "加入轮换池"}
            title={isInPool(wallpaper.name) ? "已在轮换池中" : pool.length >= POOL_MAX ? "轮换池已满(6张)，点击将替换最旧项" : "点击加入轮换池"}
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>
      </div>
    {/each}
  </div>

  <!-- 轮换池状态提示 -->
  <div class="pool-status">
    <Icon icon="material-symbols:shuffle-rounded" class="text-[1rem] text-(--primary)" />
    <span class="text-xs text-neutral-500 dark:text-neutral-400">
      当前轮换池：{pool.length} / {POOL_MAX} 张（上限 6 张）
    </span>
  </div>
</div>

<!-- 灯箱预览 -->
{#if lightboxImage}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="lightbox-backdrop"
    onclick={closeLightbox}
    onkeydown={(e) => keyHandler(e)}
    role="dialog"
    aria-modal="true"
    aria-label="壁纸预览"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="lightbox-content" onkeydown={() => {}}>
      <!-- 关闭按钮 -->
      <button class="lightbox-close" onclick={closeLightbox} aria-label="关闭">
        <Icon icon="material-symbols:close-rounded" class="text-[1.5rem]" />
      </button>

      <!-- 缩放画布 -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="zoom-canvas"
        class:dragging={isDragging}
        onmousedown={startDrag}
        onmousemove={doDrag}
        onmouseup={endDrag}
        onmouseleave={endDrag}
        ontouchstart={startDragTouch}
        ontouchmove={doDragTouch}
        ontouchend={endDrag}
        onclick={(e) => e.stopPropagation()}
        style="cursor: {zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'}"
      >
        <img
          src={lightboxImage.fullUrl}
          alt="壁纸预览"
          class="lightbox-image"
          loading="eager"
          style="transform: translate({panX}px, {panY}px) scale({zoom}); transition: {isDragging ? 'none' : 'transform 0.25s ease-out'}"
          draggable="false"
        />
      </div>

      <!-- 缩放控件 -->
      <div class="zoom-controls" onclick={(e) => e.stopPropagation()}>
        <button class="zoom-btn" onclick={zoomIn} disabled={zoom >= ZOOM_MAX} aria-label="放大" title="放大">
          <Icon icon="material-symbols:add-rounded" class="text-[1.25rem]" />
        </button>
        <span class="zoom-label">{Math.round(zoom * 100)}%</span>
        <button class="zoom-btn" onclick={zoomOut} disabled={zoom <= ZOOM_MIN} aria-label="缩小" title="缩小">
          <Icon icon="material-symbols:remove-rounded" class="text-[1.25rem]" />
        </button>
        {#if zoom > 1}
          <button class="zoom-btn" onclick={resetZoom} aria-label="重置" title="重置">
            <Icon icon="material-symbols:fit-screen-outline" class="text-[1.25rem]" />
          </button>
        {/if}
      </div>

      <!-- 画师署名（仅当有 artist 时显示） -->
      {#if lightboxImage.artist}
        <div class="lightbox-caption" onclick={(e) => e.stopPropagation()}>
          <span class="artist-credit">{lightboxImage.artist}</span>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .wallpaper-card {
    border-radius: var(--radius-large, 0.75rem);
    overflow: hidden;
    background: var(--card-bg, #fff);
    border: 1px solid var(--line-divider, transparent);
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .wallpaper-card:hover {
    border-color: oklch(from var(--primary) l c h / 0.25);
    transform: translateY(-1px);
  }

  .wallpaper-thumbnail-wrapper {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
  }

  /* 骨架加载动画 */
  .skeleton-loader {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--btn-regular-bg, #e0e0e0) 25%,
      oklch(from var(--primary) l c h / 0.08) 50%,
      var(--btn-regular-bg, #e0e0e0) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    z-index: 1;
  }

  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .wallpaper-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease, opacity 0.3s ease;
    opacity: 0;
  }

  .wallpaper-thumbnail.loaded {
    opacity: 1;
  }

  .wallpaper-card:hover .wallpaper-thumbnail {
    transform: scale(1.05);
  }

  .wallpaper-thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--btn-regular-bg, #f0f0f0);
    color: var(--btn-content, #999);
  }

  .thumbnail-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0);
    transition: background 0.2s ease;
  }

  .wallpaper-card:hover .thumbnail-overlay {
    background: rgba(0, 0, 0, 0.3);
  }

  .thumbnail-overlay :global(svg) {
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .wallpaper-card:hover .thumbnail-overlay :global(svg) {
    opacity: 1;
    transform: scale(1);
  }

  .card-info {
    padding: 0.625rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .hue-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .hue-label {
    font-size: 0.6875rem;
    color: var(--color-text-muted, #999);
  }

  /* Toggle Switch */
  .pool-toggle {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    border: none;
    background: none;
    padding: 2px;
    border-radius: 999px;
    transition: opacity 0.15s ease;
  }

  .pool-toggle.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .toggle-track {
    width: 36px;
    height: 20px;
    border-radius: 999px;
    background: var(--btn-regular-bg, #e0e0e0);
    position: relative;
    transition: background-color 0.2s ease;
  }

  .pool-toggle.active .toggle-track {
    background: var(--primary);
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
  }

  .pool-toggle.active .toggle-thumb {
    transform: translateX(16px);
  }

  .pool-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background: var(--btn-regular-bg, #f5f5f5);
  }

  /* Lightbox — 半透明遮罩，导航栏和侧边栏可见 */
  .lightbox-backdrop {
    position: fixed; inset: 0; z-index: 1001;
    background: rgba(0, 0, 0, 0.28);
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer;
    padding: 2rem;
    animation: lightbox-fade-in 0.2s ease;
  }
  :global(.dark) .lightbox-backdrop { background: rgba(0, 0, 0, 0.35); }

  .lightbox-content {
    position: relative; width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: default;
  }

  /* 缩放画布 — 限制最大尺寸，留出呼吸空间 */
  .zoom-canvas {
    width: 100%; height: 100%;
    max-width: 85vw; max-height: calc(100vh - 7rem);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; user-select: none; -webkit-user-select: none;
  }
  .zoom-canvas.dragging { cursor: grabbing !important; }

  .lightbox-image {
    max-width: 100%; max-height: 100%;
    object-fit: contain; border-radius: 0.375rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
    pointer-events: none;
    will-change: transform;
  }

  .lightbox-close {
    position: absolute; top: 0.5rem; right: 0.5rem;
    background: rgba(0, 0, 0, 0.4); border: none; color: #fff;
    width: 2.75rem; height: 2.75rem; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 10;
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .lightbox-close:hover { background: rgba(0, 0, 0, 0.6); transform: scale(1.1); }

  /* 缩放控件 — 右下角气泡 */
  .zoom-controls {
    position: absolute; bottom: 1rem; right: 1rem;
    display: flex; align-items: center; gap: 0.5rem;
    background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px);
    padding: 0.5rem 0.75rem; border-radius: 2rem;
    box-shadow: 0 2px 16px rgba(0,0,0,0.35);
  }
  .zoom-btn {
    width: 2.5rem; height: 2.5rem; border-radius: 50%;
    border: none; background: rgba(255,255,255,0.15); color: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.15s ease, transform 0.12s ease;
  }
  .zoom-btn:hover:not(:disabled) { background: rgba(255,255,255,0.3); transform: scale(1.1); }
  .zoom-btn:active:not(:disabled) { transform: scale(0.92); }
  .zoom-btn:disabled { opacity: 0.25; cursor: not-allowed; }
  .zoom-label {
    font-size: 0.75rem; color: rgba(255,255,255,0.9);
    min-width: 2.75rem; text-align: center; font-variant-numeric: tabular-nums; font-weight: 500;
  }

  /* 画师署名 */
  .lightbox-caption {
    position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
    padding: 0.375rem 0.875rem; border-radius: 0.375rem;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    pointer-events: none;
  }
  .artist-credit { font-size: 0.75rem; color: rgba(255,255,255,0.8); }

  @keyframes lightbox-fade-in { from { opacity: 0; } to { opacity: 1; } }

  @media (prefers-reduced-motion: reduce) {
    .lightbox-backdrop { animation: none; }
    .lightbox-image { transition: none !important; }
    .skeleton-loader { animation: none; background: var(--btn-regular-bg, #e0e0e0); }
    .wallpaper-thumbnail { transition: none; }
    .toggle-thumb { transition: none; }
    .wallpaper-card:hover .wallpaper-thumbnail { transform: none; }
  }
</style>
