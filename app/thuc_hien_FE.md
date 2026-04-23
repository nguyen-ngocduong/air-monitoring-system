# Lộ trình Phát triển Front-End (Mobile App) - Hệ thống Giám sát Không khí

Sau khi đã hoàn tất thư mục `assets/` (Fonts, Icons, Images), đây là danh sách các công việc cụ thể cần thực hiện tiếp theo để hoàn thiện ứng dụng.

## 1. Thiết lập Cấu hình Gốc (Core Setup)
- [ ] **Environment:** Cấu hình file `.env` chứa `API_URL` (Lưu ý: Android Emulator dùng `10.0.2.2`, thiết bị thật dùng IP máy tính).
- [ ] **Axios Client:** Khởi tạo `api/axiosClient.js` để xử lý base URL và tự động đính kèm JWT Token vào header.
- [ ] **Navigation:** Cài đặt React Navigation (Stack và Tab Navigation).

## 2. Quản lý Trạng thái & Dữ liệu (State & Data)
- [ ] **Store Setup:** Thiết lập Zustand hoặc Redux để lưu trữ thông tin đăng nhập (`token`, `user`) và dữ liệu cảm biến tạm thời.
- [ ] **API Services:** 
    - [ ] `authApi.js`: Các hàm `login`, `register`, `refreshToken`.
    - [ ] `airQualityApi.js`: Các hàm `getLatest`, `getHistory`.
- [ ] **Custom Hooks:** Viết logic xử lý vào `hooks/` để tách biệt với UI:
    - [ ] `useAuth.js`: Xử lý đăng nhập, đăng xuất và lưu storage.
    - [ ] `useAirQuality.js`: Xử lý fetch dữ liệu định kỳ (polling) và tính toán màu sắc theo AQI.

## 3. Phát triển Thành phần Giao diện (Components)
- [ ] **Common Components:** Button, Input, Loading Spinner, Card.
- [ ] **Air Components (Dùng Font Icons):**
    - [ ] `SensorCard`: Hiển thị một chỉ số (VD: Nhiệt độ) kèm Icon tương ứng từ `FontAwesomeMap`.
    - [ ] `StatusBadge`: Hiển thị trạng thái (GOOD, HIGH_TEMP...) kèm Icon và màu sắc cảnh báo.
    - [ ] `HistoryChart`: Tích hợp thư viện biểu đồ (như `react-native-chart-kit`) để vẽ dữ liệu lịch sử.

## 4. Xây dựng các Màn hình (Screens Implementation)
- [ ] **Màn hình Auth:** Form Đăng nhập và Đăng ký (có validation).
- [ ] **Màn hình Home (Dashboard):** 
    - Hiển thị danh sách các cảm biến.
    - Chức năng "Pull to Refresh" để cập nhật dữ liệu mới nhất.
    - Hiển thị thông báo trạng thái tổng quát.
- [ ] **Màn hình Lịch sử (History):** Cho phép chọn khoảng thời gian và xem biểu đồ diễn biến.
- [ ] **Màn hình Cá nhân (Profile):** Đổi mật khẩu và Đăng xuất.

## 5. Tối ưu hóa & Hoàn thiện (Refinement)
- [ ] **Error Handling:** Xử lý hiển thị thông báo lỗi từ Backend (GlobalExceptionHandler) lên Toast hoặc Alert.
- [ ] **Auto Login:** Kiểm tra token trong Storage khi mở app để tự động vào Home.
- [ ] **Styling:** Tinh chỉnh CSS/StyleSheet để app trông hiện đại và chuyên nghiệp hơn.

---
**Thứ tự ưu tiên:** 
1. `Cấu hình API` -> 2. `Login Flow` -> 3. `Dashboard hiển thị dữ liệu thực` -> 4. `Biểu đồ lịch sử`.


 1. Cài đặt thư viện (nếu chưa có):
      Mở terminal tại thư mục app/ và chạy lệnh:

   1     npm install

   2. Khởi chạy ứng dụng:
      Chạy lệnh sau để bắt đầu phiên làm việc với Expo:
   1     npx expo start