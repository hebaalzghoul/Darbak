function isFirebaseAvailable() {
  return !!(window.darbakFirebase && window.darbakFirebase.auth && window.darbakFirebase.db);
}

function getFriendlyErrorMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
  if (!error || !error.code) return fallbackMessage;

  const messageMap = {
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
    'auth/requires-recent-login': 'Please sign in again to continue.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.'
  };

  return messageMap[error.code] || fallbackMessage;
}

function requireAuth(actionLabel = 'this action') {
  if (!firebaseState.user) {
    openAuthModal();
    showToast(`Please sign in to ${actionLabel}.`, 'info');
    return false;
  }
  return true;
}

function updateAuthHeaderUI() {
  const headerButton = document.getElementById('btn-login-header');
  if (!headerButton) return;

  if (firebaseState.loadingAuth) {
    headerButton.textContent = 'Checking...';
    headerButton.disabled = true;
    return;
  }

  headerButton.disabled = false;
  if (firebaseState.user) {
    const displayName = firebaseState.user.displayName || firebaseState.user.email?.split('@')[0] || 'Traveler';
    headerButton.textContent = `Sign Out · ${displayName}`;
    headerButton.title = `Signed in as ${displayName}`;
    return;
  }

  headerButton.textContent = 'Login';
  headerButton.title = 'Login to save places and trips';
}

async function initializeFirebaseIntegration() {
  firebaseState.ready = isFirebaseAvailable();
  firebaseState.auth = firebaseState.ready ? window.darbakFirebase.auth : null;
  firebaseState.db = firebaseState.ready ? window.darbakFirebase.db : null;
  firebaseState.storage = firebaseState.ready ? window.darbakFirebase.storage : null;
  firebaseState.loadingAuth = true;
  updateAuthHeaderUI();

  if (!firebaseState.ready) {
    firebaseState.loadingAuth = false;
    updateAuthHeaderUI();
    return;
  }

  firebaseState.auth.onAuthStateChanged(async (user) => {
    firebaseState.user = user;
    firebaseState.loadingAuth = false;
    updateAuthHeaderUI();

    if (user) {
      await ensureUserDocument(user);
      await loadUserData(user.uid);
      await loadStoriesFromFirestore();
    } else {
      // User logged out — clear account-specific data

      savedPlaces = [];
      favoritePlaces = new Set();

      savedExperiences = new Set();
      favoriteExperiences = new Set();

      currentUserTrips = [];
      currentTripPlan = null;

      bookedExperiences = [];

      // Clear planning/calendar data
      scheduledPlaces = {};

      // Clear account-specific local storage
      localStorage.removeItem('darbak-saved-places');
      localStorage.removeItem('darbak-saved-experiences');
      localStorage.removeItem('darbak-booked-experiences');
      localStorage.removeItem('darbak-trip-plans');
      localStorage.removeItem('darbak-scheduled-places');

      updateSavedCount();
      renderWonders();
      renderExploreGrid();
      renderLocalGrid();
      renderCalendar();
      renderSavedList();
      renderSavedTripDetails();

      await loadStoriesFromFirestore();
    }
  }
  );
}

