/**
 * exporter.js — 300 DPI High-Resolution Image & Print-Ready PDF Exporter
 * Renders exact layout, crop marks, Name Tags, and transforms to a high-resolution canvas.
 */
import { jsPDF } from 'jspdf';
import { toast } from './toast.js';
import { getCSSFilterString } from '../components/ImageAdjustments.js';

const PRINT_DPI = 300; // Standard 300 DPI print quality

/**
 * Render the entire sheet to an in-memory 300 DPI Canvas
 */
async function renderSheetToCanvas({
  sheetObj,
  tilingResult,
  photos = [],
  activePhotoIndex = 0,
  fitMode = 'cover',
  guideType = 'corners',
  distributeMode = 'repeat',
}) {
  const canvas = document.createElement('canvas');
  const widthPx  = Math.round(sheetObj.w * PRINT_DPI);
  const heightPx = Math.round(sheetObj.h * PRINT_DPI);

  canvas.width  = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');

  // White Paper Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Pre-load and process unique photos
  const processedCache = new Map();
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const proc = await processPhotoCanvas(photo);
    processedCache.set(i, proc);
  }

  // Draw each cell
  for (let idx = 0; idx < tilingResult.cells.length; idx++) {
    const cell = tilingResult.cells[idx];
    if (!cell.filled) continue;

    const photoIdx = (cell.photoIndex !== undefined && photos[cell.photoIndex])
      ? cell.photoIndex
      : ((distributeMode === 'distribute' && photos.length > 1)
        ? (idx % photos.length)
        : activePhotoIndex);

    const photo = photos[photoIdx] || photos[0];
    const procCanvas = processedCache.get(photoIdx) || processedCache.get(0);

    const cellX = Math.round(cell.x * PRINT_DPI);
    const cellY = Math.round(cell.y * PRINT_DPI);
    const cellW = Math.round(cell.w * PRINT_DPI);
    const cellH = Math.round(cell.h * PRINT_DPI);

    drawCellOnCanvas({
      ctx,
      procCanvas,
      x: cellX,
      y: cellY,
      w: cellW,
      h: cellH,
      photo,
      fitMode,
      guideType,
    });
  }

  return canvas;
}

/**
 * Helper to process photo transforms, filters, and background tint onto offscreen canvas
 */
async function processPhotoCanvas(photo) {
  const img = await loadImageAsync(photo.dataUrl);
  const adj = photo.adjustments || {};

  const pCanvas = document.createElement('canvas');
  const rot   = (adj.rotation ?? 0) + (adj.tilt ?? 0);
  const flipH = adj.flipH ? -1 : 1;
  const flipV = adj.flipV ? -1 : 1;
  const zoom  = adj.zoom ?? 1;

  // Compute rotation bounding box to prevent clipping corners on any angle/tilt
  const rad = Math.abs((rot * Math.PI) / 180);
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const boundW = Math.max(1, Math.round(img.naturalWidth * cos + img.naturalHeight * sin));
  const boundH = Math.max(1, Math.round(img.naturalWidth * sin + img.naturalHeight * cos));

  pCanvas.width  = boundW;
  pCanvas.height = boundH;

  const pCtx = pCanvas.getContext('2d');

  // Background color
  if (adj.bgPreset && adj.bgPreset !== 'none') {
    pCtx.fillStyle = getBgColorHex(adj.bgPreset);
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
  }

  pCtx.filter = getCSSFilterString(adj);

  pCtx.save();
  pCtx.translate(pCanvas.width / 2, pCanvas.height / 2);
  pCtx.rotate((rot * Math.PI) / 180);
  pCtx.scale(flipH, flipV);

  pCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  pCtx.restore();

  return pCanvas;
}

function getBgColorHex(preset) {
  switch (preset) {
    case 'white': return '#ffffff';
    case 'blue':  return '#1d4ed8';
    case 'red':   return '#dc2626';
    case 'gray':  return '#e2e8f0';
    default:      return '#ffffff';
  }
}

/**
 * Draw a single photo cell with framing, Name Tag, and crop marks
 */
