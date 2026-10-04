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
      <!-- Floating Multi-Photo Queue Bar -->
      <div class="photo-queue-bar" id="photo-queue-bar" style="display:none;">
        <span class="queue-title">Photos:</span>
        <div class="queue-list" id="queue-list"></div>
        <button class="btn-add-more-photos" id="btn-add-more-photos" title="Add another photo to sheet queue">
          <span>➕</span> Add Photo
        </button>
      </div>

      <div class="sheet-viewport" id="sheet-viewport">
        <div class="sheet" id="sheet">
          <div class="sheet-grid" id="sheet-grid"></div>
        </div>
      </div>

      <!-- Floating Canvas Zoom & View Controls -->
      <div class="floating-canvas-controls" id="floating-canvas-controls">
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
  onPanChange = null,
}) {
  const sheetEl   = containerEl.querySelector('#sheet');
  const gridEl    = containerEl.querySelector('#sheet-grid');
  const queueBar  = containerEl.querySelector('#photo-queue-bar');
  const queueList = containerEl.querySelector('#queue-list');
  const zoomValEl = containerEl.querySelector('#canvas-zoom-val');
  const canvasArea = containerEl.closest('.canvas-area') || containerEl;

  if (!sheetEl || !gridEl || photos.length === 0) return;

  // Render Multi-Photo Queue Bar
  if (queueBar && queueList) {
    if (photos.length > 1) {
      queueBar.style.display = 'flex';
      queueList.innerHTML = photos.map((p, idx) => `
        <div class="queue-item ${idx === activePhotoIndex ? 'active' : ''}" data-idx="${idx}" title="${p.name}">
          <img src="${p.thumbUrl || p.dataUrl}" alt="${p.name}" />
          <button class="btn-queue-remove" data-remove-idx="${idx}" title="Remove photo">&times;</button>
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

  // ── Combo Layout ───────────────────────────────────────────────────────────
  if (tilingResult.isCombo) {
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
        <div class="sheet-cell filled ${guideType === 'border' ? 'cell-guide-border' : ''}" data-cell-index="${i}" title="Click and drag to reposition photo" style="
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
        <div class="sheet-cell filled ${guideType === 'border' ? 'cell-guide-border' : ''}" data-cell-index="${cell.index}" title="Click and drag to reposition photo" style="
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

  // Wire interactive drag-to-pan across filled cells
  wireCellDragEvents(gridEl, photos, activePhotoIndex, distributeMode, onPanChange);
}

/**
 * Interactive Drag-to-Pan event handler for sheet preview cells
 */
function wireCellDragEvents(gridEl, photos, activePhotoIndex, distributeMode, onPanChange) {
  const cells = gridEl.querySelectorAll('.sheet-cell.filled');

  cells.forEach(cellEl => {
    const cellIdx = parseInt(cellEl.dataset.cellIndex, 10);
    const targetPhotoIdx = (distributeMode === 'distribute' && photos.length > 1)
      ? (cellIdx % photos.length)
      : activePhotoIndex;
    const targetPhoto = photos[targetPhotoIdx] || photos[0];
    if (!targetPhoto) return;

    const handleStart = (e) => {
      // Only primary mouse button or touch
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('button, input, select, .cell-nametag-banner')) return;

      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      e.preventDefault();

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

        // Sensitivity scaled to cell's rendered dimensions
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
