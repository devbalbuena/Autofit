import { SCREEN_DPI } from './sizes.js';

/**
 * Calculate optimal tiling layout of photos on a sheet.
 * Supports standard single size grids, custom margins/gaps, and multi-size ID combo packages.
 */
export function calcTiling(printW, printH, sheetW, sheetH, count = null, options = {}) {
  const margin = options.margin !== undefined ? Math.max(0, options.margin) : 0.2;
  const gap    = options.gap !== undefined ? Math.max(0, options.gap) : 0.05;

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

  const shouldRotate = options.rotate !== undefined ? options.rotate : (fitB > fitA && printW !== printH);

  const cellW = shouldRotate ? printH : printW;
  const cellH = shouldRotate ? printW : printH;
  const cols = shouldRotate ? colsB : colsA;
  const rows = shouldRotate ? rowsB : rowsA;
  const maxFit = cols * rows;

  const total = count !== null && count !== undefined ? Math.min(Math.max(1, count), maxFit) : maxFit;

  const gridW = cols * cellW + Math.max(0, cols - 1) * gap;
  const gridH = rows * cellH + Math.max(0, rows - 1) * gap;

  const offsetX = Math.max(margin, (sheetW - gridW) / 2);
  const offsetY = Math.max(margin, (sheetH - gridH) / 2);

  // Generate explicit cell coordinates for deterministic rendering
  const cells = [];
  for (let i = 0; i < maxFit; i++) {
    const colIdx = i % cols;
    const rowIdx = Math.floor(i / cols);
    const x = offsetX + colIdx * (cellW + gap);
    const y = offsetY + rowIdx * (cellH + gap);

    cells.push({
      index: i,
      col: colIdx,
      row: rowIdx,
      x,
      y,
      w: cellW,
      h: cellH,
      filled: i < total,
    });
  }

  const coveragePercent = Math.round(((total * printW * printH) / (sheetW * sheetH)) * 100);

  return {
    isCombo: false,
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
    cells,
    coveragePercent,
  };
}

/**
 * Calculate absolute coordinates for multi-size Combo packages packed on a sheet
 * @param {Array<{ name: string, w: number, h: number, count: number }>} comboItems
 * @param {number} sheetW
 * @param {number} sheetH
 * @param {Object} options
 */
export function calcComboTiling(comboItems, sheetW, sheetH, options = {}) {
  const margin = options.margin !== undefined ? Math.max(0, options.margin) : 0.25;
  const gap    = options.gap !== undefined ? Math.max(0, options.gap) : 0.05;
  const usableW = Math.max(sheetW - margin * 2, 0.1);

  const rawCells = [];
  let currentY = 0;
  let totalArea = 0;

  // Lay out each group of sizes in horizontal rows
  for (const group of comboItems) {
    const cols = Math.max(1, Math.floor((usableW + gap) / (group.w + gap)));
    const rows = Math.ceil(group.count / cols);

    for (let i = 0; i < group.count; i++) {
      const rowIdx = Math.floor(i / cols);
      const colIdx = i % cols;

      const x = colIdx * (group.w + gap);
      const y = currentY + rowIdx * (group.h + gap);

      rawCells.push({
        name: group.name,
        w: group.w,
        h: group.h,
        x,
        y,
      });

      totalArea += group.w * group.h;
    }

    currentY += rows * (group.h + gap) + 0.08; // small section separator
  }

  // Find bounding box
  const boundsW = rawCells.reduce((max, c) => Math.max(max, c.x + c.w), 0);
  const boundsH = rawCells.reduce((max, c) => Math.max(max, c.y + c.h), 0);

  // Center on sheet
  const offsetX = Math.max(margin, (sheetW - boundsW) / 2);
  const offsetY = Math.max(margin, (sheetH - boundsH) / 2);

  // Offset all cell positions
  const cells = rawCells.map((c, idx) => ({
    ...c,
    index: idx,
    x: c.x + offsetX,
    y: c.y + offsetY,
    filled: true,
  }));

  const totalCopies = comboItems.reduce((sum, g) => sum + g.count, 0);
  const coveragePercent = Math.round((totalArea / (sheetW * sheetH)) * 100);

  return {
    isCombo: true,
    cells,
    total: totalCopies,
    maxFit: totalCopies,
    gap,
    margin,
    boundsW,
    boundsH,
    offsetX,
    offsetY,
    coveragePercent,
  };
}

/**
 * Convert inches to screen pixels
 */
export function inToPx(inches, scale = 1) {
  return inches * SCREEN_DPI * scale;
}

/**
 * Compute responsive scale factor
 */
export function fitScale(sheetW, sheetH, containerW, containerH, padding = 64) {
  const maxW = Math.max(100, containerW - padding);
  const maxH = Math.max(100, containerH - padding);
  const sheetPxW = sheetW * SCREEN_DPI;
  const sheetPxH = sheetH * SCREEN_DPI;
  return Math.min(maxW / sheetPxW, maxH / sheetPxH, 1.2);
}
