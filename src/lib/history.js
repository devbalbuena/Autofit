/**
 * history.js — offline photo history storage with automated thumbnailing and quota protection
 */

const STORAGE_KEY = 'autofit_history_v2';
const MAX_HISTORY_ITEMS = 12;
const THUMBNAIL_MAX_SIZE = 120; // 120px max dimension for storage thumbnail

/**
 * Generate a lightweight compressed thumbnail data URL to preserve localStorage quota
 * @param {string} dataUrl - Source image data URL
 * @param {number} maxSize - Max width/height in px
 * @returns {Promise<string>} Compressed JPEG data URL
 */
export function generateThumbnail(dataUrl, maxSize = THUMBNAIL_MAX_SIZE) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;

      if (w > h) {
        if (w > maxSize) {
          h = Math.round((h * maxSize) / w);
          w = maxSize;
        }
      } else {
        if (h > maxSize) {
          w = Math.round((w * maxSize) / h);
          h = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, w);
      canvas.height = Math.max(1, h);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Load all history items from localStorage
 * @returns {Array<Object>} List of history entries
 */
export function loadHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Migrate v1 data if exists
      const old = localStorage.getItem('autofit_history');
      if (old) {
        const parsed = JSON.parse(old);
        localStorage.removeItem('autofit_history');
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn('Could not read history:', err);
    return [];
  }
}

/**
 * Save an item to history with quota protection
 * @param {Object} entry - { id, name, dataUrl, thumbUrl, sizeId, sheetId, savedAt, dimensions }
 * @returns {Array<Object>} Updated history list
 */
export function saveToHistory(entry) {
  let list = loadHistory().filter(item => item.id !== entry.id && item.name !== entry.name);
  list.unshift(entry);

  if (list.length > MAX_HISTORY_ITEMS) {
    list = list.slice(0, MAX_HISTORY_ITEMS);
  }

  // Save with fallback for quota exceeded
  while (list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      break;
    } catch (e) {
      // Storage quota exceeded — remove oldest item and retry
      list.pop();
    }
  }

  return list;
}

/**
 * Remove a specific item from history by ID
 * @param {string} id
 * @returns {Array<Object>} Updated history list
 */
export function removeFromHistory(id) {
  const list = loadHistory().filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not update history after removal:', e);
  }
  return list;
}

/**
 * Clear all history entries
 * @returns {Array} Empty array
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('autofit_history');
  } catch (e) {
    console.warn('Could not clear history:', e);
  }
  return [];
}
