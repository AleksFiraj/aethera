import React, { useState, useEffect, useRef } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
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
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Added for gradient
import firebase from '../utils/firebase'; // Import Firebase configuration

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

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Invalid email format. Please check and try again.');
      }

      // For demo purposes, bypass actual authentication and proceed to main app
      // This simulates a successful login without requiring Firebase auth
      console.log('User logged in successfully!');
      navigation.navigate('MainTab');
      
      /* Uncomment when Firebase auth is fully configured and needed
      const auth = firebase.auth();
      await auth.signInWithEmailAndPassword(email, password);
      */
    } catch (error) {
      let errorMessage = 'Login failed. Invalid email or password.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please register.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password. Please try again.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Invalid email format. Please check and try again.';
      }
      Alert.alert('Login Failed', errorMessage);
      console.error('Error logging in: ', error);
    }
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handlePasswordReset = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    try {
      // For demo purposes, just show success message without sending actual email
      Alert.alert(
        'Password Reset',
        'A password reset link has been sent to your email address.'
      );
      
      /* Uncomment when Firebase auth is fully configured and needed
      const auth = firebase.auth();
      await auth.sendPasswordResetEmail(email);
      */
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error resetting password: ', error);
    }
  };

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
        .catch(error => {
          Alert.alert('Google Sign-In Error', error.message);
        });
      */
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  const handleAppleSignIn = async () => {
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
      const appleCredential = firebase.auth.AppleAuthProvider.credential(credential.identityToken);
      await firebase.auth().signInWithCredential(appleCredential);
      */
    } catch (error) {
      Alert.alert('Apple Sign-In Error', error.message);
    }
  };

  const handleGuestSignIn = async () => {
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
              <Text style={styles.headerTitle}>Welcome back!</Text>
            </View>
            <View style={styles.formContainer}>
              <AnimatedInputField
                label="Email"
                value={email}
                onChangeText={setEmail}
              />
              <AnimatedInputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity onPress={handlePasswordReset} style={styles.forgotPassword}>
                <Text style={styles.forgot}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogin}>
                <LinearGradient 
                  colors={['#66BB6A', '#43A047', '#2E7D32']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtn}
                >
                  <Text style={styles.loginText}>LOGIN</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.socialLoginContainer}>
                <TouchableOpacity style={styles.socialLoginBtn} onPress={handleGoogleSignIn}>
                  <Image
                    source={require('../assets/google.png')}
                    style={styles.socialLoginLogo}
                  />
                  <Text style={styles.socialLoginText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialLoginBtn} onPress={handleAppleSignIn}>
                  <Image
                    source={require('../assets/apple.jpeg')}
                    style={styles.socialLoginLogo}
                  />
                  <Text style={styles.socialLoginText}>Apple ID</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleGuestSignIn}>
                <Text style={styles.guestText}>Continue as Guest</Text>
              </TouchableOpacity>
              <View style={styles.bottomRightContainer}>
                <Text style={styles.alreadyText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signInButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  forgot: {
    color: '#4CAF50',
    fontSize: 14,
  },
  loginBtn: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
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
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    padding: 10,
  },
  socialLoginLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialLoginText: {
    fontSize: 16,
    color: '#003f5c',
  },
  guestText: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
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
  signupText: {
    color: '#fa8681',
    fontSize: 14,
  },
});

export default SignInScreen;