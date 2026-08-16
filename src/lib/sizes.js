// Print size presets — all dimensions in inches
export const SIZES = [
  { id: 'wallet',  name: 'Wallet',  w: 2,    h: 2.5,  label: '2 × 2.5 in' },
  { id: '2x2',    name: '2×2',     w: 2,    h: 2,    label: '2 × 2 in'   },
  { id: '3r',     name: '3R',      w: 3.5,  h: 5,    label: '3.5 × 5 in' },
  { id: '4r',     name: '4R',      w: 4,    h: 6,    label: '4 × 6 in'   },
  { id: '5r',     name: '5R',      w: 5,    h: 7,    label: '5 × 7 in'   },
  { id: '4x4',    name: '4×4',     w: 4,    h: 4,    label: '4 × 4 in'   },
  { id: '8r',     name: '8R',      w: 8,    h: 10,   label: '8 × 10 in'  },
  { id: 'a4',     name: 'A4 Full', w: 8.27, h: 11.69, label: '8.27 × 11.69 in' },
];

export const SHEET_SIZES = {
  a4:     { name: 'A4',     w: 8.27, h: 11.69 },
  letter: { name: 'Letter', w: 8.5,  h: 11    },
};

export const DEFAULT_SIZE_ID = '4r';
export const DEFAULT_SHEET   = 'a4';
export const SCREEN_DPI      = 96; // px per inch for preview scaling

export function getSizeById(id) {
  return SIZES.find(s => s.id === id) ?? SIZES[0];
}
