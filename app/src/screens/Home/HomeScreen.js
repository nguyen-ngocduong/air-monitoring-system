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

// ─── Ngưỡng cảnh báo (theo display.cpp) ─────────────────────────────────────
const THRESHOLDS = {
  TEMP_HIGH: 35.0,
  TEMP_VERY_HIGH: 40.0,
  HUMI_LOW: 30.0,
  HUMI_HIGH: 90.0,
  CO_MODERATE: 9.0,
  CO_HIGH: 12.5,
  CO_VERY_HIGH: 15.0,
  NH3_MODERATE: 15.0,
  NH3_HIGH: 20.0,
  NH3_VERY_HIGH: 25.0,
  PM25_MODERATE: 12.0,
  PM25_UNHEALTHY: 35.0,
  PM25_VERY_UNHEALTHY: 55.0,
  PM25_HAZARDOUS: 150.0,
  PM10_MODERATE: 50.0,
  PM10_UNHEALTHY: 150.0,
  PM10_VERY_UNHEALTHY: 250.0,
};

// ─── Đánh giá trạng thái môi trường tổng thể ─────────────────────────────────
const getEnvironmentStatus = (data) => {
  if (!data) {
    return { 
      status: 'Không có dữ liệu', 
      color: '#6B7280', 
      bg: '#6B728022', 
      icon: '❓',
      priority: 0,
      description: 'Đang chờ dữ liệu từ cảm biến'
    };
  }

  const temp = Number(data.temperature || 0);
  const humi = Number(data.humidity || 0);
  const co = Number(data.co || 0);
  const nh3 = Number(data.nh3 || 0);
  const pm25 = Number(data.pm25 || 0);
  const pm10 = Number(data.pm10 || 0);

  // Ưu tiên 1: Khí độc hại nguy hiểm (CO, NH3)
  if (co > THRESHOLDS.CO_VERY_HIGH || nh3 > THRESHOLDS.NH3_VERY_HIGH) {
    return {
      status: 'Khí độc nguy hiểm',
      color: '#DC2626',
      bg: '#DC262622',
      icon: '☠️',
      priority: 10,
      description: 'Nồng độ khí độc hại rất cao, cần thông gió ngay'
    };
  }

  if (co > THRESHOLDS.CO_HIGH || nh3 > THRESHOLDS.NH3_HIGH) {
    return {
      status: 'Không khí độc hại',
      color: '#EF4444',
      bg: '#EF444422',
      icon: '🤢',
      priority: 9,
      description: 'Khí độc hại vượt ngưỡng an toàn'
    };
  }

  // Ưu tiên 2: Bụi mịn nguy hại
  if (pm25 > THRESHOLDS.PM25_HAZARDOUS || pm10 > THRESHOLDS.PM10_VERY_UNHEALTHY) {
    return {
      status: 'Ô nhiễm nghiêm trọng',
      color: '#DC2626',
      bg: '#DC262622',
      icon: '😷',
      priority: 8,
      description: 'Chất lượng không khí rất xấu, hạn chế ra ngoài'
    };
  }

  if (pm25 > THRESHOLDS.PM25_VERY_UNHEALTHY || pm10 > THRESHOLDS.PM10_UNHEALTHY) {
    return {
      status: 'Không khí ô nhiễm',
      color: '#EF4444',
      bg: '#EF444422',
      icon: '😨',
      priority: 7,
      description: 'Bụi mịn cao, không tốt cho sức khỏe'
    };
  }

  if (pm25 > THRESHOLDS.PM25_UNHEALTHY) {
    return {
      status: 'Không khí kém',
      color: '#F59E0B',
      bg: '#F59E0B22',
      icon: '😷',
      priority: 6,
      description: 'Chất lượng không khí kém'
    };
  }

  // Ưu tiên 3: Nhiệt độ cao
  if (temp > THRESHOLDS.TEMP_VERY_HIGH) {
    return {
      status: 'Nóng cực độ',
      color: '#DC2626',
      bg: '#DC262622',
      icon: '🥵',
      priority: 5,
      description: 'Nhiệt độ rất cao, cần làm mát'
    };
  }

  if (temp > THRESHOLDS.TEMP_HIGH) {
    return {
      status: 'Thời tiết nóng',
      color: '#F59E0B',
      bg: '#F59E0B22',
      icon: '😓',
      priority: 4,
      description: 'Nhiệt độ cao, cần chú ý giữ mát'
    };
  }

  // Ưu tiên 4: Khí độc hại mức trung bình
  if (co > THRESHOLDS.CO_MODERATE || nh3 > THRESHOLDS.NH3_MODERATE) {
    return {
      status: 'Cần thông gió',
      color: '#FBBF24',
      bg: '#FBBF2422',
      icon: '😐',
      priority: 3,
      description: 'Khí độc hại ở mức trung bình'
    };
  }

  // Ưu tiên 5: Bụi mịn mức trung bình
  if (pm25 > THRESHOLDS.PM25_MODERATE || pm10 > THRESHOLDS.PM10_MODERATE) {
    return {
      status: 'Chấp nhận được',
      color: '#FBBF24',
      bg: '#FBBF2422',
      icon: '😐',
      priority: 2,
      description: 'Chất lượng không khí ở mức trung bình'
    };
  }

  // Ưu tiên 6: Độ ẩm bất thường
  if (humi < THRESHOLDS.HUMI_LOW) {
    return {
      status: 'Không khí khô',
      color: '#FBBF24',
      bg: '#FBBF2422',
      icon: '🌵',
      priority: 1,
      description: 'Độ ẩm thấp, không khí khô'
    };
  }

  if (humi > THRESHOLDS.HUMI_HIGH) {
    return {
      status: 'Không khí ẩm',
      color: '#FBBF24',
      bg: '#FBBF2422',
      icon: '💦',
      priority: 1,
      description: 'Độ ẩm cao, không khí ẩm ướt'
    };
  }

  // Mặc định: Tốt
  return {
    status: 'Không khí tốt',
    color: '#10B981',
    bg: '#10B98122',
    icon: '😊',
    priority: 0,
    description: 'Chất lượng không khí tốt'
  };
};

