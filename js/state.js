function readLocalData(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeLocalData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast('This change could not be saved in this browser.', 'error');
    return false;
  }
}

let travelerStories = [...DEFAULT_TRAVELER_STORIES];
let storyEngagement = readLocalData('darbak-story-engagement', {});
let activeStoryId = null;
let storyPhotoDataUrl = '';

let currentLanguage = 'en';
let activeView = 'home';
const DEFAULT_SAVED_PLACES = ['petra', 'wadi-rum', 'dead-sea'];
let savedPlaces = readLocalData('darbak-saved-places', [...DEFAULT_SAVED_PLACES]);
let scheduledPlaces = readLocalData('darbak-scheduled-places', {});
let favoritePlaces = new Set();
let selectedCalendarDate = toLocalDateString(new Date());
let calendarViewDate = new Date(`${selectedCalendarDate}T12:00:00`);
let activeMapPinId = 'petra';
let jordanMap = null;
let jordanMapMarkers = null;
let jordanTileLayer = null;
let mapCategory = 'all';
let mapSearch = '';
let mapFilterMode = 'all';
let visitorCoordinates = null;
let exploreCategory = 'all';
let exploreSearch = '';
let exploreVisibleCount = 6;
let dismissedExplorePlaces = new Set();
let itineraryDays = 5;
let itineraryInterests = new Set();
let itineraryTravelerType = '';
let itineraryBudget = 'balanced';
let itineraryEditMode = false;
let savedExperiences = new Set(readLocalData('darbak-saved-experiences', []));
let favoriteExperiences = new Set();
let lastFocusedElement = null;
let translationRetryTimer = null;
let currentUserTrips = [];
let authMode = 'signin';
let pendingGenerateTrip = false;
let bookedExperiences = readLocalData('darbak-booked-experiences', []);
let savedTripPlans = readLocalData('darbak-trip-plans', []);
let currentTripPlan = savedTripPlans[0] || null;

const firebaseState = {
  auth: null,
  db: null,
  storage: null,
  user: null,
  loadingAuth: true,
  ready: false
};


function toLocalDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
