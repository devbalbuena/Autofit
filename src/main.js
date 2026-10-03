import './style.css';
import {
  DEFAULT_SIZE_ID,
  DEFAULT_SHEET,
  SHEET_SIZES,
  getSizeById,
  getSheetById,
  SIZE_CATEGORIES
} from './lib/sizes.js';
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
import { exportHighResPNG, exportHighResPDF } from './lib/exporter.js';

// Default Adjustments Template
function createDefaultAdjustments() {
  return {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    isBW: false,
    rotation: 0,
    flipH: false,
    flipV: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    bgPreset: 'none',
    showOval: false,
    nameTag: {
      enabled: false,
      text: '',
      sub: '',
    },
  };
}

// ─── State ───────────────────────────────────────────────────────────────────
let state = {
  photos: [], // Array of { id, dataUrl, thumbUrl, name, dimensions, adjustments }
  activePhotoIndex: 0,
  sizeId: DEFAULT_SIZE_ID,
  sheetId: DEFAULT_SHEET,
  count: null, // null = auto max fit
  fitMode: 'cover',
  guideType: 'corners', // 'corners' | 'border' | 'none'
  margin: 0.20, // inches
  gap: 0.05, // inches
  distributeMode: 'repeat', // 'repeat' | 'distribute'
  zoomFactor: 1.0, // Canvas view zoom
};

