import { SCREEN_DPI } from './sizes.js';

/**
 * Calculate how many copies of printW x printH fit on sheetW x sheetH
 * Returns { cols, rows, total, scaleW, scaleH }
 */
export function calcTiling(printW, printH, sheetW, sheetH, count = null) {
  const cols = Math.floor(sheetW / printW);
  const rows = Math.floor(sheetH / printH);
  const maxFit = cols * rows;
  const total = count !== null ? Math.min(count, maxFit) : maxFit;
  return { cols, rows, total, maxFit };
}

/**
 * Convert inches to screen pixels for preview
 */
export function inToPx(inches, scale = 1) {
  return inches * SCREEN_DPI * scale;
}

/**
 * Compute a responsive scale factor so the sheet fits in the canvas
 */
export function fitScale(sheetW, sheetH, containerW, containerH, padding = 64) {
  const maxW = containerW - padding;
  const maxH = containerH - padding;
  const sheetPxW = sheetW * SCREEN_DPI;
  const sheetPxH = sheetH * SCREEN_DPI;
  return Math.min(maxW / sheetPxW, maxH / sheetPxH, 1);
}
