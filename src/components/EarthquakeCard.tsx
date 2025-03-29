'use client';

import { useState } from 'react';
import { Earthquake } from '@/lib/types';
import { getSeverityColor, getSeverityEmoji } from '@/lib/utils';
import { useCompletion } from 'ai/react';

interface EarthquakeCardProps {
  earthquake: Earthquake;
}

export default function EarthquakeCard({ earthquake }: EarthquakeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/earthquake-analysis',
  });

  const handleAnalyze = async () => {
    if (!isExpanded || completion) return;
    await complete(JSON.stringify({ earthquake }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${getSeverityColor(earthquake.severity)}`} />
          <span>{getSeverityEmoji(earthquake.severity)}</span>
          <h3 className="text-lg font-semibold">
            Magnitude {earthquake.magnitude.toFixed(1)}
          </h3>
        </div>
        <span className="text-sm text-gray-500">{earthquake.time}</span>
      </div>
      
      <p className="text-gray-700 mb-2">{earthquake.location}</p>
      
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          handleAnalyze();
        }}
        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
      >
        {isExpanded ? 'Show Less' : 'Analyze Impact'}
      </button>

      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500" />
              <span className="text-gray-600">Analyzing...</span>
            </div>
          ) : completion ? (
            <div className="prose prose-sm">
              <p className="text-gray-700 whitespace-pre-wrap">{completion}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 