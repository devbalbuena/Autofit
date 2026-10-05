/**
 * printEngine.js
 * Handles exact physical print dimension calculations, dynamic @page rules injection,
 * corner crop marks, ID Name Tag banners, multi-photo layouts, and print execution.
 */
import { toast } from './toast.js';
import { getCSSFilterString, getCSSTransformString } from '../components/ImageAdjustments.js';

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

  const widthIn  = orientation === 'landscape' ? sheetObj.h : sheetObj.w;
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
      .print-page {
        width: ${widthIn}in !important;
        height: ${heightIn}in !important;
      }
    }
  `;
}

/**
 * Generate Corner Crop Hairlines for Print
 */
function renderPrintCornerMarks(guideColor = '#000000') {
  return `
    <div style="position:absolute;top:0;left:0;width:5px;height:5px;border-top:0.4pt solid ${guideColor};border-left:0.4pt solid ${guideColor};pointer-events:none;z-index:10;"></div>
    <div style="position:absolute;top:0;right:0;width:5px;height:5px;border-top:0.4pt solid ${guideColor};border-right:0.4pt solid ${guideColor};pointer-events:none;z-index:10;"></div>
    <div style="position:absolute;bottom:0;left:0;width:5px;height:5px;border-bottom:0.4pt solid ${guideColor};border-left:0.4pt solid ${guideColor};pointer-events:none;z-index:10;"></div>
    <div style="position:absolute;bottom:0;right:0;width:5px;height:5px;border-bottom:0.4pt solid ${guideColor};border-right:0.4pt solid ${guideColor};pointer-events:none;z-index:10;"></div>
  `;
}

/**
 * Generate print watermark overlay
 */
function renderPrintWatermark(watermark) {
  if (!watermark) return '';
  return `
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:6;overflow:hidden;">
      <span style="font-weight:900;font-size:14pt;color:rgba(220,38,38,0.28);text-transform:uppercase;transform:rotate(-35deg);letter-spacing:1.5px;white-space:nowrap;font-family:Arial,sans-serif;">${watermark}</span>
    </div>
  `;
}

/**
 * Generate print footer metadata info
 */
function renderPrintFooter(sheetObj, showFooterInfo) {
  if (!showFooterInfo) return '';
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return `
    <div style="position:absolute;bottom:0.06in;left:0.25in;right:0.25in;font-size:6.5pt;color:#64748b;font-family:monospace;display:flex;justify-content:space-between;border-top:0.35pt solid #cbd5e1;padding-top:2px;">
      <span>AutoFit Studio • ${sheetObj.name} (${sheetObj.w}″×${sheetObj.h}″)</span>
      <span>${dateStr}</span>
    </div>
  `;
}

/**
 * Generate ID Name Tag Banner for Print
 */
function renderPrintNameTag(nameTag) {
  if (!nameTag || !nameTag.enabled || !nameTag.text) return '';
  return `
    <div style="
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      border-top: 0.5pt solid #000000;
      color: #000000;
      text-align: center;
      padding: 1.5pt 2pt;
      font-family: 'Arial', sans-serif;
      z-index: 5;
    ">
      <div style="font-size: 7pt; font-weight: bold; letter-spacing: 0.5px; line-height: 1.1;">
        ${nameTag.text}
      </div>
      ${nameTag.sub ? `<div style="font-size: 5.5pt; opacity: 0.85; line-height: 1;">${nameTag.sub}</div>` : ''}
    </div>
  `;
}

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
 * Build the exact physical print layout DOM markup in inches
 */
export function buildPrintHTML({
  sheetObj,
  tiling,
  photos = [],
  activePhotoIndex = 0,
  fitMode = 'cover',
  guideType = 'corners',
  guideColor = '#000000',
  distributeMode = 'repeat',
  watermark = '',
  showFooterInfo = false,
}) {
  const borderGuide = guideType === 'border'
    ? `border: 0.25pt dashed ${guideColor};`
    : 'border: none;';

  const cellsHTML = tiling.cells.map((cell, idx) => {
    if (!cell.filled) return '';

    // Support explicit multi-customer assignment, multi-photo distribute, or active photo
    const photo = (cell.photoIndex !== undefined && photos[cell.photoIndex])
      ? photos[cell.photoIndex]
      : ((distributeMode === 'distribute' && photos.length > 1)
        ? photos[idx % photos.length]
        : (photos[activePhotoIndex] || photos[0]));

    const filterCSS    = getCSSFilterString(photo.adjustments);
    const transformCSS = getCSSTransformString(photo.adjustments);
    const bgCSS        = getBgStyle(photo.adjustments?.bgPreset);

    return `
      <div class="print-cell" style="
        position: absolute;
        left: ${cell.x}in;
        top: ${cell.y}in;
        width: ${cell.w}in;
        height: ${cell.h}in;
        overflow: hidden;
        box-sizing: border-box;
        ${bgCSS}
        ${borderGuide}
      ">
        ${guideType === 'corners' ? renderPrintCornerMarks(guideColor) : ''}
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">
          <img src="${photo.dataUrl}" style="
            width: 100%;
            height: 100%;
            object-fit: ${fitMode};
            display: block;
            filter: ${filterCSS};
            transform: ${transformCSS};
            transform-origin: center center;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: high-quality;
          " alt="photo ${idx + 1}" />
        </div>
        ${renderPrintNameTag(photo.adjustments?.nameTag)}
        ${renderPrintWatermark(watermark)}
      </div>
    `;
  }).join('');

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
      ${cellsHTML}
      ${renderPrintFooter(sheetObj, showFooterInfo)}
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
  photos = [],
  activePhotoIndex = 0,
  fitMode = 'cover',
  guideType = 'corners',
  guideColor = '#000000',
  distributeMode = 'repeat',
  watermark = '',
  showFooterInfo = false,
}) {
  if (!photos || photos.length === 0) {
    toast('Please load a photo first before printing', 'error');
    return false;
  }

  updatePrintPageCSS(sheetObj, 'portrait');

  printFrameEl.innerHTML = buildPrintHTML({
    sheetObj,
    tiling,
    photos,
    activePhotoIndex,
    fitMode,
    guideType,
    guideColor,
    distributeMode,
    watermark,
    showFooterInfo,
  });

  const printImgs = Array.from(printFrameEl.querySelectorAll('img'));
  const allLoaded = printImgs.every(img => img.complete);

  if (!allLoaded) {
    let loadedCount = 0;
    printImgs.forEach(img => {
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount >= printImgs.length) {
          window.print();
        }
      };
    });
  } else {
    setTimeout(() => window.print(), 60);
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
    toast('Print job sent', 'info', 2000);
  });
}
