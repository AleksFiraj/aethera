import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Define valid areas for vehicle placement (Korçë city center)
const VALID_AREAS = {
  minLat: 40.6150,
  maxLat: 40.6220,
  minLng: 20.7750,
  maxLng: 20.7850
};

const getRandomPosition = () => {
  const lat = VALID_AREAS.minLat + Math.random() * (VALID_AREAS.maxLat - VALID_AREAS.minLat);
  const lng = VALID_AREAS.minLng + Math.random() * (VALID_AREAS.maxLng - VALID_AREAS.minLng);
  return { latitude: lat, longitude: lng };
};

const mockNearbyVehicles = (mode, userLocation) => {
  // Generate 6 mock vehicles in valid areas
  return Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    ...getRandomPosition(),
    code: `${mode === 'bicycle' ? 'B' : 'S'}${Math.floor(1000 + Math.random() * 9000)}`
  }));
};

const VehicleMarker = ({ mode, isSelected }) => (
  <View style={[styles.markerContainer, isSelected && styles.selectedMarker]}>
    {mode === 'bicycle' ? (
      <Ionicons name="bicycle" size={22} color="#4CAF50" />
    ) : (
      <MaterialCommunityIcons name="scooter" size={22} color="#2196F3" />
    )}
  </View>
);

const RentVehicleMap = ({ route, navigation }) => {
  const { mode, userLocation } = route.params;
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    setVehicles(mockNearbyVehicles(mode, userLocation));
  }, [mode, userLocation]);

  const initialRegion = {
    latitude: 40.6186, // Korçë city center
    longitude: 20.7808,
    latitudeDelta: 0.005, // Reduced for closer zoom
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        minZoomLevel={14}
        maxZoomLevel={18}
      >
        {vehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            coordinate={{ latitude: vehicle.latitude, longitude: vehicle.longitude }}
            onPress={() => setSelectedVehicle(vehicle)}
          >
            <VehicleMarker 
              mode={mode} 
              isSelected={selectedVehicle?.id === vehicle.id}
            />
          </Marker>
        ))}
      </MapView>
      {selectedVehicle && (
        <View style={styles.rentPanel}>
          <Text style={styles.vehicleInfo}>Vehicle Code: <Text style={styles.vehicleCode}>{selectedVehicle.code}</Text></Text>
          <TouchableOpacity
            style={styles.rentNowButton}
            onPress={() => navigation.navigate('RentVehiclePayment', {
              mode,
              vehicle: selectedVehicle
            })}
          >
            <Text style={styles.rentNowText}>Rent Now & Pay</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerContainer: {
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarker: {
    borderColor: '#2196F3',
    transform: [{ scale: 1.2 }],
  },
  rentPanel: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  vehicleInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  vehicleCode: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 20,
  },
  rentNowButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  rentNowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#2196F3',
    borderRadius: 24,
    padding: 8,
    zIndex: 10,
  },
});

export default RentVehicleMap; 