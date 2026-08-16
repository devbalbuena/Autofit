import './style.css';
import { SIZES, SHEET_SIZES, DEFAULT_SIZE_ID, DEFAULT_SHEET, getSizeById } from './lib/sizes.js';
import { calcTiling, inToPx, fitScale } from './lib/tiler.js';
import { loadHistory, saveToHistory, removeFromHistory } from './lib/history.js';
import { extractImageFromClipboard, extractImageFromDrop, fileToDataUrl } from './lib/clipboard.js';
import { toast } from './lib/toast.js';

// ─── State ───────────────────────────────────────────────────────────────
let state = {
  imageDataUrl: null,
  imageName: 'photo',
  sizeId: DEFAULT_SIZE_ID,
  sheet: DEFAULT_SHEET,
  count: null, // null = auto-fill
};

// ─── Render App Shell ─────────────────────────────────────────────────────
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

    <a class="nav-item active" id="nav-photoprint">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="2" width="12" height="12" rx="1"/>
        <path d="M2 11l3-3 2 2 4-5 3 4"/>
      </svg>
      Photo Print
    </a>

    <a class="nav-item" href="#" id="nav-coming1" style="opacity:0.4;pointer-events:none">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="1" y="3" width="6" height="10" rx="1"/>
        <rect x="9" y="3" width="6" height="10" rx="1"/>
      </svg>
      ID Copy
      <span style="margin-left:auto;font-size:9px;font-family:var(--font-mono);opacity:0.5">SOON</span>
    </a>

    <a class="nav-item" href="#" style="opacity:0.4;pointer-events:none">
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
        <!-- Drop Zone -->
        <div class="drop-zone fade-in" id="drop-zone">
          <div class="drop-zone-icon">📸</div>
          <div class="drop-zone-title">Drop your photo here</div>
          <div class="drop-zone-sub">
            Press <kbd>Ctrl+V</kbd> to paste from clipboard<br/>or drag a photo from anywhere
          </div>
          <div class="drop-zone-divider">or</div>
          <button class="btn primary" id="btn-browse" type="button">Browse Files</button>
          <input type="file" id="file-input" accept="image/*" />
        </div>

        <!-- Sheet Preview (hidden until photo loaded) -->
        <div class="sheet-wrap" id="sheet-wrap">
          <div class="sheet" id="sheet">
            <div class="sheet-grid" id="sheet-grid"></div>
          </div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-dim);text-align:center" id="sheet-info"></div>
        </div>
      </div>

      <!-- Right Panel -->
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

        <div class="panel-section" style="flex:1;overflow:hidden;display:flex;flex-direction:column;padding-bottom:0">
          <div class="panel-label">Recent Photos</div>
          <div class="history-list" id="history-list"></div>
        </div>
      </aside>
    </div>
  </div>

  <!-- Hidden print frame -->
  <div class="print-frame" id="print-frame"></div>
