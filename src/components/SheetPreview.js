/**
 * SheetPreview component
 * Renders the live sheet layout with tiled images, crop marks, and aspect ratio preview.
 */
import { fitScale, inToPx } from '../lib/tiler.js';

export function SheetPreviewHTML() {
  return `
    <div class="sheet-wrap" id="sheet-wrap">
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
 * Render the sheet preview
 * @param {Object} params - { containerEl, sheetObj, sizeObj, tilingResult, imageDataUrl, fitMode }
 */
export function renderSheetPreview({
  containerEl,
  sheetObj,
  sizeObj,
  tilingResult,
  imageDataUrl,
  fitMode = 'cover',
}) {
  const sheetEl = containerEl.querySelector('#sheet');
  const gridEl = containerEl.querySelector('#sheet-grid');
  const infoEl = containerEl.querySelector('#sheet-info');
  const canvasArea = containerEl.closest('.canvas-area') || containerEl;

  if (!sheetEl || !gridEl || !imageDataUrl) return;

  const cw = canvasArea.clientWidth || 800;
  const ch = canvasArea.clientHeight || 600;
  const scale = fitScale(sheetObj.w, sheetObj.h, cw, ch, 100);

  const sheetPxW = Math.round(sheetObj.w * 96 * scale);
  const sheetPxH = Math.round(sheetObj.h * 96 * scale);

  const cellPxW = Math.round(tilingResult.cellW * 96 * scale);
  const cellPxH = Math.round(tilingResult.cellH * 96 * scale);
  const gapPx   = Math.max(1, Math.round(tilingResult.gap * 96 * scale));

  const offsetTopPx  = Math.round(tilingResult.offsetY * 96 * scale);
  const offsetLeftPx = Math.round(tilingResult.offsetX * 96 * scale);

  sheetEl.style.width = `${sheetPxW}px`;
  sheetEl.style.height = `${sheetPxH}px`;

  gridEl.style.cssText = `
    display: grid;
    position: absolute;
    grid-template-columns: repeat(${tilingResult.cols}, ${cellPxW}px);
    grid-template-rows: repeat(${tilingResult.rows}, ${cellPxH}px);
    gap: ${gapPx}px;
    top: ${offsetTopPx}px;
    left: ${offsetLeftPx}px;
  `;

  const totalCells = tilingResult.rows * tilingResult.cols;
  const usedCount = tilingResult.total;

  gridEl.innerHTML = Array.from({ length: totalCells }, (_, i) => {
    const isFilled = i < usedCount;
    return `
      <div class="sheet-cell ${isFilled ? 'filled' : 'empty'}" style="width:${cellPxW}px;height:${cellPxH}px">
        ${isFilled ? `
          <div class="cell-cut-guide"></div>
          <img src="${imageDataUrl}" alt="photo copy ${i + 1}" style="object-fit:${fitMode}" />
        ` : '<div class="cell-placeholder"></div>'}
      </div>
    `;
  }).join('');

  if (infoEl) {
    const rotNote = tilingResult.rotated ? ' (Rotated for max fit)' : '';
    infoEl.innerHTML = `
      <span>${tilingResult.cols} × ${tilingResult.rows} grid</span> · 
      <span><b>${usedCount}</b> ${usedCount === 1 ? 'copy' : 'copies'}</span> · 
      <span>${sizeObj.name}${rotNote} on ${sheetObj.name}</span> · 
      <span>${tilingResult.coveragePercent}% coverage</span>
    `;
  }
}
