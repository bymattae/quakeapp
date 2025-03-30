'use client';

import { useState } from 'react';
import { Earthquake } from '@/lib/types';
import { format } from 'date-fns';
import EarthquakeDetail from './EarthquakeDetail';

interface EarthquakeTableProps {
  earthquakes: Earthquake[];
}

export default function EarthquakeTable({ earthquakes }: EarthquakeTableProps) {
  const [sortField, setSortField] = useState<'magnitude' | 'time'>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);

  const formatLocation = (location: string): { city: string; direction?: string } => {
    // Remove "of" and split the location
    const parts = location.replace(' of ', '|').split('|');
    if (parts.length === 2) {
      return {
        city: parts[1].trim(),
        direction: parts[0].trim()
      };
    }
    return { city: location };
  };

  const handleSort = (field: 'magnitude' | 'time') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEarthquakes = [...earthquakes].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'magnitude') {
      return (a.magnitude - b.magnitude) * modifier;
    } else {
      return (new Date(a.time).getTime() - new Date(b.time).getTime()) * modifier;
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-lg">
        <div className="bg-gray-50 rounded-t-xl">
          <div className="grid grid-cols-5 px-6 py-3">
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Severity
            </div>
            <div 
              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('magnitude')}
            >
              Magnitude
              {sortField === 'magnitude' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </div>
            <div 
              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('time')}
            >
              Date & Time
              {sortField === 'time' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Depth
            </div>
          </div>
        </div>
        <div className="bg-white divide-y divide-gray-200">
          {sortedEarthquakes.map((earthquake) => {
            const location = formatLocation(earthquake.location);
            const date = new Date(earthquake.time);
            return (
              <div 
                key={earthquake.id}
                onClick={() => setSelectedEarthquake(earthquake)}
                className="grid grid-cols-5 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${earthquake.magnitude >= 7.0 ? 'bg-red-100 text-red-800' :
                      earthquake.magnitude >= 6.0 ? 'bg-orange-100 text-orange-800' :
                      earthquake.magnitude >= 5.0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}
                  >
                    {earthquake.magnitude >= 7.0 ? 'SEVERE' :
                     earthquake.magnitude >= 6.0 ? 'HIGH' :
                     earthquake.magnitude >= 5.0 ? 'MEDIUM' : 'LOW'}
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {earthquake.magnitude.toFixed(1)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {location.city}
                  </div>
                  {location.direction && (
                    <div className="text-xs text-gray-500">
                      {location.direction}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {format(date, 'dd MMM').toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(date, 'h:mm a')} (UTC)
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {earthquake.depth.toFixed(1)} km
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEarthquake && (
        <EarthquakeDetail
          earthquake={selectedEarthquake}
          onClose={() => setSelectedEarthquake(null)}
        />
      )}
    </div>
  );
} 