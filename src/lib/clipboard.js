/**
 * Extract an image File/Blob from a ClipboardEvent or DataTransfer
 */
export function extractImageFromClipboard(e) {
  const items = e.clipboardData?.items ?? [];
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }
  return null;
}

export function extractImageFromDrop(e) {
  const files = e.dataTransfer?.files ?? [];
  for (const file of files) {
    if (file.type.startsWith('image/')) return file;
  }
  return null;
}

/**
 * Read a File or Blob as a data URL (base64)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Try the modern Clipboard API (needs focus + permission)
 */
export async function readImageFromClipboardAPI() {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imgType = item.types.find(t => t.startsWith('image/'));
      if (imgType) {
        const blob = await item.getType(imgType);
        return blob;
      }
    }
  } catch { /* fallback handled by paste event */ }
  return null;
}
