/**
 * clipboard.js — image extraction helpers
 * Used by: paste event, drop event, file input
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
 * Return a safe display name from a File object.
 * If the file has no name (e.g. pasted from clipboard), generate one.
 */
export function safeFileName(file) {
  if (file.name && file.name !== 'image.png' && file.name !== 'blob') {
    return file.name;
  }
  const ext = file.type.split('/')[1] ?? 'png';
  return `clipboard-${Date.now()}.${ext}`;
}
