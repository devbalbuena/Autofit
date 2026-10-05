/**
 * PrintSettings component
 * Controls for sheet paper orientation (portrait/landscape), photo fit mode,
 * cutting guides (corner marks vs dashed borders), sheet margins & presets,
 * photo gaps & presets, and multi-photo distribution.
 */
import { formatDimension, PRINTER_PROFILES } from '../lib/sizes.js';

export function PrintSettingsHTML({
  orientation = 'portrait', // 'portrait' | 'landscape'
  alignment = 'top-left', // 'top-left' | 'center'
  fitMode = 'cover',
  guideType = 'corners', // 'corners' | 'border' | 'none'
  guideColor = '#000000',
  margin = 0.2,
  gap = 0.05,
  distributeMode = 'repeat', // 'repeat' | 'distribute'
  watermark = '',
  showFooterInfo = false,
  photoCount = 1,
} = {}) {
  return `
    <div class="print-settings">
      <!-- Studio Proof Watermark & Footer Metadata -->
      <div class="panel-section">
        <div class="panel-label">Studio Proof & Sheet Stamp</div>
        <div class="watermark-controls" style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; gap:6px;">
            <input type="text" id="input-watermark-text" placeholder="Watermark (e.g. SAMPLE PROOF)" value="${watermark || ''}" style="flex:1; padding:6px 9px; font-size:12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; color:var(--text-main);" />
            <button class="preset-chip ${watermark === 'SAMPLE' ? 'active' : ''}" data-wm="SAMPLE" style="font-size:11px;">SAMPLE</button>
            <button class="preset-chip ${watermark === 'PROOF' ? 'active' : ''}" data-wm="PROOF" style="font-size:11px;">PROOF</button>
            ${watermark ? `<button class="preset-chip" data-wm="" style="font-size:11px;" title="Clear Watermark">✕</button>` : ''}
          </div>
          <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; color:var(--text-muted);">
            <input type="checkbox" id="check-footer-info" ${showFooterInfo ? 'checked' : ''} style="cursor:pointer;" />
            <span>Print Sheet Footer Info (Paper, date & timestamp)</span>
          </label>
        </div>
      </div>
      <!-- Sheet Paper Orientation -->
      <div class="panel-section">
        <div class="panel-label">Paper Orientation</div>
        <div class="orientation-toggle" id="orientation-toggle">
          <button class="orientation-btn ${orientation === 'portrait' ? 'active' : ''}" data-orientation="portrait" title="Portrait Feed (Vertical)">
            <span>↕</span> Portrait
          </button>
          <button class="orientation-btn ${orientation === 'landscape' ? 'active' : ''}" data-orientation="landscape" title="Landscape Feed (Horizontal)">
            <span>↔</span> Landscape
          </button>
        </div>
      </div>

      <!-- Sheet Placement / Alignment -->
      <div class="panel-section">
        <div class="panel-label">Sheet Placement (Paper Saver)</div>
        <div class="orientation-toggle" id="alignment-toggle">
          <button class="orientation-btn ${alignment === 'top-left' ? 'active' : ''}" data-alignment="top-left" title="Start at top-left margin to save unprinted paper below">
            <span>⬆</span> Top-Left (Paper Saver)
          </button>
          <button class="orientation-btn ${alignment === 'center' ? 'active' : ''}" data-alignment="center" title="Center layout in middle of sheet">
            <span>⬍</span> Center Sheet
          </button>
        </div>
      </div>

      <!-- Photo Fit Mode -->
      <div class="panel-section">
        <div class="panel-label">Photo Fit Mode</div>
        <div class="fit-mode-toggle" id="fit-mode-toggle">
          <button class="fit-btn ${fitMode === 'cover' ? 'active' : ''}" data-fit="cover" title="Fill entire photo box (crops edges if needed)">
            Fill (Cover)
          </button>
          <button class="fit-btn ${fitMode === 'contain' ? 'active' : ''}" data-fit="contain" title="Fit whole photo (letterbox borders)">
            Fit (Contain)
          </button>
        </div>
      </div>

      <!-- Cutting Guides & Crop Marks -->
      <div class="panel-section">
        <div class="panel-label">Cutting Guides & Crop Marks</div>
        <div class="fit-mode-toggle" id="guide-type-toggle">
          <button class="fit-btn ${guideType === 'corners' ? 'active' : ''}" data-guide="corners" title="Exterior Corner Hairline Ticks (No marks on photo edge)">
            Corner Ticks
          </button>
          <button class="fit-btn ${guideType === 'border' ? 'active' : ''}" data-guide="border" title="Dashed Border Box">
            Box Lines
          </button>
          <button class="fit-btn ${guideType === 'none' ? 'active' : ''}" data-guide="none" title="No guides">
            None
          </button>
        </div>
        <div class="presets-row" id="guide-color-presets" style="margin-top:6px;${guideType === 'none' ? 'display:none;' : ''}">
          <button class="preset-chip ${guideColor === '#000000' ? 'active' : ''}" data-color="#000000" title="High-contrast black lines">⚫ Black</button>
          <button class="preset-chip ${guideColor === '#64748b' ? 'active' : ''}" data-color="#64748b" title="Medium-contrast gray lines">🔘 Gray</button>
          <button class="preset-chip ${guideColor === '#cbd5e1' ? 'active' : ''}" data-color="#cbd5e1" title="Subtle light hairline for clean trimming">⚪ Light</button>
        </div>
      </div>
 
       <!-- Printer Hardware Margin Calibration Presets -->
       <div class="panel-section">
         <div class="panel-label">Printer Hardware Calibration</div>
         <select class="sheet-select" id="printer-profile-select" title="Auto-calibrate margins for specific physical printers">
           <option value="">⚙️ Select Printer Profile...</option>
           ${PRINTER_PROFILES.map(p => `
             <option value="${p.id}">${p.name} — ${p.desc}</option>
           `).join('')}
         </select>
       </div>

       <!-- Paper Margins & Quick Presets -->
       <div class="panel-section">
         <div class="panel-label">Sheet Printable Margins</div>
        <div class="adjust-slider-group">
          <div class="slider-header">
            <span>Margin Width</span>
            <span class="slider-val" id="val-sheet-margin">${formatDimension(margin)}</span>
          </div>
          <input type="range" id="slider-sheet-margin" min="0" max="0.75" step="0.05" value="${margin}" />
        </div>
        <div class="presets-row" id="margin-presets">
          <button class="preset-chip ${margin === 0 ? 'active' : ''}" data-margin="0">0" Borderless</button>
          <button class="preset-chip ${margin === 0.2 ? 'active' : ''}" data-margin="0.2">0.20" Standard</button>
          <button class="preset-chip ${margin === 0.35 ? 'active' : ''}" data-margin="0.35">0.35" Safe</button>
        </div>
      </div>

      <!-- Photo Spacing (Gap) & Quick Presets -->
      <div class="panel-section">
        <div class="panel-label">Photo Spacing / Gutter</div>
        <div class="adjust-slider-group">
          <div class="slider-header">
            <span>Spacing (Gap)</span>
            <span class="slider-val" id="val-photo-gap">${gap === 0 ? '0 (Zero-gap)' : formatDimension(gap)}</span>
          </div>
          <input type="range" id="slider-photo-gap" min="0" max="0.30" step="0.01" value="${gap}" />
        </div>
        <div class="presets-row" id="gap-presets">
          <button class="preset-chip ${gap === 0 ? 'active' : ''}" data-gap="0">0" Zero Gap</button>
          <button class="preset-chip ${gap === 0.05 ? 'active' : ''}" data-gap="0.05">0.05" Hairline</button>
          <button class="preset-chip ${gap === 0.15 ? 'active' : ''}" data-gap="0.15">0.15" Spaced</button>
        </div>
      </div>

      <!-- Multi-Photo Queue Fill -->
      <div class="panel-section" id="section-multi-photo" style="${photoCount > 1 ? '' : 'display:none;'}">
        <div class="panel-label">Multi-Photo Queue Fill</div>
        <div class="fit-mode-toggle" id="distribute-mode-toggle">
          <button class="fit-btn ${distributeMode === 'distribute' ? 'active' : ''}" data-distribute="distribute" title="Distribute all loaded photos across sheet">
            Distribute Queue
          </button>
          <button class="fit-btn ${distributeMode === 'repeat' ? 'active' : ''}" data-distribute="repeat" title="Only repeat currently selected photo">
            Repeat Active
          </button>
        </div>
      </div>

      <!-- Paper Space Efficiency & Cost Estimator -->
      <div class="panel-section" id="section-paper-efficiency">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div class="panel-label" style="margin-bottom:0">Paper Space Efficiency & Cost</div>
          <span class="efficiency-badge" id="efficiency-badge-percent" style="font-size:10px; font-weight:700; padding:2px 6px; border-radius:10px; background:rgba(16,185,129,0.15); color:#10b981;">0% Utilized</span>
        </div>
        
        <div class="efficiency-meter-bar" style="height:6px; background:var(--bg-card); border-radius:4px; overflow:hidden; margin-bottom:8px; border:1px solid var(--border-color);">
          <div class="efficiency-meter-fill" id="efficiency-meter-fill" style="width:0%; height:100%; background:#10b981; transition:width 0.3s ease;"></div>
        </div>

        <div class="efficiency-stats-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; margin-bottom:8px;">
          <div style="background:var(--bg-card); padding:6px 8px; border-radius:6px; border:1px solid var(--border-color);">
            <div style="color:var(--text-muted); font-size:10px;">Sheet Area</div>
            <div id="stat-sheet-area" style="font-weight:600; color:var(--text-main);">0 sq in</div>
          </div>
          <div style="background:var(--bg-card); padding:6px 8px; border-radius:6px; border:1px solid var(--border-color);">
            <div style="color:var(--text-muted); font-size:10px;">Photos Covered</div>
            <div id="stat-used-area" style="font-weight:600; color:var(--text-main);">0 sq in</div>
          </div>
          <div style="background:var(--bg-card); padding:6px 8px; border-radius:6px; border:1px solid var(--border-color);">
            <div style="color:var(--text-muted); font-size:10px;">Trim Margins (Saved)</div>
            <div id="stat-unused-percent" style="font-weight:600; color:#10b981;">100% blank</div>
          </div>
          <div style="background:var(--bg-card); padding:6px 8px; border-radius:6px; border:1px solid var(--border-color);">
            <div style="color:var(--text-muted); font-size:10px;">Printed Photos</div>
            <div id="stat-total-photos" style="font-weight:600; color:var(--text-main);">0 pcs</div>
          </div>
        </div>

        <!-- Quick Economics Estimator -->
        <div class="economics-drawer" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:8px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; font-weight:700; color:var(--text-main);">💵 Print Cost & Profit</span>
            <span id="econ-net-profit" style="font-size:11px; font-weight:800; color:#10b981;">₱0.00 profit</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center; font-size:11px;">
            <label style="flex:1; display:flex; flex-direction:column; gap:2px; color:var(--text-muted);">
              <span style="font-size:9.5px;">Paper Cost (₱)</span>
              <input type="number" id="input-paper-cost" min="0" step="0.5" value="5.00" style="padding:4px 6px; font-size:11px; background:var(--bg-canvas); border:1px solid var(--border-color); border-radius:4px; color:var(--text-main); width:100%; box-sizing:border-box;" />
            </label>
            <label style="flex:1; display:flex; flex-direction:column; gap:2px; color:var(--text-muted);">
              <span style="font-size:9.5px;">Price / Photo (₱)</span>
              <input type="number" id="input-price-per-id" min="0" step="5" value="30.00" style="padding:4px 6px; font-size:11px; background:var(--bg-canvas); border:1px solid var(--border-color); border-radius:4px; color:var(--text-main); width:100%; box-sizing:border-box;" />
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize print settings listeners
 */
export function initPrintSettings(containerEl, onChange, currentState = {}) {
  const toggleOrientation = containerEl.querySelector('#orientation-toggle');
  const toggleAlignment   = containerEl.querySelector('#alignment-toggle');
  const toggleFit         = containerEl.querySelector('#fit-mode-toggle');
  const toggleGuide       = containerEl.querySelector('#guide-type-toggle');
  const sliderMargin      = containerEl.querySelector('#slider-sheet-margin');
  const sliderGap         = containerEl.querySelector('#slider-photo-gap');
  const valMargin         = containerEl.querySelector('#val-sheet-margin');
  const valGap            = containerEl.querySelector('#val-photo-gap');
  const marginPresets     = containerEl.querySelector('#margin-presets');
  const gapPresets        = containerEl.querySelector('#gap-presets');
  const toggleDistribute  = containerEl.querySelector('#distribute-mode-toggle');
  const printerProfileSel = containerEl.querySelector('#printer-profile-select');

  if (printerProfileSel) {
    printerProfileSel.addEventListener('change', () => {
      const selected = PRINTER_PROFILES.find(p => p.id === printerProfileSel.value);
      if (selected) {
        if (sliderMargin) {
          sliderMargin.value = selected.margin;
          valMargin.textContent = formatDimension(selected.margin);
          updateMarginChip(selected.margin);
        }
        if (sliderGap) {
          sliderGap.value = selected.gap;
          valGap.textContent = selected.gap === 0 ? '0 (Zero-gap)' : formatDimension(selected.gap);
          updateGapChip(selected.gap);
        }
        onChange({ margin: selected.margin, gap: selected.gap });
      }
    });
  }

  if (toggleOrientation) {
    toggleOrientation.querySelectorAll('.orientation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleOrientation.querySelectorAll('.orientation-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onChange({ orientation: btn.dataset.orientation });
      });
    });
  }

  if (toggleAlignment) {
    toggleAlignment.querySelectorAll('.orientation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleAlignment.querySelectorAll('.orientation-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onChange({ alignment: btn.dataset.alignment });
      });
    });
  }

  if (toggleFit) {
    toggleFit.querySelectorAll('.fit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleFit.querySelectorAll('.fit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onChange({ fitMode: btn.dataset.fit });
      });
    });
  }

  if (toggleGuide) {
    const guideColorPresets = containerEl.querySelector('#guide-color-presets');
    toggleGuide.querySelectorAll('.fit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleGuide.querySelectorAll('.fit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const guideType = btn.dataset.guide;
        if (guideColorPresets) {
          guideColorPresets.style.display = guideType === 'none' ? 'none' : 'flex';
        }
        onChange({ guideType });
      });
    });

    if (guideColorPresets) {
      guideColorPresets.querySelectorAll('.preset-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          guideColorPresets.querySelectorAll('.preset-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          onChange({ guideColor: btn.dataset.color });
        });
      });
    }
  }

  if (sliderMargin) {
    sliderMargin.addEventListener('input', () => {
      const val = parseFloat(sliderMargin.value);
      valMargin.textContent = formatDimension(val);
      updateMarginChip(val);
      onChange({ margin: val });
    });
  }

  if (marginPresets) {
    marginPresets.querySelectorAll('.preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.margin);
        sliderMargin.value = val;
        valMargin.textContent = formatDimension(val);
        updateMarginChip(val);
        onChange({ margin: val });
      });
    });
  }

  function updateMarginChip(val) {
    if (!marginPresets) return;
    marginPresets.querySelectorAll('.preset-chip').forEach(c => {
      c.classList.toggle('active', Math.abs(parseFloat(c.dataset.margin) - val) < 0.01);
    });
  }

  if (sliderGap) {
    sliderGap.addEventListener('input', () => {
      const val = parseFloat(sliderGap.value);
      valGap.textContent = val === 0 ? '0 (Zero-gap)' : formatDimension(val);
      updateGapChip(val);
      onChange({ gap: val });
    });
  }

  if (gapPresets) {
    gapPresets.querySelectorAll('.preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.gap);
        sliderGap.value = val;
        valGap.textContent = val === 0 ? '0 (Zero-gap)' : formatDimension(val);
        updateGapChip(val);
        onChange({ gap: val });
      });
    });
  }

  function updateGapChip(val) {
    if (!gapPresets) return;
    gapPresets.querySelectorAll('.preset-chip').forEach(c => {
      c.classList.toggle('active', Math.abs(parseFloat(c.dataset.gap) - val) < 0.01);
    });
  }

  if (toggleDistribute) {
    toggleDistribute.querySelectorAll('.fit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleDistribute.querySelectorAll('.fit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onChange({ distributeMode: btn.dataset.distribute });
      });
    });
  }

  const inputWatermark = containerEl.querySelector('#input-watermark-text');
  const checkFooter    = containerEl.querySelector('#check-footer-info');

  if (inputWatermark) {
    inputWatermark.addEventListener('input', () => {
      const val = inputWatermark.value.trim();
      containerEl.querySelectorAll('[data-wm]').forEach(b => b.classList.toggle('active', b.dataset.wm === val && val !== ''));
      onChange({ watermark: val });
    });
    containerEl.querySelectorAll('[data-wm]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.wm;
        inputWatermark.value = val;
        containerEl.querySelectorAll('[data-wm]').forEach(b => b.classList.toggle('active', b.dataset.wm === val && val !== ''));
        onChange({ watermark: val });
      });
    });
  }

  if (checkFooter) {
    checkFooter.addEventListener('change', () => {
      onChange({ showFooterInfo: checkFooter.checked });
    });
  }

  const inputPaperCost = containerEl.querySelector('#input-paper-cost');
  const inputPricePerId = containerEl.querySelector('#input-price-per-id');
  const badgePercent = containerEl.querySelector('#efficiency-badge-percent');
  const meterFill = containerEl.querySelector('#efficiency-meter-fill');
  const statSheetArea = containerEl.querySelector('#stat-sheet-area');
  const statUsedArea = containerEl.querySelector('#stat-used-area');
  const statUnusedPercent = containerEl.querySelector('#stat-unused-percent');
  const statTotalPhotos = containerEl.querySelector('#stat-total-photos');
  const econNetProfit = containerEl.querySelector('#econ-net-profit');

  let currentTotalPhotos = 0;

  function recalculateEconomics() {
    if (!econNetProfit) return;
    const paperCost = parseFloat(inputPaperCost?.value || '0') || 0;
    const pricePerId = parseFloat(inputPricePerId?.value || '0') || 0;
    const gross = currentTotalPhotos * pricePerId;
    const profit = Math.max(0, gross - paperCost);
    econNetProfit.textContent = `₱${profit.toFixed(2)} profit`;
  }

  if (inputPaperCost) inputPaperCost.addEventListener('input', recalculateEconomics);
  if (inputPricePerId) inputPricePerId.addEventListener('input', recalculateEconomics);

  return {
    updatePhotoCount: (count) => {
      const sec = containerEl.querySelector('#section-multi-photo');
      if (sec) sec.style.display = count > 1 ? 'block' : 'none';
    },
    updateEfficiency: ({ sheetArea = 0, usedArea = 0, utilizationPercent = 0, unusedPercent = 100, totalPhotos = 0 } = {}) => {
      currentTotalPhotos = totalPhotos;
      if (badgePercent) badgePercent.textContent = `${utilizationPercent}% Utilized`;
      if (meterFill) {
        meterFill.style.width = `${Math.min(100, utilizationPercent)}%`;
        meterFill.style.background = utilizationPercent > 70 ? '#10b981' : (utilizationPercent > 40 ? '#f59e0b' : '#64748b');
      }
      if (statSheetArea) statSheetArea.textContent = `${sheetArea} sq in`;
      if (statUsedArea) statUsedArea.textContent = `${usedArea} sq in`;
      if (statUnusedPercent) statUnusedPercent.textContent = `${unusedPercent}% blank`;
      if (statTotalPhotos) statTotalPhotos.textContent = `${totalPhotos} pcs`;
      recalculateEconomics();
    },
    refreshUnits: () => {
      if (sliderMargin && valMargin) {
        valMargin.textContent = formatDimension(parseFloat(sliderMargin.value));
      }
      if (sliderGap && valGap) {
        const g = parseFloat(sliderGap.value);
        valGap.textContent = g === 0 ? '0 (Zero-gap)' : formatDimension(g);
      }
    }
  };
}
