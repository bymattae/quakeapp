import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.0_week.geojson',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Earthquake-Monitor-App/1.0',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
} 