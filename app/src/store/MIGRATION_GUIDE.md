# Migration Guide: Từ Hooks sang Store

Hướng dẫn chuyển đổi từ `useAuth` và `useAirQuality` hooks sang Store mới.

---

## 🔄 Auth Migration

### Trước (useAuth hook)
```javascript
// src/hooks/useAuth.js
import { useAuth } from '../hooks/useAuth';

function LoginScreen() {
  const { login, loading } = useAuth();
  
  const handleLogin = async () => {
    await login(username, password);
  };
}
```

### Sau (useAuthStore)
```javascript
// Sử dụng store
import { useAuthStore } from '../store';
import { authApi } from '../api';

function LoginScreen() {
  const { login, loading } = useAuthStore();
  
  const handleLogin = async () => {
    try {
      // 1. Gọi API
      const response = await authApi.login(username, password);
      
      // 2. Lưu vào store
      await login(
        response.data.token,
        response.data.refreshToken,
        response.data.user
      );
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Thay đổi chính:
1. Import từ `../store` thay vì `../hooks/useAuth`
2. `login()` giờ nhận 3 params: `(token, refreshToken, user)`
3. Cần gọi API trước, rồi mới lưu vào store

---

## 🌡️ Air Quality Migration

### Trước (useAirQuality hook)
```javascript
// src/hooks/useAirQuality.js
import { useAirQuality } from '../hooks/useAirQuality';

function HomeScreen() {
  const { data, loading, fetchLatest } = useAirQuality();
  
  useEffect(() => {
    fetchLatest();
  }, []);
}
```

### Sau (useAirQualityStore)
```javascript
// Sử dụng store
import { useAirQualityStore } from '../store';
import { airQualityApi } from '../api';

function HomeScreen() {
  const { 
    latestData, 
    loading, 
    setLatestData, 
    setLoading,
    setError 
  } = useAirQualityStore();
  
  const fetchLatest = async () => {
    setLoading(true);
    try {
      const response = await airQualityApi.getLatest();
      setLatestData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLatest();
  }, []);
}
```

### Thay đổi chính:
1. `data` → `latestData`
2. Không có `fetchLatest()` sẵn, phải tự implement
3. Có thêm `setError()` để handle lỗi

---

## 📋 Checklist Migration

### Bước 1: Update App.js
- [x] Import `AuthProvider` và `AirQualityProvider` từ `./src/store`
- [x] Wrap app với cả 2 providers
- [x] Thay `useAuth` → `useAuthStore`

### Bước 2: Update LoginScreen
- [ ] Import `useAuthStore` thay vì `useAuth`
- [ ] Update `login()` call với 3 params
- [ ] Handle API call trước khi lưu store

### Bước 3: Update RegisterScreen
- [ ] Tương tự LoginScreen

### Bước 4: Update HomeScreen
- [ ] Import `useAirQualityStore`
- [ ] Implement `fetchLatest()` function
- [ ] Update state names (`data` → `latestData`)

### Bước 5: Update HistoryScreen
- [ ] Import `useAirQualityStore`
- [ ] Sử dụng `selectedDevice` từ store

### Bước 6: Update ChartScreen
- [ ] Import `useAirQualityStore`
- [ ] Sử dụng `latestData` từ store

### Bước 7: Update ProfileScreen
- [ ] Import `useAuthStore`
- [ ] Update `logout()` call
- [ ] Thêm `clearData()` từ `useAirQualityStore` khi logout

### Bước 8: Cleanup
- [ ] Xóa `src/hooks/useAuth.js` (nếu không dùng nữa)
- [ ] Xóa `src/hooks/useAirQuality.js` (nếu không dùng nữa)

---

## 🎯 Ví dụ đầy đủ

### LoginScreen.js (Complete)
```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useAuthStore } from '../store';
import { authApi } from '../api';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      // 1. Call API
      const response = await authApi.login(username, password);
      
      // 2. Save to store (auto save to AsyncStorage)
      await login(
        response.data.token,
        response.data.refreshToken,
        response.data.user
      );
      
      // 3. Navigate sẽ tự động xảy ra vì App.js detect isAuthenticated
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        <Text>{loading ? 'Loading...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### HomeScreen.js (Complete)
```javascript
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useAirQualityStore } from '../store';
import { airQualityApi } from '../api';

export default function HomeScreen({ navigation }) {
  const { 
    latestData, 
    loading, 
    lastUpdated,
    setLatestData, 
    setLoading,
    setError 
  } = useAirQualityStore();

  const fetchLatest = async () => {
    setLoading(true);
    try {
      const response = await airQualityApi.getLatest();
      setLatestData(response.data);
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
    
    // Auto refresh every 30s
    const interval = setInterval(fetchLatest, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !latestData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00C897" />
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchLatest} />
      }
    >
      <Text>Temperature: {latestData?.temperature}°C</Text>
      <Text>Humidity: {latestData?.humidity}%</Text>
      <Text>Last updated: {lastUpdated}</Text>
    </ScrollView>
  );
}
```

### ProfileScreen.js (Complete)
```javascript
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore, useAirQualityStore } from '../store';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const { clearData } = useAirQualityStore();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();        // Clear auth store
              clearData();           // Clear air quality store
              // Navigate sẽ tự động xảy ra vì App.js detect isAuthenticated = false
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <Text>Name: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>
      
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## ⚠️ Common Mistakes

### 1. Quên wrap với Provider
```javascript
// ❌ Sai
const App = () => <AppNavigator />;

// ✅ Đúng
const App = () => (
  <AuthProvider>
    <AirQualityProvider>
      <AppNavigator />
    </AirQualityProvider>
  </AuthProvider>
);
```

### 2. Gọi store action sai cách
```javascript
// ❌ Sai - login() cần 3 params
await login(response.data);

// ✅ Đúng
await login(
  response.data.token,
  response.data.refreshToken,
  response.data.user
);
```

### 3. Không clear data khi logout
```javascript
// ❌ Sai - chỉ logout auth
await logout();

// ✅ Đúng - clear cả 2 stores
await logout();
clearData();
```

### 4. Fetch data trong store action
```javascript
// ❌ Sai - không nên fetch trong action
const setLatestData = async () => {
  const data = await api.getData();
  dispatch({ type: 'SET_DATA', payload: data });
};

// ✅ Đúng - fetch trong component, chỉ update store
const fetchData = async () => {
  const data = await api.getData();
  setLatestData(data); // Chỉ update store
};
```

---

## 🎓 Tóm tắt

| Cũ | Mới | Ghi chú |
|----|-----|---------|
| `useAuth()` | `useAuthStore()` | Import từ `../store` |
| `login(username, password)` | `login(token, refreshToken, user)` | Cần gọi API trước |
| `useAirQuality()` | `useAirQualityStore()` | Import từ `../store` |
| `data` | `latestData` | Tên state thay đổi |
| `fetchLatest()` | Tự implement | Không có sẵn trong store |

**Nguyên tắc:** Store chỉ quản lý state, không quản lý API calls.
