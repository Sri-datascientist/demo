/** Frontend env vars (set in demo-main/.env — must be prefixed with VITE_) */

export const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? '';

export const hasGoogleMapsApiKey = googleMapsApiKey.length > 0;

export const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';
