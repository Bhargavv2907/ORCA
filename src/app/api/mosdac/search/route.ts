// ============================================================
// ORCA — MOSDAC Search API Route
// Proxies search requests to MOSDAC catalog (no auth required)
// GET /api/mosdac/search?datasetId=...&startTime=...&endTime=...
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { searchMosdacCatalog, MOSDAC_DATASETS, type MosdacSearchConfig } from '@/services/marine/mosdac';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const datasetId = params.get('datasetId');

  if (!datasetId) {
    return NextResponse.json({
      error: 'datasetId is required',
      availableDatasets: MOSDAC_DATASETS,
      hint: 'Use one of the dataset IDs listed in availableDatasets, or browse https://mosdac.gov.in/catalog-app/satellite',
    }, { status: 400 });
  }

  const config: MosdacSearchConfig = {
    datasetId,
    startTime: params.get('startTime') || undefined,
    endTime: params.get('endTime') || undefined,
    count: params.get('count') ? parseInt(params.get('count')!) : undefined,
    boundingBox: params.get('boundingBox') || undefined,
    gId: params.get('gId') || undefined,
  };

  try {
    const result = await searchMosdacCatalog(config);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: 'MOSDAC search failed',
      message: String(error),
    }, { status: 500 });
  }
}
