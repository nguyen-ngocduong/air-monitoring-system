import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
  ImageBackground,
} from 'react-native';
import { useAirQuality } from '../../hooks/useAirQuality';
import { useAuthStore } from '../../store';

const { width } = Dimensions.get('window');

// ─── Màu sắc theo mức AQI (PM2.5) ────────────────────────────────────────────
const getAqiInfo = (pm25) => {
  const val = Number(pm25 || 0);
  if (val <= 12)  return { status: 'Tốt',        color: '#00C897', bg: '#00C89722', icon: '😊' };
  if (val <= 35)  return { status: 'Trung bình', color: '#FFD93D', bg: '#FFD93D22', icon: '😐' };
  if (val <= 55)  return { status: 'Kém',        color: '#FF8C42', bg: '#FF8C4222', icon: '😷' };
  if (val <= 150) return { status: 'Không tốt',  color: '#FF4757', bg: '#FF475722', icon: '🤢' };
  return           { status: 'Nguy hại',         color: '#9B59B6', bg: '#9B59B622', icon: '☠️' };
};

// ─── Card chỉ số ─────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, unit, icon, color, size = 'normal' }) => {
  const isLarge = size === 'large';
  return (
    <View style={[styles.metricCard, isLarge && styles.metricCardLarge, { borderColor: color + '44' }]}>
      <Text style={[styles.metricIcon, isLarge && styles.metricIconLarge]}>{icon}</Text>
      <Text style={[styles.metricValue, isLarge && styles.metricValueLarge, { color }]}>
        {value}<Text style={styles.metricUnit}>{unit}</Text>
      </Text>
      <Text style={[styles.metricLabel, isLarge && styles.metricLabelLarge]}>{label}</Text>
    </View>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const [deviceName] = useState('esp32'); // Có thể thêm chức năng chọn thiết bị sau
  const { latestData, loading, error, fetchLatest } = useAirQuality(deviceName);
  const { user, logout } = useAuthStore();

  const aqiInfo = getAqiInfo(latestData?.pm25);
  
  // Lấy các chỉ số
  const pm25  = latestData?.pm25 ?? '--';
  const pm10  = latestData?.pm10 ?? '--';
  const temp  = latestData?.temperature ?? '--';
  const hum   = latestData?.humidity ?? '--';
  const co    = latestData?.co ?? '--';
  const nh3   = latestData?.nh3 ?? '--';

  // Auto refresh mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(fetchLatest, 30000);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>🌬️ AirMonitor</Text>
          <Text style={styles.location}>👤 {user?.username || 'User'}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchLatest} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color="#00C897" />
              : <Text style={styles.refreshIcon}>↻</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Image 
              source={require('../../assets/icons/logout.png')} 
              style={styles.logoutImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Lỗi ── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{String(error)}</Text>
          </View>
        ) : null}

        {/* ── Trạng thái hiện tại ── */}
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Trạng thái hiện tại</Text>
          <View style={[styles.statusBadge, { backgroundColor: aqiInfo.bg, borderColor: aqiInfo.color + '66' }]}>
            <Text style={styles.statusEmoji}>{aqiInfo.icon}</Text>
            <Text style={[styles.statusText, { color: aqiInfo.color }]}>{aqiInfo.status}</Text>
          </View>
          <Text style={styles.statusDesc}>
            Chất lượng không khí {aqiInfo.status.toLowerCase()}
          </Text>
          <Text style={styles.updateTime}>
            {latestData?.timestamp
              ? `Cập nhật: ${new Date(latestData.timestamp).toLocaleString('vi-VN')}`
              : 'Đang chờ dữ liệu...'}
          </Text>
        </View>

        {/* ── Chỉ số chính: PM2.5 & PM10 ── */}
        <Text style={styles.sectionTitle}>Chỉ số bụi mịn</Text>
        <View style={styles.metricsRow}>
          <MetricCard label="PM2.5" value={String(pm25)} unit=" µg/m³" icon="🔴" color={getAqiInfo(pm25).color} size="large" />
          <MetricCard label="PM10"  value={String(pm10)} unit=" µg/m³" icon="🟠" color="#FF8C42" size="large" />
        </View>

        {/* ── Khí độc hại ── */}
        <Text style={styles.sectionTitle}>Khí độc hại</Text>
        <View style={styles.metricsRow}>
          <MetricCard label="CO"  value={String(co)}  unit=" ppm" icon="🏭" color="#E74C3C" />
          <MetricCard label="NH₃" value={String(nh3)} unit=" ppm" icon="💨" color="#A29BFE" />
        </View>

        {/* ── Môi trường ── */}
        <Text style={styles.sectionTitle}>Môi trường</Text>
        <View style={styles.metricsRow}>
          <MetricCard label="Nhiệt độ" value={String(temp)} unit="°C" icon="🌡️" color="#FF6B6B" />
          <MetricCard label="Độ ẩm"    value={String(hum)}  unit="%"  icon="💧" color="#4ECDC4" />
        </View>

        {/* ── Thang đo AQI ── */}
        <View style={styles.aqiScale}>
          <Text style={styles.sectionTitle}>Thang đo chất lượng không khí (PM2.5)</Text>
          <View style={styles.scaleBar}>
            {[
              { label: 'Tốt',      color: '#00C897', range: '0–12' },
              { label: 'TB',       color: '#FFD93D', range: '12–35' },
              { label: 'Kém',      color: '#FF8C42', range: '35–55' },
              { label: 'Xấu',      color: '#FF4757', range: '55–150' },
              { label: 'Nguy hại', color: '#9B59B6', range: '150+' },
            ].map((item) => (
              <View key={item.label} style={styles.scaleItem}>
                <View style={[styles.scaleDot, { backgroundColor: item.color }]} />
                <Text style={styles.scaleLabel}>{item.label}</Text>
                <Text style={styles.scaleRange}>{item.range}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Nút điều hướng ── */}
        <View style={styles.navSection}>
          <Text style={styles.sectionTitle}>Khám phá thêm</Text>
          <TouchableOpacity
            style={[styles.navCard, { borderColor: '#4ECDC444' }]}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconBox, { backgroundColor: '#4ECDC422' }]}>
              <Text style={styles.navIcon}>📋</Text>
            </View>
            <View style={styles.navInfo}>
              <Text style={styles.navTitle}>Lịch sử dữ liệu</Text>
              <Text style={styles.navDesc}>Xem dữ liệu theo khoảng thời gian</Text>
            </View>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { borderColor: '#FFD93D44' }]}
            onPress={() => navigation.navigate('Chart')}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconBox, { backgroundColor: '#FFD93D22' }]}>
              <Text style={styles.navIcon}>📈</Text>
            </View>
            <View style={styles.navInfo}>
              <Text style={styles.navTitle}>Biểu đồ phân tích</Text>
              <Text style={styles.navDesc}>Xem xu hướng các chỉ số</Text>
            </View>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bgImage:        { flex: 1 },
  container:      { flex: 1, backgroundColor: 'rgba(10, 14, 26, 0.82)' },

  // Header
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  appName:        { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  location:       { color: '#6B7280', fontSize: 12, marginTop: 3 },
  headerRight:    { flexDirection: 'row', gap: 8 },
  refreshBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1F35', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2F45' },
  refreshIcon:    { color: '#00C897', fontSize: 22, fontWeight: 'bold' },
  logoutBtn:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1F35', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2F45' },
  logoutImage:    { width: 22, height: 22, tintColor: '#FF4757' },
  profileBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1F35', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2F45' },
  profileIcon:    { fontSize: 20 },

  scrollContent:  { paddingHorizontal: 20, paddingBottom: 40 },

  // Error
  errorBanner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF475715', borderWidth: 1, borderColor: '#FF475740', borderRadius: 12, padding: 12, marginBottom: 16, gap: 8 },
  errorIcon:      { fontSize: 16 },
  errorText:      { color: '#FF4757', fontSize: 12, flex: 1 },

  // Status card
  statusCard:     { backgroundColor: '#141929', borderRadius: 20, padding: 20, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1E2540' },
  statusBadge:    { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, borderWidth: 2, marginVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusEmoji:    { fontSize: 24 },
  statusText:     { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  statusDesc:     { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
  updateTime:     { color: '#4B5563', fontSize: 11 },

  // Section
  sectionTitle:   { color: '#9CA3AF', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },

  // Metrics
  metricsRow:     { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metricCard:     { flex: 1, backgroundColor: '#141929', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1 },
  metricCardLarge:{ paddingVertical: 20 },
  metricIcon:     { fontSize: 22, marginBottom: 6 },
  metricIconLarge:{ fontSize: 28, marginBottom: 8 },
  metricValue:    { fontSize: 22, fontWeight: '800' },
  metricValueLarge:{ fontSize: 28 },
  metricUnit:     { fontSize: 12, fontWeight: '400' },
  metricLabel:    { color: '#6B7280', fontSize: 11, marginTop: 4, fontWeight: '600' },
  metricLabelLarge:{ fontSize: 12 },

  // AQI Scale
  aqiScale:       { backgroundColor: '#141929', borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#1E2540' },
  scaleBar:       { flexDirection: 'row', justifyContent: 'space-between' },
  scaleItem:      { alignItems: 'center', flex: 1 },
  scaleDot:       { width: 10, height: 10, borderRadius: 5, marginBottom: 5 },
  scaleLabel:     { color: '#D1D5DB', fontSize: 10, fontWeight: '600' },
  scaleRange:     { color: '#6B7280', fontSize: 9, marginTop: 2 },

  // Nav cards
  navSection:     { marginBottom: 10 },
  navCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141929', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, gap: 14 },
  navIconBox:     { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  navIcon:        { fontSize: 22 },
  navInfo:        { flex: 1 },
  navTitle:       { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  navDesc:        { color: '#6B7280', fontSize: 12, marginTop: 2 },
  navArrow:       { color: '#4B5563', fontSize: 24, fontWeight: '300' },
});

export default HomeScreen;
