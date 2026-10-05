/**
 * sizes.js
 * Print size presets, custom dimensions, custom sheet papers, and global unit system.
 * Dimensions are stored internally in inches with on-the-fly metric conversion.
 */

export const SIZE_CATEGORIES = {
  COMBO: 'ID Packages',
  ID: 'ID & Passport',
  PHOTO: 'Standard Photo',
  LARGE: 'Large & Document',
  CUSTOM: 'Custom Sizes',
};

export const BASE_SIZES = [
  // ── ID Combo Packages ───────────────────────────────────────────────────
  {
    id: 'combo_4x2_8x1',
    name: '4 (2×2) + 8 (1×1)',
    category: SIZE_CATEGORIES.COMBO,
    isCombo: true,
    label: '4pcs 2×2 + 8pcs 1×1',
    description: 'Standard Job & Gov Application Pack',
    comboItems: [
      { name: '2×2', w: 2, h: 2, count: 4 },
      { name: '1×1', w: 1, h: 1, count: 8 },
    ],
  },
  {
    id: 'combo_4x2_3x1',
    name: '4 (2×2) + 3 (1×1)',
    category: SIZE_CATEGORIES.COMBO,
    isCombo: true,
    label: '4pcs 2×2 + 3pcs 1×1',
    description: 'Compact Rush ID Pack',
    comboItems: [
      { name: '2×2', w: 2, h: 2, count: 4 },
      { name: '1×1', w: 1, h: 1, count: 3 },
    ],
  },
  {
    id: 'combo_3x1_4x2',
    name: '3 (1×1) + 4 (2×2)',
    category: SIZE_CATEGORIES.COMBO,
    isCombo: true,
    label: '3pcs 1×1 + 4pcs 2×2',
    description: 'Student & Employment Combo',
    comboItems: [
      { name: '1×1', w: 1, h: 1, count: 3 },
      { name: '2×2', w: 2, h: 2, count: 4 },
    ],
  },
  {
    id: 'combo_visa_passport',
    name: 'Visa & Passport Combo',
    category: SIZE_CATEGORIES.COMBO,
    isCombo: true,
    label: '2 Passport + 4 (2×2) + 4 (1×1)',
    description: 'International Travel & Visa Pack',
    comboItems: [
      { name: 'Passport (35×45mm)', w: 1.38, h: 1.77, count: 2 },
      { name: '2×2', w: 2, h: 2, count: 4 },
      { name: '1×1', w: 1, h: 1, count: 4 },
    ],
  },

  // ── ID & Passport Singles ───────────────────────────────────────────────
  { id: '1x1',      name: '1×1',      category: SIZE_CATEGORIES.ID,    w: 1,    h: 1,    mm: '25.4 × 25.4 mm', label: '1 × 1 in' },
  { id: '2x2',      name: '2×2',      category: SIZE_CATEGORIES.ID,    w: 2,    h: 2,    mm: '50.8 × 50.8 mm', label: '2 × 2 in (Passport)' },
  { id: 'passport', name: 'Passport', category: SIZE_CATEGORIES.ID,    w: 1.38, h: 1.77, mm: '35 × 45 mm',     label: '35 × 45 mm (Intl)' },
  { id: 'wallet',   name: 'Wallet',   category: SIZE_CATEGORIES.ID,    w: 2,    h: 2.5,  mm: '50.8 × 63.5 mm', label: '2 × 2.5 in' },

  // ── Standard Photos ─────────────────────────────────────────────────────
  { id: '3r',       name: '3R',       category: SIZE_CATEGORIES.PHOTO, w: 3.5,  h: 5,    mm: '88.9 × 127 mm',  label: '3.5 × 5 in' },
  { id: '4r',       name: '4R',       category: SIZE_CATEGORIES.PHOTO, w: 4,    h: 6,    mm: '101.6 × 152.4 mm', label: '4 × 6 in' },
  { id: '5r',       name: '5R',       category: SIZE_CATEGORIES.PHOTO, w: 5,    h: 7,    mm: '127 × 177.8 mm', label: '5 × 7 in' },
  { id: '4x4',      name: '4×4 Sq',   category: SIZE_CATEGORIES.PHOTO, w: 4,    h: 4,    mm: '101.6 × 101.6 mm', label: '4 × 4 in (Square)' },
  { id: '6r',       name: '6R',       category: SIZE_CATEGORIES.PHOTO, w: 6,    h: 8,    mm: '152.4 × 203.2 mm', label: '6 × 8 in' },

  // ── Large & Document ────────────────────────────────────────────────────
  { id: '8r',       name: '8R',       category: SIZE_CATEGORIES.LARGE, w: 8,    h: 10,   mm: '203.2 × 254 mm', label: '8 × 10 in' },
  { id: 'a4',       name: 'A4 Full',  category: SIZE_CATEGORIES.LARGE, w: 8.27, h: 11.69, mm: '210 × 297 mm', label: '8.27 × 11.69 in' },
  { id: 'letter',   name: 'Letter',   category: SIZE_CATEGORIES.LARGE, w: 8.5,  h: 11,   mm: '215.9 × 279.4 mm', label: '8.5 × 11 in' },
];

