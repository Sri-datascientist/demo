import { googleMapsApiKey } from './env';

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: object) => GoogleMapInstance;
        Marker: new (opts: object) => GoogleMarkerInstance;
        Geocoder: new () => GoogleGeocoder;
        LatLng: new (lat: number, lng: number) => object;
        event: { addListener: (instance: object, event: string, fn: () => void) => void };
        places: {
          Autocomplete: new (input: HTMLInputElement, opts?: object) => GoogleAutocomplete;
        };
      };
    };
  }
}

export interface GoogleMapInstance {
  setCenter: (pos: object) => void;
  setZoom: (zoom: number) => void;
  addListener: (event: string, fn: (e: { latLng?: { lat: () => number; lng: () => number } }) => void) => void;
}

export interface GoogleMarkerInstance {
  setPosition: (pos: object) => void;
  setMap: (map: GoogleMapInstance | null) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
}

export interface GoogleGeocoder {
  geocode: (
    req: object,
    cb: (results: { formatted_address: string }[] | null, status: string) => void,
  ) => void;
}

interface GoogleAutocomplete {
  addListener: (event: string, fn: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    geometry?: { location?: { lat: () => number; lng: () => number } };
  };
}

let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (!googleMapsApiKey) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'));
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.dataset.googleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export const DEFAULT_MAP_CENTER = { lat: 28.6139, lng: 77.209 };
