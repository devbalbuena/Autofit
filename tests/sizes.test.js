import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  unitToInches,
  inchesToUnit,
  formatDimension,
  formatSizeDimensions,
  getSizeById,
  getSheetById,
  PRINTER_PROFILES,
} from '../src/lib/sizes.js';

describe('sizes.js - Unit Conversion Functions', () => {
  it('converts millimeters and centimeters to inches correctly', () => {
    // 25.4 mm = 1.0 inch
    assert.equal(Math.round(unitToInches(25.4, 'mm') * 100) / 100, 1.0);
    // 5.08 cm = 2.0 inch
    assert.equal(Math.round(unitToInches(5.08, 'cm') * 100) / 100, 2.0);
    // 2.0 in = 2.0 inch
    assert.equal(unitToInches(2.0, 'in'), 2.0);
  });

  it('converts inches to metric units correctly', () => {
    assert.equal(inchesToUnit(1, 'mm'), '25.4');
    assert.equal(inchesToUnit(2, 'cm'), '5.08');
    assert.equal(inchesToUnit(3, 'in'), '3.00');
  });

  it('formats dimensions with units properly', () => {
    assert.equal(formatDimension(2, 'in'), '2.00"');
    assert.equal(formatDimension(2, 'cm'), '5.1 cm');
    assert.equal(formatDimension(2, 'mm'), '51 mm');

    assert.equal(formatSizeDimensions(2, 2, 'in'), '2" × 2"');
    assert.equal(formatSizeDimensions(2, 2, 'mm'), '51 × 51 mm');
  });

  it('looks up size presets reliably', () => {
    const twoByTwo = getSizeById('2x2');
    assert.ok(twoByTwo);
    assert.equal(twoByTwo.w, 2);
    assert.equal(twoByTwo.h, 2);

    const a4 = getSheetById('a4');
    assert.ok(a4);
    assert.equal(a4.w, 8.27);
    assert.equal(a4.h, 11.69);
  });

  it('provides printer hardware calibration profiles with valid margins', () => {
    assert.ok(Array.isArray(PRINTER_PROFILES));
    assert.ok(PRINTER_PROFILES.length >= 4);
    PRINTER_PROFILES.forEach(profile => {
      assert.ok(profile.id);
      assert.ok(profile.name);
      assert.ok(profile.margin >= 0);
      assert.ok(profile.gap >= 0);
    });
  });
});
