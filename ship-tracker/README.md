# 🚢 Live Ship Tracker — AISStream.io & MapLibre GL JS

A full-screen interactive web application that tracks live ship positions worldwide using the **AISStream.io** real-time WebSocket API and renders high-performance vector maps with **MapLibre GL JS** and **OpenFreeMap** (free vector map tiles with zero API key required).

![Live Ship Tracker Architecture](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20MapLibre%20GL-06b6d4)
![Backend Proxy](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20ws-3b82f6)
![AIS Feed](https://img.shields.io/badge/Stream-AISStream.io%20WebSocket-10b981)

---

## 🌟 Key Features

1. **Full-Screen MapLibre GL JS Canvas**:
   - Uses **OpenFreeMap** (`https://tiles.openfreemap.org/styles/bright`) vector tile source — 100% free and keyless.
   - Smooth GeoJSON marker updates with dynamic ship heading/course vector rotation.
   - Distinct color coding by vessel category (Cargo, Tanker, Passenger, Fishing, Tug, High-Speed Craft, Other).

2. **Backend WebSocket Proxy (`Node.js` + `ws`)**:
   - Prevents browser WebSocket upgrade failures by maintaining a persistent connection to `wss://stream.aisstream.io/v0/stream`.
   - Merges `PositionReport` and `ShipStaticData` messages per MMSI into a unified in-memory store.
   - Automatically falls back to a live AIS simulation stream when no API key is provided, allowing instant out-of-the-box testing.

3. **Vessel Inspection Side Panel**:
   - Inspect any ship on click to view Name, MMSI, IMO, Call Sign, Vessel Type, Speed (SOG knots), Course (COG °), Heading (°), Navigational Status (*"Underway using engine"*, *"At anchor"*, *"Moored"*, *"Engaged in fishing"*), Destination, and Relative Last Seen time.

4. **Live Search & Vessel Classification Filters**:
   - Search ships by **Name**, **MMSI**, or **IMO** with instant map fly-to navigation.
   - Filter vessels by category chips (*All, Cargo, Tankers, Passenger, Fishing, Tugs*).

5. **Configurable Bounding Box Region Selector**:
   - Quick-select maritime region presets:
     - 🇬🇧 **English Channel & Dover Strait**
     - 🇸🇬 **Singapore Strait & Malacca**
     - 🇪🇸 **Strait of Gibraltar**
     - 🇺🇸 **US East Coast / NY Harbor**
     - 🇯🇵 **Tokyo Bay**
     - 🌐 **Full Worldwide Globe**
   - Custom coordinate inputs to dynamically re-subscribe to any lat/lon bounding box.

6. **Automatic Reconnection Engine**:
   - Auto-reconnects on WebSocket drops for both upstream AISStream and browser-to-backend connections.

---

## 📁 Repository Structure

```
ship-tracker/
├── README.md                           # This quickstart guide
├── package.json                        # Root helper launcher
├── backend/
│   ├── .env                            # Contains AISSTREAM_API_KEY and PORT
│   ├── .env.example                    # Template environment file
│   ├── package.json                    # Backend dependencies
│   └── src/
│       ├── index.js                    # Express HTTP + WebSocket proxy server
│       ├── aisStreamClient.js          # AISStream.io upstream WS manager
│       ├── vesselStore.js               # Per-MMSI in-memory state manager
│       ├── mockAisStream.js            # Live AIS simulation fallback stream
│       └── presets.js                  # Bounding box presets
└── frontend/
    ├── package.json                    # Frontend dependencies
    ├── vite.config.js                  # Vite server configuration
    ├── index.html                      # HTML entry point with MapLibre CSS
    └── src/
        ├── App.jsx                     # Root application component
        ├── components/
        │   ├── Map.jsx                 # MapLibre GL JS interactive vector canvas
        │   ├── VesselSidePanel.jsx    # Vessel spec inspector side panel
        │   ├── SearchFilterBar.jsx    # Live search & category filter tabs
        │   ├── BboxControlModal.jsx    # Bounding box region selector modal
        │   ├── StatusHeader.jsx        # Status header & region badge
        │   └── VesselMarkerSvg.jsx     # Rotating SVG ship marker component
        ├── services/
        │   └── websocket.js            # Client WebSocket connection manager
        └── utils/
            ├── presets.js              # Region bounding box presets
            ├── vesselTypes.js          # AIS ship type classification & colors
            └── formatters.js           # Speed, course, and coordinate formatters
```

---

## 🚀 Quick Start & Run Instructions

### 1. Get a Free AISStream API Key
1. Sign up for a free account at [https://aisstream.io](https://aisstream.io).
2. Copy your API key from the dashboard.

### 2. Configure Backend `.env`
Open `ship-tracker/backend/.env` and paste your API key:
```env
AISSTREAM_API_KEY=your_actual_aisstream_api_key_here
PORT=4000
```
*(Note: If you leave `AISSTREAM_API_KEY` blank, the app will automatically start the built-in live AIS simulator so you can test immediately!)*

### 3. Start the Backend WebSocket Proxy Server
```bash
cd ship-tracker/backend
npm install
npm run dev
```
The proxy server will start listening at:
- **HTTP Health Check**: `http://localhost:4000/health`
- **HTTP Vessels API**: `http://localhost:4000/api/vessels`
- **WebSocket Endpoint**: `ws://localhost:4000/ws`

### 4. Start the Frontend React + Vite Dev Server
Open a new terminal window:
```bash
cd ship-tracker/frontend
npm install
npm run dev
```
Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing Features
1. **Live Map & Markers**: Watch ship markers move and update live on the map.
2. **Click Marker**: Click any ship to view its full details in the sliding side panel.
3. **Search & Filter**: Type a vessel name (e.g. *"PACIFIC"*) or MMSI in the top search bar to auto-center on the ship. Click a category button (*Cargo, Tanker, Fishing*) to filter map markers.
4. **Switch Bounding Box Region**: Click the region selector button in the top status bar to swap between the English Channel, Singapore Strait, Straits of Gibraltar, Tokyo Bay, or enter custom Lat/Lon coordinates.
