/**
 * SheetPreview component
 * Renders live sheet layout with tiled images, corner crop marks, ID Name Tag banners,
 * passport oval guidelines, multi-photo queue, and floating canvas zoom controls.
 */
import { fitScale } from '../lib/tiler.js';
import { getCSSFilterString, getCSSTransformString } from './ImageAdjustments.js';

export function SheetPreviewHTML() {
  return `
    <div class="sheet-wrap" id="sheet-wrap">
      <!-- Multi-Customer Order Cards Bar -->
      <div class="photo-queue-bar" id="photo-queue-bar" style="display:none;">
        <div class="queue-meta-title">
          <span class="queue-icon">👥</span>
          <span class="queue-label">Customer Orders</span>
          <span class="queue-count-badge" id="queue-count-badge">0</span>
        </div>
        <div class="queue-list" id="queue-list"></div>
        <button class="btn-add-more-photos" id="btn-add-more-photos" title="Add another customer photo to print on this sheet">
          <span>➕</span> Add Customer Photo
        </button>
      </div>

      <div class="sheet-viewport" id="sheet-viewport">
        <div class="sheet" id="sheet">
          <div class="sheet-grid" id="sheet-grid"></div>
          <div class="sheet-layout-bounds" id="sheet-layout-bounds" style="display:none;"></div>
        </div>
      </div>

      <!-- Floating Canvas Mode & Zoom Controls -->
      <div class="floating-canvas-controls" id="floating-canvas-controls">
        <div class="canvas-mode-group" id="canvas-mode-group">
          <button class="canvas-mode-btn active" id="btn-mode-move" title="Select & Move IDs anywhere on the paper (Word-style drag)">
            <span>✥</span> Move
          </button>
          <button class="canvas-mode-btn" id="btn-mode-crop" title="Crop & Pan image inside cell">
            <span>✋</span> Pan
          </button>
          <button class="canvas-mode-btn" id="btn-reset-pos" title="Reset placement to top margin">
            <span>↺</span>
          </button>
        </div>
        <div class="canvas-controls-divider"></div>
        <button class="canvas-ctrl-btn" id="btn-zoom-out" title="Zoom Out (−)">−</button>
        <span class="canvas-zoom-val" id="canvas-zoom-val">Fit</span>
        <button class="canvas-ctrl-btn" id="btn-zoom-in" title="Zoom In (+)">+</button>
        <button class="canvas-ctrl-btn" id="btn-zoom-fit" title="Fit Sheet to Viewport">⤢</button>
        <button class="canvas-ctrl-btn" id="btn-zen-mode" title="Toggle Fullscreen Zen Mode (\\ or F)">⛶</button>
      </div>
    </div>
  `;
}

/**
 * Generate Corner Crop Hairline HTML
 */
function renderCornerMarksHTML() {
  return `
    <div class="crop-corner top-left"></div>
    <div class="crop-corner top-right"></div>
    <div class="crop-corner bottom-left"></div>
    <div class="crop-corner bottom-right"></div>
  `;
}

/**
 * Generate Passport Biometric Oval Guideline HTML
 */
function renderOvalGuideHTML() {
  return `
    <div class="passport-oval-guide" title="Passport facial height & center guideline">
      <div class="oval-shape"></div>
    </div>
  `;
}

/**
 * Generate ID Name Tag Banner HTML
 */
function renderNameTagHTML(nameTag) {
  if (!nameTag || !nameTag.enabled || !nameTag.text) return '';
  return `
    <div class="cell-nametag-banner">
      <div class="nametag-main">${nameTag.text}</div>
      ${nameTag.sub ? `<div class="nametag-sub">${nameTag.sub}</div>` : ''}
    </div>
  `;
}

/**
 * Get Background Color style for cell
 */
function getBgStyle(bgPreset) {
  switch (bgPreset) {
    case 'white': return 'background-color: #ffffff;';
    case 'blue':  return 'background-color: #1d4ed8;';
    case 'red':   return 'background-color: #dc2626;';
    case 'gray':  return 'background-color: #e2e8f0;';
    default:      return 'background-color: #ffffff;';
  }
}

export const CUSTOMER_PRINT_SIZES = [
  { id: '2x2', label: '2×2" (Passport)' },
  { id: '1x1', label: '1×1" (ID)' },
  { id: 'passport', label: 'Passport (35×45mm)' },
  { id: 'wallet', label: 'Wallet (2×2.5")' },
  { id: '3r', label: '3R (3.5×5")' },
  { id: '4r', label: '4R (4×6")' },
  { id: '5r', label: '5R (5×7")' },
  { id: '4x4', label: '4×4" Sq' },
];

