# Nhật ký sửa lỗi hệ thống Air Monitoring (ESP32 + Docker)

Dưới đây là các lỗi đã gặp phải trong quá trình cài đặt và cách xử lý để tránh lặp lại trong tương lai.

## 1. Lỗi ESP32 không kết nối được WiFi
*   **Hiện tượng:** Serial Monitor báo `..........` rồi chuyển sang chế độ `OFFLINE`.
*   **Nguyên nhân:** 
    *   Thời gian chờ kết nối (timeout) quá ngắn (5 giây), trong khi một số Router cần 10-15 giây để cấp IP.
    *   Sai SSID hoặc Password (cần kiểm tra kỹ hoa/thường).
*   **Cách sửa:** 
    *   Tăng số lần thử kết nối trong code `WiFi_init()` lên 30-40 lần (khoảng 15-20 giây).
    *   Đảm bảo dùng WiFi băng tần **2.4GHz** (ESP32 không bắt được 5GHz).

## 2. Lỗi tranh chấp cổng (Port Conflict)
*   **Hiện tượng:** Chạy `docker compose up -d` bị báo lỗi `address already in use` (cổng đã bị sử dụng).
*   **Nguyên nhân:** Máy tính của bạn đã cài sẵn các dịch vụ như `mosquitto` hoặc `influxdb` chạy trực tiếp trên hệ điều hành, khiến Docker không thể chiếm được cổng 1883 hoặc 8086.
*   **Cách kiểm tra:** 
    ```bash
    sudo ss -tulpn | grep 1883
    sudo ss -tulpn | grep 8086
    ```
*   **Cách sửa:** Dừng các dịch vụ chạy ngoài Docker để nhường chỗ cho Docker:
    ```bash
    sudo systemctl stop mosquitto
    sudo systemctl disable mosquitto
    sudo systemctl stop influxdb
    sudo systemctl disable influxdb
    ```

## 3. Lỗi sai Port Mapping trong Docker
*   **Hiện tượng:** ESP32 báo `MQTT OK` nhưng InfluxDB không thấy dữ liệu.
*   **Nguyên nhân:** File `docker-compose.yml` cấu hình map cổng `1884:1883`, trong khi ESP32 gửi vào cổng `1883`.
*   **Cách sửa:** Luôn đảm bảo cổng bên trái (Host) và cổng ESP32 gửi tới phải khớp nhau. Nên để mặc định là `1883:1883` và `8086:8086`.

## 4. Lỗi DNS nội bộ của Docker
*   **Hiện tượng:** Log Telegraf báo lỗi `dial tcp: lookup influxdb: server misbehaving`.
*   **Nguyên nhân:** Sau khi thay đổi cấu hình hoặc restart nhiều lần, mạng nội bộ của Docker bị lỗi phân giải tên miền (không tìm thấy tên `influxdb` hay `mosquitto`).
*   **Cách sửa:** Khởi động lại toàn bộ hệ thống Docker một cách sạch sẽ:
    ```bash
    docker compose down
    docker compose up -d
    ```

## 5. Lỗi Log Mosquitto không in ra màn hình
*   **Hiện tượng:** Chạy `docker logs mosquitto` không thấy log kết nối của ESP32.
*   **Nguyên nhân:** Do file `mosquitto.conf` cấu hình ghi log vào file thay vì in ra màn hình (`log_dest file`).
*   **Cách xem log thực tế:**
    ```bash
    docker exec mosquitto cat /mosquitto/log/mosquitto.log
    ```

---
**Lời khuyên:** Mỗi khi thay đổi IP máy tính hoặc WiFi, hãy cập nhật lại code ESP32 và kiểm tra xem máy tính có đang chạy dịch vụ trùng cổng nào không trước khi khởi động Docker.

---

## 6. Thay đổi kiến trúc: Firebase → InfluxDB + MQTT

**Ngày:** 2026-04-21

### Lý do
Firebase Realtime Database yêu cầu xác thực và quản lý bảo mật phức tạp hơn. Chuyển sang stack **ESP32 → MQTT → Telegraf → InfluxDB 2.x** để đơn giản hơn và phù hợp với time-series data.

### Các file đã sửa / tạo mới

#### `src/mqtt_client.cpp`
- Đổi tên field trong JSON payload cho khớp với tên lưu vào InfluxDB:
  - `temp` → `temperature`
  - `humi` → `humidity`
  - `dust` → `pm2_5`
- Thêm field `pm10` (tính xấp xỉ `dust * 1.5f` — cần điều chỉnh theo cảm biến thực tế).

#### `src/WiFi_Config.cpp`
- Hardcode trực tiếp SSID và password thay vì dùng cú pháp `"$ssid"` (không hợp lệ trong C++).

#### `src/mqtt_client.cpp` (MQTT_BROKER)
- Hardcode `MQTT_BROKER = "192.168.1.103"` thay vì `"$MQTT_BROKER"`.

#### `src/backup_air_data.py`
- Xóa toàn bộ phần đọc Firebase, thay bằng đọc từ InfluxDB 2.x.
- Query Flux **không dùng `pivot`** — lấy narrow format rồi pivot trong Python bằng `pivot_table`.
- Cập nhật field names: `temperature`, `humidity`, `co`, `nh3`, `pm2_5`, `pm10`.
- Cập nhật `THRESHOLDS` theo field names mới, thêm ngưỡng cho `pm2_5` (35 µg/m³) và `pm10` (50 µg/m³).
- Cập nhật `send_alert()` payload theo field names mới.
- Measurement name trong Flux query: `air_quality`.

#### `telegraf/telegraf.conf` *(file mới)*
- Subscribe MQTT topic `sensor/esp32/data` từ broker `mosquitto:1883`.
- Parse JSON tự động, tag `device` để phân biệt thiết bị.
- Ghi vào InfluxDB 2.x measurement `air_quality`, đọc token/org/bucket từ biến môi trường.

#### `docker-compose.yml` *(file mới)*
- 3 service: `mosquitto` (MQTT broker), `influxdb` (2.7), `telegraf` (1.30).
- InfluxDB tự khởi tạo org/bucket/token qua biến môi trường `DOCKER_INFLUXDB_INIT_*`.
- Volume `influxdb_data` để persist dữ liệu.

#### `mosquitto/mosquitto.conf` *(file mới)*
- Cấu hình tối thiểu: listen port 1883, cho phép kết nối ẩn danh.

#### `.env.example`
- Xóa `FIREBASE_URL`.
- Thêm `INFLUX_URL`, `INFLUX_TOKEN`, `INFLUX_ORG`, `INFLUX_BUCKET`.
- Giữ lại `ESP32_HTTP`, `MQTT_BROKER`, `BACKUP_FILE`, `POLL_INTERVAL`.

### Luồng dữ liệu mới
```
ESP32 (MQTT publish JSON)
  → Mosquitto (broker :1883)
  → Telegraf (subscribe + parse JSON)
  → InfluxDB 2.x (measurement: air_quality, narrow format)
  → backup_air_data.py (query Flux → pivot → ECOD + Prophet → alert)
  → ESP32 (HTTP POST /alert)
```

### Lưu ý
- `pm10` hiện là giá trị ước tính (`dust * 1.5`). Nếu không có cảm biến đo PM10 riêng thì nên bỏ field này để tránh dữ liệu sai.
- Mỗi khi đổi IP máy tính, cần cập nhật `MQTT_BROKER` trong `src/mqtt_client.cpp` và `ESP32_HTTP` trong `.env`.
