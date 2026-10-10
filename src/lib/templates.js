/**
 * templates.js — Studio Layout & Gang-Run Template Engine
 * Allows print shops to save, load, and manage named layout presets in localStorage.
 */

const STORAGE_KEY = 'autofit_studio_templates';

export const DEFAULT_STUDIO_TEMPLATES = [
  {
    id: 'tmpl_school_pack',
    name: '🎓 School ID Package (4x 2×2" + 8x 1×1")',
    isBuiltin: true,
    sizeId: 'combo_4x2_8x1',
    sheetId: 'a4',
    orientation: 'portrait',
    alignment: 'top-left',
    margin: 0.2,
    gap: 0.05,
    guideType: 'corners',
  },
  {
    id: 'tmpl_passport_set',
    name: '🛂 Biometric Passport Set (6x 35×45mm)',
    isBuiltin: true,
    sizeId: 'passport',
    count: 6,
    sheetId: 'a4',
    orientation: 'portrait',
    alignment: 'top-left',
    margin: 0.2,
    gap: 0.05,
    guideType: 'corners',
  },
  {
    id: 'tmpl_wallet_quad',
    name: '💳 Wallet Photo Quad (4x 2×2.5")',
    isBuiltin: true,
    sizeId: 'wallet',
    count: 4,
    sheetId: 'letter',
    orientation: 'portrait',
    alignment: 'top-left',
    margin: 0.25,
    gap: 0.08,
    guideType: 'corners',
  }
];

export function getStudioTemplates() {
  if (typeof localStorage === 'undefined') return DEFAULT_STUDIO_TEMPLATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const custom = raw ? JSON.parse(raw) : [];
    return [...DEFAULT_STUDIO_TEMPLATES, ...custom];
  } catch (err) {
    return DEFAULT_STUDIO_TEMPLATES;
  }
}

export function saveStudioTemplate(name, config) {
  if (!name || !name.trim()) throw new Error('Template name is required');
  const templates = getCustomStudioTemplates();
  const newTmpl = {
    id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: name.trim(),
    isBuiltin: false,
    createdAt: new Date().toISOString(),
    ...config,
  };
  templates.push(newTmpl);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }
  return newTmpl;
}

export function deleteStudioTemplate(id) {
  const custom = getCustomStudioTemplates().filter(t => t.id !== id);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  }
}

function getCustomStudioTemplates() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}
