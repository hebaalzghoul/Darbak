function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  const monthTitle = document.getElementById('calendar-month-title');
  if (monthTitle) monthTitle.textContent = calendarViewDate.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    .map(day => `<span class="calendar-weekday" aria-hidden="true">${day}</span>`).join('');
  for (let i = 0; i < firstDay; i++) {
    html += '<span class="calendar-empty" aria-hidden="true"></span>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = selectedCalendarDate === dateStr;
    const hasItems = (scheduledPlaces[dateStr] || []).some(id => savedPlaces.includes(id));

    html += `
      <button type="button" class="cal-day-cell ${isSelected ? 'active' : ''} ${hasItems ? 'has-item' : ''}"
           aria-label="Select ${new Date(year, month, d).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}${hasItems ? ', itinerary planned' : ''}" aria-pressed="${isSelected}"
           onclick="selectDate('${dateStr}')">
        ${d}
      </button>
    `;
  }

  grid.innerHTML = html;
  renderSavedList();
}

function selectDate(dateStr) {
  selectedCalendarDate = dateStr;
  calendarViewDate = new Date(`${dateStr}T12:00:00`);
  renderCalendar();
}

function changeCalendarMonth(offset) {
  calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + offset, 1, 12);
  selectedCalendarDate = toLocalDateString(calendarViewDate);
  renderCalendar();
}

function renderSavedList() {
  const container = document.getElementById('saved-items-list');
  renderSelectedDay();
  if (!container) return;

  const savedItems = PLACES.filter(p => savedPlaces.includes(p.id));
  if (savedItems.length === 0) {
    container.innerHTML = '<p style="font-size: 0.8rem; color: #78716C; text-align: center; padding: 2rem;">No saved places yet.</p>';
    renderSavedTripDetails();
    return;
  }

  container.innerHTML = savedItems.map(p => `
    <div class="saved-place-row">
      <div class="saved-place-info">
        <img src="${p.image}" alt="${p.name}" class="saved-place-thumb">
        <div>
          <h4>${p.name}</h4>
          <span>${p.location}</span>
        </div>
      </div>
      <div class="saved-place-actions">
        <button type="button" onclick="schedulePlace('${p.id}')">Schedule this day</button>
        <button type="button" class="saved-remove" onclick="toggleSave('${p.id}')">Remove</button>
      </div>
    </div>
  `).join('');
  renderSavedTripDetails();
}

function renderSavedTripDetails() {
  const overview = document.getElementById('trip-overview-content');
  const bookings = document.getElementById('booked-experiences-list');
  const bookingTotal = bookedExperiences.reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);
  const planEstimateMin = Number(currentTripPlan?.estimatedCost?.min || 0);
  const planEstimateMax = Number(currentTripPlan?.estimatedCost?.max || 0);
  const totalEstimateMin = bookingTotal + planEstimateMin;
  const totalEstimateMax = bookingTotal + planEstimateMax;
  const estimateLabel = totalEstimateMax ? `$${totalEstimateMin.toLocaleString()}–$${totalEstimateMax.toLocaleString()}` : 'Add a plan or booking';
  const savedItinerary = currentTripPlan?.itinerary?.length ? `<section class="saved-itinerary-summary" aria-label="Saved itinerary days">
    <h3>${escapeHTML(currentTripPlan.duration)}-Day Itinerary</h3>
    <ol>${currentTripPlan.itinerary.map((entry, index) => {
    const place = PLACES.find(item => item.id === entry.placeId);
    return `<li><strong>Day ${index + 1}: ${escapeHTML(place?.name || entry.destination)}</strong><span>${escapeHTML(entry.activities?.[0] || '')}</span><small>Estimated travel: ${escapeHTML(entry.travelTime || 'Not available')}</small></li>`;
  }).join('')}</ol>
  </section>` : '';

  if (overview) {
    overview.innerHTML = `<div class="trip-overview-metrics">
        <div><span>Saved places</span><strong>${savedPlaces.length}</strong></div>
        <div><span>Itinerary</span><strong>${currentTripPlan ? `${escapeHTML(currentTripPlan.duration)} days` : 'Not saved'}</strong></div>
      <div><span>Booked experiences</span><strong>${bookedExperiences.length}</strong></div>
      <div><span>Estimated total</span><strong>${estimateLabel}</strong></div>
    </div>
    ${currentTripPlan?.budgetLabel ? `<p class="trip-overview-note">${escapeHTML(currentTripPlan.budgetLabel)} estimate for one traveler, plus booked experience costs.</p>` : '<p class="trip-overview-note">Estimates are planning guides, not live quotes.</p>'}
    ${savedItinerary}`;
  }

  if (!bookings) return;
  if (!bookedExperiences.length) {
    bookings.innerHTML = '<p class="trip-empty-note">No local experiences booked yet.</p>';
    return;
  }

  bookings.innerHTML = bookedExperiences.map(booking => {
    const experience = LOCAL_EXPERIENCES.find(item => item.id === booking.experienceId);
    if (!experience) return '';
    return `<article class="booked-experience-row">
      <img src="${experience.image}" alt="" loading="lazy">
      <div><h3>${experience.title}</h3><p>${experience.location} · ${escapeHTML(booking.preferredDate)} · ${escapeHTML(booking.guests)} guest${booking.guests === 1 ? '' : 's'}</p><small>Request saved · not confirmed${booking.contactName ? ` · ${escapeHTML(booking.contactName)}` : ''}${booking.notes ? ` · Note: ${escapeHTML(booking.notes)}` : ''}</small></div>
      <strong>$${Number(booking.totalPrice || 0).toLocaleString()}</strong>
      <button type="button" class="saved-remove" aria-label="Remove booking for ${experience.title}" onclick="removeBookedExperience('${escapeHTML(booking.id)}')">Remove</button>
    </article>`;
  }).join('');
}

