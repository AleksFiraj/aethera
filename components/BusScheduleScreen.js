import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Modal,
  Alert,
  Platform,
  Dimensions,
  TextInput,
  Animated,
  SafeAreaView,
  Image,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { GOOGLE_MAPS_API_KEY, API_ENDPOINTS, API_PARAMS } from '../config/api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';

const BusScheduleScreen = ({ route, navigation }) => {
  const { stations = [], currentLocation = null } = route?.params || {};
  const [selectedStation, setSelectedStation] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextBuses, setNextBuses] = useState({});
  const [points, setPoints] = useState(0);
  const POINTS_FILE_URI = `${FileSystem.documentDirectory}points.json`;

  // Load points from local file on mount
  useEffect(() => {
    const loadPoints = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(POINTS_FILE_URI);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(POINTS_FILE_URI);
          const data = JSON.parse(content);
          setPoints(data.points || 85);
        }
      } catch (e) {
        setPoints(0);
      }
    };
    loadPoints();
  }, []);

  // Save points to local file
  const savePoints = async (newPoints) => {
    setPoints(newPoints);
    try {
      await FileSystem.writeAsStringAsync(POINTS_FILE_URI, JSON.stringify({ points: newPoints }), { encoding: FileSystem.EncodingType.UTF8 });
      console.log('Points saved successfully:', newPoints);
    } catch (e) {
      console.error('Error saving points:', e);
    }
  };

  const [selectedTab, setSelectedTab] = useState('local'); // 'local' or 'intercity'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationId, setSelectedStationId] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Define major cities with their coordinates
  const cities = [
    // Greek Cities
    { id: 'athens', name: 'Athens', country: 'Greece', coordinates: { lat: 37.9838, lng: 23.7275 }, baseTime: 720 }, // 12 hours
    { id: 'thessaloniki', name: 'Thessaloniki', country: 'Greece', coordinates: { lat: 40.6401, lng: 22.9444 }, baseTime: 480 }, // 8 hours
    { id: 'patras', name: 'Patras', country: 'Greece', coordinates: { lat: 38.2466, lng: 21.7345 }, baseTime: 600 }, // 10 hours
    { id: 'ioannina', name: 'Ioannina', country: 'Greece', coordinates: { lat: 39.6650, lng: 20.8537 }, baseTime: 180 }, // 3 hours
    { id: 'larissa', name: 'Larissa', country: 'Greece', coordinates: { lat: 39.6390, lng: 22.4174 }, baseTime: 360 }, // 6 hours
    { id: 'volos', name: 'Volos', country: 'Greece', coordinates: { lat: 39.3666, lng: 22.9507 }, baseTime: 420 }, // 7 hours
    { id: 'heraklion', name: 'Heraklion', country: 'Greece', coordinates: { lat: 35.3387, lng: 25.1442 }, baseTime: 900 }, // 15 hours
    { id: 'kavala', name: 'Kavala', country: 'Greece', coordinates: { lat: 40.9375, lng: 24.4144 }, baseTime: 540 }, // 9 hours
    
    // Albanian Cities
    { id: 'tirana', name: 'Tirana', country: 'Albania', coordinates: { lat: 41.3275, lng: 19.8187 }, baseTime: 180 }, // 3 hours
    { id: 'durres', name: 'Durrës', country: 'Albania', coordinates: { lat: 41.3232, lng: 19.4412 }, baseTime: 240 }, // 4 hours
    { id: 'vlore', name: 'Vlorë', country: 'Albania', coordinates: { lat: 40.4666, lng: 19.4833 }, baseTime: 300 }, // 5 hours
    { id: 'sarande', name: 'Sarandë', country: 'Albania', coordinates: { lat: 39.8756, lng: 20.0053 }, baseTime: 240 }, // 4 hours
    { id: 'shkoder', name: 'Shkodër', country: 'Albania', coordinates: { lat: 42.0683, lng: 19.5126 }, baseTime: 360 }, // 6 hours
    { id: 'elbasan', name: 'Elbasan', country: 'Albania', coordinates: { lat: 41.1125, lng: 20.0822 }, baseTime: 120 }, // 2 hours
    { id: 'fier', name: 'Fier', country: 'Albania', coordinates: { lat: 40.7239, lng: 19.5567 }, baseTime: 180 }, // 3 hours
    { id: 'berat', name: 'Berat', country: 'Albania', coordinates: { lat: 40.7058, lng: 19.9522 }, baseTime: 150 }, // 2.5 hours
    { id: 'lushnje', name: 'Lushnjë', country: 'Albania', coordinates: { lat: 40.9419, lng: 19.7050 }, baseTime: 180 }, // 3 hours
    { id: 'pogradec', name: 'Pogradec', country: 'Albania', coordinates: { lat: 40.9022, lng: 20.6525 }, baseTime: 60 }, // 1 hour
    { id: 'gjirokaster', name: 'Gjirokastër', country: 'Albania', coordinates: { lat: 40.0758, lng: 20.1389 }, baseTime: 180 } // 3 hours
  ];

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

  // Get nearby cities within specified radius - with added null checks
  const getNearbyDestinations = (userLocation, radius = 500) => {
    // If no user location, return all cities with default values
    if (!userLocation || typeof userLocation.latitude !== 'number' || typeof userLocation.longitude !== 'number') {
      return cities.map(city => ({
        ...city,
        distance: 0,
        departures: generateDepartures(100) // Default distance for departures
      }));
    }

    return cities.map(city => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        city.coordinates.lat,
        city.coordinates.lng
      );
      return {
        ...city,
        distance: distance,
        departures: generateDepartures(distance)
      };
    }).filter(city => city.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  };

  // Generate realistic departures based on distance
  const generateDepartures = (distance) => {
    // Base price calculation: €0.12 per km with minimum €5
    let basePrice = Math.max(5, Math.round(distance * 0.12));
    // Round to nearest euro
    basePrice = Math.round(basePrice);

    const city = cities.find(c => Math.abs(c.distance - distance) < 10);
    const baseMinutes = city ? city.baseTime : Math.round((distance / 60) * 60);
    
    // Add extra time for breaks and border crossing if applicable
    const breakTime = Math.floor(baseMinutes / 120) * 15; // 15-min break every 2 hours
    const borderTime = city?.country !== 'Albania' ? 30 : 0; // 30 minutes for border crossing
    
    const totalMinutes = baseMinutes + breakTime + borderTime;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const durationStr = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;

    // Generate departure times based on distance
    const departureTimes = [];
    const startHour = 6; // First bus at 6 AM
    const endHour = 20; // Last bus at 8 PM
    
    // More frequent departures for shorter distances
    const frequency = distance < 100 ? 2 : // Every 2 hours for very short routes
                     distance < 200 ? 3 : // Every 3 hours for short routes
                     distance < 400 ? 4 : // Every 4 hours for medium routes
                     6; // Every 6 hours for long routes
    
    for (let hour = startHour; hour <= endHour; hour += frequency) {
      departureTimes.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        price: `€${basePrice}`,
        duration: durationStr,
        available_seats: Math.floor(Math.random() * 30) + 10
      });
    }

    return departureTimes;
  };

  // Get nearby cities based on user's location
  const nearbyDestinations = useMemo(() => {
    return getNearbyDestinations(currentLocation);
  }, [currentLocation]);

  // Filter destinations based on search query with safety checks
  const filteredDestinations = useMemo(() => {
    const destinations = getNearbyDestinations(currentLocation) || [];
    if (!searchQuery) return destinations;

    return destinations.filter(dest => 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentLocation, searchQuery]);

  // Group destinations: Albanian cities first, then others grouped by country
  const groupedIntercityDestinations = useMemo(() => {
    if (!filteredDestinations || !Array.isArray(filteredDestinations)) return {};
    const albania = filteredDestinations.filter(dest => dest.country === 'Albania');
    const others = filteredDestinations.filter(dest => dest.country !== 'Albania');
    // Group others by country
    const groupedOthers = others.reduce((acc, dest) => {
      if (!acc[dest.country]) acc[dest.country] = [];
      acc[dest.country].push(dest);
      return acc;
    }, {});
    return { Albania: albania, ...groupedOthers };
  }, [filteredDestinations]);

  // Fetch bus schedules for a specific station
  const fetchScheduleForStation = async (station) => {
    try {
      setLoading(true);
      // Get current time
      const now = new Date();
      const currentTime = now.toISOString();

      // Fetch real-time bus arrivals
      const response = await fetch(
        `${API_ENDPOINTS.TRANSIT_ARRIVALS}?location=${station.location.latitude},${station.location.longitude}&radius=100&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results) {
        // Process and format the schedule data
        const formattedSchedules = data.results.map(bus => ({
          time: new Date(bus.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          busNumber: bus.line.short_name || bus.line.name,
          destination: bus.destination,
          nextStop: bus.next_stop,
          minutesAway: Math.round((new Date(bus.arrival_time) - now) / (1000 * 60))
        }));

        // Sort by arrival time
        formattedSchedules.sort((a, b) => {
          const timeA = new Date(a.time);
          const timeB = new Date(b.time);
          return timeA - timeB;
        });

        setSchedules(formattedSchedules);

        // Get next buses for each line
        const nextBusesMap = {};
        formattedSchedules.forEach(bus => {
          if (!nextBusesMap[bus.busNumber] || bus.minutesAway < nextBusesMap[bus.busNumber].minutesAway) {
            nextBusesMap[bus.busNumber] = bus;
          }
        });
        setNextBuses(nextBusesMap);
      }
    } catch (error) {
      console.error('Error fetching bus schedule:', error);
      // Fallback to mock data if API fails
      setSchedules(mockScheduleData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle station selection and navigation
  const handleStationSelect = (station) => {
    setSelectedStation(station);
    fetchScheduleForStation(station);
  };

  // Navigate back to map with selected station
  const navigateToMap = (station) => {
    navigation.navigate('Map', {
      selectedStation: station,
      showStation: true
    });
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh data
      const locationToUse = currentLocation;
      if (locationToUse) {
        if (selectedTab === 'local') {
      await fetchScheduleForStation(selectedStation);
        } else {
          // Refresh intercity data
          const refreshedDestinations = getNearbyDestinations(locationToUse);
          setNearbyDestinations(refreshedDestinations);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [currentLocation, selectedTab, selectedStation]);

  // Animation for station selection
  const animateSelection = (id) => {
    setSelectedStationId(id);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Update mock data for local bus stops with Korçë-specific routes
  const localBusStops = [
    {
      id: 'stop1',
      name: 'Korçë Central Station',
      routes: [
        { 
          number: 'K1', 
          destinations: ['City Center', 'Old Bazaar', 'Cathedral of Resurrection'],
          schedule: ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00']
        },
        { 
          number: 'K2', 
          destinations: ['University Fan Noli', 'Regional Hospital', 'Sports Complex'],
          schedule: ['07:15', '07:45', '08:15', '08:45', '09:15', '09:45', '10:15']
        },
        {
          number: 'K3',
          destinations: ['Archaeological Museum', 'Education Museum', 'National Lyceum'],
          schedule: ['07:20', '08:00', '08:40', '09:20', '10:00', '10:40']
        }
      ]
    },
    {
      id: 'stop2',
      name: 'Old Bazaar Station',
      routes: [
        { 
          number: 'K4', 
          destinations: ['Korçë Cathedral', 'Illyrian Tombs', 'Medieval Museum'],
          schedule: ['07:10', '07:40', '08:10', '08:40', '09:10', '09:40', '10:10']
        },
        { 
          number: 'K5', 
          destinations: ['Fan Noli Square', 'Cultural Center', 'City Theater'],
          schedule: ['07:25', '07:55', '08:25', '08:55', '09:25', '09:55', '10:25']
        }
      ]
    },
    {
      id: 'stop3',
      name: 'University District',
      routes: [
        { 
          number: 'K6', 
          destinations: ['University Campus', 'Student Housing', 'City Library'],
          schedule: ['07:05', '07:35', '08:05', '08:35', '09:05', '09:35', '10:05']
        },
        { 
          number: 'K7', 
          destinations: ['Sports Center', 'Public Park', 'Shopping Center'],
          schedule: ['07:20', '07:50', '08:20', '08:50', '09:20', '09:50', '10:20']
        }
      ]
    },
    {
      id: 'stop4',
      name: 'Hospital Complex',
      routes: [
        { 
          number: 'K8', 
          destinations: ['Regional Hospital', 'Medical Center', 'Pharmacy District'],
          schedule: ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00']
        },
        { 
          number: 'K9', 
          destinations: ['Emergency Center', 'Clinic Zone', 'Health Institute'],
          schedule: ['07:15', '07:45', '08:15', '08:45', '09:15', '09:45', '10:15']
        }
      ]
    },
    {
      id: 'stop5',
      name: 'Cultural District',
      routes: [
        { 
          number: 'K10', 
          destinations: ['National Museum', 'Art Gallery', 'Concert Hall'],
          schedule: ['07:10', '07:40', '08:10', '08:40', '09:10', '09:40', '10:10']
        },
        { 
          number: 'K11', 
          destinations: ['Historical Center', 'Traditional Market', 'Craft Shops'],
          schedule: ['07:25', '07:55', '08:25', '08:55', '09:25', '09:55', '10:25']
        }
      ]
    }
  ];

  // Update section headers to be more specific to Korçë
  const localSections = [
    { title: 'Main City Routes', icon: 'star', 
      description: 'Popular routes covering central Korçë' },
    { title: 'University Routes', icon: 'school', 
      description: 'Routes serving Fan Noli University and surrounding areas' },
    { title: 'Cultural Routes', icon: 'museum', 
      description: 'Routes connecting historical and cultural sites' }
  ];

  // Add a function to filter nearby stops based on user location
  const getNearbyStops = useCallback((userLocation, stops) => {
    if (!userLocation) return stops;

    return stops.map(stop => ({
      ...stop,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        // Use Korçë's coordinates as default stop location if not provided
        stop.location?.latitude || 40.6186,
        stop.location?.longitude || 20.7808
      )
    })).sort((a, b) => a.distance - b.distance);
  }, []);

  // Update the stops when user location changes
  useEffect(() => {
    if (currentLocation) {
      const nearbyStops = getNearbyStops(currentLocation, localBusStops);
      // You can add state here to store nearby stops if needed
    }
  }, [currentLocation, getNearbyStops]);

  // Mock schedule data (fallback)
  const mockScheduleData = [
    { time: '07:00', busNumber: '101', destination: 'City Center', nextStop: 'Central Station', minutesAway: 5 },
    { time: '07:15', busNumber: '102', destination: 'Shopping Mall', nextStop: 'Mall Entrance', minutesAway: 10 },
    { time: '07:30', busNumber: '101', destination: 'City Center', nextStop: 'Central Station', minutesAway: 15 },
    { time: '07:45', busNumber: '103', destination: 'University', nextStop: 'University Gate', minutesAway: 20 },
    { time: '08:00', busNumber: '102', destination: 'Shopping Mall', nextStop: 'Mall Entrance', minutesAway: 25 },
  ];

  // Mock data for intercity buses
  const intercityBuses = [
    {
      id: 'inter1',
      destination: 'Athens',
      distance: '500km',
      departures: [
        { time: '08:00', price: '€25', duration: '5h 30m' },
        { time: '10:00', price: '€25', duration: '5h 30m' },
        { time: '14:00', price: '€25', duration: '5h 30m' },
      ]
    },
    {
      id: 'inter2',
      destination: 'Thessaloniki',
      distance: '300km',
      departures: [
        { time: '09:00', price: '€20', duration: '4h' },
        { time: '13:00', price: '€20', duration: '4h' },
        { time: '17:00', price: '€20', duration: '4h' },
      ]
    },
    {
      id: 'inter3',
      destination: 'Patras',
      distance: '200km',
      departures: [
        { time: '07:30', price: '€15', duration: '2h 30m' },
        { time: '11:30', price: '€15', duration: '2h 30m' },
        { time: '15:30', price: '€15', duration: '2h 30m' },
      ]
    }
  ];

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handlePayment = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    if (selectedPaymentMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }
    setShowTicket(true);
  };

  const renderPaymentMethods = () => (
    <View style={styles.paymentMethodsContainer}>
      <Text style={styles.sectionTitle}>Select Payment Method</Text>
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'card' && styles.selectedPaymentOption
          ]}
          onPress={() => setSelectedPaymentMethod('card')}
        >
          <Ionicons name="card-outline" size={24} color={selectedPaymentMethod === 'card' ? '#4CAF50' : '#666'} />
          <Text style={[styles.paymentOptionText, selectedPaymentMethod === 'card' && styles.selectedPaymentText]}>
            Credit/Debit Card
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'paypal' && styles.selectedPaymentOption
          ]}
          onPress={() => setSelectedPaymentMethod('paypal')}
        >
          <Image 
            source={require('../assets/paypal.png')} 
            style={styles.paypalIcon}
            resizeMode="contain"
          />
          <Text style={[styles.paymentOptionText, selectedPaymentMethod === 'paypal' && styles.selectedPaymentText]}>
            PayPal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCardDetails = () => (
    selectedPaymentMethod === 'card' && (
      <View style={styles.cardDetailsContainer}>
        <Text style={styles.sectionTitle}>Card Details</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            value={cardDetails.cardNumber}
            onChangeText={text => setCardDetails({ ...cardDetails, cardNumber: text })}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
            returnKeyType="next"
          />
        </View>
        <View style={styles.cardRow}>
          <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              value={cardDetails.expiryDate}
              onChangeText={text => setCardDetails({ ...cardDetails, expiryDate: text })}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
              returnKeyType="next"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              value={cardDetails.cvv}
              onChangeText={text => setCardDetails({ ...cardDetails, cvv: text })}
              placeholder="123"
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              returnKeyType="done"
            />
          </View>
        </View>
      </View>
    )
  );

  const renderPaymentForm = () => (
    <View style={styles.paymentForm}>
      <Text style={styles.formTitle}>Enter Your Details</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={text => setFormData({ ...formData, fullName: text })}
          placeholder="Your full name"
          returnKeyType="next"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={text => setFormData({ ...formData, email: text })}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={text => setFormData({ ...formData, phone: text })}
          placeholder="Your phone number"
          keyboardType="phone-pad"
          returnKeyType="next"
        />
      </View>
      {renderPaymentMethods()}
      {renderCardDetails()}
      <TouchableOpacity
        style={[styles.button, { marginTop: 20, marginBottom: 40 }]}
        onPress={handlePayment}
        disabled={!formData.fullName || !formData.email || !formData.phone}
      >
        <Text style={styles.buttonText}>Pay & Generate Ticket</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#81C784', '#388E3C', '#1B5E20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bus Schedule</Text>
      </LinearGradient>

      {/* Points Display */}
      <View style={styles.qrSection}>
        <View style={styles.pointsContainer}>
          <View style={styles.pointsTopSection}>
            <Image source={require('../assets/coin.png')} style={styles.coinIcon} />
            <Text style={styles.pointsValue}>{points}</Text>
          </View>
          <Text style={styles.pointsText}>ÆTHER Coins</Text>
        </View>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => Alert.alert('QR scanning is not available.')}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={22} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.scanButtonText}>Scan Ticket for Rewards!</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'local' && styles.activeTab]}
          onPress={() => setSelectedTab('local')}
        >
          <Ionicons 
            name="bus" 
            size={24} 
            color={selectedTab === 'local' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, selectedTab === 'local' && styles.activeTabText]}>
            Local Routes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'intercity' && styles.activeTab]}
          onPress={() => setSelectedTab('intercity')}
        >
          <Ionicons 
            name="bus" 
            size={24} 
            color={selectedTab === 'intercity' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, selectedTab === 'intercity' && styles.activeTabText]}>
            Intercity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {selectedTab === 'local' ? (
          // Local Bus Stops with Scrollable List
          <View style={styles.stopsContainer}>
            <ScrollView 
              style={styles.stationsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stationsListContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4CAF50']}
                  tintColor="#4CAF50"
                />
              }
            >
              {localSections.map((section, sectionIndex) => (
                <View key={section.title} style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name={section.icon} size={24} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                  {localBusStops.map(stop => (
                    <Animated.View
                      key={stop.id}
                      style={[
                        styles.stopCard,
                        {
                          transform: [
                            { scale: selectedStationId === stop.id ? scaleAnim : 1 }
                          ],
                          opacity: selectedStationId === stop.id ? fadeAnim : 1,
                        }
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => animateSelection(stop.id)}
                        style={[
                          styles.stopCardContent,
                          selectedStationId === stop.id && styles.selectedStopCard
                        ]}
                      >
                        <Text style={styles.stopName}>{stop.name}</Text>
                        {stop.routes.map((route, index) => (
                          <View key={index} style={styles.routeContainer}>
                            <View style={styles.routeHeader}>
                              <Text style={styles.routeNumber}>Bus {route.number}</Text>
                              <Text style={styles.routeDestinations}>
                                {route.destinations.join(' → ')}
                              </Text>
                            </View>
                            <ScrollView 
                              horizontal 
                              showsHorizontalScrollIndicator={false}
                              style={styles.scheduleScrollView}
                            >
                              <View style={styles.scheduleContainer}>
                                {route.schedule.map((time, timeIndex) => (
                                  <View key={timeIndex} style={styles.timeSlot}>
                                    <Text style={styles.timeText}>{time}</Text>
                                  </View>
                                ))}
                              </View>
                            </ScrollView>
                          </View>
                        ))}
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          // Intercity Buses Section
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cities or countries..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#aaa"
                returnKeyType="search"
                clearButtonMode="never"
              />
              {searchQuery !== '' && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView 
              style={styles.intercityContainer}
              contentContainerStyle={styles.intercityContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4CAF50']}
                  tintColor="#4CAF50"
                />
              }
            >
              {/* Albanian cities first, then other countries */}
              {Object.entries(groupedIntercityDestinations || {}).map(([country, destinations]) => (
                destinations.length > 0 && (
                  <View key={country} style={styles.countrySection}>
                    <View style={styles.countrySectionHeader}>
                      <Ionicons name="flag" size={24} color="#4CAF50" />
                      <Text style={styles.countrySectionTitle}>{country}</Text>
                    </View>
                    {Array.isArray(destinations) && destinations.map(destination => (
                      <Animated.View
                        key={destination.id}
                        style={[
                          styles.intercityCard,
                          {
                            transform: [
                              { scale: selectedStationId === destination.id ? scaleAnim : 1 }
                            ],
                            opacity: selectedStationId === destination.id ? fadeAnim : 1,
                          }
                        ]}
                      >
                        <TouchableOpacity
                          onPress={() => animateSelection(destination.id)}
                          style={[
                            styles.destinationContent,
                            selectedStationId === destination.id && styles.selectedDestination
                          ]}
                        >
                          <View style={styles.destinationHeader}>
                            <View style={styles.destinationInfo}>
                              <Text style={styles.destinationCity}>{destination.name}</Text>
                              <View style={styles.countryContainer}>
                                <Ionicons name="flag" size={16} color="#666" />
                                <Text style={styles.countryText}>{destination.country}</Text>
                              </View>
                            </View>
                            {/* Show distance in km and duration */}
                            <View style={{alignItems: 'flex-end'}}>
                              <Text style={styles.distance}>{Math.round(destination.distance)} km</Text>
                              {destination.departures && destination.departures[0] && (
                                <Text style={styles.duration}>{destination.departures[0].duration}</Text>
                              )}
                            </View>
                          </View>
                          {destination.departures.map((departure, index) => (
                            <View key={index} style={styles.departureRow}>
                              <View style={styles.departureTimeContainer}>
                                <Ionicons name="time-outline" size={16} color="#666" />
                                <Text style={styles.departureTime}>{departure.time}</Text>
                              </View>
                              <View style={styles.durationContainer}>
                                <Ionicons name="hourglass-outline" size={16} color="#666" />
                                <Text style={styles.duration}>{departure.duration}</Text>
                              </View>
                              <View style={styles.seatsContainer}>
                                <Ionicons name="people-outline" size={16} color="#666" />
                                <Text style={styles.seatsText}>{departure.available_seats} seats</Text>
                              </View>
                              <View style={styles.priceContainer}>
                                <Text style={styles.price}>{departure.price}</Text>
                                <TouchableOpacity 
                                  style={[
                                    styles.bookButton,
                                    departure.available_seats < 5 && styles.bookButtonUrgent
                                  ]}
                                  onPress={() => navigation.navigate('TicketPurchase', {
                                    departure: 'Korçë',
                                    destination: destination.name,
                                    time: departure.time,
                                    price: departure.price,
                                    duration: departure.duration
                                  })}
                                >
                                  <Text style={styles.bookButtonText}>
                                    {departure.available_seats < 5 ? 'Book Now!' : 'Book'}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </View>
                )
              ))}
            </ScrollView>
          </>
        )}
      </View>

      {showPaymentForm && !showTicket && renderPaymentForm()}
      
      {showTicket && (
        <View style={styles.ticketContainer}>
          {/* ... existing ticket view ... */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 100,
    paddingTop: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  qrSection: {
    backgroundColor: 'white',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pointsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 120,
  },
  pointsTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  coinIcon: {
    width: 36,
    height: 36,
    marginRight: 6,
  },
  pointsValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  pointsText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  scanButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    marginLeft: 3,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#e8f5e9',
  },
  tabText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 10,
  },
  stopsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 10,
  },
  stationsList: {
    flex: 1,
  },
  stationsListContent: {
    padding: 15,
    paddingBottom: 25,
  },
  scheduleScrollView: {
    marginTop: 8,
  },
  intercityContainer: {
    flex: 1,
  },
  intercityContent: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 25,
  },
  stopCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  scheduleContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  timeSlot: {
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 6,
    marginRight: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  intercityCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    minWidth: 0,
  },
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  destinationCity: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  distance: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
    marginBottom: 2,
  },
  duration: {
    fontSize: 13,
    color: '#388E3C',
    textAlign: 'right',
    fontWeight: '500',
  },
  departureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  departureTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 60,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  seatsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 50,
    textAlign: 'right',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginTop: 2,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#388E3C',
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionDeniedText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  countryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  destinationInfo: {
    flex: 1,
  },
  departureTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '25%',
  },
  countrySection: {
    marginBottom: 15,
  },
  countrySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  countrySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  stopCardContent: {
    padding: 15,
    borderRadius: 12,
  },
  selectedStopCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  destinationContent: {
    padding: 15,
    borderRadius: 12,
  },
  selectedDestination: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  stopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  routeDestinations: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 38,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    marginRight: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  paymentMethodsContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: 8,
  },
  selectedPaymentOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedPaymentText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  paypalIcon: {
    width: 24,
    height: 24,
  },
  cardDetailsContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentForm: {
    padding: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  field: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ticketContainer: {
    flex: 1,
    padding: 15,
  },
});

export default BusScheduleScreen;