// ─── Kiểm tra cảnh báo chi tiết ──────────────────────────────────────────────
const getWarnings = (data) => {
  const warnings = [];
  if (!data) return warnings;
  
  const temp = Number(data.temperature || 0);
  const humi = Number(data.humidity || 0);
  const co = Number(data.co || 0);
  const nh3 = Number(data.nh3 || 0);
  const pm25 = Number(data.pm25 || 0);
  const pm10 = Number(data.pm10 || 0);
  
  // Cảnh báo khí độc hại
  if (co > THRESHOLDS.CO_VERY_HIGH) warnings.push('⚠️ CO cực cao');
  else if (co > THRESHOLDS.CO_HIGH) warnings.push('⚠️ CO cao');
  else if (co > THRESHOLDS.CO_MODERATE) warnings.push('⚠️ CO trung bình');
  
  if (nh3 > THRESHOLDS.NH3_VERY_HIGH) warnings.push('⚠️ NH₃ cực cao');
  else if (nh3 > THRESHOLDS.NH3_HIGH) warnings.push('⚠️ NH₃ cao');
  else if (nh3 > THRESHOLDS.NH3_MODERATE) warnings.push('⚠️ NH₃ trung bình');
  
  // Cảnh báo bụi mịn
  if (pm25 > THRESHOLDS.PM25_HAZARDOUS) warnings.push('⚠️ PM2.5 nguy hại');
  else if (pm25 > THRESHOLDS.PM25_VERY_UNHEALTHY) warnings.push('⚠️ PM2.5 rất cao');
  else if (pm25 > THRESHOLDS.PM25_UNHEALTHY) warnings.push('⚠️ PM2.5 cao');
  
  if (pm10 > THRESHOLDS.PM10_VERY_UNHEALTHY) warnings.push('⚠️ PM10 rất cao');
  else if (pm10 > THRESHOLDS.PM10_UNHEALTHY) warnings.push('⚠️ PM10 cao');
  
  // Cảnh báo nhiệt độ
  if (temp > THRESHOLDS.TEMP_VERY_HIGH) warnings.push('⚠️ Nhiệt độ cực cao');
  else if (temp > THRESHOLDS.TEMP_HIGH) warnings.push('⚠️ Nhiệt độ cao');
  
  // Cảnh báo độ ẩm
  if (humi < THRESHOLDS.HUMI_LOW) warnings.push('⚠️ Độ ẩm thấp');
  if (humi > THRESHOLDS.HUMI_HIGH) warnings.push('⚠️ Độ ẩm cao');
  
  return warnings;
};

