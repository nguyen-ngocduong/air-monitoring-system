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
  ScrollView,
} from 'react-native';
import { registerApi } from '../../api/authApi';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert('Đăng ký thất bại', err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.logo}>🌬️</Text>
              <Text style={styles.title}>Tạo tài khoản</Text>
              <Text style={styles.subtitle}>Đăng ký để bắt đầu giám sát</Text>
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
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập email"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
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
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#6B7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerBtnText}>Đăng ký</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.loginLinkText}>
                  Đã có tài khoản? <Text style={styles.loginLinkBold}>Đăng nhập</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background:       { flex: 1 },
  container:        { flex: 1 },
  scrollContent:    { flexGrow: 1 },
  overlay:          { flex: 1, backgroundColor: 'rgba(10, 14, 26, 0.85)', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  // Header
  header:           { alignItems: 'center', marginBottom: 30 },
  backBtn:          { position: 'absolute', left: 0, top: 0, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon:         { color: '#FFFFFF', fontSize: 28, lineHeight: 32, marginTop: -2 },
  logo:             { fontSize: 48, marginBottom: 8 },
  title:            { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  subtitle:         { color: '#9CA3AF', fontSize: 13, marginTop: 4 },

  // Form
  formContainer:    { backgroundColor: 'rgba(20, 25, 41, 0.95)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  inputGroup:       { marginBottom: 16 },
  label:            { color: '#D1D5DB', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrapper:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1426', borderRadius: 14, borderWidth: 1, borderColor: '#1E2540', paddingHorizontal: 14 },
  inputIcon:        { fontSize: 18, marginRight: 10 },
  input:            { flex: 1, color: '#FFFFFF', fontSize: 15, paddingVertical: 14 },

  // Buttons
  registerBtn:         { backgroundColor: '#4ECDC4', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  loginLink:        { marginTop: 20, alignItems: 'center' },
  loginLinkText:    { color: '#9CA3AF', fontSize: 14 },
  loginLinkBold:    { color: '#00C897', fontWeight: '700' },
});

export default RegisterScreen;
