/**
 * Upstream AISStream.io WebSocket Client Manager
 * Handles connection, authentication, subscription payload, auto-reconnect, and message parsing.
 */

const WebSocket = require('ws');
const vesselStore = require('./vesselStore');
const mockAisStream = require('./mockAisStream');
const { DEFAULT_PRESET } = require('./presets');

const AISSTREAM_WS_URL = 'wss://stream.aisstream.io/v0/stream';

class AISStreamClient {
  constructor() {
    this.ws = null;
    this.apiKey = process.env.AISSTREAM_API_KEY || '';
    this.boundingBox = DEFAULT_PRESET.boundingBox;
    this.currentPresetId = DEFAULT_PRESET.id;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectTimer = null;
    this.onUpdateCallback = null;
    this.useMockStream = false;
  }

  /**
   * Connect to AISStream or fallback to mock stream if no API key is set
   * @param {Function} onUpdateCallback - Called with updated vessel record
   */
  connect(onUpdateCallback) {
    if (onUpdateCallback) {
      this.onUpdateCallback = onUpdateCallback;
    }

    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey === 'your_aisstream_api_key_here') {
      console.warn('⚠️ [AISStream] No valid AISSTREAM_API_KEY found in .env. Starting built-in live AIS fallback simulator...');
      this.useMockStream = true;
      mockAisStream.start((updatedFleet) => {
        if (this.onUpdateCallback) {
          this.onUpdateCallback({ type: 'BATCH_UPDATE', vessels: updatedFleet });
        }
      });
      return;
    }

    this._connectUpstream();
  }

  /**
   * Internal connection to wss://stream.aisstream.io/v0/stream
   */
  _connectUpstream() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;

    this.isConnecting = true;
    console.log(`📡 [AISStream] Connecting to ${AISSTREAM_WS_URL}...`);

    try {
      this.ws = new WebSocket(AISSTREAM_WS_URL);

      this.ws.on('open', () => {
        console.log('✅ [AISStream] Connected to upstream WebSocket successfully!');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Send subscription payload
        this._sendSubscription();
      });

      this.ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          const updatedVessel = vesselStore.processMessage(parsed);
          if (updatedVessel && this.onUpdateCallback) {
            this.onUpdateCallback({ type: 'VESSEL_UPDATE', vessel: updatedVessel });
          }
        } catch (err) {
          console.error('[AISStream] Error parsing JSON frame:', err.message);
        }
      });

      this.ws.on('error', (err) => {
        console.error('❌ [AISStream] WebSocket Error:', err.message || err);
        this.isConnected = false;
        this.isConnecting = false;
      });

      this.ws.on('close', (code, reason) => {
        console.warn(`⚠️ [AISStream] Connection closed (code: ${code}, reason: ${reason || 'unknown'}).`);
        this.isConnected = false;
        this.isConnecting = false;

        this._scheduleReconnect();
      });
    } catch (err) {
      console.error('❌ [AISStream] Failed to create WebSocket:', err.message);
      this.isConnecting = false;
      this._scheduleReconnect();
    }
  }

  /**
   * Send AISStream subscription payload
   */
  _sendSubscription() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const subscription = {
      APIKey: this.apiKey,
      BoundingBoxes: this.boundingBox,
      FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
    };

    console.log(`🌐 [AISStream] Subscribing with bounding box:`, JSON.stringify(this.boundingBox));
    this.ws.send(JSON.stringify(subscription));
  }

  /**
   * Update bounding box & re-subscribe upstream
   */
  setBoundingBox(boundingBox, presetId = 'custom') {
    this.boundingBox = boundingBox;
    this.currentPresetId = presetId;

    // Clear stale vessels for clean region transition
    vesselStore.clear();

    if (this.useMockStream) {
      console.log(`[AISStream] Updated region to preset: ${presetId}`);
      if (this.onUpdateCallback) {
        this.onUpdateCallback({ type: 'CLEAR_VESSELS' });
      }
      return;
    }

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this._sendSubscription();
    } else {
      this.connect();
    }
  }

  /**
   * Schedule exponential backoff reconnect
   */
  _scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [AISStream] Max reconnect attempts reached. Switching to mock stream simulator...');
      this.useMockStream = true;
      mockAisStream.start((updatedFleet) => {
        if (this.onUpdateCallback) {
          this.onUpdateCallback({ type: 'BATCH_UPDATE', vessels: updatedFleet });
        }
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
    console.log(`🔄 [AISStream] Reconnecting in ${(delay / 1000).toFixed(1)}s (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this._connectUpstream();
    }, delay);
  }

  /**
   * Get current client status metadata
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      useMockStream: this.useMockStream,
      currentPresetId: this.currentPresetId,
      vesselCount: vesselStore.getVesselCount(),
      hasApiKey: Boolean(this.apiKey && this.apiKey !== 'your_aisstream_api_key_here'),
    };
  }
}

module.exports = new AISStreamClient();
