/**
 * Browser WebSocket Service for Ship Tracker Backend Proxy
 * Auto-reconnects and dispatches vessel updates to subscriber callbacks.
 */

class ShipTrackerWebSocket {
  constructor() {
    this.ws = null;
    this.url = 'ws://localhost:4000/ws';
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20;
    this.heartbeatTimer = null;
  }

  /**
   * Connect to backend WebSocket proxy
   */
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;

    this.isConnecting = true;
    this._notifyStatus({ state: 'CONNECTING', text: 'Connecting to WebSocket proxy...' });

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('✅ [Client WS] Connected to backend WebSocket proxy!');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        this._notifyStatus({ state: 'CONNECTED', text: 'Connected to Live AIS Stream' });
        this._startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this._notifyListeners(payload);
        } catch (err) {
          console.error('[Client WS] JSON parse error:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[Client WS] WebSocket error:', err);
        this.isConnected = false;
        this.isConnecting = false;
        this._notifyStatus({ state: 'ERROR', text: 'Connection Error' });
      };

      this.ws.onclose = () => {
        console.warn('⚠️ [Client WS] Proxy WebSocket connection closed.');
        this.isConnected = false;
        this.isConnecting = false;
        this._stopHeartbeat();
        this._notifyStatus({ state: 'DISCONNECTED', text: 'Reconnecting...' });
        this._scheduleReconnect();
      };
    } catch (err) {
      console.error('[Client WS] Connection setup failed:', err);
      this.isConnecting = false;
      this._scheduleReconnect();
    }
  }

  /**
   * Send control message to backend proxy (e.g. region swap)
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Request backend to switch bounding box region preset
   */
  setBoundingBox(bbox, presetId) {
    this.send({
      type: 'SET_BOUNDING_BOX',
      bbox,
      presetId,
    });
  }

  /**
   * Subscribe to incoming message frames
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to connection status changes
   */
  subscribeStatus(callback) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  _notifyListeners(payload) {
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error('[Client WS] Listener error:', err);
      }
    }
  }

  _notifyStatus(statusObj) {
    for (const listener of this.statusListeners) {
      try {
        listener(statusObj);
      } catch (err) {
        console.error('[Client WS] Status listener error:', err);
      }
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this._notifyStatus({ state: 'FAILED', text: 'Proxy Offline' });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(10000, 1000 * Math.pow(1.5, this.reconnectAttempts));
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'PING' });
    }, 25000);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export const shipTrackerWs = new ShipTrackerWebSocket();
