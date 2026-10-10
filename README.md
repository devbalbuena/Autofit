# 🖨️ AutoFit — Studio ID & Photo Print Sizer

> **Millimeter-accurate, 100% offline photo print sizing toolbox and gang-run layout engine designed for print shops, copy centers, and photo studios.**

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Unit%20Tests-Passing%20(21%2F21)-brightgreen)](https://github.com/devbalbuena/Autofit)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple)](https://github.com/devbalbuena/Autofit)
[![Offline First](https://img.shields.io/badge/Offline-100%25-success)](https://github.com/devbalbuena/Autofit)
[![Zero Backend](https://img.shields.io/badge/Backend-None%20(Pure%20Client)-blue)](https://github.com/devbalbuena/Autofit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features & Studio Capabilities

### 🛂 Official Passport, Visa & Exam Compliance Standards
- **Built-in Biometric Standards Database**: Complete compliance specifications for US Visa/Passport, Schengen Visa, Philippine Passport (DFA), PRC Board Exam, Civil Service Exam (CSC), Canada, Japan, and UK Passport.
- **1-Click "⚡ Apply Specs"**: Automatically configures the exact dimensions, required backdrop color (White, Royal Blue, Studio Red, Light Gray), biometric head height oval guide, and nametag settings.
- **Quick Search & Filter**: Search standards by country, visa type, or agency in real time.

### 👥 Multi-Customer Gang-Run Printing & Batch Actions
- **Multi-Face Batching on a Single Sheet**: Pack multiple different customer portraits on one bond or photo paper to eliminate paper waste.
- **Independent Size & Quantity per Customer**: Give Customer #1 two 2×2" passport photos while giving Customer #2 four 1×1" ID photos on the same sheet.
- **Quick Duplicate Customer (⧉)**: Duplicate any customer photo and package with one click to easily add extra sets.
- **Batch Queue Actions**: 
  - `✨ Auto-Enhance All`: Apply balanced brightness, contrast, and sharpness across all queued customers simultaneously.
  - `↻ Rotate All +90°`: Rotate all queued photos in 90-degree steps for landscape camera captures.
  - `↺ Reset All`: Reset all filters and rotations across the entire queue.
- **Inline Customer Renaming**: Click any customer card title in the queue bar to rename them (e.g. `Juan Dela Cruz`), instantly syncing with their ID Name Tag banner.
- **Queue Reordering**: Move customers left or right using `◀` and `▶` reorder buttons.

### 🧾 Customer Claim Stub & Job Ticket Generator
- **Printable Order Receipt Slip**: Generate instant customer job tickets with barcode/order number (`#ORD-XXXXX`), customer name, itemized photo breakdown, date/time, and claim instructions.
- **Thermal Receipt & Desktop Printer Friendly**: Clean 80mm format designed for fast receipt printing or inclusion in customer delivery envelopes.

### 💾 Studio Layout Templates
- **Built-In Workflow Presets**: Instant 1-click loading for standard studio packages:
  - `🎓 School ID Package`: 4x 2×2" + 8x 1×1" combo pack
  - `🛂 Biometric Passport Set`: 6x 35×45mm passport pack
  - `💳 Wallet Photo Quad`: 4x 2×2.5" wallet photos
- **Custom Template Saving**: Save your shop's proprietary sheet margins, gaps, sizes, and quantities as named templates stored in `localStorage`.

### ☀️ High-Contrast Daylight Print Room Theme
- **Dual Studio Lighting Modes**: Switch between **Dark Studio** (for dark photo-editing booths) and **Daylight Print Room** (high-contrast light mode for fluorescent production shops and bright retail counters).

### 📐 Precision Sizing & Combos
- **Combo Packages**: 1-click popular packages like `Combo: 4 (2×2") + 8 (1×1")` or custom package splits.
- **Standard ID & Passport**: `1×1 in`, `2×2 in` (Passport / Visa), `35×45 mm` (International Schengen/Canada), `Wallet (2×2.5 in)`.
- **Photo Sizes**: `3R (3.5×5 in)`, `4R (4×6 in)`, `5R (5×7 in)`, `4×4 in (Square)`, `6R (6×8 in)`, `8R (8×10 in)`.
- **Custom Dimension Creator**: Create custom sizes in inches (`in`), centimeters (`cm`), or millimeters (`mm`) with permanent local storage.
- **Paper Formats**: A4, Letter, Legal, Long Bond / Folio (8.5×13 in), 4×6" photo cards, and custom paper dimensions.

### 🪪 ID Studio & Portrait Enhancement
- **Studio Tone Presets**: 1-click "☀️ Warm Studio", "❄️ Cool Tone", "📜 Sepia", and "✨ Auto Balance".
- **Fine-Grain Color Balance**: Independent color temperature and sepia sliders alongside brightness, contrast, saturation, and sharpness.
- **ID Name Tag Banners**: Official white nametag bar (`SURNAME, FIRST NAME M.I.`) for Civil Service, PRC, and school requirements.
- **Biometric Passport Oval Guide**: Visual overlay for head-height alignment compliance.
- **Background Replacement Tints**: Solid studio backdrops in White, Royal Blue, Studio Red, and Passport Gray.
- **Framing & Pan/Zoom**: Smooth canvas dragging with rotation, tilt, and mirror flip.

### 🖨️ Printer Hardware Calibration & Margin Control
- **Pre-Configured Printer Hardware Presets**:
  - **Epson Photo L805 / L1800**: 0.12″ margins, 0.04″ hairline gap
  - **Epson EcoTank L3110 / L3210**: 0.16″ safe margins
  - **Canon Pixma G-Series**: 0.20″ standard margins
  - **HP InkTank Series**: 0.24″ margins
  - **Borderless Photo Mode**: 0.00″ bleed margin
- **Cutting Guide Customization**:
  - Exterior corner ticks (no marks on photo edges), dashed box lines, or none.
  - Guide contrast palette: ⚫ Black, 🔘 Slate Gray, or ⚪ Light Hairline.

### 📊 Paper Space Efficiency & Profit Calculator
- **Real-Time Space Utilization**: Visual meter showing exact sheet square inches used vs. unprinted white space saved.
- **Multi-Currency Pricing Support**: Seamless currency switching (`₱` PHP, `$` USD, `€` EUR, `£` GBP, `¥` JPY, `₹` INR, `AED`) with persistent shop rates.
- **Cost & Revenue Estimator**: Set paper cost and price per ID copy to see gross revenue and net profit per sheet in real time.

### 🔒 Studio Proofing & Metadata
- **Sample / Proof Watermark**: Diagonal translucent watermark overlay (`SAMPLE`, `PROOF`, or custom text) for customer proofs before payment.
- **Sheet Metadata Timestamp**: Bottom margin stamp recording job title, paper size, and date for studio archiving.

### 💾 300 DPI Export & Native Printing
- **Direct Windows Print**: Injected `@page` CSS ensures exact 1:1 physical dimensions without scaling artifacts.
- **High-Res Export**: 300 DPI print-ready PDF and PNG downloads.

---

## 🚀 Installation & Running

### Option 1: Native Desktop PWA (Recommended)
1. Open AutoFit in Google Chrome, Microsoft Edge, or Brave.
2. Click the **Install** icon in the address bar (or menu `Install AutoFit`).
3. AutoFit runs in its own dedicated window with full offline caching via Service Worker.

### Option 2: One-Click Windows Launcher (`start.bat`)
Double-click `start.bat` in the project root directory. It starts the local Vite dev server and opens your default browser at `http://localhost:5173/`.

### Option 3: Terminal / Command Line
```bash
# Clone the repository
git clone https://github.com/devbalbuena/Autofit.git
cd Autofit

# Install dependencies
npm install

# Run automated tests
npm test

# Start the dev server
npm run dev
```

---

## ⌨️ Operator Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Ctrl</kbd> + <kbd>V</kbd> | Paste image from clipboard (WhatsApp, Facebook, file copy) |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Print sheet with exact physical inch dimensions |
| <kbd>Ctrl</kbd> + <kbd>O</kbd> | Open file picker to import photos |
| <kbd>+</kbd> / <kbd>−</kbd> | Increase or decrease copy count per sheet |
| <kbd>Ctrl</kbd> + <kbd>[</kbd> / <kbd>\</kbd> | Toggle left sidebar |
| <kbd>Ctrl</kbd> + <kbd>]</kbd> / <kbd>\</kbd> | Toggle right adjustments inspector |
| <kbd>Esc</kbd> | Clear current loaded photo / dismiss dialog |
| <kbd>?</kbd> | Open Keyboard Shortcuts & Calibration Cheat Sheet |

---

## 🧪 Automated Unit Test Suite

AutoFit features an automated unit test suite executed with Node.js test runner:

```bash
npm test
```

Test coverage includes:
- Metric & Imperial unit conversions (`mm`, `cm`, `in`)
- Single size grid tiling & boundary checks
- Multi-size combo package calculations
- Multi-customer gang-run packing algorithms
- Paper space efficiency & area utilization formulas
- Print shop job economics & profit calculations
- Hardware printer calibration margin presets
- Official passport, visa & biometric compliance database rules
- Studio workflow layout presets & fallback configuration

---

## 📦 Production / Air-Gapped Deployment

To build a standalone bundle for air-gapped computers without Node.js:

```bash
npm run build
```

The output in `/dist` is a 100% self-contained static application with offline service worker support that can be copied directly to a USB drive and run on any workstation.

---

## 📄 License
MIT License © 2026 [devbalbuena](https://github.com/devbalbuena)
