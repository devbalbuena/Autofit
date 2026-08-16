import './style.css';
import { SIZES, SHEET_SIZES, DEFAULT_SIZE_ID, DEFAULT_SHEET, getSizeById } from './lib/sizes.js';
import { calcTiling, fitScale } from './lib/tiler.js';
import { loadHistory, saveToHistory } from './lib/history.js';
import { extractImageFromClipboard, fileToDataUrl, safeFileName } from './lib/clipboard.js';
import { toast } from './lib/toast.js';
import { DropZoneHTML, initDropZone, initWindowDrop } from './components/DropZone.js';

// ─── State ───────────────────────────────────────────────────────────────────
let state = {
  imageDataUrl: null,
  imageName: 'photo',
  sizeId: DEFAULT_SIZE_ID,
  sheet: DEFAULT_SHEET,
  count: null, // null = auto-fill max
};

// ─── App Shell HTML ───────────────────────────────────────────────────────────
document.getElementById('app').innerHTML = `
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">🖨️</div>
      <div class="sidebar-brand-text">
        <span class="sidebar-brand-name">AutoFit</span>
        <span class="sidebar-brand-sub">Photo Print</span>
      </div>
    </div>

    <div class="sidebar-section-label">Tools</div>

    <a class="nav-item active">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="2" width="12" height="12" rx="1"/>
        <path d="M2 11l3-3 2 2 4-5 3 4"/>
      </svg>
      Photo Print
    </a>

    <a class="nav-item" style="opacity:0.4;pointer-events:none">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="1" y="3" width="6" height="10" rx="1"/>
        <rect x="9" y="3" width="6" height="10" rx="1"/>
      </svg>
      ID Copy
      <span style="margin-left:auto;font-size:9px;font-family:var(--font-mono);opacity:0.5">SOON</span>
    </a>

    <a class="nav-item" style="opacity:0.4;pointer-events:none">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1"/>
        <rect x="9" y="1" width="6" height="6" rx="1"/>
        <rect x="1" y="9" width="6" height="6" rx="1"/>
        <rect x="9" y="9" width="6" height="6" rx="1"/>
      </svg>
      Auto Collage
      <span style="margin-left:auto;font-size:9px;font-family:var(--font-mono);opacity:0.5">SOON</span>
    </a>

    <div class="sidebar-footer">v1.0.0 · offline</div>
  </aside>

  <div class="main">
    <div class="toolbar">
      <span class="toolbar-title">Photo Print Sizer</span>
      <button class="btn ghost" id="btn-clear" disabled>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 3l10 10M13 3L3 13"/>
        </svg>
        Clear
      </button>
      <div class="toolbar-spacer"></div>
      <button class="btn primary" id="btn-print" disabled>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 6V2h8v4"/>
          <rect x="2" y="6" width="12" height="6" rx="1"/>
          <path d="M4 10v4h8v-4"/>
        </svg>
        Print
      </button>
    </div>

    <div class="workspace">
      <div class="canvas-area" id="canvas-area">
        ${DropZoneHTML()}

        <div class="sheet-wrap" id="sheet-wrap">
          <div class="sheet" id="sheet">
            <div class="sheet-grid" id="sheet-grid"></div>
          </div>
          <div class="sheet-info" id="sheet-info"></div>
        </div>
      </div>

      <aside class="right-panel">
        <div class="panel-section">
          <div class="panel-label">Print Size</div>
          <div class="size-grid" id="size-grid"></div>
        </div>

        <div class="panel-section">
          <div class="panel-label">Sheet</div>
          <select class="sheet-select" id="sheet-select">
            <option value="a4">A4 (8.27 × 11.69 in)</option>
            <option value="letter">Letter (8.5 × 11 in)</option>
          </select>
        </div>

        <div class="panel-section">
          <div class="panel-label">Copies</div>
          <div class="count-row">
            <span class="count-label">Per sheet</span>
            <div class="count-controls">
              <button class="count-btn" id="btn-count-down">−</button>
              <span class="count-value" id="count-display">Auto</span>
              <button class="count-btn" id="btn-count-up">+</button>
            </div>
          </div>
        </div>

        <div class="panel-section" style="flex:1;overflow:hidden;display:flex;flex-direction:column;padding-bottom:8px">
          <div class="panel-label">Recent Photos</div>
          <div class="history-list" id="history-list"></div>
        </div>
      </aside>
    </div>
  </div>

  <div class="print-frame" id="print-frame"></div>
`;

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const dropZone     = document.getElementById('drop-zone');
const fileInput    = document.getElementById('file-input');
const btnPrint     = document.getElementById('btn-print');
const btnClear     = document.getElementById('btn-clear');
const sheetWrap    = document.getElementById('sheet-wrap');
const sheet        = document.getElementById('sheet');
const sheetGrid    = document.getElementById('sheet-grid');
const sheetInfo    = document.getElementById('sheet-info');
const sizeGrid     = document.getElementById('size-grid');
const sheetSelect  = document.getElementById('sheet-select');
const countDisplay = document.getElementById('count-display');
const btnCountUp   = document.getElementById('btn-count-up');
const btnCountDn   = document.getElementById('btn-count-down');
const historyList  = document.getElementById('history-list');
const printFrame   = document.getElementById('print-frame');
const canvasArea   = document.getElementById('canvas-area');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMaxFit() {
  const size   = getSizeById(state.sizeId);
  const sheet_ = SHEET_SIZES[state.sheet];
  const { maxFit } = calcTiling(size.w, size.h, sheet_.w, sheet_.h);
  return maxFit;
}

