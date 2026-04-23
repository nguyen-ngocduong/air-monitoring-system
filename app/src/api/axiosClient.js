import axios from 'axios';
import { API_URL } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// khoi tao axios instance
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // thoi gian cho ket noi
});
// gan token vao request header
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// xu ly response
axiosClient.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response) {
            // Xu ly loi tu server tra ve
            console.error('API Error:', error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // Loi khong nhan duoc phan hoi tu server
            console.error('No response from server:', error.request);
            return Promise.reject({ message: 'No response from server' });
        } else {
            // Loi xay ra khi tao request
            console.error('Error creating request:', error.message);
            return Promise.reject({ message: error.message });
        }
    }
);
export default axiosClient;