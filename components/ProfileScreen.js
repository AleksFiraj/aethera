import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { BlurView } from 'expo-blur';

// Mock rewards data
const MOCK_REWARDS = [
  {
    id: '1',
    title: 'Free Bus Ticket',
    description: 'Get a free ticket for any local bus route',
    pointsCost: 50,
    image: 'https://img.icons8.com/color/96/000000/bus2.png'
  },
  {
    id: '2',
    title: 'Eco Coffee Discount',
    description: '50% off at participating eco-friendly cafes',
    pointsCost: 35,
    image: 'https://img.icons8.com/color/96/000000/coffee.png'
  },
  {
    id: '3',
    title: 'Carbon Offset Credit',
    description: 'Offset 100kg of carbon emissions through our partner program',
    pointsCost: 100,
    image: 'https://img.icons8.com/color/96/000000/tree.png'
  },
  {
    id: '4',
    title: 'Bike Rental',
    description: 'Free 2-hour bike rental at any city station',
    pointsCost: 75,
    image: 'https://img.icons8.com/color/96/000000/bicycle.png'
  }
];

const ProfileScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    phone: '+355 69 388 7847',
    avatar: 'https://img.icons8.com/ios-filled/100/4CAF50/user-male-circle.png',
    points: 85
  });
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('sq');
  const [enableAds, setEnableAds] = useState(false);
  const [rewards, setRewards] = useState(MOCK_REWARDS);
  const [redeemableRewards, setRedeemableRewards] = useState([]);
  const POINTS_FILE_URI = `${FileSystem.documentDirectory}points.json`;
  const [settingsVisible, setSettingsVisible] = useState(false);
  const drawerAnim = useRef(new Animated.Value(1)).current; // 1 = offscreen, 0 = onscreen

  useEffect(() => {
    const loadData = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(POINTS_FILE_URI);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(POINTS_FILE_URI);
          const pointsData = JSON.parse(content);
          setUserData(prev => ({
            ...prev,
            points: pointsData.points || 85
          }));
        }
        
        const settings = await AsyncStorage.getItem('userSettings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          setNotifications(parsedSettings.notifications ?? true);
          setDarkMode(parsedSettings.darkMode ?? false);
          setLanguage(parsedSettings.language ?? 'sq');
          setEnableAds(parsedSettings.enableAds ?? false);
        }
        
        setRedeemableRewards(
          rewards && Array.isArray(rewards) ? rewards.filter(reward => userData.points >= reward.pointsCost) : []
        );
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setRedeemableRewards(
      rewards && Array.isArray(rewards) ? rewards.filter(reward => userData.points >= reward.pointsCost) : []
    );
  }, [userData.points, rewards]);

  // Animate drawer in/out
  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: settingsVisible ? 0 : 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [settingsVisible]);

  const saveSettings = async () => {
    try {
      const settings = {
        darkMode,
        notifications,
        language,
        enableAds
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateUserData = async () => {
    try {
      setIsLoading(true);
      
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert('Success', 'User profile updated successfully');
      }, 1000);
      
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Failed to update user profile');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userSettings');
              navigation.navigate('SignIn');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleRedeemReward = (reward) => {
    Alert.alert(
      "Redeem Reward",
      `Are you sure you want to redeem ${reward.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Redeem", 
          onPress: async () => {
            try {
              const newPoints = userData.points - reward.pointsCost;
              setUserData(prev => ({ ...prev, points: newPoints }));
              await FileSystem.writeAsStringAsync(POINTS_FILE_URI, JSON.stringify({ points: newPoints }));
              Alert.alert('Success', 'Reward redeemed successfully!');
            } catch (error) {
              console.error('Error redeeming reward:', error);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={darkMode ? ['#232526', '#0f2027'] : ['#e0f7fa', '#b2dfdb', '#81c784']}
      style={styles.gradientBg}
    >
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>  
        <LinearGradient
          colors={darkMode ? ['#1B5E20', '#0A280D'] : ['#81C784', '#388E3C', '#1B5E20']}
          style={styles.header}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: userData.avatar || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.7}>
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.email}>{userData.email}</Text>
          </View>
          <TouchableOpacity style={styles.settingsIconButton} onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
        <ScrollView style={[styles.content, darkMode && styles.contentDark]} contentContainerStyle={styles.scrollContent}>
          {/* Personal Information */}
          <BlurView intensity={60} tint={darkMode ? 'dark' : 'light'} style={styles.sectionGlass}>
            {/* Personal Information */}
            <View style={styles.personalInfoContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, darkMode && styles.labelDark]}>Name</Text>
                <TextInput
                  style={[styles.input, darkMode && styles.inputDark]}
                  value={userData.name}
                  onChangeText={(text) => setUserData({ ...userData, name: text })}
                  placeholder="Your Name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, darkMode && styles.labelDark]}>Email</Text>
                <TextInput
                  style={[styles.input, darkMode && styles.inputDark]}
                  value={userData.email}
                  onChangeText={(text) => setUserData({ ...userData, email: text })}
                  placeholder="email@example.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, darkMode && styles.labelDark]}>Phone</Text>
                <TextInput
                  style={[styles.input, darkMode && styles.inputDark]}
                  value={userData.phone}
                  onChangeText={(text) => setUserData({ ...userData, phone: text })}
                  placeholder="Your Phone Number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
              <TouchableOpacity style={styles.updateButton} onPress={updateUserData} activeOpacity={0.85}>
                <Text style={styles.updateButtonText}>Update Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Points Card */}
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.pointsCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.pointsCardContent}>
                <View style={styles.pointsInfoContainer}>
                  <Text style={styles.balanceTitle}>Balance</Text>
                  <View style={styles.pointsTopSection}>
                    <Image source={require('../assets/coin.png')} style={styles.coinIcon} />
                    <Text style={styles.pointsValue}>{userData.points}</Text>
                  </View>
                  <Text style={styles.pointsLabel}>ÆTHER Coins</Text>
                </View>
                <View style={styles.pointsIcon}>
                  <Image source={require('../assets/coin.png')} style={styles.largeCoinIcon} />
                </View>
              </View>
            </LinearGradient>
          </BlurView>
          {/* Rewards Section */}
          <BlurView intensity={60} tint={darkMode ? 'dark' : 'light'} style={[styles.sectionGlass, styles.rewardsSection]}>
            <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Rewards</Text>
            <Text style={styles.rewardsSubtitle}>Redeem your points for eco-friendly rewards</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsListScroll} contentContainerStyle={styles.rewardsList}>
              {rewards.map(reward => (
                <View key={reward.id} style={[styles.rewardCardGlass, darkMode && styles.rewardCardGlassDark]}>
                  <View style={styles.rewardImageWrapper}>
                    <Image 
                      source={{ uri: reward.image }} 
                      style={styles.rewardImage} 
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                    <View style={styles.rewardBottom}>
                      <View style={styles.rewardPoints}>
                        <Image source={require('../assets/coin.png')} style={styles.smallCoinIcon} />
                        <Text style={styles.rewardPointsText}>{reward.pointsCost} points</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity 
                      style={[
                        styles.redeemButton,
                        userData.points < reward.pointsCost && styles.redeemButtonDisabled
                      ]}
                      onPress={() => handleRedeemReward(reward)}
                      disabled={userData.points < reward.pointsCost}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.redeemButtonText}>
                        {userData.points >= reward.pointsCost ? 'Redeem' : 'Need More Points'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </BlurView>
          {/* Ads Toggle Card */}
          <LinearGradient
            colors={['#81C784', '#4CAF50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.adsCard}
          >
            <View style={styles.adsContent}>
              <View style={styles.adsInfo}>
                <View style={styles.adsIconContainer}>
                  <Ionicons name="megaphone-outline" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.adsTextContainer}>
                  <Text style={styles.adsTitle}>Enable Ads</Text>
                  <Text style={styles.adsDescription}>Get a free bus ticket every week!</Text>
                </View>
              </View>
              <Switch
                value={enableAds}
                onValueChange={(value) => {
                  if (value) {
                    Alert.alert(
                      "Enable Ads",
                      "By enabling ads, you'll receive a free bus ticket every week! Would you like to proceed?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                          onPress: () => setEnableAds(false)
                        },
                        {
                          text: "Enable",
                          onPress: () => {
                            setEnableAds(true);
                            Alert.alert(
                              "Success!",
                              "Ads have been enabled. You'll receive your first free ticket next week!",
                              [{ text: "OK" }]
                            );
                          }
                        }
                      ]
                    );
                  } else {
                    Alert.alert(
                      "Disable Ads",
                      "Are you sure you want to disable ads? You'll no longer receive free weekly tickets.",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                          onPress: () => setEnableAds(true)
                        },
                        {
                          text: "Disable",
                          style: "destructive",
                          onPress: () => {
                            setEnableAds(false);
                            Alert.alert(
                              "Ads Disabled",
                              "You've disabled ads. You can enable them again anytime to receive free weekly tickets.",
                              [{ text: "OK" }]
                            );
                          }
                        }
                      ]
                    );
                  }
                }}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.5)' }}
                thumbColor={enableAds ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>
          </LinearGradient>
        </ScrollView>
        {/* Settings Sidebar Drawer */}
        {settingsVisible && (
          <TouchableOpacity style={styles.settingsDrawerOverlay} activeOpacity={1} onPress={() => setSettingsVisible(false)}>
            <Animated.View
              style={[styles.settingsDrawer, {
                transform: [{ translateX: drawerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }) }],
              }]}
            >
              <BlurView intensity={80} tint={darkMode ? 'dark' : 'light'} style={styles.settingsDrawerGlass}>
                <TouchableOpacity style={styles.settingsModalClose} onPress={() => setSettingsVisible(false)}>
                  <Ionicons name="close" size={28} color={darkMode ? '#fff' : '#333'} />
                </TouchableOpacity>
                <Text style={[styles.sectionTitle, {marginTop: 10, marginBottom: 18}, darkMode && styles.sectionTitleDark]}>Settings</Text>
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <Ionicons name="notifications-outline" size={24} color="#4CAF50" />
                    <Text style={styles.settingLabel}>Enable Notifications</Text>
                  </View>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#d3d3d3', true: '#81c784' }}
                    thumbColor={notifications ? '#4CAF50' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <Ionicons name="moon-outline" size={24} color="#4CAF50" />
                    <Text style={styles.settingLabel}>Dark Mode</Text>
                  </View>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#d3d3d3', true: '#81c784' }}
                    thumbColor={darkMode ? '#4CAF50' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <Ionicons name="globe-outline" size={24} color="#4CAF50" />
                    <Text style={styles.settingLabel}>Language</Text>
                  </View>
                  <View style={styles.languageSelectorGlass}>
                    <TouchableOpacity
                      style={[styles.languageOptionGlass, language === 'sq' && styles.selectedLanguageGlass]}
                      onPress={() => setLanguage('sq')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.languageText, language === 'sq' && styles.selectedLanguageText]}>SQ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.languageOptionGlass, language === 'en' && styles.selectedLanguageGlass]}
                      onPress={() => setLanguage('en')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.languageText, language === 'en' && styles.selectedLanguageText]}>EN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={saveSettings} activeOpacity={0.85}>
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.logoutButton} 
                  onPress={handleLogout}
                  activeOpacity={0.85}
                >
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#e0e0e0',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  contentDark: {
    backgroundColor: '#121212',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
  },
  labelDark: {
    color: '#999',
  },
  input: {
    height: 36,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: '#fff',
  },
  inputDark: {
    borderColor: '#333',
    backgroundColor: '#2D2D2D',
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemDark: {
    borderBottomColor: '#333',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  settingItemTitleDark: {
    color: '#fff',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  settingItemValueDark: {
    color: '#999',
  },
  buttonContainer: {
    padding: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradientBg: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  sectionGlass: {
    marginTop: 18,
    marginHorizontal: 12,
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    padding: 0,
    backgroundColor: '#fff',
  },
  pointsCardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  pointsInfoContainer: {
    flex: 1,
  },
  pointsTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  coinIcon: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  largeCoinIcon: {
    width: 80,
    height: 80,
    opacity: 0.2,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pointsIcon: {
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 6,
  },
  rewardsSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  rewardsListScroll: {
    marginTop: 10,
    marginBottom: 8,
    minHeight: 180,
  },
  rewardsList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  rewardCardGlass: {
    width: 160,
    height: 270,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  rewardCardGlassDark: {
    backgroundColor: '#232526',
    borderColor: 'transparent',
    borderRadius: 0,
  },
  rewardImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  rewardImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rewardInfo: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  rewardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardPointsText: {
    fontSize: 13,
    color: '#388E3C',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  redeemButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 2,
  },
  redeemButtonDisabled: {
    backgroundColor: '#ddd',
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  languageSelectorGlass: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 4,
    marginTop: 4,
  },
  languageOptionGlass: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  selectedLanguageGlass: {
    backgroundColor: '#4CAF50',
  },
  languageText: {
    fontSize: 16,
    color: '#666',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
  },
  settingsIconButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 24,
    right: 18,
    zIndex: 20,
    backgroundColor: 'rgba(76,175,80,0.85)',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsModalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  settingsDrawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 100,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  settingsDrawer: {
    width: '80%',
    maxWidth: 400,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  settingsDrawerGlass: {
    flex: 1,
    padding: 28,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  smallCoinIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  adsCard: {
    borderRadius: 16,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  adsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  adsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adsTextContainer: {
    flex: 1,
  },
  adsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  adsDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  personalInfoContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  balanceTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  rewardsSection: {
    marginBottom: 20,
  },
});

export default ProfileScreen;
