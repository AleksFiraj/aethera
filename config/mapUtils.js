import { PROVIDER_GOOGLE } from 'react-native-maps';
import { getIconForPlaceType } from './locationUtils';
import { decodePolyline } from './routeUtils';

// Initialize map region
export const getInitialMapRegion = (currentLocation) => {
  return {
    latitude: currentLocation?.latitude || 40.748817,
    longitude: currentLocation?.longitude || -73.985428,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
};

// Handle map region change
export const handleRegionChange = (region, setMapRegion) => {
  setMapRegion(region);
};

// Handle map press
export const handleMapPress = (event, isSelectingOnMap, setSelectedMapPoint) => {
  if (!isSelectingOnMap) return;
  
  const { coordinate } = event.nativeEvent;
  setSelectedMapPoint(coordinate);
};

// Toggle map type
export const toggleMapType = (currentType, setMapType) => {
  setMapType(currentType === 'standard' ? 'satellite' : 'standard');
};

// Get map marker data for places
export const getMapMarkerData = (places, selectedPlace, onPlacePress) => {
  return places.map(place => ({
    key: place.place_id,
    coordinate: {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    },
    title: place.name,
    description: place.vicinity,
    onPress: () => onPlacePress(place),
    pinColor: selectedPlace?.place_id === place.place_id ? '#4CAF50' : '#FF0000',
    icon: getIconForPlaceType(place.types[0]),
    isSelected: selectedPlace?.place_id === place.place_id
  }));
};

// Get route polyline data
export const getRoutePolylineData = (route, alternativeRoutes, selectedRouteIndex) => {
  const polylines = [];
  
  // Main route
  if (route?.polyline) {
    polylines.push({
      key: "main-route",
      coordinates: decodePolyline(route.polyline),
      strokeColor: "#4CAF50",
      strokeWidth: 3
    });
  }
  
  // Alternative routes
  if (alternativeRoutes) {
    alternativeRoutes.forEach((altRoute, index) => {
      polylines.push({
        key: `alt-route-${index}`,
        coordinates: decodePolyline(altRoute.polyline),
        strokeColor: index === selectedRouteIndex ? '#2196F3' : '#CCCCCC',
        strokeWidth: index === selectedRouteIndex ? 3 : 2
      });
    });
  }
  
  return polylines;
};

// Animate map to region
export const animateMapToRegion = (mapRef, region, duration = 1000) => {
  if (mapRef.current) {
    mapRef.current.animateToRegion(region, duration);
  }
}; 