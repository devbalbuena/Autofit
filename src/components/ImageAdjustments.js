/**
 * ImageAdjustments component
 * Controls for brightness, contrast, saturation, B&W (grayscale), and rotation.
 */

export function ImageAdjustmentsHTML(state = {}) {
  const brightness = state.brightness ?? 100;
  const contrast   = state.contrast ?? 100;
  const saturation = state.saturation ?? 100;
  const isBW       = state.isBW ?? false;
  const rotation   = state.rotation ?? 0;

  return `
    <div class="panel-section adjustments-panel">
      <div class="panel-section-header">
        <div class="panel-label" style="margin-bottom:0">🎨 Photo Enhancements</div>
        <button class="btn-adjust-reset" id="btn-adjust-reset" title="Reset all adjustments">Reset</button>
      </div>

      <div class="adjust-controls-grid">
        <!-- Quick Action Buttons -->
        <div class="adjust-actions-row">
          <button class="adjust-action-btn ${isBW ? 'active' : ''}" id="btn-toggle-bw" title="Toggle Black & White">
            <span>⚫/⚪</span> B&W Mode
          </button>
          <button class="adjust-action-btn" id="btn-rotate-90" title="Rotate 90° Clockwise">
            <span>🔄</span> Rotate (${rotation}°)
          </button>
        </div>

        <!-- Brightness Slider -->
        <div class="adjust-slider-group">
          <div class="slider-header">
            <span>Brightness</span>
            <span class="slider-val" id="val-brightness">${brightness}%</span>
          </div>
          <input type="range" id="slider-brightness" min="50" max="150" value="${brightness}" step="1" />
        </div>

        <!-- Contrast Slider -->
        <div class="adjust-slider-group">
          <div class="slider-header">
            <span>Contrast</span>
            <span class="slider-val" id="val-contrast">${contrast}%</span>
          </div>
          <input type="range" id="slider-contrast" min="50" max="150" value="${contrast}" step="1" />
        </div>

        <!-- Saturation Slider -->
        <div class="adjust-slider-group" id="group-saturation" style="${isBW ? 'opacity:0.4;pointer-events:none' : ''}">
          <div class="slider-header">
            <span>Saturation</span>
            <span class="slider-val" id="val-saturation">${saturation}%</span>
          </div>
          <input type="range" id="slider-saturation" min="0" max="200" value="${saturation}" step="1" />
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate a CSS filter string from current adjustments state
 */
export function getCSSFilterString(state) {
  const brightness = (state.brightness ?? 100) / 100;
  const contrast   = (state.contrast ?? 100) / 100;
  const saturation = state.isBW ? 0 : (state.saturation ?? 100) / 100;
  const grayscale  = state.isBW ? 1 : 0;

  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) grayscale(${grayscale})`;
}

/**
 * Initialize ImageAdjustments event listeners
 */
export function initImageAdjustments(containerEl, onChange, currentState = {}) {
  let state = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    isBW: false,
    rotation: 0,
    ...currentState,
  };

  const sliderBright = containerEl.querySelector('#slider-brightness');
  const sliderContr  = containerEl.querySelector('#slider-contrast');
  const sliderSat    = containerEl.querySelector('#slider-saturation');
  const valBright    = containerEl.querySelector('#val-brightness');
  const valContr     = containerEl.querySelector('#val-contrast');
  const valSat       = containerEl.querySelector('#val-saturation');
  const btnBW        = containerEl.querySelector('#btn-toggle-bw');
  const btnRotate    = containerEl.querySelector('#btn-rotate-90');
  const btnReset     = containerEl.querySelector('#btn-adjust-reset');
  const groupSat     = containerEl.querySelector('#group-saturation');

  function notify() {
    onChange({ ...state, filterString: getCSSFilterString(state) });
  }

  if (sliderBright) {
    sliderBright.addEventListener('input', () => {
      state.brightness = parseInt(sliderBright.value, 10);
      valBright.textContent = `${state.brightness}%`;
      notify();
    });
  }

  if (sliderContr) {
    sliderContr.addEventListener('input', () => {
      state.contrast = parseInt(sliderContr.value, 10);
      valContr.textContent = `${state.contrast}%`;
      notify();
    });
  }

  if (sliderSat) {
    sliderSat.addEventListener('input', () => {
      state.saturation = parseInt(sliderSat.value, 10);
      valSat.textContent = `${state.saturation}%`;
      notify();
    });
  }

  if (btnBW) {
    btnBW.addEventListener('click', () => {
      state.isBW = !state.isBW;
      btnBW.classList.toggle('active', state.isBW);
      if (groupSat) groupSat.style.opacity = state.isBW ? '0.4' : '1';
      if (groupSat) groupSat.style.pointerEvents = state.isBW ? 'none' : 'auto';
      notify();
    });
  }

  if (btnRotate) {
    btnRotate.addEventListener('click', () => {
      state.rotation = (state.rotation + 90) % 360;
      btnRotate.innerHTML = `<span>🔄</span> Rotate (${state.rotation}°)`;
      notify();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state = { brightness: 100, contrast: 100, saturation: 100, isBW: false, rotation: 0 };
      if (sliderBright) { sliderBright.value = 100; valBright.textContent = '100%'; }
      if (sliderContr)  { sliderContr.value = 100; valContr.textContent = '100%'; }
      if (sliderSat)    { sliderSat.value = 100; valSat.textContent = '100%'; }
      if (btnBW)        { btnBW.classList.remove('active'); }
      if (btnRotate)    { btnRotate.innerHTML = '<span>🔄</span> Rotate (0°)'; }
      if (groupSat)     { groupSat.style.opacity = '1'; groupSat.style.pointerEvents = 'auto'; }
      notify();
    });
  }

  return {
    getState: () => ({ ...state, filterString: getCSSFilterString(state) }),
    reset: () => btnReset?.click(),
  };
}
