import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';

const generatePasscode = () => {
  // Generate a 6-digit numeric passcode
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const RentVehiclePayment = ({ route, navigation }) => {
  const { mode, vehicle } = route.params;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [showTicket, setShowTicket] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const ticketData = JSON.stringify({
    ...formData,
    mode,
    vehicle,
    passcode,
    id: Date.now()
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
    const newPasscode = generatePasscode();
    setPasscode(newPasscode);
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
            />
          </View>
        </View>
      </View>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rent & Pay</Text>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!showTicket ? (
            <>
              <Text style={styles.heading}>Rent {mode === 'bicycle' ? 'Bike' : 'Scooter'}</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Vehicle Code</Text>
                <TextInput
                  style={[styles.input, styles.disabled]}
                  value={vehicle.code}
                  editable={false}
                />
              </View>
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
                <Text style={styles.buttonText}>Pay & Generate Passcode</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.ticketContainer}>
              <Text style={styles.ticketHeader}>Rental Ticket</Text>
              <View style={styles.ticketBody}>
                <View style={styles.details}>
                  <Text style={styles.detailLine}>Name: {formData.fullName}</Text>
                  <Text style={styles.detailLine}>Email: {formData.email}</Text>
                  <Text style={styles.detailLine}>Phone: {formData.phone}</Text>
                  <Text style={styles.detailLine}>Vehicle: {mode === 'bicycle' ? 'Bike' : 'Scooter'} ({vehicle.code})</Text>
                  <Text style={styles.detailLine}>Rental ID: {ticketData.slice(-6)}</Text>
                </View>
                <View style={styles.qr}>
                  <QRCode value={ticketData} size={100} />
                </View>
              </View>
              <View style={styles.passcodeContainer}>
                <Text style={styles.passcodeLabel}>Your Unlock Passcode</Text>
                <Text style={styles.passcode}>{passcode}</Text>
                <Text style={styles.passcodeHint}>(Enter this code on the {mode === 'bicycle' ? 'bike' : 'scooter'} to unlock and start your ride!)</Text>
              </View>
              <TouchableOpacity
                style={[styles.button, { marginTop: 20, backgroundColor: '#2196F3' }]}
                onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Back to Map</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: {
    height: 80,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  backButton: {
    marginRight: 15,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  form: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  field: { width: '100%', marginBottom: 15 },
  label: { marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  disabled: { backgroundColor: '#eee' },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ticketContainer: {
    width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 5,
  },
  ticketHeader: {
    fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12,
    borderBottomWidth: 1, borderColor: '#ddd', paddingBottom: 8,
  },
  ticketBody: { flexDirection: 'row', justifyContent: 'space-between' },
  details: { flex: 1, paddingRight: 10 }, detailLine: { fontSize: 16, marginBottom: 6 },
  qr: { width: 100, height: 100, backgroundColor: '#fff', padding: 4, borderRadius: 8 },
  passcodeContainer: {
    marginTop: 24,
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  passcodeLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  passcode: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 4,
  },
  passcodeHint: {
    color: '#e3f2fd',
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  paymentMethodsContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
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
});

export default RentVehiclePayment; 