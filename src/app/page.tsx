'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import EarthquakeList from '@/components/EarthquakeList';
import EarthquakeDetail from '@/components/EarthquakeDetail';
import { Earthquake } from '@/lib/types';

const tabs = [
  { id: 'feed', label: 'Recent', icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )},
  { id: 'map', label: 'Map', icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )},
  { id: 'stats', label: 'Stats', icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )}
];

const severityOptions = [
  { id: 'all', label: 'All', color: 'bg-gray-500' },
  { id: 'minor', label: '< 5.0', color: 'bg-green-500' },
  { id: 'moderate', label: '5.0-5.9', color: 'bg-yellow-500' },
  { id: 'strong', label: '6.0-6.9', color: 'bg-orange-500' },
  { id: 'major', label: '7.0+', color: 'bg-red-500' },
];

const timeRangeOptions = [
  { id: '1d', label: 'Last 24h' },
  { id: '3d', label: 'Last 3 days' },
  { id: '7d', label: 'Last week' },
  { id: 'custom', label: 'Custom' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    const end = new Date();
    let start = new Date();

    switch (range) {
      case '1d':
        start = subDays(end, 1);
        break;
      case '3d':
        start = subDays(end, 3);
        break;
      case '7d':
        start = subDays(end, 7);
        break;
      case 'custom':
        // Don't update the date range when switching to custom
        return;
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setSelectedTimeRange('custom');
    setDateRange(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <header className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">Earthquake Monitor</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600">{format(new Date(), 'EEEE, MMMM d')}</p>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-4 overflow-hidden"
            >
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Magnitude</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {severityOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedSeverity(option.id)}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${selectedSeverity === option.id 
                          ? `${option.color} text-white` 
                          : 'bg-white/50 text-gray-600 hover:bg-white/70'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Time Range</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {timeRangeOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleTimeRangeChange(option.id)}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${selectedTimeRange === option.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/50 text-gray-600 hover:bg-white/70'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <AnimatePresence>
                {selectedTimeRange === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        max={dateRange.end}
                        className="w-full px-3 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        min={dateRange.start}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[calc(100vh-16rem)]"
          >
            {activeTab === 'feed' && (
              <EarthquakeList 
                onSelect={setSelectedEarthquake}
                severity={selectedSeverity}
                dateRange={dateRange}
              />
            )}
            {activeTab === 'map' && <div>Map View Coming Soon</div>}
            {activeTab === 'stats' && <div>Statistics Coming Soon</div>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex justify-around">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all
                  ${activeTab === tab.id 
                    ? 'text-blue-600 scale-105 transform' 
                    : 'text-gray-600 hover:text-blue-600'}`}
              >
                {tab.icon}
                <span className="text-xs mt-1">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-auto rounded-t-2xl bg-white"
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
    </div>
  );
}
