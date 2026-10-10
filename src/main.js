import './style.css';
import {
  DEFAULT_SIZE_ID,
  DEFAULT_SHEET,
  SHEET_SIZES,
  getSizeById,
  getSheetById,
  getAllSheets,
  getUnitPreference,
  setUnitPreference,
  formatSizeDimensions,
  formatDimension,
  addCustomSheet,
  removeCustomSheet,
  SIZE_CATEGORIES
} from './lib/sizes.js';
import { calcTiling, calcComboTiling, calcMultiCustomerTiling, calculatePaperEfficiency } from './lib/tiler.js';
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
import { ComplianceModalHTML, initComplianceModal } from './components/ComplianceModal.js';
import { ClaimSlipModalHTML, initClaimSlipModal } from './components/ClaimSlipModal.js';
import { executePrint, initPrintShortcut } from './lib/printEngine.js';
import { exportHighResPNG, exportHighResPDF } from './lib/exporter.js';

// Helper to render sheet paper <optgroup> dropdown options
function renderSheetOptionsHTML(selectedId) {
  const all = getAllSheets();
  const unit = getUnitPreference();
  const customSheets = all.filter(s => s.isCustom);
  const standardSheets = all.filter(s => !s.isCustom);

  let html = '';
  if (customSheets.length > 0) {
    html += `<optgroup label="Custom Papers">`;
    customSheets.forEach(s => {
      const dimLabel = formatSizeDimensions(s.w, s.h, unit);
      html += `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>★ ${s.name} (${dimLabel})</option>`;
    });
    html += `</optgroup>`;
  }
  html += `<optgroup label="Standard Papers">`;
  standardSheets.forEach(s => {
    const dimLabel = formatSizeDimensions(s.w, s.h, unit);
    html += `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${s.name} (${dimLabel})</option>`;
  });
  html += `</optgroup>`;
  return html;
}