async function ensureUserDocument(user) {
  if (!firebaseState.db || !user) return;

  const userRef = firebaseState.db.collection('users').doc(user.uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    const profile = {
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Jordan Traveler',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await userRef.set(profile, { merge: true });
  } else if (user.email && (!doc.data().email || doc.data().email !== user.email)) {
    await userRef.update({ email: user.email });
  }
}

async function loadUserData(uid) {
  if (!firebaseState.db || !uid) return;

  const userRef = firebaseState.db.collection('users').doc(uid);
  const [savedPlacesSnap, favoritesSnap, savedExperiencesSnap, favoriteExperiencesSnap, tripsSnap] = await Promise.all([
    userRef.collection('savedPlaces').get(),
    userRef.collection('favorites').get(),
    userRef.collection('savedExperiences').get(),
    userRef.collection('favoriteExperiences').get(),
    userRef.collection('trips').orderBy('updatedAt', 'desc').limit(10).get()
  ]);

  savedPlaces = savedPlacesSnap.docs.map(doc => doc.id);
  favoritePlaces = new Set(favoritesSnap.docs.map(doc => doc.id));
  savedExperiences = new Set(savedExperiencesSnap.docs.map(doc => doc.id));
  favoriteExperiences = new Set(favoriteExperiencesSnap.docs.map(doc => doc.id));
  currentUserTrips = tripsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (currentUserTrips.length) {
    savedTripPlans = currentUserTrips;
    currentTripPlan = currentUserTrips[0];
    if (currentTripPlan.startDate) {
      selectedCalendarDate = currentTripPlan.startDate;
      calendarViewDate = new Date(`${selectedCalendarDate}T12:00:00`);
      const startDateInput = document.getElementById('trip-start-date');
      if (startDateInput) startDateInput.value = selectedCalendarDate;
    }
    currentUserTrips.forEach(trip => {
      if (!trip.startDate || !Array.isArray(trip.itinerary)) return;
      const startDate = new Date(`${trip.startDate}T12:00:00`);
      if (Number.isNaN(startDate.getTime())) return;
      trip.itinerary.forEach((entry, index) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + index);
        const dateKey = toLocalDateString(date);
        scheduledPlaces[dateKey] ||= [];
        if (!scheduledPlaces[dateKey].includes(entry.placeId)) scheduledPlaces[dateKey].push(entry.placeId);
      });
    });
    writeLocalData('darbak-trip-plans', savedTripPlans);
    writeLocalData('darbak-scheduled-places', scheduledPlaces);
  }

  updateSavedCount();
  renderWonders();
  renderExploreGrid();
  renderLocalGrid();
  renderCalendar();
  renderSavedList();
  updateActivePinCard();
}

