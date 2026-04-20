# Tài liệu Phân tích & Lộ trình Phát triển Backend - Hệ thống Giám sát Không khí

Tài liệu này ghi lại các thành phần cần thiết để xây dựng Backend cho ứng dụng di động quản lý chất lượng không khí.

## 1. Quản lý Người dùng & Xác thực (User & Authentication)
Sử dụng mô hình bảo mật Stateless với JWT để phù hợp với App di động.

*   **Công nghệ:** Spring Security, JSON Web Token (JWT).
*   **Cơ sở dữ liệu:** SQL (H2 cho môi trường dev/test hoặc MySQL/PostgreSQL cho thực tế) để lưu thông tin tài khoản.
*   **Chức năng:**
    *   Đăng ký tài khoản.
    *   Đăng nhập & Cấp Token.
    *   Quản lý thông tin cá nhân (Profile).
    *   Phân quyền (User/Admin) - ví dụ: Admin mới được cấu hình ngưỡng cảnh báo.

## 2. Quản lý Chỉ số & Dữ liệu Chuỗi thời gian (Metric & Time-series)
Xử lý dữ liệu từ ESP32 và cung cấp dữ liệu cho biểu đồ trên App.

*   **Công nghệ:** InfluxDB, Flux Query Language.
*   **Các API chính:**
    *   `GET /api/metrics/realtime`: Lấy dữ liệu mới nhất (PM2.5, nhiệt độ, độ ẩm, CO2...).
    *   `GET /api/metrics/history`: Truy vấn dữ liệu lịch sử. Cần thực hiện **downsampling** (giảm tỉ lệ mẫu) để App vẽ biểu đồ mượt hơn (ví dụ: lấy trung bình mỗi giờ thay vì lấy từng phút).
*   **Use Case:** Vẽ biểu đồ diễn biến chất lượng không khí theo ngày/tuần/tháng.

## 3. Hệ thống Cảnh báo (Alerting & Notifications)
Thông báo cho người dùng khi chất lượng không khí xuống mức nguy hiểm.

*   **Công nghệ:** Spring Task Scheduling (`@Scheduled`), Firebase Cloud Messaging (FCM).
*   **Cơ chế:**
    *   Backend chạy tác vụ ngầm định kỳ kiểm tra các chỉ số mới nhất.
    *   So sánh với ngưỡng (threshold) được thiết lập (ví dụ AQI > 100).
    *   Nếu vượt ngưỡng, gọi Firebase Admin SDK để đẩy thông báo xuống điện thoại.
*   **Tính năng thêm:** Cho phép người dùng tùy chỉnh ngưỡng cảnh báo riêng trên App.

## 4. Các dependencies cần thêm vào `pom.xml`

```xml
<!-- Bảo mật JWT -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>

<!-- Cơ sở dữ liệu cho User -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Thông báo Firebase -->
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

## 5. Lộ trình thực hiện (Roadmap)
1.  **Giai đoạn 1:** Thiết lập Spring Security và JWT. Tạo các API đăng ký/đăng nhập cơ bản.
2.  **Giai đoạn 2:** Viết Service kết nối InfluxDB. Tạo API lấy dữ liệu thời gian thực và lịch sử cho App.
3.  **Giai đoạn 3:** Tích hợp Firebase Admin SDK. Viết logic kiểm tra ngưỡng và gửi thông báo đẩy.
4.  **Giai đoạn 4:** Tối ưu hóa API và đóng gói ứng dụng (Dockerize).
