import React, { useState, Component } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';

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

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('💥 App crash:', error.message);
    console.error('💥 Stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0A0E1A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#FF4757', fontSize: 40, marginBottom: 16 }}>💥</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Đã xảy ra lỗi</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {this.state.error?.message || 'Lỗi không xác định'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ backgroundColor: '#00C897', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <AuthProvider>
        <AirQualityProvider>
          <AppNavigator />
        </AirQualityProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
