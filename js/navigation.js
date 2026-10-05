function showView(viewId) {
  activeView = viewId;
  document.body.classList.toggle('jmap-view-active', viewId === 'jmap');
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.target === viewId);
  });

  if (viewId === 'jmap') {
    renderMapPins();
    requestAnimationFrame(() => jordanMap?.invalidateSize());
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  requestPageTranslation();
}

function setupNavigation() {
  document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.dataset.target;
      if (target) showView(target);
    });
  });
}

// Render Wonders on Home
function renderWonders() {
  const container = document.getElementById('wonders-grid');
  if (!container) return;
  const wonders = [...PLACES].sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews)).slice(0, 4);

  container.innerHTML = wonders.map(p => `
    <div class="card">
      <div class="card-img-wrap">
        <img src="${p.image}" alt="${p.name}">
        <button class="card-save-btn ${savedPlaces.includes(p.id) ? 'saved' : ''}" onclick="toggleSave('${p.id}')">
          ♥
        </button>
      </div>
      <div class="card-body">
        <div>
          <h3 class="card-title">${currentLanguage === 'ar' ? p.nameAr : p.name}</h3>
          <p class="card-desc">${currentLanguage === 'ar' ? p.descAr : p.desc}</p>
        </div>
        <div class="card-footer">
          <button class="link-arrow" onclick="openPlaceModal('${p.id}')">
            ${currentLanguage === 'ar' ? 'عرض الدليل الشامل ←' : 'Explore Guide →'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
  requestPageTranslation();
}

// Render Explore Grid
function renderExploreGrid(filterCategory = exploreCategory, searchQuery = exploreSearch) {
  const container = document.getElementById('explore-grid');
  if (!container) return;

  exploreCategory = filterCategory;
  exploreSearch = searchQuery;
  const filtered = PLACES.filter(place => {
    const matchCategory = filterCategory === 'all' ||
      (filterCategory === 'hidden-gems' ? place.hiddenGem : place.categories.includes(filterCategory));
    const searchableText = `${place.name} ${place.desc} ${place.location} ${place.category}`.toLowerCase();
    return matchCategory && searchableText.includes(searchQuery.toLowerCase()) && !dismissedExplorePlaces.has(place.id);
  });
  const visible = filtered.slice(0, exploreVisibleCount);

  container.innerHTML = visible.map(p => `
    <article class="card explore-card">
      <div class="card-img-wrap">
        <img src="${p.image}" ${imageFallbackAttribute(p)} alt="${p.name}" loading="lazy">
        <span class="card-badge">${p.subCategory || p.category}</span>
      </div>
      <div class="card-body">
        <div>
          <h3 class="card-title">${currentLanguage === 'ar' ? p.nameAr : p.name}</h3>
          <p class="card-desc">${currentLanguage === 'ar' ? p.descAr : p.desc}</p>
          <dl class="explore-card-details">
            <div><dt>Category</dt><dd>${p.subCategory || p.category}</dd></div>
            <div><dt>Best Season</dt><dd>${p.season}</dd></div>
            <div><dt>Advice Before Visiting</dt><dd>${p.advice[0]}</dd></div>
            <div><dt>Time to Spend</dt><dd>${p.duration}</dd></div>
          </dl>
        </div>
        <div class="card-footer">
          <button class="link-arrow" onclick="openPlaceModal('${p.id}')">
            ${currentLanguage === 'ar' ? 'اعرف المزيد ←' : 'Learn More →'}
          </button>
          <span class="saved-in-trip ${savedPlaces.includes(p.id) ? 'is-saved' : ''}">${savedPlaces.includes(p.id) ? 'Saved in Trip' : 'Not saved'}</span>
        </div>
      </div>
    </article>
  `).join('');

  const loadMore = document.getElementById('explore-load-more');
  if (loadMore) loadMore.hidden = visible.length >= filtered.length;
  const emptyState = document.getElementById('explore-empty');
  if (emptyState) emptyState.hidden = filtered.length > 0;
  requestPageTranslation();
}

async function toggleFavorite(placeId) {
  if (!firebaseState.user) {
    requireAuth('save this favorite');
    return;
  }

  const currentFavorite = favoritePlaces.has(placeId);
  if (currentFavorite) {
    favoritePlaces.delete(placeId);
  } else {
    favoritePlaces.add(placeId);
  }

  if (!isFirebaseAvailable()) {
    renderExploreGrid();
    updateActivePinCard();
    return;
  }

  const favoriteRef = firebaseState.db.collection('users').doc(firebaseState.user.uid).collection('favorites').doc(placeId);
  try {
    if (currentFavorite) {
      await favoriteRef.delete();
      showToast('Favorite removed.', 'info');
    } else {
      await favoriteRef.set({
        placeId,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      showToast('Favorite saved to your account.', 'success');
    }
    await loadUserData(firebaseState.user.uid);
  } catch (error) {
    showToast(getFriendlyErrorMessage(error, 'Unable to update this favorite right now.'), 'error');
  }
  renderExploreGrid();
  updateActivePinCard();
}

function dismissExploreCard(placeId) {
  dismissedExplorePlaces.add(placeId);
  renderExploreGrid();
}

function loadMoreExplorePlaces() {
  exploreVisibleCount += 6;
  renderExploreGrid();
}

