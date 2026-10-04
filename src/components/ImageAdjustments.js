/**
 * ImageAdjustments component
 * Controls for brightness, contrast, saturation, B&W (grayscale), 90° rotation,
 * fine angle tilt straighten (-15° to +15°), mirror/flip, pan & zoom framing,
 * ID Name Tag banner, and ID background presets.
 */

export function ImageAdjustmentsHTML(state = {}) {
  const brightness = state.brightness ?? 100;
  const contrast   = state.contrast ?? 100;
  const saturation = state.saturation ?? 100;
  const isBW       = state.isBW ?? false;
  const rotation   = state.rotation ?? 0;
  const tilt       = state.tilt ?? 0;
  const flipH      = state.flipH ?? false;
  const flipV      = state.flipV ?? false;
  const zoom       = state.zoom ?? 1;
  const panX       = state.panX ?? 0;
  const panY       = state.panY ?? 0;
  const bgPreset   = state.bgPreset ?? 'none';
  const showOval   = state.showOval ?? false;

  const nameTagEnabled = state.nameTag?.enabled ?? false;
  const nameTagText    = state.nameTag?.text ?? '';
  const nameTagSub     = state.nameTag?.sub ?? '';

  return `
    <div class="panel-section adjustments-panel">
      <!-- ── SECTION A: Framing, Pan & Zoom ── -->
      <div class="panel-section-header">
        <div class="panel-label">🔍 Framing & Face Centering</div>
        <button class="btn-adjust-reset" id="btn-framing-reset" title="Reset framing">Reset</button>
      </div>

      <div style="font-size:10.5px;color:var(--accent-hover);margin-bottom:4px;">
        💡 Tip: You can also click & drag directly on the photo to position!
      </div>

      <div class="adjust-controls-grid">
        <div class="adjust-slider-group">
          <div class="slider-header">
            <span>Zoom Scale</span>
            <span class="slider-val" id="val-zoom">${Math.round(zoom * 100)}%</span>
          </div>
          <input type="range" id="slider-zoom" min="100" max="250" value="${Math.round(zoom * 100)}" step="5" />
        </div>

        <div class="adjust-slider-group">
          <div class="slider-header">
            <span>Position Y (Vertical)</span>
            <span class="slider-val" id="val-pan-y">${panY > 0 ? `+${panY}%` : `${panY}%`}</span>
          </div>
          <input type="range" id="slider-pan-y" min="-60" max="60" value="${panY}" step="1" />
        </div>

        <div class="adjust-slider-group">
          <div class="slider-header">
            <span>Position X (Horizontal)</span>
            <span class="slider-val" id="val-pan-x">${panX > 0 ? `+${panX}%` : `${panX}%`}</span>
          </div>
          <input type="range" id="slider-pan-x" min="-60" max="60" value="${panX}" step="1" />
        </div>

        <label class="setting-checkbox-row" style="margin-top:4px">
          <input type="checkbox" id="check-oval-guide" ${showOval ? 'checked' : ''} />
          <span>Show Passport Face Guideline Oval</span>
        </label>
      </div>

      <div class="panel-divider"></div>

      <!-- ── SECTION B: Rotation, Fine Tilt & Mirror ── -->
      <div class="panel-section-header">
        <div class="panel-label">🔄 Orientation & Fine Straighten</div>
      </div>

      <div class="adjust-actions-row">
        <button class="adjust-action-btn" id="btn-rotate-ccw" title="Rotate 90° Counter-Clockwise">
          <span>↺</span> -90°
        </button>
        <button class="adjust-action-btn" id="btn-rotate-cw" title="Rotate 90° Clockwise">
          <span>↻</span> +90° (${rotation}°)
        </button>
        <button class="adjust-action-btn ${flipH ? 'active' : ''}" id="btn-flip-h" title="Flip Horizontal (Mirror Selfie)">
          <span>⇄</span> Mirror
        </button>
        <button class="adjust-action-btn ${flipV ? 'active' : ''}" id="btn-flip-v" title="Flip Vertical">
          <span>⇅</span> Flip V
        </button>
      </div>

      <!-- Fine Angle Tilt Straighten Slider -->
      <div class="adjust-slider-group" style="margin-top:8px;">
        <div class="slider-header">
          <span>Fine Angle Straighten</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="slider-val" id="val-tilt">${tilt > 0 ? `+${tilt.toFixed(1)}°` : `${tilt.toFixed(1)}°`}</span>
            <button class="btn-adjust-reset" id="btn-tilt-reset" title="Reset tilt to 0°" style="padding:1px 5px;font-size:10px">0° Reset</button>
          </div>
        </div>
        <input type="range" id="slider-tilt" min="-15" max="15" step="0.5" value="${tilt}" />
      </div>

      <div class="panel-divider"></div>

      <!-- ── SECTION C: Photo Enhancements ── -->
      <div class="panel-section-header">
        <div class="panel-label">🎨 Color & Enhancements</div>
        <button class="btn-adjust-reset" id="btn-adjust-reset" title="Reset all adjustments">Reset</button>
      </div>

      <div class="adjust-controls-grid">
        <div class="adjust-actions-row" style="margin-bottom:8px">
          <button class="adjust-action-btn ${isBW ? 'active' : ''}" id="btn-toggle-bw" title="Toggle Black & White" style="flex:1">
            <span>⚫/⚪</span> Black & White
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

        <!-- Background Tint -->
        <div class="adjust-slider-group" style="margin-top:6px">
          <div class="slider-header">
            <span>Background Tint</span>
          </div>
          <div class="bg-tint-picker" id="bg-tint-picker">
            <button class="bg-tint-btn ${bgPreset === 'none' ? 'active' : ''}" data-bg="none" title="No Tint">None</button>
            <button class="bg-tint-btn ${bgPreset === 'white' ? 'active' : ''}" data-bg="white" title="White Backdrop" style="background:#ffffff;color:#000">White</button>
            <button class="bg-tint-btn ${bgPreset === 'blue' ? 'active' : ''}" data-bg="blue" title="Royal Blue Backdrop" style="background:#1d4ed8;color:#fff">Blue</button>
            <button class="bg-tint-btn ${bgPreset === 'red' ? 'active' : ''}" data-bg="red" title="Red Backdrop" style="background:#dc2626;color:#fff">Red</button>
            <button class="bg-tint-btn ${bgPreset === 'gray' ? 'active' : ''}" data-bg="gray" title="Passport Gray" style="background:#e2e8f0;color:#000">Gray</button>
          </div>
        </div>
      </div>

      <div class="panel-divider"></div>

      <!-- ── SECTION D: ID Name Tag Banner (Gov / PRC / School) ── -->
      <div class="panel-section-header">
        <div class="panel-label">🪪 ID Name Tag Banner</div>
      </div>

      <div class="adjust-controls-grid">
        <label class="setting-checkbox-row">
          <input type="checkbox" id="check-nametag-enable" ${nameTagEnabled ? 'checked' : ''} />
          <span><b>Add Nameplate Banner</b> (Bottom of photo)</span>
        </label>

        <div id="nametag-fields" style="${nameTagEnabled ? '' : 'display:none;'}">
          <input type="text" class="input-text-nametag" id="input-nametag-text"
                 placeholder="SURNAME, FIRST NAME M.I." value="${nameTagText}" />
          <input type="text" class="input-text-nametag" id="input-nametag-sub"
                 placeholder="Position / Signature / Date (Optional)" value="${nameTagSub}" style="margin-top:6px;font-size:11px" />
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate CSS Filter string
 */
export function getCSSFilterString(state = {}) {
  const brightness = (state.brightness ?? 100) / 100;
  const contrast   = (state.contrast ?? 100) / 100;
  const saturation = state.isBW ? 0 : (state.saturation ?? 100) / 100;
  const grayscale  = state.isBW ? 1 : 0;

  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) grayscale(${grayscale})`;
}

