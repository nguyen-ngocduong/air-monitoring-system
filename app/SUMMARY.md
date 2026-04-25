# 🌬️ AirMonitor - Ứng dụng Giám sát Chất lượng Không khí

## 📱 Chức năng của App

### 🔐 1. Authentication (Đăng nhập/Đăng ký)
- Màn hình Splash với background `Splash_Screen.png`
- Đăng nhập/Đăng ký với background `login_background.png`
- Tự động lưu token vào AsyncStorage
- Token tự động gửi kèm mọi API request
- Đăng xuất với icon `logout.png`

### 🏠 2. Màn hình Home
- Hiển thị trạng thái chất lượng không khí hiện tại
- **6 chỉ số quan trọng**:
  - PM2.5 (µg/m³) - Bụi mịn
  - PM10 (µg/m³) - Bụi thô
  - CO (ppm) - Carbon monoxide
  - NH₃ (ppm) - Amoniac
  - Nhiệt độ (°C)
  - Độ ẩm (%)
- Thang đo AQI với 5 mức độ (Tốt/Trung bình/Kém/Xấu/Nguy hại)
- Auto refresh mỗi 30 giây
- Nút điều hướng đến Lịch sử và Biểu đồ

### 📋 3. Màn hình Lịch sử
- **Bộ lọc tùy chỉnh**:
  - Nhập tên thiết bị (ví dụ: esp32)
  - Nhập thời gian bắt đầu: `YYYY-MM-DD HH:mm`
  - Nhập thời gian kết thúc: `YYYY-MM-DD HH:mm`
- Thống kê nhanh: Tổng bản ghi, Trung bình PM2.5, Max PM2.5
- Hiển thị tất cả chỉ số trong danh sách
- Màu sắc theo mức độ PM2.5

### 📈 4. Màn hình Biểu đồ
- **Chọn loại biểu đồ**: Line Chart hoặc Bar Chart
- **Multi-select 6 chỉ số**: PM2.5, PM10, CO, NH₃, Nhiệt độ, Độ ẩm
- Mỗi chỉ số có biểu đồ riêng với màu sắc khác nhau
- **Bộ lọc tùy chỉnh**:
  - Nhập tên thiết bị
  - Nhập thời gian bắt đầu: `YYYY-MM-DD HH:mm`
  - Nhập thời gian kết thúc: `YYYY-MM-DD HH:mm`
- Bảng dữ liệu chi tiết 10 điểm gần nhất

---

## 🚀 Cách chạy code

### Yêu cầu
- Node.js >= 16
- npm hoặc yarn
- Expo CLI

### Các bước

```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình API URL
# Tạo file .env trong thư mục gốc:
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_IP:8080

# 3. Chạy ứng dụng
npm start

# Hoặc chạy trực tiếp trên Android
npm run android

# Hoặc iOS
npm run ios
```

### Tìm IP Backend
- **Windows**: `ipconfig` → IPv4 Address
- **Mac/Linux**: `ifconfig` → inet
- **Android Emulator**: dùng `10.0.2.2`
- **iOS Simulator**: dùng `localhost`

---

## 📊 API Endpoints

### Authentication
```
POST /api/v1/auth/authenticate
POST /api/v1/auth/register
```

### Air Quality Data
```
GET  /api/v1/air-quality/latest/{deviceName}
GET  /api/v1/air-quality/history/{deviceName}?startTime=YYYY-MM-DDTHH:mm:ss&endTime=YYYY-MM-DDTHH:mm:ss
GET  /api/v1/air-quality/chart/{deviceName}?startTime=YYYY-MM-DDTHH:mm:ss&endTime=YYYY-MM-DDTHH:mm:ss
```

### Response Format
```json
{
  "timestamp": "2026-04-25T10:30:00Z",
  "pm25": 15.5,
  "pm10": 25.3,
  "co": 2.1,
  "nh3": 0.5,
  "temperature": 28.5,
  "humidity": 65.2
}
```

---

## � Cấu trúc thư mục

```
air-monitoring-app/
├── src/
│   ├── api/                    # API clients
│   │   ├── airQualityApi.js
│   │   ├── authApi.js
│   │   ├── axiosClient.js
│   │   └── userApi.js
│   ├── assets/                 # Images, fonts, icons
│   │   ├── fonts/
│   │   ├── icons/
│   │   │   ├── AppIcon.png
│   │   │   └── logout.png      ✓ (đang sử dụng)
│   │   └── images/
│   │       ├── Splash_Screen.png ✓ (đang sử dụng)
│   │       ├── background.png
│   │       └── login.png
│   ├── components/             # Reusable components
│   │   └── common/
│   ├── hooks/                  # Custom hooks
│   │   ├── useAirQuality.js
│   │   └── useAuth.js
│   ├── screens/                # Screen components
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── Home/
│   │   │   ├── HomeScreen.js
│   │   │   └── ChartScreen.js
│   │   └── History/
│   │       └── HistoryScreen.js
│   └── utils/                  # Utilities
├── App.js                      # Root component
├── .env                        # API configuration
└── package.json
```

---

## � Giao diện

### Theme
- Dark theme (#0A0E1A)
- Màu sắc theo AQI:
  - Tốt: #00C897 (xanh)
  - Trung bình: #FFD93D (vàng)
  - Kém: #FF8C42 (cam)
  - Xấu: #FF4757 (đỏ)
  - Nguy hại: #9B59B6 (tím)

### Assets sử dụng
- `Splash_Screen.png` - Background cho màn hình đăng nhập/đăng ký
- `logout.png` - Icon đăng xuất (màu đỏ #FF4757)

---

## 🎯 Workflow sử dụng

1. **Đăng ký tài khoản** → Nhập username, email, password
2. **Đăng nhập** → Token tự động lưu
3. **Xem Home** → Trạng thái hiện tại + 6 chỉ số
4. **Xem Lịch sử** → Nhập thiết bị + thời gian (YYYY-MM-DD HH:mm)
5. **Xem Biểu đồ** → Chọn loại + chỉ số + thời gian
6. **Đăng xuất** → Nhấn icon logout

---

## 🐛 Troubleshooting

### Lỗi kết nối API
- Kiểm tra IP trong file `.env`
- Đảm bảo backend đang chạy
- Test API bằng: `curl http://YOUR_IP:8080/api/v1/air-quality/latest/esp32`

### Token hết hạn
- Đăng xuất và đăng nhập lại

### Không có dữ liệu
- Kiểm tra thiết bị đang gửi dữ liệu
- Kiểm tra khoảng thời gian có dữ liệu
- Thử format thời gian: `2026-04-25 10:00`

---

## � Lưu ý quan trọng

1. **Format thời gian**: Luôn nhập theo `YYYY-MM-DD HH:mm` (ví dụ: `2026-04-25 10:30`)
2. **Token**: Tự động lưu sau khi đăng nhập
3. **Thiết bị**: Mặc định là `esp32`
4. **Biểu đồ**: Cần ít nhất 2 điểm dữ liệu cho Line Chart
5. **API**: Sử dụng `/api/v1/air-quality/history` và `/api/v1/air-quality/chart` để lấy dữ liệu lịch sử

---

**Version**: 2.0.0  
**Last Updated**: 25/04/2026  
**Status**: ✅ Production Ready
npx expo install babel-preset-expo@~54.0.10 react-native-safe-area-context@~5.6.0 react-native-screens@~4.16.0