import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Store Providers (Single Source of Truth)
import { AuthProvider, AirQualityProvider } from './src/store';
import { useAuthStore } from './src/store';

// Screens
import LoginScreen    from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import HomeScreen     from './src/screens/Home/HomeScreen';
import HistoryScreen  from './src/screens/History/HistoryScreen';
import ChartScreen    from './src/screens/Home/ChartScreen';
import ProfileScreen  from './src/screens/Profile/ProfileScreen';

// ─── Main Navigator ──────────────────────────────────────────────────────────
const AppNavigator = () => {
  const { user, token, loading } = useAuthStore(); // Sử dụng store thay vì hook
  const [currentScreen, setCurrentScreen] = useState('Home');

  const navigate = (screenName) => setCurrentScreen(screenName);

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0E1A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00C897" />
      </View>
    );
  }

  // Not authenticated → Show Auth screens
  if (!token || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0E1A' }}>
        {currentScreen === 'Login' && (
          <LoginScreen navigation={{ navigate }} />
        )}
        {currentScreen === 'Register' && (
          <RegisterScreen navigation={{ navigate }} />
        )}
        {/* Default to Login */}
        {currentScreen !== 'Login' && currentScreen !== 'Register' && (
          <LoginScreen navigation={{ navigate }} />
        )}
      </View>
    );
  }

  // Authenticated → Show Main screens
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E1A' }}>
      {currentScreen === 'Home' && (
        <HomeScreen navigation={{ navigate }} />
      )}
      {currentScreen === 'History' && (
        <HistoryScreen navigation={{ navigate, goBack: () => navigate('Home') }} />
      )}
      {currentScreen === 'Chart' && (
        <ChartScreen navigation={{ navigate, goBack: () => navigate('Home') }} />
      )}
      {currentScreen === 'Profile' && (
        <ProfileScreen navigation={{ navigate, goBack: () => navigate('Home') }} />
      )}
    </View>
  );
};

// ─── App Root ────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <AuthProvider>
      <AirQualityProvider>
        <AppNavigator />
      </AirQualityProvider>
    </AuthProvider>
  );
};

export default App;
