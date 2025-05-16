import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './MapScreen';
import ProfileScreen from './ProfileScreen';
import NotificationsScreen from './NotificationsScreen';
import BusScheduleScreen from './BusScheduleScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatbotScreen from './ChatbotScreen';

const Tab = createBottomTabNavigator();

const MainTab = ({ navigation }) => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false); 
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Map"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Map':
                iconName = focused ? 'map' : 'map-outline';
                break;
              case 'Notifications':
                iconName = focused ? 'notifications' : 'notifications-outline';
                break;
              case 'BusSchedule':
                iconName = focused ? 'bus' : 'bus-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                iconName = 'help-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: '#f8f8f8',
            paddingBottom: 10,
            height: 60,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'gray',
          tabBarIconStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 4,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ 
            title: 'Harta'
          }} 
        />
        <Tab.Screen 
          name="Notifications" 
          component={NotificationsScreen} 
          options={{ 
            title: 'Njoftime & Të Reja'
          }} 
        />
        <Tab.Screen 
          name="BusSchedule" 
          component={BusScheduleScreen} 
          options={{ 
            title: 'Orari i Autobusëve'
          }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ 
            title: 'Profili'
          }} 
        />
      </Tab.Navigator>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isChatbotVisible}
        onRequestClose={() => setIsChatbotVisible(false)}
      >
        <View style={styles.modalView}>
          <ChatbotScreen />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsChatbotVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => setIsChatbotVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  chatbotButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 10,
  },
});

export default MainTab;
