// ============================================================
// JalSaathi — IMD Status API Route
// GET /api/imd/status
// ============================================================

import { NextResponse } from 'next/server';
import { getIMDStatus, hasIMDApiKey } from '@/services/marine/imd';

export async function GET() {
  const status = getIMDStatus();

  return NextResponse.json({
    service: 'India Meteorological Department (IMD)',
    website: 'https://mausam.imd.gov.in',
    ...status,
    marineEndpoints: {
      portWarnings: 'Active port-specific weather warnings for Indian ports',
      seaBulletins: 'Open-sea area forecasts (wind, weather, visibility, sea condition)',
      coastalBulletins: 'Coastal weather & sea state forecasts',
      fishermenWarnings: 'Official IMD warnings issued for fishermen safety',
      cycloneTrack: 'Active cyclone position tracking & forecast trajectory',
      cycloneWind: 'Cyclone wind speed warnings & radii',
      cycloneCOU: 'Cone of uncertainty for forecast track',
    },
    weatherEndpoints: {
      currentWeather: 'Real-time station observations (temp, wind, pressure, humidity)',
      cityForecast: '7-day city forecast with coordinates',
      awsData: 'Automatic Weather Station real-time data',
      districtWarnings: '5-day severe weather warnings by district',
    },
    setupInstructions: !hasIMDApiKey() ? {
      step1: 'Register at https://api.imd.gov.in/public/index.php',
      step2: 'Complete IP whitelisting for your server IP',
      step3: 'Add IMD_API_KEY=your_key to .env.local',
      step4: 'Restart the JalSaathi dev server',
      note: 'All IMD APIs are free but require registration and IP whitelisting.',
    } : undefined,
  });
}
