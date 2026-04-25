import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi } from '../api/authApi';
import { getAllUsers, updateUser, getMyProfile } from '../api/userApi';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: true, // true khi đang restore từ AsyncStorage
};

// ─── Action Types ─────────────────────────────────────────────────────────────
export const AUTH_ACTIONS = {
  LOGIN_SUCCESS:  'LOGIN_SUCCESS',
  LOGOUT:         'LOGOUT',
  UPDATE_USER:    'UPDATE_USER',
  RESTORE_TOKEN:  'RESTORE_TOKEN',
  SET_LOADING:    'SET_LOADING',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };

    case AUTH_ACTIONS.RESTORE_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: !!action.payload.token,
        loading: false,
      };

    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, loading: false };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext();

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore token khi app khởi động (dùng key 'accessToken' giống hook cũ)
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('accessToken');
        const savedUser  = await AsyncStorage.getItem('user');
        const user = savedUser ? JSON.parse(savedUser) : null;

        dispatch({
          type: AUTH_ACTIONS.RESTORE_TOKEN,
          payload: { token: savedToken, user },
        });
      } catch (error) {
        console.error('Failed to restore token:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    restoreToken();
  }, []);

  // ── LOGIN: nhận (username, password) → gọi API → lưu store ─────────────────
  const login = async (username, password) => {
    try {
      const res = await loginApi({ username, password });

      // Backend có thể trả 'token' hoặc 'accessToken'
      const authToken = res.token || res.accessToken;
      const userData  = res.user || { username };

      if (!authToken) {
        throw new Error('Không nhận được Token từ server');
      }

      // Lưu token trước để axiosClient có thể dùng cho request tiếp theo
      await AsyncStorage.setItem('accessToken', String(authToken));

      // Gọi API lấy đầy đủ thông tin user (có role, email, id, ...)
      let fullUserData = userData;
      try {
        fullUserData = await getMyProfile();
      } catch (profileErr) {
        console.warn('⚠️ Không lấy được profile, dùng dữ liệu tạm:', profileErr.message);
      }

      await AsyncStorage.setItem('user', JSON.stringify(fullUserData));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token: authToken, user: fullUserData },
      });

      return res;
    } catch (err) {
      console.error('Login error:', err.message);
      throw err;
    }
  };

  // ── LOGOUT ───────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ── UPDATE USER ───────────────────────────────────────────────────────────────
  const updateUserInformation = async (userData) => {
    try {
      const res = await updateUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(res));
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: res });
      return res;
    } catch (err) {
      throw err;
    }
  };

  // ── GET ALL USERS ─────────────────────────────────────────────────────────────
  const getInformationAllUser = async () => {
    try {
      return await getAllUsers();
    } catch (err) {
      throw err;
    }
  };

  const value = {
    // State
    ...state,
    // Actions
    login,
    logout,
    updateUserInformation,
    getInformationAllUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────
export const useAuthStore = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthStore must be used within AuthProvider');
  }
  return context;
};