// ─── Card chỉ số với cảnh báo ────────────────────────────────────────────────
const MetricCard = ({ label, value, unit, icon, color, size = 'normal', warning = false }) => {
  const isLarge = size === 'large';
  return (
    <View style={[
      styles.metricCard, 
      isLarge && styles.metricCardLarge, 
      { borderColor: warning ? '#EF4444' : color + '44' },
      warning && styles.metricCardWarning
    ]}>
      {warning && <View style={styles.warningBadge}><Text style={styles.warningBadgeText}>!</Text></View>}
      <Text style={[styles.metricIcon, isLarge && styles.metricIconLarge]}>{icon}</Text>
      <Text style={[styles.metricValue, isLarge && styles.metricValueLarge, { color: warning ? '#EF4444' : color }]}>
        {value}<Text style={styles.metricUnit}>{unit}</Text>
      </Text>
      <Text style={[styles.metricLabel, isLarge && styles.metricLabelLarge]}>{label}</Text>
    </View>
  );
};

// ─── Kiểm tra cảnh báo cho từng metric ───────────────────────────────────────
const isMetricWarning = (metric, value) => {
  const val = Number(value);
  if (isNaN(val)) return false;
  
  switch(metric) {
    case 'pm25': return val > THRESHOLDS.PM25_UNHEALTHY;
    case 'pm10': return val > THRESHOLDS.PM10_MODERATE;
    case 'co': return val > THRESHOLDS.CO_MODERATE;
    case 'nh3': return val > THRESHOLDS.NH3_MODERATE;
    case 'temperature': return val > THRESHOLDS.TEMP_HIGH;
    case 'humidity': return val < THRESHOLDS.HUMI_LOW || val > THRESHOLDS.HUMI_HIGH;
    default: return false;
  }
};

