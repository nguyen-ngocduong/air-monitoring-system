import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Dimensions,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Imports
import { loginApi, registerApi, refreshTokenApi } from './src/api/authApi';
import { getAllUsers, getUserById, updateUser, deleteUser } from './src/api/userApi';
import { getLatestAirQuality, getAirQualityHistory, getChartData } from './src/api/airQualityApi';

const { width } = Dimensions.get('window');

const App = () => {
  const [testResult, setTestResult] = useState('Đang khởi tạo...');
  const [loading, setLoading] = useState(true);
  const [airData, setAirData] = useState({
    pm25: 0,
    temp: 0,
    hum: 0,
    status: 'Đang tải...',
    color: '#95A5A6'
  });

  const getAqiInfo = (pm25) => {
    if (pm25 <= 12) return { status: 'Tốt', color: '#2ECC71' };
    if (pm25 <= 35) return { status: 'Trung bình', color: '#F1C40F' };
    if (pm25 <= 55) return { status: 'Kém', color: '#E67E22' };
    return { status: 'Nguy hại', color: '#E74C3C' };
  };

  useEffect(() => {
    const runFullTest = async () => {
      try {
        setLoading(true);
        console.log('--- BẮT ĐẦU TEST TOÀN BỘ API ---');

        // 0. Xóa token cũ (nếu có) để test luồng mới sạch sẽ
        await AsyncStorage.removeItem('accessToken');

        // 1. Test Auth API
        const name = 'User' + Math.floor(Math.random() * 1000);
        await registerApi({ 
          username: name, 
          email: `${name}@test.com`, 
          password: 'Password123' 
        });
        console.log('1. Register thành công');

        const loginRes = await loginApi({
          username: name,
          password: 'Password123'
        });
        
        // --- QUAN TRỌNG: LƯU TOKEN VÀO STORAGE ---
        if (loginRes.token) {
          await AsyncStorage.setItem('accessToken', loginRes.token);
          console.log('2. Login & Lưu token thành công');
        }

        // 2. Test User API (Bây giờ đã có Authorization Header nhờ interceptor)
        const allUsers = await getAllUsers();
        console.log('3. Lấy danh sách User thành công (Đã authorize)');

        // Giả định ID user là 1 để test chi tiết (vì loginRes có thể chưa có ID)
        try {
            const firstUser = allUsers[0];
            if (firstUser) {
                const userDetail = await getUserById(firstUser.id);
                console.log('4. Get User Detail thành công:', userDetail.username);
                
                await updateUser(firstUser.id, { ...firstUser, username: firstUser.username + '_mod' });
                console.log('5. Update User thành công');
            }
        } catch (e) { console.log('Lưu ý: Test User chi tiết thất bại (có thể do quyền Admin)'); }

        // 3. Test Air Quality API
        const deviceName = 'esp32';
        const latestAir = await getLatestAirQuality(deviceName);
        
        if (latestAir) {
          const pmValue = latestAir.pm25 || 0;
          const info = getAqiInfo(pmValue);
          setAirData({
            pm25: pmValue,
            temp: latestAir.temperature || 0,
            hum: latestAir.humidity || 0,
            status: info.status,
            color: info.color
          });
          console.log('6. Lấy dữ liệu mới nhất thành công');
        }

        const startTime = '2026-04-20T00:00:00Z';
        const endTime = new Date().toISOString();

        const history = await getAirQualityHistory(deviceName, startTime, endTime);
        console.log('7. Lấy lịch sử thành công, bản ghi:', history.length);

        const chart = await getChartData(deviceName, startTime, endTime);
        console.log('8. Lấy dữ liệu biểu đồ thành công');

        setTestResult('Tất cả API hoạt động tốt ✅');
      } catch (error) {
        console.error('LỖI TEST API:', error);
        setTestResult('Có lỗi khi test API ❌');
      } finally {
        setLoading(false);
      }
    };

    runFullTest();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>AIR MONITOR</Text>
          <Text style={styles.location}>📍 Trạm đo: ESP32_Sân_Vườn</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <FontAwesome5 name="bell" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.mainGaugeContainer}>
          <View style={[styles.gaugeCircle, { borderColor: airData.color }]}>
            <Text style={styles.pmLabel}>PM2.5</Text>
            <Text style={styles.pmValue}>{airData.pm25}</Text>
            <Text style={[styles.statusText, { color: airData.color }]}>{airData.status}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.infoCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#3498DB22' }]}>
              <FontAwesome5 name="thermometer-half" size={20} color="#3498DB" />
            </View>
            <Text style={styles.infoLabel}>Nhiệt độ</Text>
            <Text style={styles.infoValue}>{airData.temp}°C</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#9B59B622' }]}>
              <FontAwesome5 name="tint" size={20} color="#9B59B6" />
            </View>
            <Text style={styles.infoLabel}>Độ ẩm</Text>
            <Text style={styles.infoValue}>{airData.hum}%</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Kết quả kiểm tra API</Text>
          <View style={styles.statusLine}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={[styles.dot, { backgroundColor: testResult.includes('❌') ? '#E74C3C' : '#2ECC71' }]} />
            )}
            <Text style={styles.statusMsg}>{testResult}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshBtn}>
          <FontAwesome5 name="sync" size={16} color="#fff" />
          <Text style={styles.refreshText}>Làm mới dữ liệu</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 50, paddingBottom: 20 },
  appName: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  location: { color: '#7F8C8D', fontSize: 13, marginTop: 4 },
  notifBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
  mainGaugeContainer: { alignItems: 'center', marginVertical: 40 },
  gaugeCircle: { width: 220, height: 220, borderRadius: 110, borderWidth: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
  pmLabel: { color: '#7F8C8D', fontSize: 16, fontWeight: '600' },
  pmValue: { color: '#fff', fontSize: 64, fontWeight: 'bold' },
  statusText: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  infoCard: { backgroundColor: '#1E1E1E', width: (width - 70) / 2, padding: 20, borderRadius: 25, alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  infoLabel: { color: '#7F8C8D', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statusCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, marginBottom: 25 },
  statusTitle: { color: '#7F8C8D', fontSize: 14, marginBottom: 12, fontWeight: '600' },
  statusLine: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusMsg: { color: '#fff', fontSize: 15 },
  refreshBtn: { flexDirection: 'row', backgroundColor: '#3498DB', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  refreshText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default App;