function removeBookedExperience(bookingId) {
  bookedExperiences = bookedExperiences.filter(booking => booking.id !== bookingId);
  writeLocalData('darbak-booked-experiences', bookedExperiences);
  renderSavedTripDetails();
}

function renderSelectedDay() {
  const container = document.getElementById('selected-day-items');
  const label = document.getElementById('selected-day-label');
  if (!container) return;

  const date = new Date(`${selectedCalendarDate}T12:00:00`);
  if (label) label.textContent = date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
  const placesForDay = (scheduledPlaces[selectedCalendarDate] || [])
    .filter(id => savedPlaces.includes(id))
    .map(id => PLACES.find(place => place.id === id))
    .filter(Boolean);

  if (!placesForDay.length) {
    container.innerHTML = '<p class="empty-day-message">Nothing planned yet. Choose a saved destination below to add it to this day.</p>';
    return;
  }

  container.innerHTML = placesForDay.map(place => `
    <article class="planned-place-card">
      <img src="${place.image}" ${imageFallbackAttribute(place)} alt="${place.name}">
      <div class="planned-place-copy"><span>${place.location}</span><h4>${place.name}</h4><p>${place.duration}</p></div>
      <button type="button" class="btn-outline notification-button" onclick="sendItineraryNotification('${place.id}')">Send me a notification</button>
    </article>
  `).join('');
}

function schedulePlace(placeId) {
  Object.keys(scheduledPlaces).forEach(date => {
    scheduledPlaces[date] = scheduledPlaces[date].filter(id => id !== placeId);
  });
  scheduledPlaces[selectedCalendarDate] ||= [];
  if (!scheduledPlaces[selectedCalendarDate].includes(placeId)) scheduledPlaces[selectedCalendarDate].push(placeId);
  writeLocalData('darbak-scheduled-places', scheduledPlaces);
  renderCalendar();
}

async function addItineraryToCalendar() {
  if (!currentTripPlan?.itinerary?.length) {
    showToast('Generate an itinerary before adding it to the calendar.', 'info');
    return;
  }

  const startDateInput = document.getElementById('trip-start-date');
  const startDateValue = startDateInput?.value;
  const startDate = startDateValue ? new Date(`${startDateValue}T12:00:00`) : null;
  if (!startDate || Number.isNaN(startDate.getTime())) {
    showToast('Choose a valid trip start date.', 'error');
    startDateInput?.focus();
    return;
  }

  if (!requireAuth('add your itinerary to the calendar')) return;
  currentTripPlan.startDate = startDateValue;
  if (!await saveCurrentTripToFirestore()) return;

  const placeIds = [...new Set(currentTripPlan.itinerary.map(entry => entry.placeId))];
  const newPlaceIds = placeIds.filter(placeId => !savedPlaces.includes(placeId));
  if (newPlaceIds.length && firebaseState.db && firebaseState.user) {
    try {
      const batch = firebaseState.db.batch();
      newPlaceIds.forEach(placeId => {
        const placeRef = firebaseState.db.collection('users').doc(firebaseState.user.uid).collection('savedPlaces').doc(placeId);
        batch.set(placeRef, { placeId, savedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      });
      await batch.commit();
    } catch (error) {
      showToast('The trip is scheduled on this device, but some places could not sync to your account.', 'info');
    }
  }
  savedPlaces = [...new Set([...savedPlaces, ...placeIds])];

  placeIds.forEach(placeId => {
    Object.keys(scheduledPlaces).forEach(date => {
      scheduledPlaces[date] = scheduledPlaces[date].filter(id => id !== placeId);
    });
  });
  currentTripPlan.itinerary.forEach((entry, index) => {
    const itineraryDate = new Date(startDate);
    itineraryDate.setDate(itineraryDate.getDate() + index);
    const date = toLocalDateString(itineraryDate);
    scheduledPlaces[date] ||= [];
    if (!scheduledPlaces[date].includes(entry.placeId)) scheduledPlaces[date].push(entry.placeId);
  });

  selectedCalendarDate = startDateValue;
  calendarViewDate = new Date(`${startDateValue}T12:00:00`);
  writeLocalData('darbak-scheduled-places', scheduledPlaces);
  updateSavedCount();
  renderCalendar();
  showToast('Your designed trip and its saved places are now on the calendar.', 'success');
}

async function sendItineraryNotification(placeId) {
  const place = PLACES.find(item => item.id === placeId);
  if (!place) return;
  if (!('Notification' in window)) {
    showToast('Browser notifications are not available here.', 'info');
    return;
  }
  if (!window.isSecureContext) {
    showToast('Notifications work on localhost or HTTPS. This preview is still local-only.', 'info');
    return;
  }
  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission === 'granted') {
    new Notification('Darbak trip reminder', {
      body: `${place.name} is planned for ${new Date(`${selectedCalendarDate}T12:00:00`).toLocaleDateString('en', { month: 'long', day: 'numeric' })}.`,
      icon: place.image
    });
    showToast(`Reminder created for ${place.name}.`, 'success');
  } else {
    showToast('Notifications are blocked in your browser settings.', 'info');
  }
}

