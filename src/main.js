import './style.css';
import { SIZES, SHEET_SIZES, DEFAULT_SIZE_ID, DEFAULT_SHEET, getSizeById, getSheetById } from './lib/sizes.js';
import { calcTiling, calcComboTiling } from './lib/tiler.js';
import { saveToHistory, generateThumbnail } from './lib/history.js';
import { extractImageFromClipboard, fileToDataUrl, safeFileName, getImageDimensions } from './lib/clipboard.js';
import { toast } from './lib/toast.js';
import { DropZoneHTML, initDropZone, initWindowDrop } from './components/DropZone.js';
import { SizeSelectorHTML, initSizeSelector } from './components/SizeSelector.js';
import { SheetPreviewHTML, renderSheetPreview } from './components/SheetPreview.js';
import { PrintSettingsHTML, initPrintSettings } from './components/PrintSettings.js';
import { ImageAdjustmentsHTML, initImageAdjustments } from './components/ImageAdjustments.js';
import { HistoryPanelHTML, initHistoryPanel } from './components/HistoryPanel.js';
import { ShortcutsModalHTML, initShortcutsModal } from './components/ShortcutsModal.js';
import { executePrint, initPrintShortcut } from './lib/printEngine.js';
import { exportHighResPNG } from './lib/exporter.js';

// ─── State ───────────────────────────────────────────────────────────────────
let state = {
  imageDataUrl: null,
  imageName: 'photo',
  sizeId: DEFAULT_SIZE_ID,
  sheetId: DEFAULT_SHEET,
  count: null, // null = auto max fit
  fitMode: 'cover',
  showCutGuides: true,
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    isBW: false,
    rotation: 0,
  },
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

    <a class="nav-item active" id="nav-photoprint">
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

    <div class="sidebar-footer">v1.1.0 · offline</div>
  </aside>

  <div class="main">
    <div class="toolbar">
      <span class="toolbar-title">Photo Print Sizer</span>

      <button class="btn ghost" id="btn-clear" disabled title="Clear loaded photo (Esc)">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 3l10 10M13 3L3 13"/>
        </svg>
        Clear
      </button>

      <button class="btn ghost" id="btn-shortcuts" title="Keyboard Shortcuts (?)">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="8" cy="8" r="6"/>
          <path d="M6 6.5a2 2 0 0 1 3.5 1.2c0 1-.8 1.5-1.5 1.8V10"/>
          <circle cx="8" cy="12.5" r="0.5" fill="currentColor"/>
        </svg>
        Shortcuts
      </button>

      <div class="toolbar-spacer"></div>

      <button class="btn secondary" id="btn-export-png" disabled title="Download 300 DPI High-Res Sheet PNG">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8 2v8m-3-3l3 3 3-3"/>
          <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
        </svg>
        Export PNG (300 DPI)
      </button>

      <button class="btn primary" id="btn-print" disabled title="Print Sheet (Ctrl+P)">
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

      <aside class="right-panel" id="right-panel">
        <!-- Tabbed Header -->
        <div class="panel-tabs-header" id="panel-tabs-header">
          <button class="panel-main-tab active" data-tab="layout">
            <span>📐</span> Layout
          </button>
          <button class="panel-main-tab" data-tab="adjust">
            <span>🎨</span> Adjust
          </button>
          <button class="panel-main-tab" data-tab="history">
            <span>🕒</span> Recent
          </button>
        </div>

        <!-- Tab Content Panes -->
        <div class="panel-tab-content">
          <!-- ── TAB 1: LAYOUT & SIZES ── -->
          <div class="tab-pane active" id="pane-layout">
            <div class="panel-section">
              <div class="panel-label">Print Size & Combos</div>
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

            <div class="panel-section" id="section-copies">
              <div class="panel-label">Copies</div>
              <div class="count-row">
                <span class="count-label">Per sheet</span>
                <div class="count-controls">
                  <button class="count-btn" id="btn-count-down" title="Decrease copies (−)">−</button>
                  <span class="count-value" id="count-display">Auto</span>
                  <button class="count-btn" id="btn-count-up" title="Increase copies (+)">+</button>
                </div>
              </div>
            </div>

            ${PrintSettingsHTML({ fitMode: state.fitMode, showCutGuides: state.showCutGuides })}
          </div>

          <!-- ── TAB 2: PHOTO ADJUSTMENTS ── -->
          <div class="tab-pane" id="pane-adjust">
            ${ImageAdjustmentsHTML(state.adjustments)}
          </div>

          <!-- ── TAB 3: RECENT HISTORY ── -->
          <div class="tab-pane" id="pane-history">
            ${HistoryPanelHTML()}
          </div>
        </div>
      </aside>
    </div>
  </div>

  ${ShortcutsModalHTML()}
  <div class="print-frame" id="print-frame"></div>
