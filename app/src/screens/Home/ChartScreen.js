import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ImageBackground,
} from 'react-native';
import { useAirQuality } from '../../hooks/useAirQuality';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH  = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 200;
const PADDING_LEFT = 45;
const PADDING_BOTTOM = 35;

// ─── Màu theo chỉ số ─────────────────────────────────────────────────────────
const METRIC_COLORS = {
  pm25: '#FBBF24',
  pm10: '#F59E0B',
  co: '#EF4444',
  nh3: '#A78BFA',
  temperature: '#F87171',
  humidity: '#22D3EE',
};

// ─── Biểu đồ Line ────────────────────────────────────────────────────────────
const LineChart = ({ data, metric, color }) => {
  if (!data || data.length < 2) {
    return (
      <View style={[chartStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6B7280', fontSize: 13 }}>Không đủ dữ liệu</Text>
      </View>
    );
  }

  const values = data.map(d => Number(d[metric] || 0));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range  = maxVal - minVal || 1;

  const plotW = CHART_WIDTH - PADDING_LEFT - 10;
  const plotH = CHART_HEIGHT - PADDING_BOTTOM - 10;

  const points = values.map((v, i) => ({
    x: PADDING_LEFT + (i / (values.length - 1)) * plotW,
    y: 10 + (1 - (v - minVal) / range) * plotH,
    value: v,
  }));

  const segments = points.slice(1).map((pt, i) => {
    const prev = points[i];
    const dx = pt.x - prev.x;
    const dy = pt.y - prev.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle  = Math.atan2(dy, dx) * (180 / Math.PI);
    return { prev, pt, length, angle };
  });

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    y: 10 + ratio * plotH,
    value: (maxVal - ratio * range).toFixed(1),
  }));

  const xLabels = [];
  const step = Math.max(1, Math.floor(data.length / 5));
  for (let i = 0; i < data.length; i += step) {
    const d = data[i];
    const x = PADDING_LEFT + (i / (values.length - 1)) * plotW;
    const t = new Date(d.timestamp);
    xLabels.push({
      x,
      label: `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`,
    });
  }

  return (
    <View style={chartStyles.container}>
      {gridLines.map((g, i) => (
        <View key={i} style={[chartStyles.gridLine, { top: g.y }]}>
          <Text style={chartStyles.yLabel}>{g.value}</Text>
          <View style={chartStyles.gridDash} />
        </View>
      ))}
      {segments.map((seg, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: seg.prev.x,
            top: seg.prev.y,
            width: seg.length,
            height: 2.5,
            backgroundColor: color,
            opacity: 0.85,
            borderRadius: 2,
            transform: [{ rotate: `${seg.angle}deg` }],
            transformOrigin: 'left center',
          }}
        />
      ))}
      {points.map((pt, i) => (
        <View
          key={i}
          style={[chartStyles.dot, {
            left: pt.x - 4,
            top: pt.y - 4,
            backgroundColor: color,
            borderColor: '#0A0E1A',
          }]}
        />
      ))}
      {xLabels.map((xl, i) => (
        <Text key={i} style={[chartStyles.xLabel, { left: xl.x - 16, top: CHART_HEIGHT - 28 }]}>
          {xl.label}
        </Text>
      ))}
    </View>
  );
};

