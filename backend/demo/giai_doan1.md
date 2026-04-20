# Giai đoạn 1: Thiết lập Spring Security và JWT - API Đăng ký & Đăng nhập

Tài liệu này hướng dẫn chi tiết cách triển khai hệ thống xác thực và phân quyền cho dự án Air Monitoring System.

## 1. Mục tiêu
- Thiết lập cấu hình bảo mật với Spring Security 6.x.
- Triển khai cơ chế xác thực Stateless dựa trên JWT (JJWT 0.12.5).
- Xây dựng API Đăng ký, Đăng nhập và Làm mới Token.
- Lưu trữ thông tin người dùng vào PostgreSQL.

## 2. Thành phần hệ thống

### 2.1. Dependencies chính (pom.xml)
- `spring-boot-starter-security`: Framework bảo mật.
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson`: Thư viện JWT phiên bản mới nhất (0.12.5).
- `spring-boot-starter-data-jpa`: Tương tác DB qua Hibernate.
- `spring-dotenv`: Tự động nạp biến môi trường từ file `.env`.
- `postgresql`: Driver kết nối PostgreSQL.

### 2.2. Cấu trúc thư mục thực tế
```text
src/main/java/com/example/demo/
├── auth/ (Xác thực & Định danh)
│   ├── controller/ AuthController.java
│   ├── dto/ (AuthRequest, AuthResponse, RegisterRequest,...)
│   └── service/ AuthService.java
├── user/ (Quản lý người dùng)
│   ├── entity/ User.java
│   ├── repository/ UserRepository.java
│   ├── service/ UserService.java
│   └── controller/ UserController.java
├── security/ (Cấu hình hệ thống)
│   ├── ApplicationConfig.java (Beans: PasswordEncoder, AuthenticationManager)
│   ├── JwtService.java (Xử lý Token)
│   ├── JwtAuthenticationFilter.java (Bộ lọc Request)
│   └── SecurityConfiguration.java (Cấu hình FilterChain)
└── base/ (Cấu trúc nền tảng)
    └── entity/ BaseEntity.java (Chứa ID, CreatedAt, UpdatedAt)
```

## 3. Đặc tả API thực tế

### 3.1. Đăng ký tài khoản
- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Body**:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123"
}
```

### 3.2. Đăng nhập (Lấy Token)
- **URL**: `/api/v1/auth/authenticate`
- **Method**: `POST`
- **Body**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

### 3.3. Làm mới Token
- **URL**: `/api/v1/auth/refresh-token`
- **Method**: `POST`
- **Body**: `{ "refreshToken": "..." }`

## 4. Hướng dẫn vận hành & Kiểm tra (MỚI)

### Bước 1: Khởi động Database (Docker)
Yêu cầu đã cài đặt Docker và Docker Compose. Chạy lệnh sau tại thư mục gốc:
```bash
docker-compose up -d postgres
```

### Bước 2: Cấu hình Môi trường
Kiểm tra file `.env` tại thư mục gốc để đảm bảo các thông số khớp với Database:
```env
POSTGRES_DB=airmonitor
POSTGRES_USER=admin
POSTGRES_PASSWORD=Duong123
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

### Bước 3: Chạy ứng dụng
```bash
./mvnw spring-boot:run
```

### Bước 4: Kiểm tra với Postman
1. Gọi API **Register** để tạo tài khoản.
2. Gọi API **Authenticate** để lấy `accessToken`.
3. Truy cập API bảo vệ (Ví dụ lấy danh sách user):
   - **URL**: `GET http://localhost:8080/api/v1/users`
   - **Header**: `Authorization: Bearer <TOKEN_CỦA_BẠN>`

---
*Lưu ý: Hệ thống sử dụng BCrypt để mã hóa mật khẩu trước khi lưu xuống DB. Không bao giờ lưu mật khẩu dưới dạng văn bản thuần túy.*
   1. Thêm Dependency: Thêm springdoc-openapi-starter-webmvc-ui vào pom.xml.
   2. Cấu hình Security: Cập nhật SecurityConfiguration.java để cho phép truy cập các endpoint của Swagger mà không cần đăng nhập.
   3. Hỗ trợ JWT trong Swagger: Tạo file SwaggerConfig.java để bạn có thể dán JWT token vào Swagger UI và test các API yêu cầu bảo mật.

  Sau khi bạn chạy ứng dụng, bạn có thể truy cập Swagger tại địa chỉ:
  http://localhost:8080/swagger-ui/index.html

  Cách test API có bảo mật trên Swagger:
   1. Sử dụng API /api/v1/auth/authenticate (hoặc register) để lấy access_token.
   2. Nhấn nút "Authorize" ở phía trên bên phải giao diện Swagger.
   3. Dán mã token vào ô giá trị và nhấn Authorize. Bây giờ bạn có thể gọi các API yêu cầu quyền đăng nhập.
