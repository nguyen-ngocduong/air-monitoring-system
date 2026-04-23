import axiosClient from './axiosClient';

/**
 * Lấy dữ liệu mới nhất của thiết bị
 * @param {string} deviceName 
 */
export const getLatestAirQuality = (deviceName) => {
    return axiosClient.get(`/api/v1/air-quality/latest/${deviceName}`);
};

/**
 * Lấy lịch sử dữ liệu của thiết bị trong khoảng thời gian
 */
export const getAirQualityHistory = (deviceName, startTime, endTime) => {
    return axiosClient.get(`/api/v1/air-quality/history/${deviceName}`, {
        params: { startTime, endTime }
    });
};

/** 
 * Lấy dữ liệu biểu đồ
 */
export const getChartData = (deviceName, startTime, endTime) => {
    return axiosClient.get(`/api/v1/air-quality/chart/${deviceName}`, {
        params: { startTime, endTime }
    });
};
