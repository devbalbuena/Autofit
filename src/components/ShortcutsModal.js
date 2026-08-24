/**
 * ShortcutsModal component
 * Displays accessible keyboard shortcuts and print tips.
 */

export function ShortcutsModalHTML() {
  return `
    <div class="modal-backdrop" id="shortcuts-modal" aria-hidden="true" style="display:none">
      <div class="modal-card fade-in" role="dialog" aria-labelledby="modal-title">
        <div class="modal-header">
          <div class="modal-title" id="modal-title">⌨️ Keyboard Shortcuts & Tips</div>
          <button class="modal-close" id="btn-close-modal" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <table class="shortcuts-table">
            <tbody>
              <tr>
                <td><kbd>Ctrl</kbd> + <kbd>V</kbd></td>
                <td>Paste photo directly from clipboard (WhatsApp, browser, FB)</td>
              </tr>
              <tr>
                <td><kbd>Ctrl</kbd> + <kbd>P</kbd></td>
                <td>Print sheet with exact physical inch dimensions</td>
              </tr>
              <tr>
                <td><kbd>Ctrl</kbd> + <kbd>O</kbd></td>
                <td>Browse and open an image file</td>
              </tr>
              <tr>
                <td><kbd>+</kbd> / <kbd>−</kbd></td>
                <td>Increase or decrease photo copy count</td>
              </tr>
              <tr>
                <td><kbd>Esc</kbd></td>
                <td>Clear current photo or close this dialog</td>
              </tr>
              <tr>
                <td><kbd>?</kbd></td>
                <td>Toggle this shortcuts guide</td>
              </tr>
            </tbody>
          </table>

          <div class="modal-tip-box">
            <b>💡 Print Shop Pro Tip:</b> In the browser print dialog, ensure <b>Margins</b> is set to <i>None</i> or <i>Default</i> and <b>Scale</b> is set to <i>100%</i> for millimeter-accurate photo sizing.
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
