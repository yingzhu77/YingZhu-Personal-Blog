<script lang="ts">
import { tick } from "svelte";
import Icon from "@/components/common/Icon.svelte";

interface BookItem {
	title: string;
	author: string;
	cover: string;
	review: string;
	link?: string;
}

let { books = [] }: { books: BookItem[] } = $props();
let selectedBook: BookItem | null = $state(null);

function openDetail(book: BookItem) {
	selectedBook = book;
	document.body.style.overflow = "hidden";
}

function closeDetail() {
	selectedBook = null;
	document.body.style.overflow = "";
}

$effect(() => {
	if (selectedBook) {
		tick().then(() => {
			const el = document.querySelector(".detail-backdrop");
			if (el && el.parentElement !== document.body)
				document.body.appendChild(el);
		});
	}
});

function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Escape") closeDetail();
}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="reading-grid">
  {#each books as book}
    <button class="book-card group" onclick={() => openDetail(book)} aria-label={book.title}>
      <!-- 封面区域 -->
      <div class="book-cover-wrapper">
        {#if book.cover}
          <img src={book.cover} alt={book.title} class="book-cover" loading="lazy" />
        {:else}
          <div class="book-cover-placeholder">
            <Icon icon="material-symbols:book-2-outline" class="text-[2rem] opacity-30" />
            <span class="text-xs opacity-40 mt-1">{book.title}</span>
          </div>
        {/if}
        <!-- hover 评价浮层 -->
        <div class="book-overlay">
          <p class="book-review-preview">{book.review || "暂无评价"}</p>
        </div>
      </div>
      <div class="book-info">
        <span class="book-title">{book.title}</span>
        <span class="book-author">{book.author}</span>
      </div>
    </button>
  {/each}
</div>

<!-- 详情弹窗 -->
{#if selectedBook}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="detail-backdrop" onclick={closeDetail} onkeydown={(e) => e.key === "Escape" && closeDetail()} role="dialog" aria-modal="true" aria-label={selectedBook.title}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="detail-content" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
      <button class="detail-close" onclick={closeDetail} aria-label="关闭">
        <Icon icon="material-symbols:close-rounded" class="text-[1.5rem]" />
      </button>
      <div class="detail-body">
        {#if selectedBook.cover}
          <img src={selectedBook.cover} alt={selectedBook.title} class="detail-cover" />
        {/if}
        <h3 class="detail-title">{selectedBook.title}</h3>
        <p class="detail-author">{selectedBook.author}</p>
        <div class="detail-divider"></div>
        <p class="detail-review">{selectedBook.review || "暂无评价"}</p>
        {#if selectedBook.link}
          <a href={selectedBook.link} target="_blank" rel="noopener noreferrer" class="detail-link">
            了解更多 →
          </a>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .reading-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  @media (min-width: 768px) { .reading-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1280px) { .reading-grid { grid-template-columns: repeat(4, 1fr); } }

  .book-card { border-radius: var(--radius-large, 0.75rem); overflow: hidden; background: var(--card-bg, #fff); border: 1px solid var(--line-divider, transparent); transition: border-color 0.2s ease, transform 0.2s ease; cursor: pointer; text-align: left; padding: 0; }
  .book-card:hover { border-color: oklch(from var(--primary) l c h / 0.25); transform: translateY(-1px); }

  .book-cover-wrapper { position: relative; aspect-ratio: 3/4; overflow: hidden; background: var(--btn-regular-bg, #f0f0f0); }
  .book-cover { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
  .book-card:hover .book-cover { transform: scale(1.05); }
  .book-cover-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--btn-content, #999); }

  /* hover 评价浮层 */
  .book-overlay { position: absolute; inset: auto 0 0 0; padding: 0.75rem; background: linear-gradient(transparent, rgba(0,0,0,0.75)); opacity: 0; transform: translateY(4px); transition: opacity 0.25s ease, transform 0.25s ease; }
  .book-card:hover .book-overlay { opacity: 1; transform: translateY(0); }
  .book-review-preview { font-size: 0.75rem; line-height: 1.5; color: rgba(255,255,255,0.9); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }

  .book-info { padding: 0.625rem 0.75rem; }
  .book-title { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--color-text, #333); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  :global(.dark) .book-title { color: var(--color-text-dark, #e0e0e0); }
  .book-author { display: block; font-size: 0.6875rem; color: var(--color-text-muted, #999); margin-top: 0.125rem; }

  /* 详情弹窗 */
  .detail-backdrop { position: fixed; inset: 0; z-index: 1001; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 1rem; animation: fade-in 0.2s ease; }
  .detail-content { position: relative; max-width: 28rem; width: 100%; max-height: 85vh; overflow-y: auto; background: var(--card-bg, #fff); border-radius: var(--radius-large, 1rem); cursor: default; }
  :global(.dark) .detail-content { background: #1e1e2a; }
  .detail-close { position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.5); border: none; color: #fff; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: background 0.15s ease; }
  .detail-close:hover { background: rgba(0,0,0,0.7); }
  .detail-body { padding: 2rem; text-align: center; }
  .detail-cover { width: 120px; height: 160px; object-fit: cover; border-radius: 0.5rem; margin: 0 auto 1rem; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
  .detail-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.25rem; }
  .detail-author { font-size: 0.8125rem; color: var(--color-text-muted, #999); margin: 0; }
  .detail-divider { width: 2rem; height: 2px; background: var(--primary); margin: 1rem auto; border-radius: 1px; }
  .detail-review { font-size: 0.875rem; line-height: 1.75; text-align: left; color: var(--color-text, #333); white-space: pre-line; }
  :global(.dark) .detail-review { color: #ccc; }
  .detail-link { display: inline-block; margin-top: 1rem; font-size: 0.8125rem; color: var(--primary); text-decoration: none; }
  .detail-link:hover { text-decoration: underline; }

  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .detail-backdrop { animation: none; } .book-cover { transition: none; } }
</style>
