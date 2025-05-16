import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// TODO: Store your Google Speech-to-Text API key securely (e.g., in .env or config)
const GOOGLE_SPEECH_API_KEY = 'AIzaSyAS03G4S6tbzxr81Yxmi-ZJZ6AJjhEfAN8';
const OPENAI_API_KEY = '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';

const SYSTEM_PROMPT = `You are GeNie, the AI assistant for the ÆTHERA eco-mobility app. Your main focus is to help users with:
- Understanding and using eco-friendly transport options (bus, bike, scooter, car, walk)
- Explaining how to earn and use ÆTHER Coins (rewards)
- Guiding users through the app's features (map, schedules, ticket purchase, vehicle rental, chatbot)
- Providing tips for sustainable travel and maximizing rewards
- Offering support and answering questions about the app
Always be friendly, concise, and helpful. If a user asks about something outside the app, politely redirect them to app-related topics.`;

const QUICK_MESSAGES = [
  'What can you do?',
  'How do I earn ÆTHER Coins?',
  'Show me eco routes',
  'Contact support',
  'How do I rent a bike or scooter?',
  'How do I buy a bus ticket?',
];

const MIN_RECORDING_DURATION_MS = 1000; // 1 second

async function fetchAIResponse(prompt) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      return 'Sorry, I could not generate a response.';
    }
  } catch (error) {
    return 'Error connecting to AI service.';
  }
}

async function speechToTextGoogle(uri) {
  try {
    // Debug: log audio URI and file size
    const fileInfo = await FileSystem.getInfoAsync(uri);
    console.log('Audio URI:', uri, 'size:', fileInfo.size);
    if (!fileInfo.exists || fileInfo.size < 2000) {
      // File is too small, likely silent or too short
      return { transcript: '', error: 'Audio too short or silent. Please speak clearly and try again.' };
    }
    const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    console.log('Audio base64 length:', base64Audio.length);
    const googleRes = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          audioChannelCount: 1,
        },
        audio: { content: base64Audio },
      }),
    });
    const googleData = await googleRes.json();
    console.log('Google STT response:', JSON.stringify(googleData));
    if (googleData.results && googleData.results[0] && googleData.results[0].alternatives[0]) {
      return { transcript: googleData.results[0].alternatives[0].transcript, error: null };
    } else {
      return { transcript: '', error: 'No speech detected. Please try again and speak clearly.' };
    }
  } catch (e) {
    console.log('STT error:', e);
    return { transcript: '', error: 'Speech recognition failed. Please try again.' };
  }
}

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const recordingRef = useRef(null);

  // Send message to AI and auto-speak the response
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    // Get AI response from OpenAI
    const aiText = await fetchAIResponse(text);
    const aiMsg = { id: (Date.now() + 1).toString(), text: aiText, sender: 'ai' };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    // Auto-speak the AI response
    Speech.speak(aiText, { language: 'en' });
  };

  // Start/stop recording and handle SST
  const handleMicPress = async () => {
    if (!recording) {
      try {
        setRecording(true);
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(
          {
            isMeteringEnabled: false,
            android: {
              extension: '.wav',
              outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT,
              audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
              sampleRate: 16000,
              numberOfChannels: 1,
              bitRate: 256000,
            },
            ios: {
              extension: '.wav',
              audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
              sampleRate: 16000,
              numberOfChannels: 1,
              bitRate: 256000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
          }
        );
        recordingRef.current = recording;
        recording._startTime = Date.now();
      } catch (e) {
        setRecording(false);
        Alert.alert('Error', 'Could not start recording.');
      }
    } else {
      // Stop recording and process
      setRecording(false);
      try {
        const rec = recordingRef.current;
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI();
        const duration = Date.now() - (rec._startTime || 0);
        if (duration < MIN_RECORDING_DURATION_MS) {
          Alert.alert('Recording too short', 'Please record at least 1 second of speech.');
          recordingRef.current = null;
          return;
        }
        if (uri) {
          setInput('');
          const { transcript, error } = await speechToTextGoogle(uri);
          if (transcript && transcript.trim()) {
            setInput(transcript);
          } else {
            Alert.alert('Speech-to-Text', error || 'No speech detected. Please try again.');
          }
        }
      } catch (e) {
        Alert.alert('Error', 'Could not process recording.');
      }
      recordingRef.current = null;
    }
  };

  // Render chat bubbles
  const renderItem = ({ item }) => (
    <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.bubbleText}>{item.text}</Text>
    </View>
  );

  // Render quick messages
  const renderQuickMessages = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
      {QUICK_MESSAGES.map((msg, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.quickButton}
          onPress={() => setInput(msg)}
        >
          <Text style={styles.quickButtonText}>{msg}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#e9f5ec' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#388E3C" />
            <Text style={styles.loadingText}>AI is typing...</Text>
          </View>
        )}
        {renderQuickMessages()}
        <View style={[styles.inputRow, recording && styles.inputRowRecording]}>
          <TouchableOpacity style={styles.recordButton} onPress={handleMicPress}>
            <MaterialCommunityIcons name={recording ? 'microphone' : 'microphone-outline'} size={28} color={recording ? '#d32f2f' : '#388E3C'} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            onSubmitEditing={() => sendMessage(input)}
            editable={!recording && !loading}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(input)} disabled={!input.trim() || loading}>
            <Ionicons name="send" size={24} color={input.trim() && !loading ? '#fff' : '#aaa'} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5ec',
    padding: 0,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    paddingVertical: 20,
    paddingBottom: 80,
    paddingHorizontal: 10,
  },
  bubble: {
    maxWidth: '80%',
    marginVertical: 6,
    padding: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#c8e6c9',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
  },
  aiBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: '#b2dfdb',
  },
  bubbleText: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
    marginBottom: 2,
  },
  quickButton: {
    backgroundColor: '#e0f2f1',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#b2dfdb',
  },
  quickButtonText: {
    color: '#388E3C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputRowRecording: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#222',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginHorizontal: 6,
  },
  sendButton: {
    backgroundColor: '#388E3C',
    borderRadius: 20,
    padding: 8,
    marginLeft: 6,
  },
  recordButton: {
    marginRight: 6,
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#388E3C',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default ChatbotScreen;
