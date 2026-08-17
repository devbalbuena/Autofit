/**
 * SizeSelector component
 * Renders category filters and size preset cards.
 */
import { SIZES, SIZE_CATEGORIES, getSizeById } from '../lib/sizes.js';

export function SizeSelectorHTML() {
  return `
    <div class="size-selector-container">
      <div class="size-category-tabs" id="size-category-tabs">
        <button class="cat-tab active" data-cat="ALL">All</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.ID}">ID</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.PHOTO}">Photo</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.LARGE}">Doc</button>
      </div>
      <div class="size-grid" id="size-grid"></div>
    </div>
  `;
}

/**
 * Initialize size selector with category filtering and selection callback
 */
export function initSizeSelector(containerEl, onSelect, currentSizeId) {
  let activeCategory = 'ALL';
  let selectedId = currentSizeId;

  const gridEl = containerEl.querySelector('#size-grid');
  const tabsEl = containerEl.querySelector('#size-category-tabs');

  function renderGrid() {
    const filteredSizes = activeCategory === 'ALL'
      ? SIZES
      : SIZES.filter(s => s.category === activeCategory);

    gridEl.innerHTML = filteredSizes.map(s => {
      const isSelected = s.id === selectedId;
      const aspect = s.w / s.h;
      const previewH = 28;
      const previewW = Math.min(Math.max(Math.round(previewH * aspect), 14), 48);

      return `
        <div class="size-card ${isSelected ? 'active' : ''}" data-size="${s.id}" tabindex="0" role="button" aria-pressed="${isSelected}">
          <div class="size-card-preview" style="width:${previewW}px;height:${previewH}px"></div>
          <div class="size-card-name">${s.name}</div>
          <div class="size-card-dim">${s.label}</div>
        </div>
      `;
    }).join('');

    gridEl.querySelectorAll('.size-card').forEach(card => {
      const handleSelect = () => {
        selectedId = card.dataset.size;
        renderGrid();
        onSelect(selectedId);
      };

      card.addEventListener('click', handleSelect);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });
    });
  }

  if (tabsEl) {
    tabsEl.querySelectorAll('.cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.dataset.cat;
        renderGrid();
      });
    });
  }

  renderGrid();

  return {
    setSelected(id) {
      selectedId = id;
      renderGrid();
    }
  };
}
