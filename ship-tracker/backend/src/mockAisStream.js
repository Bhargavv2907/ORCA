/**
 * Live AIS Stream Fallback Simulator
 * Generates realistic moving vessel traffic for testing without an AISStream API key.
 */

const vesselStore = require('./vesselStore');

// Initial fleet of realistic vessels in the English Channel / Dover Strait region
const MOCK_FLEET = [
  { mmsi: 211234000, name: 'MV PACIFIC EXPRESS', imo: 9452310, shipType: 70, lat: 50.85, lon: 1.15, sog: 18.5, cog: 65, heading: 64, navStatus: 0, destination: 'ROTTERDAM' },
  { mmsi: 235089120, name: 'MT NORDIC OCEAN', imo: 9687123, shipType: 80, lat: 50.72, lon: 0.85, sog: 12.2, cog: 245, heading: 244, navStatus: 0, destination: 'SOUTHAMPTON' },
  { mmsi: 228014500, name: 'FERRY SPIRIT OF BRITAIN', imo: 9524231, shipType: 60, lat: 51.08, lon: 1.38, sog: 21.0, cog: 110, heading: 110, navStatus: 0, destination: 'CALAIS' },
  { mmsi: 232009840, name: 'FISHING TRAWLER SEA HARVEST', imo: 0, shipType: 30, lat: 50.45, lon: -0.20, sog: 4.5, cog: 180, heading: 175, navStatus: 7, destination: 'FISHING GROUNDS' },
  { mmsi: 244710290, name: 'TUG INDOMITABLE', imo: 9312098, shipType: 52, lat: 50.92, lon: 1.35, sog: 8.0, cog: 45, heading: 45, navStatus: 0, destination: 'DOVER HARBOR' },
  { mmsi: 636018240, name: 'MSC CONSTANZA', imo: 9812456, shipType: 71, lat: 50.60, lon: 0.40, sog: 19.8, cog: 68, heading: 67, navStatus: 0, destination: 'ANTWERP' },
  { mmsi: 219018400, name: 'MAERSK MC-KINNEY MOLLER', imo: 9632064, shipType: 70, lat: 50.95, lon: 1.45, sog: 17.2, cog: 240, heading: 240, navStatus: 0, destination: 'FELIXSTOWE' },
  { mmsi: 311000850, name: 'OCEAN STAR TANKER', imo: 9751029, shipType: 81, lat: 50.35, lon: -0.65, sog: 13.5, cog: 72, heading: 72, navStatus: 0, destination: 'HAMBURG' },
  { mmsi: 235112450, name: 'CORMORANT SPEEDBOAT', imo: 0, shipType: 40, lat: 50.78, lon: 0.12, sog: 28.4, cog: 135, heading: 135, navStatus: 0, destination: 'BRIGHTON' },
  { mmsi: 227098120, name: 'JEAN BART TRAWLER', imo: 0, shipType: 30, lat: 50.68, lon: 1.55, sog: 3.8, cog: 310, heading: 305, navStatus: 7, destination: 'BOULOGNE' },
  { mmsi: 563098100, name: 'SINGAPORE STAR (CARGO)', imo: 9410298, shipType: 70, lat: 1.25, lon: 103.82, sog: 14.5, cog: 85, heading: 85, navStatus: 0, destination: 'SINGAPORE' },
  { mmsi: 564019200, name: 'MALACCA VOYAGER (TANKER)', imo: 9871029, shipType: 80, lat: 1.18, lon: 103.70, sog: 11.8, cog: 265, heading: 265, navStatus: 0, destination: 'PORT KLANG' },
  { mmsi: 565112900, name: 'HARBOR EMPRESS (PASSENGER)', imo: 9102938, shipType: 60, lat: 1.30, lon: 103.90, sog: 16.0, cog: 120, heading: 120, navStatus: 0, destination: 'BATAM' },
];

class MockAisStream {
  constructor() {
    this.intervalId = null;
    this.broadcastCallback = null;
  }

  /**
   * Start mock stream timer
   * @param {Function} onUpdateCallback - Called when vessel positions update
   */
  start(onUpdateCallback) {
    this.broadcastCallback = onUpdateCallback;

    // Load initial fleet into vesselStore
    MOCK_FLEET.forEach(vessel => {
      vesselStore.setVessel({
        ...vessel,
        lastSeen: new Date().toISOString(),
      });
    });

    console.log(`[MockAIS] Initialized mock stream with ${MOCK_FLEET.length} vessels.`);

    // Update positions every 2 seconds to simulate live movement
    this.intervalId = setInterval(() => {
      this._tick();
    }, 2000);
  }

  /**
   * Stop mock stream
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Move vessels along their course and trigger callback
   */
  _tick() {
    const updatedVessels = [];

    MOCK_FLEET.forEach(vessel => {
      const speedInDegPerSec = (vessel.sog * 0.0005) / 3600; // approximate lat/lon shift
      const cogRad = (vessel.cog * Math.PI) / 180;

      // Small movement delta
      const dLat = Math.cos(cogRad) * speedInDegPerSec * 400;
      const dLon = Math.sin(cogRad) * speedInDegPerSec * 400;

      vessel.lat = +(vessel.lat + dLat).toFixed(5);
      vessel.lon = +(vessel.lon + dLon).toFixed(5);

      // Slight course wiggle for realism
      if (Math.random() < 0.1) {
        vessel.cog = +((vessel.cog + (Math.random() * 4 - 2) + 360) % 360).toFixed(1);
        vessel.heading = Math.round(vessel.cog);
      }

      const record = {
        ...vessel,
        lastSeen: new Date().toISOString(),
      };

      vesselStore.setVessel(record);
      updatedVessels.push(record);
    });

    if (this.broadcastCallback) {
      this.broadcastCallback(updatedVessels);
    }
  }
}

module.exports = new MockAisStream();
