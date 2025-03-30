'use client';

import { useState, useEffect } from 'react';
import { Earthquake, EarthquakeAnalysis } from '@/lib/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface EarthquakeDetailProps {
  earthquake: Earthquake;
  onClose: () => void;
}

interface DetailStats {
  label: string;
  value: string | number;
  color?: string;
  description?: string;
}

export default function EarthquakeDetail({ earthquake, onClose }: EarthquakeDetailProps) {
  const [analysis, setAnalysis] = useState<EarthquakeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feltCount, setFeltCount] = useState(0);
  const [hasFelt, setHasFelt] = useState(false);
  const [showFeltAnimation, setShowFeltAnimation] = useState(false);

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
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${earthquake.coordinates[0]-0.5}%2C${earthquake.coordinates[1]-0.5}%2C${earthquake.coordinates[0]+0.5}%2C${earthquake.coordinates[1]+0.5}&layer=mapnik&marker=${earthquake.coordinates[1]}%2C${earthquake.coordinates[0]}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${earthquake.coordinates[1]}&mlon=${earthquake.coordinates[0]}&zoom=8`;

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/earthquake-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ earthquake }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [earthquake]);

  const handleFeltClick = () => {
    if (!hasFelt) {
      setFeltCount(prev => prev + 1);
      setHasFelt(true);
      setShowFeltAnimation(true);
      setTimeout(() => setShowFeltAnimation(false), 1000);
    }
  };

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

  const stats: DetailStats[] = [
    {
      label: 'Magnitude',
      value: earthquake.magnitude.toFixed(1),
      color: 'text-blue-600',
      description: 'Richter scale measurement of earthquake intensity',
    },
    {
      label: 'Severity',
      value: getSeverityLabel(earthquake.magnitude),
      color: getSeverityColor(earthquake.magnitude),
    },
    {
      label: 'Depth',
      value: `${earthquake.depth.toFixed(1)} km`,
      description: 'Distance below Earth\'s surface',
    },
    {
      label: 'Time',
      value: format(new Date(earthquake.time), 'PPpp'),
    },
    {
      label: 'Coordinates',
      value: `${earthquake.coordinates[0].toFixed(4)}, ${earthquake.coordinates[1].toFixed(4)}`,
      description: 'Latitude, Longitude',
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {/* Header */}
      <div className={`relative p-6 bg-gradient-to-br ${getSeverityColor(earthquake.magnitude)} text-white`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold font-space-grotesk">{location.city}</h2>
            {location.direction && (
              <p className="text-white/80">{location.direction}</p>
            )}
          </div>
          <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            {getSeverityLabel(earthquake.magnitude)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-4xl font-bold font-space-grotesk">
              {earthquake.magnitude.toFixed(1)}
            </div>
            <div className="text-white/80">Magnitude</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">
              {earthquake.depth.toFixed(1)} km
            </div>
            <div className="text-white/80">Depth</div>
          </div>
          <div>
            <div className="text-xl font-medium">
              {format(date, 'HH:mm')}
            </div>
            <div className="text-white/80">
              {format(date, 'dd MMM yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Map */}
        <div className="bg-gray-50 rounded-xl overflow-hidden">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={mapUrl}
            ></iframe>
          </div>
          <div className="p-4 border-t border-gray-100">
            <a 
              href={openStreetMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <span>View Larger Map</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis</h3>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* How it happened */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-4"
              >
                <h3 className="text-gray-900 font-medium mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How did this happen?
                </h3>
                <p className="text-gray-700">{analysis.cause}</p>
              </motion.div>

              {/* Affected Areas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 rounded-xl p-4"
              >
                <h3 className="text-gray-900 font-medium mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Affected Areas
                </h3>
                <p className="text-gray-700">{analysis.affectedAreas}</p>
              </motion.div>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 rounded-xl p-4"
              >
                <h3 className="text-gray-900 font-medium mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  More Details
                </h3>
                <p className="text-gray-700">{analysis.details}</p>
              </motion.div>

              {/* Affected Countries */}
              {analysis.affectedCountries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <h3 className="text-gray-900 font-medium mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Countries Affected
                  </h3>
                  <div className="space-y-2">
                    {analysis.affectedCountries.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                      >
                        <span className="font-medium text-gray-900">{country.name}</span>
                        <span className="text-sm text-gray-600">{country.impact}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Affected Cities */}
              {analysis.affectedCities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <h3 className="text-gray-900 font-medium mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Cities Affected
                  </h3>
                  <div className="space-y-2">
                    {analysis.affectedCities.map((city, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                      >
                        <span className="font-medium text-gray-900">{city.name}</span>
                        <span className="text-sm text-gray-600">{city.impact}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
} 