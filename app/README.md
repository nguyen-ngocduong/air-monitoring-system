# Tài liệu Hướng dẫn Phát triển Mobile App - Hệ thống Giám sát Không khí

Tài liệu này đóng vai trò là bản đồ hướng dẫn để phát triển Front-End (Mobile App) kết nối đồng bộ với hệ thống Backend Spring Boot.

## 1. Cấu trúc thư mục Khuyến nghị
```text
app/
├── src/
    ├── navigation/
    │   ├── AppNavigator.js
    │   ├── AuthNavigator.js
    │   └── MainNavigator.js
│   ├── api/                 # Cấu hình Axios & Endpoints (Khớp với Swagger)
│   │   ├── axiosClient.js   # Cấu hình base URL, interceptors (thêm JWT vào header)
│   │   ├── authApi.js       # /api/v1/auth/**
│   │   ├── userApi.js       # /api/v1/users/**
│   │   └── airQualityApi.js # /api/v1/air-quality/**
│   ├── assets/              # Tài nguyên tĩnh phục vụ UI/UX
│   │   ├── images/          # Ảnh nền, minh họa chất lượng không khí
│   │   ├── icons/           # Icon cảm biến, icon thời tiết, tab icons
│   │   └── fonts/           # Custom fonts (nếu có) // sử dụng Font Awesome 
│   ├── components/          # UI Components tái sử dụng
│   │   ├── common/          # Button, Input, Loading (dùng cho toàn app)
│   │   └── air/             # Gauge (đồng hồ), Chart (biểu đồ), AQICard
│   ├── screens/             # Các màn hình chính
│   │   ├── Auth/            # Login, Register
│   │   ├── Home/            # Dashboard xem chỉ số thời gian thực
│   │   ├── History/         # Xem biểu đồ và lịch sử dữ liệu
│   │   └── Profile/         # Thông tin cá nhân & Đổi mật khẩu
│   ├── hooks/               # Custom hooks để tách biệt logic xử lý
│   │   ├── useAuth.js       # Xử lý đăng nhập, lưu token vào Storage
│   │   └── useAirQuality.js # Xử lý fetch dữ liệu, tính toán AQI
│   ├── store/               # Quản lý State tập trung (Zustand hoặc Redux)
│   └── utils/               # Định dạng ngày tháng, tính toán màu sắc theo AQI
├── .env                     # Lưu API_URL (VD: http://192.168.1.x:8080)
└── package.json
```

## 2. Luồng Xử lý Quan trọng (Flow)

### 2.1. Xác thực & Bảo mật (Auth Flow)
1. **Register/Login:** Gửi request tới `/api/v1/auth/register` hoặc `/authenticate`.
2. **Lưu trữ:** Nhận `token` và `refreshToken`, lưu vào `AsyncStorage` hoặc `SecureStore`.
3. **Interceptor:** Tự động đính kèm `Authorization: Bearer <token>` vào mọi request sau đó.
4. **Xử lý lỗi:** Nếu Backend trả về lỗi (401 hoặc 403), app tự động chuyển hướng về màn hình Login.

### 2.2. Hiển thị dữ liệu không khí (Data Flow)
- **Realtime (Dashboard):** Gọi `/api/v1/air-quality/latest/{device}` mỗi 30-60 giây hoặc dùng nút Refresh.
- **Biểu đồ (History):** Gọi `/api/v1/air-quality/history/{device}` với param `startTime` và `endTime`. 
- **Trạng thái:** Sử dụng trường `status` (GOOD, HIGH_TEMPERATURE,...) từ Backend để thay đổi màu sắc UI (Xanh, Vàng, Đỏ).

## 3. Quy tắc kết nối với Backend Docker
Vì Backend đang chạy trong Docker, bạn cần lưu ý:
- **Android Emulator:** Dùng URL `http://10.0.2.2:8080`
- **iOS Simulator:** Dùng URL `http://localhost:8080`
- **Thiết bị thật:** Dùng IP nội bộ của máy tính (VD: `http://192.168.1.15:8080`).

## 4. Xử lý Lỗi chuẩn hóa (Error Handling)
Backend đã có `GlobalExceptionHandler`, nên mọi lỗi trả về sẽ có cấu trúc:
```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "validationErrors": { "email": "Email must be valid" }
}
```
**Nhiệm vụ của App:** Hiển thị `message` lên thông báo (Toast/Alert) và map `validationErrors` vào các ô nhập liệu tương ứng.

## 5. Danh sách các màn hình cần ưu tiên
1. **Màn hình Đăng nhập/Đăng ký:** Form nhập liệu có validation.
2. **Màn hình Trang chủ:** 
   - Đồng hồ hiển thị Nhiệt độ, Độ ẩm.
   - Thẻ hiển thị chỉ số bụi mịn PM2.5, PM10, CO.
   - Badge hiển thị trạng thái (VD: "Chất lượng không khí Tốt").
3. **Màn hình Lịch sử:** Biểu đồ đường (Line Chart) diễn biến các chỉ số theo thời gian.

---
*Ghi chú: Luôn kiểm tra Swagger tại `http://localhost:8080/swagger-ui/index.html` để cập nhật chính xác các tham số truyền vào.*

```
File này giúp bạn quản lý các icon bằng tên (ví dụ: thermometer, humidity) thay vì phải nhớ mã Unicode phức tạp. Để hoàn tất việc sử dụng, bạn cần thực hiện thêm:

   1. Tải file Font: Download FontAwesome5_Solid.ttf từ trang chủ Font Awesome và đặt vào thư mục assets/fonts/ này.
   2. Cách sử dụng trong code (JS):

   1     import { Text } from 'react-native';
   2     import { FontAwesomeIcons, FontFamily } from './assets/fonts/FontAwesomeMap';
   3
   4     // Ví dụ hiển thị icon nhiệt độ
   5     <Text style={{ fontFamily: FontFamily.solid, fontSize: 24 }}>
   6       {FontAwesomeIcons.thermometer}
   7     </Text>
```