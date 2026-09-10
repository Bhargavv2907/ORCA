// ============================================================
// JalSaathi — MOSDAC Status API Route
// Returns connection status, available datasets, and auth state
// GET /api/mosdac/status
// ============================================================

import { NextResponse } from 'next/server';
import { getMosdacStatus, MOSDAC_DATASETS } from '@/services/marine/mosdac';

export async function GET() {
  const status = getMosdacStatus();

  return NextResponse.json({
    service: 'ISRO MOSDAC — Meteorological and Oceanographic Satellite Data Archival Centre',
    website: 'https://www.mosdac.gov.in',
    catalogBrowser: 'https://mosdac.gov.in/catalog-app/satellite',
    signUp: 'https://mosdac.gov.in/signup/',
    apiManual: 'https://www.mosdac.gov.in/downloadapi-manual',
    ...status,
    datasets: Object.entries(MOSDAC_DATASETS).map(([key, id]) => ({
      key,
      datasetId: id,
      description: getDatasetDescription(key),
    })),
    setupInstructions: !status.hasCredentials ? {
      step1: 'Create an account at https://mosdac.gov.in/signup/',
      step2: 'Add MOSDAC_USERNAME and MOSDAC_PASSWORD to your .env.local file',
      step3: 'Restart the JalSaathi dev server',
      note: 'Search works without credentials. Download/real-time data requires authentication.',
    } : undefined,
  });
}

function getDatasetDescription(key: string): string {
  switch (key) {
    case 'SST': return 'INSAT-3D Imager Sea Surface Temperature Level 2B';
    case 'WIND': return 'EOS-06 (Oceansat-3) Scatterometer Ocean Wind Vectors Level 2B';
    case 'CHLOROPHYLL': return 'EOS-06 Ocean Colour Monitor Chlorophyll/Aerosol Level 2C';
    case 'OLR': return 'INSAT-3D Outgoing Longwave Radiation Level 2B';
    case 'IMAGER_L1B': return 'INSAT-3D Imager Level 1B Standard';
    default: return key;
  }
}