// Default Adjustments Template
function createDefaultAdjustments() {
  return {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    temperature: 0,
    isBW: false,
    rotation: 0,
    tilt: 0,
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
  sizeId: 'combo_4x2_8x1', // default to Combos tab
  sheetId: DEFAULT_SHEET,
  orientation: 'portrait', // 'portrait' | 'landscape'
  alignment: 'top-left', // 'top-left' | 'center'
  customOffsetX: 0, // inches nudge
  customOffsetY: 0, // inches nudge
  canvasMode: 'move', // 'move' | 'crop'
  count: 1, // default quantity is 1 for single sizes
  fitMode: 'cover',
  guideType: 'corners', // 'corners' | 'border' | 'none'
  guideColor: '#000000', // '#000000' | '#64748b' | '#cbd5e1'
  margin: 0.20, // inches
  gap: 0.05, // inches
  distributeMode: 'repeat', // 'repeat' | 'distribute'
  watermark: '', // studio sample/proof watermark
  showFooterInfo: false, // sheet metadata stamp
  zoomFactor: 1.0, // Canvas view zoom
};

// ─── App Shell HTML ───────────────────────────────────────────────────────────
document.getElementById('app').innerHTML = `
  <!-- Left Pro Icon Dock -->
  <aside class="pro-dock" id="pro-dock">
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

    <button class="dock-btn" id="dock-btn-compliance" title="Official ID, Passport & Visa Standards Guide">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M7 3h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
        <path d="M8 7h4M8 11h4M8 15h2"/>
      </svg>
    </button>

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
      <!-- Left Sidebar Collapse Toggle Button -->
      <button class="btn-panel-toggle active" id="btn-toggle-dock" title="Toggle Sidebar Dock (Ctrl+[ or \\)">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="1" y="2" width="14" height="12" rx="2"/>
          <path d="M5 2v12"/>
        </svg>
      </button>

      <div class="topbar-breadcrumb">
        <span class="breadcrumb-brand">AutoFit</span>
        <span class="breadcrumb-divider">/</span>
        <span class="breadcrumb-current" id="page-title">Photo Print Sizer</span>
      </div>

      <div class="status-badge" id="photo-status-badge">
        <span class="status-badge-dot"></span>
        <span id="photo-status-text">Ready</span>
      </div>

      <!-- Global Unit Switcher -->
      <div class="unit-switcher" id="unit-switcher" title="Global Measurement Unit (Inches / Centimeters / Millimeters)">
        <button class="unit-btn ${getUnitPreference() === 'in' ? 'active' : ''}" data-unit="in">IN</button>
        <button class="unit-btn ${getUnitPreference() === 'cm' ? 'active' : ''}" data-unit="cm">CM</button>
        <button class="unit-btn ${getUnitPreference() === 'mm' ? 'active' : ''}" data-unit="mm">MM</button>
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

        <button class="btn secondary" id="btn-claim-slip" disabled title="Generate Customer Order Claim Stub / Receipt Ticket">
          <span style="font-size:12px;">🧾</span> Claim Slip
        </button>

        <button class="btn primary" id="btn-print" disabled title="Print Sheet (Ctrl+P)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 6V2h8v4"/>
            <rect x="2" y="6" width="12" height="6" rx="1"/>
            <path d="M4 10v4h8v-4"/>
          </svg>
          Print Sheet
        </button>

        <!-- Right Inspector Collapse Toggle Button -->
        <button class="btn-panel-toggle active" id="btn-toggle-inspector" title="Toggle Inspector Panel (Ctrl+] or \\)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="1" y="2" width="14" height="12" rx="2"/>
            <path d="M11 2v12"/>
          </svg>
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
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <div class="panel-label" style="margin-bottom:0">Sheet Paper</div>
                <button class="btn-text-action" id="btn-open-custom-sheet" title="Create Custom Paper Size">
                  ➕ Custom Paper
                </button>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <select class="sheet-select" id="sheet-select" style="flex:1">
                  ${renderSheetOptionsHTML(state.sheetId)}
                </select>
                <button class="btn ghost btn-icon-only" id="btn-delete-custom-sheet" style="display:none;padding:6px 8px;color:var(--danger)" title="Delete this custom paper">
                  🗑️
                </button>
              </div>

              <!-- Custom Sheet Inline Creator Form -->
              <div class="custom-sheet-form" id="custom-sheet-form" style="display:none;margin-top:10px;">
                <div class="custom-size-title" style="font-weight:700;font-size:12px;margin-bottom:8px;color:var(--ink-primary)">📄 Create Custom Paper Size</div>
                <div class="custom-inputs-row">
                  <input type="text" id="cust-sheet-name" placeholder="Paper Name (e.g. 5×7 Cardstock, A3+, Roll)" class="input-text" />
                </div>
                <div class="custom-inputs-row" style="margin-top:6px;gap:6px;display:flex;">
                  <input type="number" id="cust-sheet-w" placeholder="Width" step="0.1" min="1" class="input-text" style="flex:1" />
                  <span style="align-self:center;color:var(--ink-muted)">×</span>
                  <input type="number" id="cust-sheet-h" placeholder="Height" step="0.1" min="1" class="input-text" style="flex:1" />
                  <select id="cust-sheet-unit" class="sheet-select" style="width:70px">
                    <option value="in" ${getUnitPreference() === 'in' ? 'selected' : ''}>in</option>
                    <option value="cm" ${getUnitPreference() === 'cm' ? 'selected' : ''}>cm</option>
                    <option value="mm" ${getUnitPreference() === 'mm' ? 'selected' : ''}>mm</option>
                  </select>
                </div>
                <div style="display:flex;gap:6px;margin-top:8px">
                  <button class="btn primary" id="btn-save-custom-sheet" style="flex:1;padding:6px;font-size:12px">Save Paper</button>
                  <button class="btn ghost" id="btn-cancel-custom-sheet" style="padding:6px;font-size:12px">Cancel</button>
                </div>
              </div>
            </div>

            <div class="panel-section" id="section-copies">
              <div id="single-count-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <div class="panel-label" style="margin-bottom:0">Copies Per Sheet</div>
                <button class="btn-text-action" id="btn-count-max" title="Fill entire sheet with max copies">
                  Max Fit
                </button>
              </div>
              <div class="count-row" id="single-count-row">
                <span class="count-label">Quantity:</span>
                <div class="count-controls" style="flex:1;max-width:140px;">
                  <button class="count-btn" id="btn-count-down" title="Decrease copies (−)">−</button>
                  <input type="number" id="count-input" class="count-input" min="1" max="99" value="1" title="Type number of copies" />
                  <button class="count-btn" id="btn-count-up" title="Increase copies (+)">+</button>
                </div>
                <span class="count-max-hint" id="count-max-hint">/ max 12</span>
              </div>
              <div class="multi-cust-summary-row" id="multi-cust-summary-row" style="display:none;background:var(--bg-card);border:1px solid var(--border-medium);border-radius:var(--radius-sm);padding:8px 12px;align-items:center;justify-content:space-between;">
                <span style="font-size:12px;font-weight:600;color:var(--ink-primary);display:flex;align-items:center;gap:6px;">
                  <span>👥</span> Multi-Customer Batch
                </span>
                <span id="multi-cust-summary-text" style="font-size:11px;font-weight:700;color:var(--accent-hover);font-family:var(--font-mono);">0 Customers</span>
              </div>
            </div>

            ${PrintSettingsHTML({
              orientation: state.orientation,
              alignment: state.alignment,
              fitMode: state.fitMode,
              guideType: state.guideType,
              guideColor: state.guideColor,
              margin: state.margin,
              gap: state.gap,
              distributeMode: state.distributeMode,
              watermark: state.watermark,
              showFooterInfo: state.showFooterInfo,
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
  ${ComplianceModalHTML()}
  ${ClaimSlipModalHTML()}
  <div class="print-frame" id="print-frame"></div>
`;

// ─── DOM References ───────────────────────────────────────────────────────────
const dropZone        = document.getElementById('drop-zone');
const fileInput       = document.getElementById('file-input');
const btnPrint        = document.getElementById('btn-print');
const btnExportPng    = document.getElementById('btn-export-png');
const btnExportPdf    = document.getElementById('btn-export-pdf');
const btnClaimSlip    = document.getElementById('btn-claim-slip');
const btnClear        = document.getElementById('btn-clear');
const sheetWrap       = document.getElementById('sheet-wrap');
const sheetSelect     = document.getElementById('sheet-select');
const countInput      = document.getElementById('count-input');
const btnCountUp      = document.getElementById('btn-count-up');
const btnCountDn      = document.getElementById('btn-count-down');
const btnCountMax     = document.getElementById('btn-count-max');
const countMaxHint    = document.getElementById('count-max-hint');
const sectionCopies   = document.getElementById('section-copies');
const printFrame      = document.getElementById('print-frame');
const rightPanel      = document.getElementById('right-panel');
const panelTabsHeader = document.getElementById('panel-tabs-header');
const pageTitle       = document.getElementById('page-title');
const photoStatusText = document.getElementById('photo-status-text');

// Dock & Inspector Elements
const dockEl             = document.getElementById('pro-dock');
const btnToggleDock      = document.getElementById('btn-toggle-dock');
const btnToggleInspector = document.getElementById('btn-toggle-inspector');

// Dock Nav Buttons
const dockNavPhotoPrint  = document.getElementById('dock-nav-photoprint');
const dockNavIdStudio    = document.getElementById('dock-nav-idstudio');
const dockNavCustomSizer = document.getElementById('dock-nav-customsizer');
const dockBtnShortcuts   = document.getElementById('dock-btn-shortcuts');
const dockBtnCompliance  = document.getElementById('dock-btn-compliance');

// Floating Canvas Zoom & Zen Controls
const btnZoomIn   = document.getElementById('btn-zoom-in');
const btnZoomOut  = document.getElementById('btn-zoom-out');
const btnZoomFit  = document.getElementById('btn-zoom-fit');
const btnZenMode  = document.getElementById('btn-zen-mode');

// ─── Dual Collapsible Panels & Zen View ───────────────────────────────────────
function toggleDock() {
  dockEl.classList.toggle('collapsed');
  btnToggleDock.classList.toggle('active', !dockEl.classList.contains('collapsed'));
  setTimeout(() => updatePreview(), 240);
}

function toggleInspector() {
  rightPanel.classList.toggle('collapsed');
  btnToggleInspector.classList.toggle('active', !rightPanel.classList.contains('collapsed'));
  setTimeout(() => updatePreview(), 240);
}

function toggleZenMode() {
  const isZen = dockEl.classList.contains('collapsed') && rightPanel.classList.contains('collapsed');
  if (isZen) {
    dockEl.classList.remove('collapsed');
    rightPanel.classList.remove('collapsed');
    btnToggleDock.classList.add('active');
    btnToggleInspector.classList.add('active');
    toast('Restored Studio Panels', 'info', 1500);
  } else {
    dockEl.classList.add('collapsed');
    rightPanel.classList.add('collapsed');
    btnToggleDock.classList.remove('active');
    btnToggleInspector.classList.remove('active');
    toast('Zen Fullscreen Mode (Press \\ to restore)', 'info', 2500);
  }
  setTimeout(() => updatePreview(), 240);
}

btnToggleDock?.addEventListener('click', toggleDock);
btnToggleInspector?.addEventListener('click', toggleInspector);
btnZenMode?.addEventListener('click', toggleZenMode);

// ─── Tab Switching ────────────────────────────────────────────────────────────
function switchRightPanelTab(tabName) {
  if (!panelTabsHeader) return;
  // If inspector is collapsed, auto-open it
  if (rightPanel.classList.contains('collapsed')) {
    toggleInspector();
  }
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
function getSheetObject() {
  const baseSheet = getSheetById(state.sheetId);
  const isLandscape = state.orientation === 'landscape';
  const sheetW = isLandscape ? Math.max(baseSheet.w, baseSheet.h) : Math.min(baseSheet.w, baseSheet.h);
  const sheetH = isLandscape ? Math.min(baseSheet.w, baseSheet.h) : Math.max(baseSheet.w, baseSheet.h);
  return { ...baseSheet, w: sheetW, h: sheetH, name: `${baseSheet.name} (${state.orientation})` };
}

function getTiling() {
  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetObject();

  // Multi-Customer Gang-Run Batch Studio (Option A)
  if (state.photos.length > 1) {
    const customerList = state.photos.map((p, idx) => {
      const sId = p.sizeId || (state.sizeId.startsWith('combo') ? '2x2' : state.sizeId);
      const sObj = getSizeById(sId) || getSizeById('2x2');
      return {
        photoIndex: idx,
        id: p.id,
        name: p.name || `Customer #${idx + 1}`,
        w: sObj.w,
        h: sObj.h,
        quantity: p.quantity || 1,
        sizeName: sObj.name || `${sObj.w}×${sObj.h}`,
      };
    });

    return calcMultiCustomerTiling(customerList, sheetObj.w, sheetObj.h, {
      margin: state.margin,
      gap: state.gap,
      alignment: state.alignment,
      customOffsetX: state.customOffsetX,
      customOffsetY: state.customOffsetY,
    });
  }

  if (sizeObj.isCombo) {
    return calcComboTiling(sizeObj.comboItems, sheetObj.w, sheetObj.h, {
      margin: state.margin,
      gap: state.gap,
      alignment: state.alignment,
      customOffsetX: state.customOffsetX,
      customOffsetY: state.customOffsetY,
    });
  }

  return calcTiling(sizeObj.w, sizeObj.h, sheetObj.w, sheetObj.h, state.count, {
    margin: state.margin,
    gap: state.gap,
    alignment: state.alignment,
    customOffsetX: state.customOffsetX,
    customOffsetY: state.customOffsetY,
  });
}

function updateCountDisplay() {
  const sizeObj = getSizeById(state.sizeId);
  const singleHeader = document.getElementById('single-count-header');
  const singleRow    = document.getElementById('single-count-row');
  const multiRow     = document.getElementById('multi-cust-summary-row');
  const multiText    = document.getElementById('multi-cust-summary-text');

  // When multi-customer batch is active, each card has its own quantity stepper
  if (state.photos.length > 1) {
    if (sectionCopies) sectionCopies.style.display = 'block';
    if (singleHeader) singleHeader.style.display = 'none';
    if (singleRow) singleRow.style.display = 'none';
    if (multiRow) {
      multiRow.style.display = 'flex';
      const tiling = getTiling();
      if (multiText) {
        multiText.textContent = `${state.photos.length} Customers • ${tiling.total} IDs on sheet`;
      }
    }
    return;
  }

  if (multiRow) multiRow.style.display = 'none';
  if (singleHeader) singleHeader.style.display = 'flex';
  if (singleRow) singleRow.style.display = 'flex';

  if (sizeObj.isCombo) {
    if (sectionCopies) sectionCopies.style.display = 'none';
    return;
  }
  if (sectionCopies) sectionCopies.style.display = 'block';

  // Calculate tiling without count constraint to find max capacity
  const tilingForMax = calcTiling(sizeObj.w, sizeObj.h, getSheetObject().w, getSheetObject().h, null, {
    margin: state.margin,
    gap: state.gap,
  });

  const maxFit = tilingForMax.maxFit;
  if (countMaxHint) {
    countMaxHint.textContent = `/ max ${maxFit}`;
  }

  if (state.count === null || state.count > maxFit) {
    state.count = 1;
  }
  if (state.count < 1) {
    state.count = 1;
  }

  if (countInput) {
    countInput.max = maxFit;
    countInput.value = state.count;
  }
}

// ─── Live Sheet Preview ───────────────────────────────────────────────────────
function updatePreview() {
  if (state.photos.length === 0) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetObject();
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
    guideColor: state.guideColor,
    distributeMode: state.distributeMode,
    watermark: state.watermark,
    showFooterInfo: state.showFooterInfo,
    zoomFactor: state.zoomFactor,
    canvasMode: state.canvasMode,
    onPanChange: (newPanX, newPanY, targetPhotoIdx) => {
      if (targetPhotoIdx === state.activePhotoIndex) {
        imageAdjustmentsController.updatePan(newPanX, newPanY);
      }
    },
    onLayoutMove: (dInchesX, dInchesY) => {
      state.customOffsetX = Math.round((state.customOffsetX + dInchesX) * 100) / 100;
      state.customOffsetY = Math.round((state.customOffsetY + dInchesY) * 100) / 100;
      updatePreview();
    },
    onResetPosition: () => {
      state.customOffsetX = 0;
      state.customOffsetY = 0;
      updatePreview();
      toast('Reset layout to top-left margin', 'info', 1400);
    },
    onModeChange: (newMode) => {
      state.canvasMode = newMode;
      updatePreview();
    },
    onSelectPhoto: (idx) => {
      setActivePhoto(idx);
    },
  });

  updateCountDisplay();
  wireQueueEvents();

  if (photoStatusText) {
    photoStatusText.textContent = state.photos.length === 1
      ? `${state.photos[0].dimensions.width}×${state.photos[0].dimensions.height}`
      : `${state.photos.length} Customers (${tiling.total} IDs)`;
  }

  // Update real-time paper efficiency and economics
  const eff = calculatePaperEfficiency(sheetObj.w, sheetObj.h, tiling.cells);
  printSettingsController.updateEfficiency({
    ...eff,
    totalPhotos: tiling.total || 0,
  });
}

