import { Earthquake, EarthquakeResponse } from './types';

export const getSeverity = (magnitude: number): 'minor' | 'moderate' | 'severe' => {
  if (magnitude >= 6.0) return 'severe';
  if (magnitude >= 4.0) return 'moderate';
  return 'minor';
};

export const getSeverityColor = (severity: 'minor' | 'moderate' | 'severe'): string => {
  switch (severity) {
    case 'severe':
      return 'bg-red-500';
    case 'moderate':
      return 'bg-yellow-500';
    case 'minor':
      return 'bg-green-500';
  }
};

export const getSeverityEmoji = (severity: 'minor' | 'moderate' | 'severe'): string => {
  switch (severity) {
    case 'severe':
      return '🔴';
    case 'moderate':
      return '🟡';
    case 'minor':
      return '🟢';
  }
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const transformUSGSData = (data: EarthquakeResponse): Earthquake[] => {
  return data.features.map(feature => {
    const { mag, place, time } = feature.properties;
    const [longitude, latitude, depth] = feature.geometry.coordinates;
    
    return {
      id: feature.id,
      magnitude: mag,
      location: place,
      time: formatDate(time),
      coordinates: [latitude, longitude],
      depth,
      severity: getSeverity(mag),
    };
  });
}; 