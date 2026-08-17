/**
 * HistoryPanel component
 * Displays list of recently used photos with thumbnail previews, metadata, and removal controls.
 */
import { loadHistory, removeFromHistory, clearHistory } from '../lib/history.js';
import { toast } from '../lib/toast.js';

export function HistoryPanelHTML() {
  return `
    <div class="history-panel-container">
      <div class="history-header">
        <div class="panel-label" style="margin-bottom:0">Recent Photos</div>
        <button class="btn-history-clear" id="btn-history-clear" title="Clear all history">Clear All</button>
      </div>
      <div class="history-list" id="history-list"></div>
    </div>
  `;
}

/**
 * Initialize and render the history panel
 * @param {HTMLElement} containerEl
 * @param {Function} onSelectPhoto - Callback when a history item is clicked
 */
export function initHistoryPanel(containerEl, onSelectPhoto) {
  const listEl = containerEl.querySelector('#history-list');
  const clearBtn = containerEl.querySelector('#btn-history-clear');

  function render() {
    const items = loadHistory();

    if (clearBtn) {
      clearBtn.style.display = items.length > 0 ? 'inline-block' : 'none';
    }

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="history-empty">
          <div class="history-empty-icon">🕒</div>
          <div>No recent photos</div>
          <div style="font-size:10.5px;color:var(--ink-dim)">Paste or drop a photo to get started</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="history-item fade-in" data-id="${item.id}" title="Click to reload ${item.name}">
        <img class="history-thumb" src="${item.thumbUrl || item.dataUrl}" alt="${item.name}" />
        <div class="history-info">
          <div class="history-name">${item.name}</div>
          <div class="history-meta">
            ${item.dimensions ? `<span>${item.dimensions.width}×${item.dimensions.height}</span>` : ''}
            <span class="history-date">${item.savedAt || ''}</span>
          </div>
        </div>
        <button class="btn-history-delete" data-delete-id="${item.id}" title="Remove from history" aria-label="Delete">
          &times;
        </button>
      </div>
    `).join('');

    // Wire click on item to load
    listEl.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.btn-history-delete')) return;
        const item = items.find(i => i.id === el.dataset.id);
        if (item) onSelectPhoto(item);
      });
    });

    // Wire individual delete buttons
    listEl.querySelectorAll('.btn-history-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.deleteId;
        removeFromHistory(id);
        render();
        toast('Photo removed from history', 'info', 2000);
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all recent photo history?')) {
        clearHistory();
        render();
        toast('History cleared', 'info', 2000);
      }
    });
  }

  render();

  return {
    refresh: render,
  };
}
