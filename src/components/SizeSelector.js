/**
 * SizeSelector component
 * Renders category filters, size preset cards, ID Combo packages,
 * and custom size creation/management (inches, cm, mm).
 */
import {
  SIZE_CATEGORIES,
  getAllSizes,
  addCustomSize,
  removeCustomSize,
  getSizeById
} from '../lib/sizes.js';
import { toast } from '../lib/toast.js';

export function SizeSelectorHTML() {
  return `
    <div class="size-selector-container">
      <div class="size-category-tabs" id="size-category-tabs">
        <button class="cat-tab active" data-cat="ALL">All</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.COMBO}">Combos</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.ID}">ID</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.PHOTO}">Photo</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.LARGE}">Doc</button>
        <button class="cat-tab" data-cat="${SIZE_CATEGORIES.CUSTOM}">Custom</button>
      </div>

      <!-- Custom Size Inline Creator Modal / Drawer -->
      <div class="custom-size-form" id="custom-size-form" style="display:none;">
        <div class="custom-size-title">📐 Create Custom Print Size</div>
        <div class="custom-inputs-row">
          <input type="text" id="cust-name" placeholder="Preset Name (e.g. Wallet 2, Locket)" class="input-text" />
        </div>
        <div class="custom-inputs-row" style="margin-top:6px;gap:6px;display:flex;">
          <input type="number" id="cust-w" placeholder="Width" step="0.1" min="0.1" class="input-text" style="flex:1" />
          <span style="align-self:center;color:var(--ink-muted)">×</span>
          <input type="number" id="cust-h" placeholder="Height" step="0.1" min="0.1" class="input-text" style="flex:1" />
          <select id="cust-unit" class="sheet-select" style="width:70px">
            <option value="in" selected>in</option>
            <option value="cm">cm</option>
            <option value="mm">mm</option>
          </select>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn primary" id="btn-save-custom-size" style="flex:1;padding:6px;font-size:12px">Save Size</button>
          <button class="btn ghost" id="btn-cancel-custom-size" style="padding:6px;font-size:12px">Cancel</button>
        </div>
      </div>

      <div class="size-grid" id="size-grid"></div>
    </div>
  `;
}

/**
 * Initialize size selector with category filtering, custom sizing, and selection callback
 */
export function initSizeSelector(containerEl, onSelect, currentSizeId) {
  let activeCategory = 'ALL';
  let selectedId = currentSizeId;

  const gridEl     = containerEl.querySelector('#size-grid');
  const tabsEl     = containerEl.querySelector('#size-category-tabs');
  const formEl     = containerEl.querySelector('#custom-size-form');
  const btnSave    = containerEl.querySelector('#btn-save-custom-size');
  const btnCancel  = containerEl.querySelector('#btn-cancel-custom-size');
  const custName   = containerEl.querySelector('#cust-name');
  const custW      = containerEl.querySelector('#cust-w');
  const custH      = containerEl.querySelector('#cust-h');
  const custUnit   = containerEl.querySelector('#cust-unit');

  function renderGrid() {
    const allSizes = getAllSizes();
    let filteredSizes = activeCategory === 'ALL'
      ? allSizes
      : allSizes.filter(s => s.category === activeCategory);

    let html = '';

    // "Add Custom Size" card at the beginning of Custom tab or All tab
    if (activeCategory === SIZE_CATEGORIES.CUSTOM || activeCategory === 'ALL') {
      html += `
        <div class="size-card size-card-add" id="card-add-custom" tabindex="0" role="button" title="Create Custom Size">
          <div style="font-size:18px">➕</div>
          <div class="size-card-name" style="font-size:11px">Custom Size</div>
          <div class="size-card-dim" style="font-size:9.5px;color:var(--accent)">Enter W × H</div>
        </div>
      `;
    }

    html += filteredSizes.map(s => {
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

      if (s.isCustom) {
        return `
          <div class="size-card size-card-custom ${isSelected ? 'active' : ''}" data-size="${s.id}" tabindex="0" role="button" aria-pressed="${isSelected}">
            <button class="btn-custom-delete" data-del-id="${s.id}" title="Delete Custom Size">&times;</button>
            <div class="combo-badge" style="background:rgba(245,158,11,0.15);color:#f59e0b">📐 Custom</div>
            <div class="size-card-name">${s.name}</div>
            <div class="size-card-dim">${s.label}</div>
          </div>
        `;
      }

      const aspect = s.w / s.h;
      const previewH = 26;
      const previewW = Math.min(Math.max(Math.round(previewH * aspect), 14), 46);

      return `
        <div class="size-card ${isSelected ? 'active' : ''}" data-size="${s.id}" tabindex="0" role="button" aria-pressed="${isSelected}">
          <div class="size-card-preview" style="width:${previewW}px;height:${previewH}px"></div>
          <div class="size-card-name">${s.name}</div>
          <div class="size-card-dim">${s.label}</div>
        </div>
      `;
    }).join('');

    gridEl.innerHTML = html;

    // Wire Card Click
    gridEl.querySelectorAll('.size-card:not(.size-card-add)').forEach(card => {
      const handleSelect = (e) => {
        if (e.target.closest('.btn-custom-delete')) return;
        selectedId = card.dataset.size;
        renderGrid();
        onSelect(selectedId);
      };

      card.addEventListener('click', handleSelect);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(e);
        }
      });
    });

    // Wire Custom Delete
    gridEl.querySelectorAll('.btn-custom-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.delId;
        removeCustomSize(id);
        if (selectedId === id) {
          selectedId = '4r';
          onSelect(selectedId);
        }
        renderGrid();
        toast('Custom size removed', 'info');
      });
    });

    // Wire "Add Custom Size" Button
    const addCard = gridEl.querySelector('#card-add-custom');
    if (addCard) {
      addCard.addEventListener('click', () => {
        formEl.style.display = formEl.style.display === 'none' ? 'block' : 'none';
        if (formEl.style.display === 'block') {
          custW?.focus();
        }
      });
    }
  }

  // Handle Save Custom Size
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const wVal = parseFloat(custW.value);
      const hVal = parseFloat(custH.value);
      const unit = custUnit.value;
      const name = custName.value.trim();

      if (!wVal || wVal <= 0 || !hVal || hVal <= 0) {
        toast('Please enter valid width and height', 'error');
        return;
      }

      const customObj = addCustomSize({ name, width: wVal, height: hVal, unit });
      formEl.style.display = 'none';
      custW.value = '';
      custH.value = '';
      custName.value = '';

      selectedId = customObj.id;
      renderGrid();
      onSelect(selectedId);
      toast(`Created custom size: ${customObj.name}`, 'success');
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      formEl.style.display = 'none';
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
      const found = getSizeById(id);
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
