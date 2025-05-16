import { GOOGLE_MAPS_API_KEY, API_ENDPOINTS } from './api';

// Decode polyline string to coordinates
export const decodePolyline = (encoded) => {
  if (!encoded) return [];
  
  const points = [];
  let index = 0, lat = 0, lng = 0;
  
  while (index < encoded.length) {
    let shift = 0, result = 0;
    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);
    
    lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
    
    shift = 0;
    result = 0;
    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);
    
    lng += ((result & 1) ? ~(result >> 1) : (result >> 1));
    
    points.push({
      latitude: lat * 1e-5,
      longitude: lng * 1e-5
    });
  }
  
  return points;
};

// Fetch route between two points
export const fetchRoute = async (start, end) => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.DIRECTIONS}?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return {
        distance: data.routes[0].legs[0].distance.text,
        duration: data.routes[0].legs[0].duration.text,
        steps: data.routes[0].legs[0].steps,
        polyline: data.routes[0].overview_polyline.points,
        alternativeRoutes: data.routes.slice(1).map(route => ({
          polyline: route.overview_polyline.points,
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text
        }))
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
};

// Calculate route statistics
export const calculateRouteStats = (route) => {
  if (!route) return null;
  
  return {
    distance: route.distance,
    duration: route.duration,
    steps: route.steps.map(step => ({
      instructions: step.html_instructions.replace(/<[^>]*>/g, ''),
      distance: step.distance.text,
      duration: step.duration.text,
      polyline: step.polyline.points
    }))
  };
};

// Get eco-friendly route
export const getEcoRoute = async (start, end) => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.DIRECTIONS}?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=bicycling&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return {
        distance: data.routes[0].legs[0].distance.text,
        duration: data.routes[0].legs[0].duration.text,
        steps: data.routes[0].legs[0].steps,
        polyline: data.routes[0].overview_polyline.points
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching eco route:', error);
    return null;
  }
}; 