// Wire Multi-photo Queue Events
function wireQueueEvents() {
  const cards = sheetWrap.querySelectorAll('.customer-queue-card');
  cards.forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('button, select, input')) return;
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

  const dupBtns = sheetWrap.querySelectorAll('.btn-cust-duplicate');
  dupBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.dupIdx, 10);
      duplicateCustomer(idx);
    });
  });

  const sizeSelects = sheetWrap.querySelectorAll('.customer-size-select');
  sizeSelects.forEach(sel => {
    sel.addEventListener('change', (e) => {
      e.stopPropagation();
      const idx = parseInt(sel.dataset.custIdx, 10);
      if (state.photos[idx]) {
        state.photos[idx].sizeId = sel.value;
        updatePreview();
      }
    });
  });

  const qtyBtns = sheetWrap.querySelectorAll('.btn-cust-qty');
  qtyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.custIdx, 10);
      const action = btn.dataset.qtyAction;
      if (state.photos[idx]) {
        const cur = state.photos[idx].quantity || 1;
        state.photos[idx].quantity = action === 'dec' ? Math.max(1, cur - 1) : cur + 1;
        updatePreview();
      }
    });
  });

  const nameInputs = sheetWrap.querySelectorAll('.customer-card-name-input');
  nameInputs.forEach(input => {
    input.addEventListener('change', () => {
      const idx = parseInt(input.dataset.custIdx, 10);
      const val = input.value.trim();
      if (state.photos[idx] && val) {
        state.photos[idx].name = val;
        if (state.photos[idx].adjustments?.nameTag) {
          state.photos[idx].adjustments.nameTag.text = val;
        }
        updatePreview();
        toast(`Customer #${idx + 1} named: ${val}`, 'info', 1500);
      }
    });
  });

  const reorderBtns = sheetWrap.querySelectorAll('.btn-cust-reorder');
  reorderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.custIdx, 10);
      const dir = btn.dataset.reorderDir;
      const targetIdx = dir === 'prev' ? idx - 1 : idx + 1;
      if (targetIdx >= 0 && targetIdx < state.photos.length) {
        const temp = state.photos[idx];
        state.photos[idx] = state.photos[targetIdx];
        state.photos[targetIdx] = temp;
        if (state.activePhotoIndex === idx) state.activePhotoIndex = targetIdx;
        else if (state.activePhotoIndex === targetIdx) state.activePhotoIndex = idx;
        updatePreview();
        toast(`Shifted customer order position`, 'info', 1200);
      }
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

