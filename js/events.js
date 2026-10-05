function setupEventListeners() {
  document.getElementById('btn-lang')?.addEventListener('click', () => {
    const menu = document.getElementById('language-menu');
    if (menu?.hidden) openLanguageMenu();
    else closeLanguageMenu();
  });
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    const language = button.dataset.language;
    setLanguage(language);
  }));
  document.addEventListener('click', event => {
    if (!event.target.closest('#btn-lang, #language-menu')) closeLanguageMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const openModal = document.querySelector('.modal-overlay.open');
      if (openModal) closeModal(openModal.id);
      closeLanguageMenu();
      const panel = document.getElementById('accessibility-panel');
      if (panel && !panel.hidden) {
        panel.hidden = true;
        document.getElementById('btn-accessibility')?.setAttribute('aria-expanded', 'false');
        document.getElementById('btn-accessibility')?.focus();
      }
      const nav = document.querySelector('.nav-links');
      if (nav?.classList.contains('open')) {
        nav.classList.remove('open');
        document.getElementById('mobile-nav-toggle')?.setAttribute('aria-expanded', 'false');
      }
    }
    const dialog = document.querySelector('.modal-overlay.open');
    if (event.key === 'Tab' && dialog) {
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.getElementById('btn-login-header')?.addEventListener('click', async () => {
    if (firebaseState.user) {
      try {
        await firebaseState.auth.signOut();
        showToast('Signed out successfully.', 'info');
      } catch (error) {
        showToast(getFriendlyErrorMessage(error, 'Unable to sign out right now.'), 'error');
      }
      return;
    }
    openAuthModal();
  });
  document.getElementById('btn-saved-header')?.addEventListener('click', () => showView('saved'));

  document.querySelectorAll('[data-explore-category]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-explore-category]').forEach(tab => {
      tab.classList.toggle('active', tab === button);
      tab.setAttribute('aria-selected', String(tab === button));
    });
    exploreVisibleCount = 6;
    renderExploreGrid(button.dataset.exploreCategory, document.getElementById('explore-search')?.value || '');
  }));
  document.querySelector('.explore-filters')?.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    const tabs = [...document.querySelectorAll('[data-explore-category]')];
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = tabs[(tabs.indexOf(event.target) + direction + tabs.length) % tabs.length];
    nextTab.focus();
    nextTab.click();
  });
  document.getElementById('explore-search')?.addEventListener('input', event => {
    exploreVisibleCount = 6;
    renderExploreGrid(exploreCategory, event.target.value.trim());
  });

  document.querySelectorAll('[data-trip-days]').forEach(button => button.addEventListener('click', () => {
    itineraryDays = Number(button.dataset.tripDays);
    const daysInput = document.getElementById('trip-custom-days');
    if (daysInput) daysInput.value = String(itineraryDays);
    document.querySelectorAll('[data-trip-days]').forEach(option => {
      option.classList.toggle('active', option === button);
      option.setAttribute('aria-pressed', String(option === button));
    });
    const label = document.getElementById('trip-duration-label');
    if (label) label.textContent = `Duration: ${itineraryDays} Days`;
  }));
  document.getElementById('trip-custom-days')?.addEventListener('input', event => {
    const days = Number(event.target.value);
    if (!Number.isInteger(days) || days < 1 || days > 30) return;
    itineraryDays = days;
    document.querySelectorAll('[data-trip-days]').forEach(button => {
      const selected = Number(button.dataset.tripDays) === days;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const label = document.getElementById('trip-duration-label');
    if (label) label.textContent = `Duration: ${days} Days`;
  });
  document.querySelectorAll('[data-trip-interest]').forEach(button => button.addEventListener('click', () => {
    const interest = button.dataset.tripInterest;
    if (itineraryInterests.has(interest)) itineraryInterests.delete(interest);
    else itineraryInterests.add(interest);
    button.classList.toggle('active', itineraryInterests.has(interest));
    button.setAttribute('aria-pressed', String(itineraryInterests.has(interest)));
  }));
  document.querySelectorAll('[data-trip-budget]').forEach(button => button.addEventListener('click', () => {
    itineraryBudget = button.dataset.tripBudget;
    document.querySelectorAll('[data-trip-budget]').forEach(option => {
      const selected = option === button;
      option.classList.toggle('active', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
  }));
  document.querySelectorAll('[data-trip-type]').forEach(button => button.addEventListener('click', () => {
    itineraryTravelerType = button.dataset.tripType;
    document.querySelectorAll('[data-trip-type]').forEach(option => {
      const selected = option === button;
      option.setAttribute('aria-pressed', String(selected));
      option.textContent = selected ? 'Selected' : 'Select';
      option.classList.toggle('btn-primary', selected);
      option.classList.toggle('btn-outline', !selected);
      option.closest('.trip-type-card')?.classList.toggle('is-selected', selected);
    });
  }));
  document.getElementById('generate-itinerary')?.addEventListener('click', generateItinerary);
  document.getElementById('edit-itinerary')?.addEventListener('click', event => {
    if (!currentTripPlan) return;
    itineraryEditMode = !itineraryEditMode;
    event.currentTarget.textContent = itineraryEditMode ? 'Done Editing' : 'Edit';
    event.currentTarget.setAttribute('aria-pressed', String(itineraryEditMode));
    renderGeneratedItinerary();
  });
  document.getElementById('save-itinerary')?.addEventListener('click', saveCurrentTripToFirestore);
  document.getElementById('add-itinerary-to-calendar')?.addEventListener('click', addItineraryToCalendar);
  document.getElementById('itinerary-results')?.addEventListener('change', event => {
    const select = event.target.closest('[data-itinerary-place]');
    if (!select || !currentTripPlan) return;
    const place = PLACES.find(item => item.id === select.value);
    const entry = currentTripPlan.itinerary[Number(select.dataset.itineraryPlace)];
    if (!place || !entry) return;
    entry.placeId = place.id;
    updateItineraryAfterEdit();
  });
  document.getElementById('itinerary-results')?.addEventListener('click', event => {
    const moveButton = event.target.closest('[data-itinerary-move]');
    if (!moveButton || !currentTripPlan) return;
    const index = Number(moveButton.dataset.itineraryIndex);
    const offset = moveButton.dataset.itineraryMove === 'up' ? -1 : 1;
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= currentTripPlan.itinerary.length) return;
    [currentTripPlan.itinerary[index], currentTripPlan.itinerary[targetIndex]] = [currentTripPlan.itinerary[targetIndex], currentTripPlan.itinerary[index]];
    updateItineraryAfterEdit();
  });

  document.querySelectorAll('[data-about-category]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-about-category]').forEach(tab => {
      const selected = tab === button;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll('[data-about-panel]').forEach(panel => {
      panel.hidden = panel.dataset.aboutPanel !== button.dataset.aboutCategory;
    });
  }));
  document.querySelector('.about-category-tabs')?.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    const tabs = [...document.querySelectorAll('[data-about-category]')];
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = tabs[(tabs.indexOf(event.target) + direction + tabs.length) % tabs.length];
    nextTab.focus();
    nextTab.click();
  });
  document.querySelectorAll('[data-pronounce-ar]').forEach(button => button.addEventListener('click', () => {
    speakArabicWord(button.dataset.pronounceAr);
  }));

  document.getElementById('jmap-search')?.addEventListener('input', event => {
    mapSearch = event.target.value.trim();
    renderMapPins();
  });
  document.querySelectorAll('[data-map-category]').forEach(button => button.addEventListener('click', () => {
    mapCategory = button.dataset.mapCategory;
    document.querySelectorAll('[data-map-category]').forEach(option => {
      option.classList.toggle('active', option === button);
      option.setAttribute('aria-pressed', String(option === button));
    });
    renderMapPins();
  }));
  document.getElementById('map-near-amman')?.addEventListener('click', () => {
    mapFilterMode = mapFilterMode === 'near-amman' ? 'all' : 'near-amman';
    renderMapPins();
  });
  document.getElementById('map-trending')?.addEventListener('click', () => {
    mapFilterMode = mapFilterMode === 'trending' ? 'all' : 'trending';
    renderMapPins();
  });
  document.getElementById('map-near-me')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      document.getElementById('map-status').textContent = 'Location is not available in this browser.';
      return;
    }
    document.getElementById('map-status').textContent = 'Requesting your location...';
    navigator.geolocation.getCurrentPosition(position => {
      visitorCoordinates = [position.coords.latitude, position.coords.longitude];
      mapFilterMode = 'near-me';
      document.getElementById('map-status').textContent = 'Showing nearby Jordan destinations.';
      renderMapPins();
    }, () => {
      document.getElementById('map-status').textContent = 'Location permission was not granted. Showing all Jordan destinations.';
      mapFilterMode = 'all';
      renderMapPins();
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });
  document.getElementById('mobile-nav-toggle')?.addEventListener('click', event => {
    const nav = document.querySelector('.nav-links');
    const expanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
    event.currentTarget.setAttribute('aria-expanded', String(!expanded));
    event.currentTarget.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    nav?.classList.toggle('open', !expanded);
  });
  document.querySelector('.nav-links')?.addEventListener('click', event => {
    if (!event.target.closest('[data-target]')) return;
    document.querySelector('.nav-links')?.classList.remove('open');
    document.getElementById('mobile-nav-toggle')?.setAttribute('aria-expanded', 'false');
  });

  document.getElementById('story-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    if (firebaseState.ready && !requireAuth('publish a story')) return;
    const title = document.getElementById('story-title')?.value.trim();
    const authorInput = document.getElementById('story-author')?.value.trim();
    const content = document.getElementById('story-content')?.value.trim();

    if (!title || !authorInput || !content) {
      showToast('Please complete all story fields before submitting.', 'error');
      return;
    }

    const [displayNamePart, ...countryParts] = authorInput.split(',');
    const author = displayNamePart.trim() || 'Traveler';
    const country = countryParts.join(',').trim() || 'Jordan';

    const story = {
      id: `story-${Date.now()}`,
      title,
      author,
      country,
      location: country === 'Jordan' ? 'Jordan' : `Jordan · ${country}`,
      content,
      image: storyPhotoDataUrl,
      userId: firebaseState.user?.uid || null,
      likes: 0,
      sample: false,
      createdAt: new Date().toISOString()
    };
    if (firebaseState.user && firebaseState.db) {
      try {
        await firebaseState.db.collection('stories').doc(story.id).set({
          title,
          author,
          country,
          location: story.location,
          content,
          image: story.image,
          userId: firebaseState.user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        showToast(getFriendlyErrorMessage(error, 'Your story could not be published. Please try again.'), 'error');
        return;
      }
    }
    await loadStoriesFromFirestore();
    event.target.reset();
    storyPhotoDataUrl = '';
    document.getElementById('story-photo-preview').hidden = true;
    showToast(firebaseState.user && firebaseState.db ? 'Your story was published.' : 'Your story was added on this device.', 'success');
    showView('stories');
  });

  document.getElementById('booking-guests')?.addEventListener('input', updateBookingEstimate);
  document.getElementById('booking-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const experienceId = document.getElementById('booking-experience-id')?.value;
    const experience = LOCAL_EXPERIENCES.find(item => item.id === experienceId);
    if (!experience) {
      showToast('Choose an experience before submitting a request.', 'error');
      return;
    }

    const guestCount = Math.max(1, Number(document.getElementById('booking-guests')?.value || 1));
    const booking = {
      id: `booking-${Date.now()}`,
      experienceId,
      preferredDate: document.getElementById('booking-date')?.value,
      guests: guestCount,
      contactName: document.getElementById('booking-contact-name')?.value.trim(),
      contactEmail: document.getElementById('booking-contact-email')?.value.trim(),
      notes: document.getElementById('booking-notes')?.value.trim(),
      totalPrice: experience.price * guestCount,
      status: 'request saved locally',
      createdAt: new Date().toISOString()
    };

    bookedExperiences.unshift(booking);
    writeLocalData('darbak-booked-experiences', bookedExperiences);
    if (firebaseState.user && firebaseState.db) {
      try {
        await firebaseState.db.collection('users').doc(firebaseState.user.uid).collection('bookingRequests').add({
          ...booking,
          userId: firebaseState.user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        showToast('Request saved on this device; cloud sync failed.', 'info');
      }
    }
    renderSavedTripDetails();
    showToast('Experience request added to My Trip.', 'success');
    form.reset();
    closeModal('booking-modal');
  });

  document.getElementById('auth-form')?.addEventListener('submit', handleAuthSubmit);
  document.getElementById('auth-mode-toggle')?.addEventListener('click', () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  });

  document.querySelectorAll('[data-action="save-itinerary"]').forEach(button => {
    button.addEventListener('click', async () => {
      await saveCurrentTripToFirestore();
    });
  });

  document.querySelectorAll('[data-action="booking-request"]').forEach(button => {
    button.addEventListener('click', () => {
      openBookingModal('mansaf');
      showToast('Booking request details are ready to be submitted.', 'info');
    });
  });
}
