/**
 * exporter.js — 300 DPI High-Resolution Image & Sheet Exporter
 * Renders the exact layout and image enhancements to a high-resolution canvas for direct download.
 */
import { toast } from './toast.js';
import { getCSSFilterString } from '../components/ImageAdjustments.js';

const PRINT_DPI = 300; // Standard 300 DPI print quality

/**
 * Export current sheet layout as a 300 DPI PNG file
 */
export async function exportHighResPNG({
  sheetObj,
  sizeObj,
  tilingResult,
  imageDataUrl,
  fitMode = 'cover',
  showCutGuides = true,
  adjustments = {},
}) {
  if (!imageDataUrl) {
    toast('Please load a photo first before exporting', 'error');
    return;
  }

  toast('Rendering 300 DPI high-resolution sheet...', 'info', 2000);

  try {
    // 1. Create 300 DPI Canvas
    const canvas = document.createElement('canvas');
    const widthPx  = Math.round(sheetObj.w * PRINT_DPI);
    const heightPx = Math.round(sheetObj.h * PRINT_DPI);

    canvas.width  = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');

    // 2. White Paper Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 3. Pre-render rotated & filtered source image onto a helper canvas
    const img = await loadImageAsync(imageDataUrl);
    const processedImgCanvas = document.createElement('canvas');
    const rot = adjustments.rotation ?? 0;

    const isRot90or270 = rot === 90 || rot === 270;
    processedImgCanvas.width  = isRot90or270 ? img.naturalHeight : img.naturalWidth;
    processedImgCanvas.height = isRot90or270 ? img.naturalWidth : img.naturalHeight;

    const pCtx = processedImgCanvas.getContext('2d');
    pCtx.filter = getCSSFilterString(adjustments);

    pCtx.translate(processedImgCanvas.width / 2, processedImgCanvas.height / 2);
    pCtx.rotate((rot * Math.PI) / 180);
    pCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    // 4. Render Tiles onto Main Canvas
    if (tilingResult.isCombo) {
      // Combo layout
      for (const cell of tilingResult.cells) {
        const cellX = Math.round(cell.x * PRINT_DPI);
        const cellY = Math.round(cell.y * PRINT_DPI);
        const cellW = Math.round(cell.w * PRINT_DPI);
        const cellH = Math.round(cell.h * PRINT_DPI);

        drawCell(ctx, processedImgCanvas, cellX, cellY, cellW, cellH, fitMode, showCutGuides);
      }
    } else {
      // Standard grid layout
      const cellW = Math.round(tilingResult.cellW * PRINT_DPI);
      const cellH = Math.round(tilingResult.cellH * PRINT_DPI);
      const gapPx = Math.round(tilingResult.gap * PRINT_DPI);
      const startX = Math.round(tilingResult.offsetX * PRINT_DPI);
      const startY = Math.round(tilingResult.offsetY * PRINT_DPI);
      const total = tilingResult.total;

      for (let i = 0; i < total; i++) {
        const col = i % tilingResult.cols;
        const row = Math.floor(i / tilingResult.cols);

        const cellX = startX + col * (cellW + gapPx);
        const cellY = startY + row * (cellH + gapPx);

        drawCell(ctx, processedImgCanvas, cellX, cellY, cellW, cellH, fitMode, showCutGuides);
      }
    }

    // 5. Download Canvas as PNG
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `AutoFit_${sizeObj.name.replace(/[^a-zA-Z0-9]/g, '_')}_${sheetObj.name}_300DPI.png`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast(`Downloaded: ${filename}`, 'success', 3500);
  } catch (err) {
    console.error('Export error:', err);
    toast('Export failed: ' + err.message, 'error');
  }
}

function drawCell(ctx, imgCanvas, x, y, w, h, fitMode, showCutGuides) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Draw image (cover or contain)
  const imgW = imgCanvas.width;
  const imgH = imgCanvas.height;
  const imgAspect = imgW / imgH;
  const cellAspect = w / h;

  let drawW, drawH, drawX, drawY;

  if (fitMode === 'contain') {
    if (imgAspect > cellAspect) {
      drawW = w;
      drawH = w / imgAspect;
      drawX = x;
      drawY = y + (h - drawH) / 2;
    } else {
      drawH = h;
      drawW = h * imgAspect;
      drawX = x + (w - drawW) / 2;
      drawY = y;
    }
  } else {
    // Cover mode (default)
    if (imgAspect > cellAspect) {
      drawH = h;
      drawW = h * imgAspect;
      drawX = x + (w - drawW) / 2;
      drawY = y;
    } else {
      drawW = w;
      drawH = w / imgAspect;
      drawX = x;
      drawY = y + (h - drawH) / 2;
    }
  }

  ctx.drawImage(imgCanvas, drawX, drawY, drawW, drawH);
  ctx.restore();

  // Draw cutting guides
  if (showCutGuides) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }
}

function loadImageAsync(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