function duplicateCustomer(index) {
  if (index < 0 || index >= state.photos.length) return;
  const original = state.photos[index];
  const clone = {
    ...original,
    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: `${original.name || `Customer #${index + 1}`} (Copy)`,
    adjustments: JSON.parse(JSON.stringify(original.adjustments || createDefaultAdjustments())),
    quantity: original.quantity || 1,
    sizeId: original.sizeId || '2x2',
  };
  state.photos.splice(index + 1, 0, clone);
  state.activePhotoIndex = index + 1;
  printSettingsController.updatePhotoCount(state.photos.length);
  setActivePhoto(index + 1);
  toast(`Duplicated ${original.name || `Customer #${index + 1}`}`, 'success', 2500);
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
  const newSize = getSizeById(newSizeId);
  state.customOffsetX = 0;
  state.customOffsetY = 0;

  // Single sizes default to 1 piece by default
  if (!newSize.isCombo) {
    state.count = 1;
  }
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
  if (settings.orientation !== undefined) {
    state.orientation = settings.orientation;
    state.customOffsetX = 0;
    state.customOffsetY = 0;
  }
  if (settings.alignment !== undefined) {
    state.alignment = settings.alignment;
    state.customOffsetX = 0;
    state.customOffsetY = 0;
  }
  if (settings.fitMode !== undefined) state.fitMode = settings.fitMode;
  if (settings.guideType !== undefined) state.guideType = settings.guideType;
  if (settings.guideColor !== undefined) state.guideColor = settings.guideColor;
  if (settings.margin !== undefined) state.margin = settings.margin;
  if (settings.gap !== undefined) state.gap = settings.gap;
  if (settings.distributeMode !== undefined) state.distributeMode = settings.distributeMode;
  if (settings.watermark !== undefined) state.watermark = settings.watermark;
  if (settings.showFooterInfo !== undefined) state.showFooterInfo = settings.showFooterInfo;

  if (state.photos.length > 0) updatePreview();
  updateCountDisplay();
}, {
  orientation: state.orientation,
  alignment: state.alignment,
  fitMode: state.fitMode,
  guideType: state.guideType,
  guideColor: state.guideColor,
  margin: state.margin,
  gap: state.gap,
  distributeMode: state.distributeMode,
  watermark: state.watermark,
  showFooterInfo: state.showFooterInfo,
});

