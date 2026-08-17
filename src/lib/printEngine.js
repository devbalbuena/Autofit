/**
 * printEngine.js
 * Handles exact physical print dimension calculations, dynamic @page rules injection,
 * and high-DPI print execution with lifecycle events.
 */
import { toast } from './toast.js';

let styleEl = null;

/**
 * Inject or update the dynamic @page CSS rule for exact physical paper size
 * @param {Object} sheetObj - { w, h, name }
 * @param {string} orientation - 'portrait' | 'landscape'
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
 * @param {Object} params - { sheetObj, tiling, imageDataUrl, fitMode, showCutGuides }
 * @returns {string} HTML string
 */
export function buildPrintHTML({
  sheetObj,
  tiling,
  imageDataUrl,
  fitMode = 'cover',
  showCutGuides = true,
}) {
  const usedCount = tiling.total;
  const totalCells = tiling.cols * tiling.rows;

  const cutGuideStyle = showCutGuides
    ? 'border: 0.25pt dashed rgba(0, 0, 0, 0.4);'
    : 'border: none;';

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
 * Execute print routine with DOM preparation and feedback
 */
export function executePrint({
  printFrameEl,
  sheetObj,
  tiling,
  imageDataUrl,
  fitMode = 'cover',
  showCutGuides = true,
}) {
  if (!imageDataUrl) {
    toast('Please load a photo first before printing', 'error');
    return false;
  }

  // Update dynamic @page CSS
  updatePrintPageCSS(sheetObj, 'portrait');

  // Populate print container
  printFrameEl.innerHTML = buildPrintHTML({
    sheetObj,
    tiling,
    imageDataUrl,
    fitMode,
    showCutGuides,
  });

  // Pre-load images inside print frame before triggering print
  const printImg = printFrameEl.querySelector('img');
  if (printImg && !printImg.complete) {
    printImg.onload = () => {
      window.print();
    };
  } else {
    setTimeout(() => {
      window.print();
    }, 50);
  }

  return true;
}

/**
 * Initialize print keyboard shortcut (Ctrl+P / Cmd+P) and lifecycle listeners
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
