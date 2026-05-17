<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@/components/common/Icon.svelte";

  interface PlaylistCardData {
    id: string;
    name: string;
    description: string;
    cover: string;
    server: string;
    type: string;
    id_meting: string;
    default: boolean;
  }

  let { playlists = [] }: { playlists: PlaylistCardData[] } = $props();

  let activeId: string | null = $state(null);
  let switchingId: string | null = $state(null);
  let covers: Record<string, string> = $state({});
  let isPlaying = $state(false);

  onMount(() => {
    if (typeof window === "undefined") return;
    if (window.__fireflyMusic) {
      const state = window.__fireflyMusic.getState();
      activeId = state.currentPlaylistId;
      isPlaying = state.isPlaying;
      if (state.playlist?.[0]?.pic) {
        covers[state.currentPlaylistId] = state.playlist[0].pic;
      }

      const onInit = (e: CustomEvent) => {
        if (e.detail.currentPlaylistId) activeId = e.detail.currentPlaylistId;
        if (e.detail.cover) covers[e.detail.currentPlaylistId || activeId] = e.detail.cover;
      };
      const onSwitched = (e: CustomEvent) => {
        switchingId = null;
        if (e.detail.playlistId) {
          activeId = e.detail.playlistId;
          if (e.detail.cover) covers[e.detail.playlistId] = e.detail.cover;
        }
      };
      const onSwitching = (e: CustomEvent) => { switchingId = e.detail.playlistId; };
      const onPlayState = (e: CustomEvent) => { isPlaying = e.detail.isPlaying; };

      window.addEventListener("fm:init", onInit as EventListener);
      window.addEventListener("fm:playlist-switched", onSwitched as EventListener);
      window.addEventListener("fm:playlist-switching", onSwitching as EventListener);
      window.addEventListener("fm:play-state", onPlayState as EventListener);

      // 后台预加载非活跃歌单封面（每 600ms 一个，不阻塞首屏）
      const otherPls = playlists.filter(p => p.id !== activeId);
      let delay = 0;
      for (const pl of otherPls) {
        delay += 600;
        setTimeout(async () => {
          if (covers[pl.id] || typeof window === "undefined" || !window.__fireflyMusic) return;
          const pic = await window.__fireflyMusic.fetchCover(pl.server, pl.type, pl.id_meting);
          if (pic) covers[pl.id] = pic;
        }, delay);
      }
    }
  });

  function switchTo(pl: PlaylistCardData) {
    if (typeof window === "undefined" || !window.__fireflyMusic || switchingId) return;
    if (activeId === pl.id) return;
    window.__fireflyMusic.switchPlaylist(pl.id);
  }

  function coverSrc(pl: PlaylistCardData): string {
    if (covers[pl.id]) return covers[pl.id];
    if (pl.cover) return pl.cover;
    return "";
  }

  function handleKeydown(e: KeyboardEvent, pl: PlaylistCardData) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); switchTo(pl); }
  }
</script>

