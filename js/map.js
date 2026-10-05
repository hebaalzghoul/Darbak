function getMapPlaceById(id) {
  return PLACES.find(place => place.id === id) || CITY_MAP_PLACES.find(place => place.id === id);
}

function getPlaceFeatureCategories(place) {
  return [...new Set([place.category, ...(place.categories || [])])]
    .filter(category => MAP_CATEGORY_INFO[category]);
}

function createMapMarkerIcon(place) {
  const category = MAP_CATEGORY_INFO[place.category] || { icon: '📍', label: 'Place' };
  const isActive = place.id === activeMapPinId;
  return L.divIcon({
    className: 'jmap-div-icon',
    html: `<span class="jmap-marker category-${place.category} ${isActive ? 'active' : ''}" role="img" aria-label="${place.name}"><img src="${place.image}" ${imageFallbackAttribute(place)} alt=""></span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

function initializeJordanMap(canvas) {
  if (jordanMap || !window.L) return;
  jordanMap = L.map(canvas, {
    zoomControl: true,
    scrollWheelZoom: true,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    wheelDebounceTime: 60,
    wheelPxPerZoomLevel: 120,
    inertia: true,
    inertiaDeceleration: 1800,
    easeLinearity: 0.2,
    zoomAnimation: true,
    fadeAnimation: true,
    markerZoomAnimation: true,
    minZoom: 6,
    maxZoom: 18
  })
    .setView([31.2, 36.15], 7.5);
  jordanTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(jordanMap);
  jordanMapMarkers = L.layerGroup().addTo(jordanMap);
  jordanTileLayer.on('tileerror', () => {
    const status = document.getElementById('map-status');
    if (status) status.textContent = 'Street map tiles could not load. Check your internet connection.';
  });
  jordanTileLayer.on('tileload', () => {
    const status = document.getElementById('map-status');
    if (status?.textContent.startsWith('Street map tiles')) status.textContent = '';
  });
}

// Render Map Pins
function renderMapPins() {
  const canvas = document.getElementById('jmap-canvas');
  if (!canvas) return;

  const visiblePlaces = getVisibleMapPlaces();
  renderTrendingPlaces(visiblePlaces);
  if (activeView !== 'jmap') {
    updateActivePinCard();
    return;
  }
  if (!window.L) {
    canvas.innerHTML = '<p class="map-load-message">The street map could not load. Check your internet connection and refresh.</p>';
    const status = document.getElementById('map-status');
    if (status) status.textContent = 'Map library unavailable.';
    updateActivePinCard();
    return;
  }
  initializeJordanMap(canvas);
  if (!jordanMapMarkers) return;

  if (!visiblePlaces.some(place => place.id === activeMapPinId)) activeMapPinId = visiblePlaces[0]?.id || null;
  jordanMapMarkers.clearLayers();
  visiblePlaces.forEach(place => {
    const category = MAP_CATEGORY_INFO[place.category] || { icon: '📍', label: 'Place' };
    const marker = L.marker(place.geo, {
      icon: createMapMarkerIcon(place),
      title: `${place.name} · ${category.label}`,
      alt: `${place.name}, ${category.label}`,
      keyboard: true,
      placeId: place.id
    }).addTo(jordanMapMarkers);
    marker.bindTooltip(place.name, { direction: 'top', offset: [0, -18] });
    marker.on('click', () => selectMapPin(place.id));
  });
  updateActivePinCard();
  requestAnimationFrame(() => jordanMap?.invalidateSize());
  requestPageTranslation();
}

function selectMapPin(id) {
  activeMapPinId = id;
  const place = getMapPlaceById(id);
  updateActivePinCard();
  jordanMapMarkers?.eachLayer(marker => {
    const markerPlace = getMapPlaceById(marker.options.placeId);
    if (markerPlace) marker.setIcon(createMapMarkerIcon(markerPlace));
  });
  if (place && jordanMap) {
    const targetZoom = Math.max(jordanMap.getZoom(), 12);
    jordanMap.flyTo(place.geo, targetZoom, { duration: 0.8 });
  }
}

function getVisibleMapPlaces() {
  let places = [...PLACES, ...CITY_MAP_PLACES].filter(place => mapCategory === 'all' || place.categories.includes(mapCategory));
  if (mapSearch) {
    const query = mapSearch.toLowerCase();
    places = places.filter(place => `${place.name} ${place.location} ${place.desc}`.toLowerCase().includes(query));
  }
  if (mapFilterMode === 'near-amman') {
    places = places.filter(place => calculateDriveMinutes([31.953, 35.930], place.geo) <= 75);
  } else if (mapFilterMode === 'near-me' && visitorCoordinates) {
    places = places.filter(place => calculateDriveMinutes(visitorCoordinates, place.geo) <= 120);
  } else if (mapFilterMode === 'trending') {
    places = [...places].sort((a, b) => (b.rating * (b.reviews || 1)) - (a.rating * (a.reviews || 1)));
  }
  return places;
}

function renderTrendingPlaces(places = getVisibleMapPlaces()) {
  const container = document.getElementById('map-trending-list');
  if (!container) return;
  const heading = document.getElementById('map-trending-heading');
  if (heading) heading.textContent = mapFilterMode === 'near-amman' ? 'Places Near Amman' : mapFilterMode === 'near-me' ? 'Places Near You' : mapFilterMode === 'trending' ? 'Most Visited' : 'Jordan Highlights';
  container.innerHTML = places.slice(0, 5).map(place => `<button class="map-list-item" type="button" onclick="selectMapPin('${place.id}')">
    <img src="${place.image}" ${imageFallbackAttribute(place)} alt="" loading="lazy"><span><strong>${place.name}</strong><small>${place.location} · ${place.duration}</small></span>
  </button>`).join('') || '<p class="empty-state">No locations match these filters.</p>';
}

function updateActivePinCard() {
  const card = document.getElementById('active-pin-card');
  if (!card) return;
  const p = getMapPlaceById(activeMapPinId);
  if (!p) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  const features = getPlaceFeatureCategories(p).map(category => {
    const feature = MAP_CATEGORY_INFO[category];
    return `<span class="map-feature-chip"><i aria-hidden="true">${feature.icon}</i>${feature.label}</span>`;
  }).join('');

  card.innerHTML = `
    <button class="map-card-close" type="button" aria-label="Close destination details" onclick="document.getElementById('active-pin-card').hidden = true">×</button>
    <img src="${p.image}" ${imageFallbackAttribute(p)} alt="${p.name}" class="active-pin-img">
    <div class="active-pin-content">
      <div style="font-size: 0.65rem; font-weight: 700; color: #B84B39; text-transform: uppercase;">
        ${p.type.toUpperCase()} · ACTIVE PIN
      </div>
      <h4 style="font-family: var(--font-serif); font-size: 1rem; margin: 4px 0;">${p.name}</h4>
      <div class="map-feature-chips" aria-label="Place features">${features}</div>
      <p style="font-size: 0.75rem; color: #78716C; margin-bottom: 6px;">${p.desc}</p>
      <div class="advice-badge">
        <strong>Best Season:</strong> ${p.season}
      </div>
      <div style="font-size: 0.72rem; color: #57534E; margin-bottom: 10px;">
        <strong>Advice:</strong> ${p.advice[0]}
      </div>
      ${p.type === 'city' ? '' : `<div class="map-card-actions">
        <button class="btn-primary" type="button" onclick="toggleSave('${p.id}')">${savedPlaces.includes(p.id) ? '✓ Saved in Trip' : '+ Save in Trip'}</button>
        <button class="btn-outline" type="button" aria-pressed="${favoritePlaces.has(p.id)}" onclick="toggleFavorite('${p.id}'); updateActivePinCard()">${favoritePlaces.has(p.id) ? '★ Favorite' : '☆ Favorite'}</button>
      </div>`}
    </div>
  `;
}

function renderJordanCities() {
  const container = document.getElementById('jordan-cities-grid');
  if (!container) return;
  container.innerHTML = JORDAN_CITIES.map(city => `
    <button type="button" class="jordan-city-card" aria-pressed="false" onclick="selectJordanCity('${city.id}')">
      <img src="${city.image}" alt="" loading="lazy">
      <span class="jordan-city-card-copy"><strong>${city.name}</strong><small>${city.governorate} Governorate</small><span>${city.desc}</span></span>
    </button>
  `).join('');
}

function selectJordanCity(cityId) {
  const city = JORDAN_CITIES.find(item => item.id === cityId);
  const panel = document.getElementById('jordan-city-details');
  if (!city || !panel) return;
  document.querySelectorAll('.jordan-city-card').forEach(card => {
    const selected = card.getAttribute('onclick') === `selectJordanCity('${cityId}')`;
    card.classList.toggle('active', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
  panel.innerHTML = `
    <img src="${city.image}" alt="">
    <div class="city-detail-copy"><span class="kicker">${city.governorate} Governorate</span><h4 class="font-serif">${city.name} <span lang="ar" dir="rtl">${city.nameAr}</span></h4><p>${city.info}</p><p class="city-detail-highlight"><strong>Nearby highlight:</strong> ${city.highlight}</p><button type="button" class="btn-primary" onclick="showJordanCityOnMap('${city.id}')">See ${city.name} on JMap</button></div>
  `;
  panel.hidden = false;
  panel.focus({ preventScroll: true });
}

function showJordanCityOnMap(cityId) {
  const mapPlace = CITY_MAP_PLACES.find(place => place.id === `city-${cityId}`);
  if (!mapPlace) return;
  activeMapPinId = mapPlace.id;
  mapCategory = 'all';
  mapFilterMode = 'all';
  mapSearch = '';
  const search = document.getElementById('jmap-search');
  if (search) search.value = '';
  document.querySelectorAll('[data-map-category]').forEach(button => {
    const selected = button.dataset.mapCategory === 'all';
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  showView('jmap');
  requestAnimationFrame(() => jordanMap?.setView(mapPlace.geo, 11, { animate: true }));
}

function speakArabicWord(text) {
  const status = document.getElementById('pronunciation-status');
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    if (status) status.textContent = 'Arabic audio is not supported by this browser.';
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-JO';
  const arabicVoice = window.speechSynthesis.getVoices().find(voice => /^ar(-|$)/i.test(voice.lang));
  if (arabicVoice) utterance.voice = arabicVoice;
  if (status) status.textContent = arabicVoice ? 'Playing Arabic pronunciation.' : 'Playing with the available voice. Install an Arabic speech voice for best pronunciation.';
  window.speechSynthesis.speak(utterance);
}

