/**
 * ClaimSlipModal.js — Customer Job Claim Stub & Order Ticket Generator
 * Generates an official, thermal-printable or bond-printable claim slip
 * with customer details, ID packages ordered, total pricing, and claim code.
 */

export function ClaimSlipModalHTML() {
  return `
    <div class="modal-backdrop" id="claim-slip-modal" aria-hidden="true" style="display:none">
      <div class="modal-card fade-in" role="dialog" aria-labelledby="claim-modal-title" style="max-width:440px; display:flex; flex-direction:column;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">🧾</span>
            <div>
              <div class="modal-title" id="claim-modal-title" style="margin-bottom:2px;">Job Claim Stub & Order Slip</div>
              <div style="font-size:11.5px; color:var(--text-muted);">Customer receipt & claim ticket for photo print orders</div>
            </div>
          </div>
          <button class="modal-close" id="btn-close-claim-slip" aria-label="Close modal">&times;</button>
        </div>

        <div class="modal-body" style="padding:14px 18px; display:flex; flex-direction:column; gap:12px;">
          <!-- Claim Slip Preview Card (Thermal Receipt Style) -->
          <div id="claim-slip-ticket" style="background:#ffffff; color:#0f172a; padding:16px; border-radius:8px; font-family:'IBM Plex Mono', monospace, sans-serif; font-size:11.5px; border:1px dashed #cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
            <div style="text-align:center; border-bottom:1px dashed #94a3b8; padding-bottom:8px; margin-bottom:10px;">
              <div id="slip-shop-name" style="font-weight:800; font-size:14px; letter-spacing:0.5px;">AUTOFIT PRINT STUDIO</div>
              <div style="font-size:10px; color:#64748b;">PHOTO PRINT & ID EXPRESS SERVICES</div>
              <div id="slip-timestamp" style="font-size:9.5px; color:#64748b; margin-top:3px;">--</div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:11px;">
              <span style="color:#64748b;">Order #:</span>
              <span id="slip-order-num" style="font-weight:700;">AF-1001</span>
            </div>

            <div id="slip-items-list" style="border-top:1px dashed #cbd5e1; border-bottom:1px dashed #cbd5e1; padding:8px 0; margin:8px 0; display:flex; flex-direction:column; gap:5px;">
              <!-- Dynamic line items -->
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:800; font-size:13px; margin-top:6px;">
              <span>TOTAL DUE:</span>
              <span id="slip-total-amount" style="color:#0f172a;">₱0.00</span>
            </div>

            <div style="text-align:center; margin-top:14px; border-top:1px dashed #94a3b8; padding-top:10px;">
              <div style="font-family:monospace; font-size:18px; letter-spacing:4px; font-weight:900;">||| | ||||| | ||| |||</div>
              <div style="font-size:9px; color:#64748b; margin-top:4px;">Please present this ticket upon claiming photos</div>
              <div style="font-size:9px; color:#64748b;">Thank you for your business!</div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex; gap:8px; margin-top:4px;">
            <button class="btn secondary" id="btn-print-slip" style="flex:1; padding:8px; font-size:12px; display:flex; align-items:center; justify-content:center; gap:6px;">
              <span>🖨️</span> Print Claim Slip
            </button>
            <button class="btn ghost" id="btn-copy-slip" style="padding:8px 12px; font-size:12px;">
              📋 Copy Details
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initClaimSlipModal(containerEl, getOrderData) {
  const modalEl   = containerEl.querySelector('#claim-slip-modal') || document.getElementById('claim-slip-modal');
  const closeBtn  = modalEl?.querySelector('#btn-close-claim-slip');
  const printBtn  = modalEl?.querySelector('#btn-print-slip');
  const copyBtn   = modalEl?.querySelector('#btn-copy-slip');

  const slipTime  = modalEl?.querySelector('#slip-timestamp');
  const slipOrder = modalEl?.querySelector('#slip-order-num');
  const slipItems = modalEl?.querySelector('#slip-items-list');
  const slipTotal = modalEl?.querySelector('#slip-total-amount');

  if (!modalEl) return { open: () => {}, close: () => {} };

  function open() {
    const data = getOrderData();
    populateTicket(data);
    modalEl.style.display = 'flex';
    modalEl.setAttribute('aria-hidden', 'false');
  }

  function close() {
    modalEl.style.display = 'none';
    modalEl.setAttribute('aria-hidden', 'true');
  }

  function populateTicket(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (slipTime) slipTime.textContent = `${dateStr} • ${timeStr}`;

    const orderId = `AF-${Math.floor(1000 + Math.random() * 9000)}`;
    if (slipOrder) slipOrder.textContent = orderId;

    const currency = data.currency || '₱';
    const pricePerId = data.pricePerId || 30;

    if (slipItems) {
      if (!data.photos || data.photos.length === 0) {
        slipItems.innerHTML = `<div style="color:#64748b;font-style:italic">No photos loaded</div>`;
      } else {
        slipItems.innerHTML = data.photos.map((p, idx) => {
          const qty = p.quantity || 1;
          const name = p.name || `Customer #${idx + 1}`;
          const sizeLabel = p.sizeLabel || p.sizeId || 'ID Photo';
          const lineTotal = qty * pricePerId;
          return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700;">${name}</div>
                <div style="font-size:10px; color:#64748b;">${sizeLabel} × ${qty} pcs</div>
              </div>
              <div style="font-weight:700;">${currency}${lineTotal.toFixed(2)}</div>
            </div>
          `;
        }).join('');
      }
    }

    const totalQty = (data.photos || []).reduce((acc, p) => acc + (p.quantity || 1), 0);
    const totalAmount = totalQty * pricePerId;
    if (slipTotal) slipTotal.textContent = `${currency}${totalAmount.toFixed(2)}`;
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) close();
  });

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const ticketEl = modalEl.querySelector('#claim-slip-ticket');
      if (!ticketEl) return;
      const printWindow = window.open('', '_blank', 'width=350,height=500');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Customer Claim Slip</title>
              <style>
                body { margin: 0; padding: 10px; font-family: monospace; font-size: 11px; background: #fff; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>
              ${ticketEl.outerHTML}
              <script>
                window.onload = function() { window.print(); window.close(); };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const order = slipOrder?.textContent || '';
      const total = slipTotal?.textContent || '';
      const summary = `AutoFit Order #${order} | Total: ${total} | Generated: ${new Date().toLocaleDateString()}`;
      navigator.clipboard.writeText(summary).then(() => {
        alert('Order details copied to clipboard!');
      });
    });
  }

  return { open, close };
}
