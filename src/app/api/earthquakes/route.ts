import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch last 24 hours of earthquakes with magnitude >= 4.0
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.0_day.geojson'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch earthquake data');
    }

    const data = await response.json();
    
    // Transform the data to include simplified explanations
    const earthquakes = data.features.map((quake: any) => {
      const magnitude = quake.properties.mag;
      const location = quake.properties.place;
      const time = new Date(quake.properties.time).toLocaleString();
      
      // Generate a simplified explanation based on magnitude
      let explanation = '';
      if (magnitude >= 7.0) {
        explanation = 'This is a major earthquake that can cause severe damage to buildings and infrastructure. People may feel strong shaking and should follow emergency procedures.';
      } else if (magnitude >= 6.0) {
        explanation = 'This is a strong earthquake that can cause moderate damage. People may feel strong shaking and should be prepared for aftershocks.';
      } else if (magnitude >= 5.0) {
        explanation = 'This is a moderate earthquake that can cause light damage. Most people will feel shaking, but significant damage is unlikely.';
      } else {
        explanation = 'This is a light earthquake that may be felt by people but typically causes no damage.';
      }

      return {
        id: quake.id,
        magnitude,
        location,
        time,
        explanation,
        coordinates: quake.geometry.coordinates,
      };
    });

    return NextResponse.json({ earthquakes });
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
} 