// ─── App Shell HTML ───────────────────────────────────────────────────────────
document.getElementById('app').innerHTML = `
  <!-- Left Pro Icon Dock -->
  <aside class="pro-dock">
    <div class="dock-brand" title="AutoFit Studio Pro">🖨️</div>

    <nav class="dock-nav">
      <button class="dock-btn active" id="dock-nav-photoprint" title="Photo Print Workspace">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="2" y="2" width="16" height="16" rx="2"/>
          <path d="M2 13l4-4 3 3 5-6 4 5"/>
        </svg>
      </button>

      <button class="dock-btn" id="dock-nav-idstudio" title="ID & Passport Studio">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="2" y="2" width="16" height="16" rx="3"/>
          <circle cx="10" cy="7.5" r="3"/>
          <path d="M4 17c0-2.8 2.7-4.5 6-4.5s6 1.7 6 4.5"/>
        </svg>
      </button>

      <button class="dock-btn" id="dock-nav-customsizer" title="Custom Sizer (mm / cm / in)">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M3 17L17 3M8 3h9v9M12 17H3V8"/>
        </svg>
      </button>
    </nav>

    <div class="dock-spacer"></div>

    <button class="dock-btn" id="dock-btn-shortcuts" title="Shortcuts & Calibration Guide (?)">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="10" cy="10" r="8"/>
        <path d="M7.5 8a2.5 2.5 0 0 1 4.5 1.5c0 1.2-1 1.8-2 2.2V13"/>
        <circle cx="10" cy="15.5" r="0.6" fill="currentColor"/>
      </svg>
    </button>

    <div class="dock-footer">AUTOFIT</div>
  </aside>

  <!-- Main Center Shell -->
  <div class="main">
    <header class="topbar">
      <div class="topbar-breadcrumb">
        <span class="breadcrumb-brand">AutoFit</span>
        <span class="breadcrumb-divider">/</span>
        <span class="breadcrumb-current" id="page-title">Photo Print Sizer</span>
      </div>

      <div class="status-badge" id="photo-status-badge">
        <span class="status-badge-dot"></span>
        <span id="photo-status-text">Ready</span>
      </div>

      <div class="topbar-spacer"></div>

      <div class="topbar-actions">
        <button class="btn ghost" id="btn-clear" disabled title="Clear loaded photos (Esc)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 3l10 10M13 3L3 13"/>
          </svg>
          Clear
        </button>

        <button class="btn secondary" id="btn-export-pdf" disabled title="Export 300 DPI Print-Ready PDF">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/>
            <path d="M9 2v4h4M5 8h6M5 11h4"/>
          </svg>
          Export PDF
        </button>

        <button class="btn secondary" id="btn-export-png" disabled title="Download 300 DPI High-Res Sheet PNG">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M8 2v8m-3-3l3 3 3-3"/>
            <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
          </svg>
          Export PNG
        </button>

        <button class="btn primary" id="btn-print" disabled title="Print Sheet (Ctrl+P)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 6V2h8v4"/>
            <rect x="2" y="6" width="12" height="6" rx="1"/>
            <path d="M4 10v4h8v-4"/>
          </svg>
          Print Sheet
        </button>
      </div>
    </header>

    <div class="workspace">
      <!-- Interactive Studio Canvas -->
      <div class="canvas-area" id="canvas-area">
        ${DropZoneHTML()}
        ${SheetPreviewHTML()}
      </div>

      <!-- Right Inspector Panel -->
      <aside class="inspector" id="right-panel">
        <div class="panel-tabs-header" id="panel-tabs-header">
          <button class="panel-main-tab active" data-tab="layout">
            <span>📐</span> Layout
          </button>
          <button class="panel-main-tab" data-tab="adjust">
            <span>🎨</span> Adjust & ID
          </button>
          <button class="panel-main-tab" data-tab="history">
            <span>🕒</span> Recent
          </button>
        </div>

        <div class="panel-tab-content">
          <!-- ── TAB 1: LAYOUT & SIZES ── -->
          <div class="tab-pane active" id="pane-layout">
            <div class="panel-section">
              <div class="panel-label">Print Size & Combos</div>
              ${SizeSelectorHTML()}
            </div>

            <div class="panel-section">
              <div class="panel-label">Sheet Paper</div>
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

            ${PrintSettingsHTML({
              fitMode: state.fitMode,
              guideType: state.guideType,
              margin: state.margin,
              gap: state.gap,
              distributeMode: state.distributeMode,
              photoCount: state.photos.length,
            })}
          </div>

          <!-- ── TAB 2: PHOTO ADJUSTMENTS & ID STUDIO ── -->
          <div class="tab-pane" id="pane-adjust">
            ${ImageAdjustmentsHTML(createDefaultAdjustments())}
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

// ─── DOM References ───────────────────────────────────────────────────────────
const dropZone        = document.getElementById('drop-zone');
const fileInput       = document.getElementById('file-input');
const btnPrint        = document.getElementById('btn-print');
const btnExportPng    = document.getElementById('btn-export-png');
const btnExportPdf    = document.getElementById('btn-export-pdf');
const btnClear        = document.getElementById('btn-clear');
const sheetWrap       = document.getElementById('sheet-wrap');
const sheetSelect     = document.getElementById('sheet-select');
const countDisplay    = document.getElementById('count-display');
const btnCountUp      = document.getElementById('btn-count-up');
const btnCountDn      = document.getElementById('btn-count-down');
const sectionCopies   = document.getElementById('section-copies');
const printFrame      = document.getElementById('print-frame');
const rightPanel      = document.getElementById('right-panel');
const panelTabsHeader = document.getElementById('panel-tabs-header');
const pageTitle       = document.getElementById('page-title');
const photoStatusText = document.getElementById('photo-status-text');

// Dock Nav Buttons
const dockNavPhotoPrint  = document.getElementById('dock-nav-photoprint');
const dockNavIdStudio    = document.getElementById('dock-nav-idstudio');
const dockNavCustomSizer = document.getElementById('dock-nav-customsizer');
const dockBtnShortcuts   = document.getElementById('dock-btn-shortcuts');

// Floating Canvas Zoom Controls
const btnZoomIn   = document.getElementById('btn-zoom-in');
const btnZoomOut  = document.getElementById('btn-zoom-out');
const btnZoomFit  = document.getElementById('btn-zoom-fit');

// ─── Tab Switching ────────────────────────────────────────────────────────────
function switchRightPanelTab(tabName) {
  if (!panelTabsHeader) return;
  panelTabsHeader.querySelectorAll('.panel-main-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  rightPanel.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `pane-${tabName}`);
  });
}

if (panelTabsHeader) {
  panelTabsHeader.querySelectorAll('.panel-main-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => switchRightPanelTab(tabBtn.dataset.tab));
  });
}

// ─── Tiling Calculator ────────────────────────────────────────────────────────
function getTiling() {
  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);

  if (sizeObj.isCombo) {
    return calcComboTiling(sizeObj.comboItems, sheetObj.w, sheetObj.h, {
      margin: state.margin,
      gap: state.gap,
    });
  }

  return calcTiling(sizeObj.w, sizeObj.h, sheetObj.w, sheetObj.h, state.count, {
    margin: state.margin,
    gap: state.gap,
  });
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

// ─── Live Sheet Preview ───────────────────────────────────────────────────────
function updatePreview() {
  if (state.photos.length === 0) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);
  const tiling   = getTiling();

  renderSheetPreview({
    containerEl: sheetWrap,
    sheetObj,
    sizeObj,
    tilingResult: tiling,
    photos: state.photos,
    activePhotoIndex: state.activePhotoIndex,
    fitMode: state.fitMode,
    guideType: state.guideType,
    distributeMode: state.distributeMode,
    zoomFactor: state.zoomFactor,
  });

  updateCountDisplay();
  wireQueueEvents();

  if (photoStatusText) {
    photoStatusText.textContent = state.photos.length === 1
      ? `${state.photos[0].dimensions.width}×${state.photos[0].dimensions.height}`
      : `${state.photos.length} Photos in Queue`;
  }
}

// Wire Multi-photo Queue Events
function wireQueueEvents() {
  const queueItems = sheetWrap.querySelectorAll('.queue-item');
  queueItems.forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.btn-queue-remove')) return;
      const idx = parseInt(el.dataset.idx, 10);
      setActivePhoto(idx);
    });
  });

  const removeBtns = sheetWrap.querySelectorAll('.btn-queue-remove');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.removeIdx, 10);
      removePhotoFromQueue(idx);
    });
  });

  const btnAddMore = sheetWrap.querySelector('#btn-add-more-photos');
  if (btnAddMore) {
    btnAddMore.onclick = () => fileInput.click();
  }
}

function setActivePhoto(index) {
  if (index < 0 || index >= state.photos.length) return;
  state.activePhotoIndex = index;
  const activePhoto = state.photos[index];

  // Sync adjustments panel to this photo's adjustments
  imageAdjustmentsController.updateState(activePhoto.adjustments);
  updatePreview();
}

function removePhotoFromQueue(index) {
  state.photos.splice(index, 1);
  if (state.photos.length === 0) {
    clearPhotos();
    return;
  }
  if (state.activePhotoIndex >= state.photos.length) {
    state.activePhotoIndex = state.photos.length - 1;
  }
  printSettingsController.updatePhotoCount(state.photos.length);
  setActivePhoto(state.activePhotoIndex);
  toast('Photo removed from sheet', 'info');
}

// ─── Floating Zoom Controls Wiring ────────────────────────────────────────────
if (btnZoomIn) {
  btnZoomIn.addEventListener('click', () => {
    state.zoomFactor = Math.min(2.5, state.zoomFactor + 0.15);
    updatePreview();
  });
}
if (btnZoomOut) {
  btnZoomOut.addEventListener('click', () => {
    state.zoomFactor = Math.max(0.4, state.zoomFactor - 0.15);
    updatePreview();
  });
}
if (btnZoomFit) {
  btnZoomFit.addEventListener('click', () => {
    state.zoomFactor = 1.0;
    updatePreview();
  });
}

// ─── Size Selector Initialization ─────────────────────────────────────────────
const sizeSelector = initSizeSelector(rightPanel, (newSizeId) => {
  state.sizeId = newSizeId;
  state.count = null;
  updateCountDisplay();
  if (state.photos.length > 0) updatePreview();
}, state.sizeId);

// ─── Image Adjustments Initialization ─────────────────────────────────────────
const imageAdjustmentsController = initImageAdjustments(rightPanel, (newAdjustments) => {
  if (state.photos[state.activePhotoIndex]) {
    state.photos[state.activePhotoIndex].adjustments = newAdjustments;
  }
  if (state.photos.length > 0) updatePreview();
}, createDefaultAdjustments());

// ─── Print Settings Initialization ───────────────────────────────────────────
const printSettingsController = initPrintSettings(rightPanel, (settings) => {
  if (settings.fitMode !== undefined) state.fitMode = settings.fitMode;
  if (settings.guideType !== undefined) state.guideType = settings.guideType;
  if (settings.margin !== undefined) state.margin = settings.margin;
  if (settings.gap !== undefined) state.gap = settings.gap;
  if (settings.distributeMode !== undefined) state.distributeMode = settings.distributeMode;

  if (state.photos.length > 0) updatePreview();
}, {
  fitMode: state.fitMode,
  guideType: state.guideType,
  margin: state.margin,
  gap: state.gap,
  distributeMode: state.distributeMode,
});

// ─── Shortcuts Modal Initialization ───────────────────────────────────────────
const shortcutsModal = initShortcutsModal(document.body);
if (dockBtnShortcuts) {
  dockBtnShortcuts.addEventListener('click', () => shortcutsModal.open());
}

// ─── History Panel Initialization ─────────────────────────────────────────────
const historyPanel = initHistoryPanel(rightPanel, (historyItem) => {
  loadSinglePhotoFromData({
    dataUrl: historyItem.dataUrl,
    name: historyItem.name,
    dimensions: historyItem.dimensions,
    thumbUrl: historyItem.thumbUrl,
    sizeId: historyItem.sizeId,
  });
  toast(`Restored: ${historyItem.name}`, 'success');
});

// ─── Load Photos ──────────────────────────────────────────────────────────────
async function loadFiles(fileList) {
  const imageFiles = Array.from(fileList).filter(f => f.type && f.type.startsWith('image/'));
  if (imageFiles.length === 0) {
    toast('Please choose image files (JPG, PNG, WEBP…)', 'error');
    return;
  }

  for (const file of imageFiles) {
    try {
      const dataUrl    = await fileToDataUrl(file);
      const name       = safeFileName(file);
      const dimensions = await getImageDimensions(dataUrl);
      const thumbUrl   = await generateThumbnail(dataUrl, 120);

      const newPhoto = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        dataUrl,
        thumbUrl,
        name,
        dimensions,
        adjustments: createDefaultAdjustments(),
      };

      state.photos.push(newPhoto);

      saveToHistory({
        id: newPhoto.id,
        name,
        dataUrl,
        thumbUrl,
        sizeId: state.sizeId,
        sheetId: state.sheetId,
        dimensions,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      console.error(err);
      toast(`Error loading ${file.name}: ${err.message}`, 'error');
    }
  }

  state.activePhotoIndex = state.photos.length - 1;
  dropZone.style.display = 'none';
  sheetWrap.classList.add('visible');
  btnPrint.disabled = false;
  btnExportPng.disabled = false;
  btnExportPdf.disabled = false;
  btnClear.disabled = false;

  printSettingsController.updatePhotoCount(state.photos.length);
  setActivePhoto(state.activePhotoIndex);
  historyPanel.refresh();
  toast(`Loaded ${imageFiles.length} photo${imageFiles.length > 1 ? 's' : ''}`, 'success');
}

function loadSinglePhotoFromData({ dataUrl, name, dimensions, thumbUrl, sizeId }) {
  state.photos = [{
    id: Date.now().toString(),
    dataUrl,
    thumbUrl: thumbUrl || dataUrl,
    name: name || 'photo',
    dimensions: dimensions || { width: 0, height: 0 },
    adjustments: createDefaultAdjustments(),
  }];
  state.activePhotoIndex = 0;

  if (sizeId && getSizeById(sizeId)) {
    state.sizeId = sizeId;
    sizeSelector.setSelected(sizeId);
  }

  dropZone.style.display = 'none';
  sheetWrap.classList.add('visible');
  btnPrint.disabled = false;
  btnExportPng.disabled = false;
  btnExportPdf.disabled = false;
  btnClear.disabled = false;

  printSettingsController.updatePhotoCount(state.photos.length);
  setActivePhoto(0);
}

// ─── Clear Photos ─────────────────────────────────────────────────────────────
function clearPhotos() {
  state.photos = [];
  state.activePhotoIndex = 0;
  state.count = null;
  state.zoomFactor = 1.0;

  dropZone.style.display = '';
  sheetWrap.classList.remove('visible');
  btnPrint.disabled = true;
  btnExportPng.disabled = true;
  btnExportPdf.disabled = true;
  btnClear.disabled = true;
  if (photoStatusText) photoStatusText.textContent = 'Ready';
  printSettingsController.updatePhotoCount(0);
  updateCountDisplay();
}

// ─── Print & Export Handlers ──────────────────────────────────────────────────
function handlePrint() {
  if (state.photos.length === 0) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);
  const tiling   = getTiling();

  toast('Opening print dialog — remember to set Margins: None & Scale: 100%', 'info', 4000);

  executePrint({
    printFrameEl: printFrame,
    sheetObj,
    tiling,
    photos: state.photos,
    activePhotoIndex: state.activePhotoIndex,
    fitMode: state.fitMode,
    guideType: state.guideType,
    distributeMode: state.distributeMode,
  });
}

function handleExportPNG() {
  if (state.photos.length === 0) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);
  const tiling   = getTiling();

  exportHighResPNG({
    sheetObj,
    sizeObj,
    tilingResult: tiling,
    photos: state.photos,
    activePhotoIndex: state.activePhotoIndex,
    fitMode: state.fitMode,
    guideType: state.guideType,
    distributeMode: state.distributeMode,
  });
}

function handleExportPDF() {
  if (state.photos.length === 0) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetById(state.sheetId);
  const tiling   = getTiling();

  exportHighResPDF({
    sheetObj,
    sizeObj,
    tilingResult: tiling,
    photos: state.photos,
    activePhotoIndex: state.activePhotoIndex,
    fitMode: state.fitMode,
    guideType: state.guideType,
    distributeMode: state.distributeMode,
  });
}

// ─── Pro Dock Navigation Wiring ───────────────────────────────────────────────
if (dockNavPhotoPrint) {
  dockNavPhotoPrint.addEventListener('click', () => {
    dockNavPhotoPrint.classList.add('active');
    dockNavIdStudio?.classList.remove('active');
    dockNavCustomSizer?.classList.remove('active');
    pageTitle.textContent = 'Photo Print Sizer';
    sizeSelector.setSelected('4r');
    switchRightPanelTab('layout');
  });
}

if (dockNavIdStudio) {
  dockNavIdStudio.addEventListener('click', () => {
    dockNavIdStudio.classList.add('active');
    dockNavPhotoPrint?.classList.remove('active');
    dockNavCustomSizer?.classList.remove('active');
    pageTitle.textContent = 'ID & Passport Studio';
    sizeSelector.setSelected('combo_4x2_8x1');
    switchRightPanelTab('adjust');
  });
}

if (dockNavCustomSizer) {
  dockNavCustomSizer.addEventListener('click', () => {
    dockNavCustomSizer.classList.add('active');
    dockNavPhotoPrint?.classList.remove('active');
    dockNavIdStudio?.classList.remove('active');
    pageTitle.textContent = 'Custom Dimension Sizer';
    switchRightPanelTab('layout');
    const customTabBtn = rightPanel.querySelector(`.cat-tab[data-cat="${SIZE_CATEGORIES.CUSTOM}"]`);
    if (customTabBtn) customTabBtn.click();
    const addCard = rightPanel.querySelector('#card-add-custom');
    if (addCard) addCard.click();
  });
}

// ─── Event Wiring & Keyboard Navigation ──────────────────────────────────────
initDropZone(dropZone, loadFiles);
initWindowDrop(loadFiles);
initPrintShortcut(handlePrint);

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    loadFiles(fileInput.files);
  }
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
    if (state.photos.length > 0) clearPhotos();
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

// Clipboard Paste (Ctrl+V)
document.addEventListener('paste', (e) => {
  const file = extractImageFromClipboard(e);
  if (file) {
    if (dropZone.style.display !== 'none') {
      dropZone.classList.add('paste-received');
      setTimeout(() => dropZone.classList.remove('paste-received'), 700);
    }
    loadFiles([file]);
  }
});

btnClear.addEventListener('click', clearPhotos);
btnPrint.addEventListener('click', handlePrint);
btnExportPng.addEventListener('click', handleExportPNG);
btnExportPdf.addEventListener('click', handleExportPDF);

sheetSelect.addEventListener('change', () => {
  state.sheetId = sheetSelect.value;
  state.count = null;
  updateCountDisplay();
  if (state.photos.length > 0) updatePreview();
});

btnCountUp.addEventListener('click', () => {
  const tiling = getTiling();
  const current = state.count === null ? tiling.maxFit : state.count;
  state.count = current >= tiling.maxFit ? null : current + 1;
  updateCountDisplay();
  if (state.photos.length > 0) updatePreview();
});

btnCountDn.addEventListener('click', () => {
  const tiling = getTiling();
  const current = state.count === null ? tiling.maxFit : state.count;
  state.count = Math.max(current - 1, 1);
  updateCountDisplay();
  if (state.photos.length > 0) updatePreview();
});

window.addEventListener('resize', () => {
  if (state.photos.length > 0) updatePreview();
});

// ─── Initial Init ─────────────────────────────────────────────────────────────
updateCountDisplay();
