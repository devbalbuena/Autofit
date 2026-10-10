import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPLIANCE_STANDARDS,
  getAllComplianceStandards,
  getComplianceById
} from '../src/lib/compliance.js';

describe('compliance.js - Official Standards Database', () => {
  it('contains comprehensive domestic and international standards', () => {
    const all = getAllComplianceStandards();
    assert.ok(Array.isArray(all));
    assert.ok(all.length >= 8, 'Expected at least 8 standard specifications');
  });

  it('verifies all standards contain required biometric and photo spec fields', () => {
    COMPLIANCE_STANDARDS.forEach(std => {
      assert.ok(std.id, 'Standard must have an id');
      assert.ok(std.name, 'Standard must have a name');
      assert.ok(std.country, 'Standard must have a country');
      assert.ok(std.dimensionsLabel, 'Standard must have dimensions label');
      assert.ok(std.w > 0, 'Standard must have positive width');
      assert.ok(std.h > 0, 'Standard must have positive height');
      assert.ok(['white', 'blue', 'red', 'gray'].includes(std.bgPreset), `Invalid bgPreset: ${std.bgPreset}`);
      assert.ok(Array.isArray(std.rules) && std.rules.length > 0, 'Standard must have rules list');
      assert.equal(typeof std.showOval, 'boolean');
      assert.equal(typeof std.nameTagAllowed, 'boolean');
    });
  });

  it('correctly looks up US Visa standard specifications', () => {
    const usVisa = getComplianceById('us_visa');
    assert.ok(usVisa);
    assert.equal(usVisa.w, 2.0);
    assert.equal(usVisa.h, 2.0);
    assert.equal(usVisa.bgPreset, 'white');
    assert.equal(usVisa.nameTagAllowed, false);
    assert.equal(usVisa.showOval, true);
  });

  it('correctly looks up Philippine Civil Service (CSC) nametag standard', () => {
    const csc = getComplianceById('ph_civil_service');
    assert.ok(csc);
    assert.equal(csc.bgPreset, 'white');
    assert.equal(csc.nameTagRequired, true);
    assert.equal(csc.nameTagAllowed, true);

    const prc = getComplianceById('ph_prc');
    assert.ok(prc);
    assert.equal(prc.bgPreset, 'white');
    assert.equal(prc.nameTagRequired, true);
  });

  it('returns null for non-existent standard IDs', () => {
    assert.equal(getComplianceById('non_existent_id'), null);
  });
});
