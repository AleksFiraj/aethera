import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';

const TicketPurchaseForm = ({ route }) => {
  const navigation = useNavigation();
  const { departure, destination, time, price, duration } = route.params;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passengers: '1',
  });
  const [showTicket, setShowTicket] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const ticketData = JSON.stringify({
    ...formData,
    departure,
    destination,
    time,
    price,
    duration,
    id: Date.now()
  });

  const handlePurchase = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!showTicket ? (
            <>
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
                <Text style={styles.headerTitle}>Purchase Ticket</Text>
              </LinearGradient>

              <View style={styles.form}>
                <Text style={styles.heading}>Bus Ticket Details</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Route</Text>
                  <TextInput
                    style={[styles.input, styles.disabled]}
                    value={`${departure} → ${destination}`}
                    editable={false}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Departure Time</Text>
                  <TextInput
                    style={[styles.input, styles.disabled]}
                    value={time}
                    editable={false}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Duration</Text>
                  <TextInput
                    style={[styles.input, styles.disabled]}
                    value={duration}
                    editable={false}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={[styles.input, styles.disabled]}
                    value={price}
                    editable={false}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({...formData, fullName: text})}
                    placeholder="Your full name"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData({...formData, email: text})}
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
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                    placeholder="Your phone number"
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Number of Passengers</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.passengers}
                    onChangeText={(text) => setFormData({...formData, passengers: text})}
                    placeholder="Number of passengers"
                    keyboardType="number-pad"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Date of Travel</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {selectedDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setSelectedDate(selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}

                {renderPaymentMethods()}
                {renderCardDetails()}

                <TouchableOpacity
                  style={[styles.button, { marginTop: 20, marginBottom: 40 }]}
                  onPress={handlePurchase}
                  disabled={!formData.fullName || !formData.email || !formData.phone}
                >
                  <Text style={styles.buttonText}>Pay & Generate Ticket</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.ticketContainer}>
              <Text style={styles.ticketHeader}>Bus Ticket</Text>
              <View style={styles.ticketBody}>
                <View style={styles.details}>
                  <Text style={styles.detailLine}>Name: {formData.fullName}</Text>
                  <Text style={styles.detailLine}>Email: {formData.email}</Text>
                  <Text style={styles.detailLine}>Phone: {formData.phone}</Text>
                  <Text style={styles.detailLine}>Route: {departure} → {destination}</Text>
                  <Text style={styles.detailLine}>Departure: {time}</Text>
                  <Text style={styles.detailLine}>Duration: {duration}</Text>
                  <Text style={styles.detailLine}>Price: {price}</Text>
                  <Text style={styles.detailLine}>Passengers: {formData.passengers}</Text>
                  <Text style={styles.detailLine}>Date: {selectedDate.toLocaleDateString()}</Text>
                  <Text style={styles.detailLine}>Ticket ID: {ticketData.slice(-6)}</Text>
                </View>
                <View style={styles.qr}>
                  <QRCode value={ticketData} size={100} />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={() => navigation.navigate('BusSchedule')}
              >
                <Text style={styles.buttonText}>Back to Schedule</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  form: {
    padding: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  field: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  disabled: {
    backgroundColor: '#eee',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  ticketHeader: {
    fontSize: 20,
    marginTop: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  ticketBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  details: {
    flex: 1,
    paddingRight: 10,
  },
  detailLine: {
    fontSize: 16,
    marginBottom: 6,
  },
  qr: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 8,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
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

export default TicketPurchaseForm; 