// ─── Shortcuts & Compliance Modals Initialization ─────────────────────────────
const shortcutsModal = initShortcutsModal(document.body);
if (dockBtnShortcuts) {
  dockBtnShortcuts.addEventListener('click', () => shortcutsModal.open());
}

const complianceModal = initComplianceModal(document.body, (std) => {
  // Apply size
  if (std.sizeId && std.sizeId !== 'custom') {
    sizeSelector.setSelected(std.sizeId);
  }

  // Apply to active photo adjustments
  if (state.photos.length > 0 && state.photos[state.activePhotoIndex]) {
    const photo = state.photos[state.activePhotoIndex];
    if (!photo.adjustments) photo.adjustments = createDefaultAdjustments();

    if (std.bgPreset) photo.adjustments.bgPreset = std.bgPreset;
    if (std.showOval !== undefined) photo.adjustments.showOval = std.showOval;
    if (std.nameTagRequired) {
      photo.adjustments.nameTag.enabled = true;
      if (!photo.adjustments.nameTag.text) {
        photo.adjustments.nameTag.text = (photo.name || 'SURNAME, FIRST NAME M.I.').toUpperCase();
      }
    } else if (std.nameTagAllowed === false) {
      photo.adjustments.nameTag.enabled = false;
    }

    imageAdjustmentsController.updateState(photo.adjustments);
    updatePreview();
    toast(`Applied ${std.name} standards (${std.dimensionsLabel})`, 'success', 3500);
  } else {
    toast(`Selected ${std.name} (${std.dimensionsLabel}). Load a photo to view guidelines!`, 'info', 3500);
  }
});

