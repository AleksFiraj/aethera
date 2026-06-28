<p align="center">
  <h1 align="center">ÆTHERA</h1>
  <p align="center">
    <strong>Eco-Smart Urban Mobility App for Sustainable Transportation</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> &middot;
    <a href="#tech-stack">Tech Stack</a> &middot;
    <a href="#getting-started">Getting Started</a> &middot;
    <a href="#project-structure">Project Structure</a> &middot;
    <a href="#api-configuration">API Configuration</a>
  </p>
</p>

<br/>

![React Native](https://img.shields.io/badge/React_Native-0.79-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo_SDK-53-000020?style=flat-square&logo=expo)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=flat-square&logo=firebase)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT_3.5-412991?style=flat-square&logo=openai)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-green?style=flat-square)

---

## Overview

**ÆTHERA** is a cross-platform mobile application that promotes eco-friendly urban transportation in Korçë, Albania. It combines real-time multi-modal navigation, public transit scheduling, vehicle rentals, an AI-powered assistant, and a gamified rewards system — all within a polished green-themed interface.

Built as a full-featured prototype with **React Native + Expo**, the app demonstrates modern mobile development patterns including animated UI, map-based interactions, third-party API integrations, and voice-enabled AI chat.

---

## Features

### Multi-Modal Navigation
- Interactive map with **Google Maps** integration and real-time GPS tracking
- Route planning for **car, bicycle, scooter, walking, and bus** modes
- **Eco-route toggle** that suggests least-polluted paths with pollution/pollen data overlay
- **EV charging station** discovery when driving mode is selected
- Deep linking to Google Maps for turn-by-turn navigation

### Public Transit
- **Local bus routes** (K1–K11) across Korçë with departure schedules
- **Intercity connections** to destinations across Albania and Greece
- Distance-based fare calculation and **ticket booking** with passenger details
- QR-coded digital tickets generated on purchase

### Vehicle Rental
- Map-based **bike and scooter** rental with real-time vehicle markers
- In-app payment flow with card details
- QR ticket + 6-digit unlock passcode upon rental confirmation

### GeNie — AI Assistant
- **OpenAI GPT-3.5** powered chatbot specialized in eco-mobility guidance
- **Voice input** via Google Speech-to-Text API
- **Text-to-speech** responses using Expo Speech
- Quick-action chips for common questions

### Rewards System
- **ÆTHER Coins** earned through eco-friendly transportation choices
- Redeemable rewards: free bus tickets, coffee discounts, carbon offsets, bike rentals
- Points persisted locally via Expo FileSystem

### User Experience
- Smooth **onboarding carousel** with Albanian welcome messages
- **Authentication** flows: email/password, Google OAuth, Apple Sign-In, guest mode
- Editable user **profile** with settings drawer
- **Dark mode** and **bilingual** (EN/SQ) language toggle
- **News feed** with eco/sustainability articles and tag-based filtering
- Glassmorphism UI effects, gradient backgrounds, and animated input fields

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React Native 0.79 · Expo SDK 53 · React 19 |
| **Navigation** | React Navigation (Stack + Bottom Tabs) |
| **Maps** | react-native-maps · Google Maps Platform (Places, Directions, Geocoding) |
| **Backend** | Firebase 11 (Auth, Firestore, Storage) |
| **AI / NLP** | OpenAI API (GPT-3.5-turbo) |
| **Voice** | Google Speech-to-Text · Expo Speech · Expo AV |
| **UI** | Expo Linear Gradient · Expo Blur · React Native Paper · Vector Icons |
| **QR** | react-native-qrcode-svg · Expo Camera |
| **Auth** | Expo Auth Session (Google OAuth) · Expo Apple Authentication |
| **Storage** | AsyncStorage · Expo FileSystem |

---

## Project Structure

```
aethera/
├── App.js                         # Root component — Stack & Tab navigation
├── index.js                       # Expo entry point
├── app.json                       # Expo configuration
├── package.json                   # Dependencies & scripts
│
├── components/
│   ├── welcome.js                 # Onboarding carousel screen
│   ├── signin.js                  # Sign-in with email, Google, Apple, guest
│   ├── signup.js                  # Registration screen
│   ├── MapScreen.js               # Core map with routing & eco-features
│   ├── NewsScreen.js              # Eco news feed with article modals
│   ├── BusScheduleScreen.js       # Local & intercity bus schedules
│   ├── ProfileScreen.js           # User profile, rewards & settings
│   ├── ChatbotScreen.js           # GeNie AI assistant with voice I/O
│   ├── ChatbotWrapper.js          # FAB overlay that hosts the chatbot modal
│   ├── TicketPurchaseForm.js      # Intercity bus ticket booking
│   ├── RentVehicleMap.js          # Bike/scooter rental map
│   └── RentVehiclePayment.js      # Rental payment & unlock passcode
│
├── config/
│   ├── api.js                     # API keys & endpoint constants
│   ├── routeUtils.js              # Route fetching & polyline decoding
│   ├── mapUtils.js                # Map region helpers & marker rendering
│   ├── navigationUtils.js         # Voice-guided navigation via Expo Speech
│   └── locationUtils.js           # Haversine distance & formatting utilities
│
├── utils/
│   └── firebase.js                # Firebase initialization & mock toggle
│
└── assets/                        # App icons, splash screen, UI assets
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) app on your phone (iOS / Android)

### Installation

```bash
# Clone the repository
git clone https://github.com/AleksFiraj/aethera.git
cd aethera

# Install dependencies
npm install
```

### API Configuration

The app requires API keys for full functionality. Create or update the following files with your own keys:

| File | Keys Required |
|------|--------------|
| `config/api.js` | Google Maps API Key |
| `components/ChatbotScreen.js` | OpenAI API Key, Google Speech-to-Text API Key |
| `utils/firebase.js` | Firebase project configuration |

> **Note:** API keys are set to placeholder values. The app runs in demo/mock mode by default — authentication and payments are simulated for demonstration purposes.

### Run the App

```bash
# Start the Expo development server
npx expo start
```

Scan the QR code with **Expo Go** on your phone (make sure both devices are on the same Wi-Fi network).

---

## API Integrations

| Service | Usage |
|---------|-------|
| **Google Maps Platform** | Places Autocomplete, Directions, Geocoding, Nearby Search (EV stations, transit stops) |
| **Google Speech-to-Text** | Voice input transcription for the AI chatbot |
| **OpenAI** | GPT-3.5-turbo powers the GeNie eco-assistant |
| **Firebase** | Authentication (email, Google, Apple), Firestore database, Cloud Storage |

---

## Key Design Decisions

- **Eco-first UX** — Green color palette (#4CAF50), gradient headers, and sustainability-focused content reinforce the environmental mission throughout the interface
- **Offline-resilient** — Mock data fallbacks ensure the app remains demonstrable without live API keys or network connectivity
- **Modular config layer** — Route calculation, map utilities, and navigation logic are extracted into `config/` for separation of concerns
- **Chatbot as overlay** — The AI assistant lives in a floating action button accessible from any tab, avoiding navigation disruption
- **Local persistence** — ÆTHER Coins and user preferences are stored with AsyncStorage and Expo FileSystem, enabling a serverless demo experience

---

## Screenshots

> Add screenshots of the app screens here to showcase the UI.
>
> Recommended: Welcome, Map (with route), Bus Schedule, AI Chatbot, Profile

---

## License

This project is part of a personal/academic portfolio. All rights reserved.

---

<p align="center">
  Built with React Native + Expo
</p>