// ─── Biểu đồ Bar ─────────────────────────────────────────────────────────────
const BarChart = ({ data, metric, color }) => {
  if (!data || data.length < 1) {
    return (
      <View style={[chartStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6B7280', fontSize: 13 }}>Không đủ dữ liệu</Text>
      </View>
    );
  }

  const values = data.map(d => Number(d[metric] || 0));
  const maxVal = Math.max(...values, 1);

  const plotW = CHART_WIDTH - PADDING_LEFT - 10;
  const plotH = CHART_HEIGHT - PADDING_BOTTOM - 10;

  const barWidth = Math.min(30, plotW / values.length - 4);

  const gridLines = [0, 0.5, 1].map(ratio => ({
    y: 10 + ratio * plotH,
    value: (maxVal * (1 - ratio)).toFixed(1),
  }));

  return (
    <View style={chartStyles.container}>
      {gridLines.map((g, i) => (
        <View key={i} style={[chartStyles.gridLine, { top: g.y }]}>
          <Text style={chartStyles.yLabel}>{g.value}</Text>
          <View style={chartStyles.gridDash} />
        </View>
      ))}
      {values.map((v, i) => {
        const barHeight = (v / maxVal) * plotH;
        const x = PADDING_LEFT + (i / values.length) * plotW + (plotW / values.length - barWidth) / 2;
        const y = 10 + plotH - barHeight;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: barWidth,
              height: barHeight,
              backgroundColor: color,
              borderRadius: 4,
              opacity: 0.85,
            }}
          />
        );
      })}
    </View>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const ChartScreen = ({ navigation }) => {
  const [deviceName, setDeviceName] = useState('esp32');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [selectedMetrics, setSelectedMetrics] = useState(['pm25', 'pm10', 'temperature', 'humidity']);
  const [searchStartTime, setSearchStartTime] = useState('');
  const [searchEndTime, setSearchEndTime] = useState('');

  const { chartData, loading, error, fetchChart } = useAirQuality(deviceName);

  const handleSearch = () => {
    if (!deviceName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thiết bị');
      return;
    }

    let startISO, endISO;

    if (startDate.trim() && endDate.trim()) {
      const start = parseDateTime(startDate.trim());
      const end   = parseDateTime(endDate.trim());

      if (!start || !end) {
        Alert.alert(
          'Định dạng không hợp lệ',
          'Vui lòng nhập đúng định dạng:\nyyyy-MM-dd HH:mm:ss\n\nVí dụ: 2026-04-25 08:00:00'
        );
        return;
      }

      if (start >= end) {
        Alert.alert('Lỗi', 'Thời gian bắt đầu phải trước thời gian kết thúc');
        return;
      }

      startISO = start.toISOString();
      endISO   = end.toISOString();
      
      // Lưu lại để hiển thị
      setSearchStartTime(startDate.trim());
      setSearchEndTime(endDate.trim());
    } else {
      const now = new Date();
      endISO   = now.toISOString();
      startISO = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      
      setSearchStartTime(new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleString('vi-VN'));
      setSearchEndTime(now.toLocaleString('vi-VN'));
    }

    fetchChart(startISO, endISO);
    setShowFilterModal(false);
  };

  // Parse "yyyy-MM-dd HH:mm:ss"  (giây có thể bỏ qua → mặc định :00)
  const parseDateTime = (str) => {
    const full  = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})$/);
    const noSec = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})$/);
    if (full) {
      const [, yr, mo, dy, hh, mm, ss] = full;
      return new Date(+yr, +mo - 1, +dy, +hh, +mm, +ss);
    }
    if (noSec) {
      const [, yr, mo, dy, hh, mm] = noSec;
      return new Date(+yr, +mo - 1, +dy, +hh, +mm, 0);
    }
    return null;
  };

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const METRICS = [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', icon: '🔴' },
    { key: 'pm10', label: 'PM10', unit: 'µg/m³', icon: '🟠' },
    { key: 'co', label: 'CO', unit: 'ppm', icon: '🏭' },
    { key: 'nh3', label: 'NH₃', unit: 'ppm', icon: '💨' },
    { key: 'temperature', label: 'Nhiệt độ', unit: '°C', icon: '🌡️' },
    { key: 'humidity', label: 'Độ ẩm', unit: '%', icon: '💧' },
  ];

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biểu đồ phân tích</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterBtn}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Chọn loại biểu đồ ── */}
        <View style={styles.chartTypeRow}>
          <TouchableOpacity
            style={[styles.chartTypeBtn, chartType === 'line' && styles.chartTypeBtnActive]}
            onPress={() => setChartType('line')}
          >
            <Text style={[styles.chartTypeText, chartType === 'line' && styles.chartTypeTextActive]}>
              📈 Line
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTypeBtn, chartType === 'bar' && styles.chartTypeBtnActive]}
            onPress={() => setChartType('bar')}
          >
            <Text style={[styles.chartTypeText, chartType === 'bar' && styles.chartTypeTextActive]}>
              📊 Bar
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Chọn chỉ số hiển thị ── */}
        <View style={styles.metricsSelector}>
          <Text style={styles.sectionTitle}>Chọn chỉ số hiển thị</Text>
          <View style={styles.metricsGrid}>
            {METRICS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.metricChip,
                  selectedMetrics.includes(m.key) && { backgroundColor: METRIC_COLORS[m.key] + '33', borderColor: METRIC_COLORS[m.key] }
                ]}
                onPress={() => toggleMetric(m.key)}
              >
                <Text style={styles.metricChipIcon}>{m.icon}</Text>
                <Text style={[
                  styles.metricChipText,
                  selectedMetrics.includes(m.key) && { color: METRIC_COLORS[m.key], fontWeight: '700' }
                ]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Lỗi ── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {String(error)}</Text>
          </View>
        ) : null}

        {/* ── Biểu đồ ── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FBBF24" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : chartData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
            <Text style={styles.emptyDesc}>Nhấn ⚙️ để chọn thời gian và tìm kiếm</Text>
          </View>
        ) : (
          <>
            {selectedMetrics.map(metric => {
              const metricInfo = METRICS.find(m => m.key === metric);
              if (!metricInfo) return null;

              return (
                <View key={metric} style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <View style={styles.chartTitleRow}>
                      <View style={[styles.chartDot, { backgroundColor: METRIC_COLORS[metric] }]} />
                      <Text style={styles.chartTitle}>
                        {metricInfo.icon} {metricInfo.label} ({metricInfo.unit})
                      </Text>
                    </View>
                  </View>
                  {chartType === 'line' ? (
                    <LineChart data={chartData} metric={metric} color={METRIC_COLORS[metric]} />
                  ) : (
                    <BarChart data={chartData} metric={metric} color={METRIC_COLORS[metric]} />
                  )}
                </View>
              );
            })}

            {/* ── Bảng dữ liệu ── */}
            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>📋 Dữ liệu gần nhất</Text>
              
              {/* Hiển thị khoảng thời gian tìm kiếm */}
              {searchStartTime && searchEndTime && (
                <View style={styles.timeRangeBox}>
                  <View style={styles.timeRangeCol}>
                    <Text style={styles.timeRangeLabel}>Từ:</Text>
                    <Text style={styles.timeRangeValue}>{searchStartTime}</Text>
                  </View>
                  <View style={styles.timeRangeCol}>
                    <Text style={styles.timeRangeLabel}>Đến:</Text>
                    <Text style={styles.timeRangeValue}>{searchEndTime}</Text>
                  </View>
                </View>
              )}
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableHeaderText, { width: 120 }]}>Thời gian</Text>
                    {METRICS.map(m => (
                      <Text key={m.key} style={[styles.tableCell, styles.tableHeaderText, { width: 70 }]}>
                        {m.label}
                      </Text>
                    ))}
                  </View>
                  {[...chartData].reverse().slice(0, 10).map((item, index) => (
                    <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                      <Text style={[styles.tableCell, { width: 120, color: '#D1D5DB', fontSize: 11 }]}>
                        {new Date(item.timestamp).toLocaleString('vi-VN', {
                          month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Text>
                      {METRICS.map(m => (
                        <Text
                          key={m.key}
                          style={[styles.tableCell, { width: 70, color: METRIC_COLORS[m.key], fontWeight: '700' }]}
                        >
                          {String(item[m.key] ?? '--')}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}

      </ScrollView>

      {/* ── Modal bộ lọc ── */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cài đặt biểu đồ</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên thiết bị</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: esp32"
                placeholderTextColor="#6B7280"
                value={deviceName}
                onChangeText={setDeviceName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thời gian bắt đầu</Text>
              <TextInput
                style={styles.input}
                placeholder="yyyy-MM-dd HH:mm:ss"
                placeholderTextColor="#4B5563"
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numbers-and-punctuation"
              />
              <Text style={styles.inputHint}>Ví dụ: 2026-04-25 08:00:00</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thời gian kết thúc</Text>
              <TextInput
                style={styles.input}
                placeholder="yyyy-MM-dd HH:mm:ss"
                placeholderTextColor="#4B5563"
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numbers-and-punctuation"
              />
              <Text style={styles.inputHint}>Ví dụ: 2026-04-25 23:59:59</Text>
            </View>

            <Text style={styles.hint}>💡 Để trống thời gian để xem 24 giờ gần nhất</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalBtnTextCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSearch]}
                onPress={handleSearch}
              >
                <Text style={styles.modalBtnTextSearch}>Tìm kiếm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </ImageBackground>
  );
};

// ─── Chart Styles ────────────────────────────────────────────────────────────
const chartStyles = StyleSheet.create({
  container:  { width: CHART_WIDTH, height: CHART_HEIGHT, position: 'relative', marginVertical: 10 },
  gridLine:   { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' },
  yLabel:     { color: '#4B5563', fontSize: 9, width: PADDING_LEFT - 4, textAlign: 'right' },
  gridDash:   { flex: 1, height: 1, backgroundColor: '#1E2540' },
  dot:        { position: 'absolute', width: 8, height: 8, borderRadius: 4, borderWidth: 2 },
  xLabel:     { position: 'absolute', color: '#4B5563', fontSize: 9, width: 32, textAlign: 'center' },
});

// ─── Main Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bgImage:          { flex: 1 },
  container:        { flex: 1, backgroundColor: 'rgba(10, 14, 26, 0.82)' },

  // Header
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: '#0F1426', borderBottomWidth: 1, borderBottomColor: '#1E2540' },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1F35', justifyContent: 'center', alignItems: 'center' },
  backIcon:         { color: '#FFFFFF', fontSize: 28, lineHeight: 32, marginTop: -2 },
  headerTitle:      { color: '#FFFFFF', fontSize: 19, fontWeight: '800', letterSpacing: 0.5 },
  filterBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1F35', justifyContent: 'center', alignItems: 'center' },
  filterIcon:       { fontSize: 20 },

  scrollContent:    { padding: 16, paddingBottom: 40 },

  // Chart type selector
  chartTypeRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  chartTypeBtn:     { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#141929', alignItems: 'center', borderWidth: 1, borderColor: '#1E2540' },
  chartTypeBtnActive: { backgroundColor: '#FBBF2422', borderColor: '#FBBF24' },
  chartTypeText:    { color: '#9CA3AF', fontSize: 15, fontWeight: '700' },
  chartTypeTextActive: { color: '#FBBF24' },

  // Metrics selector
  metricsSelector:  { backgroundColor: '#141929', borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1E2540' },
  sectionTitle:     { color: '#D1D5DB', fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 },
  metricsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricChip:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F1426', borderWidth: 1, borderColor: '#1E2540' },
  metricChipIcon:   { fontSize: 16 },
  metricChipText:   { color: '#D1D5DB', fontSize: 13, fontWeight: '700' },

  // Error
  errorBanner:      { backgroundColor: '#EF444415', borderWidth: 1, borderColor: '#EF444440', borderRadius: 12, padding: 12, marginBottom: 12 },
  errorText:        { color: '#FCA5A5', fontSize: 13, fontWeight: '600' },

  // Loading & Empty
  loadingContainer: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText:      { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
  emptyContainer:   { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon:        { fontSize: 56 },
  emptyTitle:       { color: '#F3F4F6', fontSize: 17, fontWeight: '800' },
  emptyDesc:        { color: '#9CA3AF', fontSize: 14, textAlign: 'center', fontWeight: '500' },

  // Chart card
  chartCard:        { backgroundColor: '#141929', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#1E2540' },
  chartHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  chartTitleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartDot:         { width: 12, height: 12, borderRadius: 6 },
  chartTitle:       { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  // Table
  tableCard:        { backgroundColor: '#141929', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1E2540' },
  tableTitle:       { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 14 },
  timeRangeBox:     { flexDirection: 'row', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1E2540' },
  timeRangeCol:     { flex: 1 },
  timeRangeLabel:   { color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  timeRangeValue:   { color: '#F3F4F6', fontSize: 12, fontWeight: '600' },
  tableHeader:      { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1E2540', marginBottom: 4 },
  tableHeaderText:  { color: '#9CA3AF', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' },
  tableRow:         { flexDirection: 'row', paddingVertical: 8 },
  tableRowAlt:      { backgroundColor: '#0F1426', borderRadius: 8 },
  tableCell:        { color: '#F3F4F6', fontSize: 12, textAlign: 'center', fontWeight: '600' },

  // Modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent:     { backgroundColor: '#141929', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: '#1E2540' },
  modalTitle:       { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginBottom: 20, textAlign: 'center', letterSpacing: 0.5 },
  inputGroup:       { marginBottom: 16 },
  inputLabel:       { color: '#D1D5DB', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input:            { backgroundColor: '#0F1426', borderWidth: 1, borderColor: '#1E2540', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  hint:             { color: '#9CA3AF', fontSize: 12, marginBottom: 20, textAlign: 'center', fontWeight: '500' },
  inputHint:        { color: '#6B7280', fontSize: 11, marginTop: 5, marginLeft: 4, fontWeight: '500' },
  modalButtons:     { flexDirection: 'row', gap: 12 },
  modalBtn:         { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnCancel:   { backgroundColor: '#1E2540' },
  modalBtnSearch:   { backgroundColor: '#FBBF24' },
  modalBtnTextCancel: { color: '#D1D5DB', fontSize: 16, fontWeight: '700' },
  modalBtnTextSearch: { color: '#0F1426', fontSize: 16, fontWeight: '800' },
});

export default ChartScreen;
