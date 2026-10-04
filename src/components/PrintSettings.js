/**
 * PrintSettings component
 * Controls for sheet paper orientation (portrait/landscape), photo fit mode,
 * cutting guides (corner marks vs dashed borders), sheet margins & presets,
 * photo gaps & presets, and multi-photo distribution.
 */
import { formatDimension } from '../lib/sizes.js';

export function PrintSettingsHTML({
  orientation = 'portrait', // 'portrait' | 'landscape'
  alignment = 'top-left', // 'top-left' | 'center'
  fitMode = 'cover',
  guideType = 'corners', // 'corners' | 'border' | 'none'
  margin = 0.2,
  gap = 0.05,
  distributeMode = 'repeat', // 'repeat' | 'distribute'
  photoCount = 1,
} = {}) {
  return `
    <div class="print-settings">
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
    toggleGuide.querySelectorAll('.fit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleGuide.querySelectorAll('.fit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onChange({ guideType: btn.dataset.guide });
      });
    });
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

  return {
    updatePhotoCount: (count) => {
      const sec = containerEl.querySelector('#section-multi-photo');
      if (sec) sec.style.display = count > 1 ? 'block' : 'none';
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