if (dockBtnCompliance) {
  dockBtnCompliance.addEventListener('click', () => complianceModal.open());
}

const claimSlipModal = initClaimSlipModal(document.body, () => {
  let pricing = { currency: '₱', pricePerId: 30 };
  try {
    pricing = JSON.parse(localStorage.getItem('autofit_pricing_config') || '{}');
  } catch (e) {}

  return {
    photos: state.photos.map(p => ({
      name: p.name,
      quantity: p.quantity || 1,
      sizeId: p.sizeId,
      sizeLabel: getSizeById(p.sizeId || '2x2')?.name || p.sizeId,
    })),
    currency: pricing.currency || '₱',
    pricePerId: pricing.pricePerId || 30,
  };
});

if (btnClaimSlip) {
  btnClaimSlip.addEventListener('click', () => claimSlipModal.open());
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

      const defaultCustSize = state.sizeId.startsWith('combo') ? '2x2' : state.sizeId;
      const newPhoto = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        dataUrl,
        thumbUrl,
        name,
        dimensions,
        adjustments: createDefaultAdjustments(),
        sizeId: defaultCustSize,
        quantity: 1,
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
  const chosenSize = (sizeId && !sizeId.startsWith('combo')) ? sizeId : '2x2';
  state.photos = [{
    id: Date.now().toString(),
    dataUrl,
    thumbUrl: thumbUrl || dataUrl,
    name: name || 'photo',
    dimensions: dimensions || { width: 0, height: 0 },
    adjustments: createDefaultAdjustments(),
    sizeId: chosenSize,
    quantity: 1,
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
  if (btnClaimSlip) btnClaimSlip.disabled = false;
  btnClear.disabled = false;

  printSettingsController.updatePhotoCount(state.photos.length);
  setActivePhoto(0);
}

// ─── Clear Photos ─────────────────────────────────────────────────────────────
function clearPhotos() {
  state.photos = [];
  state.activePhotoIndex = 0;
  state.count = 1;
  state.customOffsetX = 0;
  state.customOffsetY = 0;
  state.zoomFactor = 1.0;

  dropZone.style.display = '';
  sheetWrap.classList.remove('visible');
  btnPrint.disabled = true;
  btnExportPng.disabled = true;
  btnExportPdf.disabled = true;
  if (btnClaimSlip) btnClaimSlip.disabled = true;
  btnClear.disabled = true;
  if (photoStatusText) photoStatusText.textContent = 'Ready';
  printSettingsController.updatePhotoCount(0);
  printSettingsController.updateEfficiency({
    sheetArea: 0,
    usedArea: 0,
    utilizationPercent: 0,
    unusedPercent: 100,
    totalPhotos: 0,
  });
  updateCountDisplay();
}

// ─── Print & Export Handlers ──────────────────────────────────────────────────
function handlePrint() {
  if (state.photos.length === 0) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetObject();
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
    guideColor: state.guideColor,
    distributeMode: state.distributeMode,
    watermark: state.watermark,
    showFooterInfo: state.showFooterInfo,
  });
}

