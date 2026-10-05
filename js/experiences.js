// Render Local Experiences
function renderLocalGrid() {
  const container = document.getElementById('local-grid');
  if (!container) return;

  container.innerHTML = LOCAL_EXPERIENCES.map(exp => `
    <div class="card">
      <div class="card-img-wrap">
        <img src="${exp.image}" alt="${exp.title}" loading="lazy">
        <span class="card-badge">${exp.location}</span>
        <div class="local-card-actions">
          <button class="card-save-btn ${savedExperiences.has(exp.id) ? 'saved' : ''}" type="button" aria-label="${savedExperiences.has(exp.id) ? 'Remove saved experience' : 'Save experience'}: ${exp.title}" onclick="toggleExperienceSaved('${exp.id}')">♥</button>
        </div>
      </div>
      <div class="card-body">
        <div>
          <h3 class="card-title">${currentLanguage === 'ar' ? exp.titleAr : exp.title}</h3>
          <p class="card-desc">${exp.desc}</p>
        </div>
        <div class="card-footer" style="margin-bottom: 0.75rem;">
          <span style="font-size: 0.75rem; color: #78716C;">⏱ ${exp.duration}</span>
          <span style="font-weight: 700; font-size: 1rem;">$${exp.price}</span>
        </div>
        <button class="btn-primary" style="width: 100%; justify-content: center; padding: 8px 16px; font-size: 0.75rem;" onclick="openBookingModal('${exp.id}')">
          ${currentLanguage === 'ar' ? 'حجز التجربة' : 'Book Experience'}
        </button>
      </div>
    </div>
  `).join('');
  requestPageTranslation();
}

function toggleExperienceSaved(id) {
  if (firebaseState.user) {
    toggleExperienceInFirestore(id, 'savedExperiences');
    return;
  }
  if (savedExperiences.has(id)) {
    savedExperiences.delete(id);
    showToast('Experience removed from your saved list.', 'info');
  } else {
    savedExperiences.add(id);
    showToast('Experience saved to your plan.', 'success');
  }
  writeLocalData('darbak-saved-experiences', [...savedExperiences]);
  renderLocalGrid();
}

function toggleExperienceFavorite(id) {
  if (firebaseState.user) {
    toggleExperienceInFirestore(id, 'favoriteExperiences');
    return;
  }
  if (favoriteExperiences.has(id)) favoriteExperiences.delete(id);
  else favoriteExperiences.add(id);
  renderLocalGrid();
}