// ─── Size Grid ────────────────────────────────────────────────────────────────
function buildSizeGrid() {
  sizeGrid.innerHTML = SIZES.map(s => {
    const aspect   = s.w / s.h;
    const previewH = 30;
    const previewW = Math.max(Math.round(previewH * aspect), 18);
    return `
      <div class="size-card ${s.id === state.sizeId ? 'active' : ''}" data-size="${s.id}">
        <div class="size-card-preview" style="width:${previewW}px;height:${previewH}px"></div>
        <div class="size-card-name">${s.name}</div>
        <div class="size-card-dim">${s.label}</div>
      </div>`;
  }).join('');

  sizeGrid.querySelectorAll('.size-card').forEach(card => {
    card.addEventListener('click', () => {
      state.sizeId = card.dataset.size;
      state.count  = null;
      buildSizeGrid();
      updateCountDisplay();
      if (state.imageDataUrl) renderSheet();
    });
  });
}

// ─── Count Display ────────────────────────────────────────────────────────────
function updateCountDisplay() {
  const max = getMaxFit();
  if (state.count === null || state.count >= max) {
    state.count = null;
    countDisplay.textContent = 'Auto';
  } else {
    countDisplay.textContent = state.count;
  }
}

// ─── Sheet Preview ────────────────────────────────────────────────────────────
function renderSheet() {
  if (!state.imageDataUrl) return;

  const size   = getSizeById(state.sizeId);
  const sheet_ = SHEET_SIZES[state.sheet];
  const { cols, rows, maxFit } = calcTiling(size.w, size.h, sheet_.w, sheet_.h);

  const usedCount = state.count === null ? maxFit : Math.min(state.count, maxFit);

  const cw    = canvasArea.clientWidth  || 800;
  const ch    = canvasArea.clientHeight || 600;
  const scale = fitScale(sheet_.w, sheet_.h, cw, ch, 80);

  const sheetPxW = Math.round(sheet_.w * 96 * scale);
  const sheetPxH = Math.round(sheet_.h * 96 * scale);
  const cellW    = Math.round(size.w   * 96 * scale);
  const cellH    = Math.round(size.h   * 96 * scale);

  sheet.style.width  = sheetPxW + 'px';
  sheet.style.height = sheetPxH + 'px';

  const offsetTop  = Math.round((sheetPxH - rows * cellH) / 2);
  const offsetLeft = Math.round((sheetPxW - cols * cellW) / 2);

  sheetGrid.style.cssText = `
    display: grid;
    position: absolute;
    grid-template-columns: repeat(${cols}, ${cellW}px);
    grid-template-rows: repeat(${rows}, ${cellH}px);
    top: ${offsetTop}px;
    left: ${offsetLeft}px;
  `;

  sheetGrid.innerHTML = Array.from({ length: rows * cols }, (_, i) => {
    const filled = i < usedCount;
    return `<div class="sheet-cell" style="width:${cellW}px;height:${cellH}px">
      ${filled ? `<img src="${state.imageDataUrl}" alt="photo"/>` : ''}
    </div>`;
  }).join('');

  sheetInfo.textContent =
    `${cols} col × ${rows} row · ${usedCount} copies · ${size.name} on ${sheet_.name}`;

  updateCountDisplay();
}

// ─── Load Image ───────────────────────────────────────────────────────────────
async function loadImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    toast('Please use an image file (JPG, PNG, WEBP…)', 'error');
    return;
  }

  try {
    const dataUrl = await fileToDataUrl(file);
    const name    = safeFileName(file);

    state.imageDataUrl = dataUrl;
    state.imageName    = name;
    state.count        = null;

    // Swap UI: hide drop zone, show sheet
    dropZone.style.display = 'none';
    sheetWrap.classList.add('visible');
    btnPrint.disabled = false;
    btnClear.disabled = false;

    renderSheet();
    toast(`Loaded: ${name}`, 'success');

    // Persist to history
    saveToHistory({
      id: Date.now().toString(),
      name,
      dataUrl,
      savedAt: new Date().toLocaleString(),
    });
    renderHistory();
  } catch (err) {
    toast('Could not load image — ' + err.message, 'error');
  }
}

// ─── Clear ────────────────────────────────────────────────────────────────────
function clearPhoto() {
  state.imageDataUrl = null;
  state.imageName    = 'photo';
  state.count        = null;

  dropZone.style.display = '';
  sheetWrap.classList.remove('visible');
  sheetGrid.innerHTML = '';
  sheetInfo.textContent = '';

  btnPrint.disabled = true;
  btnClear.disabled = true;
  updateCountDisplay();
}