`;

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const dropZone       = document.getElementById('drop-zone');
const fileInput      = document.getElementById('file-input');
const btnPrint       = document.getElementById('btn-print');
const btnExportPng   = document.getElementById('btn-export-png');
const btnClear       = document.getElementById('btn-clear');
const btnShortcuts   = document.getElementById('btn-shortcuts');
const sheetWrap      = document.getElementById('sheet-wrap');
const sheetSelect    = document.getElementById('sheet-select');
const countDisplay   = document.getElementById('count-display');
const btnCountUp     = document.getElementById('btn-count-up');
const btnCountDn     = document.getElementById('btn-count-down');
const sectionCopies  = document.getElementById('section-copies');
const printFrame     = document.getElementById('print-frame');
const canvasArea     = document.getElementById('canvas-area');
const rightPanel     = document.getElementById('right-panel');
const panelTabsHeader = document.getElementById('panel-tabs-header');

// ─── Right Panel Tab Switching ────────────────────────────────────────────────
if (panelTabsHeader) {
  panelTabsHeader.querySelectorAll('.panel-main-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      panelTabsHeader.querySelectorAll('.panel-main-tab').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');

      const targetTab = tabBtn.dataset.tab;
      rightPanel.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `pane-${targetTab}`);
      });
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTiling() {
  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);

  if (sizeObj.isCombo) {
    return calcComboTiling(sizeObj.comboItems, sheetObj.w, sheetObj.h);
  }

  return calcTiling(sizeObj.w, sizeObj.h, sheetObj.w, sheetObj.h, state.count);
}

function updateCountDisplay() {
  const sizeObj = getSizeById(state.sizeId);
  if (sizeObj.isCombo) {
    if (sectionCopies) sectionCopies.style.display = 'none';
    return;
  }
  if (sectionCopies) sectionCopies.style.display = 'block';

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
    adjustments: state.adjustments,
    showCutGuides: state.showCutGuides,
  });

  updateCountDisplay();
}

// ─── Size Selector Initialization ─────────────────────────────────────────────
const sizeSelector = initSizeSelector(rightPanel, (newSizeId) => {
  state.sizeId = newSizeId;
  state.count = null;
  updateCountDisplay();
  if (state.imageDataUrl) updatePreview();
}, state.sizeId);

// ─── Image Adjustments Initialization ─────────────────────────────────────────
initImageAdjustments(rightPanel, (newAdjustments) => {
  state.adjustments = newAdjustments;
  if (state.imageDataUrl) updatePreview();
}, state.adjustments);

// ─── Print Settings Initialization ───────────────────────────────────────────
initPrintSettings(rightPanel, ({ fitMode, showCutGuides }) => {
  if (fitMode !== undefined) state.fitMode = fitMode;
  if (showCutGuides !== undefined) state.showCutGuides = showCutGuides;
  if (state.imageDataUrl) updatePreview();
});

// ─── Shortcuts Modal Initialization ───────────────────────────────────────────
const shortcutsModal = initShortcutsModal(document.body);
if (btnShortcuts) {
  btnShortcuts.addEventListener('click', () => shortcutsModal.open());
}

// ─── History Panel Initialization (with One-Click Restore) ────────────────────
const historyPanel = initHistoryPanel(rightPanel, (historyItem) => {
  state.imageDataUrl = historyItem.dataUrl;
  state.imageName    = historyItem.name;
  state.count        = null;

  if (historyItem.sizeId && getSizeById(historyItem.sizeId)) {
    state.sizeId = historyItem.sizeId;
    sizeSelector.setSelected(historyItem.sizeId);
  }

  dropZone.style.display = 'none';
  sheetWrap.classList.add('visible');
  btnPrint.disabled = false;
  btnExportPng.disabled = false;
  btnClear.disabled = false;

  updatePreview();
  toast(`Restored: ${historyItem.name}`, 'success');
});

// ─── Load Image ───────────────────────────────────────────────────────────────
async function loadImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    toast('Please use an image file (JPG, PNG, WEBP…)', 'error');
    return;
  }

  try {
    const dataUrl = await fileToDataUrl(file);
    const name    = safeFileName(file);
    const dimensions = await getImageDimensions(dataUrl);
    const thumbUrl = await generateThumbnail(dataUrl, 120);

    state.imageDataUrl = dataUrl;
    state.imageName    = name;
    state.count        = null;

    dropZone.style.display = 'none';
    sheetWrap.classList.add('visible');
    btnPrint.disabled = false;
    btnExportPng.disabled = false;
    btnClear.disabled = false;

    updatePreview();
    toast(`Loaded: ${name} (${dimensions.width}×${dimensions.height})`, 'success');

    saveToHistory({
      id: Date.now().toString(),
      name,
      dataUrl,
      thumbUrl,
      sizeId: state.sizeId,
      sheetId: state.sheetId,
      dimensions,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    historyPanel.refresh();
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
  btnExportPng.disabled = true;
  btnClear.disabled = true;
  updateCountDisplay();
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
    adjustments: state.adjustments,
  });
}

// ─── Trigger Export PNG ───────────────────────────────────────────────────────
function handleExportPNG() {
  if (!state.imageDataUrl) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);
  const tiling   = getTiling();

  exportHighResPNG({
    sheetObj,
    sizeObj,
    tilingResult: tiling,
    imageDataUrl: state.imageDataUrl,
    fitMode: state.fitMode,
    showCutGuides: state.showCutGuides,
    adjustments: state.adjustments,
  });
}

// ─── Event Wiring & Keyboard Navigation ──────────────────────────────────────
initDropZone(dropZone, loadImage);
initWindowDrop(loadImage);
initPrintShortcut(handlePrint);

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) loadImage(file);
  fileInput.value = '';
});

// Global Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

  if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
    e.preventDefault();
    fileInput.click();
    return;
  }

  if (e.key === 'Escape') {
    shortcutsModal.close();
    if (state.imageDataUrl) clearPhoto();
    return;
  }

  if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    e.preventDefault();
    shortcutsModal.toggle();
    return;
  }

  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    btnCountUp.click();
    return;
  }

  if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    btnCountDn.click();
    return;
  }
});

// Clipboard Paste
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
btnExportPng.addEventListener('click', handleExportPNG);

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
