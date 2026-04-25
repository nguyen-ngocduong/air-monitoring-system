import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadingScreen = ({ message = 'Đang tải...' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌬️</Text>
      <ActivityIndicator size="large" color="#00C897" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  message: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
});

export default LoadingScreen;