// ─── History ──────────────────────────────────────────────────────────────────
function renderHistory() {
  const items = loadHistory();
  if (items.length === 0) {
    historyList.innerHTML =
      '<div class="history-empty">No recent photos yet.<br/>Load a photo to get started.</div>';
    return;
  }
  historyList.innerHTML = items.map(item => `
    <div class="history-item fade-in" data-id="${item.id}" title="Click to reload">
      <img class="history-thumb" src="${item.dataUrl}" alt="${item.name}" />
      <div class="history-info">
        <div class="history-name">${item.name}</div>
        <div class="history-date">${item.savedAt}</div>
      </div>
    </div>
  `).join('');

  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = loadHistory().find(i => i.id === el.dataset.id);
      if (!item) return;
      state.imageDataUrl = item.dataUrl;
      state.imageName    = item.name;
      state.count        = null;
      dropZone.style.display = 'none';
      sheetWrap.classList.add('visible');
      btnPrint.disabled = false;
      btnClear.disabled = false;
      renderSheet();
      toast(`Restored: ${item.name}`, 'success');
    });
  });
}

// ─── Print ────────────────────────────────────────────────────────────────────
function doPrint() {
  if (!state.imageDataUrl) return;

  const size   = getSizeById(state.sizeId);
  const sheet_ = SHEET_SIZES[state.sheet];
  const { cols, rows, maxFit } = calcTiling(size.w, size.h, sheet_.w, sheet_.h);
  const usedCount = state.count === null ? maxFit : Math.min(state.count, maxFit);

  printFrame.innerHTML = `
    <div style="width:${sheet_.w}in;height:${sheet_.h}in;position:relative;overflow:hidden;margin:0;padding:0">
      <div style="
        display:grid;
        grid-template-columns:repeat(${cols},${size.w}in);
        grid-template-rows:repeat(${rows},${size.h}in);
        position:absolute;
        top:${(sheet_.h - rows * size.h) / 2}in;
        left:${(sheet_.w - cols * size.w) / 2}in;
      ">
        ${Array.from({ length: cols * rows }, (_, i) => {
          const filled = i < usedCount;
          return `<div style="width:${size.w}in;height:${size.h}in;overflow:hidden;border:.25pt solid rgba(0,0,0,.1)">
            ${filled ? `<img src="${state.imageDataUrl}" style="width:100%;height:100%;object-fit:cover;display:block"/>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;

  window.print();
}

// ─── Window-level drag indicator ─────────────────────────────────────────────
let windowDragActive = false;
let windowDragTimer  = null;

window.addEventListener('dragenter', (e) => {
  if ([...e.dataTransfer.types].includes('Files')) {
    windowDragActive = true;
    document.body.classList.add('window-drag-active');
    clearTimeout(windowDragTimer);
  }
});

window.addEventListener('dragleave', (e) => {
  // Only clear if truly leaving the window
  if (e.clientX === 0 && e.clientY === 0) {
    windowDragActive = false;
    document.body.classList.remove('window-drag-active');
  }
});

window.addEventListener('drop', (e) => {
  e.preventDefault();
  document.body.classList.remove('window-drag-active');
  windowDragActive = false;
});

// ─── Event Wiring ────────────────────────────────────────────────────────────

// Drop zone drag/drop
initDropZone(dropZone, loadImage);

// Window-level drop (when photo already loaded, still allow re-drop)
initWindowDrop(loadImage);

// File picker — wired via <label for="file-input"> in DropZoneHTML()
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) loadImage(file);
  fileInput.value = ''; // reset so same file can be picked again
});

// Clipboard paste (Ctrl+V) — works from anywhere on the page
document.addEventListener('paste', (e) => {
  const file = extractImageFromClipboard(e);
  if (file) {
    // Flash the drop zone to confirm paste received
    if (dropZone.style.display !== 'none') {
      dropZone.classList.add('paste-received');
      setTimeout(() => dropZone.classList.remove('paste-received'), 700);
    }
    loadImage(file);
  }
  // Silent fail — don't toast if user is pasting text elsewhere
});

// Toolbar buttons
btnClear.addEventListener('click', clearPhoto);
btnPrint.addEventListener('click', doPrint);

// Sheet selector
sheetSelect.addEventListener('change', () => {
  state.sheet = sheetSelect.value;
  state.count = null;
  updateCountDisplay();
  if (state.imageDataUrl) renderSheet();
});

// Count controls
btnCountUp.addEventListener('click', () => {
  const max = getMaxFit();
  const current = state.count === null ? max : state.count;
  state.count = current >= max ? null : current + 1; // wrap back to Auto at max
  updateCountDisplay();
  if (state.imageDataUrl) renderSheet();
});

btnCountDn.addEventListener('click', () => {
  const max = getMaxFit();
  const current = state.count === null ? max : state.count;
  state.count = Math.max(current - 1, 1);
  updateCountDisplay();
  if (state.imageDataUrl) renderSheet();
});

// Re-render on window resize
window.addEventListener('resize', () => {
  if (state.imageDataUrl) renderSheet();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
buildSizeGrid();
updateCountDisplay();
renderHistory();