function handleExportPNG() {
  if (state.photos.length === 0) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetObject();
  const tiling   = getTiling();

  exportHighResPNG({
    sheetObj,
    sizeObj,
    tilingResult: tiling,
    photos: state.photos,
    activePhotoIndex: state.activePhotoIndex,
    fitMode: state.fitMode,
    guideType: state.guideType,
    guideColor: state.guideColor,
    distributeMode: state.distributeMode,
    watermark: state.watermark,
    showFooterInfo: state.showFooterInfo,
  });
}

function handleExportPDF() {
  if (state.photos.length === 0) return;

  const sizeObj  = getSizeById(state.sizeId);
  const sheetObj = getSheetObject();
  const tiling   = getTiling();

  exportHighResPDF({
    sheetObj,
    sizeObj,
    tilingResult: tiling,
    photos: state.photos,
    activePhotoIndex: state.activePhotoIndex,
    fitMode: state.fitMode,
    guideType: state.guideType,
    guideColor: state.guideColor,
    distributeMode: state.distributeMode,
    watermark: state.watermark,
    showFooterInfo: state.showFooterInfo,
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
    const addItem = rightPanel.querySelector('#item-add-custom');
    if (addItem) addItem.click();
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

  // Zen Mode toggle with \ or F
  if (e.key === '\\' || e.key === 'f' || e.key === 'F') {
    e.preventDefault();
    toggleZenMode();
    return;
  }

  // Ctrl+[ for Left Dock
  if ((e.ctrlKey || e.metaKey) && e.key === '[') {
    e.preventDefault();
    toggleDock();
    return;
  }

  // Ctrl+] for Right Inspector
  if ((e.ctrlKey || e.metaKey) && e.key === ']') {
    e.preventDefault();
    toggleInspector();
    return;
  }

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

// ─── Global Unit Switcher Wiring ─────────────────────────────────────────────
const unitSwitcher = document.getElementById('unit-switcher');
if (unitSwitcher) {
  unitSwitcher.querySelectorAll('.unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const unit = btn.dataset.unit;
      setUnitPreference(unit);
      unitSwitcher.querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b === btn));
      sizeSelector.refreshUnits();
      printSettingsController.refreshUnits();
      sheetSelect.innerHTML = renderSheetOptionsHTML(state.sheetId);
      const custSheetUnitEl = document.getElementById('cust-sheet-unit');
      if (custSheetUnitEl) custSheetUnitEl.value = unit;
      const unitLabels = { in: 'Inches (in)', cm: 'Centimeters (cm)', mm: 'Millimeters (mm)' };
      toast(`Units switched to ${unitLabels[unit] || unit}`, 'info', 1500);
    });
  });
}

// ─── Custom Sheet Paper Creator Wiring ────────────────────────────────────────
const btnOpenCustomSheet   = document.getElementById('btn-open-custom-sheet');
const btnDeleteCustomSheet = document.getElementById('btn-delete-custom-sheet');
const customSheetForm      = document.getElementById('custom-sheet-form');
const btnSaveCustomSheet   = document.getElementById('btn-save-custom-sheet');
const btnCancelCustomSheet = document.getElementById('btn-cancel-custom-sheet');
const custSheetName        = document.getElementById('cust-sheet-name');
const custSheetW           = document.getElementById('cust-sheet-w');
const custSheetH           = document.getElementById('cust-sheet-h');
const custSheetUnit        = document.getElementById('cust-sheet-unit');

function updateDeleteCustomSheetBtn() {
  if (!btnDeleteCustomSheet) return;
  const current = getSheetById(state.sheetId);
  btnDeleteCustomSheet.style.display = current?.isCustom ? 'inline-flex' : 'none';
}

