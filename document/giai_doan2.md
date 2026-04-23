# Giai đoạn 2: Kết nối InfluxDB & Xây dựng API Dữ liệu Thời gian thực (Real-time)

Tài liệu này hướng dẫn cách tích hợp InfluxDB vào Spring Boot để lưu trữ và truy vấn dữ liệu từ các cảm biến không khí.

## 1. Mục tiêu
- Cấu hình kết nối InfluxDB 2.x thông qua InfluxDB Client Java.
- Xây dựng Service xử lý truy vấn dữ liệu bằng ngôn ngữ Flux.
- Cung cấp API lấy dữ liệu mới nhất (Latest) và dữ liệu lịch sử (History) cho ứng dụng di động.

## 2. Thành phần hệ thống

### 2.1. Cấu trúc thư mục bổ sung
```text
src/main/java/com/example/demo/
├── airquality/ (Quản lý dữ liệu không khí)
│   ├── controller/ AirQualityController.java
│   ├── dto/ (AirQualityResponse, AirQualityRealtimeResponse)
│   ├── entity/ AirQualityData.java (POJO mapping InfluxDB)
│   ├── mapper/ AirQualityMapper.java (Logic gộp dữ liệu & tính toán Status)
│   ├── repository/ AirQualityRepository.java 
│   └── service/ AirQualituServiceImplements.java
└── config/
    └── InfluxDBConfig.java (Cấu hình Bean InfluxDBClient)
```

## 3. Đặc tả Entity (AirQualityData)
- **@Measurement**: Đã cập nhật thành `air_quality` để khớp với dữ liệu từ dự án phần cứng.
- **Cấu trúc dữ liệu**: InfluxDB lưu trữ theo dạng dòng (mỗi dòng chứa 1 trường `_field` và giá trị `_value`). Do đó, Backend cần thực hiện logic gộp (Group by Timestamp) ở lớp Mapper.

## 4. Tích hợp Hạ tầng Phần cứng (Infrastructure Integration)

### 4.1. Cấu hình Docker & .env
Backend kết nối trực tiếp tới container InfluxDB đang chạy của phần cứng (Cổng 8086).
Các biến môi trường trong `.env` phải khớp chính xác: `INFLUX_URL`, `INFLUX_TOKEN`, `INFLUX_ORG`, `INFLUX_BUCKET`.

### 4.2. Tự động khởi động lại (Hot Reload)
Đã thêm `spring-boot-devtools` vào `pom.xml`. Ứng dụng sẽ tự động restart khi phát hiện thay đổi trong mã nguồn (yêu cầu IDE biên dịch file `.class`).

## 5. Logic xử lý dữ liệu đặc thù

### 5.1. Nhóm dữ liệu (Grouping by Timestamp)
Vì mỗi bản ghi InfluxDB chỉ chứa một chỉ số (VD: chỉ có nhiệt độ), lớp `AirQualityMapper` thực hiện nhóm các bản ghi có cùng `timestamp` vào chung một Object `AirQualityResponse`. Điều này giúp Frontend nhận được dữ liệu JSON đầy đủ các trường (`temperature`, `humidity`, `co`, `pm2.5`,...).

### 5.2. Tính toán trạng thái (Status Calculation)
Hệ thống tự động phân loại chất lượng không khí dựa trên các ngưỡng:
- **Nhiệt độ:** > 35°C (HIGH_TEMPERATURE)
- **Độ ẩm:** < 30% (LOW) hoặc > 80% (HIGH)
- **Khí CO:** > 12.5 (HIGH_CO)
- **Bụi mịn PM2.5:** > 35 µg/m³ (HIGH_PM25)

## 6. Hướng dẫn vận hành & Kiểm thử

### 6.1. Cách chạy
1. Đảm bảo InfluxDB phần cứng đang chạy.
2. `docker compose up -d` (Chạy Postgres cho User).
3. `./mvnw spring-boot:run`.

### 6.2. Cách Test API (Swagger)
- **Lấy dữ liệu mới nhất:** `GET /api/v1/air-quality/latest/{device}`
- **Lấy lịch sử:** `GET /api/v1/air-quality/history/{device}?startTime=-24h&endTime=now()`
  - `startTime` có thể dùng định dạng tương đối (`-24h`, `-7d`) hoặc ISO 8601 (`2026-04-21T00:00:00Z`).

---
*Ghi chú: Toàn bộ API hiện tại yêu cầu xác thực JWT nhưng không phân chia quyền Admin/User để thuận tiện cho việc phát triển và tích hợp hệ thống.*
