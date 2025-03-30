'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Earthquake } from '@/lib/types';
import { getSeverityColor, getSeverityEmoji, getCountryFlag } from '@/lib/utils';

interface EarthquakeCardProps {
  earthquake: Earthquake;
  onClick: () => void;
}

export default function EarthquakeCard({ earthquake, onClick }: EarthquakeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const severityColor = getSeverityColor(earthquake.severity || 'minor');
  const severityEmoji = getSeverityEmoji(earthquake.severity || 'minor');
  const countryFlag = getCountryFlag(earthquake.country);

  const getSeverityLabel = (magnitude: number): string => {
    if (magnitude >= 7.0) return 'VERY HIGH';
    if (magnitude >= 6.0) return 'HIGH';
    if (magnitude >= 5.0) return 'MEDIUM';
    return 'LOW';
  };

  const formatLocation = (location: string): { city: string; direction?: string } => {
    const parts = location.replace(' of ', '|').split('|');
    if (parts.length === 2) {
      return {
        city: parts[1].trim(),
        direction: parts[0].trim()
      };
    }
    return { city: location };
  };

  const location = formatLocation(earthquake.location);
  const date = new Date(earthquake.time);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{severityEmoji}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {location.city}, {earthquake.country} {countryFlag}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityColor}`}>
            {earthquake.magnitude.toFixed(1)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          {new Date(earthquake.time).toLocaleString()}
        </p>

        {earthquake.analysis?.affectedCities && earthquake.analysis.affectedCities.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cities Affected:</h4>
            <div className="flex flex-wrap gap-2">
              {earthquake.analysis.affectedCities.map((city, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    city.impact === 'High' ? 'bg-red-100 text-red-800' :
                    city.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}
                >
                  {city.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 