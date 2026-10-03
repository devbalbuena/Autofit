/**
 * PrintSettings component
 * Controls for photo fit mode, cutting guides (corner marks vs dashed borders),
 * sheet printable margins, photo gaps, and multi-photo distribution.
 */

export function PrintSettingsHTML({
  fitMode = 'cover',
  guideType = 'corners', // 'corners' | 'border' | 'none'
  margin = 0.2,
  gap = 0.05,
  distributeMode = 'repeat', // 'repeat' | 'distribute'
  photoCount = 1,
} = {}) {
  return `
    <div class="print-settings">
      <!-- Fit Mode -->
      <div class="panel-section">
        <div class="panel-label">Photo Fit Mode</div>
        <div class="fit-mode-toggle" id="fit-mode-toggle">
          <button class="fit-btn ${fitMode === 'cover' ? 'active' : ''}" data-fit="cover" title="Fill frame (crop edges if aspect differs)">
            Fill (Cover)
          </button>
          <button class="fit-btn ${fitMode === 'contain' ? 'active' : ''}" data-fit="contain" title="Fit entire photo (letterbox borders)">
            Fit (Contain)
          </button>
        </div>
      </div>

      <!-- Cutting & Crop Marks -->
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

      <!-- Margin & Gutter / Gap -->
      <div class="panel-section">
        <div class="panel-label">Paper Margins & Photo Spacing</div>
        <div class="adjust-controls-grid">
          <div class="adjust-slider-group">
            <div class="slider-header">
              <span>Sheet Margin</span>
              <span class="slider-val" id="val-sheet-margin">${margin.toFixed(2)}"</span>
            </div>
            <input type="range" id="slider-sheet-margin" min="0" max="0.75" step="0.05" value="${margin}" />
          </div>

          <div class="adjust-slider-group">
            <div class="slider-header">
              <span>Photo Gap (Gutter)</span>
              <span class="slider-val" id="val-photo-gap">${gap === 0 ? '0 (Zero-gap)' : `${gap.toFixed(2)}"`}</span>
            </div>
            <input type="range" id="slider-photo-gap" min="0" max="0.30" step="0.01" value="${gap}" />
          </div>
        </div>
      </div>

      <!-- Multi-Photo Mode (shown when multiple photos exist) -->
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
  const toggleFit       = containerEl.querySelector('#fit-mode-toggle');
  const toggleGuide     = containerEl.querySelector('#guide-type-toggle');
  const sliderMargin    = containerEl.querySelector('#slider-sheet-margin');
  const sliderGap       = containerEl.querySelector('#slider-photo-gap');
  const valMargin       = containerEl.querySelector('#val-sheet-margin');
  const valGap          = containerEl.querySelector('#val-photo-gap');
  const toggleDistribute= containerEl.querySelector('#distribute-mode-toggle');

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
      valMargin.textContent = `${val.toFixed(2)}"`;
      onChange({ margin: val });
    });
  }

  if (sliderGap) {
    sliderGap.addEventListener('input', () => {
      const val = parseFloat(sliderGap.value);
      valGap.textContent = val === 0 ? '0 (Zero-gap)' : `${val.toFixed(2)}"`;
      onChange({ gap: val });
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
    }
  };
}
