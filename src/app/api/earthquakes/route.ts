import { NextResponse } from 'next/server';
import { Earthquake, USGSFeature } from '@/lib/types';

interface USGSResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: USGSFeature[];
}

export async function GET() {
  try {
    console.log('Fetching earthquake data...');
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch earthquake data');
    }

    const data: USGSResponse = await response.json();
    console.log('Successfully fetched earthquake data:', {
      count: data.features.length,
      metadata: data.metadata
    });

    // Transform and filter the earthquake data
    const earthquakes: Earthquake[] = data.features
      .map(feature => ({
        id: feature.id,
        magnitude: feature.properties.mag,
        location: feature.properties.place,
        time: new Date(feature.properties.time).toISOString(),
        coordinates: feature.geometry.coordinates,
        depth: feature.geometry.coordinates[2],
        significance: feature.properties.sig,
        tsunami: feature.properties.tsunami > 0,
        felt: feature.properties.felt,
        cdi: feature.properties.cdi, // Community Intensity
        mmi: feature.properties.mmi, // Modified Mercalli Intensity
        alert: feature.properties.alert,
      }))
      .filter(quake => {
        // Filter criteria for significant events:
        // 1. Magnitude >= 2.5 (removes micro-earthquakes)
        // 2. Significance >= 50 (USGS significance rating)
        // 3. Or has tsunami warning
        // 4. Or has alert level
        // 5. Or was felt by people
        return (
          quake.magnitude >= 2.5 &&
          (quake.significance >= 50 ||
           quake.tsunami ||
           quake.alert ||
           (quake.felt && quake.felt > 10))
        );
      })
      .sort((a, b) => {
        // Sort by significance and then by time
        if (b.significance !== a.significance) {
          return b.significance - a.significance;
        }
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      });

    return NextResponse.json(earthquakes);
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
} 