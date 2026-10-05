function escapeHTML(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}

function imageFallbackAttribute(place) {
  return place.fallbackImage ? `onerror="this.onerror=null;this.src='${place.fallbackImage}'"` : '';
}


// Toggle Save
async function toggleSave(placeId) {
  if (!requireAuth('save this destination')) return;

  const alreadySaved = savedPlaces.includes(placeId);

  try {
    if (alreadySaved) {
      const removed = await removePlaceFromFirestore(placeId);

      if (removed !== false) {
        showToast('Destination removed from My Trip.', 'info');
      }
    } else {
      const saved = await savePlaceToFirestore(placeId);

      if (saved !== false) {
        showToast('Destination saved to My Trip.', 'success');
      }
    }
  } catch (error) {
    showToast(
      getFriendlyErrorMessage(
        error,
        'Unable to update this destination right now.'
      ),
      'error'
    );
  }

  updateSavedCount();
  renderWonders();
  renderExploreGrid();
  renderLocalGrid();
  renderSavedList();
  updateActivePinCard();
  renderCalendar();
}

function updateSavedCount() {
  const counter = document.getElementById('saved-count');
  if (counter) counter.textContent = savedPlaces.length;
}

function showToast(message, tone = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  window.setTimeout(() => {
    toast.classList.remove('show');
    window.setTimeout(() => toast.remove(), 260);
  }, 2600);
}


