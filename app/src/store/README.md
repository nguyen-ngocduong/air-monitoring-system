# Store - Single Source of Truth

Store là "bộ não trung tâm" của app, quản lý toàn bộ state chung.

## 📦 Cấu trúc

```
src/store/
├── authStore.js          # Quản lý authentication
├── airQualityStore.js    # Quản lý dữ liệu cảm biến
└── index.js              # Export tất cả stores
```

---

## 🔐 Auth Store

### State
```javascript
{
  token: string | null,           // JWT token
  refreshToken: string | null,    // Refresh token
  user: object | null,            // Thông tin user
  isAuthenticated: boolean,       // Trạng thái đăng nhập
  loading: boolean                // Đang restore token từ AsyncStorage
}
```

### Actions
- `login(token, refreshToken, user)` - Đăng nhập và lưu vào AsyncStorage
- `logout()` - Đăng xuất và xóa khỏi AsyncStorage
- `updateUser(userData)` - Cập nhật thông tin user

### Sử dụng trong component

```javascript
import { useAuthStore } from '../store';

function MyComponent() {
  const { 
    token, 
    user, 
    isAuthenticated, 
    login, 
    logout 
  } = useAuthStore();

  // Đăng nhập
  const handleLogin = async () => {
    await login('token123', 'refresh456', { id: 1, name: 'John' });
  };

  // Đăng xuất
  const handleLogout = async () => {
    await logout();
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome {user?.name}</Text>
      ) : (
        <Text>Please login</Text>
      )}
    </View>
  );
}
```

---

## 🌡️ Air Quality Store

### State
```javascript
{
  latestData: object | null,      // Dữ liệu cảm biến mới nhất
  selectedDevice: object | null,  // Device đang được chọn
  loading: boolean,               // Trạng thái loading
  lastUpdated: string | null,     // Thời gian cập nhật cuối (ISO string)
  error: string | null,           // Error message nếu có
  devices: array                  // Danh sách devices
}
```

### Actions
- `setLatestData(data)` - Cập nhật dữ liệu cảm biến mới nhất
- `setSelectedDevice(device)` - Chọn device
- `setLoading(loading)` - Set trạng thái loading
- `setError(error)` - Set error message
- `setDevices(devices)` - Set danh sách devices
- `clearData()` - Xóa toàn bộ dữ liệu
- `updateLastUpdated()` - Cập nhật thời gian

### Sử dụng trong component

```javascript
import { useAirQualityStore } from '../store';

function HomeScreen() {
  const { 
    latestData, 
    loading, 
    lastUpdated,
    setLatestData,
    setLoading 
  } = useAirQualityStore();

  // Fetch dữ liệu
  const fetchData = async () => {
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

  return (
    <View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text>Temperature: {latestData?.temperature}°C</Text>
      )}
      <Text>Last updated: {lastUpdated}</Text>
    </View>
  );
}
```

---

## 🎯 Tại sao cần Store?

### ❌ Không có Store (trước đây)
```
LoginScreen → fetch user → lưu local state
HomeScreen → fetch user lại → lưu local state
ProfileScreen → fetch user lại → lưu local state
```
**Vấn đề:**
- Fetch nhiều lần không cần thiết
- Data không đồng bộ giữa các màn hình
- Khó quản lý khi app lớn

### ✅ Có Store (bây giờ)
```
LoginScreen → login() → lưu vào Store
HomeScreen → đọc từ Store
ProfileScreen → đọc từ Store
```
**Lợi ích:**
- Fetch 1 lần, dùng nhiều nơi
- Data luôn đồng bộ
- Dễ debug và maintain

---

## 🔄 Luồng hoạt động

### Login Flow
```
1. User nhập username/password
2. LoginScreen gọi authApi.login()
3. API trả về { token, refreshToken, user }
4. LoginScreen gọi login() từ useAuthStore
5. Store lưu vào AsyncStorage + update state
6. App.js detect isAuthenticated = true → navigate to Home
```

### Fetch Air Quality Flow
```
1. HomeScreen mount
2. Gọi airQualityApi.getLatest()
3. Gọi setLatestData() từ useAirQualityStore
4. Store update state
5. Tất cả components đang subscribe sẽ re-render
```

### Logout Flow
```
1. User click logout
2. ProfileScreen gọi logout() từ useAuthStore
3. Store xóa AsyncStorage + reset state
4. App.js detect isAuthenticated = false → navigate to Login
```

---

## 🚀 Setup trong App.js

```javascript
import { AuthProvider, AirQualityProvider } from './src/store';

const App = () => {
  return (
    <AuthProvider>
      <AirQualityProvider>
        <AppNavigator />
      </AirQualityProvider>
    </AuthProvider>
  );
};
```

**Thứ tự quan trọng:**
- AuthProvider bên ngoài (vì authentication cần check trước)
- AirQualityProvider bên trong (vì cần token để fetch data)

---

## 📝 Best Practices

### 1. Chỉ lưu data chung vào Store
✅ **Nên:**
- User info (dùng ở nhiều màn hình)
- Latest sensor data (dùng ở Home, History, Chart)
- Selected device (dùng ở nhiều nơi)

❌ **Không nên:**
- Form input values (chỉ dùng trong 1 màn hình)
- UI state như modal open/close (local state)
- Temporary data

### 2. Async operations trong component, không trong store
```javascript
// ✅ Đúng
const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    setLatestData(data); // Chỉ update store sau khi có data
  } catch (error) {
    setError(error.message);
  }
};

// ❌ Sai - không nên fetch trong store action
```

### 3. Clear data khi logout
```javascript
const handleLogout = async () => {
  await logout(); // Clear auth store
  clearData();    // Clear air quality store
};
```

---

## 🐛 Debugging

### Check store state
```javascript
const { token, user, latestData } = useAuthStore();
console.log('Auth State:', { token, user });

const airQuality = useAirQualityStore();
console.log('Air Quality State:', airQuality);
```

### Common Issues

**Issue:** "useAuthStore must be used within AuthProvider"
**Fix:** Đảm bảo component nằm trong `<AuthProvider>`

**Issue:** State không update
**Fix:** Kiểm tra có gọi action đúng không (ví dụ: `setLatestData()`)

**Issue:** Data mất khi reload app
**Fix:** Auth store tự động restore từ AsyncStorage. Air quality cần fetch lại.

---

## 🎓 Tóm tắt

| Store | Mục đích | Persist? | Dùng ở đâu |
|-------|----------|----------|------------|
| **Auth** | Quản lý đăng nhập | ✅ AsyncStorage | Login, Home, Profile, Logout |
| **Air Quality** | Quản lý dữ liệu cảm biến | ❌ (fetch lại) | Home, History, Chart, Header |

**Single Source of Truth = Một nơi duy nhất lưu data, nhiều nơi đọc data đó.**
