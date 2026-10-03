# 🖨️ AutoFit — Offline Photo Print Sizer & Tiling Engine

> **Lightweight, millimeter-accurate, 100% offline photo print sizing toolbox designed for print shops and photo studios.**

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Offline First](https://img.shields.io/badge/Offline-100%25-success)](https://github.com/devbalbuena/Autofit)
[![Zero Backend](https://img.shields.io/badge/Backend-None%20(Pure%20Client)-blue)](https://github.com/devbalbuena/Autofit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 📸 **Instant Photo Input**:
  - **Clipboard Paste** (<kbd>Ctrl+V</kbd>) directly from WhatsApp Web, Facebook, or browser tabs.
  - **Drag & Drop** single or multiple files anywhere on the workspace.
  - **Multi-Photo Queue**: Load multiple different photos on a single sheet to maximize paper efficiency.
- 📐 **Standard & Custom Dimensions**:
  - **ID & Passport**: `1×1 in`, `2×2 in` (Passport), `35×45 mm` (International), `Wallet (2×2.5 in)`.
  - **Standard Photo**: `3R (3.5×5 in)`, `4R (4×6 in)`, `5R (5×7 in)`, `4×4 in (Square)`, `6R (6×8 in)`.
  - **Large & Document**: `8R (8×10 in)`, `A4 Full`, `Letter Full`.
  - **Custom Size Creator**: Enter exact Width × Height in `in`, `cm`, or `mm` with automatic saving.
- 📑 **Sheet Formats**:
  - `A4 (8.27 × 11.69 in)`
  - `Letter (8.5 × 11 in)`
  - `Legal (8.5 × 14 in)`
  - `Long Bond / Folio (8.5 × 13 in)`
  - `4×6 in Photo Paper` and `5×7 in Photo Paper`
- 🪪 **Photo Studio & ID Pro Tools**:
  - **ID Name Tag Banner**: White nameplate overlay with bold black text (`SURNAME, FIRST NAME M.I.`) for Gov/PRC/Civil Service/School IDs.
  - **Passport Biometric Oval Guide**: Centering guidelines for standard head-height compliance.
  - **Pan & Zoom Framing**: Zoom (100–250%) and adjust vertical/horizontal face position.
  - **Orientation & Mirroring**: Rotate CW/CCW and Flip Horizontal (Mirror selfie correction).
  - **ID Background Tints**: Quick solid backdrops in White, Royal Blue, Studio Red, and Passport Gray.
- ⚡ **Smart Tiling Engine**:
  - Auto-calculates optimal orientation for maximum sheet yield.
  - Adjustable sheet printable margins and photo spacing/gutters.
  - Custom copy count override with 1-click counter or `Auto` fill.
  - Multi-photo distribution mode (repeat active photo vs distribute all queue photos).
- ✂️ **Print Shop Ready**:
  - **Exact `@page` CSS Rules**: No unwanted browser margin shifts or multi-page blank spills.
  - **Corner Crop Marks**: Exterior hairline tick marks or dashed borders for clean trimmer cuts.
  - **300 DPI PDF & PNG Export**: Instant download of ultra-high-resolution, print-ready files.
  - **Fit Modes**: Toggle between `Fill (Cover)` and `Fit (Contain)`.
- 🕒 **Offline History Storage**:
  - Auto-saves recent loaded photos with compressed thumbnails (zero storage quota overflow).
  - 1-Click photo and preset restoration.

---

## 🚀 Quick Start (Windows)

### Option 1: One-Click Launcher (`start.bat`)
Simply double-click `start.bat` in the project root folder. It will automatically start the local server and launch your default browser to `http://localhost:5173/`.

### Option 2: Command Line
```bash
# Clone repository
git clone https://github.com/devbalbuena/Autofit.git
cd Autofit

# Install dependencies
npm install

# Start local server
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Ctrl</kbd> + <kbd>V</kbd> | Paste image from clipboard |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Print sheet with exact physical inch dimensions |
| <kbd>Ctrl</kbd> + <kbd>O</kbd> | Open file browser to select a photo |
| <kbd>+</kbd> / <kbd>−</kbd> | Increase or decrease copy count per sheet |
| <kbd>Esc</kbd> | Clear current loaded photo / close dialog |
| <kbd>?</kbd> | Toggle Keyboard Shortcuts Guide |

---

## 🛠️ Build for Production / Air-Gapped Deployment

To deploy AutoFit onto an air-gapped / offline computer without Node.js:

```bash
npm run build
```

The output in `/dist` is a 100% self-contained static site that can be opened directly in any browser or served with any static web server.

---

## 📄 License
MIT License © 2026 devbalbuena
