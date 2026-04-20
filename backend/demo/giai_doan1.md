# Giai đoạn 1: Thiết lập Spring Security và JWT - API Đăng ký & Đăng nhập

Tài liệu này hướng dẫn chi tiết cách triển khai hệ thống xác thực và phân quyền cơ bản cho dự án Air Monitoring System sử dụng Spring Boot, Spring Security và JSON Web Token (JWT).

## 1. Mục tiêu
- Thiết lập cấu hình bảo mật với Spring Security.
- Triển khai cơ chế xác thực dựa trên Token (JWT).
- Xây dựng API Đăng ký (Signup) và Đăng nhập (Signin).
- Lưu trữ thông tin người dùng vào cơ sở dữ liệu (H2/MySQL/PostgreSQL).

## 2. Thành phần hệ thống

### 2.1. Dependencies (Đã có trong pom.xml)
- `spring-boot-starter-security`: Bộ khung bảo mật.
- `jjwt`: Thư viện tạo và xử lý JWT.
- `spring-boot-starter-data-jpa`: Tương tác với cơ sở dữ liệu.
- `spring-boot-starter-validation`: Kiểm tra dữ liệu đầu vào.
- `lombok`: Giảm bớt code boilerplate.

### 2.2. Cấu trúc thư mục đề xuất (Theo Feature-based & Layered)
```text
src/main/java/com/example/demo/
├── auth/ (Chức năng Xác thực)
│   ├── controller/
│   │   └── AuthController.java (Tiếp nhận request)
│   ├── service/
│   │   ├── AuthService.java (Interface định nghĩa nghiệp vụ)
│   │   └── AuthServiceImpl.java (Triển khai nghiệp vụ)
│   ├── repository/
│   │   ├── UserRepository.java (Giao tiếp DB cho User)
│   │   └── RoleRepository.java (Giao tiếp DB cho Role)
│   ├── entity/
│   │   ├── User.java (Mapping DB table 'users')
│   │   ├── Role.java (Mapping DB table 'roles')
│   │   └── ERole.java (Enum: ROLE_USER, ROLE_ADMIN)
│   └── dto/ (Data Transfer Object)
│       ├── request/
│       │   ├── LoginRequest.java (Dữ liệu user gửi lên khi login)
│       │   └── SignupRequest.java (Dữ liệu user gửi lên khi đăng ký)
│       └── response/
│           ├── JwtResponse.java (Dữ liệu trả về khi login thành công)
│           └── MessageResponse.java (Thông báo phản hồi chung)
├── security/ (Cấu hình bảo mật hệ thống)
│   ├── jwt/
│   │   ├── AuthEntryPointJwt.java (Xử lý lỗi 401 Unauthorized)
│   │   ├── AuthTokenFilter.java (Bộ lọc JWT cho mỗi request)
│   │   └── JwtUtils.java (Tạo/Giải mã/Kiểm tra Token)
│   ├── services/
│   │   ├── UserDetailsImpl.java (Cấu trúc User trong Security)
│   │   └── UserDetailsServiceImpl.java (Tìm User từ DB cho Security)
│   └── WebSecurityConfig.java (Cấu hình FilterChain, PasswordEncoder)
```

## 3. Quy trình xử lý (Flow)
1. **User**: Gửi Request (JSON) tới API.
2. **Controller**: Tiếp nhận Request, sử dụng các lớp trong thư mục `dto.request` để map dữ liệu. Gọi đến **Service**.
3. **Service**: Xử lý logic nghiệp vụ (Kiểm tra tồn tại, mã hóa mật khẩu, xác thực bằng AuthenticationManager). Tương tác với **Repository**.
4. **Repository**: Thực hiện các câu lệnh truy vấn tới **Database** thông qua **Entity**.
5. **Service**: Nhận kết quả từ Repository, xử lý và đóng gói vào các lớp trong thư mục `dto.response`.
6. **Controller**: Trả về Response (JSON) cho **User**.

## 4. Các bước thực hiện chi tiết

### Bước 1: Định nghĩa Entity và Repository
1. Tạo `User.java` và `Role.java` trong gói `auth.entity`.
2. Tạo `UserRepository` và `RoleRepository` trong gói `auth.repository`.

### Bước 2: Thiết lập Security & JWT
1. Triển khai các lớp trong gói `security` để cấu hình Spring Security chạy ở chế độ Stateless (không dùng Session).
2. Tạo `JwtUtils` để quản lý Token.

### Bước 3: Triển khai Service
1. Tạo `AuthService` interface với các phương thức `login` và `register`.
2. Tạo `AuthServiceImpl` để thực hiện logic:
    - `register`: Map `SignupRequest` -> `User` entity -> Save.
    - `login`: Xác thực -> Tạo JWT -> Trả về `JwtResponse`.

### Bước 4: Xây dựng Controller
1. Tạo `AuthController` để expose các endpoint `/api/auth/signin` và `/api/auth/signup`.
2. Sử dụng `@Valid` để kiểm tra dữ liệu đầu vào từ DTO.

## 4. Đặc tả API

### 4.1. Đăng ký tài khoản
- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Body**:
```json
{
  "username": "user123",
  "email": "user123@example.com",
  "password": "password123",
  "role": ["user"]
}
```

### 4.2. Đăng nhập
- **URL**: `/api/auth/signin`
- **Method**: `POST`
- **Body**:
```json
{
  "username": "user123",
  "password": "password123"
}
```
- **Response thành công**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "user123",
  "email": "user123@example.com",
  "roles": ["ROLE_USER"]
}
```

## 5. Hướng dẫn kiểm tra (Testing)
1. Chạy ứng dụng.
2. Sử dụng Postman hoặc Curl để gọi API Signup.
3. Gọi API Signin để lấy Token.
4. Thử truy cập một API được bảo vệ (ví dụ `/api/test/user`) bằng cách thêm Header: `Authorization: Bearer <TOKEN>`.

---
*Lưu ý: Luôn giữ bí mật chuỗi JWT Secret trong file application.properties.*
