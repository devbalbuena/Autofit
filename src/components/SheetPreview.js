/**
 * SheetPreview component
 * Renders live sheet layout with tiled images, corner crop marks, ID Name Tag banners,
 * passport oval guidelines, multi-photo queue, and image transforms.
 */
import { fitScale } from '../lib/tiler.js';
import { getCSSFilterString, getCSSTransformString } from './ImageAdjustments.js';

export function SheetPreviewHTML() {
  return `
    <div class="sheet-wrap" id="sheet-wrap">
      <!-- Multi-Photo Queue Drawer / Header -->
      <div class="photo-queue-bar" id="photo-queue-bar" style="display:none;">
        <span class="queue-title">Loaded Photos:</span>
        <div class="queue-list" id="queue-list"></div>
        <button class="btn ghost btn-add-more-photos" id="btn-add-more-photos" title="Add another photo to queue">
          <span>➕</span> Add Photo
        </button>
      </div>

      <div class="sheet-viewport">
        <div class="sheet" id="sheet">
          <div class="sheet-grid" id="sheet-grid"></div>
        </div>
      </div>

      <div class="sheet-toolbar">
        <div class="sheet-info" id="sheet-info"></div>
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
}) {
  const sheetEl   = containerEl.querySelector('#sheet');
  const gridEl    = containerEl.querySelector('#sheet-grid');
  const infoEl    = containerEl.querySelector('#sheet-info');
  const queueBar  = containerEl.querySelector('#photo-queue-bar');
  const queueList = containerEl.querySelector('#queue-list');
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
  const scale = fitScale(sheetObj.w, sheetObj.h, cw, ch, 110);

  const sheetPxW = Math.round(sheetObj.w * 96 * scale);
  const sheetPxH = Math.round(sheetObj.h * 96 * scale);

  sheetEl.style.width = `${sheetPxW}px`;
  sheetEl.style.height = `${sheetPxH}px`;

  // Helper to pick photo for cell
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
        <div class="sheet-cell filled ${guideType === 'border' ? 'cell-guide-border' : ''}" style="
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
          <div class="cell-img-wrap" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">
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

    if (infoEl) {
      infoEl.innerHTML = `
        <span>🪪 <b>${sizeObj.name}</b></span> · 
        <span><b>${tilingResult.total}</b> photos</span> · 
        <span>Sheet: ${sheetObj.name}</span> · 
        <span>${tilingResult.coveragePercent}% yield</span>
      `;
    }
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
          ">
            <div class="cell-placeholder"></div>
          </div>
        `;
      }

      const photo = getPhotoForCell(cell.index);
      const filterCSS = getCSSFilterString(photo.adjustments);
      const transformCSS = getCSSTransformString(photo.adjustments);
      const bgCSS = getBgStyle(photo.adjustments?.bgPreset);

      return `
        <div class="sheet-cell filled ${guideType === 'border' ? 'cell-guide-border' : ''}" style="
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
          <div class="cell-img-wrap" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">
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

    if (infoEl) {
      const rotNote = tilingResult.rotated ? ' (Rotated)' : '';
      infoEl.innerHTML = `
        <span>${tilingResult.cols} × ${tilingResult.rows} grid</span> · 
        <span><b>${tilingResult.total}</b> copies</span> · 
        <span>${sizeObj.name}${rotNote} on ${sheetObj.name}</span> · 
        <span>Margin: ${tilingResult.margin}" · Gap: ${tilingResult.gap}"</span> · 
        <span>${tilingResult.coveragePercent}% yield</span>
      `;
    }
  }
}
