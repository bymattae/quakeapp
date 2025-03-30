import { Earthquake, EarthquakeResponse } from './types';

export const getSeverityLevel = (magnitude: number): 'minor' | 'moderate' | 'severe' => {
  if (magnitude >= 7.0) return 'severe';
  if (magnitude >= 5.5) return 'moderate';
  return 'minor';
};

export const getSeverityColor = (severity: 'minor' | 'moderate' | 'severe'): string => {
  switch (severity) {
    case 'severe':
      return 'bg-red-100 text-red-800';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-green-100 text-green-800';
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

export const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const cleanLocation = (location: string): { city: string; country: string } => {
  // Remove any extra information after the first comma
  const parts = location.split(',');
  if (parts.length >= 2) {
    const city = parts[0].trim();
    const country = parts[1].trim();
    return { city, country };
  }
  return { city: location, country: 'Unknown' };
};

export const transformUSGSData = (data: EarthquakeResponse): Earthquake[] => {
  return data.features.map(feature => {
    const { 
      mag, 
      place, 
      time, 
      sig, 
      tsunami, 
      felt, 
      cdi, 
      mmi, 
      alert 
    } = feature.properties;
    
    const [longitude, latitude, depth] = feature.geometry.coordinates;
    const { city, country } = cleanLocation(place);
    
    return {
      id: feature.id,
      magnitude: mag,
      location: `${city}, ${country}`,
      city,
      country,
      time: time.toString(),
      coordinates: [longitude, latitude, depth],
      depth,
      severity: getSeverityLevel(mag),
      significance: sig || 0,
      tsunami: tsunami === 1,
      felt: felt || null,
      cdi: cdi || null,
      mmi: mmi || null,
      alert: alert || null
    };
  });
};

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Function to determine impact based on magnitude and distance
function determineImpact(magnitude: number, distance: number): 'High' | 'Medium' | 'Low' {
  if (magnitude >= 7.0 && distance <= 300) return 'High';
  if (magnitude >= 6.0 && distance <= 200) return 'High';
  if (magnitude >= 5.0 && distance <= 100) return 'High';
  if (distance <= 500) return 'Medium';
  return 'Low';
}

// Major cities data for quick lookup
const MAJOR_CITIES = [
  { name: 'United States', code: 'US', lat: 37.0902, lon: -95.7129 },
  { name: 'Japan', code: 'JP', lat: 36.2048, lon: 138.2529 },
  { name: 'Mexico', code: 'MX', lat: 23.6345, lon: -102.5528 },
  { name: 'China', code: 'CN', lat: 35.8617, lon: 104.1954 },
  { name: 'Indonesia', code: 'ID', lat: -0.7893, lon: 113.9213 },
  { name: 'Chile', code: 'CL', lat: -35.6751, lon: -71.5430 },
  { name: 'Philippines', code: 'PH', lat: 12.8797, lon: 121.7740 },
  { name: 'Turkey', code: 'TR', lat: 38.9637, lon: 35.2433 },
  { name: 'Italy', code: 'IT', lat: 41.8719, lon: 12.5674 },
  { name: 'New Zealand', code: 'NZ', lat: -40.9006, lon: 174.8860 },
];

export function getAffectedCountries(earthquake: Earthquake) {
  const [lon, lat] = earthquake.coordinates;
  
  return MAJOR_CITIES
    .map(city => ({
      ...city,
      distance: calculateDistance(lat, lon, city.lat, city.lon),
      impact: determineImpact(earthquake.magnitude, calculateDistance(lat, lon, city.lat, city.lon))
    }))
    .filter(city => city.distance <= 1000) // Only include countries within 1000km
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3); // Get the 3 closest countries
}

export function getMagnitudeLevel(magnitude: number): string {
  if (magnitude >= 7.0) return 'VERY HIGH';
  if (magnitude >= 6.0) return 'HIGH';
  if (magnitude >= 5.0) return 'MEDIUM';
  return 'LOW';
} 