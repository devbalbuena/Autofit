/**
 * DropZone component
 * Handles: drag-over visual feedback, drop event, click-to-browse
 * File input is kept OUTSIDE the drop zone div to avoid z-index click interception.
 */
import { toast } from '../lib/toast.js';

export function DropZoneHTML() {
  return `
    <div class="drop-zone fade-in" id="drop-zone">
      <div class="drop-zone-icon">📸</div>
      <div class="drop-zone-title">Drop your photo here</div>
      <div class="drop-zone-sub">
        Press <kbd>Ctrl+V</kbd> to paste from clipboard<br/>
        or drag a photo from anywhere
      </div>
      <div class="drop-zone-divider">or</div>
      <label class="btn primary" for="file-input">Browse Files</label>
    </div>
    <input type="file" id="file-input" accept="image/*"
           style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none" />
  `;
}

/**
 * Wire drag-over / drag-leave / drop events onto the drop zone element.
 * Uses a counter to handle nested child elements triggering dragleave incorrectly.
 * @param {HTMLElement} el - the .drop-zone div
 * @param {Function} onFile - called with a File object when dropped
 */
export function initDropZone(el, onFile) {
  let dragCounter = 0;

  el.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    el.classList.add('drag-over');
  });

  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  el.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      el.classList.remove('drag-over');
    }
  });

  el.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    el.classList.remove('drag-over');
    const file = getImageFromDataTransfer(e.dataTransfer);
    if (file) {
      onFile(file);
    } else {
      toast('No image found — try a JPG or PNG file', 'error');
    }
  });
}

/**
 * Allow dropping anywhere on the window (useful when sheet preview is shown)
 */
export function initWindowDrop(onFile) {
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = getImageFromDataTransfer(e.dataTransfer);
    if (file) onFile(file);
  });
}

function getImageFromDataTransfer(dt) {
  if (!dt) return null;
  const files = Array.from(dt.files ?? []);
  const imgFile = files.find(f => f.type.startsWith('image/'));
  if (imgFile) return imgFile;
  const items = Array.from(dt.items ?? []);
  for (const item of items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }
  return null;
}
