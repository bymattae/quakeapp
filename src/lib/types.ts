export interface EarthquakeAnalysis {
  cause: string;
  affectedAreas: string;
  details: string;
  affectedCountries: {
    name: string;
    impact: string;
  }[];
  affectedCities: {
    name: string;
    impact: string;
  }[];
}

export interface Earthquake {
  id: string;
  magnitude: number;
  location: string;
  city: string;
  country: string;
  time: string;
  coordinates: [number, number, number];
  depth: number;
  significance: number;
  tsunami: boolean;
  felt: number | null;
  cdi: number | null;
  mmi: number | null;
  alert: string | null;
  severity?: 'minor' | 'moderate' | 'severe';
  analysis?: EarthquakeAnalysis;
  affectedCountries?: {
    name: string;
    code: string;
    distance: number;
    impact: 'High' | 'Medium' | 'Low';
  }[];
  affectedCities?: {
    name: string;
    impact: 'High' | 'Medium' | 'Low';
    distance: number;
  }[];
}

export interface AffectedCity {
  name: string;
  distance: number;
  impact: 'Possibly Felt' | 'Likely Felt' | 'No Impact';
}

export interface EarthquakeResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: {
    type: string;
    properties: {
      mag: number;
      place: string;
      time: number;
      updated: number;
      tz: number;
      url: string;
      detail: string;
      felt: number | null;
      cdi: number | null;
      mmi: number | null;
      alert: string | null;
      status: string;
      tsunami: number;
      sig: number;
      net: string;
      code: string;
      ids: string;
      sources: string;
      types: string;
      nst: number | null;
      dmin: number | null;
      rms: number;
      gap: number | null;
      magType: string;
      type: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number, number];
    };
    id: string;
  }[];
}

export interface USGSFeature {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    sig: number;
    tsunami: number;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  id: string;
} 