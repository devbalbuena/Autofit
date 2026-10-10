/**
 * ComplianceModal.js — Interactive ID & Visa Requirements Compliance Guide
 * Allows print shop operators to browse official photo rules and apply compliant
 * dimensions, background tints, oval biometric framing, and nametags with 1 click.
 */
import { COMPLIANCE_STANDARDS } from '../lib/compliance.js';

export function ComplianceModalHTML() {
  return `
    <div class="modal-backdrop" id="compliance-modal" aria-hidden="true" style="display:none">
      <div class="modal-card fade-in" role="dialog" aria-labelledby="compliance-modal-title" style="max-width:760px; max-height:85vh; display:flex; flex-direction:column;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">📋</span>
            <div>
              <div class="modal-title" id="compliance-modal-title" style="margin-bottom:2px;">Official ID, Passport & Visa Compliance Guide</div>
              <div style="font-size:11.5px; color:var(--text-muted, #94a3b8);">Government, embassy, and biometric specifications checklist with 1-click preset applicator</div>
            </div>
          </div>
          <button class="modal-close" id="btn-close-compliance" aria-label="Close modal">&times;</button>
        </div>

        <!-- Filter bar -->
        <div style="padding:10px 18px; border-bottom:1px solid var(--border-color); display:flex; gap:8px; align-items:center; background:var(--bg-canvas, #090d16); flex-wrap:wrap;">
          <input type="text" id="compliance-search-input" placeholder="🔍 Search country, visa, or exam..." style="flex:1; min-width:180px; padding:6px 10px; font-size:12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; color:var(--text-main);" />
          <div class="compliance-filter-chips" style="display:flex; gap:4px;">
            <button class="preset-chip active" data-comp-cat="all">All</button>
            <button class="preset-chip" data-comp-cat="visa">Visas</button>
            <button class="preset-chip" data-comp-cat="passport">Passports</button>
            <button class="preset-chip" data-comp-cat="gov">Gov / Board Exams</button>
          </div>
        </div>

        <div class="modal-body" id="compliance-cards-container" style="overflow-y:auto; padding:16px 18px; display:flex; flex-direction:column; gap:12px;">
          ${renderComplianceCards(COMPLIANCE_STANDARDS)}
        </div>
      </div>
    </div>
  `;
}

function renderComplianceCards(standards) {
  if (!standards || standards.length === 0) {
    return `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">No compliance standards matched your search.</div>`;
  }

  return standards.map(std => `
    <div class="compliance-card" data-cat="${std.category}" style="background:var(--bg-card, #131b2e); border:1px solid var(--border-color, #1e293b); border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:22px;">${std.flag}</span>
          <div>
            <div style="font-weight:700; font-size:14px; color:var(--text-main, #ffffff);">${std.name}</div>
            <div style="font-size:11px; color:var(--text-muted, #94a3b8);">${std.country} • <span style="font-weight:600; color:var(--accent, #38bdf8);">${std.dimensionsLabel}</span></div>
          </div>
        </div>
        <button class="btn primary btn-apply-compliance" data-comp-id="${std.id}" style="padding:5px 12px; font-size:11.5px; white-space:nowrap; display:flex; align-items:center; gap:4px;">
          ⚡ Apply Specs
        </button>
      </div>

      <!-- Quick requirement tags -->
      <div style="display:flex; gap:6px; flex-wrap:wrap; font-size:11px;">
        <span style="padding:2px 8px; border-radius:12px; background:rgba(56,189,248,0.12); color:#38bdf8; border:1px solid rgba(56,189,248,0.25);">
          📏 Size: ${std.dimensionsLabel}
        </span>
        <span style="padding:2px 8px; border-radius:12px; background:${getBgBadgeStyle(std.bgPreset)}">
          🎨 Background: ${capitalize(std.bgPreset)}
        </span>
        <span style="padding:2px 8px; border-radius:12px; background:${std.showOval ? 'rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);' : 'rgba(148,163,184,0.12); color:#94a3b8;'}">
          ${std.showOval ? '⭕ Biometric Oval Req.' : '⚪ Free Head Framing'}
        </span>
        <span style="padding:2px 8px; border-radius:12px; background:${std.nameTagRequired ? 'rgba(234,179,8,0.15); color:#eab308; border:1px solid rgba(234,179,8,0.3);' : (std.nameTagAllowed ? 'rgba(148,163,184,0.15); color:#94a3b8;' : 'rgba(239,68,68,0.12); color:#ef4444;')}">
          ${std.nameTagRequired ? '🏷️ Mandatory Name Tag' : (std.nameTagAllowed ? '🏷️ Optional Name Tag' : '🚫 Name Tag Forbidden')}
        </span>
      </div>

      <!-- Rules list -->
      <ul style="margin:0; padding-left:18px; font-size:11.5px; color:var(--text-muted, #94a3b8); line-height:1.5;">
        ${std.rules.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function getBgBadgeStyle(preset) {
  switch (preset) {
    case 'white': return 'rgba(255,255,255,0.15); color:#f8fafc; border:1px solid rgba(255,255,255,0.3);';
    case 'blue':  return 'rgba(59,130,246,0.18); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);';
    case 'gray':  return 'rgba(148,163,184,0.18); color:#cbd5e1; border:1px solid rgba(148,163,184,0.3);';
    case 'red':   return 'rgba(239,68,68,0.18); color:#f87171; border:1px solid rgba(239,68,68,0.3);';
    default:      return 'rgba(148,163,184,0.12); color:#94a3b8;';
  }
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export function initComplianceModal(containerEl, onApply) {
  const modalEl = containerEl.querySelector('#compliance-modal') || document.getElementById('compliance-modal');
  const closeBtn = modalEl?.querySelector('#btn-close-compliance');
  const searchInput = modalEl?.querySelector('#compliance-search-input');
  const filterChips = modalEl?.querySelectorAll('[data-comp-cat]');
  const cardsContainer = modalEl?.querySelector('#compliance-cards-container');

  if (!modalEl) return { open: () => {}, close: () => {} };

  function open() {
    modalEl.style.display = 'flex';
    modalEl.setAttribute('aria-hidden', 'false');
    if (searchInput) {
      searchInput.value = '';
      filterList();
      searchInput.focus();
    }
  }

  function close() {
    modalEl.style.display = 'none';
    modalEl.setAttribute('aria-hidden', 'true');
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) close();
  });

  let activeCat = 'all';

  function filterList() {
    if (!cardsContainer) return;
    const query = (searchInput?.value || '').toLowerCase().trim();

    const filtered = COMPLIANCE_STANDARDS.filter(std => {
      const matchCat = activeCat === 'all' || std.category === activeCat;
      const matchQuery = !query ||
        std.name.toLowerCase().includes(query) ||
        std.country.toLowerCase().includes(query) ||
        std.dimensionsLabel.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    cardsContainer.innerHTML = renderComplianceCards(filtered);
    wireApplyButtons();
  }

  if (searchInput) searchInput.addEventListener('input', filterList);

  if (filterChips) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCat = chip.dataset.compCat;
        filterList();
      });
    });
  }

  function wireApplyButtons() {
    if (!cardsContainer) return;
    cardsContainer.querySelectorAll('.btn-apply-compliance').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.compId;
        const std = COMPLIANCE_STANDARDS.find(s => s.id === id);
        if (std && onApply) {
          onApply(std);
          close();
        }
      });
    });
  }

  wireApplyButtons();

  return { open, close };
}
