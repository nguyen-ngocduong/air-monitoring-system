import axios from 'axios';
import { API_URL } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosClient = axios.create({
  baseURL: API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor cho Request
axiosClient.interceptors.request.use(
  async (config) => {
    // KHÔNG gửi token cho các endpoint đăng nhập/đăng ký
    const isAuthRequest = config.url && (config.url.includes('/auth/authenticate') || config.url.includes('/auth/register'));
    
    if (!isAuthRequest) {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.log('Lỗi lấy token');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho Response
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorInfo = {
      message: 'Đã có lỗi xảy ra',
      status: 0
    };

    if (error && error.response) {
      // Lỗi từ phía Server
      errorInfo.status = error.response.status;
      const serverData = error.response.data;
      
      // Sử dụng thông báo từ server nếu có
      errorInfo.message = (serverData && serverData.message) 
                          ? serverData.message 
                          : `Lỗi hệ thống (${error.response.status})`;
      
      // Log lỗi ra console để debug (dùng cách an toàn)
      console.log('API Error Status:', String(errorInfo.status));
    } else if (error && error.request) {
      errorInfo.message = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra IP hoặc mạng.';
    } else {
      errorInfo.message = error ? error.message : 'Lỗi khởi tạo yêu cầu';
    }

    return Promise.reject(errorInfo);
  }
);

export default axiosClient;
