import { NextResponse } from 'next/server';
import { Earthquake } from '@/lib/types';
import { cleanLocation } from '@/lib/utils';

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    sig: number;
    tsunami: number;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

interface USGSResponse {
  features: USGSFeature[];
}

export async function GET() {
  try {
    // Fetch earthquake data from USGS API
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch earthquake data');
    }

    const data: USGSResponse = await response.json();
    console.log('Total earthquakes fetched:', data.features.length);

    // Transform and filter the earthquake data
    const earthquakes = data.features
      .map((feature: USGSFeature) => {
        const { mag, place, time, sig, tsunami, felt, cdi, mmi, alert } = feature.properties;
        const [longitude, latitude, depth] = feature.geometry.coordinates;
        const { city, country } = cleanLocation(place);

        const earthquake: Earthquake = {
          id: feature.id,
          magnitude: mag,
          location: `${city}, ${country}`,
          city,
          country,
          time: time.toString(),
          coordinates: [longitude, latitude, depth],
          depth,
          significance: sig || 0,
          tsunami: tsunami === 1,
          felt: felt || null,
          cdi: cdi || null,
          mmi: mmi || null,
          alert: alert || null
        };

        return earthquake;
      })
      .filter((earthquake: Earthquake) => {
        // Log each earthquake's properties for debugging
        console.log('Earthquake:', {
          magnitude: earthquake.magnitude,
          significance: earthquake.significance,
          location: earthquake.location,
          felt: earthquake.felt
        });

        // Less strict filtering criteria
        return (
          earthquake.magnitude >= 2.0 || // Lower magnitude threshold
          earthquake.significance >= 30 || // Lower significance threshold
          earthquake.tsunami ||
          earthquake.alert ||
          (earthquake.felt && earthquake.felt > 50) // Lower felt threshold
        );
      })
      .sort((a: Earthquake, b: Earthquake) => {
        // Sort by significance first, then by time
        if (b.significance !== a.significance) {
          return b.significance - a.significance;
        }
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      });

    console.log('Filtered earthquakes:', earthquakes.length);
    return NextResponse.json(earthquakes);
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
} 