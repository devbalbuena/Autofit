import './style.css';
import { SIZES, SHEET_SIZES, DEFAULT_SIZE_ID, DEFAULT_SHEET, getSizeById, getSheetById } from './lib/sizes.js';
import { calcTiling } from './lib/tiler.js';
import { loadHistory, saveToHistory } from './lib/history.js';
import { extractImageFromClipboard, fileToDataUrl, safeFileName } from './lib/clipboard.js';
import { toast } from './lib/toast.js';
import { DropZoneHTML, initDropZone, initWindowDrop } from './components/DropZone.js';
import { SizeSelectorHTML, initSizeSelector } from './components/SizeSelector.js';
import { SheetPreviewHTML, renderSheetPreview } from './components/SheetPreview.js';
import { executePrint, initPrintShortcut } from './lib/printEngine.js';

// ─── State ───────────────────────────────────────────────────────────────────
let state = {
  imageDataUrl: null,
  imageName: 'photo',
  sizeId: DEFAULT_SIZE_ID,
  sheetId: DEFAULT_SHEET,
  count: null, // null = auto max fit
  fitMode: 'cover',
  showCutGuides: true,
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
      <button class="btn primary" id="btn-print" disabled title="Print (Ctrl+P)">
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
        ${SheetPreviewHTML()}
      </div>

      <aside class="right-panel">
        <div class="panel-section">
          <div class="panel-label">Print Size</div>
          ${SizeSelectorHTML()}
        </div>

        <div class="panel-section">
          <div class="panel-label">Sheet</div>
          <select class="sheet-select" id="sheet-select">
            ${Object.values(SHEET_SIZES).map(s => `
              <option value="${s.id}" ${s.id === state.sheetId ? 'selected' : ''}>${s.label}</option>
            `).join('')}
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
const sheetSelect  = document.getElementById('sheet-select');
const countDisplay = document.getElementById('count-display');
const btnCountUp   = document.getElementById('btn-count-up');
const btnCountDn   = document.getElementById('btn-count-down');
const historyList  = document.getElementById('history-list');
const printFrame   = document.getElementById('print-frame');
const canvasArea   = document.getElementById('canvas-area');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTiling() {
  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);
  return calcTiling(sizeObj.w, sizeObj.h, sheetObj.w, sheetObj.h, state.count);
}

function updateCountDisplay() {
  const tiling = getTiling();
  if (state.count === null || state.count >= tiling.maxFit) {
    state.count = null;
    countDisplay.textContent = 'Auto';
  } else {
    countDisplay.textContent = state.count;
  }
}

// ─── Sheet Preview ────────────────────────────────────────────────────────────
function updatePreview() {
  if (!state.imageDataUrl) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);
  const tiling   = getTiling();

  renderSheetPreview({
    containerEl: sheetWrap,
    sheetObj,
    sizeObj,
    tilingResult: tiling,
    imageDataUrl: state.imageDataUrl,
    fitMode: state.fitMode,
  });

  updateCountDisplay();
}

// ─── Size Selector Initialization ─────────────────────────────────────────────
initSizeSelector(document.querySelector('.right-panel'), (newSizeId) => {
  state.sizeId = newSizeId;
  state.count = null;
  updateCountDisplay();
  if (state.imageDataUrl) updatePreview();
}, state.sizeId);

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

    dropZone.style.display = 'none';
    sheetWrap.classList.add('visible');
    btnPrint.disabled = false;
    btnClear.disabled = false;

    updatePreview();
    toast(`Loaded: ${name}`, 'success');

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
      updatePreview();
      toast(`Restored: ${item.name}`, 'success');
    });
  });
}

// ─── Trigger Print ────────────────────────────────────────────────────────────
function handlePrint() {
  if (!state.imageDataUrl) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);
  const tiling   = getTiling();

  executePrint({
    printFrameEl: printFrame,
    sheetObj,
    tiling,
    imageDataUrl: state.imageDataUrl,
    fitMode: state.fitMode,
    showCutGuides: state.showCutGuides,
  });
}

// ─── Event Wiring ────────────────────────────────────────────────────────────
initDropZone(dropZone, loadImage);
initWindowDrop(loadImage);
initPrintShortcut(handlePrint);

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) loadImage(file);
  fileInput.value = '';
});

document.addEventListener('paste', (e) => {
  const file = extractImageFromClipboard(e);
  if (file) {
    if (dropZone.style.display !== 'none') {
      dropZone.classList.add('paste-received');
      setTimeout(() => dropZone.classList.remove('paste-received'), 700);
    }
    loadImage(file);
  }
});

btnClear.addEventListener('click', clearPhoto);
btnPrint.addEventListener('click', handlePrint);

sheetSelect.addEventListener('change', () => {
  state.sheetId = sheetSelect.value;
  state.count = null;
  updateCountDisplay();
  if (state.imageDataUrl) updatePreview();
});

btnCountUp.addEventListener('click', () => {
  const tiling = getTiling();
  const current = state.count === null ? tiling.maxFit : state.count;
  state.count = current >= tiling.maxFit ? null : current + 1;
  updateCountDisplay();
  if (state.imageDataUrl) updatePreview();
});

btnCountDn.addEventListener('click', () => {
  const tiling = getTiling();
  const current = state.count === null ? tiling.maxFit : state.count;
  state.count = Math.max(current - 1, 1);
  updateCountDisplay();
  if (state.imageDataUrl) updatePreview();
});

window.addEventListener('resize', () => {
  if (state.imageDataUrl) updatePreview();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
updateCountDisplay();
renderHistory();
