'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Earthquake } from '@/lib/types';

interface EarthquakeCardProps {
  earthquake: Earthquake;
  onClick: () => void;
}

export default function EarthquakeCard({ earthquake, onClick }: EarthquakeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getSeverityColor = (magnitude: number): string => {
    if (magnitude >= 7.0) return 'from-red-400 to-red-600';
    if (magnitude >= 6.0) return 'from-orange-400 to-orange-600';
    if (magnitude >= 5.0) return 'from-yellow-400 to-yellow-600';
    return 'from-green-400 to-green-600';
  };

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
      className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getSeverityColor(earthquake.magnitude)} opacity-10`} />
      
      <div className="relative p-6 bg-white/90 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 font-space-grotesk">{location.city}</h3>
            {location.direction && (
              <p className="text-sm text-gray-500">{location.direction}</p>
            )}
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${earthquake.magnitude >= 7.0 ? 'bg-red-100 text-red-800' :
              earthquake.magnitude >= 6.0 ? 'bg-orange-100 text-orange-800' :
              earthquake.magnitude >= 5.0 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'}`}
          >
            {getSeverityLabel(earthquake.magnitude)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <div className="text-3xl font-bold text-gray-900 font-space-grotesk">
                {earthquake.magnitude.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Magnitude</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {earthquake.depth.toFixed(1)} km
              </div>
              <div className="text-sm text-gray-500">Depth</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {format(date, 'HH:mm')}
            </div>
            <div className="text-sm text-gray-500">
              {format(date, 'dd MMM yyyy')}
            </div>
          </div>
        </div>

        {/* Hover effect */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
        />

        {/* Quick stats */}
        {earthquake.affectedCountries && earthquake.affectedCountries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              {earthquake.affectedCountries.map(country => (
                <div
                  key={country.code}
                  className={`px-2 py-1 rounded-full text-xs font-medium
                    ${country.impact === 'High' ? 'bg-red-100 text-red-800' :
                      country.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}
                >
                  {country.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 