/**
 * PrintSettings component
 * Provides controls for image fit mode (cover/contain), cutting guides, margins, and paper orientation.
 */

export function PrintSettingsHTML({ fitMode = 'cover', showCutGuides = true, margin = 0.2 }) {
  return `
    <div class="print-settings">
      <div class="panel-section">
        <div class="panel-label">Photo Fit Mode</div>
        <div class="fit-mode-toggle" id="fit-mode-toggle">
          <button class="fit-btn ${fitMode === 'cover' ? 'active' : ''}" data-fit="cover" title="Fill entire photo box (crops edges if needed)">
            Fill (Cover)
          </button>
          <button class="fit-btn ${fitMode === 'contain' ? 'active' : ''}" data-fit="contain" title="Fit whole photo (no cropping, may have borders)">
            Fit (Contain)
          </button>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-label">Print Options</div>
        <label class="setting-checkbox-row">
          <input type="checkbox" id="check-cut-guides" ${showCutGuides ? 'checked' : ''} />
          <span>Show Cutting Lines</span>
        </label>
      </div>
    </div>
  `;
}

/**
 * Initialize print settings listeners
 */
export function initPrintSettings(containerEl, onChange) {
  const toggleEl = containerEl.querySelector('#fit-mode-toggle');
  const cutGuidesEl = containerEl.querySelector('#check-cut-guides');

  if (toggleEl) {
    toggleEl.querySelectorAll('.fit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleEl.querySelectorAll('.fit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onChange({ fitMode: btn.dataset.fit });
      });
    });
  }

  if (cutGuidesEl) {
    cutGuidesEl.addEventListener('change', () => {
      onChange({ showCutGuides: cutGuidesEl.checked });
    });
  }
}
