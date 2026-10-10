import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_STUDIO_TEMPLATES,
  getStudioTemplates
} from '../src/lib/templates.js';

describe('templates.js - Studio Layout Presets', () => {
  it('supplies built-in studio workflow templates', () => {
    assert.ok(Array.isArray(DEFAULT_STUDIO_TEMPLATES));
    assert.ok(DEFAULT_STUDIO_TEMPLATES.length >= 3);
  });

  it('validates each built-in template has complete layout geometry and metadata', () => {
    DEFAULT_STUDIO_TEMPLATES.forEach(tmpl => {
      assert.ok(tmpl.id);
      assert.ok(tmpl.name);
      assert.equal(tmpl.isBuiltin, true);
      assert.ok(tmpl.sizeId);
      assert.ok(tmpl.sheetId);
      assert.ok(['portrait', 'landscape'].includes(tmpl.orientation));
      assert.ok(tmpl.margin !== undefined);
      assert.ok(tmpl.gap !== undefined);
    });
  });

  it('gracefully falls back to default templates when localStorage is not available', () => {
    const tmpls = getStudioTemplates();
    assert.ok(Array.isArray(tmpls));
    assert.equal(tmpls.length, DEFAULT_STUDIO_TEMPLATES.length);
  });
});
