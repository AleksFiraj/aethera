import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, SafeAreaView, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatbotScreen from './ChatbotScreen';

const ChatbotWrapper = (WrappedComponent) => {
  return ({ navigation, ...props }) => {
    const [isChatbotVisible, setIsChatbotVisible] = useState(false);

    return (
      <View style={{ flex: 1 }}>
        <WrappedComponent navigation={navigation} {...props} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={isChatbotVisible}
          onRequestClose={() => setIsChatbotVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.headerRow}>
                  <Text style={styles.headerTitle}>GeNie, ÆTHERA Support</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsChatbotVisible(false)}
                  >
                    <Ionicons name="close" size={30} color="white" />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <ChatbotScreen />
                </View>
              </SafeAreaView>
            </View>
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
};

const styles = StyleSheet.create({
  chatbotButton: {
    position: 'absolute',
    bottom: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '80%',
    maxHeight: '98%',
    marginTop: 40,
    marginHorizontal: 0,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#388E3C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 0,
    textAlign: 'left',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 8,
    marginLeft: 10,
  },
});

export default ChatbotWrapper;
