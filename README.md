<<<<<<< HEAD
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
=======
# CrowdPulse-AI_PromptWar

# 🏟️ CrowdPulse-AI: Smart Stadium Ecosystem

**Bridging Stadium Safety and Fan Experience through Real-Time AI Intelligence**

---

## 🌟 Brief Idea
**CrowdPulse-AI** is a comprehensive, AI-driven stadium management ecosystem designed to transform how large-scale venues operate. By integrating high-fidelity real-time monitoring for administrators with a seamless, intelligent mobile experience for fans, the project ensures safety, optimizes operations, and enhances the overall match-day experience.

The platform targets major venues like the **Wankhede Stadium**, providing a dual-sided solution:
1.  **Admin Control Room**: A "Situation Room" dashboard for real-time crowd density monitoring, gate flow optimization, and AI-predicted incident prevention.
2.  **Attendee Mobile App**: A "Match-Day Companion" for fans, offering smart seat booking, indoor navigation, wait-time analytics, and an AI assistant.

---

## 🛠️ Tech Stack & Techniques

### **Core Technologies**
-   **Frontend**: Angular 17+ (utilizing **Signals** for reactive state, **Standalone Components**, and **SCSS** for premium glassmorphism design).
-   **Backend/Real-time**: **Firebase Ecosystem**
    -   **Realtime Database (RTDB)**: Powering sub-second crowd and queue updates.
    -   **Auth**: Secure Google-authenticated logins.
    -   **Firebase Cloud Functions**: For background processing and alerting.
-   **Intelligence Layer**: **Vertex AI / Gemini API**
    -   Predicting crowd surges (e.g., halftime spikes).
    -   Intelligent chatbot companion for fans.
-   **Spatial Visualization**:
    -   **Google Maps SDK**: Satellite views with custom Heatmap layers.
    -   **SVG Mapping**: High-performance, interactive stadium vector maps.

### **Techniques**
-   **Real-time Simulation**: A custom `SimulatorService` that mimics live attendee movement, gate flow rates, and food stall queues.
-   **Spatial Heatmapping**: Dynamic color computation based on zone occupancy percentage (0–100%).
-   **Indoor Positioning Logic**: Mapping coordinates within the stadium structure for AI-guided navigation.

---

## ⚙️ How it Works

1.  **Live Ingestion**: Data from IoT sensors (gates, stands, stalls) is streamed directly to the **Firebase Realtime Database**.
2.  **AI Analysis**: The system monitors for "Red Zones" where occupancy exceeds safety thresholds (e.g., >80%).
3.  **Admin Intervention**: Administrators receive real-time alerts and can trigger manual gate diversions or staff reallocations via the **Admin Dashboard**.
4.  **Fan Engagement**: Fans use the **User App** to see live crowd levels, choose the least crowded gates for entry, order food with minimal wait times, and get AI-guided directions to their seats.

---

## 🚀 Problems Solved

| Problem | CrowdPulse-AI Solution |
| :--- | :--- |
| **Crowd Crushes & Safety** | Real-time occupancy heatmaps and automated "Red Zone" alerts prevent over-saturation in specific stands. |
| **Gate Congestion** | Live wait-time tracking at every gate allows the system to suggest alternate, less crowded entry points. |
| **Inefficient F&B Queues** | Queue analytics at food stalls minimize wait times and hunger frustrations during halftime. |
| **Navigation Confusion** | AI-powered indoor navigation guides fans from the gate directly to their specific block, row, and seat. |
| **Disconnected Experience** | An integrated AI Assistant keeps fans informed about stadium services, emergency exits, and match updates. |

---

## 🏗️ Architectural Layout (Wankhede Model)

The project leverages a geographically accurate model of the Wankhede Stadium:
-   **7 Major Stands**: Sachin Tendulkar Pavilion, North Stand, Sunil Gavaskar Pavilion, Divecha Stand, MCA Pavilion, Grand Stand, and Vijay Merchant Pavilion.
-   **8 Integrated Gates**: Strategically mapped to real-world access points (Marine Drive, Eastern Railways, Chowk).
-   **IoT-Ready Architecture**: Every component (stand, gate, food stall) is a live node in the Firebase environment.

---

> [!NOTE]
> **CrowdPulse-AI** is designed to be highly scalable, allowing it to be adapted to any global stadium or large-scale event venue simply by updating the spatial JSON configuration.
>>>>>>> ce97f3f792b91d8e19dfe83b4c0ca8102a0fdd97