function drawCellOnCanvas({
  ctx,
  procCanvas,
  x,
  y,
  w,
  h,
  photo,
  fitMode,
  guideType,
}) {
  const adj = photo.adjustments || {};
  const panX = adj.panX ?? 0;
  const panY = adj.panY ?? 0;
  const zoom = adj.zoom ?? 1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Background
  if (adj.bgPreset && adj.bgPreset !== 'none') {
    ctx.fillStyle = getBgColorHex(adj.bgPreset);
    ctx.fillRect(x, y, w, h);
  }

  const imgW = procCanvas.width;
  const imgH = procCanvas.height;
  const imgAspect = imgW / imgH;
  const cellAspect = w / h;

  let drawW, drawH, drawX, drawY;

  if (fitMode === 'contain') {
    if (imgAspect > cellAspect) {
      drawW = w * zoom;
      drawH = (w / imgAspect) * zoom;
    } else {
      drawH = h * zoom;
      drawW = (h * imgAspect) * zoom;
    }
  } else {
    // cover
    if (imgAspect > cellAspect) {
      drawH = h * zoom;
      drawW = (h * imgAspect) * zoom;
    } else {
      drawW = w * zoom;
      drawH = (w / imgAspect) * zoom;
    }
  }

  drawX = x + (w - drawW) / 2 + (panX / 100) * w;
  drawY = y + (h - drawH) / 2 + (panY / 100) * h;

  ctx.drawImage(procCanvas, drawX, drawY, drawW, drawH);

  // Draw ID Name Tag Banner
  const nameTag = adj.nameTag;
  if (nameTag && nameTag.enabled && nameTag.text) {
    const bannerH = Math.round(h * 0.16); // 16% height
    const bannerY = y + h - bannerH;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, bannerY, w, bannerH);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, bannerY);
    ctx.lineTo(x + w, bannerY);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = Math.max(12, Math.round(bannerH * 0.44));
    ctx.font = `bold ${fontSize}px sans-serif`;
    const textY = nameTag.sub ? bannerY + bannerH * 0.38 : bannerY + bannerH * 0.5;
    ctx.fillText(nameTag.text, x + w / 2, textY);

    if (nameTag.sub) {
      const subFontSize = Math.max(9, Math.round(bannerH * 0.28));
      ctx.font = `${subFontSize}px sans-serif`;
      ctx.fillStyle = '#333333';
      ctx.fillText(nameTag.sub, x + w / 2, bannerY + bannerH * 0.78);
    }
  }

  ctx.restore();

  // Cutting guides
  if (guideType === 'border') {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  } else if (guideType === 'corners') {
    const markLen = 14;
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;

    // Top-left
    ctx.beginPath(); ctx.moveTo(x, y + markLen); ctx.lineTo(x, y); ctx.lineTo(x + markLen, y); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(x + w - markLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + markLen); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(x, y + h - markLen); ctx.lineTo(x, y + h); ctx.lineTo(x + markLen, y + h); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(x + w - markLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - markLen); ctx.stroke();
    ctx.restore();
  }
}

/**
 * Export current sheet as 300 DPI PNG
 */
export async function exportHighResPNG(params) {
  if (!params.photos || params.photos.length === 0) {
    toast('Please load a photo first before exporting', 'error');
    return;
  }

  toast('Rendering 300 DPI high-resolution sheet...', 'info', 2000);

  try {
    const canvas = await renderSheetToCanvas(params);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `AutoFit_${params.sizeObj.name.replace(/[^a-zA-Z0-9]/g, '_')}_${params.sheetObj.name}_300DPI.png`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast(`Downloaded: ${filename}`, 'success', 3500);
  } catch (err) {
    console.error('Export PNG error:', err);
    toast('Export failed: ' + err.message, 'error');
  }
}

/**
 * Export current sheet as 300 DPI Print-Ready PDF
 */
export async function exportHighResPDF(params) {
  if (!params.photos || params.photos.length === 0) {
    toast('Please load a photo first before exporting', 'error');
    return;
  }

  toast('Generating 300 DPI print-ready PDF...', 'info', 2500);

  try {
    const canvas = await renderSheetToCanvas(params);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const doc = new jsPDF({
      orientation: params.sheetObj.w > params.sheetObj.h ? 'landscape' : 'portrait',
      unit: 'in',
      format: [params.sheetObj.w, params.sheetObj.h],
    });

    doc.addImage(imgData, 'JPEG', 0, 0, params.sheetObj.w, params.sheetObj.h);
    const filename = `AutoFit_${params.sizeObj.name.replace(/[^a-zA-Z0-9]/g, '_')}_${params.sheetObj.name}_PrintReady.pdf`;
    doc.save(filename);

    toast(`Saved PDF: ${filename}`, 'success', 3500);
  } catch (err) {
    console.error('Export PDF error:', err);
    toast('PDF export failed: ' + err.message, 'error');
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
