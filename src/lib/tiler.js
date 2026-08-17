import { SCREEN_DPI } from './sizes.js';

/**
 * Calculate best tiling layout of photos on a sheet.
 * Supports margin offsets, optional gaps, and orientation optimization.
 *
 * @param {number} printW - Photo width in inches
 * @param {number} printH - Photo height in inches
 * @param {number} sheetW - Sheet width in inches
 * @param {number} sheetH - Sheet height in inches
 * @param {number|null} count - Desired copies (null = auto max)
 * @param {Object} options - Optional config { margin: number, gap: number, rotate: boolean }
 * @returns {Object} Layout metrics
 */
export function calcTiling(printW, printH, sheetW, sheetH, count = null, options = {}) {
  const margin = options.margin ?? 0.2; // 0.2 in default safe printable margin
  const gap = options.gap ?? 0.05;      // 0.05 in default cutting gap between tiles

  const usableW = Math.max(sheetW - margin * 2, 0.1);
  const usableH = Math.max(sheetH - margin * 2, 0.1);

  // Layout A: Normal orientation
  const colsA = Math.max(1, Math.floor((usableW + gap) / (printW + gap)));
  const rowsA = Math.max(1, Math.floor((usableH + gap) / (printH + gap)));
  const fitA = colsA * rowsA;

  // Layout B: Rotated 90 deg
  const colsB = Math.max(1, Math.floor((usableW + gap) / (printH + gap)));
  const rowsB = Math.max(1, Math.floor((usableH + gap) / (printW + gap)));
  const fitB = colsB * rowsB;

  // Choose optimal orientation or respect manual override
  const shouldRotate = options.rotate !== undefined ? options.rotate : (fitB > fitA && printW !== printH);

  const cellW = shouldRotate ? printH : printW;
  const cellH = shouldRotate ? printW : printH;
  const cols = shouldRotate ? colsB : colsA;
  const rows = shouldRotate ? rowsB : rowsA;
  const maxFit = cols * rows;

  const total = count !== null && count !== undefined ? Math.min(Math.max(1, count), maxFit) : maxFit;

  // Calculate actual grid bounds in inches
  const gridW = cols * cellW + Math.max(0, cols - 1) * gap;
  const gridH = rows * cellH + Math.max(0, rows - 1) * gap;

  // Centering offsets
  const offsetX = Math.max(0, (sheetW - gridW) / 2);
  const offsetY = Math.max(0, (sheetH - gridH) / 2);

  // Efficiency (percentage of sheet area covered by photos)
  const coveragePercent = Math.round(((total * printW * printH) / (sheetW * sheetH)) * 100);

  return {
    cols,
    rows,
    total,
    maxFit,
    cellW,
    cellH,
    rotated: shouldRotate,
    gap,
    margin,
    gridW,
    gridH,
    offsetX,
    offsetY,
    coveragePercent,
  };
}

/**
 * Convert inches to screen pixels for display
 */
export function inToPx(inches, scale = 1) {
  return inches * SCREEN_DPI * scale;
}

/**
 * Compute a responsive scale factor so the sheet fits within canvas container
 */
export function fitScale(sheetW, sheetH, containerW, containerH, padding = 64) {
  const maxW = Math.max(100, containerW - padding);
  const maxH = Math.max(100, containerH - padding);
  const sheetPxW = sheetW * SCREEN_DPI;
  const sheetPxH = sheetH * SCREEN_DPI;
  return Math.min(maxW / sheetPxW, maxH / sheetPxH, 1.2);
}
