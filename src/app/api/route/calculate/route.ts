import { NextRequest, NextResponse } from 'next/server';
import { planSafeRoutes, RouteMode } from '@/lib/maritime/routePlanner';
import { getAISVessels } from '@/lib/maritime/aisService';
import { getMarineConditions } from '@/services/marine/unified';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const start = body.start || { lat: 18.95, lon: 72.82 };
    const destination = body.destination || { lat: 19.12, lon: 72.48 };
    const selectedMode: RouteMode = body.mode || 'BALANCED';

    const [aisStream, marineConditions] = await Promise.all([
      getAISVessels({ lat: start.lat, lon: start.lon }),
      getMarineConditions(start.lat, start.lon),
    ]);

    const telemetry = {
      waveHeightMeters: marineConditions.waves.height,
      windSpeedKmph: marineConditions.weather.windSpeed,
      oceanCurrentKnots: marineConditions.ocean.currentSpeed,
      oceanCurrentDir: marineConditions.ocean.currentDirection,
      sstCelsius: marineConditions.ocean.sst,
    };

    const plan = planSafeRoutes(start, destination, aisStream.vessels, selectedMode, telemetry);

    return NextResponse.json({
      success: true,
      data: {
        aisSource: aisStream.source,
        isDemonstrationMode: aisStream.isDemonstrationMode,
        marineConditions,
        plan,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to compute safe navigation route' },
      { status: 500 }
    );
  }
}