/**
 * Render the sheet preview
 */
export function renderSheetPreview({
  containerEl,
  sheetObj,
  sizeObj,
  tilingResult,
  photos = [],
  activePhotoIndex = 0,
  fitMode = 'cover',
  guideType = 'corners',
  distributeMode = 'repeat',
  zoomFactor = 1.0,
  canvasMode = 'move', // 'move' | 'crop'
  onPanChange = null,
  onLayoutMove = null,
  onResetPosition = null,
  onModeChange = null,
  onSelectPhoto = null,
}) {
  const sheetEl   = containerEl.querySelector('#sheet');
  const gridEl    = containerEl.querySelector('#sheet-grid');
  const boundsEl  = containerEl.querySelector('#sheet-layout-bounds');
  const queueBar  = containerEl.querySelector('#photo-queue-bar');
  const queueList = containerEl.querySelector('#queue-list');
  const zoomValEl = containerEl.querySelector('#canvas-zoom-val');
  const canvasArea = containerEl.closest('.canvas-area') || containerEl;

  if (!sheetEl || !gridEl || photos.length === 0) return;

  // Wire floating mode buttons
  const btnModeMove = containerEl.querySelector('#btn-mode-move');
  const btnModeCrop = containerEl.querySelector('#btn-mode-crop');
  const btnResetPos = containerEl.querySelector('#btn-reset-pos');

  if (btnModeMove) {
    btnModeMove.classList.toggle('active', canvasMode === 'move');
    btnModeMove.onclick = () => { if (onModeChange) onModeChange('move'); };
  }
  if (btnModeCrop) {
    btnModeCrop.classList.toggle('active', canvasMode === 'crop');
    btnModeCrop.onclick = () => { if (onModeChange) onModeChange('crop'); };
  }
  if (btnResetPos) {
    btnResetPos.onclick = () => { if (onResetPosition) onResetPosition(); };
  }

  // Render Multi-Customer Queue Bar with rich order cards
  if (queueBar && queueList) {
    if (photos.length > 0) {
      queueBar.style.display = 'flex';
      const countBadge = containerEl.querySelector('#queue-count-badge');
      if (countBadge) countBadge.textContent = `${photos.length}`;

      queueList.innerHTML = photos.map((p, idx) => `
        <div class="customer-queue-card ${idx === activePhotoIndex ? 'active' : ''}" data-idx="${idx}" title="Click to edit photo adjustments & Name Tag for ${p.name || `Customer #${idx + 1}`}">
          <div class="customer-thumb-wrap">
            <img src="${p.thumbUrl || p.dataUrl}" alt="${p.name}" />
            <span class="customer-num-badge">#${idx + 1}</span>
          </div>
          <div class="customer-card-body">
            <div class="customer-card-header">
              <span class="customer-card-name" title="${p.name}">${p.name || `Customer #${idx + 1}`}</span>
              ${photos.length > 1 ? `<button class="btn-queue-remove" data-remove-idx="${idx}" title="Remove Customer">&times;</button>` : ''}
            </div>
            <div class="customer-card-controls">
              <select class="customer-size-select" data-cust-idx="${idx}" title="Select ID/Print Size for Customer #${idx + 1}">
                ${CUSTOMER_PRINT_SIZES.map(s => `<option value="${s.id}" ${(p.sizeId || '2x2') === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
              </select>
              <div class="customer-qty-box">
                <button class="btn-cust-qty" data-qty-action="dec" data-cust-idx="${idx}" title="Decrease copies">−</button>
                <span class="cust-qty-num">${p.quantity || 1}</span>
                <button class="btn-cust-qty" data-qty-action="inc" data-cust-idx="${idx}" title="Increase copies">+</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      queueBar.style.display = 'none';
    }
  }

  const cw = canvasArea.clientWidth || 800;
  const ch = canvasArea.clientHeight || 600;
  const baseScale = fitScale(sheetObj.w, sheetObj.h, cw, ch, 110);
  const scale = baseScale * zoomFactor;

  if (zoomValEl) {
    zoomValEl.textContent = zoomFactor === 1.0 ? 'Fit' : `${Math.round(zoomFactor * 100)}%`;
  }

  const sheetPxW = Math.round(sheetObj.w * 96 * scale);
  const sheetPxH = Math.round(sheetObj.h * 96 * scale);

  sheetEl.style.width = `${sheetPxW}px`;
  sheetEl.style.height = `${sheetPxH}px`;

  function getPhotoForCell(cellIndex) {
    if (distributeMode === 'distribute' && photos.length > 1) {
      return photos[cellIndex % photos.length];
    }
    return photos[activePhotoIndex] || photos[0];
  }

  // ── Multi-Customer Gang-Run Layout ─────────────────────────────────────────
  if (tilingResult.isMultiCustomer) {
    gridEl.style.cssText = `
      display: block;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `;

    gridEl.innerHTML = tilingResult.cells.map((cell, i) => {
      const cellPxX = Math.round(cell.x * 96 * scale);
      const cellPxY = Math.round(cell.y * 96 * scale);
      const cellPxW = Math.round(cell.w * 96 * scale);
      const cellPxH = Math.round(cell.h * 96 * scale);

      const photo = (cell.photoIndex !== undefined && photos[cell.photoIndex])
        ? photos[cell.photoIndex]
        : (photos[activePhotoIndex] || photos[0]);

      const filterCSS = getCSSFilterString(photo.adjustments);
      const transformCSS = getCSSTransformString(photo.adjustments);
      const bgCSS = getBgStyle(photo.adjustments?.bgPreset);

      return `
        <div class="sheet-cell filled ${canvasMode === 'move' ? 'cell-mode-move' : ''} ${guideType === 'border' ? 'cell-guide-border' : ''} ${cell.photoIndex === activePhotoIndex ? 'cell-customer-active' : ''}" data-cell-index="${i}" data-photo-index="${cell.photoIndex}" title="Customer #${(cell.photoIndex ?? 0) + 1}: ${cell.customerName} (${cell.sizeName})" style="
          position: absolute;
          left: ${cellPxX}px;
          top: ${cellPxY}px;
          width: ${cellPxW}px;
          height: ${cellPxH}px;
          overflow: hidden;
          ${bgCSS}
        ">
          ${guideType === 'corners' ? renderCornerMarksHTML() : ''}
          ${photo.adjustments?.showOval ? renderOvalGuideHTML() : ''}
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">
            <img src="${photo.dataUrl}" alt="${cell.customerName}" style="
              width: 100%;
              height: 100%;
              object-fit: ${fitMode};
              filter: ${filterCSS};
              transform: ${transformCSS};
              transform-origin: center center;
            " />
          </div>
          ${renderNameTagHTML(photo.adjustments?.nameTag)}
          <div class="cell-tag">#${(cell.photoIndex ?? 0) + 1} • ${cell.sizeName || `${cell.w}×${cell.h}`}</div>
        </div>
      `;
    }).join('');
  } else if (tilingResult.isCombo) {
    gridEl.style.cssText = `
      display: block;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `;

    gridEl.innerHTML = tilingResult.cells.map((cell, i) => {
      const cellPxX = Math.round(cell.x * 96 * scale);
      const cellPxY = Math.round(cell.y * 96 * scale);
      const cellPxW = Math.round(cell.w * 96 * scale);
      const cellPxH = Math.round(cell.h * 96 * scale);

      const photo = getPhotoForCell(i);
      const filterCSS = getCSSFilterString(photo.adjustments);
      const transformCSS = getCSSTransformString(photo.adjustments);
      const bgCSS = getBgStyle(photo.adjustments?.bgPreset);

      return `
        <div class="sheet-cell filled ${canvasMode === 'move' ? 'cell-mode-move' : ''} ${guideType === 'border' ? 'cell-guide-border' : ''}" data-cell-index="${i}" title="${canvasMode === 'move' ? 'Drag to position on paper' : 'Drag to adjust photo crop'}" style="
          position: absolute;
          left: ${cellPxX}px;
          top: ${cellPxY}px;
          width: ${cellPxW}px;
          height: ${cellPxH}px;
          overflow: hidden;
          ${bgCSS}
        ">
          ${guideType === 'corners' ? renderCornerMarksHTML() : ''}
          ${photo.adjustments?.showOval ? renderOvalGuideHTML() : ''}
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">
            <img src="${photo.dataUrl}" alt="combo ${cell.name}" style="
              width: 100%;
              height: 100%;
              object-fit: ${fitMode};
              filter: ${filterCSS};
              transform: ${transformCSS};
              transform-origin: center center;
            " />
          </div>
          ${renderNameTagHTML(photo.adjustments?.nameTag)}
          <div class="cell-tag">${cell.name}</div>
        </div>
      `;
    }).join('');
  } else {
    // ── Standard Grid Layout ─────────────────────────────────────────────────
    gridEl.style.cssText = `
      display: block;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `;

    gridEl.innerHTML = tilingResult.cells.map((cell) => {
      const cellPxX = Math.round(cell.x * 96 * scale);
      const cellPxY = Math.round(cell.y * 96 * scale);
      const cellPxW = Math.round(cell.w * 96 * scale);
      const cellPxH = Math.round(cell.h * 96 * scale);

      if (!cell.filled) {
        return `
          <div class="sheet-cell empty" style="
            position: absolute;
            left: ${cellPxX}px;
            top: ${cellPxY}px;
            width: ${cellPxW}px;
            height: ${cellPxH}px;
          "></div>
        `;
      }

      const photo = getPhotoForCell(cell.index);
      const filterCSS = getCSSFilterString(photo.adjustments);
      const transformCSS = getCSSTransformString(photo.adjustments);
      const bgCSS = getBgStyle(photo.adjustments?.bgPreset);

      return `
        <div class="sheet-cell filled ${canvasMode === 'move' ? 'cell-mode-move' : ''} ${guideType === 'border' ? 'cell-guide-border' : ''}" data-cell-index="${cell.index}" title="${canvasMode === 'move' ? 'Drag to position on paper' : 'Drag to adjust photo crop'}" style="
          position: absolute;
          left: ${cellPxX}px;
          top: ${cellPxY}px;
          width: ${cellPxW}px;
          height: ${cellPxH}px;
          overflow: hidden;
          ${bgCSS}
        ">
          ${guideType === 'corners' ? renderCornerMarksHTML() : ''}
          ${photo.adjustments?.showOval ? renderOvalGuideHTML() : ''}
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">
            <img src="${photo.dataUrl}" alt="copy ${cell.index + 1}" style="
              width: 100%;
              height: 100%;
              object-fit: ${fitMode};
              filter: ${filterCSS};
              transform: ${transformCSS};
              transform-origin: center center;
            " />
          </div>
          ${renderNameTagHTML(photo.adjustments?.nameTag)}
        </div>
      `;
    }).join('');
  }

  // ── Word-Style Selection Bounding Box ──────────────────────────────────────
  const bW = tilingResult.boundsW || 0;
  const bH = tilingResult.boundsH || 0;
  const bX = tilingResult.boundsX !== undefined ? tilingResult.boundsX : (tilingResult.offsetX || 0);
  const bY = tilingResult.boundsY !== undefined ? tilingResult.boundsY : (tilingResult.offsetY || 0);

  const bPxX = Math.round(bX * 96 * scale);
  const bPxY = Math.round(bY * 96 * scale);
  const bPxW = Math.round(bW * 96 * scale);
  const bPxH = Math.round(bH * 96 * scale);

  if (boundsEl) {
    if (bW > 0 && bH > 0 && photos.length > 0) {
      boundsEl.style.display = 'block';
      boundsEl.style.left = `${bPxX - 3}px`;
      boundsEl.style.top = `${bPxY - 3}px`;
      boundsEl.style.width = `${bPxW + 6}px`;
      boundsEl.style.height = `${bPxH + 6}px`;
      boundsEl.className = `sheet-layout-bounds ${canvasMode === 'move' ? 'mode-move' : ''}`;
      boundsEl.innerHTML = `
        <div class="bounds-border"></div>
        <div class="bounds-drag-pill" title="Click and drag to position prints anywhere on the bond paper">
          <span>✥</span> Drag to Move on Paper
        </div>
        <div class="bounds-corner tl"></div>
        <div class="bounds-corner tr"></div>
        <div class="bounds-corner bl"></div>
        <div class="bounds-corner br"></div>
      `;
    } else {
      boundsEl.style.display = 'none';
    }
  }

  // Wire interactive canvas events (Move on paper + Crop/Pan)
  wireCanvasInteractions({
    sheetEl,
    gridEl,
    boundsEl,
    photos,
    activePhotoIndex,
    distributeMode,
    canvasMode,
    scale,
    onPanChange,
    onLayoutMove,
    onModeChange,
    onSelectPhoto,
  });
}

/**
 * Unified Canvas Interaction Manager:
 * Handles both "Move Selection on Paper" and "Crop / Pan inside Cell"
 */
function wireCanvasInteractions({
  sheetEl,
  gridEl,
  boundsEl,
  photos,
  activePhotoIndex,
  distributeMode,
  canvasMode,
  scale,
  onPanChange,
  onLayoutMove,
  onModeChange,
  onSelectPhoto,
}) {
  const cells = gridEl.querySelectorAll('.sheet-cell.filled');

  // 1. Move on Paper dragging handler
  const startPaperDrag = (startEvt) => {
    startEvt.preventDefault();
    const startX = startEvt.clientX ?? startEvt.touches?.[0]?.clientX;
    const startY = startEvt.clientY ?? startEvt.touches?.[0]?.clientY;
    if (startX === undefined || startY === undefined) return;

    if (boundsEl) boundsEl.classList.add('dragging');
    sheetEl.classList.add('dragging-paper');
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';

    let lastDx = 0;
    let lastDy = 0;

    const handleMove = (moveEvt) => {
      const curX = moveEvt.clientX ?? moveEvt.touches?.[0]?.clientX;
      const curY = moveEvt.clientY ?? moveEvt.touches?.[0]?.clientY;
      if (curX === undefined || curY === undefined) return;

      lastDx = curX - startX;
      lastDy = curY - startY;

      // Realtime 60fps visual translation feedback
      gridEl.style.transform = `translate(${lastDx}px, ${lastDy}px)`;
      if (boundsEl) boundsEl.style.transform = `translate(${lastDx}px, ${lastDy}px)`;
    };

    const handleEnd = () => {
      gridEl.style.transform = '';
      if (boundsEl) {
        boundsEl.style.transform = '';
        boundsEl.classList.remove('dragging');
      }
      sheetEl.classList.remove('dragging-paper');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);

      if (Math.abs(lastDx) > 2 || Math.abs(lastDy) > 2) {
        const dInchesX = lastDx / (96 * scale);
        const dInchesY = lastDy / (96 * scale);
        if (onLayoutMove) {
          onLayoutMove(dInchesX, dInchesY);
        }
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  // Wire bounding drag handle pill
  if (boundsEl) {
    const pill = boundsEl.querySelector('.bounds-drag-pill');
    if (pill) {
      pill.addEventListener('mousedown', startPaperDrag);
      pill.addEventListener('touchstart', startPaperDrag, { passive: false });
    }
  }

  // 2. Wire cells
  cells.forEach(cellEl => {
    const cellIdx = parseInt(cellEl.dataset.cellIndex, 10);
    const targetPhotoIdx = (cellEl.dataset.photoIndex !== undefined && cellEl.dataset.photoIndex !== '')
      ? parseInt(cellEl.dataset.photoIndex, 10)
      : ((distributeMode === 'distribute' && photos.length > 1)
        ? (cellIdx % photos.length)
        : activePhotoIndex);
    const targetPhoto = photos[targetPhotoIdx] || photos[0];
    if (!targetPhoto) return;

    cellEl.addEventListener('click', (e) => {
      if (e.target.closest('button, input, select')) return;
      if (onSelectPhoto) onSelectPhoto(targetPhotoIdx);
    });

    // Double click on a cell switches to Crop/Pan mode
    cellEl.addEventListener('dblclick', () => {
      if (onModeChange) onModeChange('crop');
    });

    const handleStart = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('button, input, select, .cell-nametag-banner')) return;

      // If in "move" mode OR holding Shift/Alt key: move entire layout on paper
      if (canvasMode === 'move' || e.shiftKey || e.altKey) {
        startPaperDrag(e);
        return;
      }

      // Otherwise: Crop / Pan photo inside cell
      e.preventDefault();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const startX = clientX;
      const startY = clientY;
      const rect = cellEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const initialPanX = targetPhoto.adjustments?.panX || 0;
      const initialPanY = targetPhoto.adjustments?.panY || 0;
      const imgEl = cellEl.querySelector('img');

      cellEl.classList.add('dragging');
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      const handleMove = (moveEvt) => {
        const curX = moveEvt.clientX ?? moveEvt.touches?.[0]?.clientX;
        const curY = moveEvt.clientY ?? moveEvt.touches?.[0]?.clientY;
        if (curX === undefined || curY === undefined) return;

        const dx = curX - startX;
        const dy = curY - startY;

        const dPanX = (dx / rect.width) * 100;
        const dPanY = (dy / rect.height) * 100;

        const newPanX = Math.round(Math.min(50, Math.max(-50, initialPanX + dPanX)));
        const newPanY = Math.round(Math.min(50, Math.max(-50, initialPanY + dPanY)));

        if (!targetPhoto.adjustments) targetPhoto.adjustments = {};
        targetPhoto.adjustments.panX = newPanX;
        targetPhoto.adjustments.panY = newPanY;

        if (imgEl) {
          imgEl.style.transform = getCSSTransformString(targetPhoto.adjustments);
        }

        if (onPanChange) {
          onPanChange(newPanX, newPanY, targetPhotoIdx);
        }
      };

      const handleEnd = () => {
        cellEl.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };

      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    };

    cellEl.addEventListener('mousedown', handleStart);
    cellEl.addEventListener('touchstart', handleStart, { passive: false });
  });
}
