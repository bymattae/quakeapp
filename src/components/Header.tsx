'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface HeaderProps {
  onFilterChange: (filters: {
    severity: string[];
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

export default function Header({ onFilterChange }: HeaderProps) {
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const severityOptions = [
    { label: 'LOW', color: 'from-green-400 to-green-600' },
    { label: 'MEDIUM', color: 'from-yellow-400 to-yellow-600' },
    { label: 'HIGH', color: 'from-orange-400 to-orange-600' },
    { label: 'VERY HIGH', color: 'from-red-400 to-red-600' }
  ];

  const handleSeverityToggle = (severity: string) => {
    setSelectedSeverities(prev => {
      const newSelection = prev.includes(severity)
        ? prev.filter(s => s !== severity)
        : [...prev, severity];
      
      onFilterChange({
        severity: newSelection,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      return newSelection;
    });
  };

  const handleDateChange = (type: 'start' | 'end', date: Date | null) => {
    setDateRange(prev => {
      const newRange = {
        ...prev,
        [type]: date
      };
      
      onFilterChange({
        severity: selectedSeverities,
        startDate: newRange.start,
        endDate: newRange.end
      });
      
      return newRange;
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      {/* Content */}
      <div className="relative px-4 py-6 text-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold font-space-grotesk tracking-tight"
            >
              Earthquake Monitor
            </motion.h1>
            <p className="text-sm opacity-90 mt-1">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
          </div>
          
          <div className="flex space-x-2">
            {['Recent', 'M ≥ 5', 'Felt'].map((label) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium backdrop-blur-sm
                  transition-all duration-200 ease-in-out border border-white/20 shadow-lg"
              >
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {severityOptions.map(({ label, color }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSeverityToggle(label)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                  shadow-lg border backdrop-blur-sm
                  ${selectedSeverities.includes(label)
                    ? `bg-gradient-to-r ${color} border-transparent text-white`
                    : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                  }`}
              >
                {label}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-4">
            <input
              type="date"
              onChange={(e) => handleDateChange('start', e.target.value ? new Date(e.target.value) : null)}
              className="px-4 py-2 rounded-full bg-white/10 text-sm backdrop-blur-sm
                border border-white/20 hover:bg-white/20 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
              type="date"
              onChange={(e) => handleDateChange('end', e.target.value ? new Date(e.target.value) : null)}
              className="px-4 py-2 rounded-full bg-white/10 text-sm backdrop-blur-sm
                border border-white/20 hover:bg-white/20 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 