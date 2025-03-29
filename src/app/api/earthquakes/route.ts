import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using the correct USGS GeoJSON feed URL
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Earthquake-Monitor-App/1.0',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      console.error('USGS API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      throw new Error(`USGS API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the response structure
    if (!data || !data.type || !Array.isArray(data.features)) {
      throw new Error('Invalid data structure from USGS API');
    }

    // Log success for monitoring
    console.log('Successfully fetched earthquake data:', {
      count: data.features.length,
      metadata: data.metadata,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 