`;

// ─── DOM Refs ──────────────────────────────────────────────────────────────
const dropZone    = document.getElementById('drop-zone');
const fileInput   = document.getElementById('file-input');
const btnBrowse   = document.getElementById('btn-browse');
const btnPrint    = document.getElementById('btn-print');
const btnClear    = document.getElementById('btn-clear');
const sheetWrap   = document.getElementById('sheet-wrap');
const sheet       = document.getElementById('sheet');
const sheetGrid   = document.getElementById('sheet-grid');
const sheetInfo   = document.getElementById('sheet-info');
const sizeGrid    = document.getElementById('size-grid');
const sheetSelect = document.getElementById('sheet-select');
const countDisplay = document.getElementById('count-display');
const btnCountUp  = document.getElementById('btn-count-up');
const btnCountDn  = document.getElementById('btn-count-down');
const historyList = document.getElementById('history-list');
const printFrame  = document.getElementById('print-frame');
const canvasArea  = document.getElementById('canvas-area');

// ─── Build Size Grid ───────────────────────────────────────────────────────
function buildSizeGrid() {
  sizeGrid.innerHTML = SIZES.map(s => {
    const aspect = s.w / s.h;
    const previewH = 32;
    const previewW = Math.round(previewH * aspect);
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
      state.count = null;
      buildSizeGrid();
      renderSheet();
    });
  });
}

// ─── Render Sheet Preview ──────────────────────────────────────────────────
function renderSheet() {
  if (!state.imageDataUrl) return;

  const size  = getSizeById(state.sizeId);
  const sheet_ = SHEET_SIZES[state.sheet];

  const { cols, rows, total, maxFit } = calcTiling(
    size.w, size.h, sheet_.w, sheet_.h, state.count
  );

  if (state.count === null) state.count = maxFit;

  // Compute scale so sheet fits in canvas area
  const cw = canvasArea.clientWidth  || 800;
  const ch = canvasArea.clientHeight || 600;
  const scale = fitScale(sheet_.w, sheet_.h, cw, ch, 80);

  const sheetPxW = Math.round(sheet_.w * 96 * scale);
  const sheetPxH = Math.round(sheet_.h * 96 * scale);
  const cellW    = Math.round(size.w   * 96 * scale);
  const cellH    = Math.round(size.h   * 96 * scale);

  sheet.style.width  = sheetPxW + 'px';
  sheet.style.height = sheetPxH + 'px';

  sheetGrid.style.gridTemplateColumns = `repeat(${cols}, ${cellW}px)`;
  sheetGrid.style.gridTemplateRows    = `repeat(${rows}, ${cellH}px)`;
  sheetGrid.style.width  = (cols * cellW) + 'px';
  sheetGrid.style.height = (rows * cellH) + 'px';
  // Center the grid within the sheet
  sheetGrid.style.position = 'absolute';
  sheetGrid.style.top  = Math.round((sheetPxH - rows * cellH) / 2) + 'px';
  sheetGrid.style.left = Math.round((sheetPxW - cols * cellW) / 2) + 'px';

  const usedCount = Math.min(state.count, total);
  sheetGrid.innerHTML = Array.from({ length: rows * cols }, (_, i) => {
    const hasPhoto = i < usedCount;
    return `<div class="sheet-cell" style="width:${cellW}px;height:${cellH}px">
      ${hasPhoto ? `<img src="${state.imageDataUrl}" alt="photo" />` : ''}
    </div>`;
  }).join('');

  sheetInfo.textContent = `${cols} × ${rows} grid · ${usedCount} copies · ${size.name} on ${sheet_.name}`;
  countDisplay.textContent = state.count === maxFit ? 'Auto' : state.count;
}

// ─── Load Image ────────────────────────────────────────────────────────────
async function loadImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    toast('Please use an image file (JPG, PNG, etc.)', 'error');
    return;
  }
  const dataUrl = await fileToDataUrl(file);
  state.imageDataUrl = dataUrl;
  state.imageName    = file.name ?? 'photo';
  state.count        = null;

  dropZone.style.display = 'none';
  sheetWrap.classList.add('visible');
  btnPrint.disabled = false;
  btnClear.disabled = false;

  renderSheet();
  toast(`Loaded: ${state.imageName}`, 'success');

  // Save to history
  const entry = {
    id: Date.now().toString(),
    name: state.imageName,
    dataUrl,
    savedAt: new Date().toLocaleString(),
  };
  saveToHistory(entry);
  renderHistory();
}

// ─── Clear ──────────────────────────────────────────────────────────────────
function clearPhoto() {
  state.imageDataUrl = null;
  state.count = null;
  dropZone.style.display = '';
  sheetWrap.classList.remove('visible');
  btnPrint.disabled = true;
  btnClear.disabled = true;
}

// ─── History ────────────────────────────────────────────────────────────────
function renderHistory() {
  const items = loadHistory();
  if (items.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No recent photos yet.<br/>Load a photo to get started.</div>';
    return;
  }
  historyList.innerHTML = items.map(item => `
    <div class="history-item fade-in" data-id="${item.id}">
      <img class="history-thumb" src="${item.dataUrl}" alt="${item.name}" />
      <div class="history-info">
        <div class="history-name">${item.name}</div>
        <div class="history-date">${item.savedAt}</div>
      </div>
    </div>
  `).join('');

  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = items.find(i => i.id === el.dataset.id);
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

// ─── Print ─────────────────────────────────────────────────────────────────
function doPrint() {
  const size   = getSizeById(state.sizeId);
  const sheet_ = SHEET_SIZES[state.sheet];
  const { cols, rows } = calcTiling(size.w, size.h, sheet_.w, sheet_.h, state.count);
  const usedCount = Math.min(state.count ?? (cols * rows), cols * rows);

  // Build a print-accurate grid using real inch sizes
  printFrame.innerHTML = `
    <div style="
      width: ${sheet_.w}in;
      height: ${sheet_.h}in;
      position: relative;
      overflow: hidden;
      margin: 0;
      padding: 0;
    ">
      <div style="
        display: grid;
        grid-template-columns: repeat(${cols}, ${size.w}in);
        grid-template-rows: repeat(${rows}, ${size.h}in);
        position: absolute;
        top: ${(sheet_.h - rows * size.h) / 2}in;
        left: ${(sheet_.w - cols * size.w) / 2}in;
      ">
        ${Array.from({ length: cols * rows }, (_, i) => {
          const has = i < usedCount;
          return `<div style="width:${size.w}in;height:${size.h}in;overflow:hidden;border:0.25pt solid rgba(0,0,0,0.12)">
            ${has ? `<img src="${state.imageDataUrl}" style="width:100%;height:100%;object-fit:cover;display:block"/>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  window.print();
}

// ─── Event Wiring ──────────────────────────────────────────────────────────

// File picker
btnBrowse.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadImage(fileInput.files[0]);
  fileInput.value = '';
});

// Drag & Drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = extractImageFromDrop(e);
  if (file) loadImage(file);
  else toast('No image found in the drop', 'error');
});

// Also allow drop anywhere on the canvas when photo is loaded
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = extractImageFromDrop(e);
  if (file) loadImage(file);
});

// Clipboard Paste (Ctrl+V)
document.addEventListener('paste', (e) => {
  const file = extractImageFromClipboard(e);
  if (file) {
    loadImage(file);
  } else {
    toast('No image in clipboard. Try copying an image first.', 'error');
  }
});

// Buttons
btnClear.addEventListener('click', clearPhoto);
btnPrint.addEventListener('click', doPrint);

// Sheet selector
sheetSelect.addEventListener('change', () => {
  state.sheet = sheetSelect.value;
  state.count = null;
  renderSheet();
});

// Count controls
btnCountUp.addEventListener('click', () => {
  const size   = getSizeById(state.sizeId);
  const sheet_ = SHEET_SIZES[state.sheet];
  const { maxFit } = calcTiling(size.w, size.h, sheet_.w, sheet_.h);
  state.count = Math.min((state.count ?? maxFit) + 1, maxFit);
  renderSheet();
});
btnCountDn.addEventListener('click', () => {
  state.count = Math.max((state.count ?? 1) - 1, 1);
  renderSheet();
});

// Re-render on resize
window.addEventListener('resize', () => { if (state.imageDataUrl) renderSheet(); });

// ─── Init ──────────────────────────────────────────────────────────────────
buildSizeGrid();
renderHistory();
