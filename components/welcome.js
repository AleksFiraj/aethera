import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { FlatList } from "react-native";

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textArray = [
    "Mirësevini në ÆTHERA – udhëtimi juaj ekologjik fillon këtu!",
    "Eksploroni mënyra të reja për të lëvizur në mënyrë të qëndrueshme.",
    "Bashkohuni me komunitetin tonë për një të ardhme më të gjelbër."
  ];

  useEffect(() => {
    // Fade in animation when screen mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Autoplay effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % textArray.length;
        // Scroll FlatList to next index
        if (this.swiperRef) {
          this.swiperRef.scrollToIndex({ index: nextIndex, animated: true });
        }
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    // Fade out animation before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate("SignIn");
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <LinearGradient 
          colors={['#81C784', '#388E3C', '#1B5E20']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        >
          <View style={styles.content}>
            <View style={styles.logoSection}>
              <Image 
                source={require("../assets/favicon.png")} 
                style={styles.logo} 
              />
              <Text style={styles.logoText}>ÆTHERA</Text>
            </View>

            <View style={styles.swiperSection}>
              <FlatList
                ref={swiperRef => (this.swiperRef = swiperRef)}
                data={textArray}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.slideContainer}>
                    <Text style={styles.slideText}>{item}</Text>
                    {/* Pagination Dots below the sentence */}
                    <View style={styles.pagination}>
                      {textArray.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            currentIndex === i && styles.activeDot
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}
                onMomentumScrollEnd={event => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / width);
                  setCurrentIndex(index);
                }}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                initialScrollIndex={0}
              />
            </View>

            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.getStartedButton}
            >
              <LinearGradient 
                colors={['#66BB6A', '#43A047', '#2E7D32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  swiperSection: {
    height: 180,
    width: '100%',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 10,
  },
  slideText: {
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 15,
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 15,
  },
  getStartedButton: {
    marginHorizontal: 30,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default WelcomeScreen;
