import axiosClient from './axiosClient';

/**
 * Lấy thông tin user hiện tại (dựa vào token trong header)
 */
export const getMyProfile = () => {
    return axiosClient.get('/api/v1/users/profile');
};

/**
 * Lấy danh sách tất cả người dùng (Admin)
 */
export const getAllUsers = () => {
    return axiosClient.get('/api/v1/users');
};

/**
 * Lấy thông tin người dùng theo ID
 */
export const getUserById = (id) => {
    return axiosClient.get(`/api/v1/users/${id}`);
};

/**
 * Cập nhật thông tin người dùng
 * @param {Object} userData 
 */
export const updateUser = (userData) => {
    return axiosClient.put(`/api/v1/users/profile`, userData);
};

/**
 * Xóa người dùng
 * @param {number} id 
 */
export const deleteUser = (id) => {
    return axiosClient.delete(`/api/v1/users/${id}`);
};
