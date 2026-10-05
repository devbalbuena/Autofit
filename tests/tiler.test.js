import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcTiling,
  calcComboTiling,
  calcMultiCustomerTiling,
  calculatePaperEfficiency,
  calculatePrintEconomics
} from '../src/lib/tiler.js';

describe('calcTiling - Single Size Grid Calculator', () => {
  it('should calculate standard 2x2 on A4 sheet', () => {
    const sheetW = 8.27;
    const sheetH = 11.69;
    const result = calcTiling(2, 2, sheetW, sheetH, null, { margin: 0.2, gap: 0.05 });

    assert.ok(result.cols >= 3, `Expected at least 3 cols, got ${result.cols}`);
    assert.ok(result.rows >= 4, `Expected at least 4 rows, got ${result.rows}`);
    assert.ok(result.maxFit >= 12, `Expected at least 12 maxFit, got ${result.maxFit}`);
    assert.equal(result.cells.length, result.maxFit);
    assert.equal(result.isCombo, false);
  });

  it('should respect custom quantity count constraint', () => {
    const result = calcTiling(2, 2, 8.5, 11, 4, { margin: 0.2, gap: 0.05 });
    assert.equal(result.total, 4);
    const filledCells = result.cells.filter(c => c.filled);
    assert.equal(filledCells.length, 4);
  });

  it('should support custom offset dragging', () => {
    const result = calcTiling(2, 2, 8.5, 11, 2, {
      margin: 0.2,
      gap: 0.05,
      customOffsetX: 0.5,
      customOffsetY: 0.75,
    });
    assert.equal(result.offsetX, 0.7); // 0.2 margin + 0.5 offset
    assert.equal(result.offsetY, 0.95); // 0.2 margin + 0.75 offset
  });
});

describe('calcComboTiling - Multi-size Combo Package Calculator', () => {
  it('should lay out 4 (2x2) and 8 (1x1) combo package items', () => {
    const comboItems = [
      { name: '2×2', w: 2, h: 2, count: 4 },
      { name: '1×1', w: 1, h: 1, count: 8 },
    ];
    const result = calcComboTiling(comboItems, 8.5, 11, { margin: 0.25, gap: 0.05 });

    assert.equal(result.isCombo, true);
    assert.equal(result.total, 12);
    assert.equal(result.cells.length, 12);
    assert.ok(result.boundsW > 0);
    assert.ok(result.boundsH > 0);
  });
});

describe('calcMultiCustomerTiling - Gang-Run Batch Calculator', () => {
  it('should pack multiple customers with different sizes and quantities together', () => {
    const customers = [
      { photoIndex: 0, id: 'c1', name: 'Alice', w: 2, h: 2, quantity: 2, sizeName: '2×2' },
      { photoIndex: 1, id: 'c2', name: 'Bob', w: 1, h: 1, quantity: 4, sizeName: '1×1' },
      { photoIndex: 2, id: 'c3', name: 'Charlie', w: 2, h: 2, quantity: 1, sizeName: '2×2' },
    ];

    const result = calcMultiCustomerTiling(customers, 8.5, 11, { margin: 0.2, gap: 0.05 });

    assert.equal(result.isMultiCustomer, true);
    assert.equal(result.total, 7); // 2 + 4 + 1
    assert.equal(result.cells.length, 7);

    // Verify same-size grouping (all 2x2s should be grouped together)
    const twoByTwos = result.cells.filter(c => c.w === 2 && c.h === 2);
    assert.equal(twoByTwos.length, 3);

    const oneByOnes = result.cells.filter(c => c.w === 1 && c.h === 1);
    assert.equal(oneByOnes.length, 4);

    // Check photo index assignments
    assert.equal(twoByTwos[0].photoIndex, 0); // Alice
    assert.equal(twoByTwos[1].photoIndex, 0); // Alice (second copy)
    assert.equal(twoByTwos[2].photoIndex, 2); // Charlie
  });
});

describe('calculatePaperEfficiency - Space Utilization Metrics', () => {
  it('should compute exact area and utilization percentage', () => {
    const cells = [
      { w: 2, h: 2, filled: true },
      { w: 2, h: 2, filled: true },
      { w: 1, h: 1, filled: true },
    ];
    // sheet: 10 x 10 = 100 sq in
    // used: 4 + 4 + 1 = 9 sq in -> 9%
    const eff = calculatePaperEfficiency(10, 10, cells);
    assert.equal(eff.sheetArea, 100);
    assert.equal(eff.usedArea, 9);
    assert.equal(eff.unusedArea, 91);
    assert.equal(eff.utilizationPercent, 9);
    assert.equal(eff.unusedPercent, 91);
  });

  it('should handle empty or invalid sheet gracefully', () => {
    const eff = calculatePaperEfficiency(0, 0, []);
    assert.equal(eff.utilizationPercent, 0);
    assert.equal(eff.unusedPercent, 100);
  });
});

describe('calculatePrintEconomics - Print Cost & Revenue Calculator', () => {
  it('should compute gross revenue and net profit correctly', () => {
    // 12 copies, 5.00 paper cost, 50.00 price per copy
    const econ = calculatePrintEconomics(12, 5.0, 50.0);
    assert.equal(econ.paperCost, 5.0);
    assert.equal(econ.grossRevenue, 600.0);
    assert.equal(econ.netProfit, 595.0);
    assert.ok(econ.marginPercent > 90);
  });
});
