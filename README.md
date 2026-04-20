# CrowdPulse-AI 🏟

**AI-powered smart stadium management — Angular 17 + Full Google Firebase**

Built for large-scale sporting venues to solve crowd movement, queue wait times, and real-time coordination.

---

## Google Tech Stack (Hackathon Compliant ✅)

| Layer | Technology |
|---|---|
| Frontend Framework | **Angular 17** (Google's web framework) |
| Real-time Database | **Firebase Realtime Database** (live data streaming) |
| Authentication | **Firebase Authentication** (email/password) |
| Hosting | **Firebase Hosting** (CDN deployment) |
| Analytics | **Firebase Analytics** |
| Maps & Heatmap | **Google Maps Platform** + `visualization.HeatmapLayer` |
| AI Alerts | Simulated **Vertex AI**-style predictions via RTDB |

---

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/           ← Firebase Auth login
│   │   ├── dashboard/       ← Shell with sidebar + router-outlet
│   │   ├── heatmap/         ← SVG + Google Maps heatmap (Overview)
│   │   ├── gates/           ← Live gate wait times
│   │   ├── food/            ← F&B queue analytics
│   │   └── alerts/          ← Firebase-pushed AI alert log
│   ├── services/
│   │   ├── firebase.service.ts   ← ALL Firebase RTDB + Auth operations
│   │   ├── simulator.service.ts  ← Angular service pushing mutations to Firebase
│   │   └── auth.guard.ts         ← Route guard using Firebase Auth
│   ├── models/
│   │   └── stadium.models.ts     ← TypeScript interfaces
│   ├── app.config.ts        ← Angular 17 standalone bootstrap + AngularFire providers
│   └── app.routes.ts        ← Lazy-loaded routes with auth guard
├── environments/
│   ├── environment.ts       ← Dev config (Firebase + Maps keys)
│   └── environment.prod.ts  ← Prod config
└── simulator/
    └── seed-firebase.mjs    ← Node.js script: seeds + pushes live data to Firebase
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Google Maps API key
Open `src/environments/environment.ts` and replace:
```ts
googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
```
Get a key at: https://console.cloud.google.com → APIs & Services → Maps JavaScript API

### 3. Create Firebase Admin user
- Go to https://console.firebase.google.com → crowdpulse-ai-f3de5
- Authentication → Users → Add user
- Use that email + password to log in

### 4. Start the Angular dev server
```bash
npm start
# Opens at http://localhost:4200
```

### 5. Start the Firebase data simulator (separate terminal)
```bash
npm run seed
# Pushes live gate/stand/food data to Firebase every 4–6 seconds
```

---

## Firebase Hosting Deployment

```bash
# 1. Build production bundle
npm run build:prod

# 2. Install Firebase CLI (if not already)
npm install -g firebase-tools

# 3. Login to Firebase
firebase login

# 4. Deploy to Firebase Hosting
firebase deploy

# Your app will be live at:
# https://crowdpulse-ai-f3de5.web.app
```

---

## Firebase RTDB Structure

```
crowdpulse-ai-f3de5-rtdb/
├── gates/
│   ├── gate3/  { label, location, lat, lng, waitMinutes, flowRate, status, diverted }
│   └── ...
├── stands/
│   ├── north/  { name, sections, occupancy, capacity, present, svgId }
│   └── ...
├── foodStalls/
│   ├── burgerPoint/ { name, zone, queueLength, waitMinutes, status }
│   └── ...
├── alerts/
│   └── <push_id>/ { title, body, severity, timestamp }
└── snapshot/
    { totalAttendance, occupancyPct, busiestStand, busiestPct, activeAlerts, lastUpdated }
```

---

## How Firebase is Used (100% — no fallback to local simulation)

| Feature | Firebase Service Used |
|---|---|
| Login / logout | Firebase Authentication |
| Gate live data | RTDB `onValue()` listener |
| Stand occupancy | RTDB `onValue()` listener |
| Food queue data | RTDB `onValue()` listener |
| Alert log | RTDB `push()` + `onValue()` with `orderByChild` + `limitToLast(50)` |
| Stadium snapshot | RTDB `set()` + `onValue()` |
| Simulator writes | RTDB `set()` from `SimulatorService` (Angular) + `seed-firebase.mjs` (Node) |
| Hosting | Firebase Hosting with SPA rewrite rule |
| Perf monitoring | Firebase Analytics |

> The app **requires** Firebase — there is no local fallback by design.
