function calculateDriveMinutes(from, to) {
  const radians = degrees => degrees * Math.PI / 180;
  const [fromLat, fromLon] = from;
  const [toLat, toLon] = to;
  const latDelta = radians(toLat - fromLat);
  const lonDelta = radians(toLon - fromLon);
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(radians(fromLat)) * Math.cos(radians(toLat)) * Math.sin(lonDelta / 2) ** 2;
  const roadDistanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.22;
  if (roadDistanceKm < 10) return 15;
  return Math.ceil((roadDistanceKm / 68 * 60) / 5) * 5;
}


function getPlaceActivity(place) {
  if (place.categories.includes('history')) return `Explore ${place.name} with time for the site museum or a local guide.`;
  if (place.categories.includes('adventure')) return `Take a guided trail or outdoor excursion at ${place.name}; check seasonal access.`;
  if (place.categories.includes('food')) return `Sample regional dishes and browse local vendors around ${place.name}.`;
  if (place.categories.includes('relaxation') || place.categories.includes('medical')) return `Set aside unhurried time for bathing or wellness at ${place.name}.`;
  return `Walk the landscape and visitor trails around ${place.name}, with breaks for viewpoints.`;
}

function getTravelLabel(minutes) {
  if (!minutes) return 'Local transfers';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours ? `${hours} hr ` : ''}${remainder ? `${remainder} min` : ''}`;
}

function generateItinerary() {
  if (!firebaseState.user) {
    pendingGenerateTrip = true;
    openAuthModal();
    showToast('Please sign in or create an account to generate your trip.', 'info');
    return;
  }

  const daysInput = document.getElementById('trip-custom-days');
  const requestedDays = Number(daysInput?.value || itineraryDays);
  if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 30) {
    showToast('Choose a trip length from 1 to 30 days.', 'error');
    daysInput?.focus();
    return;
  }
  itineraryDays = requestedDays;

  const relevantCategories = new Set(itineraryInterests);
  if (relevantCategories.has('culture')) relevantCategories.add('history');
  if (relevantCategories.has('photography')) ['history', 'nature', 'adventure'].forEach(category => relevantCategories.add(category));
  if (relevantCategories.has('family')) ['history', 'nature', 'food', 'relaxation'].forEach(category => relevantCategories.add(category));
  const budget = TRIP_BUDGETS[itineraryBudget] || TRIP_BUDGETS.balanced;
  const rankedPlaces = PLACES.map((place, index) => {
    const categories = new Set([place.category, ...place.categories]);
    let score = relevantCategories.size ? [...relevantCategories].filter(category => categories.has(category)).length * 10 : 1;
    if (itineraryBudget === 'budget' && ['history', 'nature', 'food'].some(category => categories.has(category))) score += 2;
    if (itineraryBudget === 'comfort' && ['relaxation', 'medical', 'food'].some(category => categories.has(category))) score += 2;
    return { place, score, index };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  const candidates = rankedPlaces.filter(item => item.score > 0).map(item => item.place);
  const places = candidates.length ? candidates : PLACES;
  const notesByType = {
    solo: 'Keep transfers flexible and consider a licensed guide for remote trails.',
    couple: 'Leave room for relaxed meals and scenic stops.',
    family: 'Plan shade and water breaks, and confirm age requirements for activities.',
    group: 'Agree on meeting points and confirm group availability before travel.'
  };
  let previousGeo = [31.953, 35.930];

  const itinerary = Array.from({ length: itineraryDays }, (_, index) => {
    const place = places[index % places.length];
    const travelTime = getTravelLabel(calculateDriveMinutes(previousGeo, place.geo));
    previousGeo = place.geo;
    return {
      day: index + 1,
      placeId: place.id,
      destination: place.name,
      activities: [getPlaceActivity(place)],
      travelTime,
      notes: notesByType[itineraryTravelerType] || 'Choose a comfortable pace and check local opening times before traveling.',
      image: place.image
    };
  });

  const estimatedCost = {
    min: itineraryDays * budget.minPerDay,
    max: itineraryDays * budget.maxPerDay
  };
  currentTripPlan = {
    duration: itineraryDays,
    interests: Array.from(itineraryInterests),
    destinations: itinerary.map(entry => entry.placeId),
    travelerType: itineraryTravelerType || 'flexible',
    budget: itineraryBudget || 'balanced',
    budgetLabel: budget.label,
    estimatedCost,
    itinerary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  itineraryEditMode = false;
  document.querySelectorAll('[data-trip-days]').forEach(button => {
    const selected = Number(button.dataset.tripDays) === itineraryDays;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const durationLabel = document.getElementById('trip-duration-label');
  if (durationLabel) durationLabel.textContent = `Duration: ${itineraryDays} Days`;
  renderGeneratedItinerary();
  const resultActions = document.getElementById('itinerary-result-actions');
  if (resultActions) resultActions.hidden = false;
  const editButton = document.getElementById('edit-itinerary');
  if (editButton) editButton.textContent = 'Edit';
  const title = document.getElementById('itinerary-title');
  if (title) title.textContent = `Your ${itineraryDays}-Day Jordan Itinerary`;
  const estimate = document.getElementById('itinerary-estimate');
  if (estimate) {
    estimate.textContent = `${budget.label} estimate: $${estimatedCost.min.toLocaleString()}–$${estimatedCost.max.toLocaleString()} per traveler for ${itineraryDays} days, excluding flights and booked experiences.`;
    estimate.hidden = false;
  }
}

function renderGeneratedItinerary() {
  const container = document.getElementById('itinerary-results');
  if (!container || !currentTripPlan?.itinerary?.length) return;
  container.innerHTML = currentTripPlan.itinerary.map((entry, index) => {
    const place = PLACES.find(item => item.id === entry.placeId);
    if (!place) return '';
    const editor = itineraryEditMode ? `<div class="itinerary-edit-controls">
      <label class="sr-only" for="itinerary-place-${index}">Day ${index + 1} destination</label>
      <select id="itinerary-place-${index}" data-itinerary-place="${index}" class="search-input">${PLACES.map(option => `<option value="${option.id}" ${option.id === entry.placeId ? 'selected' : ''}>${option.name}</option>`).join('')}</select>
      <button type="button" class="btn-outline" data-itinerary-move="up" data-itinerary-index="${index}" aria-label="Move day ${index + 1} earlier" ${index === 0 ? 'disabled' : ''}>↑</button>
      <button type="button" class="btn-outline" data-itinerary-move="down" data-itinerary-index="${index}" aria-label="Move day ${index + 1} later" ${index === currentTripPlan.itinerary.length - 1 ? 'disabled' : ''}>↓</button>
    </div>` : '';
    return `<article class="timeline-item itinerary-day-card">
      <img src="${place.image}" ${imageFallbackAttribute(place)} class="timeline-thumb" alt="${place.name}" loading="lazy">
      <div class="timeline-content">
        <span class="timeline-day">DAY ${index + 1}</span>
        <h3 class="font-serif">${place.name}</h3>
        <p>${getPlaceActivity(place)} ${escapeHTML(entry.notes)}</p>
        <span class="timeline-travel" aria-label="Estimated driving time">Estimated travel: ${escapeHTML(entry.travelTime)}</span>
        ${editor}
      </div>
    </article>`;
  }).join('');
}

function updateItineraryAfterEdit() {
  let previousGeo = [31.953, 35.930];
  currentTripPlan.itinerary.forEach((entry, index) => {
    entry.day = index + 1;
    const place = PLACES.find(item => item.id === entry.placeId);
    if (place) {
      entry.destination = place.name;
      entry.image = place.image;
      entry.activities = [getPlaceActivity(place)];
      entry.travelTime = getTravelLabel(calculateDriveMinutes(previousGeo, place.geo));
      previousGeo = place.geo;
    }
  });
  currentTripPlan.destinations = currentTripPlan.itinerary.map(entry => entry.placeId);
  currentTripPlan.updatedAt = new Date().toISOString();
  renderGeneratedItinerary();
}