<div class="playlist-picker">
  <div class="scroll-track">
    {#each playlists as pl}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="pl-card group"
        class:is-active={activeId === pl.id}
        class:is-switching={switchingId === pl.id}
        onclick={() => switchTo(pl)}
        onkeydown={(e) => handleKeydown(e, pl)}
        role="button"
        tabindex="0"
        aria-label="切换到歌单 {pl.name}"
      >
        <!-- 唱片容器 — 封面填满整个圆盘 -->
        <div class="record-wrap">
          <!-- 旋转层：封面图片填满 -->
          <div class="record-disc" class:spinning={activeId === pl.id && isPlaying}>
            {#if coverSrc(pl)}
              <img src={coverSrc(pl)} alt={pl.name} class="record-cover" loading="lazy" />
            {:else}
              <div class="record-placeholder">
                <Icon icon="material-symbols:album-rounded" class="text-[2rem] opacity-25" />
              </div>
            {/if}
            <!-- 唱片沟槽纹理叠加层 -->
            <div class="record-grooves"></div>
            <!-- 中心孔 -->
            <div class="record-spindle"></div>
          </div>

          <!-- 切换骨架 -->
          {#if switchingId === pl.id}
            <div class="record-skeleton"></div>
          {/if}

          <!-- hover 浮层 -->
          <div class="record-overlay">
            {#if activeId === pl.id}
              <div class="record-badge">
                <span class="record-eq"><i></i><i></i><i></i></span>
                <span class="record-badge-text">{isPlaying ? "播放中" : "已选择"}</span>
              </div>
            {:else}
              <Icon icon="material-symbols:play-circle-rounded" class="text-[1.5rem] text-white" />
            {/if}
            <p class="record-desc">{pl.description || pl.name}</p>
          </div>
        </div>

        <div class="record-name">{pl.name}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .playlist-picker { margin-bottom: 1rem; }

  .scroll-track {
    display: flex; gap: 1rem;
    overflow-x: auto; overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin; scrollbar-color: var(--primary) transparent;
    padding: 0.5rem 0.25rem;
    contain: layout style paint;
  }

  .pl-card {
    flex-shrink: 0; width: 150px;
    scroll-snap-align: start; cursor: pointer;
    transition: transform 0.2s ease;
  }
  .pl-card:hover { transform: translateY(-2px); }
  .pl-card.is-switching { opacity: 0.7; pointer-events: none; }

  /* ── 唱片容器 ── */
  .record-wrap {
    position: relative; aspect-ratio: 1 / 1; border-radius: 50%;
  }

  /* ── 旋转层：封面填满整圆 ── */
  .record-disc {
    position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
    box-shadow:
      0 0 0 2px rgba(0,0,0,0.2),
      0 0 0 5px rgba(0,0,0,0.08),
      0 4px 24px rgba(0,0,0,0.3);
    will-change: transform;
  }
  .record-disc.spinning {
    animation: record-spin 7s linear infinite;
  }
  .pl-card.is-active .record-disc {
    box-shadow:
      0 0 0 2px var(--primary),
      0 0 0 5px oklch(from var(--primary) l c h / 0.35),
      0 0 0 9px oklch(from var(--primary) l c h / 0.12),
      0 4px 24px rgba(0,0,0,0.3);
  }

  /* ── 封面图片填满 ── */
  .record-cover {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .record-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #2a2a2e, #3a3a40);
    color: rgba(255,255,255,0.3);
  }

  /* ── 沟槽纹理（叠加在封面上） ── */
  .record-grooves {
    position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
    background: repeating-radial-gradient(
      circle at 50% 50%,
      transparent 0,
      rgba(0,0,0,0.03) 18%,    transparent 18.5%,
      rgba(0,0,0,0.04) 22%,    transparent 22.5%,
      rgba(0,0,0,0.05) 28%,    transparent 28.5%,
      rgba(0,0,0,0.04) 35%,    transparent 35.5%,
      rgba(0,0,0,0.03) 42%,    transparent 42.5%,
      rgba(0,0,0,0.05) 50%,    transparent 50.5%,
      rgba(0,0,0,0.04) 58%,    transparent 58.5%,
      rgba(0,0,0,0.03) 66%,    transparent 66.5%,
      rgba(0,0,0,0.05) 74%,    transparent 74.5%,
      rgba(0,0,0,0.04) 82%,    transparent 82.5%,
      rgba(0,0,0,0.03) 90%,    transparent 90.5%
    );
  }

  /* ── 中心孔 ── */
  .record-spindle {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 10%; height: 10%; border-radius: 50%;
    background: var(--page-bg, #f5f5f5);
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
    z-index: 2;
  }
  :global(.dark) .record-spindle { background: #1a1a2e; }

  /* ── 切换骨架 ── */
  .record-skeleton {
    position: absolute; inset: 0; border-radius: 50%; z-index: 5;
    background: linear-gradient(90deg,
      rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 75%
    );
    background-size: 200% 100%;
    animation: rec-shimmer 1.5s ease-in-out infinite;
  }
  @keyframes rec-shimmer {
    0% { background-position: 200% 0; } 100% { background-position: -200% 0; }
  }

  /* ── hover 浮层 ── */
  .record-overlay {
    position: absolute; inset: 0; border-radius: 50%; z-index: 3;
    background: rgba(0,0,0,0); opacity: 0;
    transition: opacity 0.25s ease, background 0.25s ease;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 0.375rem; padding: 1rem;
  }
  .pl-card:hover .record-overlay {
    opacity: 1; background: rgba(0,0,0,0.55);
  }
  .pl-card.is-active .record-overlay {
    opacity: 1; background: rgba(0,0,0,0.2);
  }
  .pl-card:hover.is-active .record-overlay {
    background: rgba(0,0,0,0.4);
  }

  /* ── 播放标记 ── */
  .record-badge { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
  .record-eq { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
  .record-eq i {
    display: block; width: 3px; border-radius: 1px; background: var(--primary);
    animation: rec-eq 0.9s ease-in-out infinite;
  }
  .record-eq i:nth-child(1) { height: 7px; animation-delay: 0s; }
  .record-eq i:nth-child(2) { height: 14px; animation-delay: 0.15s; }
  .record-eq i:nth-child(3) { height: 10px; animation-delay: 0.3s; }
  @keyframes rec-eq {
    0%,100% { transform: scaleY(0.6); } 50% { transform: scaleY(1); }
  }
  .record-badge-text { font-size: 0.6875rem; font-weight: 500; color: rgba(255,255,255,0.9); }
  .record-desc {
    font-size: 0.6875rem; line-height: 1.4; color: rgba(255,255,255,0.85);
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    overflow: hidden; text-align: center; margin: 0;
  }

  /* ── 歌单名 ── */
  .record-name {
    padding: 0.5rem 0.25rem; font-size: 0.75rem; font-weight: 500;
    color: var(--color-text, #333); overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap; text-align: center;
  }
  :global(.dark) .record-name { color: #e0e0e0; }

  @keyframes record-spin {
    from { transform: rotate(0deg); } to { transform: rotate(360deg); }
  }

  @media (min-width: 768px) { .pl-card { width: 170px; } }

  @media (prefers-reduced-motion: reduce) {
    .record-disc.spinning { animation: none; }
    .record-eq i { animation: none; }
    .pl-card, .record-overlay { transition: none !important; }
    .record-skeleton { background: rgba(255,255,255,0.05); animation: none; }
  }
</style>
