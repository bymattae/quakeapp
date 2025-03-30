'use client';

import { useEffect, useState } from 'react';
import { Earthquake } from '@/lib/types';
import EarthquakeCard from './EarthquakeCard';
import EarthquakeDetail from './EarthquakeDetail';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';

interface EarthquakeListProps {
  onSelect?: (earthquake: Earthquake | null) => void;
  severity?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export default function EarthquakeList({ onSelect, severity = 'all', dateRange }: EarthquakeListProps) {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);

  const fetchEarthquakes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/earthquakes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch earthquake data');
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setEarthquakes(data);
        setError(null);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid earthquake data format');
      }
    } catch (err) {
      console.error('Error fetching earthquakes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load earthquake data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getMagnitudeRange = (severityLevel: string): [number, number] => {
    switch (severityLevel) {
      case 'minor':
        return [0, 4.9];
      case 'moderate':
        return [5.0, 5.9];
      case 'strong':
        return [6.0, 6.9];
      case 'major':
        return [7.0, Infinity];
      default:
        return [0, Infinity];
    }
  };

  const getSeverityColor = (magnitude: number): string => {
    if (magnitude >= 7.0) return 'bg-red-500';
    if (magnitude >= 6.0) return 'bg-orange-500';
    if (magnitude >= 5.0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertColor = (alert: string | null): string => {
    switch (alert) {
      case 'red':
        return 'text-red-600';
      case 'orange':
        return 'text-orange-500';
      case 'yellow':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  const isInDateRange = (time: string): boolean => {
    if (!dateRange?.start && !dateRange?.end) return true;
    
    const quakeDate = new Date(time);
    const start = dateRange.start ? startOfDay(parseISO(dateRange.start)) : new Date(0);
    const end = dateRange.end ? endOfDay(parseISO(dateRange.end)) : new Date();

    return isWithinInterval(quakeDate, { start, end });
  };

  const filteredEarthquakes = earthquakes.filter(quake => {
    // Apply severity filter
    if (severity !== 'all') {
      const [min, max] = getMagnitudeRange(severity);
      if (quake.magnitude < min || quake.magnitude > max) {
        return false;
      }
    }

    // Apply date range filter
    return isInDateRange(quake.time);
  });

  // Sort earthquakes by significance and time
  const sortedEarthquakes = [...filteredEarthquakes].sort((a, b) => {
    if (b.significance !== a.significance) {
      return b.significance - a.significance;
    }
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white/50 backdrop-blur-sm rounded-2xl h-24 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (sortedEarthquakes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 14h.01M12 16h.01M12 18h.01M12 20h.01M12 22h.01" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No earthquakes found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 pb-24">
        {sortedEarthquakes.map((earthquake, index) => (
          <motion.div
            key={earthquake.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect?.(earthquake)}
            className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl ${getSeverityColor(earthquake.magnitude)} flex items-center justify-center text-white font-semibold`}>
                  {earthquake.magnitude.toFixed(1)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{earthquake.location}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(earthquake.time), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Earthquake Detail Modal */}
      <AnimatePresence>
        {selectedEarthquake && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSelectedEarthquake(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="container mx-auto px-4 py-8 h-full overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <EarthquakeDetail
                earthquake={selectedEarthquake}
                onClose={() => setSelectedEarthquake(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 