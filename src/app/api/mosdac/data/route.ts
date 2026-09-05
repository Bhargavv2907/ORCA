// ============================================================
// ORCA — MOSDAC Real-Time Satellite Data API Route
// Fetches SST, Winds, Chlorophyll from MOSDAC for a location
// GET /api/mosdac/data?lat=18.95&lon=72.82
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { fetchMosdacSatelliteData, getMosdacStatus } from '@/services/marine/mosdac';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get('lat') || '18.95');
  const lon = parseFloat(params.get('lon') || '72.82');

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({
      error: 'Invalid coordinates',
      hint: 'Provide lat and lon as numeric query parameters',
    }, { status: 400 });
  }

  // Parse which products to fetch
  const productsParam = params.get('products');
  const products: ('sst' | 'winds' | 'chlorophyll')[] = productsParam
    ? productsParam.split(',').filter(p => ['sst', 'winds', 'chlorophyll'].includes(p)) as ('sst' | 'winds' | 'chlorophyll')[]
    : ['sst', 'winds', 'chlorophyll'];

  try {
    const data = await fetchMosdacSatelliteData(lat, lon, products);
    const status = getMosdacStatus();

    return NextResponse.json({
      coordinates: { lat, lon },
      products: products,
      data,
      mosdacStatus: {
        searchAvailable: status.searchAvailable,
        downloadAvailable: status.downloadAvailable,
        isAuthenticated: status.isAuthenticated,
        datasets: status.datasets,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch MOSDAC satellite data',
      message: String(error),
    }, { status: 500 });
  }
}
