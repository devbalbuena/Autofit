/**
 * printEngine.js
 * Handles exact physical print dimension calculations, dynamic @page rules injection,
 * combo package layouts, and high-DPI print execution.
 */
import { toast } from './toast.js';
import { getCSSFilterString } from '../components/ImageAdjustments.js';

let styleEl = null;

/**
 * Inject or update the dynamic @page CSS rule for exact physical paper size
 */
export function updatePrintPageCSS(sheetObj, orientation = 'portrait') {
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-print-page-style';
    document.head.appendChild(styleEl);
  }

  const widthIn = orientation === 'landscape' ? sheetObj.h : sheetObj.w;
  const heightIn = orientation === 'landscape' ? sheetObj.w : sheetObj.h;

  styleEl.textContent = `
    @page {
      size: ${widthIn}in ${heightIn}in ${orientation};
      margin: 0mm;
    }
    @media print {
      html, body {
        width: ${widthIn}in !important;
        height: ${heightIn}in !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;
}

/**
 * Build the exact physical print layout DOM markup in inches
 */
export function buildPrintHTML({
  sheetObj,
  tiling,
  imageDataUrl,
  fitMode = 'cover',
  showCutGuides = true,
  adjustments = {},
}) {
  const cutGuideStyle = showCutGuides
    ? 'border: 0.25pt dashed rgba(0, 0, 0, 0.4);'
    : 'border: none;';

  const filterCSS = getCSSFilterString(adjustments);
  const rot = adjustments.rotation ?? 0;
  const rotTransform = rot !== 0 ? `transform: rotate(${rot}deg);` : '';

  if (tiling.isCombo) {
    // Combo Layout
    return `
      <div class="print-page" style="
        width: ${sheetObj.w}in;
        height: ${sheetObj.h}in;
        position: relative;
        overflow: hidden;
        margin: 0;
        padding: 0;
        background: #ffffff;
        page-break-after: avoid;
        page-break-inside: avoid;
      ">
        ${tiling.cells.map((cell, i) => `
          <div class="print-cell" style="
            width: ${cell.w}in;
            height: ${cell.h}in;
            position: absolute;
            left: ${cell.x}in;
            top: ${cell.y}in;
            overflow: hidden;
            box-sizing: border-box;
            ${cutGuideStyle}
          ">
            <img src="${imageDataUrl}" style="
              width: 100%;
              height: 100%;
              object-fit: ${fitMode};
              display: block;
              filter: ${filterCSS};
              ${rotTransform}
              image-rendering: -webkit-optimize-contrast;
              image-rendering: high-quality;
            " alt="print combo ${cell.name}" />
          </div>
        `).join('')}
      </div>
    `;
  }

  // Standard Grid Layout
  const usedCount = tiling.total;
  const totalCells = tiling.cols * tiling.rows;

  return `
    <div class="print-page" style="
      width: ${sheetObj.w}in;
      height: ${sheetObj.h}in;
      position: relative;
      overflow: hidden;
      margin: 0;
      padding: 0;
      background: #ffffff;
      page-break-after: avoid;
      page-break-inside: avoid;
    ">
      <div class="print-grid" style="
        display: grid;
        grid-template-columns: repeat(${tiling.cols}, ${tiling.cellW}in);
        grid-template-rows: repeat(${tiling.rows}, ${tiling.cellH}in);
        gap: ${tiling.gap}in;
        position: absolute;
        top: ${tiling.offsetY}in;
        left: ${tiling.offsetX}in;
      ">
        ${Array.from({ length: totalCells }, (_, i) => {
          const filled = i < usedCount;
          return `
            <div class="print-cell" style="
              width: ${tiling.cellW}in;
              height: ${tiling.cellH}in;
              overflow: hidden;
              position: relative;
              box-sizing: border-box;
              ${cutGuideStyle}
            ">
              ${filled ? `
                <img src="${imageDataUrl}" style="
                  width: 100%;
                  height: 100%;
                  object-fit: ${fitMode};
                  display: block;
                  filter: ${filterCSS};
                  ${rotTransform}
                  image-rendering: -webkit-optimize-contrast;
                  image-rendering: high-quality;
                " alt="print copy ${i + 1}" />
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Execute print routine
 */
export function executePrint({
  printFrameEl,
  sheetObj,
  tiling,
  imageDataUrl,
  fitMode = 'cover',
  showCutGuides = true,
  adjustments = {},
}) {
  if (!imageDataUrl) {
    toast('Please load a photo first before printing', 'error');
    return false;
  }

  updatePrintPageCSS(sheetObj, 'portrait');

  printFrameEl.innerHTML = buildPrintHTML({
    sheetObj,
    tiling,
    imageDataUrl,
    fitMode,
    showCutGuides,
    adjustments,
  });

  const printImg = printFrameEl.querySelector('img');
  if (printImg && !printImg.complete) {
    printImg.onload = () => window.print();
  } else {
    setTimeout(() => window.print(), 50);
  }

  return true;
}

/**
 * Initialize print keyboard shortcut (Ctrl+P / Cmd+P)
 */
export function initPrintShortcut(onTriggerPrint) {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      onTriggerPrint();
    }
  });

  window.addEventListener('afterprint', () => {
    toast('Print dialog closed', 'info', 2000);
  });
}