/**
 * Generate CSS Transform string (Pan, Zoom, 90° Rotation + Fine Tilt, Flip)
 */
export function getCSSTransformString(state = {}) {
  const rot   = state.rotation ?? 0;
  const tilt  = state.tilt ?? 0;
  const totalAngle = rot + tilt;
  const flipH = state.flipH ? -1 : 1;
  const flipV = state.flipV ? -1 : 1;
  const zoom  = state.zoom ?? 1;
  const panX  = state.panX ?? 0;
  const panY  = state.panY ?? 0;

  const parts = [];
  if (panX !== 0 || panY !== 0) {
    parts.push(`translate(${panX}%, ${panY}%)`);
  }
  if (totalAngle !== 0) {
    parts.push(`rotate(${totalAngle}deg)`);
  }
  if (flipH !== 1 || flipV !== 1) {
    parts.push(`scale(${flipH}, ${flipV})`);
  }
  if (zoom !== 1) {
    parts.push(`scale(${zoom})`);
  }

  return parts.join(' ');
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
    ...currentState,
  };

  const sliderBright = containerEl.querySelector('#slider-brightness');
  const sliderContr  = containerEl.querySelector('#slider-contrast');
  const sliderSat    = containerEl.querySelector('#slider-saturation');
  const valBright    = containerEl.querySelector('#val-brightness');
  const valContr     = containerEl.querySelector('#val-contrast');
  const valSat       = containerEl.querySelector('#val-saturation');
  const btnBW        = containerEl.querySelector('#btn-toggle-bw');
  const btnRotateCW  = containerEl.querySelector('#btn-rotate-cw');
  const btnRotateCCW = containerEl.querySelector('#btn-rotate-ccw');
  const sliderTilt   = containerEl.querySelector('#slider-tilt');
  const valTilt      = containerEl.querySelector('#val-tilt');
  const btnTiltReset = containerEl.querySelector('#btn-tilt-reset');
  const btnFlipH     = containerEl.querySelector('#btn-flip-h');
  const btnFlipV     = containerEl.querySelector('#btn-flip-v');
  const btnReset     = containerEl.querySelector('#btn-adjust-reset');
  const groupSat     = containerEl.querySelector('#group-saturation');

  const sliderZoom   = containerEl.querySelector('#slider-zoom');
  const sliderPanX   = containerEl.querySelector('#slider-pan-x');
  const sliderPanY   = containerEl.querySelector('#slider-pan-y');
  const valZoom      = containerEl.querySelector('#val-zoom');
  const valPanX      = containerEl.querySelector('#val-pan-x');
  const valPanY      = containerEl.querySelector('#val-pan-y');
  const btnFramingReset = containerEl.querySelector('#btn-framing-reset');
  const checkOval    = containerEl.querySelector('#check-oval-guide');

  const bgPicker     = containerEl.querySelector('#bg-tint-picker');
  const checkNameTag = containerEl.querySelector('#check-nametag-enable');
  const nametagFields= containerEl.querySelector('#nametag-fields');
  const inputNameText= containerEl.querySelector('#input-nametag-text');
  const inputNameSub = containerEl.querySelector('#input-nametag-sub');

  function notify() {
    onChange({
      ...state,
      filterString: getCSSFilterString(state),
      transformString: getCSSTransformString(state),
    });
  }

  // Color sliders
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

  // Framing & Pan/Zoom
  if (sliderZoom) {
    sliderZoom.addEventListener('input', () => {
      state.zoom = parseFloat(sliderZoom.value) / 100;
      valZoom.textContent = `${Math.round(state.zoom * 100)}%`;
      notify();
    });
  }
  if (sliderPanX) {
    sliderPanX.addEventListener('input', () => {
      state.panX = parseInt(sliderPanX.value, 10);
      valPanX.textContent = `${state.panX > 0 ? '+' : ''}${state.panX}%`;
      notify();
    });
  }
  if (sliderPanY) {
    sliderPanY.addEventListener('input', () => {
      state.panY = parseInt(sliderPanY.value, 10);
      valPanY.textContent = `${state.panY > 0 ? '+' : ''}${state.panY}%`;
      notify();
    });
  }
  if (btnFramingReset) {
    btnFramingReset.addEventListener('click', () => {
      state.zoom = 1;
      state.panX = 0;
      state.panY = 0;
      if (sliderZoom) { sliderZoom.value = 100; valZoom.textContent = '100%'; }
      if (sliderPanX) { sliderPanX.value = 0; valPanX.textContent = '0%'; }
      if (sliderPanY) { sliderPanY.value = 0; valPanY.textContent = '0%'; }
      notify();
    });
  }
  if (checkOval) {
    checkOval.addEventListener('change', () => {
      state.showOval = checkOval.checked;
      notify();
    });
  }

  // Orientation & Fine Tilt
  if (btnRotateCW) {
    btnRotateCW.addEventListener('click', () => {
      state.rotation = (state.rotation + 90) % 360;
      btnRotateCW.innerHTML = `<span>↻</span> +90° (${state.rotation}°)`;
      notify();
    });
  }
  if (btnRotateCCW) {
    btnRotateCCW.addEventListener('click', () => {
      state.rotation = (state.rotation - 90 + 360) % 360;
      btnRotateCW.innerHTML = `<span>↻</span> +90° (${state.rotation}°)`;
      notify();
    });
  }
  if (sliderTilt) {
    sliderTilt.addEventListener('input', () => {
      state.tilt = parseFloat(sliderTilt.value);
      valTilt.textContent = state.tilt > 0 ? `+${state.tilt.toFixed(1)}°` : `${state.tilt.toFixed(1)}°`;
      notify();
    });
  }
  if (btnTiltReset) {
    btnTiltReset.addEventListener('click', () => {
      state.tilt = 0;
      if (sliderTilt) sliderTilt.value = 0;
      if (valTilt) valTilt.textContent = '0.0°';
      notify();
    });
  }
  if (btnFlipH) {
    btnFlipH.addEventListener('click', () => {
      state.flipH = !state.flipH;
      btnFlipH.classList.toggle('active', state.flipH);
      notify();
    });
  }
  if (btnFlipV) {
    btnFlipV.addEventListener('click', () => {
      state.flipV = !state.flipV;
      btnFlipV.classList.toggle('active', state.flipV);
      notify();
    });
  }

  // Reset Color
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.brightness = 100;
      state.contrast = 100;
      state.saturation = 100;
      state.isBW = false;
      state.bgPreset = 'none';
      if (sliderBright) { sliderBright.value = 100; valBright.textContent = '100%'; }
      if (sliderContr)  { sliderContr.value = 100; valContr.textContent = '100%'; }
      if (sliderSat)    { sliderSat.value = 100; valSat.textContent = '100%'; }
      if (btnBW)        { btnBW.classList.remove('active'); }
      if (groupSat)     { groupSat.style.opacity = '1'; groupSat.style.pointerEvents = 'auto'; }
      if (bgPicker) {
        bgPicker.querySelectorAll('.bg-tint-btn').forEach(b => b.classList.toggle('active', b.dataset.bg === 'none'));
      }
      notify();
    });
  }

  // Background tint buttons
  if (bgPicker) {
    bgPicker.querySelectorAll('.bg-tint-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        bgPicker.querySelectorAll('.bg-tint-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.bgPreset = btn.dataset.bg;
        notify();
      });
    });
  }

  // ID Name Tag
  if (checkNameTag) {
    checkNameTag.addEventListener('change', () => {
      state.nameTag = {
        ...state.nameTag,
        enabled: checkNameTag.checked,
      };
      if (nametagFields) {
        nametagFields.style.display = checkNameTag.checked ? 'block' : 'none';
      }
      notify();
    });
  }

  if (inputNameText) {
    inputNameText.addEventListener('input', () => {
      state.nameTag = {
        ...state.nameTag,
        text: inputNameText.value.toUpperCase(),
      };
      inputNameText.value = state.nameTag.text;
      notify();
    });
  }

  if (inputNameSub) {
    inputNameSub.addEventListener('input', () => {
      state.nameTag = {
        ...state.nameTag,
        sub: inputNameSub.value,
      };
      notify();
    });
  }

  return {
    getState: () => ({ ...state }),
    updatePan: (newPanX, newPanY) => {
      state.panX = Math.round(newPanX);
      state.panY = Math.round(newPanY);
      if (sliderPanX) {
        sliderPanX.value = state.panX;
        valPanX.textContent = `${state.panX > 0 ? '+' : ''}${state.panX}%`;
      }
      if (sliderPanY) {
        sliderPanY.value = state.panY;
        valPanY.textContent = `${state.panY > 0 ? '+' : ''}${state.panY}%`;
      }
    },
    updateState: (newState) => {
      state = { ...state, ...newState };
      if (sliderBright) sliderBright.value = state.brightness;
      if (valBright) valBright.textContent = `${state.brightness}%`;
      if (sliderContr) sliderContr.value = state.contrast;
      if (valContr) valContr.textContent = `${state.contrast}%`;
      if (sliderSat) sliderSat.value = state.saturation;
      if (valSat) valSat.textContent = `${state.saturation}%`;
      if (sliderZoom) sliderZoom.value = Math.round(state.zoom * 100);
      if (valZoom) valZoom.textContent = `${Math.round(state.zoom * 100)}%`;
      if (sliderPanX) sliderPanX.value = state.panX;
      if (valPanX) valPanX.textContent = `${state.panX > 0 ? '+' : ''}${state.panX}%`;
      if (sliderPanY) sliderPanY.value = state.panY;
      if (valPanY) valPanY.textContent = `${state.panY > 0 ? '+' : ''}${state.panY}%`;
      if (sliderTilt) sliderTilt.value = state.tilt || 0;
      if (valTilt) valTilt.textContent = (state.tilt || 0) > 0 ? `+${(state.tilt || 0).toFixed(1)}°` : `${(state.tilt || 0).toFixed(1)}°`;
      if (btnBW) btnBW.classList.toggle('active', state.isBW);
      if (btnFlipH) btnFlipH.classList.toggle('active', state.flipH);
      if (btnFlipV) btnFlipV.classList.toggle('active', state.flipV);
      if (checkOval) checkOval.checked = state.showOval;
      if (checkNameTag) checkNameTag.checked = state.nameTag?.enabled;
      if (inputNameText) inputNameText.value = state.nameTag?.text || '';
      if (inputNameSub) inputNameSub.value = state.nameTag?.sub || '';
      if (nametagFields) nametagFields.style.display = state.nameTag?.enabled ? 'block' : 'none';
      if (bgPicker) {
        bgPicker.querySelectorAll('.bg-tint-btn').forEach(b => b.classList.toggle('active', b.dataset.bg === state.bgPreset));
      }
      notify();
    },
  };
}
