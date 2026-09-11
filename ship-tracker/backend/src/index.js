/**
 * Node.js + Express + WebSocket Proxy Server
 * Connects to AISStream.io and broadcasts live vessel updates to browser clients.
 */

require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const vesselStore = require('./vesselStore');
const aisStreamClient = require('./aisStreamClient');
const { BOUNDING_BOX_PRESETS, DEFAULT_PRESET } = require('./presets');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// Express HTTP Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    serverTime: new Date().toISOString(),
    proxyStatus: aisStreamClient.getStatus(),
  });
});

app.get('/api/vessels', (req, res) => {
  res.json({
    success: true,
    total: vesselStore.getVesselCount(),
    status: aisStreamClient.getStatus(),
    vessels: vesselStore.getAllVessels(),
  });
});

app.get('/api/presets', (req, res) => {
  res.json({
    success: true,
    presets: Object.values(BOUNDING_BOX_PRESETS),
    defaultPreset: DEFAULT_PRESET,
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket Server for Browser Clients
const wss = new WebSocket.Server({ server, path: '/ws' });

// Track connected browser clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`🔌 [Proxy WS] Browser client connected (Total clients: ${clients.size})`);

  // Send initial snapshot state to newly connected client
  const status = aisStreamClient.getStatus();
  ws.send(
    JSON.stringify({
      type: 'INIT_STATE',
      status,
      vessels: vesselStore.getAllVessels(),
      preset: BOUNDING_BOX_PRESETS[status.currentPresetId] || DEFAULT_PRESET,
    })
  );

  // Handle messages from browser client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'SET_BOUNDING_BOX' && data.bbox) {
        console.log(`🔄 [Proxy WS] Client requested region swap to preset: ${data.presetId || 'custom'}`);
        aisStreamClient.setBoundingBox(data.bbox, data.presetId || 'custom');

        // Broadcast region change event to all clients
        broadcast({
          type: 'REGION_CHANGED',
          presetId: data.presetId || 'custom',
          bbox: data.bbox,
          status: aisStreamClient.getStatus(),
          vessels: vesselStore.getAllVessels(),
        });
      }

      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (err) {
      console.error('[Proxy WS] Error processing client message:', err.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`🔌 [Proxy WS] Browser client disconnected (Remaining clients: ${clients.size})`);
  });

  ws.on('error', (err) => {
    console.error('[Proxy WS] Client WebSocket error:', err.message);
  });
});

/**
 * Broadcast JSON payload to all connected browser WebSocket clients
 */
function broadcast(payload) {
  const jsonStr = JSON.stringify(payload);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  }
}

// Start upstream AISStream client
aisStreamClient.connect((event) => {
  if (event.type === 'VESSEL_UPDATE' && event.vessel) {
    broadcast({
      type: 'VESSEL_UPDATE',
      vessel: event.vessel,
      totalVessels: vesselStore.getVesselCount(),
      status: aisStreamClient.getStatus(),
    });
  } else if (event.type === 'BATCH_UPDATE' && event.vessels) {
    broadcast({
      type: 'BATCH_UPDATE',
      vessels: event.vessels,
      totalVessels: vesselStore.getVesselCount(),
      status: aisStreamClient.getStatus(),
    });
  } else if (event.type === 'CLEAR_VESSELS') {
    broadcast({
      type: 'CLEAR_VESSELS',
      totalVessels: 0,
      status: aisStreamClient.getStatus(),
    });
  }
});

// Periodic cleanup of stale vessels every 5 minutes
setInterval(() => {
  vesselStore.pruneStale(30);
}, 5 * 60 * 1000);

// Launch HTTP & WebSocket server
server.listen(PORT, () => {
  console.log(`
🚀 ============================================================
🚢 Live AIS Ship Tracker Proxy Server Running
============================================================
📡 HTTP Health Endpoint  : http://localhost:${PORT}/health
📡 HTTP Vessels API      : http://localhost:${PORT}/api/vessels
🔌 Browser WebSocket     : ws://localhost:${PORT}/ws
============================================================
  `);
});