export const BASE_SHEET_SIZES = {
  a4:         { id: 'a4',         name: 'A4',         w: 8.27, h: 11.69, label: 'A4 (8.27 × 11.69 in)' },
  letter:     { id: 'letter',     name: 'Letter',     w: 8.5,  h: 11,    label: 'Letter (8.5 × 11 in)' },
  legal:      { id: 'legal',      name: 'Legal',      w: 8.5,  h: 14,    label: 'Legal (8.5 × 14 in)' },
  folio:      { id: 'folio',      name: 'Long Bond',  w: 8.5,  h: 13,    label: 'Long / Folio (8.5 × 13 in)' },
  sheet_4x6:  { id: 'sheet_4x6',  name: '4×6 Photo',  w: 4,    h: 6,     label: '4 × 6 in Photo Paper' },
  sheet_5x7:  { id: 'sheet_5x7',  name: '5×7 Photo',  w: 5,    h: 7,     label: '5 × 7 in Photo Paper' },
};

export const DEFAULT_SIZE_ID = '4r';
export const DEFAULT_SHEET   = 'a4';
export const SCREEN_DPI      = 96;

export const PRINTER_PROFILES = [
  { id: 'epson_photo',    name: 'Epson Photo (L805 / L1800)',  margin: 0.12, gap: 0.04, desc: '3mm min margin' },
  { id: 'epson_standard', name: 'Epson EcoTank (L3110 / L120)', margin: 0.20, gap: 0.05, desc: '5mm safe margin' },
  { id: 'canon_pixma',    name: 'Canon PIXMA (G2010 / G3010)', margin: 0.24, gap: 0.05, desc: '6mm feed margin' },
  { id: 'hp_inktank',     name: 'HP Ink Tank / Smart Tank',    margin: 0.28, gap: 0.06, desc: '7mm bottom margin' },
  { id: 'borderless',     name: 'Full Bleed (Borderless)',     margin: 0.00, gap: 0.04, desc: '0mm edge-to-edge' },
];

const CUSTOM_SIZES_KEY  = 'autofit_custom_sizes';
const CUSTOM_SHEETS_KEY = 'autofit_custom_sheets';
const UNIT_PREF_KEY     = 'autofit_unit_pref';

/**
 * ─── Unit Conversion & Formatting ──────────────────────────────────────────
 */
export function getUnitPreference() {
  try {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem(UNIT_PREF_KEY) : null) || 'in';
  } catch {
    return 'in';
  }
}

export function setUnitPreference(unit) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(UNIT_PREF_KEY, unit);
    }
  } catch (err) {
    console.warn('Failed to save unit preference:', err);
  }
}

export function unitToInches(val, unit) {
  const num = parseFloat(val) || 0;
  if (unit === 'cm') return num / 2.54;
  if (unit === 'mm') return num / 25.4;
  return num; // 'in'
}

export function inchesToUnit(inches, unit) {
  if (unit === 'cm') return (inches * 2.54).toFixed(2);
  if (unit === 'mm') return (inches * 25.4).toFixed(1);
  return inches.toFixed(2);
}

