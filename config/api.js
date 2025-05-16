// Google Maps API Key
// TODO: Replace with your actual API key from Google Cloud Console
// Make sure to enable the following APIs in your Google Cloud Console:
// - Maps SDK for Android
// - Maps SDK for iOS
// - Places API
// - Directions API
// - Geocoding API
// - Air Quality API (if using air quality features)
export const GOOGLE_MAPS_API_KEY = 'xxx';

// API Endpoints
export const API_ENDPOINTS = {
  PLACES_NEARBY: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
  DIRECTIONS: 'https://maps.googleapis.com/maps/api/directions/json',
  AIR_QUALITY: 'https://maps.googleapis.com/maps/api/airquality/v1/current',
  BUS_SCHEDULE: 'https://maps.googleapis.com/maps/api/transit/v1/station/schedule', // Placeholder endpoint
};

// API Parameters
export const API_PARAMS = {
  PLACES_RADIUS: {
    BUS_STATIONS: 2000, // 2km radius for bus stations
    CHARGING_STATIONS: 10000, // 10km radius for charging stations
  },
  LANGUAGE: 'en',
}; 