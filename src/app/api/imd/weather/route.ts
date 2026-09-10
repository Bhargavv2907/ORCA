// ============================================================
// JalSaathi — IMD Current Weather & Forecast API Route
// GET /api/imd/weather?stationId=43003  (Mumbai)
// GET /api/imd/weather?lat=18.95&lon=72.82
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { fetchCurrentWeather, fetchCityForecast, fetchAWSData, getIMDStatus } from '@/services/marine/imd';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const stationId = params.get('stationId') || undefined;

  try {
    const status = getIMDStatus();

    if (!status.hasApiKey) {
      return NextResponse.json({
        error: 'IMD API key not configured',
        registrationUrl: status.registrationUrl,
        setupInstructions: {
          step1: 'Register at https://api.imd.gov.in/public/index.php',
          step2: 'Complete IP whitelisting for your server',
          step3: 'Add IMD_API_KEY=your_key to .env.local',
          step4: 'Restart the JalSaathi dev server',
          note: 'IMD APIs are free but require registration and IP whitelisting.',
        },
      }, { status: 200 });
    }

    const [currentWeather, forecast, awsData] = await Promise.all([
      fetchCurrentWeather(stationId),
      fetchCityForecast(stationId),
      fetchAWSData(stationId),
    ]);

    return NextResponse.json({
      stationId: stationId || 'all',
      currentWeather,
      forecast,
      awsData,
      source: 'India Meteorological Department',
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch IMD weather data',
      message: String(error),
    }, { status: 500 });
  }
}
