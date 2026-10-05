# Darbak Jordan | دربك الأردن

Darbak is a single-page Jordan travel-planning site built with HTML, CSS, and browser JavaScript. It has no build step, package manager, or project-specific install requirements.

## Project Structure

```text
Darbak/
├── index.html
├── style.css
├── app.js                 # DOM-ready application bootstrap
├── firebase-config.js     # Firebase web configuration
├── firestore.rules
├── js/
│   ├── data.js            # Places, cities, experiences, and sample stories
│   ├── state.js           # Shared state and local-storage helpers
│   ├── ui.js              # Shared UI, dialogs, language, and accessibility
│   ├── firebase.js        # Authentication and Firestore integration
│   ├── stories.js         # Traveler story rendering and interactions
│   ├── navigation.js      # Views, destination browsing, and search
│   ├── itinerary.js       # Trip generation and editing
│   ├── experiences.js     # Local experience actions
│   ├── map.js             # JMap and city details
│   ├── calendar.js        # Saved trips, bookings, and calendar
│   └── events.js          # Page event wiring
├── assets/
└── README.md
```

## Script Loading

`index.html` loads the Firebase compatibility SDKs and configuration, then Leaflet, followed by the local scripts in dependency order: data, state, UI, Firebase, stories, navigation, itinerary, experiences, map, calendar, events, and finally `app.js`. These are classic scripts, so their top-level declarations share the browser's global scope; keep this order explicit when adding or moving scripts. `app.js` registers the `DOMContentLoaded` bootstrap after all feature functions are available.

Firebase and Leaflet are loaded from their hosted CDNs. The site itself requires no compilation or dependency installation; map tiles and Firebase-backed features need an internet connection, and Firebase authentication needs a configured Firebase project and an allowed local web origin.

## Run Locally

The simplest option in VS Code is the Live Server extension:

1. Open this folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.
3. Use the local URL opened by the extension, usually `http://127.0.0.1:5500`.

Alternatively, from this folder run `python -m http.server 8000`, then open `http://localhost:8000`. No build command is required. Serving over localhost is recommended because browser security restrictions can limit authentication and notification features when opening `index.html` directly as a `file://` URL.

## Firebase Setup

The Firebase compat SDK scripts load before `firebase-config.js`. Add the web app configuration values from the Firebase console to that file, and configure the Firebase Authentication authorized domains for the local host you use. Review `firestore.rules` before deploying changes to a Firebase project.

## Main Features

- Browse destinations, search and filter places, and save trip stops.
- Explore Jordan on JMap and view city details.
- Generate and edit a multi-day itinerary, then schedule it on the trip calendar.
- Browse and request local experiences.
- Publish and read traveler stories.
- Switch English/Arabic and configure accessibility options.
