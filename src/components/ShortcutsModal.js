/**
 * ShortcutsModal component
 * Displays accessible keyboard shortcuts and print shop calibration tips.
 */

export function ShortcutsModalHTML() {
  return `
    <div class="modal-backdrop" id="shortcuts-modal" aria-hidden="true" style="display:none">
      <div class="modal-card fade-in" role="dialog" aria-labelledby="modal-title">
        <div class="modal-header">
          <div class="modal-title" id="modal-title">⌨️ Shortcuts & Print Calibration</div>
          <button class="modal-close" id="btn-close-modal" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <table class="shortcuts-table">
            <tbody>
              <tr>
                <td><kbd>Ctrl</kbd> + <kbd>V</kbd></td>
                <td>Paste photo from clipboard (WhatsApp, Facebook, browser)</td>
              </tr>
              <tr>
                <td><kbd>Ctrl</kbd> + <kbd>P</kbd></td>
                <td>Print sheet with exact physical inch / mm dimensions</td>
              </tr>
              <tr>
                <td><kbd>Ctrl</kbd> + <kbd>O</kbd></td>
                <td>Browse and open photo files (supports multi-select)</td>
              </tr>
              <tr>
                <td><kbd>+</kbd> / <kbd>−</kbd></td>
                <td>Increase or decrease photo copy count</td>
              </tr>
              <tr>
                <td><kbd>Esc</kbd></td>
                <td>Clear current photo or close dialog</td>
              </tr>
              <tr>
                <td><kbd>?</kbd></td>
                <td>Toggle this Shortcuts & Calibration Guide</td>
              </tr>
            </tbody>
          </table>

          <div class="modal-tip-box">
            <div style="font-weight:700;margin-bottom:4px;color:var(--ink)">🎯 Exact Millimeter Print Accuracy Checklist:</div>
            <ul style="padding-left:18px;margin:0;line-height:1.6;font-size:11.5px">
              <li><b>Margins:</b> Set to <code>None</code> (prevent unwanted page shifts).</li>
              <li><b>Scale:</b> Set to <code>100%</code> / <code>Default</code> (never choose "Fit to printable area").</li>
              <li><b>Paper Size:</b> Ensure printer matches your sheet (A4, Letter, etc.).</li>
              <li><b>Headers & Footers:</b> Uncheck (removes URL/date stamps).</li>
              <li><b>Background Graphics:</b> Check (ensures color tints & borders print).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initShortcutsModal(containerEl) {
  const modalEl = containerEl.querySelector('#shortcuts-modal');
  const closeBtn = containerEl.querySelector('#btn-close-modal');

  function open() {
    if (!modalEl) return;
    modalEl.style.display = 'flex';
    modalEl.setAttribute('aria-hidden', 'false');
  }

  function close() {
    if (!modalEl) return;
    modalEl.style.display = 'none';
    modalEl.setAttribute('aria-hidden', 'true');
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) close();
    });
  }

  return { open, close, toggle: () => modalEl.style.display === 'none' ? open() : close() };
}
