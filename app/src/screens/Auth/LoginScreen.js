import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useAuthStore } from '../../store';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      // Sau khi login thành công, AuthProvider sẽ tự động chuyển sang Home
    } catch (err) {
      Alert.alert('Đăng nhập thất bại', err.message || 'Sai tên đăng nhập hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/Splash_Screen.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          {/* Logo & Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>🌬️</Text>
            <Text style={styles.title}>AirMonitor</Text>
            <Text style={styles.subtitle}>Giám sát chất lượng không khí</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên đăng nhập</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor="#6B7280"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={styles.registerBtnText}>Tạo tài khoản mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background:       { flex: 1 },
  container:        { flex: 1 },
  overlay:          { flex: 1, backgroundColor: 'rgba(10, 14, 26, 0.85)', justifyContent: 'center', paddingHorizontal: 24 },

  // Header
  header:           { alignItems: 'center', marginBottom: 40 },
  logo:             { fontSize: 64, marginBottom: 8 },
  title:            { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: 1 },
  subtitle:         { color: '#9CA3AF', fontSize: 14, marginTop: 4 },

  // Form
  formContainer:    { backgroundColor: 'rgba(20, 25, 41, 0.95)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  inputGroup:       { marginBottom: 20 },
  label:            { color: '#D1D5DB', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrapper:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1426', borderRadius: 14, borderWidth: 1, borderColor: '#1E2540', paddingHorizontal: 14 },
  inputIcon:        { fontSize: 18, marginRight: 10 },
  input:            { flex: 1, color: '#FFFFFF', fontSize: 15, paddingVertical: 14 },

  // Buttons
  loginBtn:         { backgroundColor: '#00C897', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  divider:          { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine:      { flex: 1, height: 1, backgroundColor: '#1E2540' },
  dividerText:      { color: '#6B7280', fontSize: 12, marginHorizontal: 12 },

  registerBtn:      { borderWidth: 1, borderColor: '#4ECDC4', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  registerBtnText:  { color: '#4ECDC4', fontSize: 15, fontWeight: '600' },
});

export default LoginScreen;