if (btnOpenCustomSheet) {
  btnOpenCustomSheet.addEventListener('click', () => {
    const isVisible = customSheetForm.style.display !== 'none';
    customSheetForm.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      if (custSheetUnit) custSheetUnit.value = getUnitPreference();
      custSheetW?.focus();
    }
  });
}

if (btnCancelCustomSheet) {
  btnCancelCustomSheet.addEventListener('click', () => {
    customSheetForm.style.display = 'none';
  });
}

if (btnSaveCustomSheet) {
  btnSaveCustomSheet.addEventListener('click', () => {
    const name   = custSheetName.value.trim();
    const width  = parseFloat(custSheetW.value);
    const height = parseFloat(custSheetH.value);
    const unit   = custSheetUnit.value;

    if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) {
      toast('Please enter valid positive dimensions for width and height', 'error');
      return;
    }

    const newSheet = addCustomSheet({ name, width, height, unit });
    state.sheetId = newSheet.id;
    sheetSelect.innerHTML = renderSheetOptionsHTML(state.sheetId);
    customSheetForm.style.display = 'none';
    custSheetName.value = '';
    custSheetW.value = '';
    custSheetH.value = '';
    updateDeleteCustomSheetBtn();
    state.count = null;
    updateCountDisplay();
    if (state.photos.length > 0) updatePreview();
    toast(`Created custom paper: ${newSheet.name}`, 'success');
  });
}

if (btnDeleteCustomSheet) {
  btnDeleteCustomSheet.addEventListener('click', () => {
    const cur = getSheetById(state.sheetId);
    if (!cur?.isCustom) return;
    if (confirm(`Delete custom paper "${cur.name}"?`)) {
      removeCustomSheet(state.sheetId);
      state.sheetId = DEFAULT_SHEET;
      sheetSelect.innerHTML = renderSheetOptionsHTML(state.sheetId);
      updateDeleteCustomSheetBtn();
      state.count = null;
      updateCountDisplay();
      if (state.photos.length > 0) updatePreview();
      toast('Custom paper deleted', 'info');
    }
  });
}

sheetSelect.addEventListener('change', () => {
  state.sheetId = sheetSelect.value;
  state.count = null;
  updateDeleteCustomSheetBtn();
  updateCountDisplay();
  if (state.photos.length > 0) updatePreview();
});

updateDeleteCustomSheetBtn();

if (countInput) {
  countInput.addEventListener('input', () => {
    let val = parseInt(countInput.value, 10);
    const sizeObj = getSizeById(state.sizeId);
    const tilingForMax = calcTiling(sizeObj.w, sizeObj.h, getSheetObject().w, getSheetObject().h, null, {
      margin: state.margin,
      gap: state.gap,
    });
    if (isNaN(val) || val < 1) val = 1;
    if (val > tilingForMax.maxFit) val = tilingForMax.maxFit;
    state.count = val;
    countInput.value = val;
    if (state.photos.length > 0) updatePreview();
  });
}

if (btnCountMax) {
  btnCountMax.addEventListener('click', () => {
    const sizeObj = getSizeById(state.sizeId);
    const tilingForMax = calcTiling(sizeObj.w, sizeObj.h, getSheetObject().w, getSheetObject().h, null, {
      margin: state.margin,
      gap: state.gap,
    });
    state.count = tilingForMax.maxFit;
    if (countInput) countInput.value = state.count;
    if (state.photos.length > 0) updatePreview();
    toast(`Filled sheet with maximum ${state.count} copies`, 'info', 1600);
  });
}

btnCountUp.addEventListener('click', () => {
  const sizeObj = getSizeById(state.sizeId);
  const tilingForMax = calcTiling(sizeObj.w, sizeObj.h, getSheetObject().w, getSheetObject().h, null, {
    margin: state.margin,
    gap: state.gap,
  });
  const current = state.count || 1;
  state.count = Math.min(current + 1, tilingForMax.maxFit);
  if (countInput) countInput.value = state.count;
  if (state.photos.length > 0) updatePreview();
});

btnCountDn.addEventListener('click', () => {
  const current = state.count || 1;
  state.count = Math.max(current - 1, 1);
  if (countInput) countInput.value = state.count;
  if (state.photos.length > 0) updatePreview();
});

window.addEventListener('resize', () => {
  if (state.photos.length > 0) updatePreview();
});

// ─── Initial Init ─────────────────────────────────────────────────────────────
updateCountDisplay();

// ─── PWA Service Worker Registration ──────────────────────────────────────────
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('AutoFit PWA offline service worker registered:', reg.scope);
    }).catch((err) => {
      console.warn('AutoFit service worker registration notice:', err);
    });
  });
}
