/**
 * SizeSelector component
 * Renders category filters, size preset cards, and ID Combo packages.
 */
import { SIZES, SIZE_CATEGORIES } from '../lib/sizes.js';

export function SizeSelectorHTML() {
  return `
    <div class="size-selector-container">
      <div class="size-category-tabs" id="size-category-tabs">
        <button class="cat-tab active" data-cat="ALL">All</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.COMBO}">Combos</button>
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

      if (s.isCombo) {
        return `
          <div class="size-card size-card-combo ${isSelected ? 'active' : ''}" data-size="${s.id}" tabindex="0" role="button" aria-pressed="${isSelected}">
            <div class="combo-badge">🪪 Combo Pack</div>
            <div class="size-card-name">${s.name}</div>
            <div class="size-card-dim" style="font-size:9.5px;color:var(--accent)">${s.label}</div>
          </div>
        `;
      }

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

        const filtered = activeCategory === 'ALL'
          ? SIZES
          : SIZES.filter(s => s.category === activeCategory);

        // If current selection is not in the new tab, select first item
        if (!filtered.some(s => s.id === selectedId) && filtered.length > 0) {
          selectedId = filtered[0].id;
          onSelect(selectedId);
        }

        renderGrid();
      });
    });
  }

  renderGrid();

  return {
    setSelected(id) {
      selectedId = id;
      // Auto switch category tab if needed
      const found = SIZES.find(s => s.id === id);
      if (found && tabsEl && activeCategory !== 'ALL' && found.category !== activeCategory) {
        tabsEl.querySelectorAll('.cat-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.cat === found.category);
        });
        activeCategory = found.category;
      }
      renderGrid();
    }
  };
}
