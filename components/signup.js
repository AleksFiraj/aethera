import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Firebase & Social Sign-In imports
import firebase from '../utils/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { getAuth, signInAnonymously } from 'firebase/auth';

/**
 * AnimatedInputField
 * - Displays a label above a borderless text input.
 * - An animated underline expands when the input is focused.
 */
const AnimatedInputField = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const underlineAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(underlineAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(underlineAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={styles.textInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <Animated.View
        style={[
          styles.underline,
          { transform: [{ scaleX: underlineAnim }] },
        ]}
      />
    </View>
  );
};

const SignUpScreen = ({ navigation }) => {
  // Input state
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Google auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '357207509578-lr9abvqfbop6leu8pvei0i67ssg0dn5o.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // For demo purposes, bypass actual Google auth and proceed to main app
      Alert.alert('Signed in with Google!');
      navigation.navigate('MainTab');
      
      /* Uncomment when Firebase auth is fully configured and needed
      const { id_token } = response.params;
      const credential = firebase.auth.GoogleAuthProvider.credential(id_token);
      firebase
        .auth()
        .signInWithCredential(credential)
        .then(() => {
          Alert.alert('Signed in with Google!');
          navigation.navigate('MainTab');
        })
        .catch((error) => {
          Alert.alert('Google Sign-In Error', error.message);
        });
      */
    }
  }, [response]);

  // Social handlers
  const handleGoogleSignUp = () => {
    promptAsync();
  };

  const handleAppleSignUp = async () => {
    try {
      // For demo purposes, bypass actual Apple auth and proceed to main app
      Alert.alert('Signed in with Apple!');
      navigation.navigate('MainTab');
      
      /* Uncomment when Apple auth is fully configured and needed
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const appleCredential = firebase.auth.AppleAuthProvider.credential(
        credential.identityToken
      );
      await firebase.auth().signInWithCredential(appleCredential);
      */
    } catch (error) {
      Alert.alert('Apple Sign-In Error', error.message);
    }
  };

  const handleGuestSignUp = async () => {
    try {
      // For demo purposes, bypass actual anonymous auth and proceed to main app
      Alert.alert('Signed in as Guest');
      navigation.navigate('MainTab');
      
      /* Uncomment when Firebase anonymous auth is fully configured and needed
      const auth = getAuth();
      await signInAnonymously(auth);
      */
    } catch (error) {
      Alert.alert('Guest Sign-In Error', error.message);
    }
  };

  // Regular email sign-up
  const handleSignUp = async () => {
    if (!fullName) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!emailOrPhone) {
      Alert.alert('Error', 'Please enter your email (or phone if configured)');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      // For demo purposes, bypass actual Firebase auth and proceed to show success message
      Alert.alert(
        'Account Created',
        'Your account has been created successfully!'
      );
      // Navigate to sign in page
      navigation.navigate('SignIn');
      
      /* Uncomment when Firebase auth is fully configured and needed
      const auth = firebase.auth();
      const userCredential = await auth.createUserWithEmailAndPassword(
        emailOrPhone,
        password
      );
      const user = userCredential.user;
      await user.sendEmailVerification();
      Alert.alert(
        'Verify your email',
        'A verification email has been sent. Please verify to complete sign-up.'
      );
      */
    } catch (error) {
      Alert.alert('Sign-Up Error', error.message);
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={['#81C784', '#388E3C', '#1B5E20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Create Your </Text>
              <Text style={styles.headerTitle}>Account</Text>
            </View>

            <View style={styles.formContainer}>
              <AnimatedInputField
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />
              <AnimatedInputField
                label="Email"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
              />
              <AnimatedInputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <AnimatedInputField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity onPress={handleSignUp}>
                <LinearGradient 
                  colors={['#66BB6A', '#43A047', '#2E7D32']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signUpButton}
                >
                  <Text style={styles.signUpButtonText}>SIGN UP</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.socialIconsContainer}>
                <TouchableOpacity style={styles.iconWrapper} onPress={handleGoogleSignUp}>
                  <Image
                    source={require('../assets/google.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconWrapper} onPress={handleAppleSignUp}>
                  <Image
                    source={require('../assets/apple.jpeg')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconWrapper} onPress={handleGuestSignUp}>
                  <Image
                    source={require('../assets/guest.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomRightContainer}>
                <Text style={styles.alreadyText}>Already have an account</Text>
                <TouchableOpacity onPress={handleSignIn}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    height: 250,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 50,
    marginTop: -30,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 5,
  },
  textInput: {
    height: 40,
    fontSize: 16,
    color: '#666',
    paddingVertical: 0,
  },
  underline: {
    height: 2,
    backgroundColor: '#4CAF50',
    width: '100%',
  },
  signUpButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    marginHorizontal: 15,
    padding: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
  bottomRightContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  alreadyText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  signInButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});