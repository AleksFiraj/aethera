import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Provider as PaperProvider } from 'react-native-paper';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Import screen components
import WelcomeScreen from './components/welcome';
import SignInScreen from './components/signin';
import SignUpScreen from './components/signup';
import MapScreen from './components/MapScreen';
import ProfileScreen from './components/ProfileScreen';
import NewsScreen from './components/NewsScreen';
import BusScheduleScreen from './components/BusScheduleScreen';
import ChatbotScreen from './components/ChatbotScreen'; 
import ChatbotWrapper from './components/ChatbotWrapper';
import TicketPurchaseForm from './components/TicketPurchaseForm';
import RentVehicleMap from './components/RentVehicleMap';
import RentVehiclePayment from './components/RentVehiclePayment';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTab() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          }
             else if (route.name === 'BusSchedule') {
          iconName = focused ? 'bus' : 'bus-outline'; }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#f8f8f8',
          paddingBottom: 10,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Tab.Screen name="News" component={NewsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="BusSchedule" component={BusScheduleScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const WrappedMainTab = ChatbotWrapper(MainTab);

function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignIn">
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MainTab" component={WrappedMainTab} options={{ headerShown: false }} />
          <Stack.Screen name="BusSchedule" component={BusScheduleScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TicketPurchase" component={TicketPurchaseForm} options={{ headerShown: false }} />
          <Stack.Screen name="RentVehicleMap" component={RentVehicleMap} options={{ headerShown: false }} />
          <Stack.Screen name="RentVehiclePayment" component={RentVehiclePayment} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
