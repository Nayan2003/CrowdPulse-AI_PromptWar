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
