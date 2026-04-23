import axiosClient from './axiosClient';

/**
 * Đăng nhập hệ thống
 * @param {Object} data - { username, password }
 */
export const loginApi = (data) => {
    return axiosClient.post('/api/v1/auth/authenticate', data);
};

/**
 * Đăng ký tài khoản mới
 * @param {Object} data - { username, email, password }
 */
export const registerApi = (data) => {
    return axiosClient.post('/api/v1/auth/register', data);
};

/**
 * Làm mới token
 * @param {Object} data - { refreshToken }
 */
export const refreshTokenApi = (data) => {
    return axiosClient.post('/api/v1/auth/refresh-token', data);
};