export function formatDimension(inches, unit = getUnitPreference()) {
  if (unit === 'cm') return `${(inches * 2.54).toFixed(1)} cm`;
  if (unit === 'mm') return `${(inches * 25.4).toFixed(0)} mm`;
  return `${inches.toFixed(2)}"`;
}

export function formatSizeDimensions(w, h, unit = getUnitPreference()) {
  if (unit === 'cm') return `${(w * 2.54).toFixed(1)} × ${(h * 2.54).toFixed(1)} cm`;
  if (unit === 'mm') return `${(w * 25.4).toFixed(0)} × ${(h * 25.4).toFixed(0)} mm`;
  return `${w}" × ${h}"`;
}

/**
 * ─── Custom Print Sizes Persistence ────────────────────────────────────────
 */
export function getCustomSizes() {
  try {
    const data = typeof localStorage !== 'undefined' ? localStorage.getItem(CUSTOM_SIZES_KEY) : null;
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomSizes(list) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CUSTOM_SIZES_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Failed to save custom sizes:', err);
  }
}

export function addCustomSize({ name, width, height, unit = 'in' }) {
  const w = Math.round(unitToInches(width, unit) * 100) / 100;
  const h = Math.round(unitToInches(height, unit) * 100) / 100;
  const id = `custom_${Date.now()}`;
  const customSize = {
    id,
    name: name || `${width}×${height} ${unit}`,
    category: SIZE_CATEGORIES.CUSTOM,
    isCustom: true,
    w,
    h,
    label: `${w}" × ${h}" (${(w * 25.4).toFixed(0)} × ${(h * 25.4).toFixed(0)} mm)`,
    rawUnit: unit,
    rawW: width,
    rawH: height,
  };

  const list = getCustomSizes();
  list.unshift(customSize);
  saveCustomSizes(list);
  return customSize;
}

export function removeCustomSize(id) {
  const list = getCustomSizes().filter(s => s.id !== id);
  saveCustomSizes(list);
  return list;
}

export function getAllSizes() {
  const custom = getCustomSizes();
  return [...custom, ...BASE_SIZES];
}

export const SIZES = getAllSizes();

export function getSizeById(id) {
  const all = getAllSizes();
  return all.find(s => s.id === id) ?? all.find(s => s.id === DEFAULT_SIZE_ID) ?? all[0];
}

/**
 * ─── Custom Sheet Paper Persistence ────────────────────────────────────────
 */
export function getCustomSheets() {
  try {
    const data = typeof localStorage !== 'undefined' ? localStorage.getItem(CUSTOM_SHEETS_KEY) : null;
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomSheets(list) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CUSTOM_SHEETS_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Failed to save custom sheets:', err);
  }
}

export function addCustomSheet({ name, width, height, unit = 'in' }) {
  const w = Math.round(unitToInches(width, unit) * 100) / 100;
  const h = Math.round(unitToInches(height, unit) * 100) / 100;
  const id = `sheet_custom_${Date.now()}`;
  const customSheet = {
    id,
    name: name || `${width}×${height} ${unit} Paper`,
    w,
    h,
    label: `${name || 'Custom'} (${w}" × ${h}")`,
    isCustom: true,
    rawUnit: unit,
    rawW: width,
    rawH: height,
  };

  const list = getCustomSheets();
  list.unshift(customSheet);
  saveCustomSheets(list);
  return customSheet;
}

export function removeCustomSheet(id) {
  const list = getCustomSheets().filter(s => s.id !== id);
  saveCustomSheets(list);
  return list;
}

export function getAllSheets() {
  const custom = getCustomSheets();
  const base = Object.values(BASE_SHEET_SIZES);
  return [...custom, ...base];
}

export function getSheetById(id) {
  const all = getAllSheets();
  return all.find(s => s.id === id) ?? BASE_SHEET_SIZES[id] ?? BASE_SHEET_SIZES[DEFAULT_SHEET];
}

export const SHEET_SIZES = BASE_SHEET_SIZES;
