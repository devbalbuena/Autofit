/**
 * Print size presets and sheet size definitions.
 * Dimensions are in inches with metric equivalents for reference.
 */

export const SIZE_CATEGORIES = {
  ID: 'ID & Passport',
  PHOTO: 'Standard Photo',
  LARGE: 'Large & Document',
};

export const SIZES = [
  // ID & Passport
  { id: '1x1',     name: '1×1',      category: SIZE_CATEGORIES.ID,    w: 1,    h: 1,    mm: '25.4 × 25.4 mm', label: '1 × 1 in' },
  { id: '2x2',     name: '2×2',      category: SIZE_CATEGORIES.ID,    w: 2,    h: 2,    mm: '50.8 × 50.8 mm', label: '2 × 2 in (Passport)' },
  { id: 'passport',name: 'Passport', category: SIZE_CATEGORIES.ID,    w: 1.38, h: 1.77, mm: '35 × 45 mm',     label: '35 × 45 mm (Intl)' },
  { id: 'wallet',  name: 'Wallet',   category: SIZE_CATEGORIES.ID,    w: 2,    h: 2.5,  mm: '50.8 × 63.5 mm', label: '2 × 2.5 in' },

  // Standard Photos
  { id: '3r',      name: '3R',       category: SIZE_CATEGORIES.PHOTO, w: 3.5,  h: 5,    mm: '88.9 × 127 mm',  label: '3.5 × 5 in' },
  { id: '4r',      name: '4R',       category: SIZE_CATEGORIES.PHOTO, w: 4,    h: 6,    mm: '101.6 × 152.4 mm', label: '4 × 6 in' },
  { id: '5r',      name: '5R',       category: SIZE_CATEGORIES.PHOTO, w: 5,    h: 7,    mm: '127 × 177.8 mm', label: '5 × 7 in' },
  { id: '4x4',     name: '4×4 Sq',   category: SIZE_CATEGORIES.PHOTO, w: 4,    h: 4,    mm: '101.6 × 101.6 mm', label: '4 × 4 in (Square)' },
  { id: '6r',      name: '6R',       category: SIZE_CATEGORIES.PHOTO, w: 6,    h: 8,    mm: '152.4 × 203.2 mm', label: '6 × 8 in' },

  // Large & Document
  { id: '8r',      name: '8R',       category: SIZE_CATEGORIES.LARGE, w: 8,    h: 10,   mm: '203.2 × 254 mm', label: '8 × 10 in' },
  { id: 'a4',      name: 'A4 Full',  category: SIZE_CATEGORIES.LARGE, w: 8.27, h: 11.69, mm: '210 × 297 mm', label: '8.27 × 11.69 in' },
  { id: 'letter',  name: 'Letter',   category: SIZE_CATEGORIES.LARGE, w: 8.5,  h: 11,   mm: '215.9 × 279.4 mm', label: '8.5 × 11 in' },
];

export const SHEET_SIZES = {
  a4:     { id: 'a4',     name: 'A4',         w: 8.27, h: 11.69, label: 'A4 (8.27 × 11.69 in)' },
  letter: { id: 'letter', name: 'Letter',     w: 8.5,  h: 11,    label: 'Letter (8.5 × 11 in)' },
  legal:  { id: 'legal',  name: 'Legal',      w: 8.5,  h: 14,    label: 'Legal (8.5 × 14 in)' },
  folio:  { id: 'folio',  name: 'Long Bond',  w: 8.5,  h: 13,    label: 'Long / Folio (8.5 × 13 in)' },
};

export const DEFAULT_SIZE_ID = '4r';
export const DEFAULT_SHEET   = 'a4';
export const SCREEN_DPI      = 96; // Standard CSS px per inch

export function getSizeById(id) {
  return SIZES.find(s => s.id === id) ?? SIZES.find(s => s.id === DEFAULT_SIZE_ID) ?? SIZES[0];
}

export function getSheetById(id) {
  return SHEET_SIZES[id] ?? SHEET_SIZES[DEFAULT_SHEET];
}