async function savePlaceToFirestore(placeId) {
  if (!requireAuth('save this destination')) return false;

  try {
    const placeDoc = firebaseState.db.collection('users').doc(firebaseState.user.uid).collection('savedPlaces').doc(placeId);
    await placeDoc.set({
      placeId,
      savedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    await loadUserData(firebaseState.user.uid);
    return true;
  } catch (error) {
    showToast(getFriendlyErrorMessage(error, 'Unable to save this destination right now.'), 'error');
    return false;
  }
}

async function removePlaceFromFirestore(placeId) {
  if (!requireAuth('remove this destination')) return false;

  try {
    await firebaseState.db.collection('users').doc(firebaseState.user.uid).collection('savedPlaces').doc(placeId).delete();
    await loadUserData(firebaseState.user.uid);
    return true;
  } catch (error) {
    showToast(getFriendlyErrorMessage(error, 'Unable to remove this destination right now.'), 'error');
    return false;
  }
}

async function toggleFavoriteInFirestore(placeId) {
  if (!requireAuth('save this favorite')) return false;

  try {
    const favoriteRef = firebaseState.db.collection('users').doc(firebaseState.user.uid).collection('favorites').doc(placeId);
    if (favoritePlaces.has(placeId)) {
      await favoriteRef.delete();
      favoritePlaces.delete(placeId);
      showToast('Favorite removed.', 'info');
    } else {
      await favoriteRef.set({
        placeId,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      favoritePlaces.add(placeId);
      showToast('Favorite saved to your account.', 'success');
    }
    renderExploreGrid();
    updateActivePinCard();
    return true;
  } catch (error) {
    showToast(getFriendlyErrorMessage(error, 'Unable to update this favorite right now.'), 'error');
    return false;
  }
}

async function toggleExperienceInFirestore(experienceId, collectionKey) {
  if (!requireAuth('save this experience')) return false;
  const isSaved = collectionKey === 'savedExperiences' ? savedExperiences.has(experienceId) : favoriteExperiences.has(experienceId);

  try {
    const targetCollection = collectionKey === 'savedExperiences' ? 'savedExperiences' : 'favoriteExperiences';
    const targetRef = firebaseState.db.collection('users').doc(firebaseState.user.uid).collection(targetCollection).doc(experienceId);
    if (isSaved) {
      await targetRef.delete();
      if (collectionKey === 'savedExperiences') savedExperiences.delete(experienceId); else favoriteExperiences.delete(experienceId);
      showToast('Experience removed from your saved list.', 'info');
    } else {
      await targetRef.set({
        experienceId,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      if (collectionKey === 'savedExperiences') savedExperiences.add(experienceId); else favoriteExperiences.add(experienceId);
      showToast('Experience saved to your account.', 'success');
    }
    renderLocalGrid();
    return true;
  } catch (error) {
    showToast(getFriendlyErrorMessage(error, 'Unable to update this experience right now.'), 'error');
    return false;
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!firebaseState.auth) {
    showToast('Firebase is not configured yet. Paste your Firebase config into firebase-config.js.', 'info');
    return;
  }

  const form = event.currentTarget;
  const fullNameInput = document.getElementById('auth-name');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const displayName = (fullNameInput?.value || '').trim();

  if (!email || !password) {
    showToast('Please enter both your email and password.', 'error');
    return;
  }

  const submitButton = document.getElementById('auth-submit-btn');
  submitButton.disabled = true;
  submitButton.textContent = authMode === 'signin' ? 'Signing In...' : 'Creating Account...';

  try {
    if (authMode === 'signup') {
      if (!displayName) {
        showToast('Please enter your full name to create an account.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
        return;
      }
      const userCredential = await firebaseState.auth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName });
      showToast('Account created. Welcome to Darbak!', 'success');
    } else {
      await firebaseState.auth.signInWithEmailAndPassword(email, password);
      showToast('Signed in successfully.', 'success');
    }
    form.reset();
    closeModal('auth-modal');

    if (pendingGenerateTrip) {
      pendingGenerateTrip = false;

      setTimeout(() => {
        generateItinerary();
      }, 300);
    }
  } catch (error) {
    showToast(getFriendlyErrorMessage(error, 'Unable to complete authentication right now.'), 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = authMode === 'signin' ? 'Sign In' : 'Create Account';
  }
}

function setAuthMode(mode) {
  authMode = mode;
  const nameInput = document.getElementById('auth-name');
  const modalTitle = document.getElementById('auth-modal-title');
  const submitButton = document.getElementById('auth-submit-btn');
  const toggleButton = document.getElementById('auth-mode-toggle');

  if (nameInput) {
    nameInput.style.display = mode === 'signup' ? 'block' : 'none';
    nameInput.required = mode === 'signup';
  }

  if (modalTitle) modalTitle.textContent = mode === 'signup' ? 'Create Your Darbak Account' : 'Sign In to Darbak';
  if (submitButton) submitButton.textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
  if (toggleButton) {
    toggleButton.textContent = mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Create one';
  }
}
async function saveCurrentTripToFirestore() {
  if (!requireAuth('save your trip')) return false;

  if (!currentTripPlan) {
    showToast('Generate an itinerary before saving it.', 'info');
    return false;
  }

  const savedPlan = { ...currentTripPlan, id: currentTripPlan.id || `trip-${Date.now()}` };
  savedTripPlans = [savedPlan, ...savedTripPlans.filter(plan => plan.id !== savedPlan.id)].slice(0, 10);
  currentTripPlan = savedPlan;
  writeLocalData('darbak-trip-plans', savedTripPlans);
  renderSavedTripDetails();

  if (firebaseState.user && firebaseState.db) {
    try {
      const tripRef = firebaseState.db.collection('users').doc(firebaseState.user.uid).collection('trips').doc(savedPlan.id);
      await tripRef.set({
        duration: savedPlan.duration,
        interests: savedPlan.interests,
        destinations: savedPlan.destinations,
        travelerType: savedPlan.travelerType,
        budget: savedPlan.budget,
        estimatedCost: savedPlan.estimatedCost,
        itinerary: savedPlan.itinerary,
        startDate: savedPlan.startDate || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      showToast('Itinerary saved on this device; cloud sync failed.', 'info');
      return true;
    }
  }
  showToast('Itinerary saved to My Trip.', 'success');
  return true;
}

