import { useState, useCallback, useEffect, useRef } from "react";
import { getLatestAirQuality, getAirQualityHistory, getChartData } from '../api/airQualityApi';

export const useAirQuality = (deviceName) => {
  const [latestData, setLatestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dùng ref để tránh stale closure
  const deviceNameRef = useRef(deviceName);
  useEffect(() => {
    deviceNameRef.current = deviceName;
  }, [deviceName]);

  const fetchLatest = useCallback(async () => {
    const name = deviceNameRef.current;
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getLatestAirQuality(name);
      setLatestData(data);
    } catch (err) {
      console.log('Fetch latest error:', err.message || err);
      setError(err.message || 'Lỗi lấy dữ liệu mới nhất');
    } finally {
      setLoading(false);
    }
  }, []);

  // Normalize: map pm2_5 → pm25, time → timestamp để app dùng nhất quán
  const normalizeItem = (item) => ({
    ...item,
    pm25: item.pm25 ?? item.pm2_5,
    timestamp: item.timestamp ?? item.time,
  });

  const fetchHistory = useCallback(async (startTime, endTime) => {
    const name = deviceNameRef.current;
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAirQualityHistory(name, startTime, endTime);
      const list = Array.isArray(data) ? data : (data?.data || data?.content || []);
      setHistoryData(list.map(normalizeItem));
    } catch (err) {
      console.log('Fetch history error:', err.message || err);
      setError(err.message || 'Lỗi lấy lịch sử');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChart = useCallback(async (startTime, endTime) => {
    const name = deviceNameRef.current;
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getChartData(name, startTime, endTime);
      const list = Array.isArray(data) ? data : (data?.data || data?.content || []);
      setChartData(list.map(normalizeItem));
    } catch (err) {
      console.log('Fetch chart error:', err.message || err);
      setError(err.message || 'Lỗi lấy biểu đồ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  return {
    latestData,
    historyData,
    chartData,
    loading,
    error,
    fetchLatest,
    fetchHistory,
    fetchChart,
  };
};
