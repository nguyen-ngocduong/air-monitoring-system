import React, { createContext, useContext, useReducer } from 'react';

// Initial State
const initialState = {
  // Dữ liệu cảm biến mới nhất
  latestData: null,
  
  // Device đang được chọn
  selectedDevice: null,
  
  // Trạng thái loading
  loading: false,
  
  // Thời gian cập nhật cuối
  lastUpdated: null,
  
  // Error nếu có
  error: null,
  
  // Danh sách devices (nếu có nhiều thiết bị)
  devices: [],
};

// Action Types
export const AIR_QUALITY_ACTIONS = {
  SET_LATEST_DATA: 'SET_LATEST_DATA',
  SET_SELECTED_DEVICE: 'SET_SELECTED_DEVICE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DEVICES: 'SET_DEVICES',
  CLEAR_DATA: 'CLEAR_DATA',
  UPDATE_LAST_UPDATED: 'UPDATE_LAST_UPDATED',
};

// Reducer
const airQualityReducer = (state, action) => {
  switch (action.type) {
    case AIR_QUALITY_ACTIONS.SET_LATEST_DATA:
      return {
        ...state,
        latestData: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case AIR_QUALITY_ACTIONS.SET_SELECTED_DEVICE:
      return {
        ...state,
        selectedDevice: action.payload,
      };

    case AIR_QUALITY_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AIR_QUALITY_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case AIR_QUALITY_ACTIONS.SET_DEVICES:
      return {
        ...state,
        devices: action.payload,
      };

    case AIR_QUALITY_ACTIONS.UPDATE_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: new Date().toISOString(),
      };

    case AIR_QUALITY_ACTIONS.CLEAR_DATA:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

// Context
const AirQualityContext = createContext();

// Provider Component
export const AirQualityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(airQualityReducer, initialState);

  // Actions
  const setLatestData = (data) => {
    dispatch({
      type: AIR_QUALITY_ACTIONS.SET_LATEST_DATA,
      payload: data,
    });
  };

  const setSelectedDevice = (device) => {
    dispatch({
      type: AIR_QUALITY_ACTIONS.SET_SELECTED_DEVICE,
      payload: device,
    });
  };

  const setLoading = (loading) => {
    dispatch({
      type: AIR_QUALITY_ACTIONS.SET_LOADING,
      payload: loading,
    });
  };

  const setError = (error) => {
    dispatch({
      type: AIR_QUALITY_ACTIONS.SET_ERROR,
      payload: error,
    });
  };

  const setDevices = (devices) => {
    dispatch({
      type: AIR_QUALITY_ACTIONS.SET_DEVICES,
      payload: devices,
    });
  };

  const clearData = () => {
    dispatch({
      type: AIR_QUALITY_ACTIONS.CLEAR_DATA,
    });
  };

  const updateLastUpdated = () => {
    dispatch({
      type: AIR_QUALITY_ACTIONS.UPDATE_LAST_UPDATED,
    });
  };

  const value = {
    // State
    ...state,
    // Actions
    setLatestData,
    setSelectedDevice,
    setLoading,
    setError,
    setDevices,
    clearData,
    updateLastUpdated,
  };

  return (
    <AirQualityContext.Provider value={value}>
      {children}
    </AirQualityContext.Provider>
  );
};

// Custom Hook
export const useAirQualityStore = () => {
  const context = useContext(AirQualityContext);
  if (!context) {
    throw new Error('useAirQualityStore must be used within AirQualityProvider');
  }
  return context;
};