// Modals
function openPlaceModal(placeId) {
  const p = PLACES.find(item => item.id === placeId);
  if (!p) return;

  const modal = document.getElementById('place-modal');
  const body = document.getElementById('place-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <img src="${p.image}" ${imageFallbackAttribute(p)} alt="${p.name}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
    <div style="padding: 1.5rem;">
      <span style="font-size: 0.7rem; font-weight: 700; color: #B84B39; text-transform: uppercase;">${p.subCategory || p.category}</span>
      <h2 id="place-modal-title" style="font-family: var(--font-serif); font-size: 1.5rem; margin: 4px 0 10px;">${p.name}</h2>
      <p style="font-size: 0.85rem; color: #57534E; line-height: 1.6; margin-bottom: 1rem;">${p.longDesc}</p>
      <div class="advice-badge" style="margin-bottom: 1rem;">
        <strong>Best Season:</strong> ${p.season}
      </div>
      <div style="font-size: 0.8rem; margin-bottom: 1.5rem;">
        <strong>Advices Before Visiting:</strong>
        <ul style="margin-top: 6px; padding-left: 20px; color: #78716C;">
          ${p.advice.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>
      <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="toggleSave('${p.id}'); closeModal('place-modal');">
        ${savedPlaces.includes(p.id) ? 'Saved in Trip' : 'Save to My Trip'}
      </button>
    </div>
  `;

  lastFocusedElement = document.activeElement;
  modal.classList.add('open');
  modal.querySelector('.modal-close')?.focus();
}

function openBookingModal(expId) {
  const exp = LOCAL_EXPERIENCES.find(e => e.id === expId);
  if (!exp) return;
  const modal = document.getElementById('booking-modal');
  const experienceInput = document.getElementById('booking-experience-id');
  if (!modal) return;
  if (experienceInput) experienceInput.value = exp.id;
  const summary = document.getElementById('booking-experience-summary');
  if (summary) summary.innerHTML = `<strong>${exp.title}</strong><span>${exp.host} · ${exp.duration}</span><span>$${exp.price} per guest</span>`;
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = localDate;
    dateInput.value = localDate;
  }
  const guestsInput = document.getElementById('booking-guests');
  if (guestsInput) guestsInput.value = '2';
  updateBookingEstimate();
  lastFocusedElement = document.activeElement;
  modal.classList.add('open');
  modal.querySelector('.modal-close')?.focus();
}

function updateBookingEstimate() {
  const experience = LOCAL_EXPERIENCES.find(item => item.id === document.getElementById('booking-experience-id')?.value);
  const guests = Math.max(1, Number(document.getElementById('booking-guests')?.value || 1));
  const estimate = document.getElementById('booking-price-estimate');
  if (experience && estimate) estimate.textContent = `Estimated request total: $${experience.price * guests} for ${guests} guest${guests === 1 ? '' : 's'}.`;
}

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    lastFocusedElement = document.activeElement;
    modal.classList.add('open');
    modal.querySelector('.modal-close')?.focus();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
  lastFocusedElement?.focus();
}

function setLanguage(language, persist = true) {
  if (!SUPPORTED_LANGUAGES.some(([code]) => code === language)) return;
  currentLanguage = language;
  const rtl = language === 'ar';
  const accessibility = JSON.parse(localStorage.getItem('darbak-accessibility') || '{}');
  document.documentElement.dir = accessibility.direction === false ? 'ltr' : rtl ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  const label = document.getElementById('lang-label');
  if (label) label.textContent = SUPPORTED_LANGUAGES.find(([code]) => code === language)?.[1] || 'English';
  if (persist) localStorage.setItem('darbak-language', language);
  closeLanguageMenu();
  renderWonders();
  renderExploreGrid();
  renderLocalGrid();
  renderMapPins();
}

function applySavedLanguage() {
  const language = localStorage.getItem('darbak-language') || 'en';
  setLanguage(language, false);
}

function requestPageTranslation() {
  return;
}

function loadTranslationWidget() {
  return;
}

function openLanguageMenu() {
  const menu = document.getElementById('language-menu');
  const button = document.getElementById('btn-lang');
  if (!menu || !button) return;
  menu.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  menu.querySelector(`[data-language="${currentLanguage}"]`)?.focus();
}

function closeLanguageMenu() {
  const menu = document.getElementById('language-menu');
  const button = document.getElementById('btn-lang');
  if (menu) menu.hidden = true;
  button?.setAttribute('aria-expanded', 'false');
}

function setupAccessibility() {
  const panel = document.getElementById('accessibility-panel');
  const saved = JSON.parse(localStorage.getItem('darbak-accessibility') || '{}');
  const root = document.documentElement;
  const scale = Math.min(1.3, Math.max(0.9, saved.textScale || 1));
  root.style.fontSize = `${16 * scale}px`;
  ['contrast', 'motion', 'keyboard', 'focus', 'speech'].forEach(setting => {
    root.dataset[setting] = saved[setting] ? 'on' : 'off';
    const input = document.querySelector(`[data-accessibility="${setting}"]`);
    if (input) input.checked = Boolean(saved[setting]);
  });
  const directionToggle = document.querySelector('[data-accessibility="direction"]');
  if (directionToggle) directionToggle.checked = saved.direction !== false;

  document.getElementById('btn-accessibility')?.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    document.getElementById('btn-accessibility').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) panel.querySelector('button, input')?.focus();
  });
  panel?.querySelector('.panel-close')?.addEventListener('click', () => {
    panel.hidden = true;
    document.getElementById('btn-accessibility')?.focus();
  });
  panel?.addEventListener('change', event => {
    const control = event.target.closest('[data-accessibility]');
    if (!control) return;
    const preferences = JSON.parse(localStorage.getItem('darbak-accessibility') || '{}');
    preferences[control.dataset.accessibility] = control.checked;
    localStorage.setItem('darbak-accessibility', JSON.stringify(preferences));
    if (control.dataset.accessibility === 'direction') {
      const rtl = ['ar', 'ur'].includes(currentLanguage);
      root.dir = control.checked && rtl ? 'rtl' : 'ltr';
      return;
    }
    root.dataset[control.dataset.accessibility] = control.checked ? 'on' : 'off';
  });
  panel?.addEventListener('click', event => {
    const control = event.target.closest('[data-accessibility]');
    if (!control) return;
    if (control.dataset.accessibility === 'text-up' || control.dataset.accessibility === 'text-down') {
      const preferences = JSON.parse(localStorage.getItem('darbak-accessibility') || '{}');
      preferences.textScale = Math.min(1.3, Math.max(0.9, (preferences.textScale || 1) + (control.dataset.accessibility === 'text-up' ? 0.1 : -0.1)));
      localStorage.setItem('darbak-accessibility', JSON.stringify(preferences));
      root.style.fontSize = `${16 * preferences.textScale}px`;
    }
    if (control.dataset.accessibility === 'reset') {
      localStorage.removeItem('darbak-accessibility');
      root.style.fontSize = '';
      root.dir = ['ar', 'ur'].includes(currentLanguage) ? 'rtl' : 'ltr';
      ['contrast', 'motion', 'keyboard', 'focus', 'speech'].forEach(setting => root.dataset[setting] = 'off');
      panel.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = input.dataset.accessibility === 'direction');
    }
  });
  document.addEventListener('click', event => {
    if (root.dataset.speech !== 'on' || event.target.closest('button, input, a, select, textarea')) return;
    const text = event.target.closest('p, h1, h2, h3, h4, li')?.textContent?.trim();
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage;
    window.speechSynthesis.speak(utterance);
  });
}
