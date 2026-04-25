import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi } from "../api/authApi";
import { getAllUsers, updateUser } from "../api/userApi";

// tạo context
const AuthContext = createContext();

// provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // load token khi mở app
    useEffect(() => {
        const loadAuth = async () => {
            try {
                const savedToken = await AsyncStorage.getItem("accessToken");
                const savedUser = await AsyncStorage.getItem("user");

                if (savedToken) setToken(savedToken);
                if (savedUser) setUser(JSON.parse(savedUser));
            } catch (err) {
                console.log("Load auth error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAuth();
    }, []);

    // LOGIN
    const login = async (username, password) => {
        try {
            const res = await loginApi({ username, password });

            // SỬA LỖI Ở ĐÂY: Backend trả về 'token', không phải 'accessToken'
            const authToken = res.token || res.accessToken;
            const userData = res.user || { username }; // Nếu backend không trả user, lưu tạm username

            if (!authToken) {
                throw new Error("Không nhận được Token từ server");
            }

            // lưu storage - Đảm bảo giá trị truyền vào không phải null/undefined
            await AsyncStorage.setItem("accessToken", String(authToken));
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            // update state
            setToken(authToken);
            setUser(userData);

            return res;
        } catch (err) {
            console.log("Login error in hook:", err.message);
            throw err;
        }
    };

    // LOGOUT
    const logout = async () => {
        try {
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("user");
            setToken(null);
            setUser(null);
        } catch (e) {
            console.log("Logout error");
        }
    };

    // UPDATE USER
    const updateUserInformation = async (userData) => {
        try {
            const res = await updateUser(userData);
            setUser(res);
            await AsyncStorage.setItem("user", JSON.stringify(res));
            return res;
        } catch (err) {
            throw err;
        }
    };

    // LẤY THÔNG TIN TẤT CẢ USER
    const getInformationAllUser = async () => {
        try {
            const res = await getAllUsers();
            return res;
        } catch (err) {
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                updateUserInformation,
                getInformationAllUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// custom hook
export const useAuth = () => {
    return useContext(AuthContext);
};
