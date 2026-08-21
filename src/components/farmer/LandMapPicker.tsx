import { useEffect, useRef, useState } from 'react';
import { DEFAULT_MAP_CENTER, loadGoogleMaps, type GoogleGeocoder, type GoogleMapInstance, type GoogleMarkerInstance } from '../../lib/googleMaps';
import { hasGoogleMapsApiKey } from '../../lib/env';

interface LandMapPickerProps {
  latitude: string;
  longitude: string;
  locationText: string;
  onLocationChange: (lat: string, lng: string, address?: string) => void;
}

interface GoogleAutocomplete {
  addListener: (event: string, fn: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    geometry?: { location?: { lat: () => number; lng: () => number } };
  };
}

const GOOGLE_MAPS_SETUP_HELP = [
  'Enable billing on your Google Cloud project (required even for free tier).',
  'Enable APIs: Maps JavaScript API, Places API, and Geocoding API.',
  'Under API key restrictions, allow http://localhost:3000/* for development.',
  'Wait a few minutes after changes, then hard-refresh this page.',
];

export function LandMapPicker({ latitude, longitude, locationText, onLocationChange }: LandMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<GoogleMarkerInstance | null>(null);
  const geocoderRef = useRef<GoogleGeocoder | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!hasGoogleMapsApiKey) {
      setStatus('error');
      setErrorMessage('Google Maps API key is missing in .env');
      return;
    }

    let cancelled = false;

    const previousAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      if (!cancelled) {
        setStatus('error');
        setErrorMessage('Google Maps rejected your API key (billing or API not enabled).');
      }
    };

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) return;

        const lat = latitude ? parseFloat(latitude) : DEFAULT_MAP_CENTER.lat;
        const lng = longitude ? parseFloat(longitude) : DEFAULT_MAP_CENTER.lng;
        const center = {
          lat: Number.isFinite(lat) ? lat : DEFAULT_MAP_CENTER.lat,
          lng: Number.isFinite(lng) ? lng : DEFAULT_MAP_CENTER.lng,
        };

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: latitude && longitude ? 14 : 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }) as GoogleMapInstance;
        mapInstanceRef.current = map;

        const marker = new window.google.maps.Marker({
          map,
          position: center,
          draggable: true,
        }) as GoogleMarkerInstance;
        markerRef.current = marker;

        geocoderRef.current = new window.google!.maps.Geocoder();

        const resolveAddress = (latVal: number, lngVal: number, address?: string) => {
          if (address) {
            onLocationChange(latVal.toFixed(6), lngVal.toFixed(6), address);
            return;
          }
          const geocoder = geocoderRef.current;
          if (!geocoder) {
            onLocationChange(latVal.toFixed(6), lngVal.toFixed(6));
            return;
          }
          geocoder.geocode({ location: { lat: latVal, lng: lngVal } }, (results, geocodeStatus) => {
            const formatted = geocodeStatus === 'OK' && results?.[0]?.formatted_address;
            onLocationChange(latVal.toFixed(6), lngVal.toFixed(6), formatted || undefined);
          });
        };

        const setFromLatLng = (latVal: number, lngVal: number, address?: string) => {
          const pos = { lat: latVal, lng: lngVal };
          marker.setPosition(pos);
          map.setCenter(pos);
          map.setZoom(14);
          resolveAddress(latVal, lngVal, address);
        };

        map.addListener('click', (e) => {
          if (!e.latLng) return;
          setFromLatLng(e.latLng.lat(), e.latLng.lng());
        });

        window.google.maps.event.addListener(marker, 'dragend', () => {
          const pos = marker.getPosition();
          if (pos) setFromLatLng(pos.lat(), pos.lng());
        });

        if (searchRef.current && window.google.maps.places) {
          const autocomplete = new window.google.maps.places.Autocomplete(searchRef.current, {
            fields: ['formatted_address', 'geometry'],
          });
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const loc = place.geometry?.location;
            if (!loc) return;
            setFromLatLng(loc.lat(), loc.lng(), place.formatted_address);
          });
        }

        setStatus('ready');
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Could not load map');
        }
      });

    return () => {
      cancelled = true;
      window.gm_authFailure = previousAuthFailure;
    };
  }, []);

  useEffect(() => {
    if (status !== 'ready' || !markerRef.current || !mapInstanceRef.current) return;
    if (!latitude || !longitude) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const pos = { lat, lng };
    markerRef.current.setPosition(pos);
    mapInstanceRef.current.setCenter(pos);
  }, [latitude, longitude, status]);

  useEffect(() => {
    if (searchRef.current && locationText !== searchRef.current.value) {
      searchRef.current.value = locationText;
    }
  }, [locationText, status]);

  if (!hasGoogleMapsApiKey) {
    return null;
  }

  const hasSelection = latitude && longitude;

  return (
    <div className="space-y-3">
      <p className="page-label">Land location</p>
      <input
        ref={searchRef}
        type="text"
        placeholder="Search village, district, or landmark..."
        className="w-full rounded-xl border px-4 py-3"
        defaultValue={locationText}
      />
      <div
        ref={mapRef}
        className="w-full h-80 rounded-xl border bg-neutral-100 overflow-hidden"
        aria-label="Land location map"
      />
      {status === 'loading' && <p className="text-sm text-neutral-500">Loading map...</p>}
      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 space-y-2">
          <p className="font-semibold">{errorMessage || 'Google Maps could not load.'}</p>
          <p className="font-medium">Fix in Google Cloud Console:</p>
          <ul className="list-disc pl-5 space-y-1">
            {GOOGLE_MAPS_SETUP_HELP.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <a
            href="https://console.cloud.google.com/google/maps-apis"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#2D5A27] underline"
          >
            Open Google Maps Platform
          </a>
        </div>
      )}
      {status === 'ready' && !hasSelection && (
        <p className="text-sm text-neutral-500">
          Search for a place or click on the map to mark your land. Drag the pin to adjust.
        </p>
      )}
      {status === 'ready' && hasSelection && (
        <div className="rounded-xl border border-[#689F38]/30 bg-[#689F38]/5 px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#2D5A27] mb-1">Selected location</p>
          <p className="text-sm font-medium text-neutral-800">
            {locationText || 'Marked on map'}
          </p>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}
