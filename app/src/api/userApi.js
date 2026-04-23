import axiosClient from './axiosClient';

/**
 * Lấy danh sách tất cả người dùng (Admin)
 */
export const getAllUsers = () => {
    return axiosClient.get('/api/v1/users');
};

/**
 * Lấy thông tin người dùng theo ID
 * @param {number} id 
 */
export const getUserById = (id) => {
    return axiosClient.get(`/api/v1/users/${id}`);
};

/**
 * Cập nhật thông tin người dùng
 * @param {number} id 
 * @param {Object} userData 
 */
export const updateUser = (id, userData) => {
    return axiosClient.put(`/api/v1/users/${id}`, userData);
};

/**
 * Xóa người dùng
 * @param {number} id 
 */
export const deleteUser = (id) => {
    return axiosClient.delete(`/api/v1/users/${id}`);
};
