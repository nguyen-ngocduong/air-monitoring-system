import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useAirQuality } from '../../hooks/useAirQuality';

// ─── Màu theo PM2.5 ──────────────────────────────────────────────────────────
const getPm25Color = (val) => {
  const v = Number(val || 0);
  if (v <= 12)  return '#00C897';
  if (v <= 35)  return '#FFD93D';
  if (v <= 55)  return '#FF8C42';
  if (v <= 150) return '#FF4757';
  return '#9B59B6';
};

const getPm25Status = (val) => {
  const v = Number(val || 0);
  if (v <= 12)  return 'Tốt';
  if (v <= 35)  return 'TB';
  if (v <= 55)  return 'Kém';
  if (v <= 150) return 'Xấu';
  return 'Nguy hại';
};

// ─── Item lịch sử ────────────────────────────────────────────────────────────
const HistoryItem = ({ item, index }) => {
  const pm25Color = getPm25Color(item.pm25);
  const pm25Status = getPm25Status(item.pm25);

  return (
    <View style={[styles.historyItem, { borderLeftColor: pm25Color }]}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemIndex}>#{index + 1}</Text>
        <View>
          <Text style={styles.itemTime}>
            {new Date(item.timestamp).toLocaleString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
          <View style={styles.itemMetrics}>
            <View style={styles.metricChip}>
              <Text style={styles.metricChipIcon}>🌡️</Text>
              <Text style={styles.metricChipText}>{String(item.temperature ?? '--')}°C</Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricChipIcon}>💧</Text>
              <Text style={styles.metricChipText}>{String(item.humidity ?? '--')}%</Text>
            </View>
            {item.co !== undefined && (
              <View style={styles.metricChip}>
                <Text style={styles.metricChipIcon}>🏭</Text>
                <Text style={styles.metricChipText}>{String(item.co)}ppm</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.itemRight}>
        <View style={[styles.pm25Badge, { backgroundColor: pm25Color + '22', borderColor: pm25Color + '55' }]}>
          <Text style={[styles.pm25Value, { color: pm25Color }]}>{String(item.pm25 ?? '--')}</Text>
          <Text style={styles.pm25Unit}>PM2.5</Text>
          <Text style={[styles.pm25Status, { color: pm25Color }]}>{pm25Status}</Text>
        </View>
        {item.pm10 !== undefined && (
          <View style={[styles.pm10Badge, { backgroundColor: '#FF8C4222', borderColor: '#FF8C4255' }]}>
            <Text style={[styles.pm10Value, { color: '#FF8C42' }]}>{String(item.pm10)}</Text>
            <Text style={styles.pm10Unit}>PM10</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const HistoryScreen = ({ navigation }) => {
  const [deviceName, setDeviceName] = useState('esp32');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { historyData, loading, error, fetchHistory } = useAirQuality(deviceName);

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

      // Gửi lên backend dạng ISO 8601
      startISO = start.toISOString();
      endISO   = end.toISOString();
    } else {
      // Mặc định: 24 giờ qua
      const now = new Date();
      endISO   = now.toISOString();
      startISO = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }

    fetchHistory(startISO, endISO);
    setShowFilterModal(false);
  };

  // Parse "yyyy-MM-dd HH:mm:ss"  (giây có thể bỏ qua → mặc định :00)
  const parseDateTime = (str) => {
    // Chấp nhận cả "yyyy-MM-dd HH:mm:ss" lẫn "yyyy-MM-dd HH:mm"
    const full    = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})$/);
    const noSec   = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})$/);
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

  const avgPm25 = historyData.length > 0
    ? (historyData.reduce((s, d) => s + Number(d.pm25 || 0), 0) / historyData.length).toFixed(1)
    : '--';

  const maxPm25 = historyData.length > 0
    ? Math.max(...historyData.map(d => Number(d.pm25 || 0))).toFixed(1)
    : '--';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử dữ liệu</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterBtn}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* ── Thống kê nhanh ── */}
      {historyData.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tổng bản ghi</Text>
            <Text style={styles.statValue}>{historyData.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TB PM2.5</Text>
            <Text style={[styles.statValue, { color: getPm25Color(avgPm25) }]}>{avgPm25}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Max PM2.5</Text>
            <Text style={[styles.statValue, { color: getPm25Color(maxPm25) }]}>{maxPm25}</Text>
          </View>
        </View>
      )}

      {/* ── Lỗi ── */}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {String(error)}</Text>
        </View>
      ) : null}

      {/* ── Danh sách ── */}
      <FlatList
        data={historyData}
        renderItem={({ item, index }) => <HistoryItem item={item} index={index} />}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
              <Text style={styles.emptyDesc}>Nhấn ⚙️ để chọn thời gian và tìm kiếm</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#4ECDC4" />
              <Text style={styles.emptyDesc}>Đang tải dữ liệu...</Text>
            </View>
          )
        }
      />

      {/* ── Modal bộ lọc ── */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tìm kiếm dữ liệu</Text>

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
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0A0E1A' },

  // Header
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: '#0F1426', borderBottomWidth: 1, borderBottomColor: '#1E2540' },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1F35', justifyContent: 'center', alignItems: 'center' },
  backIcon:         { color: '#FFFFFF', fontSize: 28, lineHeight: 32, marginTop: -2 },
  headerTitle:      { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  filterBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1F35', justifyContent: 'center', alignItems: 'center' },
  filterIcon:       { fontSize: 18 },

  // Stats
  statsRow:         { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginVertical: 12 },
  statCard:         { flex: 1, backgroundColor: '#141929', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1E2540' },
  statLabel:        { color: '#6B7280', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue:        { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 4 },

  // Error
  errorBanner:      { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FF475715', borderWidth: 1, borderColor: '#FF475740', borderRadius: 12, padding: 12 },
  errorText:        { color: '#FF4757', fontSize: 12 },

  // List
  listContent:      { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },

  // History item
  historyItem:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#141929', borderRadius: 16, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#1E2540' },
  itemLeft:         { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemIndex:        { color: '#374151', fontSize: 11, fontWeight: '700', width: 28 },
  itemTime:         { color: '#D1D5DB', fontSize: 12, fontWeight: '600' },
  itemMetrics:      { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  metricChip:       { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#1E2540', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  metricChipIcon:   { fontSize: 10 },
  metricChipText:   { color: '#9CA3AF', fontSize: 10 },

  // PM badges
  itemRight:        { alignItems: 'flex-end', gap: 6 },
  pm25Badge:        { alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, minWidth: 60 },
  pm25Value:        { fontSize: 18, fontWeight: '900' },
  pm25Unit:         { color: '#6B7280', fontSize: 8, marginTop: -2 },
  pm25Status:       { fontSize: 9, fontWeight: '700', marginTop: 1 },
  pm10Badge:        { alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, minWidth: 50 },
  pm10Value:        { fontSize: 14, fontWeight: '800' },
  pm10Unit:         { color: '#6B7280', fontSize: 8 },

  // Empty
  emptyContainer:   { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyIcon:        { fontSize: 48 },
  emptyTitle:       { color: '#D1D5DB', fontSize: 16, fontWeight: '700' },
  emptyDesc:        { color: '#6B7280', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },

  // Modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent:     { backgroundColor: '#141929', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: '#1E2540' },
  modalTitle:       { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  inputGroup:       { marginBottom: 16 },
  inputLabel:       { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input:            { backgroundColor: '#0F1426', borderWidth: 1, borderColor: '#1E2540', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#FFFFFF', fontSize: 14 },
  hint:             { color: '#6B7280', fontSize: 11, marginBottom: 20, textAlign: 'center' },
  inputHint:        { color: '#4B5563', fontSize: 10, marginTop: 5, marginLeft: 4 },
  modalButtons:     { flexDirection: 'row', gap: 12 },
  modalBtn:         { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnCancel:   { backgroundColor: '#1E2540' },
  modalBtnSearch:   { backgroundColor: '#4ECDC4' },
  modalBtnTextCancel: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },
  modalBtnTextSearch: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default HistoryScreen;
