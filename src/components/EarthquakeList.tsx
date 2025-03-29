'use client';

import { useEffect, useState } from 'react';
import { Earthquake } from '@/lib/types';
import { transformUSGSData } from '@/lib/utils';
import EarthquakeCard from './EarthquakeCard';

export default function EarthquakeList() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarthquakes = async () => {
    try {
      setLoading(true);
      // Fetch earthquakes from the last 7 days with magnitude >= 4.0
      const response = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.0_week.geojson'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch earthquake data');
      }

      const data = await response.json();
      const transformedData = transformUSGSData(data);
      setEarthquakes(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching earthquakes:', err);
      setError('Failed to load earthquake data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakes();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchEarthquakes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {earthquakes.length === 0 ? (
        <p className="text-center text-gray-500">No recent earthquakes found.</p>
      ) : (
        earthquakes.map((earthquake) => (
          <EarthquakeCard key={earthquake.id} earthquake={earthquake} />
        ))
      )}
    </div>
  );
} 