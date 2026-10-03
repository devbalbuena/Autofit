/**
 * DropZone component
 * Handles: drag-over visual feedback, multi-file drop event, click-to-browse
 */
import { toast } from '../lib/toast.js';

export function DropZoneHTML() {
  return `
    <div class="drop-zone fade-in" id="drop-zone">
      <div class="drop-zone-icon">📸</div>
      <div class="drop-zone-title">Drop your photos here</div>
      <div class="drop-zone-sub">
        Press <kbd>Ctrl+V</kbd> to paste from clipboard<br/>
        or drop single / multiple photos to tile
      </div>
      <div class="drop-zone-divider">or</div>
      <label class="btn primary" for="file-input">Browse Photos</label>
    </div>
    <input type="file" id="file-input" accept="image/*" multiple
           style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none" />
  `;
}

/**
 * Wire drag-over / drag-leave / drop events onto the drop zone element.
 */
export function initDropZone(el, onFiles) {
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
    const files = getImagesFromDataTransfer(e.dataTransfer);
    if (files.length > 0) {
      onFiles(files);
    } else {
      toast('No valid image found — try JPG, PNG, or WEBP', 'error');
    }
  });
}

/**
 * Allow dropping anywhere on the window (even when sheet preview is active)
 */
export function initWindowDrop(onFiles) {
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = getImagesFromDataTransfer(e.dataTransfer);
    if (files.length > 0) onFiles(files);
  });
}

function getImagesFromDataTransfer(dt) {
  if (!dt) return [];
  const files = [];

  if (dt.files && dt.files.length > 0) {
    for (const f of dt.files) {
      if (f.type && f.type.startsWith('image/')) {
        files.push(f);
      }
    }
  }

  if (files.length === 0 && dt.items) {
    for (const item of dt.items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
  }

  return files;
}
