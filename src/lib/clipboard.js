/**
 * clipboard.js — image extraction and metadata helpers
 */

/**
 * Extract an image File from a ClipboardEvent (Ctrl+V)
 */
export function extractImageFromClipboard(e) {
  const items = Array.from(e.clipboardData?.items ?? []);
  const imgItem = items.find(item => item.type.startsWith('image/'));
  return imgItem ? imgItem.getAsFile() : null;
}

/**
 * Read a File/Blob as a base64 data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Return a safe display name from a File object
 */
export function safeFileName(file) {
  if (file.name && file.name !== 'image.png' && file.name !== 'blob') {
    return file.name;
  }
  const ext = file.type?.split('/')[1] ?? 'png';
  return `clipboard-${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.${ext}`;
}

/**
 * Extract natural pixel dimensions and resolution of an image data URL
 * @param {string} dataUrl
 * @returns {Promise<{ width: number, height: number, megapixels: string, orientation: string }>}
 */
export function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const mp = ((img.naturalWidth * img.naturalHeight) / 1000000).toFixed(1);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        megapixels: `${mp} MP`,
        orientation: img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait',
      });
    };
    img.onerror = () => resolve({ width: 0, height: 0, megapixels: 'Unknown', orientation: 'portrait' });
    img.src = dataUrl;
  });
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
