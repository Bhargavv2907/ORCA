/**
 * In-Memory Vessel State Store
 * Indexes and merges live AIS Position Reports and Static Data per MMSI (UserID).
 */

class VesselStore {
  constructor() {
    this.vessels = new Map();
    this.maxVessels = 2500;
  }

  /**
   * Process incoming AISStream message
   * @param {Object} rawData - Parsed JSON message from AISStream
   */
  processMessage(rawData) {
    if (!rawData) return null;

    const messageType = rawData.MessageType;
    const metaData = rawData.MetaData || {};
    const messageObj = rawData.Message || {};

    let mmsi = metaData.MMSI || metaData.Mmsi || metaData.mmsi;

    if (messageType === 'PositionReport' && messageObj.PositionReport) {
      const pr = messageObj.PositionReport;
      mmsi = mmsi || pr.UserID || pr.Userid || pr.mmsi;
      if (!mmsi) return null;

      const existing = this.vessels.get(mmsi) || this._createDefaultRecord(mmsi);

      existing.mmsi = mmsi;
      existing.lat = pr.Latitude !== undefined ? pr.Latitude : existing.lat;
      existing.lon = pr.Longitude !== undefined ? pr.Longitude : existing.lon;
      existing.sog = pr.Sog !== undefined ? +pr.Sog.toFixed(1) : existing.sog; // Speed Over Ground (knots)
      existing.cog = pr.Cog !== undefined ? +pr.Cog.toFixed(1) : existing.cog; // Course Over Ground (degrees)
      existing.heading = pr.TrueHeading !== undefined && pr.TrueHeading !== 511 ? pr.TrueHeading : existing.cog;
      existing.navStatus = pr.NavigationalStatus !== undefined ? pr.NavigationalStatus : existing.navStatus;
      existing.lastSeen = metaData.time_utc || new Date().toISOString();

      if (metaData.ShipName && (!existing.name || existing.name === 'UNKNOWN')) {
        existing.name = metaData.ShipName.trim();
      }

      this.vessels.set(mmsi, existing);
      return existing;
    }

    if (messageType === 'ShipStaticData' && messageObj.ShipStaticData) {
      const ssd = messageObj.ShipStaticData;
      mmsi = mmsi || ssd.UserID || ssd.Userid || ssd.mmsi;
      if (!mmsi) return null;

      const existing = this.vessels.get(mmsi) || this._createDefaultRecord(mmsi);

      existing.mmsi = mmsi;
      existing.name = ssd.Name ? ssd.Name.trim() : (metaData.ShipName ? metaData.ShipName.trim() : existing.name);
      existing.imo = ssd.ImoNumber || existing.imo;
      existing.callSign = ssd.CallSign ? ssd.CallSign.trim() : existing.callSign;
      existing.shipType = ssd.Type !== undefined ? ssd.Type : existing.shipType;
      existing.destination = ssd.Destination ? ssd.Destination.trim() : existing.destination;
      existing.dimension = ssd.Dimension || existing.dimension;
      existing.lastSeen = metaData.time_utc || new Date().toISOString();

      this.vessels.set(mmsi, existing);
      return existing;
    }

    return null;
  }

  /**
   * Helper to create empty default record for a new MMSI
   */
  _createDefaultRecord(mmsi) {
    return {
      mmsi,
      name: 'UNKNOWN',
      imo: 0,
      callSign: '',
      shipType: 0,
      lat: 0,
      lon: 0,
      sog: 0,
      cog: 0,
      heading: 0,
      navStatus: 0,
      destination: '',
      lastSeen: new Date().toISOString(),
    };
  }

  /**
   * Upsert a vessel record directly (used by simulator or batch updates)
   */
  setVessel(vessel) {
    if (!vessel || !vessel.mmsi) return;
    this.vessels.set(vessel.mmsi, vessel);
  }

  /**
   * Return array of all active vessel records
   */
  getAllVessels() {
    return Array.from(this.vessels.values());
  }

  /**
   * Return count of tracked vessels
   */
  getVesselCount() {
    return this.vessels.size;
  }

  /**
   * Clear all vessels (e.g. when switching bounding box)
   */
  clear() {
    this.vessels.clear();
  }

  /**
   * Prune stale vessels older than maxAgeMinutes
   */
  pruneStale(maxAgeMinutes = 20) {
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    for (const [mmsi, v] of this.vessels.entries()) {
      const lastSeenTime = new Date(v.lastSeen).getTime();
      if (isNaN(lastSeenTime) || lastSeenTime < cutoff) {
        this.vessels.delete(mmsi);
      }
    }
  }
}

module.exports = new VesselStore();
