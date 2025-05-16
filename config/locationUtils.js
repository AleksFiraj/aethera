import { Platform } from 'react-native';

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Format distance for display
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// Format duration for display
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};


// Get current location
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    });
    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Get nearby places
export const getNearbyPlaces = async (location) => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.NEARBY_PLACES}?location=${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return [];
  }
};

// Get appropriate icon for place type
export const getIconForPlaceType = (type) => {
  const iconMap = {
    restaurant: 'restaurant',
    bar: 'beer',
    cafe: 'cafe',
    museum: 'museum',
    park: 'leaf',
    shopping_mall: 'cart',
    gym: 'fitness',
    default: 'location'
  };
  return iconMap[type] || iconMap.default;
}; 