/**
 * Darbak Jordan app entry point.
 * Feature scripts load before this file in index.html.
 */

document.addEventListener('DOMContentLoaded', async () => {
  renderWonders();
  renderExploreGrid();
  renderJordanCities();
  renderLocalGrid();
  renderTravelerStories();
  renderMapPins();
  const startDateInput = document.getElementById('trip-start-date');
  if (startDateInput) startDateInput.value = toLocalDateString(new Date());
  renderCalendar();
  updateSavedCount();
  setupNavigation();
  setupEventListeners();
  setupStoryInteractions();
  setupAccessibility();
  applySavedLanguage();
  setAuthMode('signin');
  await initializeFirebaseIntegration();
  await loadStoriesFromFirestore();
  const returnView = sessionStorage.getItem('darbak-return-view');
  if (returnView) {
    sessionStorage.removeItem('darbak-return-view');
    showView(returnView);
  }
});
