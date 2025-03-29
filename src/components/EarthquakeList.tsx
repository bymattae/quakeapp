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
      // Use our proxy API endpoint instead of calling USGS directly
      const response = await fetch('/api/earthquakes');
      
      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(`Failed to fetch earthquake data: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || !data.features) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid earthquake data format');
      }

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
        <button 
          onClick={fetchEarthquakes}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
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