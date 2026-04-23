# Hướng dẫn chạy và xem dữ liệu trên InfluxDB

## 1. Khởi động hệ thống (Docker)
Để khởi động MQTT Broker (Mosquitto), InfluxDB và Telegraf, bạn cần chạy lệnh sau trong thư mục gốc của dự án:

```bash
docker-compose up -d
```

Lệnh này sẽ chạy các dịch vụ ở chế độ nền.

## 2. Cấu hình trên ESP32
Đảm bảo các thông tin sau đã được nạp vào ESP32 (Hiện tại đã đúng trong code):
- **WiFi SSID**: `P202`
- **Password**: `MoL@o202`
- **MQTT Broker IP**: `192.168.22.103` (Địa chỉ IP máy tính của bạn)

## 3. Truy cập InfluxDB để xem dữ liệu
Sau khi Docker đã chạy, bạn mở trình duyệt và truy cập:

- **Địa chỉ**: `http://192.168.22.103:8086` (hoặc `http://localhost:8086` nếu ngồi tại máy đó)
- **Tài khoản**: `influxDB-admin`
- **Mật khẩu**: `Duong123`
- **Organization**: `air-temparature-data`
- **Bucket**: `air-temparature-data`

### Cách tạo Dashboard xem biểu đồ:
1. Đăng nhập vào InfluxDB.
2. Chọn biểu tượng **Boards** (hình bảng) ở menu bên trái -> **Create Dashboard** -> **New Dashboard**.
3. Nhấn **Add Cell**.
4. Ở phần **Query Builder**:
   - **Lưu ý quan trọng:** Measurement `mqtt_consumer` chỉ xuất hiện sau khi ESP32 đã gửi dữ liệu thành công ít nhất 1 lần. Nếu chưa thấy, hãy đợi khoảng 30 giây (theo `SEND_INTERVAL` trong code).
   - Chọn Bucket: `air-temparature-data`.
   - Chọn Measurement: `mqtt_consumer`.
   - Chọn các trường dữ liệu: `temp`, `humi`, `co`, `nh3`, `dust`.
5. Nhấn **Submit** để xem biểu đồ, sau đó nhấn **Save** để lưu lại.

## 4. Các lệnh kiểm tra hữu ích
- Xem log của Telegraf để biết dữ liệu có vào InfluxDB không:
  ```bash
  docker logs -f telegraf
```
- Xem log của MQTT để biết ESP32 có kết nối thành công không:
  ```bash
  docker logs -f mosquitto
```