// ─── Main ────────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const [deviceName] = useState('esp32'); // Có thể thêm chức năng chọn thiết bị sau
  const { latestData, loading, error, fetchLatest } = useAirQuality(deviceName);
  const { user, logout } = useAuthStore();

  const envStatus = getEnvironmentStatus(latestData);
  const warnings = getWarnings(latestData);
  
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
          <Text style={styles.sectionTitle}>Trạng thái môi trường</Text>
          <View style={[styles.statusBadge, { backgroundColor: envStatus.bg, borderColor: envStatus.color + '66' }]}>
            <Text style={styles.statusEmoji}>{envStatus.icon}</Text>
            <Text style={[styles.statusText, { color: envStatus.color }]}>{envStatus.status}</Text>
          </View>
          <Text style={styles.statusDesc}>
            {envStatus.description}
          </Text>
          
          {/* Cảnh báo chi tiết */}
          {warnings.length > 0 && (
            <View style={styles.warningsBox}>
              <Text style={styles.warningsTitle}>Chi tiết cảnh báo:</Text>
              {warnings.map((warn, idx) => (
                <View key={idx} style={styles.warningItem}>
                  <Text style={styles.warningText}>{warn}</Text>
                </View>
              ))}
            </View>
          )}
          
          <Text style={styles.updateTime}>
            {latestData?.timestamp
              ? `Cập nhật: ${new Date(latestData.timestamp).toLocaleString('vi-VN')}`
              : 'Đang chờ dữ liệu...'}
          </Text>
        </View>

        {/* ── Chỉ số chính: PM2.5 & PM10 ── */}
        <Text style={styles.sectionTitle}>Chỉ số bụi mịn</Text>
        <View style={styles.metricsRow}>
          <MetricCard 
            label="PM2.5" 
            value={String(pm25)} 
            unit=" µg/m³" 
            icon="🔴" 
            color="#FBBF24" 
            size="large"
            warning={isMetricWarning('pm25', pm25)}
          />
          <MetricCard 
            label="PM10" 
            value={String(pm10)} 
            unit=" µg/m³" 
            icon="🟠" 
            color="#F59E0B" 
            size="large"
            warning={isMetricWarning('pm10', pm10)}
          />
        </View>

        {/* ── Khí độc hại ── */}
        <Text style={styles.sectionTitle}>Khí độc hại</Text>
        <View style={styles.metricsRow}>
          <MetricCard 
            label="CO" 
            value={String(co)} 
            unit=" ppm" 
            icon="🏭" 
            color="#EF4444"
            warning={isMetricWarning('co', co)}
          />
          <MetricCard 
            label="NH₃" 
            value={String(nh3)} 
            unit=" ppm" 
            icon="💨" 
            color="#A78BFA"
            warning={isMetricWarning('nh3', nh3)}
          />
        </View>

        {/* ── Môi trường ── */}
        <Text style={styles.sectionTitle}>Môi trường</Text>
        <View style={styles.metricsRow}>
          <MetricCard 
            label="Nhiệt độ" 
            value={String(temp)} 
            unit="°C" 
            icon="🌡️" 
            color="#F87171"
            warning={isMetricWarning('temperature', temp)}
          />
          <MetricCard 
            label="Độ ẩm" 
            value={String(hum)} 
            unit="%" 
            icon="💧" 
            color="#22D3EE"
            warning={isMetricWarning('humidity', hum)}
          />
        </View>

        {/* ── Thang đo AQI ── */}
        <View style={styles.aqiScale}>
          <Text style={styles.sectionTitle}>Thang đo chất lượng không khí</Text>
          <View style={styles.scaleBar}>
            {[
              { label: 'Tốt',      color: '#10B981', range: '0–12' },
              { label: 'TB',       color: '#FBBF24', range: '12–35' },
              { label: 'Kém',      color: '#F59E0B', range: '35–55' },
              { label: 'Xấu',      color: '#EF4444', range: '55–150' },
              { label: 'Nguy hại', color: '#DC2626', range: '150+' },
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
            style={[styles.navCard, { borderColor: '#22D3EE44' }]}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconBox, { backgroundColor: '#22D3EE18' }]}>
              <Image
                source={require('../../assets/icons/icon_lich_su_du_lieu.png')}
                style={styles.navIconImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.navInfo}>
              <Text style={styles.navTitle}>Lịch sử dữ liệu</Text>
              <Text style={styles.navDesc}>Xem dữ liệu theo khoảng thời gian</Text>
            </View>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { borderColor: '#FBBF2444' }]}
            onPress={() => navigation.navigate('Chart')}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconBox, { backgroundColor: '#FBBF2418' }]}>
              <Image
                source={require('../../assets/icons/chart.png')}
                style={styles.navIconImage}
                resizeMode="contain"
              />
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
  appName:        { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 0.8 },
  location:       { color: '#9CA3AF', fontSize: 13, marginTop: 4, fontWeight: '500' },
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
  statusEmoji:    { fontSize: 28 },
  statusText:     { fontSize: 20, fontWeight: '900', letterSpacing: 0.8 },
  statusDesc:     { color: '#D1D5DB', fontSize: 15, marginBottom: 8, fontWeight: '500' },
  updateTime:     { color: '#6B7280', fontSize: 12, fontWeight: '500', marginTop: 8 },
  
  // Warnings
  warningsBox:    { width: '100%', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1E2540' },
  warningsTitle:  { color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, textAlign: 'center' },
  warningItem:    { backgroundColor: '#EF444422', borderWidth: 1, borderColor: '#EF444444', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 6 },
  warningText:    { color: '#FCA5A5', fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // Section
  sectionTitle:   { color: '#D1D5DB', fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },

  // Metrics
  metricsRow:     { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metricCard:     { flex: 1, backgroundColor: '#141929', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, position: 'relative' },
  metricCardLarge:{ paddingVertical: 20 },
  metricCardWarning: { backgroundColor: '#EF444408', borderWidth: 2 },
  warningBadge:   { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  warningBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  metricIcon:     { fontSize: 26, marginBottom: 8 },
  metricIconLarge:{ fontSize: 32, marginBottom: 10 },
  metricValue:    { fontSize: 24, fontWeight: '900' },
  metricValueLarge:{ fontSize: 32 },
  metricUnit:     { fontSize: 13, fontWeight: '500' },
  metricLabel:    { color: '#9CA3AF', fontSize: 12, marginTop: 6, fontWeight: '700', letterSpacing: 0.5 },
  metricLabelLarge:{ fontSize: 13 },

  // AQI Scale
  aqiScale:       { backgroundColor: '#141929', borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#1E2540' },
  scaleBar:       { flexDirection: 'row', justifyContent: 'space-between' },
  scaleItem:      { alignItems: 'center', flex: 1 },
  scaleDot:       { width: 12, height: 12, borderRadius: 6, marginBottom: 6 },
  scaleLabel:     { color: '#F3F4F6', fontSize: 11, fontWeight: '700' },
  scaleRange:     { color: '#9CA3AF', fontSize: 10, marginTop: 3, fontWeight: '500' },

  // Nav cards
  navSection:     { marginBottom: 10 },
  navCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141929', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, gap: 14 },
  navIconBox:     { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  navIconImage:   { width: 34, height: 34 },
  navInfo:        { flex: 1 },
  navTitle:       { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  navDesc:        { color: '#9CA3AF', fontSize: 13, marginTop: 3, fontWeight: '500' },
  navArrow:       { color: '#6B7280', fontSize: 28, fontWeight: '300' },
});

export default HomeScreen;
