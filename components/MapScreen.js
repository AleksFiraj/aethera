import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions, Platform, Linking, Easing } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '../config/api';
import { useNavigation } from '@react-navigation/native';

const TRANSPORT_MODES = ['car', 'bicycle', 'scooter', 'walk', 'bus'];
const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

// Add polyline decoding utility
function decodePolyline(encoded) {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push({ latitude: lat * 1e-5, longitude: lng * 1e-5 });
  }
  return points;
}

const MapScreen = () => {
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState('car');
  const drawerAnimation = useState(new Animated.Value(0))[0];
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [fromText, setFromText] = useState('');
  const [fromLocation, setFromLocation] = useState(null);
  const [toText, setToText] = useState('');
  const [toLocation, setToLocation] = useState(null);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [toFocused, setToFocused] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [fromFocused, setFromFocused] = useState(false);
  const [ecoRouteInfo, setEcoRouteInfo] = useState(null);
  const [chargingStations, setChargingStations] = useState([]);
  const [busStations, setBusStations] = useState([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [isEcoRouteEnabled, setIsEcoRouteEnabled] = useState(false);
  const [showEcoRoutePolyline, setShowEcoRoutePolyline] = useState(false);
  const [ecoRoutePolyline, setEcoRoutePolyline] = useState([]);
  const ecoRouteInfoAnim = useState(new Animated.Value(0))[0];
  const [routeInfo, setRouteInfo] = useState(null);
  const navCardAnim = useState(new Animated.Value(0))[0];

  // Get user location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
          return;
        }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
      setUserLocation(coords);
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setFromLocation(coords);
      setFromText('Current Location');
    })();
  }, []);

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const loc = data.results[0].geometry.location;
        return { latitude: loc.lat, longitude: loc.lng };
      }
    } catch (e) {
      console.warn('Geocoding failed:', e);
    }
    return null;
  };

  // Add new function to calculate region that fits both points
  const calculateRegionForPoints = useCallback((point1, point2) => {
    if (!point1 || !point2) return null;

    const minLat = Math.min(point1.latitude, point2.latitude);
    const maxLat = Math.max(point1.latitude, point2.latitude);
    const minLng = Math.min(point1.longitude, point2.longitude);
    const maxLng = Math.max(point1.longitude, point2.longitude);

    const latDelta = (maxLat - minLat) * 1.5; // Add 50% padding
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.005), // Ensure minimum zoom level
      longitudeDelta: Math.max(lngDelta, 0.005),
    };
  }, []);

  // Update region when from/to locations change
  useEffect(() => {
    if (fromLocation && toLocation) {
      const newRegion = calculateRegionForPoints(fromLocation, toLocation);
      if (newRegion) {
        setRegion(newRegion);
      }
    } else if (fromLocation) {
      // When only starting location is selected, focus on that point with a closer zoom
      setRegion({
        latitude: fromLocation.latitude,
        longitude: fromLocation.longitude,
        latitudeDelta: 0.005, // Closer zoom level
        longitudeDelta: 0.005,
      });
    }
  }, [fromLocation, toLocation, calculateRegionForPoints]);

  // Fetch suggestions for the From: field
  const fetchFromSuggestions = async (input) => {
    if (!input || input.toLowerCase() === 'current location') {
      setFromSuggestions([]);
      return;
    }
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && Array.isArray(data.predictions)) {
        setFromSuggestions(data.predictions);
      } else {
        setFromSuggestions([]);
      }
    } catch (e) {
      setFromSuggestions([]);
    }
  };

  // Update handleFromSuggestionPress
  const handleFromSuggestionPress = async (suggestion) => {
    setFromText(suggestion.description);
    setFromSuggestions([]);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.result && data.result.geometry && data.result.geometry.location) {
        const loc = data.result.geometry.location;
        const newFromLocation = { latitude: loc.lat, longitude: loc.lng };
        setFromLocation(newFromLocation);
      }
    } catch (e) {}
  };

  // Handle From field change
  const handleFromChange = (text) => {
    setFromText(text);
    fetchFromSuggestions(text);
  };

  // Handle From field blur/change
  const handleFromBlur = async () => {
    if (!fromText || fromText.toLowerCase() === 'current location') {
      setFromLocation(userLocation);
      setFromText('Current Location');
      return;
    }
    const coords = await geocodeAddress(fromText);
    if (coords) {
      setFromLocation(coords);
      } else {
      setFromLocation(userLocation);
      setFromText('Current Location');
    }
  };

  // Fetch suggestions for the To: field
  const fetchToSuggestions = async (input) => {
    if (!input) {
      setToSuggestions([]);
        return;
      }
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && Array.isArray(data.predictions)) {
        setToSuggestions(data.predictions);
      } else {
        setToSuggestions([]);
      }
    } catch (e) {
      setToSuggestions([]);
    }
  };

  // Update handleToSuggestionPress
  const handleToSuggestionPress = async (suggestion) => {
    setToText(suggestion.description);
    setToSuggestions([]);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.result && data.result.geometry && data.result.geometry.location) {
        const loc = data.result.geometry.location;
        const newToLocation = { latitude: loc.lat, longitude: loc.lng };
        setToLocation(newToLocation);
      }
    } catch (e) {}
  };

  // Handle To field change
  const handleToChange = (text) => {
    setToText(text);
    fetchToSuggestions(text);
  };

  // Handle To field blur/change
  const handleToBlur = async () => {
    if (!toText) {
      setToLocation(null);
      return;
    }
    const coords = await geocodeAddress(toText);
    if (coords) {
      setToLocation(coords);
    } else {
      setToLocation(null);
    }
  };

  const toggleDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: isDrawerOpen ? -DRAWER_WIDTH : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsDrawerOpen(!isDrawerOpen));
  };

  const showEcoRoute = ['car', 'bicycle', 'scooter', 'walk'].includes(selectedMode);

  // Start Navigation handler
  const handleStartNavigation = async () => {
    if (!fromLocation || !toLocation) return;
      if (!isEcoRouteEnabled) {
      setShowEcoRoutePolyline(false);
      setEcoRouteInfo(null);
      setEcoRoutePolyline([]);
      const url = `https://www.google.com/maps/dir/?api=1&origin=${fromLocation.latitude},${fromLocation.longitude}&destination=${toLocation.latitude},${toLocation.longitude}&travelmode=${selectedMode}`;
      Linking.openURL(url);
    } else {
      // Fetch eco-route polyline from Google Directions API
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLocation.latitude},${fromLocation.longitude}&destination=${toLocation.latitude},${toLocation.longitude}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.routes.length > 0) {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setEcoRoutePolyline(points);
      } else {
          setEcoRoutePolyline([]);
        }
      } catch (e) {
        setEcoRoutePolyline([]);
      }
      setShowEcoRoutePolyline(true);
      setEcoRouteInfo({
        pollution: 'Low NO₂, PM2.5: 8 µg/m³',
        pollen: 'Low pollen count',
        description: 'This is the least polluted option for your route today.'
      });
    }
  };

  // Hide eco-route info/polyline if eco-route is disabled or locations change
  useEffect(() => {
    setShowEcoRoutePolyline(false);
    setEcoRouteInfo(null);
    setEcoRoutePolyline([]);
  }, [isEcoRouteEnabled, fromLocation, toLocation]);

  // Fetch charging stations (car mode)
  const fetchChargingStations = async (location) => {
      setIsLoadingStations(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=10000&type=charging_station&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && Array.isArray(data.results)) {
        setChargingStations(data.results);
      } else {
        setChargingStations([]);
      }
    } catch (e) {
      setChargingStations([]);
    }
    setIsLoadingStations(false);
  };

  // Fetch bus stations (bus mode)
  const fetchBusStations = async (location) => {
    setIsLoadingStations(true);
    try {
      // First try to fetch bus stations
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=10000&type=transit_station&keyword=bus&key=${GOOGLE_MAPS_API_KEY}`;
      console.log('Fetching bus stations with URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('Bus stations API response:', data);

      if (data.status === 'OK' && Array.isArray(data.results)) {
        setBusStations(data.results);
      } else if (data.status === 'ZERO_RESULTS') {
        // If no bus stations found, try searching for transit stations
        const transitUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=10000&type=transit_station&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('No bus stations found, trying transit stations with URL:', transitUrl);
        const transitResponse = await fetch(transitUrl);
        const transitData = await transitResponse.json();
        console.log('Transit stations API response:', transitData);

        if (transitData.status === 'OK' && Array.isArray(transitData.results)) {
          setBusStations(transitData.results);
        } else {
          console.log('No transit stations found either');
          setBusStations([]);
          }
        } else {
        console.log('Error fetching bus stations:', data.status);
        setBusStations([]);
      }
    } catch (e) {
      console.error('Error in fetchBusStations:', e);
      setBusStations([]);
    }
    setIsLoadingStations(false);
  };

  // Fetch stations when mode or user location changes
  useEffect(() => {
    if (selectedMode === 'car' && userLocation) {
      fetchChargingStations(userLocation);
    } else if (selectedMode === 'bus' && userLocation) {
      fetchBusStations(userLocation);
    } else {
      setChargingStations([]);
      setBusStations([]);
    }
  }, [selectedMode, userLocation]);

  // Update handleStationSelect
  const handleStationSelect = (station, type) => {
    if (!station.geometry || !station.geometry.location) return;
    const newToLocation = {
      latitude: station.geometry.location.lat,
      longitude: station.geometry.location.lng,
      isBusStation: type === 'bus'
    };
    setToText(station.name);
    setToLocation(newToLocation);
    if (fromLocation) {
      const newRegion = calculateRegionForPoints(fromLocation, newToLocation);
      if (newRegion) setRegion(newRegion);
    }
    if (type === 'bus') {
      setIsEcoRouteEnabled(false);
    }
  };

  // Animate info box when polyline is shown
  useEffect(() => {
    if (isEcoRouteEnabled && showEcoRoutePolyline && ecoRouteInfo) {
      Animated.timing(ecoRouteInfoAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(ecoRouteInfoAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isEcoRouteEnabled, showEcoRoutePolyline, ecoRouteInfo]);

  // Fetch route info when from/to/mode changes and sidebar is closed
  useEffect(() => {
    const fetchRouteInfo = async () => {
      if (!fromLocation || !toLocation || isDrawerOpen) {
        setRouteInfo(null);
        Animated.timing(navCardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        return;
      }
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLocation.latitude},${fromLocation.longitude}&destination=${toLocation.latitude},${toLocation.longitude}&mode=${selectedMode}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.routes.length > 0) {
          const leg = data.routes[0].legs[0];
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps,
          });
          Animated.timing(navCardAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        } else {
          setRouteInfo(null);
          Animated.timing(navCardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
      } catch (e) {
        setRouteInfo(null);
        Animated.timing(navCardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }
    };
    fetchRouteInfo();
  }, [fromLocation, toLocation, selectedMode, isDrawerOpen]);

  // Add navigation handler for bus schedules
  const handleBusSchedulePress = () => {
    navigation.navigate('BusSchedule');
  };

    return (
    <View style={styles.container}>
      {/* Navigation Card (only when sidebar is closed, both points are set, and NOT bus mode) */}
      {routeInfo && !isDrawerOpen && (
        <Animated.View
          style={[
            styles.navigationCard,
            {
              opacity: navCardAnim,
              transform: [{ translateY: navCardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            },
          ]}
        >
          <Text style={styles.navigationCardTitle}>Route Guidance</Text>
          <Text style={styles.navigationCardInfo}>From: {routeInfo.startAddress}</Text>
          <Text style={styles.navigationCardInfo}>To: {routeInfo.endAddress}</Text>
          <View style={styles.navigationCardStats}>
            <Text style={styles.navigationCardStat}><Ionicons name="map" size={16} color="#4CAF50" /> {routeInfo.distance}</Text>
            <Text style={styles.navigationCardStat}><Ionicons name="time" size={16} color="#4CAF50" /> {routeInfo.duration}</Text>
            <Text style={styles.navigationCardStat}><Ionicons name={selectedMode === 'car' ? 'car' : selectedMode === 'bicycle' ? 'bicycle' : selectedMode === 'walk' ? 'walk' : 'bus'} size={16} color="#4CAF50" /> {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}</Text>
          </View>
          <View style={styles.navigationCardButtons}>
            <TouchableOpacity
              style={[
                styles.ecoRouteToggle,
                isEcoRouteEnabled ? styles.ecoRouteToggleActive : styles.ecoRouteToggleInactive,
              ]}
              onPress={() => setIsEcoRouteEnabled((prev) => !prev)}
            >
              <Ionicons name="leaf" size={22} color={isEcoRouteEnabled ? '#fff' : '#4CAF50'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.startNavButton} onPress={handleStartNavigation}>
              <Ionicons name="navigate" size={22} color="#fff" />
              <Text style={styles.startNavText}>{isEcoRouteEnabled && selectedMode !== 'bus' ? 'Show Eco Route' : 'Start Navigation'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      {/* Eco-Route Info Box (animated, above map, only when sidebar is closed) */}
      {isEcoRouteEnabled && showEcoRoutePolyline && ecoRouteInfo && !isDrawerOpen && (
        <Animated.View
          style={[
            styles.ecoRouteInfoBoxOverlay,
            {
              opacity: ecoRouteInfoAnim,
              transform: [{ translateY: ecoRouteInfoAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <Text style={styles.ecoRouteInfoTitle}>Least Polluted Option</Text>
          <Text style={styles.ecoRouteInfoText}>{ecoRouteInfo.pollution}</Text>
          <Text style={styles.ecoRouteInfoText}>{ecoRouteInfo.pollen}</Text>
          <Text style={styles.ecoRouteInfoDesc}>{ecoRouteInfo.description}</Text>
        </Animated.View>
      )}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* From Marker (if not user location) */}
        {fromLocation && fromText !== 'Current Location' && (
          <Marker
            coordinate={fromLocation}
            title="Start Location"
            pinColor="#4CAF50"
          />
        )}
        {/* User Location Marker (if from is user location) */}
        {fromLocation && fromText === 'Current Location' && userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="#2196F3"
          />
        )}
        {/* To Marker */}
        {toLocation && (
          <Marker
            coordinate={toLocation}
            title="Destination"
            pinColor="#FF0000"
          />
        )}
        {/* Charging Stations Markers (car mode) */}
        {selectedMode === 'car' && chargingStations.map((station) => (
          <Marker
            key={station.place_id}
            coordinate={{
              latitude: station.geometry.location.lat,
              longitude: station.geometry.location.lng,
            }}
            title={station.name}
            description={station.vicinity}
            pinColor="#FFA500"
            onPress={() => handleStationSelect(station, 'charging')}
          >
            <MaterialCommunityIcons name="ev-station" size={28} color="#FFA500" />
          </Marker>
        ))}
        {/* Bus Stations Markers (bus mode) */}
        {selectedMode === 'bus' && busStations.map((station) => (
          <Marker
            key={station.place_id}
            coordinate={{
              latitude: station.geometry.location.lat,
              longitude: station.geometry.location.lng,
            }}
            title={station.name}
            description={station.vicinity}
            pinColor="#2196F3"
            onPress={() => handleStationSelect(station, 'bus')}
          >
            <Ionicons name="bus" size={28} color="#2196F3" />
          </Marker>
        ))}
        {/* Eco-Route Polyline */}
        {isEcoRouteEnabled && showEcoRoutePolyline && fromLocation && toLocation && ecoRoutePolyline.length > 1 && (
          <Polyline
            coordinates={ecoRoutePolyline}
            strokeColor="#4CAF50"
            strokeWidth={4}
          />
        )}
        {/* Example Polyline (remove if not needed) */}
        {/* <Polyline coordinates={[{ latitude: 37.7749, longitude: -122.4194 }, { latitude: 37.7849, longitude: -122.4094 }]} strokeColor="#4CAF50" strokeWidth={3} /> */}
      </MapView>

      {/* Hamburger Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
        <Ionicons name={isDrawerOpen ? 'close' : 'menu'} size={30} color="#4CAF50" />
        </TouchableOpacity>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: drawerAnimation }],
            width: DRAWER_WIDTH,
          },
        ]}
      >
        <View style={styles.sidebarContent}>
          <ScrollView contentContainerStyle={styles.sidebarScrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* From Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>From:</Text>
              <TextInput
                style={styles.fieldInput}
                value={fromText}
                onChangeText={handleFromChange}
                onBlur={() => { setFromFocused(false); handleFromBlur(); setTimeout(() => setFromSuggestions([]), 200); }}
                onFocus={() => setFromFocused(true)}
                placeholder="Current Location"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {/* Suggestions Dropdown */}
              {fromFocused && fromSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {fromSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.place_id}
                      style={styles.suggestionItem}
                      onPress={() => handleFromSuggestionPress(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion.description}</Text>
                    </TouchableOpacity>
                  ))}
                  </View>
                )}
              </View>

            {/* To Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>To:</Text>
              <TextInput
                style={styles.fieldInput}
                value={toText}
                onChangeText={handleToChange}
                onBlur={() => { setToFocused(false); handleToBlur(); setTimeout(() => setToSuggestions([]), 200); }}
                onFocus={() => setToFocused(true)}
                placeholder="Destination"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {/* Suggestions Dropdown */}
              {toFocused && toSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {toSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.place_id}
                      style={styles.suggestionItem}
                      onPress={() => handleToSuggestionPress(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              </View>

            {/* Start Navigation Button */}
            {fromLocation && toLocation && (
              <TouchableOpacity style={styles.startNavButton} onPress={handleStartNavigation}>
                <Ionicons name="navigate" size={22} color="#fff" />
                <Text style={styles.startNavText}>{isEcoRouteEnabled && selectedMode !== 'bus' ? 'Show Eco Route' : 'Start Navigation'}</Text>
                </TouchableOpacity>
              )}

            {/* Transport Options */}
                <Text style={styles.sectionTitle}>Transport Mode</Text>
            <View style={styles.transportOptions}>
              {TRANSPORT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.transportButton,
                    selectedMode === mode && styles.selectedTransportButton,
                  ]}
                  onPress={() => setSelectedMode(mode)}
                >
                  <MaterialCommunityIcons
                    name={
                      mode === 'car'
                        ? 'car'
                        : mode === 'bicycle'
                        ? 'bike'
                        : mode === 'scooter'
                        ? 'scooter'
                        : mode === 'walk'
                        ? 'walk'
                        : 'bus'
                    }
                    size={24}
                    color={selectedMode === mode ? '#4CAF50' : '#666'}
                  />
                  <Text
                    style={[
                      styles.transportText,
                      selectedMode === mode && { color: '#4CAF50', fontWeight: 'bold' },
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Eco-Route Toggle */}
            {['car', 'bicycle', 'scooter', 'walk'].includes(selectedMode) && !toLocation?.isBusStation && (
                <TouchableOpacity
                  style={[
                  styles.ecoRouteToggle,
                  isEcoRouteEnabled ? styles.ecoRouteToggleActive : styles.ecoRouteToggleInactive,
                  styles.ecoRouteToggleLong
                ]}
                onPress={() => setIsEcoRouteEnabled((prev) => !prev)}
              >
                <Ionicons name="leaf" size={24} color={isEcoRouteEnabled ? '#fff' : '#4CAF50'} />
                <Text style={[styles.ecoRouteText, isEcoRouteEnabled ? { color: '#fff' } : { color: '#4CAF50' }]}>Eco-Route</Text>
                </TouchableOpacity>
              )}

            {/* Rent Now Button for Bike/Scooter */}
            {(selectedMode === 'bicycle' || selectedMode === 'scooter') && (
              <TouchableOpacity
                style={styles.rentNowButton}
                onPress={() => navigation.navigate('RentVehicleMap', {
                  mode: selectedMode,
                  userLocation: userLocation
                })}
              >
                {selectedMode === 'bicycle' ? (
                  <Ionicons name="bicycle" size={24} color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="human-scooter" size={24} color="#fff" />
                )}
                <Text style={styles.rentNowText}>Rent Now!</Text>
              </TouchableOpacity>
            )}

            {/* Charging Stations List (car mode) */}
            {selectedMode === 'car' && chargingStations.length > 0 && (
              <View style={styles.stationsListContainer}>
                  <Text style={styles.sectionTitle}>Nearby Charging Stations</Text>
                {isLoadingStations ? (
                    <Text style={styles.loadingText}>Loading charging stations...</Text>
                  ) : (
                  chargingStations.map((station) => (
                        <TouchableOpacity
                      key={station.place_id}
                      style={styles.stationItem}
                          onPress={() => handleStationSelect(station, 'charging')}
                        >
                      <MaterialCommunityIcons name="ev-station" size={22} color="#FFA500" />
                          <View style={styles.stationInfo}>
                            <Text style={styles.stationName}>{station.name}</Text>
                            <Text style={styles.stationVicinity}>{station.vicinity}</Text>
                              </View>
                              </TouchableOpacity>
                  ))
                  )}
                </View>
              )}

            {/* Bus Stations List (bus mode) */}
            {selectedMode === 'bus' && busStations.length > 0 && (
              <View style={styles.stationsListContainer}>
                  <Text style={styles.sectionTitle}>Nearby Bus Stations</Text>
                  {isLoadingStations ? (
                    <Text style={styles.loadingText}>Loading bus stations...</Text>
                  ) : (
                  busStations.map((station) => (
                        <TouchableOpacity
                      key={station.place_id}
                      style={styles.stationItem}
                          onPress={() => handleStationSelect(station, 'bus')}
                        >
                      <Ionicons name="bus" size={22} color="#2196F3" />
                          <View style={styles.stationInfo}>
                            <Text style={styles.stationName}>{station.name}</Text>
                            <Text style={styles.stationVicinity}>{station.vicinity}</Text>
                          </View>
                        </TouchableOpacity>
                  ))
                  )}
                {/* Check the Bus Schedules Button */}
                    <TouchableOpacity
                      style={styles.busScheduleButton}
                  onPress={handleBusSchedulePress}
                >
                  <Text style={styles.busScheduleButtonText}>Check the Bus Schedules</Text>
                    </TouchableOpacity>
                </View>
              )}
          </ScrollView>
            </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 9,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarContent: {
    marginTop: 80, // Leaves space for the menu button
    flex: 1,
    paddingHorizontal: 10,
  },
  sidebarScrollContent: {
    paddingBottom: 30,
    paddingTop: 10,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fieldInput: {
    height: 38,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  transportOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  transportButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    minWidth: 60,
    flex: 1,
    marginHorizontal: 2,
  },
  selectedTransportButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  transportText: { marginTop: 3, color: '#666', fontSize: 13 },
  ecoRouteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  ecoRouteToggleActive: {
    backgroundColor: '#4CAF50',
  },
  ecoRouteToggleInactive: {
    backgroundColor: '#fff',
  },
  ecoRouteText: { color: '#4CAF50', marginLeft: 8, fontSize: 15 },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    marginTop: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    zIndex: 100,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
  },
  startNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
  },
  startNavText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ecoRouteInfoBoxOverlay: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 30,
    minWidth: 140,
    maxWidth: 260,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 4,
  },
  ecoRouteInfoTitle: {
    fontWeight: 'bold',
    color: '#388E3C',
    fontSize: 15,
    marginBottom: 4,
  },
  ecoRouteInfoText: {
    color: '#333',
    fontSize: 13,
  },
  ecoRouteInfoDesc: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  stationsListContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stationInfo: {
    marginLeft: 10,
  },
  stationName: {
    fontWeight: 'bold',
    color: '#333',
  },
  stationVicinity: {
    color: '#666',
    fontSize: 12,
  },
  busScheduleButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  busScheduleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },
  ecoRouteToggleLong: {
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  navigationCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 5,
    alignItems: 'center',
  },
  navigationCardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  navigationCardInfo: {
    color: '#666',
    fontSize: 13,
    marginBottom: 2,
    textAlign: 'center',
  },
  navigationCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
  },
  navigationCardStat: {
    color: '#333',
    fontSize: 14,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rentNowButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  rentNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  navigationCardButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
});

export default MapScreen;